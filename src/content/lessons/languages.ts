import type { Lesson, ChoiceOption } from '../../domain/types.ts';
import { choice, NO_REVIEW } from '../helpers.ts';

const fr = (id: string, text: string): ChoiceOption => ({ id, text, lang: 'fr' });
const en = (id: string, text: string): ChoiceOption => ({ id, text });
const bn = (id: string, text: string, symbol?: string): ChoiceOption => ({ id, text, lang: 'bn', symbol });

const FR_TAG = 'one-translation-fits-all';

export const frenchGreetings: Lesson = {
  schemaVersion: 1,
  id: 'french-b-greetings-01',
  subjectId: 'french',
  level: { stage: 'beginner' },
  chapterId: 'french-b-hello',
  order: 1,
  skillIds: ['french.greetings'],
  prerequisiteSkillIds: [],
  title: 'Bonjour! French greetings',
  objective: 'Recognise common French greetings and polite words, and choose one that fits the situation.',
  contentLocale: 'en',
  estimatedMinutes: 10,
  status: 'draft',
  contentVersion: 1,
  review: NO_REVIEW,
  conceptBlocks: [
    { type: 'text', text: 'In French, the greeting you choose depends on the time of day and on who you are talking to.' },
    {
      type: 'vocab',
      entries: [
        { term: 'bonjour', lang: 'fr', meaning: 'hello / good day', note: 'Polite. Use it with anyone during the day.', symbol: '☀️' },
        { term: 'bonsoir', lang: 'fr', meaning: 'good evening', note: 'Use it when you meet someone in the evening.', symbol: '🌙' },
        { term: 'salut', lang: 'fr', meaning: 'hi / bye', note: 'Informal. Use it with friends and family.', symbol: '👋' },
        { term: 'au revoir', lang: 'fr', meaning: 'goodbye', note: 'Polite. Use it with anyone.', symbol: '🚪' },
        { term: 'merci', lang: 'fr', meaning: 'thank you', symbol: '🎁' },
        { term: 's’il te plaît', lang: 'fr', meaning: 'please (to a friend or child)' },
        { term: 's’il vous plaît', lang: 'fr', meaning: 'please (polite, or to more than one person)' },
      ],
    },
    { type: 'text', text: 'A word does not always have just one English match. “Salut” can mean both “hi” and “bye” between friends.' },
  ],
  guidedTasks: [
    choice('guided-01', 'What does “merci” mean?', [en('a', 'thank you'), en('b', 'good evening'), en('c', 'goodbye')], 'a', {
      explanation: '“Merci” means “thank you”.',
      tag: FR_TAG,
      hints: ['Look at the word list in Discover.', 'You say it when someone gives you something.'],
    }),
    choice('guided-02', 'Which word means “goodbye” and is polite with anyone?', [fr('a', 'au revoir'), fr('b', 'bonjour'), fr('c', 'merci')], 'a', {
      explanation: '“Au revoir” is a polite goodbye.',
      tag: FR_TAG,
      hints: ['“Bonjour” is for arriving, not leaving.', 'Look for the word with “revoir” (see again).'],
    }),
  ],
  game: {
    type: 'word-garden',
    rounds: [
      {
        pairs: [
          { left: { text: 'bonjour', lang: 'fr' }, right: { text: 'hello / good day', symbol: '☀️' }, why: '“Bonjour” is the polite daytime greeting.' },
          { left: { text: 'merci', lang: 'fr' }, right: { text: 'thank you', symbol: '🎁' }, why: '“Merci” means “thank you”.' },
          { left: { text: 'au revoir', lang: 'fr' }, right: { text: 'goodbye', symbol: '🚪' }, why: '“Au revoir” is a polite goodbye.' },
        ],
      },
      {
        pairs: [
          { left: { text: 'bonsoir', lang: 'fr' }, right: { text: 'good evening', symbol: '🌙' }, why: '“Bonsoir” is used in the evening.' },
          { left: { text: 'salut', lang: 'fr' }, right: { text: 'hi (to a friend)', symbol: '👋' }, why: '“Salut” is informal, for friends and family.' },
          { left: { text: 's’il te plaît', lang: 'fr' }, right: { text: 'please (to a friend)' }, why: '“S’il te plaît” is “please” when talking to a friend.' },
        ],
      },
    ],
  },
  practiceItems: [
    choice('practice-01', 'You arrive at school in the morning and see your teacher. What do you say?', [fr('a', 'Bonjour, Madame.'), fr('b', 'Salut!'), fr('c', 'Bonsoir.')], 'a', {
      explanation: 'In the morning, with a teacher, a polite “Bonjour” fits. “Salut” is for friends, “Bonsoir” for the evening.',
      tag: 'register-confusion',
      hints: ['Is it day or evening?', 'Is a teacher a friend you use informal words with?'],
    }),
    choice('practice-02', 'What does “bonsoir” mean?', [en('a', 'good evening'), en('b', 'good morning'), en('c', 'thank you')], 'a', {
      explanation: '“Bonsoir” means “good evening”. “Soir” means “evening”.',
      tag: FR_TAG,
      hints: ['“soir” is part of the word.', 'You say it later in the day.'],
    }),
    choice('practice-03', 'You meet your best friend at the park. Which greeting is friendly and informal?', [fr('a', 'Salut!'), fr('b', 'Au revoir.'), fr('c', 'Merci.')], 'a', {
      explanation: '“Salut” is the informal hello between friends.',
      tag: 'register-confusion',
      hints: ['You are arriving, not leaving.', 'Which word is used with friends?'],
    }),
    choice('practice-04', 'You are leaving a shop. What do you say to the shopkeeper?', [fr('a', 'Au revoir!'), fr('b', 'Bonjour!'), fr('c', 's’il te plaît')], 'a', {
      explanation: 'When you leave, “Au revoir” is a polite goodbye.',
      tag: FR_TAG,
      hints: ['Are you arriving or leaving?', 'Choose the polite goodbye.'],
    }),
    choice('practice-05', 'Which phrase means “please” when you talk to a friend?', [fr('a', 's’il te plaît'), fr('b', 's’il vous plaît'), fr('c', 'merci')], 'a', {
      explanation: '“S’il te plaît” is used with a friend. “S’il vous plaît” is the polite form, or for more than one person.',
      tag: 'register-confusion',
      hints: ['“te” is used with a friend.', '“vous” is polite or plural.'],
    }),
    choice('practice-06', 'What does “bonjour” mean?', [en('a', 'hello / good day'), en('b', 'goodbye'), en('c', 'please')], 'a', {
      explanation: '“Bonjour” means hello or good day. “Bon” = good, “jour” = day.',
      tag: FR_TAG,
      hints: ['“jour” means day.', 'You say it when you arrive.'],
    }),
  ],
  challenges: [
    choice('challenge-01', 'Your friend lends you a pencil. What do you say?', [fr('a', 'Merci!'), fr('b', 'Bonsoir!'), fr('c', 'Au revoir!')], 'a', {
      explanation: 'When someone gives or lends you something, you say “Merci”.',
      tag: FR_TAG,
      hints: ['What do you say when someone helps you?', 'Think “thank you”.'],
    }),
    choice('challenge-02', 'At 7 o’clock in the evening you visit your neighbour. Which greeting fits best?', [fr('a', 'Bonsoir, Monsieur.'), fr('b', 'Bonjour, Monsieur.'), fr('c', 'Salut!')], 'a', {
      explanation: 'In the evening, the polite greeting is “Bonsoir”. A neighbour is usually greeted politely.',
      tag: 'register-confusion',
      hints: ['What time of day is it?', 'Is a neighbour someone you speak to politely?'],
    }),
  ],
  reflection: {
    type: 'choice',
    prompt: 'What helps you choose a French greeting?',
    options: [
      { id: 'context', text: 'The time of day and who I am talking to' },
      { id: 'longest', text: 'Choosing the longest word' },
    ],
    correctOptionIds: ['context'],
    explanation: 'Greetings change with the time of day and with how polite you need to be.',
  },
  audio: null,
  offlineActivity: 'Greet each other in French for a day: “Bonjour” at breakfast, “Bonsoir” at dinner, “Merci” at the table.',
};

