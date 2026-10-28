import type { Lesson, ItemVisual, OrderToken } from '../../domain/types.ts';
import { order, choice, opts, NO_REVIEW } from '../helpers.ts';

const ORDER_TAG = 'word-order-subject-verb';

const toks = (...w: string[]): OrderToken[] => w.map((text, i) => ({ id: `w${i + 1}`, text }));
const ids = (n: number) => Array.from({ length: n }, (_, i) => `w${i + 1}`);

export const sentenceOrder: Lesson = {
  schemaVersion: 1,
  id: 'english-g3-sentence-order-01',
  subjectId: 'english',
  level: { grade: 3 },
  chapterId: 'english-g3-sentences',
  order: 1,
  skillIds: ['english.sentence-order'],
  prerequisiteSkillIds: ['english.simple-sentences'],
  title: 'Sentence workshop',
  objective: 'Build sentences with words in an order that makes sense, starting with a capital letter and ending with a punctuation mark.',
  contentLocale: 'en',
  estimatedMinutes: 10,
  status: 'draft',
  contentVersion: 1,
  review: NO_REVIEW,
  conceptBlocks: [
    { type: 'text', text: 'A sentence tells a complete idea. Most sentences say who or what, and then what they do.' },
    {
      type: 'example',
      title: 'Building a sentence',
      steps: [
        'Words: ran / The / dog / fast / .',
        'Who? “The dog”. The capital T shows it starts the sentence.',
        'What did it do? “ran fast”.',
        'End with a full stop: “The dog ran fast.”',
      ],
    },
    { type: 'text', text: 'A question often starts with a word like Where, What or Can, and ends with a question mark (?). Sometimes a word can go in more than one place, and both sentences are correct.' },
  ],
  guidedTasks: [
    order('guided-01', 'Put the words in order to make a sentence.', toks('The', 'cat', 'sat', 'on', 'the', 'mat', '.'), 'words', null, {
      explanation: '“The cat” is who, “sat on the mat” is what it did, and the full stop ends the sentence.',
      tag: ORDER_TAG,
      hints: ['Which word has a capital letter? Start there.', 'Who is the sentence about? What did it do?'],
    }),
    order('guided-02', 'Put the words in order to make a sentence.', toks('I', 'like', 'to', 'read', 'books', '.'), 'words', null, {
      explanation: '“I” is who, “like to read books” tells what I like, and the full stop ends it.',
      tag: ORDER_TAG,
      hints: ['“I” is always a capital letter and is often first.', 'The full stop goes at the very end.'],
    }),
  ],
  game: {
    type: 'sentence-workshop',
    layout: 'words',
    rounds: [
      { tokens: toks('Birds', 'build', 'nests', 'in', 'trees', '.'), accepted: [ids(6)], explanation: '“Birds” is who, “build nests in trees” is what they do.' },
      { tokens: toks('What', 'is', 'your', 'name', '?'), accepted: [ids(5)], explanation: 'A question starting with “What” ends with a question mark.' },
      {
        tokens: toks('Sam', 'quickly', 'ate', 'his', 'lunch', '.'),
        accepted: [ids(6), ['w1', 'w3', 'w4', 'w5', 'w2', 'w6']],
        explanation: '“quickly” can go before “ate” or after “lunch”. Both sentences are correct.',
      },
    ],
  },
  practiceItems: [
    order('practice-01', 'Put the words in order to make a sentence.', toks('The', 'dog', 'ran', 'to', 'the', 'park', '.'), 'words', null, {
      explanation: '“The dog” is who, “ran to the park” is where it went.',
      tag: ORDER_TAG,
      hints: ['Start with the capital letter.', 'Who ran? Where did it go?'],
      variants: [
        order('practice-01-v1', 'Put the words in order to make a sentence.', toks('A', 'frog', 'jumped', 'into', 'the', 'pond', '.'), 'words', null, {
          explanation: '“A frog” is who, “jumped into the pond” is what it did.',
          tag: ORDER_TAG,
          hints: ['Start with the capital letter.', 'Who jumped? Where?'],
        }),
      ],
    }),
    order('practice-02', 'Put the words in order to make a sentence.', toks('My', 'sister', 'likes', 'red', 'apples', '.'), 'words', null, {
      explanation: '“My sister” is who. “red” describes the apples, so it comes just before “apples”.',
      tag: 'adjective-placement',
      hints: ['Who likes something?', 'A describing word like “red” goes before the thing it describes.'],
      variants: [
        order('practice-02-v1', 'Put the words in order to make a sentence.', toks('Our', 'teacher', 'has', 'a', 'green', 'bag', '.'), 'words', null, {
          explanation: '“Our teacher” is who. “green” describes the bag, so it comes before “bag”.',
          tag: 'adjective-placement',
          hints: ['Who has something?', 'A describing word goes before the thing it describes.'],
        }),
      ],
    }),
    order('practice-03', 'Put the words in order to make a question.', toks('Where', 'is', 'my', 'blue', 'hat', '?'), 'words', null, {
      explanation: 'The question word “Where” starts the question, and the question mark ends it.',
      tag: 'question-word-order',
      hints: ['Which word asks a question?', 'Questions end with “?”.'],
      variants: [
        order('practice-03-v1', 'Put the words in order to make a question.', toks('What', 'time', 'does', 'the', 'bus', 'come', '?'), 'words', null, {
          explanation: '“What time” starts the question and the question mark ends it.',
          tag: 'question-word-order',
          hints: ['Which word asks a question?', 'Questions end with “?”.'],
        }),
      ],
    }),
    choice('practice-04', 'Which sentence is in the right order?', opts('We play football after school.', 'Football we after play school.', 'After play we football school.'), 'a', {
      explanation: '“We” is who, “play football” is what, and “after school” is when.',
      tag: ORDER_TAG,
      hints: ['Read each one aloud. Which sounds like something a person would say?', 'Look for who, then what they do.'],
    }),
    order('practice-05', 'Put the words in order. More than one order may be correct.', toks('Sam', 'quickly', 'ate', 'his', 'lunch', '.'), 'words', [ids(6), ['w1', 'w3', 'w4', 'w5', 'w2', 'w6']], {
      explanation: '“Sam quickly ate his lunch.” and “Sam ate his lunch quickly.” are both correct.',
      tag: 'adverb-placement',
      hints: ['Start with who: Sam.', '“quickly” tells how. It can go before “ate” or after “lunch”.'],
    }),
    order('practice-06', 'Put the words in order to make a sentence.', toks('The', 'birds', 'sing', 'in', 'the', 'morning', '.'), 'words', null, {
      explanation: '“The birds” is who, “sing” is what they do, and “in the morning” is when.',
      tag: ORDER_TAG,
      hints: ['Start with the capital letter.', 'Who sings? When?'],
    }),
  ],
  challenges: [
    order('challenge-01', 'Make a question from these words.', toks('Can', 'you', 'help', 'me', 'find', 'my', 'book', '?'), 'words', null, {
      explanation: '“Can you…” starts the question, and the question mark ends it.',
      tag: 'question-word-order',
      hints: ['Which word has a capital letter?', 'The question mark goes last.'],
    }),
    order('challenge-02', 'Make a sentence. More than one order may be correct.', toks('Lina', 'and', 'Omar', 'built', 'a', 'tall', 'tower', '.'), 'words', [ids(8), ['w3', 'w2', 'w1', 'w4', 'w5', 'w6', 'w7', 'w8']], {
      explanation: '“Lina and Omar” (or “Omar and Lina”) is who, and “built a tall tower” is what they did.',
      tag: ORDER_TAG,
      hints: ['Names always start with capital letters, so either name could start.', '“tall” describes the tower.'],
    }),
  ],
  reflection: {
    type: 'choice',
    prompt: 'What helps you put words in order?',
    options: [
      { id: 'who-what', text: 'Find who the sentence is about, then what they do' },
      { id: 'random', text: 'Put the longest word first' },
    ],
    correctOptionIds: ['who-what'],
    explanation: 'Finding who or what, then the action, gives the sentence its shape. Capitals and end marks help too.',
  },
  audio: null,
  offlineActivity: 'Write a sentence on paper strips, one word per strip, mix them up and rebuild it together. Try moving a word to make a different correct sentence.',
};

