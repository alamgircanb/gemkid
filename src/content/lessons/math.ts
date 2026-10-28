import type { Lesson, NumericItem, Item } from '../../domain/types.ts';
import { numeric, choice, opts, NO_REVIEW } from '../helpers.ts';

const GROUP_TAG = 'adds-group-count-to-group-size';

function groupItem(id: string, groups: number, each: number, noun = 'baskets', thing = 'gems', variants?: Item[]): NumericItem {
  return numeric(id, `There are ${groups} ${noun} with ${each} ${thing} in each. How many ${thing} altogether?`, groups * each, {
    explanation: `${groups} equal groups of ${each} make ${groups * each}: ${Array(groups).fill(each).join(' + ')} = ${groups * each}.`,
    tag: GROUP_TAG,
    hints: [
      `Which number tells you how many ${noun} there are? Which tells you how many ${thing} are in one?`,
      `Add ${each} once for each of the ${groups} ${noun}.`,
      `${Array(groups).fill(each).join(' + ')} = ${groups * each}.`,
    ],
    visual: { type: 'groups', groups, itemsPerGroup: each, altText: `${groups} ${noun}, each holding ${each} ${thing}.` },
    variants,
  });
}

const v = (id: string, g: number, e: number, noun?: string, thing?: string) => [groupItem(`${id}-v1`, g, e, noun, thing)];

export const equalGroups: Lesson = {
  schemaVersion: 1,
  id: 'math-g3-equal-groups-01',
  subjectId: 'math',
  level: { grade: 3 },
  chapterId: 'math-g3-multiplication',
  order: 1,
  skillIds: ['math.equal-groups'],
  prerequisiteSkillIds: ['math.count-objects', 'math.repeated-addition'],
  title: 'Equal groups of gems',
  objective: 'Find the total in equal groups using repeated addition, and write it as multiplication.',
  contentLocale: 'en',
  estimatedMinutes: 12,
  status: 'draft',
  contentVersion: 1,
  review: NO_REVIEW,
  conceptBlocks: [
    { type: 'text', text: 'Equal groups have the same number of things in every group.' },
    { type: 'visual', visual: { type: 'groups', groups: 3, itemsPerGroup: 4, altText: 'Three baskets, each containing four gems.' } },
    {
      type: 'example',
      title: 'Three baskets of four gems',
      steps: [
        'Count the baskets: there are 3 groups.',
        'Count the gems in one basket: there are 4 in each group.',
        'Add 4 once for each basket: 4 + 4 + 4 = 12.',
        'We can write this as 3 × 4 = 12. Read it as “3 groups of 4 make 12”.',
      ],
    },
    { type: 'text', text: 'Careful: 3 + 4 = 7 is not the answer. The 3 counts baskets, not gems.' },
  ],
  guidedTasks: [groupItem('guided-01', 2, 3), groupItem('guided-02', 3, 2)],
  game: {
    type: 'gem-groups',
    mode: 'groups',
    rounds: [
      { groups: 2, itemsPerGroup: 3 },
      { groups: 3, itemsPerGroup: 4 },
      { groups: 4, itemsPerGroup: 2 },
    ],
  },
  practiceItems: [
    groupItem('practice-01', 2, 3, undefined, undefined, v('practice-01', 2, 4)),
    groupItem('practice-02', 3, 4, undefined, undefined, v('practice-02', 3, 3)),
    groupItem('practice-03', 4, 2, undefined, undefined, v('practice-03', 5, 2)),
    groupItem('practice-04', 5, 3, undefined, undefined, v('practice-04', 4, 3)),
    groupItem('practice-05', 2, 5, undefined, undefined, v('practice-05', 2, 6)),
    groupItem('practice-06', 4, 4, undefined, undefined, v('practice-06', 3, 5)),
  ],
  challenges: [
    {
      ...groupItem('challenge-01', 3, 5, 'trays', 'seedlings'),
      prompt: 'Three trays each contain five seedlings. How many seedlings are there?',
      visual: undefined,
      variants: [{ ...groupItem('challenge-01-v1', 4, 5, 'boxes', 'crayons'), prompt: 'Four boxes each hold five crayons. How many crayons are there?', visual: undefined }],
    },
    {
      ...groupItem('challenge-02', 4, 3, 'teams', 'children'),
      prompt: 'Four teams each have three children. How many children are there?',
      visual: undefined,
      variants: [{ ...groupItem('challenge-02-v1', 3, 6, 'cars', 'passengers'), prompt: 'Three cars each carry six passengers. How many passengers are there?', visual: undefined }],
    },
  ],
  reflection: {
    type: 'choice',
    prompt: 'In three baskets of four gems, what does the 3 describe?',
    options: [
      { id: 'groups', text: 'The number of baskets' },
      { id: 'per-group', text: 'The gems in each basket' },
    ],
    correctOptionIds: ['groups'],
    explanation: 'Three counts the baskets (the groups), and four counts the gems in each basket.',
  },
  audio: null,
  offlineActivity: 'Share snacks or buttons into equal piles together. Ask: how many piles, how many in each, how many altogether?',
};

