import { test, expect } from '@playwright/test';
import { LESSONS, lessonById } from '../../src/content/curriculum.ts';
import { newLearner, playLesson, answer, next } from './helpers.ts';

const eq = lessonById('math-g3-equal-groups-01')!;

test('AC01/AC02/AC05: new learner → full lesson with game → mastery once → next recommendation @mobile', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('link', { name: /Try a lesson/ }).click();
  await newLearner(page, 'Mia');
  // Large continue card names the exact first lesson.
  await expect(page.locator('.continue-card')).toContainText('Equal groups of gems');
  await page.locator('.continue-card').getByRole('button').click();
  await expect(page.getByRole('heading', { level: 1, name: 'Equal groups of gems' })).toBeVisible();
  // Play the Gem Groups game with buttons only.
  await playLesson(page, eq, {
    playGame: async (p) => {
      for (const r of [
        [2, 3],
        [3, 4],
        [4, 2],
      ]) {
        for (let g = 0; g < r[0]; g++) await p.getByRole('button', { name: '+ Add a basket' }).click();
        for (let g = 1; g <= r[0]; g++) for (let k = 0; k < r[1]; k++) await p.getByRole('button', { name: `Add a gem to basket ${g}` }).click();
        await p.getByLabel('How many gems in total?').fill(String(r[0] * r[1]));
        await p.getByRole('button', { name: 'Check', exact: true }).click();
        await expect(p.locator('.game .feedback.good')).toBeVisible();
        await p.locator('.game').getByRole('button', { name: /Next round|Continue/ }).click();
      }
      await p.getByRole('button', { name: /Go to practice/ }).click();
    },
  });
  await expect(page.getByTestId('summary-practice')).toHaveText('Practice: 6 of 6');
  await expect(page.getByTestId('summary-challenge')).toHaveText('Challenge: 2 of 2');
  await expect(page.getByText('Skill mastered!')).toBeVisible();
  await expect(page.getByText('+25 gems')).toBeVisible();
  // Next step is arrays, and it survives a reload.
  await page.goto('#/dashboard');
  await page.reload();
  await expect(page.locator('.continue-card')).toContainText('Multiplication arrays');
  await expect(page.getByText('1 of 12 lessons completed')).toBeVisible();
});

test('AC04/AC06: wrong answers and hints are recorded; no false mastery', async ({ page }) => {
  await newLearner(page);
  await playLesson(page, eq, { wrongPractice: [0], hintOnPractice: [1] });
  await expect(page.getByTestId('summary-practice')).toHaveText('Practice: 4 of 6');
  await expect(page.getByText('Lesson complete. To master this skill')).toBeVisible();
  await expect(page.getByText('+10 gems')).toBeVisible();
  // Parent view shows independent evidence, not a score of ability.
  await page.goto('#/parent');
  const q = await page.getByLabel(/What is/).evaluate((el) => (el as HTMLInputElement).labels![0].textContent!);
  const [a, b] = q.match(/\d+/g)!.map(Number);
  await page.getByLabel(/What is/).fill(String(a * b));
  await page.getByRole('button', { name: 'Enter' }).click();
  await expect(page.getByText('4/6 independent practice answers, 2/2 challenge answers')).toBeVisible();
  await expect(page.getByText('Needs another try').first()).toBeVisible();
});

test('AC07: replaying a mastered lesson keeps history and never re-awards gems', async ({ page }) => {
  await newLearner(page);
  await playLesson(page, eq);
  await expect(page.getByText('+25 gems')).toBeVisible();
  await page.getByRole('button', { name: /Replay from the start/ }).click();
  await playLesson(page, eq, { session: 1 });
  await expect(page.getByText('Gems are earned once per lesson')).toBeVisible();
  await page.goto('#/gems');
  await expect(page.getByTestId('gem-balance')).toContainText('25');
});

test('AC08: leaving mid-lesson resumes at the saved stage and question', async ({ page }) => {
  await newLearner(page);
  await page.goto(`#/lesson/${eq.id}`);
  await page.getByRole('button', { name: /try one/ }).click();
  await answer(page, eq.guidedTasks[0]);
  await next(page);
  await page.getByRole('button', { name: /Save & exit/ }).click();
  await expect(page.locator('.continue-card')).toContainText('Guided try');
  await page.reload();
  await page.locator('.continue-card').getByRole('button').click();
  await expect(page.getByText('Welcome back!')).toBeVisible();
  await expect(page.getByText('Question 2 of 2')).toBeVisible();
});

test('AC08: answering then reloading moves on instead of re-asking', async ({ page }) => {
  await newLearner(page);
  await page.goto(`#/lesson/${eq.id}`);
  await page.getByRole('button', { name: /try one/ }).click();
  await answer(page, eq.guidedTasks[0]);
  await expect(page.locator('.feedback.good')).toBeVisible();
  await page.reload();
  await expect(page.getByText('Question 2 of 2')).toBeVisible();
});

test('AC09: switching learners never leaks progress or gems', async ({ page }) => {
  await newLearner(page, 'Ana');
  await playLesson(page, eq);
  await newLearner(page, 'Ben', 6);
  await expect(page.getByText('0 of 12 lessons completed')).toBeVisible();
  await page.goto('#/gems');
  await expect(page.getByTestId('gem-balance')).toContainText('0');
  await page.goto('#/start');
  await page.getByRole('button', { name: /Continue as Ana/ }).click();
  await expect(page.getByText('1 of 12 lessons completed')).toBeVisible();
});

test('AC03: every one of the 12 lessons runs end to end', async ({ page }) => {
  test.setTimeout(900_000);
  await newLearner(page, 'Tester');
  for (const lesson of LESSONS) {
    await playLesson(page, lesson);
    await expect(page.getByTestId('summary-practice')).toHaveText('Practice: 6 of 6');
    await expect(page.getByText('Skill mastered!')).toBeVisible();
  }
  await page.goto('#/dashboard');
  await expect(page.getByText('12 of 12 lessons completed')).toBeVisible();
  await expect(page.getByText(/finished every available demo lesson/)).toBeVisible();
});

test('fresh question set uses different item versions', async ({ page }) => {
  await newLearner(page);
  await playLesson(page, eq);
  await page.getByRole('button', { name: /Try a fresh set of questions/ }).click();
  const v = eq.practiceItems[0].variants![0];
  await expect(page.locator('.task-card .prompt')).toHaveText(v.prompt);
});
