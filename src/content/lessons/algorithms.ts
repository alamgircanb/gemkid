import type { Lesson, Item, NumericItem } from '../../domain/types.ts';
import { order, choice, numeric, opts, NO_REVIEW } from '../helpers.ts';

const STEP_TAG = 'order-does-not-matter-belief';

const steps = (...texts: string[]) => texts.map((text, i) => ({ id: `s${i + 1}`, text }));

export const stepOrder: Lesson = {
  schemaVersion: 1,
  id: 'algorithms-b-step-order-01',
  subjectId: 'algorithms',
  level: { stage: 'beginner' },
  chapterId: 'algorithms-b-everyday',
  order: 1,
  skillIds: ['algorithms.step-order'],
  prerequisiteSkillIds: ['algorithms.everyday-sequences'],
  title: 'Algorithms in the right order',
  objective: 'Put the steps of an algorithm in an order that works, and explain why order matters.',
  contentLocale: 'en',
  estimatedMinutes: 10,
  status: 'draft',
  contentVersion: 1,
  review: NO_REVIEW,
  conceptBlocks: [
    { type: 'text', text: 'An algorithm is a list of steps that solves a problem. The order of the steps often matters.' },
    {
      type: 'example',
      title: 'Watering a plant',
      steps: ['Fill the watering can.', 'Carry it to the plant.', 'Pour water on the soil.', 'Put the can away.'],
    },
    { type: 'text', text: 'If you pour before you fill the can, nothing happens. Some steps can swap places, and that is fine too, but each step must happen after the steps it needs.' },
  ],
  guidedTasks: [
    order('guided-01', 'Put the steps for washing hands in order.', steps('Wet your hands.', 'Rub with soap.', 'Rinse off the soap.', 'Dry your hands.'), 'steps', null, {
      explanation: 'You need wet hands for soap, you rinse the soap off, and you dry last.',
      tag: STEP_TAG,
      hints: ['Which step must happen first?', 'Drying comes last: after drying you are done.'],
    }),
    order('guided-02', 'Put the steps for planting a seed in order.', steps('Fill a pot with soil.', 'Make a small hole.', 'Drop in the seed.', 'Cover it and water it.'), 'steps', null, {
      explanation: 'The pot needs soil before you make a hole, and the seed goes in before it is covered.',
      tag: STEP_TAG,
      hints: ['You cannot make a hole in an empty pot.', 'Covering the seed happens after it is in the hole.'],
    }),
  ],
  game: {
    type: 'sentence-workshop',
    layout: 'steps',
    rounds: [
      { tokens: steps('Put bread on a plate.', 'Spread the butter.', 'Add the cheese.', 'Put the second slice on top.'), accepted: [['s1', 's2', 's3', 's4']], explanation: 'Each step builds on the one before. The top slice goes on last.' },
      { tokens: steps('Put on your socks.', 'Put on your shoes.', 'Tie the laces.'), accepted: [['s1', 's2', 's3']], explanation: 'Socks go on before shoes, and you can only tie laces once the shoes are on.' },
      {
        tokens: steps('Write the letter.', 'Fold it.', 'Put it in an envelope.', 'Write the address.', 'Post it.'),
        accepted: [['s1', 's2', 's3', 's4', 's5'], ['s4', 's1', 's2', 's3', 's5'], ['s1', 's4', 's2', 's3', 's5']],
        explanation: 'The address can be written at different times, but posting must be last and folding comes before the envelope.',
      },
    ],
  },
  practiceItems: [
    order('practice-01', 'Put the steps for brushing teeth in order.', steps('Put toothpaste on the brush.', 'Brush all your teeth.', 'Spit and rinse.', 'Rinse the brush.'), 'steps', [['s1', 's2', 's3', 's4'], ['s1', 's2', 's4', 's3']], {
      explanation: 'Toothpaste first, brushing next. Spitting and rinsing the brush can happen in either order.',
      tag: STEP_TAG,
      hints: ['What do you need on the brush before brushing?', 'Brushing must happen before rinsing.'],
    }),
    order('practice-02', 'Put the steps for making a cup of hot chocolate (with an adult) in order.', steps('Warm the milk.', 'Pour it into a cup.', 'Stir in the chocolate powder.', 'Let it cool a little before drinking.'), 'steps', [['s1', 's2', 's3', 's4'], ['s1', 's3', 's2', 's4']], {
      explanation: 'The milk is warmed first and you wait before drinking so it is not too hot. You can stir the powder in before or after pouring.',
      tag: STEP_TAG,
      hints: ['What has to be in the cup before you can stir?', 'Drinking is the last step.'],
    }),
    choice('practice-03', 'Steps: 1. Open the door. 2. Walk outside. 3. Put on your coat. Which step is in the wrong place?', opts('Step 1', 'Step 2', 'Step 3'), 'c', {
      explanation: 'The coat should go on before you walk outside, so step 3 is in the wrong place.',
      tag: STEP_TAG,
      hints: ['Act it out. When do you want your coat on?', 'Which step should move earlier?'],
    }),
    order('practice-04', 'Put the steps for reading a library book in order.', steps('Find the book on the shelf.', 'Borrow it at the desk.', 'Read it at home.', 'Return it to the library.'), 'steps', null, {
      explanation: 'You find, borrow, read and then return the book.',
      tag: STEP_TAG,
      hints: ['What must happen before you can take the book home?', 'Returning is the last step.'],
    }),
    choice('practice-05', 'Which of these steps can swap places without causing a problem?', opts('Put on a hat and put on gloves', 'Put on socks and put on shoes', 'Fill a glass and drink from it'), 'a', {
      explanation: 'A hat and gloves do not depend on each other. Socks must be before shoes, and you must fill a glass before drinking.',
      tag: 'thinks-all-orders-matter',
      hints: ['Does one step need the other to be done first?', 'Hats and gloves go on different parts of your body.'],
    }),
    order('practice-06', 'Put the steps for feeding a pet fish in order.', steps('Check the fish food label.', 'Take a small pinch of food.', 'Sprinkle it on the water.', 'Close the food container.'), 'steps', [['s1', 's2', 's3', 's4'], ['s1', 's2', 's4', 's3']], {
      explanation: 'Check, take a pinch, then feed. Closing the container can happen before or after sprinkling.',
      tag: STEP_TAG,
      hints: ['You need food in your fingers before you can sprinkle it.', 'Which steps could swap?'],
    }),
  ],
  challenges: [
    order('challenge-01', 'Put the steps for crossing a street with an adult in order.', steps('Stop at the edge of the road.', 'Look and listen for traffic both ways.', 'Wait until it is clear.', 'Walk straight across.'), 'steps', null, {
      explanation: 'You stop, check, wait until it is clear and only then cross.',
      tag: STEP_TAG,
      hints: ['What must you do before checking for traffic?', 'Crossing is last.'],
    }),
    order('challenge-02', 'Put the steps for finding the tallest tower in a row of block towers in order.', steps('Look at the first tower and remember it as the tallest so far.', 'Look at the next tower.', 'If it is taller, remember it instead.', 'Keep going until there are no towers left.'), 'steps', null, {
      explanation: 'This algorithm starts with a guess, then checks each tower and updates the tallest so far until it reaches the end.',
      tag: STEP_TAG,
      hints: ['You need a “tallest so far” before you can compare.', 'Stopping at the end comes last.'],
    }),
  ],
  reflection: {
    type: 'choice',
    prompt: 'Why does the order of steps matter in an algorithm?',
    options: [
      { id: 'needs', text: 'Some steps need other steps to be done first' },
      { id: 'never', text: 'It never matters' },
    ],
    correctOptionIds: ['needs'],
    explanation: 'Many steps depend on earlier steps. Steps that do not depend on each other can sometimes swap.',
  },
  audio: null,
  offlineActivity: 'Write a morning routine on sticky notes, mix them up, and ask your child to put them in an order that works. Which notes could swap?',
};

