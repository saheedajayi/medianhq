import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

type RateLimitRecord = {
  count: number;
  resetAt: number;
};

@Injectable()
export class AuthRateLimiterService {
  private readonly records = new Map<string, RateLimitRecord>();

  /**
   * Verifies that the given key does not exceed the allowed number of requests in windowMs.
   * If limit is exceeded, throws an HttpException with 429 Too Many Requests.
   */
  checkLimit(
    key: string,
    limit: number,
    windowMs: number,
    customMessage?: string,
  ): void {
    const now = Date.now();
    this.pruneExpired(now);

    const record = this.records.get(key);

    if (!record || now >= record.resetAt) {
      this.records.set(key, { count: 1, resetAt: now + windowMs });
      return;
    }

    if (record.count >= limit) {
      const waitSeconds = Math.max(1, Math.ceil((record.resetAt - now) / 1000));
      throw new HttpException(
        customMessage ??
          `Too many requests. Please try again in ${waitSeconds} seconds.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    record.count += 1;
  }

  /**
   * Resets rate limit counter for a specific key (e.g. upon successful completion).
   */
  reset(key: string): void {
    this.records.delete(key);
  }

  /**
   * Clears all in-memory rate limit records (useful for test resets).
   */
  clear(): void {
    this.records.clear();
  }

  private pruneExpired(now: number): void {
    // Only prune if map has grown to prevent memory pressure
    if (this.records.size < 500) {
      return;
    }
    for (const [key, value] of this.records.entries()) {
      if (now >= value.resetAt) {
        this.records.delete(key);
      }
    }
  }
}
