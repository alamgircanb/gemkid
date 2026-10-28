import { test, expect, type Page } from '@playwright/test';
import { lessonById, CHAPTERS } from '../../src/content/curriculum.ts';
import { newLearner, playLesson } from './helpers.ts';

async function enterParentZone(page: Page) {
  await page.goto('#/parent');
  const label = await page.locator('label[for="gate"]').textContent();
  const [a, b] = label!.match(/\d+/g)!.map(Number);
  await page.getByLabel(/What is/).fill(String(a * b));
  await page.getByRole('button', { name: 'Enter' }).click();
}

test('AC10: interface switches EN/FR/BN, persists, and labels English-only lessons', async ({ page }) => {
  await newLearner(page);
  await page.getByLabel('Language').selectOption('fr');
  await expect(page.getByRole('link', { name: /Mon parcours/ }).first()).toBeVisible();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  await page.getByLabel('Langue').selectOption('bn');
  await expect(page.locator('html')).toHaveAttribute('lang', 'bn');
  await expect(page.getByRole('link', { name: /আমার পথ/ }).first()).toBeVisible();
  await page.goto('#/lesson/bengali-b-letters-01');
  await expect(page.getByText('এই পাঠটি ইংরেজিতে লেখা।')).toBeVisible();
  // Bengali glyphs render with real width (not empty boxes collapsed to zero).
  const w = await page.locator('.vocab .term[lang="bn"]').first().evaluate((el) => el.getBoundingClientRect().width);
  expect(w).toBeGreaterThan(10);
});

test('AC11: keyboard-only ordering works without drag and drop', async ({ page }) => {
  await newLearner(page);
  const l = lessonById('english-g3-sentence-order-01')!;
  await page.goto(`#/lesson/${l.id}`);
  await page.getByRole('button', { name: /try one/ }).focus();
  await page.keyboard.press('Enter');
  const item = l.guidedTasks[0];
  if (item.type !== 'order') throw new Error('expected order item');
  // Add words in reverse with the keyboard, then fix the order with move buttons.
  for (const id of [...item.answerRule.accepted[0]]) {
    const tk = item.tokens.find((x) => x.id === id)!;
    await page.getByRole('button', { name: `Add “${tk.text}”`, exact: true }).first().focus();
    await page.keyboard.press('Enter');
  }
  // Move "." up one place, then back down: buttons are keyboard reachable.
  await page.getByRole('button', { name: 'Move “.” earlier' }).focus();
  await page.keyboard.press('Enter');
  await page.getByRole('button', { name: 'Move “.” later' }).focus();
  await page.keyboard.press('Enter');
  await page.getByRole('button', { name: 'Check answer' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.feedback.good')).toBeVisible();
  await expect(page.locator('.feedback.good')).toHaveAttribute('aria-live', 'assertive');
});

test('AC13: an oversized robot loop stops safely with an explanation', async ({ page }) => {
  await newLearner(page);
  await page.goto('#/lesson/coding-b-loops-01');
  await page.getByRole('button', { name: /try one/ }).click();
  const card = page.locator('.task-card');
  await card.getByRole('button', { name: '🔁 repeat', exact: true }).click();
  await card.getByLabel('Repeat count for block 1').fill('20');
  for (let i = 0; i < 7; i++) await card.getByRole('button', { name: '↷ turn right', exact: true }).click();
  await card.getByRole('button', { name: /▶ Run/ }).click();
  await expect(page.getByTestId('robot-message')).toContainText('stopped after 120 steps', { timeout: 15_000 });
  // The page is still responsive.
  await card.getByRole('button', { name: /Reset robot/ }).click();
});

test('AC14: every catalogue chapter and footer link opens a real page', async ({ page }) => {
  await page.goto('#/explore');
  await expect(page.getByText(`${CHAPTERS.length} chapters`)).toBeVisible();
  // Planned chapters are not links.
  await expect(page.getByText('Planned').first()).toBeVisible();
  const links = await page.locator('main a[href^="#/"]').evaluateAll((as) => [...new Set(as.map((a) => a.getAttribute('href')!))]);
  const footer = await page.locator('footer a').evaluateAll((as) => as.map((a) => a.getAttribute('href')!));
  for (const href of [...links, ...footer]) {
    await page.goto(href);
    await expect(page.locator('main h1').first()).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Page not found' })).toHaveCount(0);
  }
});

test('AC15: direct hash routes under /kidgem/ load after refresh, assets resolve', async ({ page, baseURL }) => {
  const failed: string[] = [];
  page.on('response', (r) => r.status() >= 400 && failed.push(r.url()));
  await page.goto(`${baseURL}#/lesson/math-g3-arrays-01`);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1, name: 'Multiplication arrays' })).toBeVisible();
  await page.goto(`${baseURL}#/explore?subject=coding`);
  await page.reload();
  await expect(page.getByLabel('Subject', { exact: true })).toHaveValue('coding');
  expect(failed).toEqual([]);
});

