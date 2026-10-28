// Each reusable game played to completion with buttons only (no drag and drop).
import { test, expect, type Page } from '@playwright/test';
import { lessonById } from '../../src/content/curriculum.ts';
import type { Dir, RobotGrid } from '../../src/domain/types.ts';
import { newLearner, answer, next } from './helpers.ts';

async function toGame(page: Page, lessonId: string) {
  const l = lessonById(lessonId)!;
  await page.goto(`#/lesson/${l.id}`);
  await page.getByRole('button', { name: /try one/ }).click();
  for (const it of l.guidedTasks) {
    await answer(page, it);
    await next(page);
  }
  await expect(page.locator('.game')).toBeVisible();
  return l;
}

async function nextRound(page: Page) {
  await page.locator('.game').getByRole('button', { name: /Next round|Continue/ }).click();
}

async function finished(page: Page) {
  await expect(page.getByText('You finished the game!')).toBeVisible();
  await expect(page.getByRole('button', { name: /Go to practice/ })).toBeVisible();
}

/** Shortest command route for the robot (BFS over position + direction). */
function route(g: RobotGrid): string[] {
  const dirs: Dir[] = ['N', 'E', 'S', 'W'];
  const d: Record<Dir, [number, number]> = { N: [0, -1], E: [1, 0], S: [0, 1], W: [-1, 0] };
  const walls = new Set(g.walls.map((w) => `${w.x},${w.y}`));
  const start = `${g.start.x},${g.start.y},${g.start.dir}`;
  const prev = new Map<string, [string, string]>([[start, ['', '']]]);
  const q = [start];
  while (q.length) {
    const cur = q.shift()!;
    const [x, y, dir] = cur.split(',') as [string, string, Dir];
    if (+x === g.goal.x && +y === g.goal.y) {
      const out: string[] = [];
      for (let k = cur; prev.get(k)![0]; k = prev.get(k)![0]) out.unshift(prev.get(k)![1]);
      return out;
    }
    const i = dirs.indexOf(dir);
    const nx = +x + d[dir][0], ny = +y + d[dir][1];
    const moves: [string, string][] = [
      [`${x},${y},${dirs[(i + 3) % 4]}`, 'left'],
      [`${x},${y},${dirs[(i + 1) % 4]}`, 'right'],
    ];
    if (nx >= 0 && ny >= 0 && nx < g.width && ny < g.height && !walls.has(`${nx},${ny}`)) moves.push([`${nx},${ny},${dir}`, 'forward']);
    for (const [k, op] of moves) if (!prev.has(k)) { prev.set(k, [cur, op]); q.push(k); }
  }
  throw new Error('unsolvable');
}

const BTN: Record<string, string> = { forward: '⬆ forward', left: '↶ turn left', right: '↷ turn right' };

test.beforeEach(async ({ page }) => newLearner(page));

test('Pattern Bridge', async ({ page }) => {
  const l = await toGame(page, 'logic-b-patterns-01');
  if (l.game.type !== 'pattern-bridge') throw new Error();
  const rounds = l.game.rounds;
  // A wrong tile first gives a teaching message.
  const wrong = rounds[0].options.find((o) => o !== rounds[0].answer)!;
  await page.locator('.game').getByRole('button', { name: wrong, exact: true }).click();
  await expect(page.locator('.game .feedback.bad')).toContainText('breaks the pattern');
  for (const r of rounds) {
    await page.locator('.game').getByRole('button', { name: r.answer, exact: true }).click();
    await expect(page.locator('.game .feedback.good')).toContainText(`every ${r.unit} shapes`);
    await nextRound(page);
  }
  await finished(page);
});

test('Robot Route (sequences and loops levels)', async ({ page }) => {
  for (const id of ['coding-b-sequences-01', 'coding-b-loops-01']) {
    const l = await toGame(page, id);
    if (l.game.type !== 'robot-route') throw new Error();
    for (const lv of l.game.levels) {
      for (const op of route(lv)) await page.locator('.game').getByRole('button', { name: BTN[op], exact: true }).click();
      await page.locator('.game').getByRole('button', { name: /▶ Run/ }).click();
      await expect(page.locator('.game').getByTestId('robot-message')).toHaveText('The robot reached the gem!', { timeout: 15_000 });
      await nextRound(page);
    }
    await finished(page);
  }
});

test('Treasure Search: linear and clue modes', async ({ page }) => {
  let l = await toGame(page, 'algorithms-b-linear-search-01');
  if (l.game.type !== 'treasure-search' || l.game.mode !== 'linear') throw new Error();
  for (const r of l.game.rounds) {
    const pos = r.items.indexOf(r.target);
    for (let i = 0; i <= pos; i++) await page.getByRole('button', { name: `Open box ${i + 1} (closed)` }).click();
    await expect(page.locator('.game .feedback.good')).toContainText(`after ${pos + 1} checks`);
    await nextRound(page);
  }
  await finished(page);

  l = await toGame(page, 'logic-b-deduction-01');
  if (l.game.type !== 'treasure-search' || l.game.mode !== 'clues') throw new Error();
  for (const r of l.game.rounds) {
    const wrong = r.boxes.find((b) => b.id !== r.answerId)!;
    await page.getByRole('button', { name: new RegExp(`^Cross out ${wrong.label}:`) }).click();
    await page.getByRole('button', { name: new RegExp(`^Choose ${wrong.label}:`) }).click();
    await expect(page.locator('.game .feedback.bad')).toBeVisible();
    const right = r.boxes.find((b) => b.id === r.answerId)!;
    await page.getByRole('button', { name: new RegExp(`^Choose ${right.label}:`) }).click();
    await expect(page.locator('.game .feedback.good')).toBeVisible();
    await nextRound(page);
  }
  await finished(page);
});

test('Sentence and Step Workshop', async ({ page }) => {
  for (const id of ['english-g3-sentence-order-01', 'algorithms-b-step-order-01']) {
    const l = await toGame(page, id);
    if (l.game.type !== 'sentence-workshop') throw new Error();
    for (const r of l.game.rounds) {
      for (const tid of r.accepted[0]) {
        const tk = r.tokens.find((t) => t.id === tid)!;
        await page.locator('.game').getByRole('button', { name: `Add “${tk.text}”`, exact: true }).first().click();
      }
      await page.locator('.game').getByRole('button', { name: 'Check', exact: true }).click();
      await expect(page.locator('.game .feedback.good')).toBeVisible();
      await nextRound(page);
    }
    await finished(page);
  }
});

test('Word Garden (English, French, Bengali)', async ({ page }) => {
  for (const id of ['english-g3-comprehension-01', 'french-b-greetings-01', 'bengali-b-letters-01']) {
    const l = await toGame(page, id);
    if (l.game.type !== 'word-garden') throw new Error();
    for (const r of l.game.rounds) {
      const g = page.locator('.game');
      // One wrong pairing first.
      await g.locator('.match-cols > div').first().getByRole('button', { name: r.pairs[0].left.text }).click();
      await g.locator('.match-cols > div').last().getByRole('button', { name: r.pairs[1].right.text }).click();
      await expect(g.locator('.feedback.bad')).toBeVisible();
      for (const p of r.pairs) {
        await g.locator('.match-cols > div').first().getByRole('button', { name: p.left.text }).click();
        await g.locator('.match-cols > div').last().getByRole('button', { name: p.right.text }).click();
      }
      await nextRound(page);
    }
    await finished(page);
  }
});
