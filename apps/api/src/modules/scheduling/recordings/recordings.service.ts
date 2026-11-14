import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { BookingStatus, RecordingStatus } from '@prisma/client';
import {
  EgressClient,
  EgressStatus,
  EncodedFileOutput,
  EncodedFileType,
  RoomServiceClient,
  WebhookReceiver,
  type EgressInfo,
} from 'livekit-server-sdk';
import type { AuthUser } from '../../identity/auth/dto/auth.dto';
import {
  bookingIdFromRoomName,
  sessionRoomName,
} from '../bookings/booking-policy';
import type { RecordingConsentDto } from './dto/recordings.dto';
import { RecordingStorage } from './recording-storage';
import { RecordingsRepository } from './recordings.repository';

const DAY_MS = 24 * 60 * 60 * 1000;
const NANOSECONDS_PER_SECOND = 1_000_000_000n;

type LiveKitClients = {
  egress: EgressClient;
  rooms: RoomServiceClient;
  webhooks: WebhookReceiver;
};

/**
 * Records a session only when both the mentor and the mentee said yes.
 * LiveKit writes the recording straight to our bucket; its webhook tells us
 * when someone joins (so the recording can start once both are in) and when
 * the file is ready. Files are deleted once they are past retention.
 */
@Injectable()
export class RecordingsService {
  private readonly logger = new Logger(RecordingsService.name);
  private clients: LiveKitClients | null | undefined;

  constructor(
    private readonly repository: RecordingsRepository,
    private readonly storage: RecordingStorage,
  ) {}

  get retentionDays() {
    const days = Number(process.env.RECORDING_RETENTION_DAYS);
    return Number.isFinite(days) && days > 0 ? days : 30;
  }

  async getStatus(user: AuthUser, bookingId: string) {
    const booking = await this.findParticipantBooking(user, bookingId);
    return this.toStatus(user, booking);
  }

  async setConsent(
    user: AuthUser,
    bookingId: string,
    dto: RecordingConsentDto,
  ) {
    if (typeof dto?.consent !== 'boolean') {
      throw new BadRequestException('consent must be true or false.');
    }
    const consent = dto.consent;
    const booking = await this.findParticipantBooking(user, bookingId);
    if (booking.status !== BookingStatus.CONFIRMED) {
      throw new BadRequestException(
        'Recording can only be set for a confirmed session.',
      );
    }

    const isMentor = booking.mentorId === user.id;
    const updated = await this.repository.setConsent(
      bookingId,
      isMentor
        ? { mentorRecordingConsent: consent }
        : { menteeRecordingConsent: consent },
    );

    if (consent) {
      await this.maybeStart(bookingId);
    } else {
      // Either side saying no ends any recording already running
      await Promise.all(
        booking.recordings.map((recording) =>
          this.stopEgress(recording.egressId),
        ),
      );
    }

    return this.toStatus(user, {
      ...booking,
      mentorRecordingConsent: updated.mentorRecordingConsent,
      menteeRecordingConsent: updated.menteeRecordingConsent,
      recordings: consent ? booking.recordings : [],
    });
  }

  /** Starts recording if both agreed, both are in the room and nothing is recording yet */
  async maybeStart(bookingId: string) {
    const clients = this.liveKit();
    if (!clients || !this.storage.isConfigured) return null;

    const booking = await this.repository.findBooking(bookingId);
    if (
      !booking ||
      booking.status !== BookingStatus.CONFIRMED ||
      booking.mentorRecordingConsent !== true ||
      booking.menteeRecordingConsent !== true ||
      booking.recordings.length > 0
    ) {
      return null;
    }

    const roomName = sessionRoomName(bookingId);
    const participants = await clients.rooms
      .listParticipants(roomName)
      .catch(() => []);
    const joined = new Set(participants.map((p) => p.identity));
    if (!joined.has(booking.mentorId) || !joined.has(booking.menteeId)) {
      return null;
    }

    const storageKey = `recordings/${bookingId}/${Date.now()}.mp4`;
    const egress = await clients.egress.startRoomCompositeEgress(
      roomName,
      new EncodedFileOutput({
        fileType: EncodedFileType.MP4,
        filepath: storageKey,
        output: { case: 's3', value: this.storage.egressUpload() },
      }),
      { layout: 'grid' },
    );

    return this.repository.createRecording({
      bookingId,
      egressId: egress.egressId,
      storageKey,
      deleteAfter: new Date(Date.now() + this.retentionDays * DAY_MS),
    });
  }

