// Mastery is derived from stored attempts; it is never assigned directly.
// Rule (demo): in one qualifying assessment session, at least 5 of 6 practice items
// and both challenge items correct on their first, unassisted submission.

import type { Attempt, Lesson, LessonProgress, MasteryState } from './types.ts';

export const PRACTICE_REQUIRED = 5;
export const FRESHNESS_HOURS = 24;

export interface SessionEvidence {
  sessionId: string;
  startedAt: string;
  practiceIndependent: number;
  practiceTotal: number;
  practiceAssisted: number;
  challengeIndependent: number;
  challengeTotal: number;
  challengeAssisted: number;
  /** Items that did not count because the same version was seen in an earlier session recently. */
  staleItems: number;
  complete: boolean;
  qualifies: boolean;
}

export interface LessonEvidence {
  state: MasteryState;
  sessions: SessionEvidence[];
  best: SessionEvidence | null;
  latest: SessionEvidence | null;
  masteredAt: string | null;
  guidedAssisted: number;
  totalAttempts: number;
}

/** First submission for each item key in a session, in time order. */
function firstSubmissions(attempts: Attempt[]): Attempt[] {
  const seen = new Set<string>();
  const out: Attempt[] = [];
  for (const a of [...attempts].sort((x, y) => x.timestamp.localeCompare(y.timestamp))) {
    const k = `${a.sessionId}::${a.stage}::${a.itemKey}`;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(a);
  }
  return out;
}

export function isIndependentCorrect(a: Attempt): boolean {
  return a.firstAttempt && a.hintsUsed === 0 && a.correct;
}

export function evaluateSessions(lesson: Lesson, attempts: Attempt[]): SessionEvidence[] {
  const relevant = attempts
    .filter((a) => a.lessonId === lesson.id && (a.stage === 'practice' || a.stage === 'challenge'))
    .sort((x, y) => x.timestamp.localeCompare(y.timestamp));
  const bySession = new Map<string, Attempt[]>();
  for (const a of relevant) {
    if (!bySession.has(a.sessionId)) bySession.set(a.sessionId, []);
    bySession.get(a.sessionId)!.push(a);
  }
  const sessions: SessionEvidence[] = [];
  // When each item key was last submitted in an earlier session.
  const lastSeen = new Map<string, string>();
  for (const [sessionId, list] of bySession) {
    const firsts = firstSubmissions(list);
    const startedAt = list[0].timestamp;
    const freshCutoff = new Date(startedAt).getTime() - FRESHNESS_HOURS * 3600_000;
    let pInd = 0, pAss = 0, cInd = 0, cAss = 0, stale = 0;
    const pItems = new Set<string>(), cItems = new Set<string>();
    for (const a of firsts) {
      const prev = lastSeen.get(a.itemKey);
      const isStale = prev !== undefined && new Date(prev).getTime() > freshCutoff;
      if (a.stage === 'practice') {
        pItems.add(a.itemId);
        if (isIndependentCorrect(a) && !isStale) pInd++;
        if (a.hintsUsed > 0) pAss++;
      } else {
        cItems.add(a.itemId);
        if (isIndependentCorrect(a) && !isStale) cInd++;
        if (a.hintsUsed > 0) cAss++;
      }
      if (isStale) stale++;
    }
    for (const a of list) lastSeen.set(a.itemKey, a.timestamp);
    const complete = pItems.size >= lesson.practiceItems.length && cItems.size >= lesson.challenges.length;
    sessions.push({
      sessionId,
      startedAt,
      practiceIndependent: pInd,
      practiceTotal: lesson.practiceItems.length,
      practiceAssisted: pAss,
      challengeIndependent: cInd,
      challengeTotal: lesson.challenges.length,
      challengeAssisted: cAss,
      staleItems: stale,
      complete,
      qualifies:
        complete && pInd >= Math.min(PRACTICE_REQUIRED, lesson.practiceItems.length) && cInd >= lesson.challenges.length,
    });
  }
  return sessions;
}

function score(s: SessionEvidence): number {
  return (s.qualifies ? 1000 : 0) + s.challengeIndependent * 10 + s.practiceIndependent;
}

export function lessonEvidence(
  lesson: Lesson,
  attempts: Attempt[],
  progress: LessonProgress | undefined,
): LessonEvidence {
  const sessions = evaluateSessions(lesson, attempts);
  const mine = attempts.filter((a) => a.lessonId === lesson.id);
  const qualifying = sessions.filter((s) => s.qualifies);
  const masteredSession = qualifying[0] ?? null;
  const masteredAt = masteredSession
    ? mine
        .filter((a) => a.sessionId === masteredSession.sessionId)
        .map((a) => a.timestamp)
        .sort()
        .at(-1) ?? null
    : null;
  let state: MasteryState = 'not-started';
  if (masteredAt) state = 'mastered';
  else if (progress && progress.completions > 0) state = 'ready-for-review';
  else if (progress || mine.length) state = 'learning';
  const best = sessions.length ? sessions.reduce((a, b) => (score(b) > score(a) ? b : a)) : null;
  return {
    state,
    sessions,
    best,
    latest: sessions.at(-1) ?? null,
    masteredAt,
    guidedAssisted: mine.filter((a) => a.stage === 'guided' && a.hintsUsed > 0).length,
    totalAttempts: mine.length,
  };
}