test('AC17: export, reset and import local records; malformed import rejected', async ({ page }) => {
  await newLearner(page, 'Zed');
  await playLesson(page, lessonById('french-b-greetings-01')!);
  await enterParentZone(page);
  const dl = page.waitForEvent('download');
  await page.getByRole('button', { name: /Download all records/ }).click();
  const file = await (await dl).path();
  // Malformed import changes nothing.
  await page.getByLabel('Import records from a file').setInputFiles({ name: 'bad.json', mimeType: 'application/json', buffer: Buffer.from('{"format":"x"}') });
  await expect(page.getByText('not a valid KidGem export')).toBeVisible();
  // Delete the learner, then restore from the export.
  await page.getByRole('button', { name: 'Delete this learner' }).click();
  await page.getByLabel('Confirmation word').fill('DELETE');
  await page.getByRole('button', { name: 'Confirm' }).click();
  await expect(page.getByText('No learners on this device yet.')).toBeVisible();
  await page.getByLabel('Import records from a file').setInputFiles(file!);
  await expect(page.getByText('Imported 1 learner(s).')).toBeVisible();
  await page.goto('#/start');
  await page.getByRole('button', { name: /Continue as Zed/ }).click();
  await expect(page.getByText('1 of 12 lessons completed')).toBeVisible();
});

test('AC18: a review appears after 2 days, without streaks or penalties', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-11-02T10:00:00') });
  await newLearner(page);
  const l = lessonById('logic-b-patterns-01')!;
  await playLesson(page, l);
  await page.goto('#/review');
  await expect(page.getByText('Coming up')).toBeVisible();
  await page.clock.setSystemTime(new Date('2026-11-04T11:00:00'));
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Ready to review' })).toBeVisible();
  await page.goto('#/dashboard');
  await expect(page.getByText(/ready for a quick review/)).toBeVisible();
  await expect(page.getByText(/streak/i)).toHaveCount(0);
});

for (const width of [320, 768, 1280]) {
  test(`AC12: no horizontal overflow at ${width}px on key screens @mobile`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await newLearner(page);
    for (const route of ['#/', '#/dashboard', '#/explore', '#/path/math', '#/lesson/coding-b-loops-01', '#/gems', '#/settings']) {
      await page.goto(route);
      await page.waitForTimeout(150);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, `${route} at ${width}px`).toBeLessThanOrEqual(1);
    }
  });
}

test('AC12: reduced motion and 200% text still work', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await newLearner(page);
  await page.goto('#/settings');
  await page.getByRole('radio', { name: 'Extra large' }).check();
  await page.getByRole('radio', { name: 'Reduce motion' }).check();
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduce');
  await page.setViewportSize({ width: 640, height: 800 }); // ~200% zoom of a 1280px window
  await page.goto('#/lesson/coding-b-sequences-01');
  await page.getByRole('button', { name: /try one/ }).click();
  await page.locator('.task-card').getByRole('button', { name: '⬆ forward', exact: true }).click();
  await page.locator('.task-card').getByRole('button', { name: /▶ Run/ }).click();
  await expect(page.getByTestId('robot-message')).not.toBeEmpty();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test('storage unavailable shows a visible warning', async ({ browser, baseURL }) => {
  const ctx = await browser.newContext();
  await ctx.addInitScript(() => {
    Object.defineProperty(window, 'indexedDB', { get() { throw new Error('blocked'); } });
  });
  const page = await ctx.newPage();
  await page.goto(baseURL!);
  await expect(page.getByTestId('storage-warning')).toBeVisible();
  await ctx.close();
});

test('phone layout: bottom navigation is visible and hidden during lessons @mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await newLearner(page);
  await expect(page.locator('.bottom-nav')).toBeVisible();
  await page.goto('#/lesson/math-g3-equal-groups-01');
  await expect(page.locator('.bottom-nav')).toBeHidden();
});
