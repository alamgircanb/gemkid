import type { ChoiceItem, Lesson, ShapeId, Item } from '../../domain/types.ts';
import { choice, opts, NO_REVIEW } from '../helpers.ts';

const SHAPE_NAME: Record<ShapeId, string> = {
  circle: 'circle',
  triangle: 'triangle',
  square: 'square',
  star: 'star',
  diamond: 'diamond',
  heart: 'heart',
};

function patternItem(id: string, unit: ShapeId[], length: number, missing: number, options: ShapeId[], variants?: Item[]): ChoiceItem {
  const seq: (ShapeId | null)[] = Array.from({ length }, (_, i) => unit[i % unit.length]);
  const answer = seq[missing] as ShapeId;
  seq[missing] = null;
  const unitText = unit.map((s) => SHAPE_NAME[s]).join(', ');
  return choice(
    id,
    'Which shape fills the gap in the pattern?',
    options.map((s) => ({ id: s, text: SHAPE_NAME[s], shape: s })),
    answer,
    {
      explanation: `The repeating unit is ${unitText}. It repeats every ${unit.length} shapes, so the gap needs a ${SHAPE_NAME[answer]}.`,
      tag: 'guesses-without-finding-unit',
      hints: [
        'Say the shapes out loud from the start. Where does the pattern begin again?',
        `The pattern repeats every ${unit.length} shapes: ${unitText}.`,
      ],
      visual: {
        type: 'pattern',
        sequence: seq,
        altText: `Pattern: ${seq.map((s) => (s ? SHAPE_NAME[s] : 'gap')).join(', ')}.`,
      },
      variants,
    },
  );
}

