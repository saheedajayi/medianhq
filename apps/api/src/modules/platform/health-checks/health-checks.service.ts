import { Injectable } from '@nestjs/common';
import { RoomServiceClient } from 'livekit-server-sdk';
import { HealthChecksRepository } from './health-checks.repository';

const MINUTE_MS = 60 * 1000;
const DAY_MS = 24 * 60 * MINUTE_MS;
const CHECK_TIMEOUT_MS = 5000;
const UPTIME_WINDOW_DAYS = 30;
const UPTIME_TARGET_PCT = 99.5;
const SLOW_VIDEO_MS = 1000;
const PAYSTACK_API = 'https://api.paystack.co';

export type HealthStatus = 'OPERATIONAL' | 'DEGRADED';

type Probe = { ok: boolean; ms: number | null };

/** The 95th percentile, so a few slow checks don't hide behind the average */
export function p95(values: number[]) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[
    Math.min(Math.ceil(sorted.length * 0.95) - 1, sorted.length - 1)
  ];
}

/**
 * Checks once a minute that the API is up and can reach LiveKit and
 * Paystack, and summarises the last 30 days for the admin overview. The API
 * being up is measured by the checks themselves: a minute with no check is
 * a minute it was down.
 */
@Injectable()
export class HealthChecksService {
  constructor(private readonly repository: HealthChecksRepository) {}

  async runCheck(now = new Date()) {
    const [livekit, paystack] = await Promise.all([
      this.probe(() => this.pingLivekit()),
      this.probe(() => this.pingPaystack()),
    ]);
    await this.repository.create({
      checkedAt: now,
      livekitOk: livekit.ok,
      livekitMs: livekit.ms,
      paystackOk: paystack.ok,
      paystackMs: paystack.ms,
    });
  }

  prune(now = new Date()) {
    return this.repository.deleteBefore(
      new Date(now.getTime() - UPTIME_WINDOW_DAYS * DAY_MS),
    );
  }

  async getSummary(now = new Date()) {
    const windowStart = new Date(now.getTime() - UPTIME_WINDOW_DAYS * DAY_MS);
    const [latest, first, checkedMinutes, latencies] = await Promise.all([
      this.repository.findLatest(),
      this.repository.findFirstSince(windowStart),
      this.repository.countCheckedMinutes(windowStart),
      this.repository.findLivekitLatencies(new Date(now.getTime() - DAY_MS)),
    ]);

    // Counted from the first check, so a new deployment isn't shown as down before it
    const expectedMinutes = first
      ? Math.max(
          Math.ceil((now.getTime() - first.checkedAt.getTime()) / MINUTE_MS),
          1,
        )
      : 0;
    const uptimePct = expectedMinutes
      ? Math.min((checkedMinutes / expectedMinutes) * 100, 100)
      : null;
    const videoP95 = p95(latencies.map((check) => check.livekitMs as number));

    const uptimeOk = uptimePct !== null && uptimePct >= UPTIME_TARGET_PCT;
    const videoOk =
      !!latest?.livekitOk && videoP95 !== null && videoP95 < SLOW_VIDEO_MS;
    const paystackOk = !!latest?.paystackOk;
    const status = (ok: boolean): HealthStatus =>
      ok ? 'OPERATIONAL' : 'DEGRADED';

    return {
      status: status(uptimeOk && videoOk && paystackOk),
      checkedAt: latest?.checkedAt ?? now,
      note: `${UPTIME_WINDOW_DAYS}-day uptime`,
      items: [
        {
          label: 'API uptime',
          value:
            uptimePct === null ? 'No checks yet' : `${uptimePct.toFixed(2)}%`,
          status: status(uptimeOk),
          statusLabel: uptimeOk
            ? 'Operational'
            : `Below ${UPTIME_TARGET_PCT}% target`,
        },
        {
          label: 'Video-room latency',
          value: videoP95 === null ? 'No data' : `${videoP95} ms`,
          status: status(videoOk),
          statusLabel: !latest?.livekitOk
            ? 'p95 · Unreachable'
            : videoOk
              ? 'p95 · Operational'
              : 'p95 · Slow',
        },
        {
          label: 'Payment gateways',
          value: paystackOk ? 'Paystack operational' : 'Paystack unreachable',
          status: status(paystackOk),
          statusLabel:
            paystackOk && latest?.paystackMs != null
              ? `Responding in ${latest.paystackMs} ms`
              : 'Last check failed',
        },
      ],
    };
  }

  private async probe(ping: () => Promise<void>): Promise<Probe> {
    const startedAt = Date.now();
    try {
      await ping();
      return { ok: true, ms: Date.now() - startedAt };
    } catch {
      return { ok: false, ms: null };
    }
  }

  private async pingLivekit() {
    const url = process.env.LIVEKIT_URL;
    const key = process.env.LIVEKIT_API_KEY;
    const secret = process.env.LIVEKIT_API_SECRET;
    if (!url || !key || !secret) throw new Error('LiveKit is not configured.');
    const rooms = new RoomServiceClient(
      url.replace(/^ws/, 'http'),
      key,
      secret,
    );
    await Promise.race([
      rooms.listRooms(),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error('LiveKit timed out.')),
          CHECK_TIMEOUT_MS,
        ).unref(),
      ),
    ]);
  }

  private async pingPaystack() {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) throw new Error('Paystack is not configured.');
    const response = await fetch(
      `${PAYSTACK_API}/bank?country=nigeria&perPage=1`,
      {
        headers: { Authorization: `Bearer ${secret}` },
        signal: AbortSignal.timeout(CHECK_TIMEOUT_MS),
      },
    );
    if (!response.ok) throw new Error(`Paystack answered ${response.status}.`);
  }
}