const SEARCH_TAG = 'stops-before-checking-all';

function searchItem(id: string, items: string[], target: string, variants?: Item[]): NumericItem {
  const pos = items.indexOf(target) + 1;
  return numeric(
    id,
    `You open boxes from left to right, one at a time, looking for the ${target}. How many boxes do you open?`,
    pos,
    {
      explanation: `The ${target} is in box ${pos}. Checking from the left, you open boxes 1 to ${pos}: that is ${pos} boxes.`,
      tag: 'miscounts-inspections',
      hints: ['Start at the first box and count every box you open.', `The ${target} is in box number ${pos}.`],
      visual: { type: 'boxes', boxes: items.map((c, i) => ({ label: `Box ${i + 1}`, contents: c })), altText: `Boxes in order: ${items.join(', ')}.` },
      variants,
    },
  );
}

export const linearSearch: Lesson = {
  schemaVersion: 1,
  id: 'algorithms-b-linear-search-01',
  subjectId: 'algorithms',
  level: { stage: 'beginner' },
  chapterId: 'algorithms-b-searching',
  order: 2,
  skillIds: ['algorithms.linear-search'],
  prerequisiteSkillIds: ['algorithms.step-order'],
  title: 'Treasure search',
  objective: 'Search a list one item at a time and count how many checks a linear search needs.',
  contentLocale: 'en',
  estimatedMinutes: 12,
  status: 'draft',
  contentVersion: 1,
  review: NO_REVIEW,
  conceptBlocks: [
    { type: 'text', text: 'A linear search checks items one at a time, in order, until it finds what it wants or runs out of items.' },
    {
      type: 'example',
      title: 'Finding the key',
      steps: [
        'Boxes in a row: shoe, ball, key, book.',
        'Open box 1: shoe. Not it.',
        'Open box 2: ball. Not it.',
        'Open box 3: key. Found it, so stop. That took 3 checks.',
      ],
    },
    { type: 'text', text: 'If the boxes are in no special order, the only way to be sure something is missing is to check every box.' },
  ],
  guidedTasks: [
    searchItem('guided-01', ['shoe', 'ball', 'key', 'book'], 'key'),
    searchItem('guided-02', ['cup', 'hat', 'map', 'coin', 'pen'], 'coin'),
  ],
  game: {
    type: 'treasure-search',
    mode: 'linear',
    rounds: [
      { items: ['shell', 'pebble', 'key', 'leaf', 'button'], target: 'key' },
      { items: ['ribbon', 'marble', 'stamp', 'acorn', 'crown', 'feather'], target: 'crown' },
      { items: ['bell', 'spoon', 'ring', 'cork', 'star', 'clip', 'bead'], target: 'bead' },
    ],
  },
  practiceItems: [
    searchItem('practice-01', ['ball', 'sock', 'gem', 'cap'], 'gem', [searchItem('practice-01-v1', ['cap', 'gem', 'sock', 'ball'], 'gem')]),
    searchItem('practice-02', ['leaf', 'stone', 'shell', 'twig', 'seed', 'feather'], 'seed', [searchItem('practice-02-v1', ['twig', 'seed', 'leaf', 'stone', 'feather', 'shell'], 'feather')]),
    searchItem('practice-03', ['apple', 'pear', 'plum', 'lime', 'fig', 'kiwi', 'date', 'grape'], 'grape', [searchItem('practice-03-v1', ['fig', 'kiwi', 'apple', 'date', 'grape', 'lime', 'pear', 'plum'], 'plum')]),
    numeric('practice-04', 'There are 6 boxes and the ring is not in any of them. With a linear search, how many boxes must you open to be sure?', 6, {
      explanation: 'To be sure something is missing, a linear search must check every box: all 6.',
      tag: SEARCH_TAG,
      hints: ['Could the ring be in a box you have not opened yet?', 'You must check them all.'],
      variants: [
        numeric('practice-04-v1', 'There are 9 boxes and the coin is not in any of them. With a linear search, how many boxes must you open to be sure?', 9, {
          explanation: 'To be sure something is missing, a linear search must check every box: all 9.',
          tag: SEARCH_TAG,
          hints: ['Could the coin be in a box you have not opened yet?', 'You must check them all.'],
        }),
      ],
    }),
    choice('practice-05', 'A linear search finds the toy in the first box it opens. What should it do next?', opts('Stop: the toy is found', 'Open all the other boxes anyway', 'Start again from the end'), 'a', {
      explanation: 'A linear search stops as soon as it finds the item. Checking more boxes wastes time.',
      tag: 'does-not-stop-when-found',
      hints: ['What was the search looking for?', 'Is there anything left to find?'],
    }),
    choice('practice-06', 'Which list would take the most checks to find the cat with a linear search from the left?', opts('cat, dog, fish', 'dog, cat, fish', 'dog, fish, cat'), 'c', {
      explanation: 'The further right the cat is, the more checks it takes. In “dog, fish, cat” it takes 3 checks.',
      tag: 'miscounts-inspections',
      hints: ['Count the checks for each list.', 'Which list has the cat last?'],
    }),
  ],
  challenges: [
    numeric('challenge-01', 'In a row of 10 lockers, the ball is in locker 7. You check from locker 1 upward. How many lockers do you open?', 7, {
      explanation: 'You open lockers 1, 2, 3, 4, 5, 6 and 7, then stop: 7 lockers.',
      tag: 'miscounts-inspections',
      hints: ['You stop when you find the ball.', 'Count from locker 1 to locker 7.'],
      variants: [
        numeric('challenge-01-v1', 'In a row of 12 lockers, the scarf is in locker 5. You check from locker 1 upward. How many lockers do you open?', 5, {
          explanation: 'You open lockers 1 to 5, then stop: 5 lockers.',
          tag: 'miscounts-inspections',
          hints: ['You stop when you find the scarf.', 'Count from locker 1 to locker 5.'],
        }),
      ],
    }),
    numeric('challenge-02', 'Same 10 lockers, ball still in locker 7. This time you search from locker 10 downward. How many lockers do you open?', 4, {
      explanation: 'You open lockers 10, 9, 8 and 7: 4 lockers. The starting end changes the number of checks.',
      tag: 'assumes-start-from-left',
      hints: ['Which locker do you open first now?', 'Count 10, 9, 8, 7.'],
      variants: [
        numeric('challenge-02-v1', 'Same 12 lockers, scarf still in locker 5. This time you search from locker 12 downward. How many lockers do you open?', 8, {
          explanation: 'You open lockers 12, 11, 10, 9, 8, 7, 6 and 5: 8 lockers.',
          tag: 'assumes-start-from-left',
          hints: ['Which locker do you open first now?', 'Count down from 12 to 5.'],
        }),
      ],
    }),
  ],
  reflection: {
    type: 'choice',
    prompt: 'When does a linear search take the most checks?',
    options: [
      { id: 'last', text: 'When the item is last or not there at all' },
      { id: 'first', text: 'When the item is first' },
    ],
    correctOptionIds: ['last'],
    explanation: 'If the item is last or missing, the search has to look at every item.',
  },
  audio: null,
  offlineActivity: 'Hide a small toy under one of five cups. Your child lifts cups from left to right and counts the lifts. Swap and compare.',
};