const BN_TAG = 'letter-shape-confusion';

export const bengaliLetters: Lesson = {
  schemaVersion: 1,
  id: 'bengali-b-letters-01',
  subjectId: 'bengali',
  level: { stage: 'beginner' },
  chapterId: 'bengali-b-first-letters',
  order: 1,
  skillIds: ['bengali.first-letters'],
  prerequisiteSkillIds: [],
  title: 'First Bengali letters: অ আ ই ক',
  objective: 'Recognise the letters অ, আ, ই and ক, and find words that begin with them.',
  contentLocale: 'en',
  estimatedMinutes: 10,
  status: 'draft',
  contentVersion: 1,
  review: NO_REVIEW,
  conceptBlocks: [
    { type: 'text', text: 'Bengali is written in its own script. Here are three vowels (স্বরবর্ণ) and one consonant (ব্যঞ্জনবর্ণ). Look closely at each shape.' },
    {
      type: 'vocab',
      entries: [
        { term: 'অ', lang: 'bn', meaning: 'first vowel', note: 'Example word: অজগর (python)', symbol: '🐍' },
        { term: 'আ', lang: 'bn', meaning: 'second vowel', note: 'Example word: আম (mango). Notice the extra line on the right compared with অ.', symbol: '🥭' },
        { term: 'ই', lang: 'bn', meaning: 'third vowel', note: 'Example word: ইঁদুর (mouse)', symbol: '🐭' },
        { term: 'ক', lang: 'bn', meaning: 'first consonant', note: 'Example word: কলা (banana)', symbol: '🍌' },
      ],
    },
    { type: 'text', text: 'Tip: আ looks like অ with an extra stroke (া) on its right side.' },
  ],
  guidedTasks: [
    choice('guided-01', 'Which word starts with the letter আ?', [bn('a', 'আম', '🥭'), bn('b', 'কলা', '🍌'), bn('c', 'ইঁদুর', '🐭')], 'a', {
      explanation: 'আম (mango) starts with আ.',
      tag: BN_TAG,
      hints: ['Look at the first letter of each word.', 'আ has a tall line on its right.'],
    }),
    choice('guided-02', 'Find the letter ক.', [bn('a', 'অ'), bn('b', 'ক'), bn('c', 'ই')], 'b', {
      explanation: 'This is ক, the first consonant. It starts the word কলা (banana).',
      tag: BN_TAG,
      hints: ['Look back at the letter list in Discover.', 'ক starts the word for banana.'],
    }),
  ],
  game: {
    type: 'word-garden',
    rounds: [
      {
        pairs: [
          { left: { text: 'অ', lang: 'bn' }, right: { text: 'অজগর', lang: 'bn', symbol: '🐍' }, why: 'অজগর (python) starts with অ.' },
          { left: { text: 'আ', lang: 'bn' }, right: { text: 'আম', lang: 'bn', symbol: '🥭' }, why: 'আম (mango) starts with আ.' },
          { left: { text: 'ক', lang: 'bn' }, right: { text: 'কলা', lang: 'bn', symbol: '🍌' }, why: 'কলা (banana) starts with ক.' },
        ],
      },
      {
        pairs: [
          { left: { text: 'ই', lang: 'bn' }, right: { text: 'ইঁদুর', lang: 'bn', symbol: '🐭' }, why: 'ইঁদুর (mouse) starts with ই.' },
          { left: { text: 'ক', lang: 'bn' }, right: { text: 'কলম', lang: 'bn', symbol: '🖊️' }, why: 'কলম (pen) starts with ক.' },
          { left: { text: 'আ', lang: 'bn' }, right: { text: 'আকাশ', lang: 'bn', symbol: '🌤️' }, why: 'আকাশ (sky) starts with আ.' },
        ],
      },
    ],
  },
  practiceItems: [
    choice('practice-01', 'Which letter starts the word অজগর (python)?', [bn('a', 'অ'), bn('b', 'আ'), bn('c', 'ক')], 'a', {
      explanation: 'অজগর starts with অ. It has no extra line on the right, so it is not আ.',
      tag: 'a-aa-confusion',
      hints: ['Look at the very first letter of অজগর.', 'Compare অ and আ: which has the extra line?'],
      visual: { type: 'letter', glyph: 'অজগর', lang: 'bn', altText: 'The Bengali word for python.' },
    }),
    choice('practice-02', 'Which letter is this?', [bn('a', 'আ'), bn('b', 'অ'), bn('c', 'ই')], 'a', {
      explanation: 'This is আ. It looks like অ with an extra stroke on the right.',
      tag: 'a-aa-confusion',
      hints: ['Does it have an extra line on the right?', 'আ is the letter that starts আম (mango).'],
      visual: { type: 'letter', glyph: 'আ', lang: 'bn', altText: 'A Bengali letter.' },
    }),
    choice('practice-03', 'Which word starts with ক?', [bn('a', 'কলা', '🍌'), bn('b', 'আম', '🥭'), bn('c', 'অজগর', '🐍')], 'a', {
      explanation: 'কলা (banana) starts with ক.',
      tag: BN_TAG,
      hints: ['Find the first letter of each word.', 'ক starts the word for banana.'],
    }),
    choice('practice-04', 'Which letter starts the word ইঁদুর (mouse)?', [bn('a', 'ই'), bn('b', 'অ'), bn('c', 'ক')], 'a', {
      explanation: 'ইঁদুর starts with ই.',
      tag: BN_TAG,
      hints: ['Look at the first letter.', 'It is the third vowel.'],
      visual: { type: 'letter', glyph: 'ইঁদুর', lang: 'bn', altText: 'The Bengali word for mouse.' },
    }),
    choice('practice-05', 'Which of these is a consonant?', [bn('a', 'ক'), bn('b', 'অ'), bn('c', 'আ')], 'a', {
      explanation: 'ক is a consonant (ব্যঞ্জনবর্ণ). অ and আ are vowels (স্বরবর্ণ).',
      tag: 'vowel-consonant-confusion',
      hints: ['Three of our letters are vowels and one is a consonant.', 'The consonant starts কলা.'],
    }),
    choice('practice-06', 'Which letter is this?', [bn('a', 'অ'), bn('b', 'আ'), bn('c', 'ক')], 'a', {
      explanation: 'This is অ, the first vowel. It has no extra stroke on the right.',
      tag: 'a-aa-confusion',
      hints: ['Is there an extra line on the right?', 'অ starts অজগর (python).'],
      visual: { type: 'letter', glyph: 'অ', lang: 'bn', altText: 'A Bengali letter.' },
    }),
  ],
  challenges: [
    choice('challenge-01', 'Which word starts with the same letter as আম (mango)?', [bn('a', 'আকাশ', '🌤️'), bn('b', 'কলম', '🖊️'), bn('c', 'ইট', '🧱')], 'a', {
      explanation: 'আম and আকাশ (sky) both start with আ.',
      tag: BN_TAG,
      hints: ['What is the first letter of আম?', 'Find another word starting with that letter.'],
    }),
    choice('challenge-02', 'Which word starts with the same letter as কলা (banana)?', [bn('a', 'কলম', '🖊️'), bn('b', 'আম', '🥭'), bn('c', 'অজগর', '🐍')], 'a', {
      explanation: 'কলা and কলম (pen) both start with ক.',
      tag: BN_TAG,
      hints: ['What is the first letter of কলা?', 'Find another word starting with ক.'],
    }),
  ],
  reflection: {
    type: 'choice',
    prompt: 'How can you tell অ and আ apart?',
    options: [
      { id: 'stroke', text: 'আ has an extra stroke on its right side' },
      { id: 'same', text: 'They look exactly the same' },
    ],
    correctOptionIds: ['stroke'],
    explanation: 'The extra stroke (া) on the right turns অ into আ.',
  },
  audio: null,
  offlineActivity: 'Write অ, আ, ই and ক on cards. Hide them around the room. When your child finds one, say a word that starts with it together.',
};
