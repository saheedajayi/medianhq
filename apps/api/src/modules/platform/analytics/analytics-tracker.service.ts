import { Injectable, Logger } from '@nestjs/common';
import type { AnalyticsEventType } from '@prisma/client';
import type { Request } from 'express';
import { AuthService } from '../../identity/auth/auth.service';
import { AnalyticsRepository } from './analytics.repository';

export const VISITOR_HEADER = 'x-median-visitor';
const SESSION_COOKIE = 'median_session';
const VISITOR_ID_PATTERN = /^[A-Za-z0-9-]{8,64}$/;
// The same search repeated by one person within this window counts once
const REPEAT_WINDOW_MS = 60 * 1000;
const MAX_REMEMBERED = 5000;
const MAX_TEXT_LENGTH = 200;

export type TrackedEvent = {
  type: AnalyticsEventType;
  mentorId?: string | null;
  query?: string | null;
  filters?: string[];
  resultCount?: number | null;
  path?: string | null;
};

/**
 * Logs what people do on Median for the admin analytics page. Logging
 * never holds up or fails the request it describes: it runs after the
 * caller has moved on and any error is only logged.
 */
@Injectable()
export class AnalyticsTrackerService {
  private readonly logger = new Logger(AnalyticsTrackerService.name);
  private readonly recent = new Map<string, number>();

  constructor(
    private readonly repository: AnalyticsRepository,
    private readonly authService: AuthService,
  ) {}

  /** Records an event for whoever made the request, signed in or not */
  track(request: Request, event: TrackedEvent) {
    void this.record(request, event).catch((err: unknown) =>
      this.logger.warn(`Could not log ${event.type}: ${String(err)}`),
    );
  }

  private async record(request: Request, event: TrackedEvent) {
    const visitorId = this.visitorIdOf(request);
    const userId = await this.userIdOf(request);
    if (!visitorId && !userId) return;

    const query = clip(event.query?.trim().toLowerCase());
    const path = clip(event.path?.split(/[?#]/)[0]);
    if (this.isRepeat(event, userId ?? visitorId, query, path)) return;

    await this.repository.createEvent({
      type: event.type,
      userId,
      visitorId,
      mentorId: clip(event.mentorId),
      query,
      filters: event.filters ?? [],
      resultCount: event.resultCount ?? null,
      path,
    });
  }

  private visitorIdOf(request: Request) {
    const header = request.headers[VISITOR_HEADER];
    const value = Array.isArray(header) ? header[0] : header;
    return value && VISITOR_ID_PATTERN.test(value) ? value : null;
  }

  private async userIdOf(request: Request) {
    const token = request.headers.cookie
      ?.split(';')
      .map((cookie) => cookie.trim())
      .find((cookie) => cookie.startsWith(`${SESSION_COOKIE}=`))
      ?.slice(SESSION_COOKIE.length + 1);
    if (!token) return null;
    try {
      return (await this.authService.getCurrentUser(token)).id;
    } catch {
      return null;
    }
  }

  /** Typing or paging through results re-sends the same search; count it once */
  private isRepeat(
    event: TrackedEvent,
    who: string | null,
    query: string | null,
    path: string | null,
  ) {
    const key = [
      event.type,
      who,
      query,
      path,
      event.mentorId,
      ...(event.filters ?? []),
    ].join('|');
    const now = Date.now();
    const seenAt = this.recent.get(key);
    if (seenAt && now - seenAt < REPEAT_WINDOW_MS) return true;

    if (this.recent.size >= MAX_REMEMBERED) {
      for (const [oldKey, at] of this.recent) {
        if (now - at >= REPEAT_WINDOW_MS) this.recent.delete(oldKey);
      }
      if (this.recent.size >= MAX_REMEMBERED) this.recent.clear();
    }
    this.recent.set(key, now);
    return false;
  }
}

const clip = (value: string | null | undefined) =>
  value ? value.slice(0, MAX_TEXT_LENGTH) : null;