const SEED_SWAP: ItemVisual = {
  type: 'passage',
  title: 'The Seed Swap',
  paragraphs: [
    'On Saturday, Nadia and her grandfather went to the seed swap at the library. People brought seeds from their gardens and traded them. Nadia brought sunflower seeds. She traded them for bean seeds from a girl named Rosa.',
    'At home, Nadia planted the beans in a big pot by the window. Every morning she checked the soil with her finger. When it felt dry, she gave the pot a little water.',
    'After ten days, two green shoots pushed up through the soil. Nadia smiled. “Next year,” she said, “I will bring bean seeds to the swap.”',
  ],
};

const WEATHER: ItemVisual = {
  type: 'passage',
  title: 'The Weather Chart',
  paragraphs: [
    'Leo’s class kept a weather chart for one week. Each day, a helper looked out of the window and drew a symbol: a sun for sunny, a cloud for cloudy, and drops for rain.',
    'On Monday and Tuesday the helpers drew suns. On Wednesday they drew drops, and the class ate lunch inside. On Thursday and Friday they drew clouds.',
  ],
};

const READ_TAG = 'answers-from-memory-not-text';

export const comprehension: Lesson = {
  schemaVersion: 1,
  id: 'english-g3-comprehension-01',
  subjectId: 'english',
  level: { grade: 3 },
  chapterId: 'english-g3-reading',
  order: 2,
  skillIds: ['english.passage-comprehension'],
  prerequisiteSkillIds: ['english.sentence-order'],
  title: 'Reading detectives',
  objective: 'Read a short passage and answer questions by finding evidence in the text, including one inference.',
  contentLocale: 'en',
  estimatedMinutes: 15,
  status: 'draft',
  contentVersion: 1,
  review: NO_REVIEW,
  conceptBlocks: [
    { type: 'text', text: 'Good readers look back at the text to check their answers. Some answers are written in the text. Others you work out from clues.' },
    {
      type: 'example',
      title: 'Two kinds of question',
      steps: [
        '“Who went with Nadia?” The text says “Nadia and her grandfather”. The answer is right there.',
        '“How did Nadia feel when the shoots came up?” The text says “Nadia smiled”. Smiling is a clue that she felt happy. That is an inference.',
      ],
    },
    { type: 'visual', visual: SEED_SWAP },
  ],
  guidedTasks: [
    choice('guided-01', 'Who went to the seed swap with Nadia?', opts('her grandfather', 'Rosa', 'her teacher'), 'a', {
      explanation: 'The first sentence says “Nadia and her grandfather went to the seed swap”.',
      tag: READ_TAG,
      hints: ['Look at the first sentence.', 'Find the words “Nadia and her…”.'],
      visual: SEED_SWAP,
    }),
    choice('guided-02', 'Where did Nadia put the pot?', opts('by the window', 'in the garden', 'at the library'), 'a', {
      explanation: 'The second paragraph says she planted the beans “in a big pot by the window”.',
      tag: READ_TAG,
      hints: ['Look at the second paragraph.', 'Find the word “pot”. What comes after it?'],
      visual: SEED_SWAP,
    }),
  ],
  game: {
    type: 'word-garden',
    rounds: [
      {
        pairs: [
          { left: { text: 'swap' }, right: { text: 'a time when people trade things' }, why: 'At the seed swap, people traded seeds.' },
          { left: { text: 'soil' }, right: { text: 'earth that plants grow in' }, why: 'Nadia checked the soil in the pot with her finger.' },
          { left: { text: 'shoots' }, right: { text: 'new stems coming out of the ground' }, why: 'Green shoots pushed up through the soil after ten days.' },
        ],
      },
      {
        pairs: [
          { left: { text: 'traded' }, right: { text: 'gave something and got something back' }, why: 'Nadia gave sunflower seeds and got bean seeds.' },
          { left: { text: 'planted' }, right: { text: 'put seeds in the ground to grow' }, why: 'Nadia planted the beans in a pot.' },
          { left: { text: 'smiled' }, right: { text: 'showed she was happy' }, why: 'Nadia smiled when the shoots came up.' },
        ],
      },
    ],
  },
  practiceItems: [
    choice('practice-01', 'Where was the seed swap?', opts('at the library', 'at school', 'at the park'), 'a', {
      explanation: 'The text says they “went to the seed swap at the library”.', tag: READ_TAG, hints: ['Look at the first sentence.', 'Find the word “at”.'], visual: SEED_SWAP,
    }),
    choice('practice-02', 'What did Nadia bring to the swap?', opts('sunflower seeds', 'bean seeds', 'a flower pot'), 'a', {
      explanation: '“Nadia brought sunflower seeds.” She got bean seeds in the trade.', tag: 'confuses-given-and-received', hints: ['She brought one kind and took home another.', 'Find the word “brought”.'], visual: SEED_SWAP,
    }),
    choice('practice-03', 'In the story, what does “traded” mean?', opts('gave something and got something back', 'threw something away', 'kept something hidden'), 'a', {
      explanation: 'Nadia gave sunflower seeds and got bean seeds back. That is trading.', tag: 'vocabulary-in-context', hints: ['What did Nadia give? What did she get?', 'Use the sentences around the word as clues.'], visual: SEED_SWAP,
    }),
    choice('practice-04', 'How did Nadia know when to water the pot?', opts('The soil felt dry', 'Her grandfather told her', 'It was evening'), 'a', {
      explanation: '“When it felt dry, she gave the pot a little water.”', tag: READ_TAG, hints: ['Look at the second paragraph.', 'What did she check with her finger?'], visual: SEED_SWAP,
    }),
    choice('practice-05', 'What happened first?', opts('Nadia went to the seed swap', 'Nadia planted the beans', 'Two green shoots came up'), 'a', {
      explanation: 'She went to the swap, then planted the beans, and ten days later the shoots came up.', tag: 'sequence-confusion', hints: ['The story tells events in order.', 'Look at the first paragraph.'], visual: SEED_SWAP,
    }),
    choice('practice-06', 'Why might Nadia bring bean seeds to the swap next year?', opts('Her bean plants could give her seeds to share', 'She did not like the beans', 'The library asked for sunflowers'), 'a', {
      explanation: 'Her beans are growing, so they can make new seeds she can share. The text does not say she disliked them.', tag: 'inference-without-evidence', hints: ['This answer is not written word for word. Use clues.', 'What is growing in her pot now?'], visual: SEED_SWAP,
    }),
  ],
  challenges: [
    choice('challenge-01', 'How many days were sunny?', opts('1', '2', '3'), 'b', {
      explanation: 'The helpers drew suns on Monday and Tuesday: 2 days.', tag: READ_TAG, hints: ['Find the word “suns”.', 'Count the days named.'], visual: WEATHER,
    }),
    choice('challenge-02', 'Why did the class eat lunch inside on Wednesday?', opts('It was raining', 'It was sunny', 'The helper was away'), 'a', {
      explanation: 'On Wednesday the helpers drew drops, which mean rain. That is why they stayed inside.', tag: 'inference-without-evidence', hints: ['What symbol did they draw on Wednesday?', 'What do drops mean on the chart?'], visual: WEATHER,
    }),
  ],
  reflection: {
    type: 'choice',
    prompt: 'What did you do when you were not sure of an answer?',
    options: [
      { id: 'lookback', text: 'Looked back at the text for clues' },
      { id: 'guess', text: 'Guessed without looking' },
    ],
    correctOptionIds: ['lookback'],
    explanation: 'Looking back at the text gives you evidence for your answer.',
  },
  audio: null,
  offlineActivity: 'After a bedtime story, ask one “right there” question and one “clue” question. Ask: which words in the book helped you?',
};
