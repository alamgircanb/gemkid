// Prerequisite graph checks: missing references and cycles.

import type { Skill } from './types.ts';

export interface GraphProblem {
  kind: 'missing' | 'cycle' | 'duplicate';
  message: string;
}

export function checkSkillGraph(skills: Skill[]): GraphProblem[] {
  const problems: GraphProblem[] = [];
  const byId = new Map<string, Skill>();
  for (const s of skills) {
    if (byId.has(s.id)) problems.push({ kind: 'duplicate', message: `Duplicate skill id ${s.id}` });
    byId.set(s.id, s);
  }
  for (const s of skills)
    for (const p of s.prerequisites)
      if (!byId.has(p)) problems.push({ kind: 'missing', message: `${s.id} requires missing skill ${p}` });

  const WHITE = 0, GREY = 1, BLACK = 2;
  const colour = new Map<string, number>();
  const stack: string[] = [];
  const visit = (id: string): void => {
    colour.set(id, GREY);
    stack.push(id);
    for (const p of byId.get(id)?.prerequisites ?? []) {
      if (!byId.has(p)) continue;
      const c = colour.get(p) ?? WHITE;
      if (c === GREY) {
        const cycle = stack.slice(stack.indexOf(p)).concat(p);
        problems.push({ kind: 'cycle', message: `Prerequisite cycle: ${cycle.join(' → ')}` });
      } else if (c === WHITE) visit(p);
    }
    stack.pop();
    colour.set(id, BLACK);
  };
  for (const s of skills) if ((colour.get(s.id) ?? WHITE) === WHITE) visit(s.id);
  return problems;
}

/** All transitive prerequisites of a skill. */
export function ancestors(skills: Skill[], id: string): Set<string> {
  const byId = new Map(skills.map((s) => [s.id, s]));
  const out = new Set<string>();
  const walk = (x: string) => {
    for (const p of byId.get(x)?.prerequisites ?? []) {
      if (!out.has(p)) {
        out.add(p);
        walk(p);
      }
    }
  };
  walk(id);
  return out;
}
