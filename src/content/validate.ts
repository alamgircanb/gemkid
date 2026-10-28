// Runtime content validation: schema shape, answer rules, IDs, game solvability,
// prerequisite graph and honest review status. Used by tests and `npm run validate`.

import type { Chapter, GameConfig, Item, Lesson, Skill } from '../domain/types.ts';
import { checkSkillGraph } from '../domain/graph.ts';
import { evaluate } from '../domain/answers.ts';
import { isSolvable, parseProgram, validateProgram } from '../domain/robot.ts';

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isStr = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0;

export function validateItem(item: unknown, where: string, seen: Set<string>): string[] {
  const e: string[] = [];
  if (!isObj(item)) return [`${where}: item is not an object`];
  const id = item.id;
  if (!isStr(id)) e.push(`${where}: missing id`);
  else if (seen.has(id)) e.push(`${where}: duplicate item id ${id}`);
  else seen.add(id);
  for (const f of ['prompt', 'explanation', 'misconceptionTag']) if (!isStr(item[f])) e.push(`${where} ${String(id)}: missing ${f}`);
  if (!Array.isArray(item.hints) || item.hints.length < 1 || !item.hints.every(isStr)) e.push(`${where} ${String(id)}: needs at least one hint`);
  const rule = item.answerRule;
  if (!isObj(rule)) return [...e, `${where} ${String(id)}: missing answerRule`];
  const it = item as unknown as Item;
  switch (item.type) {
    case 'numeric':
      if (rule.kind !== 'integer' || !Number.isInteger(rule.value)) e.push(`${where} ${id}: numeric item needs integer answer`);
      else if (!evaluate(it, String(rule.value)).correct) e.push(`${where} ${id}: answer does not evaluate as correct`);
      break;
    case 'choice': {
      const options = Array.isArray(item.options) ? (item.options as { id: string; text: string }[]) : [];
      if (options.length < 2) e.push(`${where} ${id}: choice needs 2+ options`);
      const oids = new Set(options.map((o) => o.id));
      if (oids.size !== options.length) e.push(`${where} ${id}: duplicate option ids`);
      if (new Set(options.map((o) => o.text)).size !== options.length) e.push(`${where} ${id}: duplicate option text`);
      const correct = rule.correctOptionIds;
      if (rule.kind !== 'choice' || !Array.isArray(correct) || correct.length === 0 || !correct.every((c) => oids.has(c as string)))
        e.push(`${where} ${id}: correct option ids must exist`);
      break;
    }
    case 'order': {
      const tokens = Array.isArray(item.tokens) ? (item.tokens as { id: string; text: string }[]) : [];
      const tids = tokens.map((t) => t.id).sort().join(',');
      if (rule.kind !== 'order' || !Array.isArray(rule.accepted) || rule.accepted.length === 0)
        e.push(`${where} ${id}: order item needs accepted orders`);
      else
        for (const acc of rule.accepted as string[][])
          if ([...acc].sort().join(',') !== tids) e.push(`${where} ${id}: accepted order must use every token exactly once`);
      if (!['words', 'steps'].includes(item.layout as string)) e.push(`${where} ${id}: layout must be words or steps`);
      break;
    }
    case 'robot': {
      const r = it.type === 'robot' ? it : null;
      if (!r) break;
      if (!isSolvable(r.grid)) e.push(`${where} ${id}: grid goal is unreachable`);
      try {
        const p = parseProgram(r.reference);
        const invalid = validateProgram(p);
        if (invalid) e.push(`${where} ${id}: reference program invalid: ${invalid}`);
        if (!r.allowRepeat && p.some((b) => b.op === 'repeat')) e.push(`${where} ${id}: reference uses repeat but item disallows it`);
        const ev = evaluate(r, r.reference);
        if (!ev.correct) e.push(`${where} ${id}: reference program does not satisfy rule (${ev.detail ?? ''})`);
      } catch (err) {
        e.push(`${where} ${id}: reference program unparsable (${String(err)})`);
      }
      break;
    }
    default:
      e.push(`${where} ${String(id)}: unknown item type ${String(item.type)}`);
  }
  if (Array.isArray(item.variants)) {
    for (const v of item.variants as unknown[]) {
      e.push(...validateItem(v, `${where} variant of ${String(id)}`, seen));
      if (isObj(v) && v.type !== item.type) e.push(`${where} ${String(id)}: variant type must match`);
    }
  }
  return e;
}

