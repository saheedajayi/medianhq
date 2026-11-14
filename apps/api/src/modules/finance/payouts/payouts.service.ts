import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { EmailService } from '../../platform/email/email.service';
import {
  PaystackTransfers,
  payoutStatusFor,
  type TransferStatus,
} from './paystack-transfers';
import { PayoutsRepository, type PayoutRecord } from './payouts.repository';

// Bank names change rarely, so the list is fetched at most daily
const BANKS_CACHE_MS = 24 * 60 * 60 * 1000;

const OTP_REQUIRED =
  'Paystack asked for an OTP. Turn off OTP for transfers in the Paystack dashboard, then try again.';

export type PayoutActor = { id: string; firstName: string; lastName: string };

/**
 * Pays mentors through Paystack Transfers. A payout moves PENDING →
 * PROCESSING → PROCESSED (paid) or FAILED; an admin can also REJECT a
 * pending one. FAILED and REJECTED payouts go back to the mentor's balance.
 */
@Injectable()
export class PayoutsService {
  private readonly logger = new Logger(PayoutsService.name);
  private banks: { names: Map<string, string>; loadedAt: number } | null = null;

  constructor(
    private readonly payoutsRepository: PayoutsRepository,
    private readonly emailService: EmailService,
  ) {}

  async approve(payoutId: string, actor?: PayoutActor) {
    const transfers = this.transfers();
    const payout = await this.findPayout(payoutId);
    const reference = `payout_${randomUUID()}`;

    const claimed = await this.payoutsRepository.claim(payout.id, 'PENDING', {
      status: 'PROCESSING',
      transferReference: reference,
      reviewedById: actor?.id ?? null,
      reviewedAt: new Date(),
      failureReason: null,
    });
    if (!claimed) {
      throw new BadRequestException('Only a pending payout can be approved.');
    }

    let recipientCode: string;
    try {
      recipientCode = await transfers.createRecipient({
        name: `${payout.mentor.firstName} ${payout.mentor.lastName}`.trim(),
        accountNumber: payout.accountNumber,
        bankCode: payout.bankCode,
      });
    } catch (error) {
      // Nothing was sent, so this is a clean failure the mentor can fix
      return this.fail(payout.id, this.messageOf(error));
    }

    try {
      const transfer = await transfers.initiateTransfer({
        amount: payout.amount,
        recipientCode,
        reference,
        reason: 'Median mentor payout',
      });
      return this.applyTransferStatus(payout.id, transfer.status, {
        recipientCode,
        transferCode: transfer.transfer_code,
      });
    } catch (error) {
      // The transfer may or may not exist at Paystack, so it stays PROCESSING
      // and is settled by the webhook or a status check against the reference
      this.logger.error(
        `Transfer for payout ${payout.id} is unconfirmed`,
        error,
      );
      return this.payoutsRepository.update(payout.id, {
        recipientCode,
        failureReason: `Waiting to confirm with Paystack: ${this.messageOf(error)}`,
      });
    }
  }

  async reject(
    payoutId: string,
    reason: string | undefined,
    actor?: PayoutActor,
  ) {
    const payout = await this.findPayout(payoutId);
    const note = reason?.trim() || null;
    const claimed = await this.payoutsRepository.claim(payout.id, 'PENDING', {
      status: 'REJECTED',
      reviewedById: actor?.id ?? null,
      reviewedAt: new Date(),
      failureReason: note,
    });
    if (!claimed) {
      throw new BadRequestException('Only a pending payout can be rejected.');
    }

    await this.notifyMentor(payout, 'rejected', note);
    return this.findPayout(payout.id);
  }

  /** Asks Paystack for the transfer's current status, for a payout still in flight */
  async sync(payoutId: string) {
    const payout = await this.findPayout(payoutId);
    if (payout.status !== 'PROCESSING' || !payout.transferReference) {
      return payout;
    }
    return this.syncTransfer(payout);
  }

