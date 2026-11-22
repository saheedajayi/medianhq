import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { PayoutAccount, PayoutRequest } from '@prisma/client';
import { AuthService } from '../../identity/auth/auth.service';
import type { AuthUser } from '../../identity/auth/dto/auth.dto';
import { PaystackError } from '../payouts/paystack-transfers';
import { PayoutsService } from '../payouts/payouts.service';
import type {
  MentorPayoutStatus,
  PayoutAccountDto,
  PayoutsQueryDto,
  RequestPayoutDto,
} from './dto/earnings.dto';
import { isWithin, lagosMonthOf } from './earnings-ledger';
import { EarningsRepository } from './earnings.repository';
import {
  assertMentor,
  EarningsService,
  paginate,
  readPage,
} from './earnings.service';

const PAYOUTS_PAGE_SIZE = 8;
// Nigerian bank accounts (NUBAN) are always ten digits
const ACCOUNT_NUMBER = /^\d{10}$/;

const sum = (values: number[]) =>
  values.reduce((total, value) => total + value, 0);

const lastFour = (accountNumber: string) => accountNumber.slice(-4);

const nameWords = (name: string) =>
  name
    .toLowerCase()
    .split(/[^\p{L}]+/u)
    .filter(Boolean);

/**
 * Whether a bank's account name belongs to this person. Banks add middle
 * names and reorder them, so every word of the registered name has to
 * appear, in any order.
 */
export function isSameName(registeredName: string, accountName: string) {
  const accountWords = new Set(nameWords(accountName));
  const registered = nameWords(registeredName);
  return (
    registered.length > 0 && registered.every((word) => accountWords.has(word))
  );
}

/** "MDN-2026-PAY-K3F9Q": short enough to read out to support */
export const payoutReference = (payout: { id: string; createdAt: Date }) =>
  `MDN-${payout.createdAt.getUTCFullYear()}-PAY-${payout.id.slice(-5).toUpperCase()}`;

function mentorStatusOf(status: string): MentorPayoutStatus {
  if (status === 'PROCESSED') return 'COMPLETED';
  if (status === 'FAILED' || status === 'REJECTED') return 'FAILED';
  // Waiting for review, or sent to the bank and not yet confirmed
  return 'PROCESSING';
}

const isLookupUnavailable = (error: PaystackError) =>
  error.statusCode === 401 ||
  error.statusCode === 403 ||
  error.statusCode === 429 ||
  (error.statusCode !== undefined && error.statusCode >= 500) ||
  /daily limit|rate limit|too many|invalid key|unauthorized/i.test(
    error.message,
  );

/** A mentor's side of payouts: the account they are paid into, their requests and statements */
@Injectable()
export class MentorPayoutsService {
  private readonly logger = new Logger(MentorPayoutsService.name);

  constructor(
    private readonly earningsRepository: EarningsRepository,
    private readonly earningsService: EarningsService,
    private readonly payoutsService: PayoutsService,
    private readonly authService: AuthService,
  ) {}

