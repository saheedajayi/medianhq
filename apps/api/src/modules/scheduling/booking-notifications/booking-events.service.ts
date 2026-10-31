import { Injectable, type MessageEvent } from '@nestjs/common';
import { filter, interval, map, merge, Observable, Subject } from 'rxjs';

// Comments-only traffic so proxies don't close a connection that's quiet for a while
const HEARTBEAT_MS = 25_000;

/**
 * Tells a user's open pages that their bookings changed. This lives in memory,
 * so it only reaches pages connected to this API process: running more than one
 * instance would need something like Redis between them.
 */
@Injectable()
export class BookingEventsService {
  private readonly changes = new Subject<string>();

  publish(...userIds: string[]) {
    new Set(userIds).forEach((userId) => this.changes.next(userId));
  }

  /** Carries no booking data: pages refetch through the normal authorised endpoints */
  streamFor(userId: string): Observable<MessageEvent> {
    return merge(
      this.changes.pipe(
        filter((changedUserId) => changedUserId === userId),
        map((): MessageEvent => ({ type: 'bookings-changed', data: '{}' })),
      ),
      interval(HEARTBEAT_MS).pipe(map((): MessageEvent => ({ type: 'ping', data: '{}' }))),
    );
  }
}
