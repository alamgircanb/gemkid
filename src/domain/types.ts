// Core content and progress types for KidGem.
// Content types form a discriminated union validated by src/content/validate.ts.

export type SubjectId =
  | 'math'
  | 'logic'
  | 'coding'
  | 'algorithms'
  | 'english'
  | 'french'
  | 'bengali';

/** Release grouping used on the home page. French and Bengali stay separate subjects. */
export type TrackId = 'math' | 'logic' | 'coding' | 'algorithms' | 'english' | 'languages';

export type ProficiencyStage = 'beginner' | 'developing' | 'confident';

export type Level = { grade: number } | { stage: ProficiencyStage };

export type LessonStatus = 'draft' | 'in-review' | 'published' | 'retired';

export type LangTag = 'en' | 'fr' | 'bn';

/** Text that may be in a language other than the lesson's content locale. */
export interface Txt {
  text: string;
  lang?: LangTag;
}

// ---------- Answer rules ----------
export type AnswerRule =
  | { kind: 'integer'; value: number }
  | { kind: 'choice'; correctOptionIds: string[] }
  | { kind: 'order'; accepted: string[][] }
  | { kind: 'robotGoal'; maxBlocks?: number; requireRepeat?: boolean };

export interface ChoiceOption {
  id: string;
  text: string;
  lang?: LangTag;
  /** Optional decorative symbol shown before the text. Never the only cue. */
  symbol?: string;
  /** Shape id rendered as an accessible SVG (pattern items). */
  shape?: ShapeId;
}

export type ShapeId = 'circle' | 'triangle' | 'square' | 'star' | 'diamond' | 'heart';

export interface OrderToken {
  id: string;
  text: string;
  lang?: LangTag;
}

export type Dir = 'N' | 'E' | 'S' | 'W';

export interface RobotGrid {
  width: number;
  height: number;
  start: { x: number; y: number; dir: Dir };
  goal: { x: number; y: number };
  walls: { x: number; y: number }[];
}

/** Visual aids shown with an item prompt. */
export type ItemVisual =
  | { type: 'groups'; groups: number; itemsPerGroup: number; altText: string }
  | { type: 'array'; rows: number; cols: number; altText: string }
  | { type: 'pattern'; sequence: (ShapeId | null)[]; altText: string }
  | { type: 'passage'; title: string; paragraphs: string[]; lang?: LangTag }
  | { type: 'boxes'; boxes: { label: string; contents: string }[]; altText: string }
  | { type: 'letter'; glyph: string; lang: LangTag; altText: string };

interface ItemBase {
  id: string;
  prompt: string;
  promptLang?: LangTag;
  visual?: ItemVisual;
  explanation: string;
  misconceptionTag: string;
  /** Ordered hints. The last hint may be a full worked solution. */
  hints: string[];
  /** Alternative versions with their own IDs, used for fresh assessment sets. */
  variants?: Item[];
}

export interface NumericItem extends ItemBase {
  type: 'numeric';
  answerRule: { kind: 'integer'; value: number };
}
export interface ChoiceItem extends ItemBase {
  type: 'choice';
  options: ChoiceOption[];
  answerRule: { kind: 'choice'; correctOptionIds: string[] };
}
export interface OrderItem extends ItemBase {
  type: 'order';
  tokens: OrderToken[];
  /** 'words' renders inline as a sentence; 'steps' renders as a vertical list. */
  layout: 'words' | 'steps';
  answerRule: { kind: 'order'; accepted: string[][] };
}
export interface RobotItem extends ItemBase {
  type: 'robot';
  grid: RobotGrid;
  allowRepeat: boolean;
  answerRule: { kind: 'robotGoal'; maxBlocks?: number; requireRepeat?: boolean };
  /** A known-good program used by content validation; never shown as the answer key. */
  reference: string;
}

export type Item = NumericItem | ChoiceItem | OrderItem | RobotItem;

export type ConceptBlock =
  | { type: 'text'; text: string; lang?: LangTag }
  | { type: 'example'; title: string; steps: string[] }
  | { type: 'visual'; visual: ItemVisual }
  | { type: 'vocab'; entries: { term: string; lang: LangTag; meaning: string; note?: string; symbol?: string }[] };

// ---------- Games ----------
export type GameConfig =
  | {
      type: 'gem-groups';
      mode: 'groups' | 'array';
      rounds: { groups: number; itemsPerGroup: number }[];
    }
  | {
      type: 'pattern-bridge';
      rounds: { sequence: (ShapeId | null)[]; options: ShapeId[]; answer: ShapeId; unit: number }[];
    }
  | { type: 'robot-route'; allowRepeat: boolean; levels: RobotGrid[] }
  | {
      type: 'treasure-search';
      mode: 'linear';
      rounds: { items: string[]; target: string }[];
    }
  | {
      type: 'treasure-search';
      mode: 'clues';
      rounds: {
        boxes: { id: string; label: string; colour: string; shape: ShapeId; size: 'big' | 'small' }[];
        clues: string[];
        answerId: string;
        explanation: string;
      }[];
    }
  | {
      type: 'sentence-workshop';
      layout: 'words' | 'steps';
      rounds: { tokens: OrderToken[]; accepted: string[][]; explanation: string }[];
    }
  | {
      type: 'word-garden';
      rounds: {
        pairs: { left: Txt & { symbol?: string }; right: Txt & { symbol?: string }; why: string }[];
      }[];
    };

