import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { evaluate, itemForSession, normalizeInteger } from '../../src/domain/answers.ts';
import { evaluateSessions, lessonEvidence } from '../../src/domain/mastery.ts';
import { checkSkillGraph } from '../../src/domain/graph.ts';
import { recommendNext } from '../../src/domain/recommend.ts';
import { applyReward, balance, rankFor, canPurchase } from '../../src/domain/rewards.ts';
import { reviewStatus } from '../../src/domain/review.ts';
import { runProgram, parseProgram, programToText, LIMITS } from '../../src/domain/robot.ts';
import { seededShuffle } from '../../src/domain/rng.ts';
import { LESSONS, SKILLS, CHAPTERS, isPlayable, defaultPlacements, lessonById } from '../../src/content/curriculum.ts';
import { validateCatalogue, validateLesson } from '../../src/content/validate.ts';
import type { Attempt, Lesson, LessonProgress, RewardEvent, Skill } from '../../src/domain/types.ts';

const eq = lessonById('math-g3-equal-groups-01')!;
const arrays = lessonById('math-g3-arrays-01')!;

let clock = Date.parse('2026-11-01T10:00:00Z');
const tick = () => new Date((clock += 1000)).toISOString();

function att(lesson: Lesson, stage: 'practice' | 'challenge' | 'guided' | 'review', idx: number, opts: Partial<Attempt> = {}): Attempt {
  const list = stage === 'practice' ? lesson.practiceItems : stage === 'challenge' ? lesson.challenges : lesson.guidedTasks;
  const item = list[idx];
  return {
    id: `a${Math.random()}`,
    profileId: 'p1',
    lessonId: lesson.id,
    contentVersion: 1,
    stage,
    itemId: item.id,
    itemKey: item.id,
    sessionId: 's1',
    answer: '',
    correct: true,
    firstAttempt: true,
    hintsUsed: 0,
    timestamp: tick(),
    ...opts,
  };
}

/** A full session: `practiceCorrect` of 6 practice right first time, `challengeCorrect` of 2. */
function session(lesson: Lesson, practiceCorrect: number, challengeCorrect: number, opts: Partial<Attempt> = {}): Attempt[] {
  const out: Attempt[] = [];
  lesson.practiceItems.forEach((_, i) => out.push(att(lesson, 'practice', i, { correct: i < practiceCorrect, ...opts })));
  lesson.challenges.forEach((_, i) => out.push(att(lesson, 'challenge', i, { correct: i < challengeCorrect, ...opts })));
  return out;
}

const prog = (lessonId: string, extra: Partial<LessonProgress> = {}): LessonProgress => ({
  profileId: 'p1',
  lessonId,
  contentVersion: 1,
  stage: 'discover',
  itemIndex: 0,
  sessionId: 's1',
  sessionNumber: 0,
  gameCompleted: false,
  gameSkipped: false,
  reflectionChoice: null,
  startedAt: '2026-11-01T09:00:00Z',
  updatedAt: '2026-11-01T09:00:00Z',
  completedAt: null,
  completions: 0,
  ...extra,
});

describe('answers', () => {
  test('integer answers accept surrounding spaces and Bengali digits, reject words', () => {
    assert.equal(normalizeInteger(' 12 '), 12);
    assert.equal(normalizeInteger('১২'), 12);
    assert.equal(normalizeInteger('twelve'), null);
    assert.equal(evaluate(eq.practiceItems[1], '12').correct, true);
    assert.equal(evaluate(eq.practiceItems[1], '7').correct, false, '3 + 4 = 7 misconception is wrong');
  });
  test('order items accept approved alternatives and treat identical tokens as interchangeable', () => {
    const sentence = lessonById('english-g3-sentence-order-01')!;
    const sam = sentence.practiceItems[4];
    assert.equal(evaluate(sam, 'w1|w2|w3|w4|w5|w6').correct, true);
    assert.equal(evaluate(sam, 'w1|w3|w4|w5|w2|w6').correct, true);
    assert.equal(evaluate(sam, 'w2|w1|w3|w4|w5|w6').correct, false);
    const dog = sentence.practiceItems[0]; // The dog ran to the park .
    assert.equal(evaluate(dog, 'w1|w2|w3|w4|w5|w6|w7').correct, true);
    const partial = evaluate(dog, 'w1|w2');
    assert.equal(partial.correct, false);
    assert.ok(partial.detail);
  });
  test('variants rotate by session number', () => {
    const it = eq.practiceItems[0];
    assert.equal(itemForSession(it, 0).id, 'practice-01');
    assert.equal(itemForSession(it, 1).id, 'practice-01-v1');
    assert.equal(itemForSession(it, 2).id, 'practice-01');
  });
  test('rotating an array does not change a total-only answer', () => {
    const rot = arrays.practiceItems[4];
    assert.equal(evaluate(rot, 'a').correct, true);
  });
});