const ARRAY_TAG = 'adds-rows-and-columns';

function arrayItem(id: string, rows: number, cols: number, variants?: Item[]): NumericItem {
  return numeric(id, `This array has ${rows} rows with ${cols} gems in each row. How many gems are there?`, rows * cols, {
    explanation: `${rows} rows of ${cols} make ${rows * cols}, so ${rows} × ${cols} = ${rows * cols}.`,
    tag: ARRAY_TAG,
    hints: [
      'An array is equal groups arranged in rows. Each row is one group.',
      `Count one row: ${cols} gems. There are ${rows} rows like it.`,
      `${Array(rows).fill(cols).join(' + ')} = ${rows * cols}.`,
    ],
    visual: { type: 'array', rows, cols, altText: `An array of gems: ${rows} rows, ${cols} gems in each row.` },
    variants,
  });
}

export const arrays: Lesson = {
  schemaVersion: 1,
  id: 'math-g3-arrays-01',
  subjectId: 'math',
  level: { grade: 3 },
  chapterId: 'math-g3-multiplication',
  order: 2,
  skillIds: ['math.arrays'],
  prerequisiteSkillIds: ['math.equal-groups'],
  title: 'Multiplication arrays',
  objective: 'Read an array as equal rows and connect it to a multiplication fact.',
  contentLocale: 'en',
  estimatedMinutes: 12,
  status: 'draft',
  contentVersion: 1,
  review: NO_REVIEW,
  conceptBlocks: [
    { type: 'text', text: 'An array arranges things in straight rows and columns. Every row has the same number.' },
    { type: 'visual', visual: { type: 'array', rows: 3, cols: 5, altText: 'An array with 3 rows of 5 gems.' } },
    {
      type: 'example',
      title: '3 rows of 5',
      steps: [
        'Each row is one equal group of 5.',
        'There are 3 rows, so add 5 three times: 5 + 5 + 5 = 15.',
        'Write it as 3 × 5 = 15.',
        'Turn the array on its side and you see 5 rows of 3. It is still 15 gems: 5 × 3 = 15.',
      ],
    },
  ],
  guidedTasks: [arrayItem('guided-01', 2, 4), arrayItem('guided-02', 3, 3)],
  game: {
    type: 'gem-groups',
    mode: 'array',
    rounds: [
      { groups: 2, itemsPerGroup: 5 },
      { groups: 3, itemsPerGroup: 4 },
      { groups: 4, itemsPerGroup: 3 },
    ],
  },
  practiceItems: [
    arrayItem('practice-01', 2, 6, [arrayItem('practice-01-v1', 2, 7)]),
    arrayItem('practice-02', 3, 5, [arrayItem('practice-02-v1', 3, 6)]),
    choice(
      'practice-03',
      'Which multiplication matches an array with 3 rows of 4 gems?',
      opts('3 × 4', '3 + 4', '4 + 4'),
      'a',
      {
        explanation: '3 rows of 4 is 3 equal groups of 4, which is 3 × 4.',
        tag: ARRAY_TAG,
        hints: ['Adding rows and columns (3 + 4) does not count the gems.', 'How many equal rows? How many in each row?'],
        visual: { type: 'array', rows: 3, cols: 4, altText: 'An array with 3 rows of 4 gems.' },
        variants: [
          choice('practice-03-v1', 'Which multiplication matches an array with 2 rows of 5 gems?', opts('2 + 5', '2 × 5', '5 + 5 + 5'), 'b', {
            explanation: '2 rows of 5 is 2 equal groups of 5, which is 2 × 5.',
            tag: ARRAY_TAG,
            hints: ['Adding rows and columns does not count the gems.', 'How many equal rows? How many in each row?'],
            visual: { type: 'array', rows: 2, cols: 5, altText: 'An array with 2 rows of 5 gems.' },
          }),
        ],
      },
    ),
    arrayItem('practice-04', 4, 5, [arrayItem('practice-04-v1', 4, 4)]),
    choice(
      'practice-05',
      'An array has 2 rows of 6. Which array has the same total?',
      opts('6 rows of 2', '2 rows of 2', '6 rows of 6'),
      'a',
      {
        explanation: 'Turning an array changes rows into columns but not the total: 2 × 6 = 6 × 2 = 12.',
        tag: 'thinks-rotation-changes-total',
        hints: ['Imagine turning the array on its side.', 'Work out each total: 2 × 6 = 12. Which option is also 12?'],
        variants: [
          choice('practice-05-v1', 'An array has 3 rows of 5. Which array has the same total?', opts('3 rows of 3', '5 rows of 3', '5 rows of 5'), 'b', {
            explanation: 'Turning an array changes rows into columns but not the total: 3 × 5 = 5 × 3 = 15.',
            tag: 'thinks-rotation-changes-total',
            hints: ['Imagine turning the array on its side.', '3 × 5 = 15. Which option is also 15?'],
          }),
        ],
      },
    ),
    arrayItem('practice-06', 5, 2, [arrayItem('practice-06-v1', 5, 3)]),
  ],
  challenges: [
    numeric('challenge-01', 'A garden has 4 rows of carrots with 3 carrots in each row. How many carrots are there?', 12, {
      explanation: '4 rows of 3 is 4 × 3 = 12 carrots.',
      tag: ARRAY_TAG,
      hints: ['Each row of carrots is one equal group.', '3 + 3 + 3 + 3 = 12.'],
      variants: [
        numeric('challenge-01-v1', 'A window has 3 rows of panes with 4 panes in each row. How many panes are there?', 12, {
          explanation: '3 rows of 4 is 3 × 4 = 12 panes.',
          tag: ARRAY_TAG,
          hints: ['Each row of panes is one equal group.', '4 + 4 + 4 = 12.'],
        }),
      ],
    }),
    numeric('challenge-02', 'Chairs are set out in 5 rows with 4 chairs in each row. How many chairs are there?', 20, {
      explanation: '5 rows of 4 is 5 × 4 = 20 chairs.',
      tag: ARRAY_TAG,
      hints: ['Each row of chairs is one equal group.', '4 + 4 + 4 + 4 + 4 = 20.'],
      variants: [
        numeric('challenge-02-v1', 'Egg cartons hold eggs in 2 rows of 6. How many eggs fit in one carton?', 12, {
          explanation: '2 rows of 6 is 2 × 6 = 12 eggs.',
          tag: ARRAY_TAG,
          hints: ['Each row of eggs is one equal group.', '6 + 6 = 12.'],
        }),
      ],
    }),
  ],
  reflection: {
    type: 'choice',
    prompt: 'You turn an array of 3 rows of 5 on its side. What happens to the total?',
    options: [
      { id: 'same', text: 'It stays the same: 15' },
      { id: 'more', text: 'It gets bigger' },
      { id: 'less', text: 'It gets smaller' },
    ],
    correctOptionIds: ['same'],
    explanation: 'Turning the array does not add or remove gems, so 3 × 5 and 5 × 3 are both 15.',
  },
  audio: null,
  offlineActivity: 'Look for arrays at home: egg cartons, muffin trays, window panes. Count the rows, the items in each row, and the total.',
};