export const patterns: Lesson = {
  schemaVersion: 1,
  id: 'logic-b-patterns-01',
  subjectId: 'logic',
  level: { stage: 'beginner' },
  chapterId: 'logic-b-patterns',
  order: 1,
  skillIds: ['logic.repeating-patterns'],
  prerequisiteSkillIds: ['logic.matching-sorting'],
  title: 'Pattern bridges',
  objective: 'Find the repeating unit of a pattern and use it to predict a missing or next part.',
  contentLocale: 'en',
  estimatedMinutes: 10,
  status: 'draft',
  contentVersion: 1,
  review: NO_REVIEW,
  conceptBlocks: [
    { type: 'text', text: 'A repeating pattern has a unit: a small part that repeats again and again.' },
    { type: 'visual', visual: { type: 'pattern', sequence: ['circle', 'triangle', 'circle', 'triangle', 'circle', 'triangle'], altText: 'Pattern: circle, triangle, circle, triangle, circle, triangle.' } },
    {
      type: 'example',
      title: 'Finding the unit',
      steps: [
        'Read the shapes from the start: circle, triangle, circle, triangle…',
        'The pattern starts again after 2 shapes, so the unit is “circle, triangle”.',
        'To find any gap, count along the unit: 1 circle, 2 triangle, 1 circle, 2 triangle…',
      ],
    },
    { type: 'text', text: 'Each shape also has its name written beside it, so you never need colour to solve a pattern.' },
  ],
  guidedTasks: [
    patternItem('guided-01', ['star', 'circle'], 6, 3, ['star', 'circle', 'square']),
    patternItem('guided-02', ['square', 'square', 'heart'], 6, 5, ['square', 'heart', 'triangle']),
  ],
  game: {
    type: 'pattern-bridge',
    rounds: [
      { sequence: ['circle', 'square', 'circle', 'square', null, 'square'], options: ['circle', 'square', 'star'], answer: 'circle', unit: 2 },
      { sequence: ['star', 'star', 'diamond', 'star', 'star', null], options: ['star', 'diamond', 'heart'], answer: 'diamond', unit: 3 },
      { sequence: ['triangle', 'heart', 'square', null, 'heart', 'square'], options: ['heart', 'square', 'triangle'], answer: 'triangle', unit: 3 },
      { sequence: ['circle', 'circle', 'star', 'star', 'circle', 'circle', null, 'star'], options: ['circle', 'star', 'diamond'], answer: 'star', unit: 4 },
    ],
  },
  practiceItems: [
    patternItem('practice-01', ['heart', 'square'], 6, 4, ['heart', 'square', 'circle'], [patternItem('practice-01-v1', ['diamond', 'circle'], 6, 4, ['circle', 'diamond', 'star'])]),
    patternItem('practice-02', ['triangle', 'triangle', 'circle'], 6, 2, ['triangle', 'circle', 'heart'], [patternItem('practice-02-v1', ['star', 'star', 'square'], 6, 5, ['star', 'square', 'heart'])]),
    patternItem('practice-03', ['star', 'diamond', 'circle'], 7, 4, ['star', 'diamond', 'circle'], [patternItem('practice-03-v1', ['heart', 'triangle', 'square'], 7, 4, ['heart', 'triangle', 'square'])]),
    patternItem('practice-04', ['square', 'circle', 'circle'], 8, 7, ['square', 'circle', 'star'], [patternItem('practice-04-v1', ['triangle', 'star', 'star'], 8, 7, ['triangle', 'star', 'circle'])]),
    patternItem('practice-05', ['heart', 'heart', 'diamond', 'diamond'], 8, 6, ['heart', 'diamond', 'square'], [patternItem('practice-05-v1', ['circle', 'circle', 'square', 'square'], 8, 5, ['circle', 'square', 'triangle'])]),
    patternItem('practice-06', ['circle', 'triangle', 'square', 'star'], 8, 6, ['circle', 'triangle', 'square', 'star'], [patternItem('practice-06-v1', ['diamond', 'heart', 'star', 'square'], 8, 5, ['diamond', 'heart', 'star', 'square'])]),
  ],
  challenges: [
    choice('challenge-01', 'Mia threads beads: red, blue, blue, red, blue, blue, red, … What colour is the next bead?', opts('red', 'blue', 'yellow'), 'b', {
      explanation: 'The unit is “red, blue, blue”. After the third red, the unit continues with blue.',
      tag: 'guesses-without-finding-unit',
      hints: ['Find where the pattern starts again.', 'The unit has 3 beads: red, blue, blue. Which bead comes after red?'],
      variants: [
        choice('challenge-01-v1', 'A flag line goes: green, green, white, green, green, white, green, … What comes next?', opts('white', 'green', 'red'), 'b', {
          explanation: 'The unit is “green, green, white”. After the first green of a new unit comes another green.',
          tag: 'guesses-without-finding-unit',
          hints: ['Find where the pattern starts again.', 'The unit is green, green, white. Where are you in the unit?'],
        }),
      ],
    }),
    choice('challenge-02', 'A dance repeats: clap, stomp, stomp. What is the 7th move?', opts('clap', 'stomp', 'jump'), 'a', {
      explanation: 'The unit has 3 moves. Moves 1, 4 and 7 all start a unit, so move 7 is clap.',
      tag: 'counts-from-wrong-position',
      hints: ['Write the moves with numbers: 1 clap, 2 stomp, 3 stomp, 4 …', 'Each unit starts on moves 1, 4, 7 …'],
      variants: [
        choice('challenge-02-v1', 'A song repeats: la, la, hum. What is the 8th sound?', opts('la', 'hum', 'clap'), 'a', {
          explanation: 'The unit has 3 sounds. Units start on 1, 4, 7, so sound 7 is la and sound 8 is la too.',
          tag: 'counts-from-wrong-position',
          hints: ['Number the sounds: 1 la, 2 la, 3 hum, 4 …', 'Sound 7 starts a new unit.'],
        }),
      ],
    }),
  ],
  reflection: {
    type: 'choice',
    prompt: 'What is the best first step when you meet a new pattern?',
    options: [
      { id: 'unit', text: 'Find the part that repeats' },
      { id: 'guess', text: 'Guess the shape I like best' },
      { id: 'last', text: 'Copy the last shape' },
    ],
    correctOptionIds: ['unit'],
    explanation: 'Finding the repeating unit lets you predict any position in the pattern.',
  },
  audio: null,
  offlineActivity: 'Make a pattern with spoons and forks or with claps and stomps. Ask your child to continue it and to invent a new one for you.',
};