export function validateGame(g: GameConfig, where: string): string[] {
  const e: string[] = [];
  switch (g.type) {
    case 'gem-groups':
      if (!g.rounds.length) e.push(`${where}: no rounds`);
      for (const r of g.rounds) if (r.groups < 1 || r.groups > 6 || r.itemsPerGroup < 1 || r.itemsPerGroup > 8) e.push(`${where}: round out of bounds`);
      break;
    case 'pattern-bridge':
      for (const r of g.rounds) {
        const gap = r.sequence.indexOf(null);
        if (gap < 0 || r.sequence.filter((s) => s === null).length !== 1) e.push(`${where}: pattern needs exactly one gap`);
        if (!r.options.includes(r.answer)) e.push(`${where}: pattern answer missing from options`);
        // The answer must agree with the repeating unit.
        const full = r.sequence.map((s, i) => (i === gap ? r.answer : s));
        for (let i = r.unit; i < full.length; i++) if (full[i] !== full[i - r.unit]) e.push(`${where}: pattern does not repeat with unit ${r.unit}`);
      }
      break;
    case 'robot-route':
      for (const lv of g.levels) if (!isSolvable(lv)) e.push(`${where}: robot level unreachable`);
      break;
    case 'treasure-search':
      if (g.mode === 'linear') {
        for (const r of g.rounds) if (!r.items.includes(r.target) || new Set(r.items).size !== r.items.length) e.push(`${where}: search target must appear once`);
      } else {
        for (const r of g.rounds) if (!r.boxes.some((b) => b.id === r.answerId)) e.push(`${where}: clue answer missing`);
      }
      break;
    case 'sentence-workshop':
      for (const r of g.rounds) {
        const ids = r.tokens.map((t) => t.id).sort().join(',');
        for (const acc of r.accepted) if ([...acc].sort().join(',') !== ids) e.push(`${where}: accepted order must use every token`);
      }
      break;
    case 'word-garden':
      for (const r of g.rounds) {
        if (r.pairs.length < 2) e.push(`${where}: need 2+ pairs`);
        if (new Set(r.pairs.map((p) => p.left.text)).size !== r.pairs.length) e.push(`${where}: duplicate left items`);
        if (new Set(r.pairs.map((p) => p.right.text)).size !== r.pairs.length) e.push(`${where}: duplicate right items`);
      }
      break;
  }
  return e;
}

export function validateLesson(l: Lesson, skills: Skill[], chapters: Chapter[]): string[] {
  const e: string[] = [];
  const w = `lesson ${l.id}`;
  if (l.schemaVersion !== 1) e.push(`${w}: unsupported schemaVersion`);
  for (const f of ['id', 'title', 'objective', 'offlineActivity'] as const) if (!isStr(l[f])) e.push(`${w}: missing ${f}`);
  if (!chapters.some((c) => c.id === l.chapterId && c.availability === 'available')) e.push(`${w}: chapter ${l.chapterId} missing or not available`);
  const skillIds = new Set(skills.map((s) => s.id));
  for (const s of [...l.skillIds, ...l.prerequisiteSkillIds]) if (!skillIds.has(s)) e.push(`${w}: unknown skill ${s}`);
  if (l.skillIds.some((s) => l.prerequisiteSkillIds.includes(s))) e.push(`${w}: a lesson cannot require its own skill`);
  if (!Number.isInteger(l.contentVersion) || l.contentVersion < 1) e.push(`${w}: contentVersion must be a positive integer`);
  if (l.status === 'published' && (!l.review.educator || !l.review.reviewedAt)) e.push(`${w}: published lessons require a recorded educator review`);
  if ((l.subjectId === 'french' || l.subjectId === 'bengali') && l.status === 'published' && !l.review.languageReviewer)
    e.push(`${w}: published language lessons require a fluent language reviewer`);
  if (l.conceptBlocks.length < 1) e.push(`${w}: needs a concept explanation`);
  if (l.guidedTasks.length < 2) e.push(`${w}: needs 2 guided tasks`);
  if (l.practiceItems.length !== 6) e.push(`${w}: needs exactly 6 practice items`);
  if (l.challenges.length !== 2) e.push(`${w}: needs exactly 2 challenges`);
  const seen = new Set<string>();
  l.guidedTasks.forEach((it) => e.push(...validateItem(it, `${w} guided`, seen)));
  l.practiceItems.forEach((it) => e.push(...validateItem(it, `${w} practice`, seen)));
  l.challenges.forEach((it) => e.push(...validateItem(it, `${w} challenge`, seen)));
  e.push(...validateGame(l.game, `${w} game`));
  const r = l.reflection;
  if (!r.options.length || !r.correctOptionIds.every((c) => r.options.some((o) => o.id === c))) e.push(`${w}: reflection options invalid`);
  if (l.audio && (!isStr(l.audio.transcript) || !isStr(l.audio.license))) e.push(`${w}: audio needs transcript and license`);
  return e;
}

export function validateCatalogue(lessons: Lesson[], skills: Skill[], chapters: Chapter[]): string[] {
  const e: string[] = [];
  const ids = new Set<string>();
  for (const l of lessons) {
    if (ids.has(l.id)) e.push(`duplicate lesson id ${l.id}`);
    ids.add(l.id);
    e.push(...validateLesson(l, skills, chapters));
  }
  const chapterIds = new Set<string>();
  for (const c of chapters) {
    if (chapterIds.has(c.id)) e.push(`duplicate chapter id ${c.id}`);
    chapterIds.add(c.id);
  }
  e.push(...checkSkillGraph(skills).map((p) => p.message));
  // Lesson-level prerequisite order must not contradict path order.
  for (const l of lessons)
    for (const p of l.prerequisiteSkillIds) {
      const teacher = lessons.find((x) => x.skillIds.includes(p) && x.subjectId === l.subjectId);
      if (teacher && teacher.order >= l.order) e.push(`lesson ${l.id} requires ${p} taught later in the path`);
    }
  return e;
}
