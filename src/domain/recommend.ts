// Next-step recommendation: resume → next lesson with satisfied prerequisites →
// bridge lesson for a prerequisite gap → path complete. Never points to planned content.

import type { Lesson, LessonProgress, Level, SubjectId, MasteryState } from './types.ts';

export type Recommendation =
  | { kind: 'resume'; lessonId: string; stage: LessonProgress['stage']; reason: string }
  | { kind: 'start'; lessonId: string; reason: string }
  | { kind: 'retry'; lessonId: string; reason: string }
  | { kind: 'bridge'; lessonId: string; forLessonId: string; reason: string }
  | { kind: 'path-complete'; subjectId: SubjectId | null; reason: string }
  | { kind: 'choose-path'; reason: string };

export interface RecommendInput {
  lessons: Lesson[];
  /** Lessons that may be played in this build (published, or drafts in demo mode). */
  isPlayable: (l: Lesson) => boolean;
  progress: LessonProgress[];
  masteryOf: (lessonId: string) => MasteryState;
  placements: Partial<Record<SubjectId, Level>>;
  /** Restrict to one subject (path screen); otherwise consider all placed subjects. */
  subjectId?: SubjectId;
}

export function levelKey(l: Level): string {
  return 'grade' in l ? `g${l.grade}` : l.stage;
}

export function sameLevel(a: Level, b: Level): boolean {
  return levelKey(a) === levelKey(b);
}

export function lessonsInPathOrder(lessons: Lesson[], subjectId: SubjectId, level?: Level): Lesson[] {
  return lessons
    .filter((l) => l.subjectId === subjectId && (!level || sameLevel(l.level, level)))
    .sort((a, b) => a.order - b.order);
}

export function recommendNext(input: RecommendInput): Recommendation {
  const { lessons, isPlayable, progress, masteryOf, placements, subjectId } = input;
  const playable = lessons.filter(isPlayable);
  const playableIds = new Set(playable.map((l) => l.id));

  // 1. Resume the most recently touched unfinished lesson.
  const unfinished = progress
    .filter((p) => !p.completedAt && playableIds.has(p.lessonId))
    .filter((p) => !subjectId || playable.find((l) => l.id === p.lessonId)?.subjectId === subjectId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  if (unfinished.length) {
    const p = unfinished[0];
    return { kind: 'resume', lessonId: p.lessonId, stage: p.stage, reason: 'You have a lesson in progress. Pick up where you stopped.' };
  }

  const subjects = (subjectId ? [subjectId] : (Object.keys(placements) as SubjectId[])).filter((s) => placements[s]);
  if (!subjects.length) return { kind: 'choose-path', reason: 'Choose a subject to begin a path.' };

  // Skill → lessons that teach it (playable only).
  const teaches = new Map<string, Lesson[]>();
  for (const l of playable) for (const s of l.skillIds) teaches.set(s, [...(teaches.get(s) ?? []), l]);
  const skillMastered = (skill: string): boolean => (teaches.get(skill) ?? []).some((l) => masteryOf(l.id) === 'mastered');
  // A prerequisite that no playable lesson teaches is assumed prior knowledge in this demo.
  const prereqMet = (skill: string): boolean => !teaches.has(skill) || skillMastered(skill);

  for (const subj of subjects) {
    const path = lessonsInPathOrder(playable, subj, placements[subj]);
    for (const l of path) {
      const m = masteryOf(l.id);
      if (m === 'mastered') continue;
      const gaps = l.prerequisiteSkillIds.filter((s) => !prereqMet(s));
      if (gaps.length) {
        const bridge = (teaches.get(gaps[0]) ?? [])[0];
        if (bridge && bridge.id !== l.id)
          return {
            kind: 'bridge',
            lessonId: bridge.id,
            forLessonId: l.id,
            reason: `“${l.title}” builds on “${bridge.title}”. Practising that first will make the next lesson easier.`,
          };
      }
      if (m === 'ready-for-review')
        return {
          kind: 'retry',
          lessonId: l.id,
          reason: `You finished “${l.title}”. Try a fresh set of questions to show what you know on your own.`,
        };
      return {
        kind: 'start',
        lessonId: l.id,
        reason: l.prerequisiteSkillIds.length
          ? `This is the next lesson on your path, and you are ready for it.`
          : `This is the first lesson on this path.`,
      };
    }
  }
  return {
    kind: 'path-complete',
    subjectId: subjectId ?? null,
    reason: 'You have finished every available lesson on this path. Review a skill or try another subject.',
  };
}
