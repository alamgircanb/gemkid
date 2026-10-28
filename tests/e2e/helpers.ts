import { expect, type Page } from '@playwright/test';
import type { Item, Lesson } from '../../src/domain/types.ts';
import { parseProgram, type Block } from '../../src/domain/robot.ts';
import { itemForSession } from '../../src/domain/answers.ts';

export async function newLearner(page: Page, name = 'Ari', grade = 3) {
  await page.goto('#/start');
  await page.getByLabel('Nickname').fill(name);
  if (grade !== 3) await page.getByLabel('School grade').selectOption(String(grade));
  await page.getByRole('button', { name: /Start learning/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: `Hi, ${name}!` })).toBeVisible();
}

const CMD: Record<string, string> = { forward: '⬆ forward', left: '↶ turn left', right: '↷ turn right' };

async function buildProgram(page: Page, program: Block[]) {
  const card = page.locator('.task-card');
  for (const b of program) {
    if (b.op === 'repeat') {
      await card.getByRole('button', { name: '🔁 repeat', exact: true }).click();
      const n = await card.locator('ol.program:not(.repeat-body) > li').count();
      await card.getByLabel(`Repeat count for block ${n}`).fill(String(b.times));
      for (const c of b.body) await card.getByRole('button', { name: CMD[c.op], exact: true }).click();
      await card.getByLabel('Add commands to').selectOption('main');
    } else {
      await card.getByRole('button', { name: CMD[b.op], exact: true }).click();
    }
  }
}

/** Answer the visible item. `correct: false` gives a deliberately wrong answer. */
export async function answer(page: Page, item: Item, correct = true) {
  const card = page.locator('.task-card');
  switch (item.type) {
    case 'numeric':
      await card.getByLabel('Your answer').fill(String(correct ? item.answerRule.value : item.answerRule.value + 1));
      break;
    case 'choice': {
      const opt = correct
        ? item.options.find((o) => item.answerRule.correctOptionIds.includes(o.id))!
        : item.options.find((o) => !item.answerRule.correctOptionIds.includes(o.id))!;
      await card.getByRole('radio', { name: opt.text, exact: true }).check();
      break;
    }
    case 'order': {
      const ids = correct ? item.answerRule.accepted[0] : [...item.answerRule.accepted[0]].reverse();
      for (const id of ids) {
        const tk = item.tokens.find((x) => x.id === id)!;
        await card.getByRole('button', { name: `Add “${tk.text}”`, exact: true }).first().click();
      }
      break;
    }
    case 'robot':
      await buildProgram(page, correct ? parseProgram(item.reference) : [{ op: 'left' }]);
      break;
  }
  await card.getByRole('button', { name: item.type === 'robot' ? 'Check my program' : 'Check answer' }).click();
}

export async function next(page: Page) {
  await page.locator('.task-card .controls button').filter({ hasText: '→' }).click();
}

/** Play a whole lesson from Discover to Summary. Practice items listed in `wrongPractice` get a wrong first answer. */
export async function playLesson(page: Page, lesson: Lesson, opts: { wrongPractice?: number[]; hintOnPractice?: number[]; playGame?: (p: Page) => Promise<void>; session?: number } = {}) {
  await page.goto(`#/lesson/${lesson.id}`);
  await page.getByRole('button', { name: /try one/ }).click();
  for (const it of lesson.guidedTasks) {
    await answer(page, it);
    await expect(page.locator('.feedback.good')).toBeVisible();
    await next(page);
  }
  if (opts.playGame) await opts.playGame(page);
  else await page.getByRole('button', { name: 'Skip the game for now' }).click();
  const sn = opts.session ?? 0;
  for (const [i, base] of lesson.practiceItems.entries()) {
    const it = itemForSession(base, sn);
    if (opts.hintOnPractice?.includes(i)) await page.locator('.task-card').getByRole('button', { name: /Help me/ }).click();
    if (opts.wrongPractice?.includes(i)) {
      await answer(page, it, false);
      await expect(page.locator('.feedback.bad')).toBeVisible();
      if (it.type === 'order') await page.locator('.task-card').getByRole('button', { name: 'Clear', exact: true }).click();
      if (it.type === 'robot') await page.locator('.task-card').getByRole('button', { name: 'Clear program' }).click();
    }
    await answer(page, it);
    await expect(page.locator('.feedback.good')).toBeVisible();
    await next(page);
  }
  for (const base of lesson.challenges) {
    const it = itemForSession(base, sn);
    await answer(page, it);
    await expect(page.locator('.feedback.good')).toBeVisible();
    await next(page);
  }
  const r = lesson.reflection;
  const opt = r.options.find((o) => r.correctOptionIds.includes(o.id))!;
  await page.getByRole('radio', { name: opt.text, exact: true }).check();
  await page.getByRole('button', { name: 'Check answer' }).click();
  await page.getByRole('button', { name: /Finish lesson/ }).click();
  await expect(page.getByRole('heading', { name: 'Lesson summary' })).toBeVisible();
}