  /** Called from the Paystack webhook; the event is re-checked with Paystack rather than trusted */
  async syncByReference(reference: string) {
    const payout =
      await this.payoutsRepository.findByTransferReference(reference);
    if (!payout || payout.status !== 'PROCESSING') return;
    await this.syncTransfer(payout);
  }

  /** Bank names by bank code, for showing which bank a payout goes to */
  async bankNames() {
    if (this.banks && Date.now() - this.banks.loadedAt < BANKS_CACHE_MS) {
      return this.banks.names;
    }
    try {
      const banks = await this.transfers().listBanks();
      this.banks = {
        names: new Map(banks.map((bank) => [bank.code, bank.name])),
        loadedAt: Date.now(),
      };
    } catch (error) {
      // Without names the payouts still show, with their bank code instead
      this.logger.warn(
        `Could not load Paystack banks: ${this.messageOf(error)}`,
      );
      return new Map<string, string>();
    }
    return this.banks.names;
  }

  private async syncTransfer(payout: PayoutRecord) {
    const transfer = await this.transfers().verifyTransfer(
      payout.transferReference as string,
    );
    return this.applyTransferStatus(payout.id, transfer.status, {
      transferCode: transfer.transfer_code,
    });
  }

  private async applyTransferStatus(
    payoutId: string,
    status: TransferStatus,
    data: { recipientCode?: string; transferCode?: string },
  ) {
    if (status === 'otp') {
      return this.fail(payoutId, OTP_REQUIRED, data);
    }
    const next = payoutStatusFor(status);
    if (next === 'FAILED') {
      return this.fail(
        payoutId,
        `Paystack reported the transfer as ${status}.`,
        data,
      );
    }

    const updated = await this.payoutsRepository.update(payoutId, {
      ...data,
      status: next,
      failureReason: null,
      ...(next === 'PROCESSED' && { paidAt: new Date() }),
    });
    if (next === 'PROCESSED') await this.notifyMentor(updated, 'paid', null);
    return updated;
  }

  private async fail(
    payoutId: string,
    reason: string,
    data: { recipientCode?: string; transferCode?: string } = {},
  ) {
    const updated = await this.payoutsRepository.update(payoutId, {
      ...data,
      status: 'FAILED',
      failureReason: reason,
    });
    await this.notifyMentor(updated, 'failed', null);
    return updated;
  }

  /** A failed email must not undo the payout's status */
  private notifyMentor(
    payout: PayoutRecord,
    outcome: 'paid' | 'failed' | 'rejected',
    note: string | null,
  ) {
    const amount = `₦${payout.amount.toLocaleString('en-NG')}`;
    const paragraphs = {
      paid: [`Your payout of ${amount} has been sent to your bank account.`],
      failed: [
        `We couldn't send your payout of ${amount}. The amount is back in your available balance.`,
        'Check your bank details, then request the payout again.',
      ],
      rejected: [
        `Your payout request of ${amount} was not approved. The amount is back in your available balance.`,
        ...(note ? [`Note from our team: ${note}`] : []),
      ],
    }[outcome];

    return this.emailService
      .sendBookingUpdate({
        email: payout.mentor.email,
        firstName: payout.mentor.firstName,
        subject: {
          paid: 'Your Median payout is on its way',
          failed: "We couldn't send your Median payout",
          rejected: 'An update on your Median payout',
        }[outcome],
        paragraphs,
        details: [],
        ctaLabel: 'View earnings',
        ctaPath: '/mentor/earnings',
        idempotencyKey: `payout-${outcome}:${payout.id}`,
      })
      .catch(() => undefined);
  }

  private async findPayout(payoutId: string) {
    const payout = await this.payoutsRepository.findById(payoutId);
    if (!payout) throw new NotFoundException('Payout not found.');
    return payout;
  }

  private transfers() {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      this.logger.error(
        'PAYSTACK_SECRET_KEY is not set, so payouts cannot be sent.',
      );
      throw new ServiceUnavailableException(
        "Payouts aren't available right now. Please try again later.",
      );
    }
    return new PaystackTransfers(secret);
  }

  private messageOf(error: unknown) {
    return error instanceof Error ? error.message : 'Unknown error';
  }
}