  async listBanks(user: AuthUser) {
    assertMentor(user);
    const names = await this.payoutsService.bankNames();
    if (names.size === 0) {
      throw new ServiceUnavailableException(
        "We couldn't load the list of banks. Please try again.",
      );
    }
    return [...names]
      .map(([code, name]) => ({ code, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async getAccount(user: AuthUser) {
    assertMentor(user);
    const account = await this.earningsRepository.findPayoutAccount(user.id);
    return account ? this.toAccount(account) : null;
  }

  /** Looks the account up at the bank, so the mentor sees whose it is before saving */
  async resolveAccount(user: AuthUser, dto: PayoutAccountDto) {
    assertMentor(user);
    const registeredName = `${user.firstName} ${user.lastName}`.trim();
    const accountName = await this.lookUpAccountName(dto);
    return {
      accountName,
      registeredName,
      isNameMatch: isSameName(registeredName, accountName),
    };
  }

  async saveAccount(user: AuthUser, dto: PayoutAccountDto) {
    const { bankCode, accountNumber } = this.readAccount(dto);
    const resolved = await this.resolveAccount(user, dto);
    if (!resolved.isNameMatch) {
      throw new BadRequestException(
        `This account name doesn't match your registered name “${resolved.registeredName}”. Enter your own bank account.`,
      );
    }

    const bankNames = await this.payoutsService.bankNames();
    const account = await this.earningsRepository.savePayoutAccount(user.id, {
      bankCode,
      bankName: bankNames.get(bankCode) ?? `Bank ${bankCode}`,
      accountNumber,
      accountName: resolved.accountName,
    });
    return this.toAccount(account);
  }

  async getPayouts(user: AuthUser, query: PayoutsQueryDto) {
    assertMentor(user);
    const page = readPage(query.page);
    const [payouts, bankNames] = await Promise.all([
      this.earningsRepository.findPayouts(user.id),
      this.payoutsService.bankNames(),
    ]);

    return {
      items: paginate(payouts, page, PAYOUTS_PAGE_SIZE).map((payout) =>
        this.toPayout(payout, bankNames),
      ),
      total: payouts.length,
      page,
      pageSize: PAYOUTS_PAGE_SIZE,
    };
  }

  /** The month a payout was requested in, summed up, with the sessions behind it */
  async getStatement(user: AuthUser, payoutId: string, now = new Date()) {
    assertMentor(user);
    const payout = await this.earningsRepository.findPayout(user.id, payoutId);
    if (!payout) throw new NotFoundException('Payout not found.');

    const month = lagosMonthOf(payout.createdAt);
    const { earnings, balances } = await this.earningsService.loadAccount(
      user.id,
      now,
    );
    const inMonth = earnings
      .filter((earning) => isWithin(earning.createdAt, month))
      .map((earning) => ({
        earning,
        entry: balances.ledger.get(earning.id)!,
      }));
    // A refunded session earned nothing, so it stays out of the statement
    const counted = inMonth.filter(({ entry }) => entry.status !== 'REFUNDED');
    const netOf = (rows: typeof counted) =>
      sum(rows.map(({ earning }) => earning.amount));

    return {
      id: payout.id,
      reference: payoutReference(payout),
      requestedAt: payout.createdAt,
      status: mentorStatusOf(payout.status),
      period: month.label,
      currency: payout.currency,
      sessionsCompleted: counted.length,
      grossEarnings: sum(
        counted.map(({ earning }) => earning.grossAmount ?? earning.amount),
      ),
      serviceCharge: sum(
        counted.map(({ earning }) => earning.platformFee ?? 0),
      ),
      netEarnings: netOf(counted),
      paidOut: payout.amount,
      pendingClearance: netOf(
        counted.filter(
          ({ entry }) => entry.status === 'PENDING' && !entry.hasCleared,
        ),
      ),
      heldOnDispute: netOf(
        counted.filter(({ entry }) => entry.status === 'DISPUTED'),
      ),
      sessions: counted.map(({ earning, entry }) => {
        const item = this.earningsService.toItem(earning, entry);
        return {
          id: item.id,
          sessionTitle: item.sessionTitle,
          menteeName: item.menteeName,
          netAmount: item.netAmount,
        };
      }),
    };
  }

  /**
   * Asks for everything that can be withdrawn to be paid into the saved
   * account. The request then waits for an admin, who starts the transfer.
   */
  async requestPayout(user: AuthUser, dto: RequestPayoutDto, now = new Date()) {
    assertMentor(user);
    await this.authService.confirmPassword(user.id, dto.password ?? '');

    const { payout, account } = await this.earningsRepository.withMentorLock(
      user.id,
      async (db) => {
        const account = await this.earningsRepository.findPayoutAccount(
          user.id,
          db,
        );
        if (!account) {
          throw new BadRequestException(
            'Add a payout account before requesting a payout.',
          );
        }

        const { balances } = await this.earningsService.loadAccount(
          user.id,
          now,
          db,
        );
        if (balances.availableBalance <= 0) {
          throw new BadRequestException(
            'You have nothing available to withdraw yet.',
          );
        }

        const payout = await this.earningsRepository.createPayout(
          {
            mentorId: user.id,
            amount: balances.availableBalance,
            accountNumber: account.accountNumber,
            bankCode: account.bankCode,
          },
          db,
        );
        return { payout, account };
      },
    );

    return {
      id: payout.id,
      amount: payout.amount,
      currency: payout.currency,
      reference: payoutReference(payout),
      requestedAt: payout.createdAt,
      bankName: account.bankName,
      accountLastFour: lastFour(account.accountNumber),
    };
  }

  private async lookUpAccountName(dto: PayoutAccountDto) {
    const account = this.readAccount(dto);
    try {
      return await this.payoutsService.resolveAccountName(account);
    } catch (error) {
      if (error instanceof PaystackError) {
        this.logger.warn(
          `Paystack account lookup failed for bank ${account.bankCode}: ${error.message}`,
        );
        if (isLookupUnavailable(error)) {
          throw new ServiceUnavailableException(
            'Could not verify your bank account right now. Please try again later.',
          );
        }
        throw new BadRequestException(
          "We couldn't find that account. Check the bank and account number.",
        );
      }
      throw error;
    }
  }

  private readAccount(dto: PayoutAccountDto) {
    const bankCode = dto.bankCode?.trim();
    const accountNumber = dto.accountNumber?.trim();
    if (!bankCode) throw new BadRequestException('Choose your bank.');
    if (!accountNumber || !ACCOUNT_NUMBER.test(accountNumber)) {
      throw new BadRequestException('Enter a 10-digit account number.');
    }
    return { bankCode, accountNumber };
  }

  /** The full account number stays on the server; the mentor only needs its last digits */
  private toAccount(account: PayoutAccount) {
    return {
      bankCode: account.bankCode,
      bankName: account.bankName,
      accountName: account.accountName,
      accountLastFour: lastFour(account.accountNumber),
    };
  }

  private toPayout(payout: PayoutRequest, bankNames: Map<string, string>) {
    return {
      id: payout.id,
      requestedAt: payout.createdAt,
      amount: payout.amount,
      currency: payout.currency,
      bankName: bankNames.get(payout.bankCode) ?? `Bank ${payout.bankCode}`,
      accountLastFour: lastFour(payout.accountNumber),
      reference: payoutReference(payout),
      status: mentorStatusOf(payout.status),
    };
  }
}