  /** Checks LiveKit's signature over the exact body, then acts on the event */
  async handleWebhook(rawBody: string, authHeader: string | undefined) {
    const clients = this.liveKit();
    if (!clients) return { received: false };

    const event = await clients.webhooks
      .receive(rawBody, authHeader)
      .catch(() => {
        throw new ForbiddenException('Invalid LiveKit webhook signature.');
      });

    if (event.event === 'participant_joined' && event.room) {
      const bookingId = bookingIdFromRoomName(event.room.name);
      if (bookingId) {
        await this.maybeStart(bookingId).catch((err: unknown) =>
          this.logger.error(`Could not start recording for ${bookingId}`, err),
        );
      }
    }

    if (event.event === 'egress_ended' && event.egressInfo) {
      await this.finish(event.egressInfo);
    }

    return { received: true };
  }

  /** A short-lived link to watch a finished recording */
  async playbackUrl(recordingId: string) {
    const recording = await this.repository.findRecording(recordingId);
    if (!recording || recording.status !== RecordingStatus.READY) {
      throw new NotFoundException('This recording is not available.');
    }
    return this.storage.playbackUrl(recording.storageKey);
  }

  /** Deletes files past retention; runs hourly */
  async sweepExpired(now = new Date()) {
    if (!this.storage.isConfigured) return 0;
    const expired = await this.repository.findExpired(now);
    for (const recording of expired) {
      try {
        await this.storage.delete(recording.storageKey);
        await this.repository.updateRecording(recording.id, {
          status: RecordingStatus.DELETED,
          deletedAt: now,
        });
      } catch (err) {
        this.logger.error(`Could not delete recording ${recording.id}`, err);
      }
    }
    return expired.length;
  }

  private async finish(info: EgressInfo) {
    const recording = await this.repository.findByEgressId(info.egressId);
    if (!recording || recording.status !== RecordingStatus.RECORDING) return;

    const file = info.fileResults[0];
    if (info.status === EgressStatus.EGRESS_COMPLETE && file) {
      await this.repository.updateRecording(recording.id, {
        status: RecordingStatus.READY,
        storageKey: file.filename || recording.storageKey,
        sizeBytes: file.size,
        durationSeconds: Number(file.duration / NANOSECONDS_PER_SECOND),
        endedAt: new Date(),
      });
      return;
    }

    await this.repository.updateRecording(recording.id, {
      status: RecordingStatus.FAILED,
      failureReason: info.error || 'The recording did not finish.',
      endedAt: new Date(),
    });
  }

  private async stopEgress(egressId: string) {
    await this.liveKit()
      ?.egress.stopEgress(egressId)
      .catch((err: unknown) =>
        this.logger.warn(
          `Could not stop recording ${egressId}: ${String(err)}`,
        ),
      );
  }

  private async findParticipantBooking(user: AuthUser, bookingId: string) {
    const booking = await this.repository.findBooking(bookingId);
    if (!booking) throw new NotFoundException('Booking not found.');
    if (booking.mentorId !== user.id && booking.menteeId !== user.id) {
      throw new ForbiddenException('You are not part of this session.');
    }
    return booking;
  }

  private toStatus(
    user: AuthUser,
    booking: NonNullable<
      Awaited<ReturnType<RecordingsRepository['findBooking']>>
    >,
  ) {
    const isMentor = booking.mentorId === user.id;
    return {
      myConsent: isMentor
        ? booking.mentorRecordingConsent
        : booking.menteeRecordingConsent,
      otherConsent: isMentor
        ? booking.menteeRecordingConsent
        : booking.mentorRecordingConsent,
      isRecording: booking.recordings.length > 0,
      retentionDays: this.retentionDays,
    };
  }

  private liveKit() {
    if (this.clients !== undefined) return this.clients;
    const url = process.env.LIVEKIT_URL;
    const key = process.env.LIVEKIT_API_KEY;
    const secret = process.env.LIVEKIT_API_SECRET;
    if (!url || !key || !secret) {
      this.clients = null;
      return null;
    }
    const httpUrl = url.replace(/^ws/, 'http');
    this.clients = {
      egress: new EgressClient(httpUrl, key, secret),
      rooms: new RoomServiceClient(httpUrl, key, secret),
      webhooks: new WebhookReceiver(key, secret),
    };
    return this.clients;
  }
}
