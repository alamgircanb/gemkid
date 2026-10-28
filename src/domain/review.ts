// Optional review suggestions 2, 7 and 21 days after qualifying mastery.
// These are suggestions only: no streaks, no penalties, no notifications.

import type { Attempt } from './types.ts';

export const REVIEW_DAYS = [2, 7, 21] as const;
export const REVIEW_SET_SIZE = 3;
export const REVIEW_PASS = 2;

const DAY = 86_400_000;

export interface ReviewStatus {
  lessonId: string;
  /** Number of review steps passed (0–3). */
  stepsDone: number;
  /** Next due time, or null when all three reviews are done. */
  dueAt: string | null;
  isDue: boolean;
  lastReviewAt: string | null;
  lastReviewPassed: boolean | null;
}

/** Review sessions: attempts with stage 'review', grouped by session. */
export function reviewSessions(attempts: Attempt[], lessonId: string) {
  const map = new Map<string, Attempt[]>();
  for (const a of attempts.filter((x) => x.lessonId === lessonId && x.stage === 'review')) {
    if (!map.has(a.sessionId)) map.set(a.sessionId, []);
    map.get(a.sessionId)!.push(a);
  }
  return [...map.entries()]
    .map(([sessionId, list]) => {
      const firsts = new Map<string, Attempt>();
      for (const a of list.sort((x, y) => x.timestamp.localeCompare(y.timestamp))) if (!firsts.has(a.itemKey)) firsts.set(a.itemKey, a);
      const independent = [...firsts.values()].filter((a) => a.correct && a.hintsUsed === 0).length;
      return {
        sessionId,
        at: list.at(-1)!.timestamp,
        items: firsts.size,
        independent,
        passed: firsts.size >= REVIEW_SET_SIZE && independent >= REVIEW_PASS,
      };
    })
    .sort((a, b) => a.at.localeCompare(b.at));
}

export function reviewStatus(lessonId: string, masteredAt: string | null, attempts: Attempt[], now: Date): ReviewStatus | null {
  if (!masteredAt) return null;
  const sessions = reviewSessions(attempts, lessonId).filter((s) => s.items >= REVIEW_SET_SIZE);
  let stepsDone = 0;
  let anchor = new Date(masteredAt).getTime();
  for (const s of sessions) {
    if (stepsDone >= REVIEW_DAYS.length) break;
    const due = anchor + REVIEW_DAYS[stepsDone] * DAY;
    // Only a passed review at or after its due date moves the schedule forward.
    if (s.passed && new Date(s.at).getTime() >= due) {
      stepsDone++;
    }
  }
  anchor = new Date(masteredAt).getTime();
  const dueAt = stepsDone < REVIEW_DAYS.length ? new Date(anchor + REVIEW_DAYS[stepsDone] * DAY).toISOString() : null;
  const last = sessions.at(-1) ?? null;
  return {
    lessonId,
    stepsDone,
    dueAt,
    isDue: dueAt !== null && now.getTime() >= new Date(dueAt).getTime(),
    lastReviewAt: last?.at ?? null,
    lastReviewPassed: last ? last.passed : null,
  };
}