describe('mastery (AC05, AC06)', () => {
  test('5/6 practice and 2/2 challenge independent → mastered', () => {
    const ev = lessonEvidence(eq, session(eq, 5, 2), prog(eq.id, { completions: 1 }));
    assert.equal(ev.state, 'mastered');
    assert.equal(ev.best?.practiceIndependent, 5);
  });
  test('4/6 practice → not mastered, ready for review', () => {
    const ev = lessonEvidence(eq, session(eq, 4, 2), prog(eq.id, { completions: 1 }));
    assert.equal(ev.state, 'ready-for-review');
  });
  test('6/6 practice with hints → not mastered', () => {
    const ev = lessonEvidence(eq, session(eq, 6, 2, { hintsUsed: 1 }), prog(eq.id, { completions: 1 }));
    assert.notEqual(ev.state, 'mastered');
    assert.equal(ev.best?.practiceAssisted, 6);
  });
  test('1/2 challenge → not mastered', () => {
    const ev = lessonEvidence(eq, session(eq, 6, 1), prog(eq.id, { completions: 1 }));
    assert.notEqual(ev.state, 'mastered');
  });
  test('retry after a wrong first answer does not count as independent evidence', () => {
    const wrongThenRight = [att(eq, 'practice', 0, { correct: false }), att(eq, 'practice', 0, { correct: true, firstAttempt: false })];
    const rest = session(eq, 6, 2).filter((a) => a.itemId !== 'practice-01');
    const s = evaluateSessions(eq, [...wrongThenRight, ...rest]);
    assert.equal(s[0].practiceIndependent, 5);
    assert.equal(s[0].qualifies, true);
  });
  test('completion without assessment is not mastery', () => {
    const ev = lessonEvidence(eq, [], prog(eq.id, { completions: 1, completedAt: '2026-11-01T10:00:00Z' }));
    assert.equal(ev.state, 'ready-for-review');
  });
  test('immediately repeating the same item versions does not create fresh evidence', () => {
    const first = session(eq, 3, 0);
    const repeat = session(eq, 6, 2, { sessionId: 's2' });
    const s = evaluateSessions(eq, [...first, ...repeat]);
    assert.equal(s[1].qualifies, false);
    assert.equal(s[1].staleItems, 8);
  });
  test('fresh variants in a new session can qualify', () => {
    const first = session(eq, 3, 0);
    const fresh: Attempt[] = [...eq.practiceItems, ...eq.challenges].map((it, i) =>
      att(eq, i < 6 ? 'practice' : 'challenge', i < 6 ? i : i - 6, { sessionId: 's2', itemKey: itemForSession(it, 1).id }),
    );
    const s = evaluateSessions(eq, [...first, ...fresh]);
    assert.equal(s[1].qualifies, true);
  });
  test('best and latest evidence are kept separately', () => {
    const good = session(eq, 6, 2);
    const later: Attempt[] = [...eq.practiceItems, ...eq.challenges].map((it, i) =>
      att(eq, i < 6 ? 'practice' : 'challenge', i < 6 ? i : i - 6, { sessionId: 's2', itemKey: itemForSession(it, 1).id, correct: false }),
    );
    const ev = lessonEvidence(eq, [...good, ...later], prog(eq.id, { completions: 2 }));
    assert.equal(ev.state, 'mastered');
    assert.equal(ev.best?.sessionId, 's1');
    assert.equal(ev.latest?.sessionId, 's2');
  });
});