export type GameType = GameConfig['type'];

export interface Reflection {
  type: 'choice';
  prompt: string;
  options: { id: string; text: string }[];
  correctOptionIds: string[];
  explanation: string;
}

export interface AudioRef {
  lang: LangTag;
  src: string;
  transcript: string;
  license: string;
  reviewStatus: 'unreviewed' | 'reviewed';
}

export interface ReviewRecord {
  educator: string | null;
  languageReviewer: string | null;
  reviewedAt: string | null;
}

export interface Lesson {
  schemaVersion: 1;
  id: string;
  subjectId: SubjectId;
  level: Level;
  chapterId: string;
  order: number;
  skillIds: string[];
  prerequisiteSkillIds: string[];
  title: string;
  objective: string;
  contentLocale: LangTag;
  estimatedMinutes: number;
  status: LessonStatus;
  contentVersion: number;
  review: ReviewRecord;
  conceptBlocks: ConceptBlock[];
  guidedTasks: Item[];
  game: GameConfig;
  practiceItems: Item[];
  challenges: Item[];
  reflection: Reflection;
  audio: AudioRef | null;
  /** Suggested offline follow-up activity for families. */
  offlineActivity: string;
}

export interface Skill {
  id: string;
  subjectId: SubjectId;
  title: string;
  level: Level;
  prerequisites: string[];
  misconceptions?: string[];
}

export interface Chapter {
  id: string;
  subjectId: SubjectId;
  level: Level;
  title: string;
  usefulSkill: string;
  order: number;
  /** 'available' chapters contain playable lessons; 'planned' chapters are future coverage only. */
  availability: 'available' | 'planned';
  plannedTopics?: string[];
}

// ---------- Learner records ----------
export type StageId = 'discover' | 'guided' | 'play' | 'practice' | 'challenge' | 'reflect' | 'summary';
export const STAGES: StageId[] = ['discover', 'guided', 'play', 'practice', 'challenge', 'reflect', 'summary'];

export type AvatarId = 'lumi' | 'ruby' | 'jade' | 'topaz' | 'sapphire' | 'amethyst';
export type ThemeMode = 'auto' | 'younger' | 'older';
export type MotionPref = 'system' | 'reduce' | 'full';

export interface Preferences {
  uiLocale: LangTag;
  theme: ThemeMode;
  sound: boolean;
  motion: MotionPref;
  highContrast: boolean;
  textScale: 1 | 1.15 | 1.3;
}

export interface PlacementChange {
  subjectId: SubjectId;
  from: Level | null;
  to: Level;
  at: string;
  by: 'learner-setup' | 'parent';
}

export interface Profile {
  id: string;
  nickname: string;
  avatar: AvatarId;
  grade: number;
  placements: Partial<Record<SubjectId, Level>>;
  placementHistory: PlacementChange[];
  prefs: Preferences;
  equipped: string[];
  createdAt: string;
  schemaVersion: 1;
}

export interface LessonProgress {
  profileId: string;
  lessonId: string;
  contentVersion: number;
  stage: StageId;
  /** Index within the current stage's items. */
  itemIndex: number;
  /** True once the current item was answered correctly or revealed (resume moves on). */
  itemDone?: boolean;
  /** Current assessment session; changes on "try a fresh set". */
  sessionId: string;
  /** Number of assessment sessions started; selects item variants. */
  sessionNumber: number;
  gameCompleted: boolean;
  gameSkipped: boolean;
  reflectionChoice: string | null;
  startedAt: string;
  updatedAt: string;
  completedAt: string | null;
  completions: number;
}

export interface Attempt {
  id: string;
  profileId: string;
  lessonId: string;
  contentVersion: number;
  stage: 'guided' | 'practice' | 'challenge' | 'review';
  /** Base item id (stable across variants). */
  itemId: string;
  /** Concrete id of the version shown (item id or variant id). */
  itemKey: string;
  sessionId: string;
  answer: string;
  correct: boolean;
  /** True if this was the first submission for this item key in this session. */
  firstAttempt: boolean;
  hintsUsed: number;
  timestamp: string;
}

export interface RewardEvent {
  profileId: string;
  sourceKey: string;
  delta: number;
  reason: 'lesson-complete' | 'mastery' | 'review' | 'purchase';
  timestamp: string;
}

export type MasteryState = 'not-started' | 'learning' | 'ready-for-review' | 'mastered';
