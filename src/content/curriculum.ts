// Proposed GemKid skills sequence (not an official curriculum).
import type { Chapter, Lesson, Skill, SubjectId, TrackId, Level } from '../domain/types.ts';
import { equalGroups, arrays } from './lessons/math.ts';
import { patterns, deduction } from './lessons/logic.ts';
import { sequences, loops } from './lessons/coding.ts';
import { stepOrder, linearSearch } from './lessons/algorithms.ts';
import { sentenceOrder, comprehension } from './lessons/english.ts';
import { frenchGreetings, bengaliLetters } from './lessons/languages.ts';

export const SUBJECTS: { id: SubjectId; track: TrackId; levelKind: 'grade' | 'stage'; icon: string }[] = [
  { id: 'math', track: 'math', levelKind: 'grade', icon: '➗' },
  { id: 'logic', track: 'logic', levelKind: 'stage', icon: '🧩' },
  { id: 'coding', track: 'coding', levelKind: 'stage', icon: '🤖' },
  { id: 'algorithms', track: 'algorithms', levelKind: 'stage', icon: '🔎' },
  { id: 'english', track: 'english', levelKind: 'grade', icon: '📖' },
  { id: 'french', track: 'languages', levelKind: 'stage', icon: 'Fr' },
  { id: 'bengali', track: 'languages', levelKind: 'stage', icon: 'অ' },
];

export const LESSONS: Lesson[] = [
  equalGroups,
  arrays,
  patterns,
  deduction,
  sequences,
  loops,
  stepOrder,
  linearSearch,
  sentenceOrder,
  comprehension,
  frenchGreetings,
  bengaliLetters,
];

export const SKILLS: Skill[] = [
  // Foundations assumed by placement in this demo (no lessons yet).
  { id: 'math.count-objects', subjectId: 'math', title: 'Count objects', level: { grade: 1 }, prerequisites: [] },
  { id: 'math.repeated-addition', subjectId: 'math', title: 'Repeated addition', level: { grade: 2 }, prerequisites: ['math.count-objects'] },
  { id: 'math.equal-groups', subjectId: 'math', title: 'Equal groups', level: { grade: 3 }, prerequisites: ['math.count-objects', 'math.repeated-addition'], misconceptions: ['adds-group-count-to-group-size'] },
  { id: 'math.arrays', subjectId: 'math', title: 'Multiplication arrays', level: { grade: 3 }, prerequisites: ['math.equal-groups'], misconceptions: ['adds-rows-and-columns'] },
  { id: 'math.division-grouping', subjectId: 'math', title: 'Division as grouping', level: { grade: 3 }, prerequisites: ['math.arrays'] },
  { id: 'logic.matching-sorting', subjectId: 'logic', title: 'Matching and sorting', level: { stage: 'beginner' }, prerequisites: [] },
  { id: 'logic.repeating-patterns', subjectId: 'logic', title: 'Repeating patterns', level: { stage: 'beginner' }, prerequisites: ['logic.matching-sorting'] },
  { id: 'logic.deduction', subjectId: 'logic', title: 'Deduction with clues', level: { stage: 'beginner' }, prerequisites: ['logic.matching-sorting'] },
  { id: 'coding.directions', subjectId: 'coding', title: 'Direction words', level: { stage: 'beginner' }, prerequisites: [] },
  { id: 'coding.sequences', subjectId: 'coding', title: 'Command sequences', level: { stage: 'beginner' }, prerequisites: ['coding.directions'] },
  { id: 'coding.loops', subjectId: 'coding', title: 'Repeat loops', level: { stage: 'beginner' }, prerequisites: ['coding.sequences'] },
  { id: 'algorithms.everyday-sequences', subjectId: 'algorithms', title: 'Everyday sequences', level: { stage: 'beginner' }, prerequisites: [] },
  { id: 'algorithms.step-order', subjectId: 'algorithms', title: 'Ordering algorithm steps', level: { stage: 'beginner' }, prerequisites: ['algorithms.everyday-sequences'] },
  { id: 'algorithms.linear-search', subjectId: 'algorithms', title: 'Linear search', level: { stage: 'beginner' }, prerequisites: ['algorithms.step-order'] },
  { id: 'english.simple-sentences', subjectId: 'english', title: 'Simple sentences', level: { grade: 2 }, prerequisites: [] },
  { id: 'english.sentence-order', subjectId: 'english', title: 'Sentence order', level: { grade: 3 }, prerequisites: ['english.simple-sentences'] },
  { id: 'english.passage-comprehension', subjectId: 'english', title: 'Short passage comprehension', level: { grade: 3 }, prerequisites: ['english.sentence-order'] },
  { id: 'french.greetings', subjectId: 'french', title: 'Greetings and polite words', level: { stage: 'beginner' }, prerequisites: [] },
  { id: 'bengali.first-letters', subjectId: 'bengali', title: 'First letters অ আ ই ক', level: { stage: 'beginner' }, prerequisites: [] },
];

