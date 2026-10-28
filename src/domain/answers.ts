// Pure answer evaluation. Answers are stored as strings:
//   numeric -> "12"; choice -> "optA" (or "a,b" for multi); order -> "w1|w2|w3"; robot -> program text.

import type { Item } from './types.ts';
import { parseProgram, runProgram, usesRepeat, countBlocks } from './robot.ts';

export interface Evaluation {
  correct: boolean;
  /** Optional specific feedback (e.g. robot outcome) to show alongside the explanation. */
  detail?: string;
}

export function normalizeInteger(raw: string): number | null {
  const s = raw.trim().replace(/[০-৯]/g, (d) => String(d.charCodeAt(0) - 0x09e6));
  if (!/^-?\d+$/.test(s)) return null;
  return Number(s);
}

export function evaluate(item: Item, answer: string): Evaluation {
  switch (item.type) {
    case 'numeric': {
      const n = normalizeInteger(answer);
      if (n === null) return { correct: false, detail: 'Type a whole number.' };
      return { correct: n === item.answerRule.value };
    }
    case 'choice': {
      const chosen = answer.split(',').filter(Boolean).sort();
      const want = [...item.answerRule.correctOptionIds].sort();
      return { correct: chosen.length === want.length && chosen.every((c, i) => c === want[i]) };
    }
    case 'order': {
      const ids = answer.split('|').filter(Boolean);
      // Compare by token text so identical tokens (e.g. two "the") are interchangeable.
      const textOf = (id: string) => item.tokens.find((t) => t.id === id)?.text ?? `?${id}`;
      const got = ids.map(textOf);
      const ok = item.answerRule.accepted.some((acc) => acc.length === got.length && acc.every((id, i) => textOf(id) === got[i]));
      if (!ok && ids.length < item.tokens.length) return { correct: false, detail: 'Use every piece before checking.' };
      return { correct: ok };
    }
    case 'robot': {
      let program;
      try {
        program = parseProgram(answer);
      } catch {
        return { correct: false, detail: 'The program could not be read.' };
      }
      const result = runProgram(item.grid, program);
      if (result.outcome !== 'reached-goal') return { correct: false, detail: result.message };
      if (item.answerRule.requireRepeat && !usesRepeat(program))
        return { correct: false, detail: 'The robot made it! This task asks you to use a repeat block.' };
      if (item.answerRule.maxBlocks && countBlocks(program) > item.answerRule.maxBlocks)
        return {
          correct: false,
          detail: `The robot made it, but use ${item.answerRule.maxBlocks} blocks or fewer. A repeat block can help.`,
        };
      return { correct: true, detail: result.message };
    }
  }
}

/** Pick the concrete version of an item for an assessment session. */
export function itemForSession(item: Item, sessionNumber: number): Item {
  const versions = [item, ...(item.variants ?? [])];
  return versions[sessionNumber % versions.length];
}

/** Shared by the Sentence Workshop game: does an id sequence match an accepted order (by text)? */
export function orderMatches(tokens: { id: string; text: string }[], accepted: string[][], ids: string[]): boolean {
  const textOf = (id: string) => tokens.find((t) => t.id === id)?.text ?? `?${id}`;
  const got = ids.map(textOf);
  return accepted.some((acc) => acc.length === got.length && acc.every((id, i) => textOf(id) === got[i]));
}