const DED_TAG = 'ignores-a-clue';

export const deduction: Lesson = {
  schemaVersion: 1,
  id: 'logic-b-deduction-01',
  subjectId: 'logic',
  level: { stage: 'beginner' },
  chapterId: 'logic-b-reasoning',
  order: 2,
  skillIds: ['logic.deduction'],
  prerequisiteSkillIds: ['logic.matching-sorting'],
  title: 'Gem detective',
  objective: 'Use clues one at a time to rule out choices until only one answer is left.',
  contentLocale: 'en',
  estimatedMinutes: 12,
  status: 'draft',
  contentVersion: 1,
  review: NO_REVIEW,
  conceptBlocks: [
    { type: 'text', text: 'A detective does not guess. Each clue lets you cross out choices that cannot be right.' },
    {
      type: 'example',
      title: 'Which box holds the gem?',
      steps: [
        'Boxes: big red, small red, big blue, small blue.',
        'Clue 1: “The box is not red.” Cross out big red and small red.',
        'Clue 2: “The box is small.” Cross out big blue.',
        'Only small blue is left, so the gem is in the small blue box.',
      ],
    },
  ],
  guidedTasks: [
    choice('guided-01', 'Boxes: big red, small red, big green. Clue: the box is small. Which box is it?', opts('big red', 'small red', 'big green'), 'b', {
      explanation: 'Only one box is small: the small red box.',
      tag: DED_TAG,
      hints: ['Cross out every box that is big.', 'Which box is left?'],
    }),
    choice(
      'guided-02',
      'Boxes: small blue, big blue, small yellow. Clue 1: the box is not yellow. Clue 2: the box is big. Which box is it?',
      opts('small blue', 'big blue', 'small yellow'),
      'b',
      {
        explanation: 'Clue 1 removes small yellow. Clue 2 removes small blue. Big blue is left.',
        tag: DED_TAG,
        hints: ['Use clue 1 first: cross out yellow.', 'Now use clue 2 on the boxes that are left.'],
      },
    ),
  ],
  game: {
    type: 'treasure-search',
    mode: 'clues',
    rounds: [
      {
        boxes: [
          { id: 'b1', label: 'Box A', colour: 'red', shape: 'circle', size: 'big' },
          { id: 'b2', label: 'Box B', colour: 'blue', shape: 'circle', size: 'small' },
          { id: 'b3', label: 'Box C', colour: 'blue', shape: 'square', size: 'big' },
        ],
        clues: ['The box is blue.', 'The box has a circle on it.'],
        answerId: 'b2',
        explanation: '“Blue” rules out Box A. “Circle” rules out Box C. Box B is left.',
      },
      {
        boxes: [
          { id: 'b1', label: 'Box A', colour: 'green', shape: 'star', size: 'small' },
          { id: 'b2', label: 'Box B', colour: 'green', shape: 'heart', size: 'big' },
          { id: 'b3', label: 'Box C', colour: 'yellow', shape: 'star', size: 'big' },
          { id: 'b4', label: 'Box D', colour: 'yellow', shape: 'heart', size: 'small' },
        ],
        clues: ['The box is big.', 'The box does not have a heart on it.'],
        answerId: 'b3',
        explanation: '“Big” leaves Box B and Box C. “Not a heart” rules out Box B. Box C is left.',
      },
      {
        boxes: [
          { id: 'b1', label: 'Box A', colour: 'red', shape: 'triangle', size: 'small' },
          { id: 'b2', label: 'Box B', colour: 'blue', shape: 'triangle', size: 'big' },
          { id: 'b3', label: 'Box C', colour: 'red', shape: 'square', size: 'big' },
          { id: 'b4', label: 'Box D', colour: 'blue', shape: 'square', size: 'small' },
        ],
        clues: ['The box is not red.', 'The box is not big.'],
        answerId: 'b4',
        explanation: '“Not red” leaves Box B and Box D. “Not big” rules out Box B. Box D is left.',
      },
    ],
  },
  practiceItems: [
    choice('practice-01', 'Boxes: big red, small red, small blue, big blue. Clue 1: not red. Clue 2: not big. Which box?', opts('big red', 'small red', 'small blue', 'big blue'), 'c', {
      explanation: '“Not red” leaves the two blue boxes. “Not big” leaves small blue.',
      tag: DED_TAG,
      hints: ['Cross out both red boxes.', 'Of the blue boxes, which one is not big?'],
    }),
    choice('practice-02', 'Cups: a striped cup, a spotted cup and a plain cup. The ball is not under the plain cup. It is not under the spotted cup. Where is it?', opts('striped cup', 'spotted cup', 'plain cup'), 'a', {
      explanation: 'Two cups are ruled out, so the ball must be under the striped cup.',
      tag: DED_TAG,
      hints: ['Cross out the plain cup.', 'Now cross out the spotted cup.'],
    }),
    choice('practice-03', 'I am a number from 1 to 5. I am odd. I am bigger than 3. Which number am I?', opts('1', '3', '5', '4'), 'c', {
      explanation: 'The odd numbers are 1, 3 and 5. Only 5 is bigger than 3.',
      tag: DED_TAG,
      hints: ['List the odd numbers from 1 to 5.', 'Which of them is bigger than 3? (3 is not bigger than 3.)'],
    }),
    choice(
      'practice-04',
      'Ana, Ben and Cal each have one pet: a cat, a dog or a fish. Ana has the cat. Ben does not have the fish. Which pet does Ben have?',
      opts('cat', 'dog', 'fish'),
      'b',
      {
        explanation: 'The cat belongs to Ana. Ben does not have the fish. The dog is the only pet left for Ben.',
        tag: DED_TAG,
        hints: ['The cat is taken by Ana.', 'Ben cannot have the fish. What is left?'],
      },
    ),
    choice('practice-05', 'Shapes: red circle, blue circle, red square. Clue: the shape is red and it is not a circle. Which shape?', opts('red circle', 'blue circle', 'red square'), 'c', {
      explanation: 'Red leaves red circle and red square. Not a circle leaves red square. Both clues must be true.',
      tag: 'uses-only-one-clue',
      hints: ['Use the first part of the clue: red.', 'Now use the second part: not a circle.'],
    }),
    choice('practice-06', 'Three friends stand in a line. Zoe is first. Leo is not last. Who is last?', opts('Zoe', 'Leo', 'Sam'), 'c', {
      explanation: 'Zoe is first, so she is not last. Leo is not last. Sam must be last.',
      tag: DED_TAG,
      hints: ['Can the first person also be last?', 'Cross out Zoe and Leo.'],
    }),
  ],
  challenges: [
    choice(
      'challenge-01',
      'Kai, Mei and Raj each pick one fruit: apple, banana or pear. Kai does not pick the banana. Mei picks the pear. Which fruit does Raj pick?',
      opts('apple', 'banana', 'pear'),
      'b',
      {
        explanation: 'Mei has the pear. Kai cannot have the banana, so Kai has the apple. The banana is left for Raj.',
        tag: DED_TAG,
        hints: ['Start with the clue that tells you exactly: Mei has the pear.', 'Now what can Kai have?'],
      },
    ),
    choice('challenge-02', 'I am a number between 10 and 20. I am even. My two digits add up to 3. Which number am I?', opts('11', '12', '14', '21'), 'b', {
      explanation: '12 is between 10 and 20, it is even, and 1 + 2 = 3. 11 is odd, 14 has digits that add to 5, and 21 is bigger than 20.',
      tag: DED_TAG,
      hints: ['Cross out numbers not between 10 and 20, and odd numbers.', 'Add the digits of what is left.'],
    }),
  ],
  reflection: {
    type: 'choice',
    prompt: 'What helped you solve the clue puzzles?',
    options: [
      { id: 'cross', text: 'Crossing out choices one clue at a time' },
      { id: 'guess', text: 'Picking quickly without reading every clue' },
    ],
    correctOptionIds: ['cross'],
    explanation: 'Using every clue and crossing out what cannot be true leaves only the right answer.',
  },
  audio: null,
  offlineActivity: 'Play “I am thinking of something in this room…” and give one clue at a time. Swap roles so your child writes the clues.',
};
