import { Injectable } from '@nestjs/common';
import { Prisma, RecordingStatus } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class RecordingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findBooking(bookingId: string) {
    return this.prisma.booking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        status: true,
        mentorId: true,
        menteeId: true,
        mentorRecordingConsent: true,
        menteeRecordingConsent: true,
        recordings: {
          where: { status: RecordingStatus.RECORDING },
          select: { id: true, egressId: true },
        },
      },
    });
  }

  setConsent(
    bookingId: string,
    data: Pick<
      Prisma.BookingUpdateInput,
      'mentorRecordingConsent' | 'menteeRecordingConsent'
    >,
  ) {
    return this.prisma.booking.update({ where: { id: bookingId }, data });
  }

  createRecording(data: {
    bookingId: string;
    egressId: string;
    storageKey: string;
    deleteAfter: Date;
  }) {
    return this.prisma.sessionRecording.create({ data });
  }

  findByEgressId(egressId: string) {
    return this.prisma.sessionRecording.findUnique({ where: { egressId } });
  }

  updateRecording(
    recordingId: string,
    data: Prisma.SessionRecordingUpdateInput,
  ) {
    return this.prisma.sessionRecording.update({
      where: { id: recordingId },
      data,
    });
  }

  findRecording(recordingId: string) {
    return this.prisma.sessionRecording.findUnique({
      where: { id: recordingId },
    });
  }

  findExpired(now: Date) {
    return this.prisma.sessionRecording.findMany({
      where: { status: RecordingStatus.READY, deleteAfter: { lte: now } },
      select: { id: true, storageKey: true },
    });
  }
}