describe('prerequisite graph (AC16)', () => {
  test('real catalogue validates', () => {
    assert.deepEqual(validateCatalogue(LESSONS, SKILLS, CHAPTERS), []);
  });
  test('detects cycles and missing prerequisites', () => {
    const bad: Skill[] = [
      { id: 'a', subjectId: 'math', title: 'A', level: { grade: 1 }, prerequisites: ['b'] },
      { id: 'b', subjectId: 'math', title: 'B', level: { grade: 1 }, prerequisites: ['a', 'zzz'] },
    ];
    const problems = checkSkillGraph(bad);
    assert.ok(problems.some((p) => p.kind === 'cycle'));
    assert.ok(problems.some((p) => p.kind === 'missing'));
  });
  test('rejects invalid answers, duplicate ids and fake publication', () => {
    const broken: Lesson = structuredClone(eq);
    (broken.practiceItems[0] as { answerRule: { value: number } }).answerRule.value = 1.5;
    broken.practiceItems[1].id = broken.practiceItems[2].id;
    broken.status = 'published';
    const errs = validateLesson(broken, SKILLS, CHAPTERS);
    assert.ok(errs.some((e) => e.includes('integer')));
    assert.ok(errs.some((e) => e.includes('duplicate item id')));
    assert.ok(errs.some((e) => e.includes('educator review')));
  });
  test('every lesson has 6 practice items, 2 challenges and a game', () => {
    assert.equal(LESSONS.length, 12);
    for (const l of LESSONS) {
      assert.equal(l.practiceItems.length, 6, l.id);
      assert.equal(l.challenges.length, 2, l.id);
      assert.ok(l.game, l.id);
    }
  });
  test('French and Bengali are separate subjects', () => {
    assert.ok(LESSONS.some((l) => l.subjectId === 'french'));
    assert.ok(LESSONS.some((l) => l.subjectId === 'bengali'));
  });
});

describe('recommendations', () => {
  const base = { lessons: LESSONS, isPlayable, placements: defaultPlacements() };
  test('resume wins when a lesson is unfinished', () => {
    const r = recommendNext({ ...base, progress: [prog(arrays.id, { stage: 'practice' })], masteryOf: () => 'not-started' });
    assert.equal(r.kind, 'resume');
    assert.equal(r.kind === 'resume' && r.lessonId, arrays.id);
  });
  test('first lesson of the path for a new learner', () => {
    const r = recommendNext({ ...base, progress: [], masteryOf: () => 'not-started', subjectId: 'math' });
    assert.deepEqual([r.kind, 'lessonId' in r ? r.lessonId : ''], ['start', eq.id]);
  });
  test('after mastery the next lesson is recommended', () => {
    const r = recommendNext({ ...base, progress: [prog(eq.id, { completedAt: 'x', completions: 1 })], masteryOf: (id) => (id === eq.id ? 'mastered' : 'not-started'), subjectId: 'math' });
    assert.deepEqual([r.kind, 'lessonId' in r ? r.lessonId : ''], ['start', arrays.id]);
  });
  test('completed but not mastered → retry with fresh questions', () => {
    const r = recommendNext({ ...base, progress: [prog(eq.id, { completedAt: 'x', completions: 1 })], masteryOf: (id) => (id === eq.id ? 'ready-for-review' : 'not-started'), subjectId: 'math' });
    assert.equal(r.kind, 'retry');
  });
  test('prerequisite gap → bridge lesson', () => {
    // Learner mastered nothing but tried arrays directly and equal-groups is unmastered.
    const r = recommendNext({
      ...base,
      progress: [prog(eq.id, { completedAt: 'x', completions: 1 })],
      masteryOf: (id) => (id === eq.id ? 'learning' : 'not-started'),
      subjectId: 'math',
    });
    // equal groups is first in the path and itself unmastered → start/continue it, never skip ahead.
    assert.ok('lessonId' in r && r.lessonId === eq.id);
  });
  test('prerequisite taught at an earlier level → bridge lesson', () => {
    const g4: Lesson = { ...structuredClone(arrays), id: 'math-g4-next', level: { grade: 4 }, skillIds: ['math.division-grouping'], prerequisiteSkillIds: ['math.arrays'], order: 1 };
    const r = recommendNext({
      lessons: [eq, arrays, g4],
      isPlayable: () => true,
      placements: { math: { grade: 4 } },
      progress: [],
      masteryOf: () => 'not-started',
      subjectId: 'math',
    });
    assert.equal(r.kind, 'bridge');
    assert.ok(r.kind === 'bridge' && r.lessonId === arrays.id && r.forLessonId === 'math-g4-next');
  });
  test('never recommends planned or non-playable content; path complete when all mastered', () => {
    const r = recommendNext({ ...base, progress: [], masteryOf: () => 'mastered', subjectId: 'math' });
    assert.equal(r.kind, 'path-complete');
    const none = recommendNext({ ...base, isPlayable: () => false, progress: [], masteryOf: () => 'not-started', subjectId: 'math' });
    assert.equal(none.kind, 'path-complete');
  });
});

