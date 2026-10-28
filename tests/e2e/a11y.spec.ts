// Automated accessibility scan (axe-core). This catches a subset of WCAG 2.2 AA issues;
// manual keyboard, zoom and screen-reader review is still required (docs/ACCESSIBILITY.md).
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { newLearner, playLesson } from './helpers.ts';
import { lessonById } from '../../src/content/curriculum.ts';

const scan = async (page: import('@playwright/test').Page) => {
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
  return r.violations.map((v) => `${v.id}: ${v.nodes.length} node(s) — ${v.help}`);
};

test('axe: home, explore, path, lesson, summary and parent screens', async ({ page }) => {
  test.setTimeout(180_000);
  await page.goto('./');
  expect(await scan(page)).toEqual([]);
  await page.goto('#/explore');
  expect(await scan(page)).toEqual([]);
  await newLearner(page);
  expect(await scan(page)).toEqual([]);
  await page.goto('#/path/math');
  expect(await scan(page)).toEqual([]);
  await page.goto('#/lesson/coding-b-loops-01');
  await page.getByRole('button', { name: /try one/ }).click();
  expect(await scan(page)).toEqual([]);
  await playLesson(page, lessonById('bengali-b-letters-01')!);
  expect(await scan(page)).toEqual([]);
  await page.goto('#/parent');
  expect(await scan(page)).toEqual([]);
});
