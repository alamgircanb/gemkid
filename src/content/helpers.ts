// Small authoring helpers so lesson files stay readable.
import type { ChoiceItem, ChoiceOption, Item, ItemVisual, NumericItem, OrderItem, OrderToken, RobotGrid, RobotItem, LangTag } from '../domain/types.ts';

interface Common {
  explanation: string;
  tag: string;
  hints: string[];
  visual?: ItemVisual;
  variants?: Item[];
  promptLang?: LangTag;
}

export function numeric(id: string, prompt: string, value: number, c: Common): NumericItem {
  return {
    id,
    type: 'numeric',
    prompt,
    promptLang: c.promptLang,
    visual: c.visual,
    answerRule: { kind: 'integer', value },
    explanation: c.explanation,
    misconceptionTag: c.tag,
    hints: c.hints,
    variants: c.variants,
  };
}

export function choice(id: string, prompt: string, options: ChoiceOption[], correct: string | string[], c: Common): ChoiceItem {
  return {
    id,
    type: 'choice',
    prompt,
    promptLang: c.promptLang,
    visual: c.visual,
    options,
    answerRule: { kind: 'choice', correctOptionIds: Array.isArray(correct) ? correct : [correct] },
    explanation: c.explanation,
    misconceptionTag: c.tag,
    hints: c.hints,
    variants: c.variants,
  };
}

/** Options from plain strings; ids are a, b, c… */
export function opts(...texts: (string | { text: string; lang?: LangTag; symbol?: string })[]): ChoiceOption[] {
  return texts.map((t, i) => ({ id: String.fromCharCode(97 + i), ...(typeof t === 'string' ? { text: t } : t) }));
}

/** Tokens from words; ids are w1, w2… in the given (correct) order. */
export function words(sentence: string[], lang?: LangTag): OrderToken[] {
  return sentence.map((text, i) => ({ id: `w${i + 1}`, text, lang }));
}

export function order(
  id: string,
  prompt: string,
  tokens: OrderToken[],
  layout: 'words' | 'steps',
  accepted: string[][] | null,
  c: Common,
): OrderItem {
  return {
    id,
    type: 'order',
    prompt,
    tokens,
    layout,
    answerRule: { kind: 'order', accepted: accepted ?? [tokens.map((t) => t.id)] },
    explanation: c.explanation,
    misconceptionTag: c.tag,
    hints: c.hints,
    visual: c.visual,
    variants: c.variants,
  };
}

export function robot(
  id: string,
  prompt: string,
  grid: RobotGrid,
  reference: string,
  rule: { allowRepeat?: boolean; maxBlocks?: number; requireRepeat?: boolean },
  c: Common,
): RobotItem {
  return {
    id,
    type: 'robot',
    prompt,
    grid,
    reference,
    allowRepeat: rule.allowRepeat ?? false,
    answerRule: { kind: 'robotGoal', maxBlocks: rule.maxBlocks, requireRepeat: rule.requireRepeat },
    explanation: c.explanation,
    misconceptionTag: c.tag,
    hints: c.hints,
    variants: c.variants,
  };
}

export const NO_REVIEW = { educator: null, languageReviewer: null, reviewedAt: null };
