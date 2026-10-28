// A bounded command language for beginner coding. Learner programs are data,
// never evaluated as JavaScript. Limits stop oversized or runaway programs safely.

import type { Dir, RobotGrid } from './types.ts';

export type Block =
  | { op: 'forward' }
  | { op: 'left' }
  | { op: 'right' }
  | { op: 'repeat'; times: number; body: Block[] };

export const LIMITS = {
  maxBlocks: 24,
  maxDepth: 2,
  maxRepeat: 20,
  maxSteps: 120,
} as const;

export interface RobotState {
  x: number;
  y: number;
  dir: Dir;
}

export interface TraceStep {
  /** Path of indices to the block being executed, e.g. [2, 0] = first block inside block 2. */
  pointer: number[];
  op: 'forward' | 'left' | 'right';
  state: RobotState;
}

export type RunOutcome =
  | 'reached-goal'
  | 'stopped-short'
  | 'hit-wall'
  | 'left-grid'
  | 'step-limit'
  | 'invalid-program';

export interface RunResult {
  outcome: RunOutcome;
  trace: TraceStep[];
  final: RobotState;
  /** Where the robot tried to go when it crashed. */
  crashAt?: { x: number; y: number };
  message: string;
}

export function countBlocks(program: Block[]): number {
  return program.reduce((n, b) => n + 1 + (b.op === 'repeat' ? countBlocks(b.body) : 0), 0);
}

export function depth(program: Block[]): number {
  return program.reduce((d, b) => Math.max(d, b.op === 'repeat' ? 1 + depth(b.body) : 0), 0);
}

export function usesRepeat(program: Block[]): boolean {
  return program.some((b) => b.op === 'repeat');
}

export function validateProgram(program: Block[]): string | null {
  if (program.length === 0) return 'Add at least one command first.';
  if (countBlocks(program) > LIMITS.maxBlocks)
    return `Programs can have at most ${LIMITS.maxBlocks} blocks. Try using a repeat block.`;
  if (depth(program) > LIMITS.maxDepth) return `Repeat blocks can only be nested ${LIMITS.maxDepth} deep.`;
  const bad = (ps: Block[]): boolean =>
    ps.some(
      (b) =>
        (b.op === 'repeat' &&
          (!Number.isInteger(b.times) || b.times < 1 || b.times > LIMITS.maxRepeat || b.body.length === 0 || bad(b.body))) ||
        !['forward', 'left', 'right', 'repeat'].includes(b.op),
    );
  if (bad(program)) return `Each repeat needs at least one command inside and a count from 1 to ${LIMITS.maxRepeat}.`;
  return null;
}

const DX: Record<Dir, number> = { N: 0, E: 1, S: 0, W: -1 };
const DY: Record<Dir, number> = { N: -1, E: 0, S: 1, W: 0 };
const LEFT: Record<Dir, Dir> = { N: 'W', W: 'S', S: 'E', E: 'N' };
const RIGHT: Record<Dir, Dir> = { N: 'E', E: 'S', S: 'W', W: 'N' };

/** Flatten a program into primitive steps without exceeding the step limit. */
function* expand(program: Block[], prefix: number[]): Generator<{ op: 'forward' | 'left' | 'right'; pointer: number[] }> {
  for (let i = 0; i < program.length; i++) {
    const b = program[i];
    if (b.op === 'repeat') {
      for (let k = 0; k < b.times; k++) yield* expand(b.body, [...prefix, i]);
    } else {
      yield { op: b.op, pointer: [...prefix, i] };
    }
  }
}

export function runProgram(grid: RobotGrid, program: Block[]): RunResult {
  const start: RobotState = { ...grid.start };
  const invalid = validateProgram(program);
  if (invalid) return { outcome: 'invalid-program', trace: [], final: start, message: invalid };

  const walls = new Set(grid.walls.map((w) => `${w.x},${w.y}`));
  let s: RobotState = { ...start };
  const trace: TraceStep[] = [];
  let steps = 0;
  for (const step of expand(program, [])) {
    if (steps >= LIMITS.maxSteps) {
      return {
        outcome: 'step-limit',
        trace,
        final: s,
        message: `The robot stopped after ${LIMITS.maxSteps} steps so it would not run forever. Check your repeat counts.`,
      };
    }
    steps++;
    if (step.op === 'left') s = { ...s, dir: LEFT[s.dir] };
    else if (step.op === 'right') s = { ...s, dir: RIGHT[s.dir] };
    else {
      const nx = s.x + DX[s.dir];
      const ny = s.y + DY[s.dir];
      if (nx < 0 || ny < 0 || nx >= grid.width || ny >= grid.height) {
        trace.push({ pointer: step.pointer, op: step.op, state: s });
        return { outcome: 'left-grid', trace, final: s, crashAt: { x: nx, y: ny }, message: 'The robot reached the edge of the grid and stopped.' };
      }
      if (walls.has(`${nx},${ny}`)) {
        trace.push({ pointer: step.pointer, op: step.op, state: s });
        return { outcome: 'hit-wall', trace, final: s, crashAt: { x: nx, y: ny }, message: 'The robot bumped into a rock and stopped.' };
      }
      s = { ...s, x: nx, y: ny };
    }
    trace.push({ pointer: step.pointer, op: step.op, state: s });
  }
  if (s.x === grid.goal.x && s.y === grid.goal.y) {
    return { outcome: 'reached-goal', trace, final: s, message: 'The robot reached the gem!' };
  }
  return { outcome: 'stopped-short', trace, final: s, message: 'The program finished, but the robot is not on the gem yet.' };
}

export function programToText(program: Block[]): string {
  return program
    .map((b) => (b.op === 'repeat' ? `repeat ${b.times} [${programToText(b.body)}]` : b.op))
    .join(', ');
}

/** Parse the compact text form produced by programToText (used for stored answers and tests). */
export function parseProgram(text: string): Block[] {
  const tokens = text.match(/repeat|\d+|\[|\]|forward|left|right/g) ?? [];
  let i = 0;
  const parseList = (): Block[] => {
    const out: Block[] = [];
    while (i < tokens.length && tokens[i] !== ']') {
      const t = tokens[i++];
      if (t === 'forward' || t === 'left' || t === 'right') out.push({ op: t });
      else if (t === 'repeat') {
        const times = Number(tokens[i++]);
        if (tokens[i++] !== '[') throw new Error('Expected [');
        const body = parseList();
        if (tokens[i++] !== ']') throw new Error('Expected ]');
        out.push({ op: 'repeat', times, body });
      } else throw new Error(`Unexpected ${t}`);
    }
    return out;
  };
  const p = parseList();
  if (i !== tokens.length) throw new Error('Unbalanced brackets');
  return p;
}

/** Breadth-first check that a goal is reachable (used by content validation). */
export function isSolvable(grid: RobotGrid): boolean {
  const walls = new Set(grid.walls.map((w) => `${w.x},${w.y}`));
  const seen = new Set<string>();
  const q: [number, number][] = [[grid.start.x, grid.start.y]];
  while (q.length) {
    const [x, y] = q.shift()!;
    const k = `${x},${y}`;
    if (seen.has(k)) continue;
    seen.add(k);
    if (x === grid.goal.x && y === grid.goal.y) return true;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (nx >= 0 && ny >= 0 && nx < grid.width && ny < grid.height && !walls.has(`${nx},${ny}`)) q.push([nx, ny]);
    }
  }
  return false;
}
