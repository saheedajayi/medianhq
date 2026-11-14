import { EgressStatus } from 'livekit-server-sdk';
import { RecordingsService } from '../../../../../src/modules/scheduling/recordings/recordings.service';

const egress = {
  startRoomCompositeEgress: jest.fn(),
  stopEgress: jest.fn(),
};
const rooms = { listParticipants: jest.fn() };
const webhooks = { receive: jest.fn() };

jest.mock('livekit-server-sdk', () => {
  const actual =
    jest.requireActual<typeof import('livekit-server-sdk')>(
      'livekit-server-sdk',
    );
  return {
    ...actual,
    EgressClient: jest.fn(() => egress),
    RoomServiceClient: jest.fn(() => rooms),
    WebhookReceiver: jest.fn(() => webhooks),
  };
});

describe('RecordingsService', () => {
  const mentor = { id: 'mentor-1' };
  const mentee = { id: 'mentee-1' };
  const booking = (overrides: Record<string, unknown> = {}) => ({
    id: 'booking-1',
    status: 'CONFIRMED',
    mentorId: mentor.id,
    menteeId: mentee.id,
    mentorRecordingConsent: null as boolean | null,
    menteeRecordingConsent: null as boolean | null,
    recordings: [] as { id: string; egressId: string }[],
    ...overrides,
  });

  const setup = (bookingRecord = booking()) => {
    const repository = {
      findBooking: jest.fn().mockResolvedValue(bookingRecord),
      setConsent: jest
        .fn()
        .mockImplementation((_id, data) =>
          Promise.resolve({ ...bookingRecord, ...data }),
        ),
      createRecording: jest
        .fn()
        .mockImplementation((data) =>
          Promise.resolve({ id: 'rec-1', ...data }),
        ),
      findByEgressId: jest.fn(),
      updateRecording: jest.fn(),
      findRecording: jest.fn(),
      findExpired: jest.fn().mockResolvedValue([]),
    };
    const storage = {
      isConfigured: true,
      egressUpload: jest.fn().mockReturnValue({}),
      playbackUrl: jest.fn(),
      delete: jest.fn(),
    };
    const service = new RecordingsService(
      repository as never,
      storage as never,
    );
    return { repository, storage, service };
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.LIVEKIT_URL = 'wss://median.livekit.cloud';
    process.env.LIVEKIT_API_KEY = 'key';
    process.env.LIVEKIT_API_SECRET = 'secret';
    egress.startRoomCompositeEgress.mockResolvedValue({ egressId: 'EG_1' });
    egress.stopEgress.mockResolvedValue({ egressId: 'EG_1' });
    rooms.listParticipants.mockResolvedValue([
      { identity: mentor.id },
      { identity: mentee.id },
    ]);
  });

  it('only lets the people in the session give consent', async () => {
    const { service } = setup();

    await expect(
      service.setConsent({ id: 'stranger' } as never, 'booking-1', {
        consent: true,
      }),
    ).rejects.toThrow('You are not part of this session.');
    await expect(
      service.setConsent(mentor as never, 'booking-1', { consent: 'yes' }),
    ).rejects.toThrow('consent must be true or false.');
  });

  it('does not record until both sides have agreed', async () => {
    const { repository, service } = setup(
      booking({ mentorRecordingConsent: true, menteeRecordingConsent: null }),
    );

    await service.maybeStart('booking-1');

    expect(egress.startRoomCompositeEgress).not.toHaveBeenCalled();
    expect(repository.createRecording).not.toHaveBeenCalled();
  });

  it('starts once both agreed and both are in the room', async () => {
    const { repository, service } = setup(
      booking({ mentorRecordingConsent: true, menteeRecordingConsent: true }),
    );

    await service.maybeStart('booking-1');

    expect(egress.startRoomCompositeEgress).toHaveBeenCalledWith(
      'median-session-booking-1',
      expect.anything(),
      { layout: 'grid' },
    );
    expect(repository.createRecording).toHaveBeenCalledWith(
      expect.objectContaining({ bookingId: 'booking-1', egressId: 'EG_1' }),
    );
  });

  it('waits for the other person to join', async () => {
    rooms.listParticipants.mockResolvedValue([{ identity: mentor.id }]);
    const { service } = setup(
      booking({ mentorRecordingConsent: true, menteeRecordingConsent: true }),
    );

    await service.maybeStart('booking-1');

    expect(egress.startRoomCompositeEgress).not.toHaveBeenCalled();
  });

  it('stops a running recording when either side withdraws', async () => {
    const { service } = setup(
      booking({
        mentorRecordingConsent: true,
        menteeRecordingConsent: true,
        recordings: [{ id: 'rec-1', egressId: 'EG_1' }],
      }),
    );

    const status = await service.setConsent(mentee as never, 'booking-1', {
      consent: false,
    });

    expect(egress.stopEgress).toHaveBeenCalledWith('EG_1');
    expect(status).toMatchObject({ myConsent: false, isRecording: false });
  });

  it('marks the recording ready when LiveKit finishes the file', async () => {
    const { repository, service } = setup();
    repository.findByEgressId.mockResolvedValue({
      id: 'rec-1',
      status: 'RECORDING',
      storageKey: 'recordings/booking-1/1.mp4',
    });
    webhooks.receive.mockResolvedValue({
      event: 'egress_ended',
      egressInfo: {
        egressId: 'EG_1',
        status: EgressStatus.EGRESS_COMPLETE,
        fileResults: [
          {
            filename: 'recordings/booking-1/1.mp4',
            size: 2048n,
            duration: 90n * 1_000_000_000n,
          },
        ],
      },
    });

    await service.handleWebhook('{}', 'signed');

    expect(repository.updateRecording).toHaveBeenCalledWith(
      'rec-1',
      expect.objectContaining({
        status: 'READY',
        sizeBytes: 2048n,
        durationSeconds: 90,
      }),
    );
  });

  it('rejects webhooks LiveKit did not sign', async () => {
    const { service } = setup();
    webhooks.receive.mockRejectedValue(new Error('bad token'));

    await expect(service.handleWebhook('{}', 'forged')).rejects.toThrow(
      'Invalid LiveKit webhook signature.',
    );
  });

  it('deletes recordings past retention', async () => {
    const { repository, storage, service } = setup();
    repository.findExpired.mockResolvedValue([
      { id: 'rec-1', storageKey: 'recordings/booking-1/1.mp4' },
    ]);

    await service.sweepExpired(new Date('2026-12-01T00:00:00.000Z'));

    expect(storage.delete).toHaveBeenCalledWith('recordings/booking-1/1.mp4');
    expect(repository.updateRecording).toHaveBeenCalledWith(
      'rec-1',
      expect.objectContaining({ status: 'DELETED' }),
    );
  });
});
