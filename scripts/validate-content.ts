// Usage: node scripts/validate-content.ts  (Node 22.18+ strips TypeScript types natively)
import { LESSONS, SKILLS, CHAPTERS } from '../src/content/curriculum.ts';
import { validateCatalogue } from '../src/content/validate.ts';

const errors = validateCatalogue(LESSONS, SKILLS, CHAPTERS);
const items = LESSONS.reduce((n, l) => n + l.practiceItems.length + l.challenges.length, 0);
if (errors.length) {
  console.error(`Content validation failed with ${errors.length} problem(s):`);
  for (const e of errors) console.error(' - ' + e);
  process.exit(1);
}
console.log(
  `Content OK: ${LESSONS.length} lessons, ${SKILLS.length} skills, ${CHAPTERS.length} chapters, ${items} assessment items. ` +
    `Statuses: ${[...new Set(LESSONS.map((l) => l.status))].join(', ')} (no lesson claims review).`,
);