const avail = (id: string, subjectId: SubjectId, level: Level, title: string, usefulSkill: string, order: number): Chapter => ({
  id,
  subjectId,
  level,
  title,
  usefulSkill,
  order,
  availability: 'available',
});

const planned = (subjectId: SubjectId, grade: number, topics: string[], order: number): Chapter => ({
  id: `${subjectId}-g${grade}-planned`,
  subjectId,
  level: { grade },
  title: topics.join(', '),
  usefulSkill: '',
  order,
  availability: 'planned',
  plannedTopics: topics,
});

const plannedStage = (subjectId: SubjectId, stage: 'developing' | 'confident', topics: string[], order: number): Chapter => ({
  id: `${subjectId}-${stage}-planned`,
  subjectId,
  level: { stage },
  title: topics.join(', '),
  usefulSkill: '',
  order,
  availability: 'planned',
  plannedTopics: topics,
});

// Planned coverage follows document 03. It is future work, not playable content.
const MATH_PLAN: Record<number, string[]> = {
  1: ['Counting', 'Comparing', 'Addition and subtraction with objects', 'Shapes'],
  2: ['Place value', 'Regrouping foundations', 'Time', 'Measurement'],
  3: ['Division', 'Fraction models'],
  4: ['Equivalent fractions', 'Decimals introduction', 'Area and perimeter'],
  5: ['Fraction operations', 'Decimals', 'Volume', 'Data'],
  6: ['Ratios', 'Percentages', 'Integers', 'Expressions'],
  7: ['Proportions', 'Equations', 'Geometry', 'Probability'],
  8: ['Linear relationships', 'Exponents', 'Transformations', 'Statistics'],
};
const ENGLISH_PLAN: Record<number, string[]> = {
  1: ['Sound-letter links'],
  2: ['Simple sentences'],
  3: ['Longer passages'],
  4: ['Paragraphs', 'Grammar in context'],
  5: ['Summaries', 'Vocabulary strategies', 'Longer stories'],
  6: ['Inference', 'Structured writing'],
  7: ['Evidence-based reading', 'Revision', 'Narration'],
  8: ['Analytical reading', 'Extended writing', 'Presentations'],
};

