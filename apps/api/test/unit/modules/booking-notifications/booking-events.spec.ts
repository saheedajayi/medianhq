import { type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ApiResponseInterceptor } from '../../../../src/common/api-response.interceptor';
import { AuthGuard } from '../../../../src/modules/auth/guards/auth.guard';
import { BookingEventsService } from '../../../../src/modules/booking-notifications/booking-events.service';
import { BookingsController } from '../../../../src/modules/bookings/bookings.controller';
import { BookingsService } from '../../../../src/modules/bookings/bookings.service';

// Runs a real HTTP server, because the risk here is what actually goes over the wire
describe('GET /bookings/events', () => {
  let app: INestApplication;
  let events: BookingEventsService;
  let url: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [BookingsController],
      providers: [BookingEventsService, { provide: BookingsService, useValue: {} }],
    })
      .overrideGuard(AuthGuard)
      .useValue({
        canActivate: (context: any) => {
          context.switchToHttp().getRequest().user = { id: 'mentor-1' };
          return true;
        },
      })
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalInterceptors(new ApiResponseInterceptor());
    await app.listen(0);
    events = app.get(BookingEventsService);
    url = `${await app.getUrl()}/bookings/events`.replace('[::1]', 'localhost');
  });

  afterAll(() => app.close());

  const readUntil = async (response: Response, expected: string) => {
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let text = '';
    const deadline = Date.now() + 2000;
    while (!text.includes(expected) && Date.now() < deadline) {
      const next = await Promise.race([
        reader.read(),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 300)),
      ]);
      if (next && !next.done) text += decoder.decode(next.value);
      else if (next?.done) break;
    }
    await reader.cancel();
    return text;
  };

  it('sends a named, unwrapped event when that user is told about a change', async () => {
    const response = await fetch(url);
    expect(response.headers.get('content-type')).toContain('text/event-stream');

    setTimeout(() => events.publish('mentor-1'), 50);
    const text = await readUntil(response, 'bookings-changed');

    expect(text).toContain('event: bookings-changed');
    expect(text).not.toContain('success');
  });

  it("doesn't send another user's changes", async () => {
    const response = await fetch(url);

    setTimeout(() => events.publish('someone-else'), 50);
    const text = await readUntil(response, 'bookings-changed');

    expect(text).not.toContain('bookings-changed');
  });

  it('publishes once per person when both sides are the same user', () => {
    const received: string[] = [];
    const subscription = events.streamFor('mentor-1').subscribe((event) => received.push(String(event.type)));

    events.publish('mentor-1', 'mentor-1');
    subscription.unsubscribe();

    expect(received).toEqual(['bookings-changed']);
  });
});