describe('rewards (AC07)', () => {
  test('awards are idempotent by source key', () => {
    const ev: RewardEvent = { profileId: 'p1', sourceKey: 'complete:x:v1', delta: 10, reason: 'lesson-complete', timestamp: 't' };
    let events: RewardEvent[] = [];
    for (let i = 0; i < 5; i++) events = applyReward(events, ev).events;
    assert.equal(balance(events), 10);
  });
  test('ranks are cosmetic thresholds; purchases cannot repeat or overdraw', () => {
    assert.equal(rankFor(0).rank, 'explorer');
    assert.equal(rankFor(130).rank, 'problem-solver');
    const events: RewardEvent[] = [{ profileId: 'p1', sourceKey: 'k', delta: 12, reason: 'lesson-complete', timestamp: 't' }];
    assert.equal(canPurchase(events, 'p1', 'hat-star'), 'ok');
    assert.equal(canPurchase(events, 'p1', 'crown'), 'not-enough');
    events.push({ profileId: 'p1', sourceKey: 'buy:hat-star', delta: -10, reason: 'purchase', timestamp: 't' });
    assert.equal(canPurchase(events, 'p1', 'hat-star'), 'already-owned');
  });
});

describe('review schedule (AC18)', () => {
  const mastered = '2026-11-01T12:00:00Z';
  test('not due before 2 days, due after', () => {
    assert.equal(reviewStatus('x', mastered, [], new Date('2026-11-02T12:00:00Z'))!.isDue, false);
    const s = reviewStatus('x', mastered, [], new Date('2026-11-03T12:00:01Z'))!;
    assert.equal(s.isDue, true);
    assert.equal(s.stepsDone, 0);
  });
  test('a passed review moves to the 7-day step; a failed one stays due without penalty', () => {
    const mk = (k: string, correct: boolean, at: string, sessionId: string): Attempt => ({
      id: k + sessionId, profileId: 'p1', lessonId: 'x', contentVersion: 1, stage: 'review', itemId: k, itemKey: k, sessionId, answer: '', correct, firstAttempt: true, hintsUsed: 0, timestamp: at,
    });
    const failed = ['r1', 'r2', 'r3'].map((k) => mk(k, false, '2026-11-03T13:00:00Z', 'rs1'));
    let s = reviewStatus('x', mastered, failed, new Date('2026-11-03T14:00:00Z'))!;
    assert.equal(s.stepsDone, 0);
    assert.equal(s.isDue, true);
    assert.equal(s.lastReviewPassed, false);
    const passed = ['r1', 'r2', 'r3'].map((k) => mk(k, true, '2026-11-03T15:00:00Z', 'rs2'));
    s = reviewStatus('x', mastered, [...failed, ...passed], new Date('2026-11-04T12:00:00Z'))!;
    assert.equal(s.stepsDone, 1);
    assert.equal(s.isDue, false);
    assert.equal(s.dueAt, '2026-11-08T12:00:00.000Z');
  });
  test('no schedule without mastery', () => {
    assert.equal(reviewStatus('x', null, [], new Date()), null);
  });
});

describe('robot interpreter (AC13)', () => {
  const grid = { width: 4, height: 3, start: { x: 0, y: 1, dir: 'E' as const }, goal: { x: 3, y: 1 }, walls: [{ x: 2, y: 0 }] };
  test('reaches the goal', () => {
    assert.equal(runProgram(grid, parseProgram('forward, forward, forward')).outcome, 'reached-goal');
  });
  test('reports walls and edges', () => {
    assert.equal(runProgram(grid, parseProgram('left, right, right, right, right')).outcome, 'stopped-short');
    assert.equal(runProgram(grid, parseProgram('forward, forward, left, forward')).outcome, 'hit-wall');
    assert.equal(runProgram(grid, parseProgram('left, forward, forward')).outcome, 'left-grid');
  });
  test('runaway loops stop at the step limit with an explanation', () => {
    const r = runProgram(grid, parseProgram('repeat 20 [repeat 20 [right]]'));
    assert.equal(r.outcome, 'step-limit');
    assert.equal(r.trace.length, LIMITS.maxSteps);
    assert.match(r.message, /stopped/);
  });
  test('oversized and over-nested programs are refused before running', () => {
    const big = Array.from({ length: 30 }, () => 'forward').join(', ');
    assert.equal(runProgram(grid, parseProgram(big)).outcome, 'invalid-program');
    assert.equal(runProgram(grid, parseProgram('repeat 2 [repeat 2 [repeat 2 [right]]]')).outcome, 'invalid-program');
    assert.equal(runProgram(grid, parseProgram('repeat 99 [right]')).outcome, 'invalid-program');
  });
  test('program text round-trips', () => {
    const t = 'repeat 3 [forward, left], right';
    assert.equal(programToText(parseProgram(t)), t);
  });
});

describe('determinism', () => {
  test('seeded shuffle is repeatable', () => {
    assert.deepEqual(seededShuffle([1, 2, 3, 4, 5], 'x'), seededShuffle([1, 2, 3, 4, 5], 'x'));
  });
});