export const CHAPTERS: Chapter[] = [
  avail('math-g3-multiplication', 'math', { grade: 3 }, 'Multiplication with equal groups', 'Find totals quickly by grouping instead of counting one by one.', 30),
  ...Object.entries(MATH_PLAN).map(([g, t]) => planned('math', Number(g), t, Number(g) * 10 + (Number(g) === 3 ? 5 : 0))),
  avail('logic-b-patterns', 'logic', { stage: 'beginner' }, 'Patterns', 'Spot what repeats and predict what comes next.', 1),
  avail('logic-b-reasoning', 'logic', { stage: 'beginner' }, 'Clues and deduction', 'Use clues to rule things out, like a detective.', 2),
  plannedStage('logic', 'developing', ['Classification', 'Spatial puzzles', 'Multistep clues', 'Reasoning with tables'], 3),
  plannedStage('logic', 'confident', ['Constraint puzzles', 'Counterexamples', 'Logic statements', 'Strategy comparison'], 4),
  avail('coding-b-robot-basics', 'coding', { stage: 'beginner' }, 'Robot basics', 'Give clear step-by-step instructions and fix mistakes.', 1),
  plannedStage('coding', 'developing', ['Conditions', 'Inputs', 'Variables', 'Events', 'Functions'], 2),
  plannedStage('coding', 'confident', ['Block-to-text transition', 'Lists', 'Decomposition and testing', 'Integrated projects'], 3),
  avail('algorithms-b-everyday', 'algorithms', { stage: 'beginner' }, 'Everyday algorithms', 'Plan steps in an order that works.', 1),
  avail('algorithms-b-searching', 'algorithms', { stage: 'beginner' }, 'Searching', 'Find things in a list and count the work it takes.', 2),
  plannedStage('algorithms', 'developing', ['Algorithm tracing', 'Sorting models', 'Search comparisons'], 3),
  plannedStage('algorithms', 'confident', ['Selection sort', 'Search and sort trade-offs', 'Introductory efficiency'], 4),
  avail('english-g3-sentences', 'english', { grade: 3 }, 'Building sentences', 'Write sentences other people can read easily.', 30),
  avail('english-g3-reading', 'english', { grade: 3 }, 'Reading short passages', 'Find answers and clues in what you read.', 31),
  ...Object.entries(ENGLISH_PLAN).map(([g, t]) => planned('english', Number(g), t, Number(g) * 10 + (Number(g) === 3 ? 5 : 0))),
  avail('french-b-hello', 'french', { stage: 'beginner' }, 'Hello in French', 'Greet people politely in French.', 1),
  plannedStage('french', 'developing', ['Familiar words', 'Numbers and colours', 'Simple questions'], 2),
  plannedStage('french', 'confident', ['Supported conversations', 'Short reading', 'Purposeful dialogue'], 3),
  avail('bengali-b-first-letters', 'bengali', { stage: 'beginner' }, 'First letters', 'Recognise Bengali letters and words that start with them.', 1),
  plannedStage('bengali', 'developing', ['More vowels and consonants', 'Vowel signs', 'Simple words'], 2),
  plannedStage('bengali', 'confident', ['Reading short sentences', 'Graded stories', 'Conversation'], 3),
];

export function chapterById(id: string): Chapter | undefined {
  return CHAPTERS.find((c) => c.id === id);
}

export function lessonById(id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id);
}

export function lessonsInChapter(chapterId: string): Lesson[] {
  return LESSONS.filter((l) => l.chapterId === chapterId).sort((a, b) => a.order - b.order);
}

export function skillById(id: string): Skill | undefined {
  return SKILLS.find((s) => s.id === id);
}

/** Demo build plays draft lessons with clear labels; production would allow only 'published'. */
export const DEMO_MODE = true;
export function isPlayable(l: Lesson): boolean {
  return l.status === 'published' || (DEMO_MODE && l.status === 'draft');
}

/** Default subject placements for a new demo profile (where demo lessons exist). */
export function defaultPlacements(): Partial<Record<SubjectId, Level>> {
  return {
    math: { grade: 3 },
    logic: { stage: 'beginner' },
    coding: { stage: 'beginner' },
    algorithms: { stage: 'beginner' },
    english: { grade: 3 },
    french: { stage: 'beginner' },
    bengali: { stage: 'beginner' },
  };
}

export function levelsFor(subjectId: SubjectId): Level[] {
  const kind = SUBJECTS.find((s) => s.id === subjectId)!.levelKind;
  return kind === 'grade'
    ? [1, 2, 3, 4, 5, 6, 7, 8].map((grade) => ({ grade }))
    : (['beginner', 'developing', 'confident'] as const).map((stage) => ({ stage }));
}
