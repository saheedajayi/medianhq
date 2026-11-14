import type { NoShowRisk, NoShowStatus } from './dto/admin-sessions.dto';

export type ConcludedSession = {
  mentorId: string;
  startsAt: Date;
  /** True when the mentor (or both sides) did not turn up */
  mentorMissed: boolean;
};

export type NoShowHistory = {
  /** Mentor no-shows on or after the cutoff */
  recentMisses: number;
  /** Misses in a row, counting back from the mentor's latest session */
  consecutiveMisses: number;
  lastMissAt: Date | null;
};

const EMPTY: NoShowHistory = {
  recentMisses: 0,
  consecutiveMisses: 0,
  lastMissAt: null,
};

/**
 * Works out each mentor's no-show record. Sessions must be newest first, since
 * the consecutive count stops at the first session the mentor attended.
 */
export function buildNoShowHistories(
  sessions: ConcludedSession[],
  recentSince: Date,
) {
  const histories = new Map<string, NoShowHistory>();
  const streakBroken = new Set<string>();

  for (const session of sessions) {
    let history = histories.get(session.mentorId);
    if (!history) {
      history = { ...EMPTY };
      histories.set(session.mentorId, history);
    }

    if (!session.mentorMissed) {
      streakBroken.add(session.mentorId);
      continue;
    }
    if (!streakBroken.has(session.mentorId)) history.consecutiveMisses += 1;
    if (session.startsAt >= recentSince) history.recentMisses += 1;
    history.lastMissAt ??= session.startsAt;
  }

  return {
    histories,
    get: (mentorId: string) => histories.get(mentorId) ?? EMPTY,
  };
}

/** Mentors are flagged at two misses in a row and warned at one */
export const noShowStatus = (consecutiveMisses: number): NoShowStatus =>
  consecutiveMisses >= 2
    ? 'ALERT'
    : consecutiveMisses === 1
      ? 'WARNING'
      : 'CLEAR';

export const noShowRisk = (consecutiveMisses: number): NoShowRisk =>
  consecutiveMisses >= 2 ? 'HIGH' : consecutiveMisses === 1 ? 'MEDIUM' : 'LOW';
