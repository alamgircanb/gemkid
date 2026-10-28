import type { Lesson } from '../../domain/types.ts';
import { robot, choice, numeric, opts, NO_REVIEW } from '../helpers.ts';

const SEQ_TAG = 'turns-confused-with-moves';

export const sequences: Lesson = {
  schemaVersion: 1,
  id: 'coding-b-sequences-01',
  subjectId: 'coding',
  level: { stage: 'beginner' },
  chapterId: 'coding-b-robot-basics',
  order: 1,
  skillIds: ['coding.sequences'],
  prerequisiteSkillIds: ['coding.directions'],
  title: 'Robot Route: step by step',
  objective: 'Write a sequence of move and turn commands that takes a robot to a goal.',
  contentLocale: 'en',
  estimatedMinutes: 15,
  status: 'draft',
  contentVersion: 1,
  review: NO_REVIEW,
  conceptBlocks: [
    { type: 'text', text: 'A program is a list of commands. The robot does them one at a time, in order, from top to bottom.' },
    {
      type: 'example',
      title: 'Three commands',
      steps: [
        '“forward” moves the robot one square the way it is facing.',
        '“left” and “right” turn the robot on the spot. Turning does not move it to a new square.',
        'The robot faces east (→). forward, forward moves it 2 squares east. Then left makes it face north (↑).',
      ],
    },
    { type: 'text', text: 'If the robot goes the wrong way, use Step to watch each command, find the mistake and fix it. That is called debugging.' },
  ],
  guidedTasks: [
    robot('guided-01', 'Help the robot reach the gem. It is facing east.', { width: 4, height: 3, start: { x: 0, y: 1, dir: 'E' }, goal: { x: 3, y: 1 }, walls: [] }, 'forward, forward, forward', {}, {
      explanation: 'Three forward commands move the robot three squares east to the gem.',
      tag: SEQ_TAG,
      hints: ['Count the squares between the robot and the gem.', 'Use forward three times.'],
    }),
    robot('guided-02', 'The gem is up and to the right. Get the robot there.', { width: 3, height: 3, start: { x: 0, y: 2, dir: 'E' }, goal: { x: 2, y: 0 }, walls: [] }, 'forward, forward, left, forward, forward', {}, {
      explanation: 'Move 2 east, turn left to face north, then move 2 north.',
      tag: SEQ_TAG,
      hints: ['First go east until you are under the gem.', 'Turning left from east makes the robot face north (up).'],
    }),
  ],
  game: {
    type: 'robot-route',
    allowRepeat: false,
    levels: [
      { width: 4, height: 3, start: { x: 0, y: 1, dir: 'E' }, goal: { x: 3, y: 1 }, walls: [] },
      { width: 4, height: 4, start: { x: 0, y: 3, dir: 'E' }, goal: { x: 3, y: 0 }, walls: [{ x: 1, y: 2 }, { x: 2, y: 2 }] },
      { width: 5, height: 4, start: { x: 0, y: 0, dir: 'E' }, goal: { x: 4, y: 3 }, walls: [{ x: 2, y: 0 }, { x: 2, y: 1 }, { x: 2, y: 2 }] },
    ],
  },
  practiceItems: [
    robot('practice-01', 'Reach the gem. The robot faces east.', { width: 5, height: 3, start: { x: 0, y: 1, dir: 'E' }, goal: { x: 4, y: 1 }, walls: [] }, 'forward, forward, forward, forward', {}, {
      explanation: 'The gem is 4 squares east, so four forward commands reach it.',
      tag: 'miscounts-squares',
      hints: ['Count the squares to move, not the squares including the robot.', 'Use forward 4 times.'],
    }),
    robot('practice-02', 'Reach the gem. The robot faces north (up).', { width: 4, height: 4, start: { x: 0, y: 3, dir: 'N' }, goal: { x: 0, y: 0 }, walls: [] }, 'forward, forward, forward', {}, {
      explanation: 'The robot already faces north, so three forward commands reach the gem.',
      tag: SEQ_TAG,
      hints: ['Which way is the robot facing already?', 'No turn is needed. Count the squares.'],
    }),
    robot('practice-03', 'Reach the gem. The robot faces east.', { width: 4, height: 4, start: { x: 0, y: 0, dir: 'E' }, goal: { x: 2, y: 2 }, walls: [] }, 'forward, forward, right, forward, forward', {}, {
      explanation: 'Go 2 east, turn right to face south (down), then go 2 south.',
      tag: SEQ_TAG,
      hints: ['First move until you are above the gem.', 'Turning right from east makes the robot face south (down).'],
    }),
    robot(
      'practice-04',
      'A rock blocks the way. Go around it to reach the gem.',
      { width: 4, height: 3, start: { x: 0, y: 0, dir: 'E' }, goal: { x: 3, y: 0 }, walls: [{ x: 2, y: 0 }] },
      'forward, right, forward, left, forward, forward, left, forward',
      {},
      {
        explanation: 'Step down a row, go past the rock, then come back up to the gem.',
        tag: 'walks-into-obstacle',
        hints: ['You cannot pass through the rock. Try going around below it.', 'One possible route: forward, right, forward, left, forward, forward, left, forward.'],
      },
    ),
    choice('practice-05', 'The robot faces north and runs the command “right”. Which way does it face now?', opts('east →', 'west ←', 'south ↓'), 'a', {
      explanation: 'Turning right from north means turning clockwise to east.',
      tag: 'left-right-confusion',
      hints: ['Stand up, face the front of the room, and turn right. Where are you facing?', 'North → right → east.'],
    }),
    numeric('practice-06', 'The robot runs: forward, forward, left, forward. How many squares does it move?', 3, {
      explanation: 'Only forward commands move the robot. There are 3 forward commands. “left” turns without moving.',
      tag: SEQ_TAG,
      hints: ['Does a turn move the robot to a new square?', 'Count only the forward commands.'],
    }),
  ],
  challenges: [
    robot(
      'challenge-01',
      'Two rocks block the bottom row. Find a route to the gem in the top-right corner.',
      { width: 5, height: 4, start: { x: 0, y: 3, dir: 'E' }, goal: { x: 4, y: 0 }, walls: [{ x: 2, y: 3 }, { x: 2, y: 2 }] },
      'forward, left, forward, forward, right, forward, forward, forward, left, forward',
      {},
      {
        explanation: 'Climb up before the rocks, cross over them, then turn up to the gem. More than one route can work.',
        tag: 'walks-into-obstacle',
        hints: ['Plan the route with your finger before adding commands.', 'Go up two rows first, then go east past the rocks.'],
      },
    ),
    choice(
      'challenge-02',
      'This program should move the robot 2 squares east and then 1 square north: forward, forward, right, forward. The robot faces east at the start. What would fix it?',
      opts('Change “right” to “left”', 'Add another forward', 'Remove one forward'),
      'a',
      {
        explanation: 'From east, “right” turns to south. To go north the robot must turn left.',
        tag: 'left-right-confusion',
        hints: ['Which way does the robot face after the turn?', 'From east, which turn points north?'],
      },
    ),
  ],
  reflection: {
    type: 'choice',
    prompt: 'Your robot ends up in the wrong place. What is a good first step?',
    options: [
      { id: 'step', text: 'Step through the program one command at a time to find the mistake' },
      { id: 'delete', text: 'Delete everything and start again' },
    ],
    correctOptionIds: ['step'],
    explanation: 'Stepping shows exactly which command went wrong, so you only fix that part. That is debugging.',
  },
  audio: null,
  offlineActivity: 'Be the robot! Your child gives you commands (forward, left, right) to walk to a toy across the room. Then swap.',
};

const LOOP_TAG = 'repeat-count-confusion';

export const loops: Lesson = {
  schemaVersion: 1,
  id: 'coding-b-loops-01',
  subjectId: 'coding',
  level: { stage: 'beginner' },
  chapterId: 'coding-b-robot-basics',
  order: 2,
  skillIds: ['coding.loops'],
  prerequisiteSkillIds: ['coding.sequences'],
  title: 'Robot Route: repeat loops',
  objective: 'Use a repeat block to run a group of commands several times and make programs shorter.',
  contentLocale: 'en',
  estimatedMinutes: 15,
  status: 'draft',
  contentVersion: 1,
  review: NO_REVIEW,
  conceptBlocks: [
    { type: 'text', text: 'When the same commands happen again and again, a repeat block (a loop) can do them for you.' },
    {
      type: 'example',
      title: 'Shorter programs',
      steps: [
        'forward, forward, forward, forward is 4 blocks.',
        'repeat 4 [forward] does the same thing with 2 blocks: the repeat and the forward inside it.',
        'repeat 3 [forward, left] runs “forward, left” three times: 6 commands in total.',
      ],
    },
    { type: 'text', text: 'Programs have a safety limit. If a loop runs too many steps, the robot stops and tells you.' },
  ],
  guidedTasks: [
    robot('guided-01', 'Reach the gem using a repeat block (2 blocks or fewer).', { width: 6, height: 3, start: { x: 0, y: 1, dir: 'E' }, goal: { x: 5, y: 1 }, walls: [] }, 'repeat 5 [forward]', { allowRepeat: true, maxBlocks: 2, requireRepeat: true }, {
      explanation: 'repeat 5 [forward] moves the robot 5 squares with only 2 blocks.',
      tag: LOOP_TAG,
      hints: ['Count the squares to the gem.', 'Add a repeat block, set it to 5, and put forward inside it.'],
    }),
    numeric('guided-02', 'How many squares does “repeat 3 [forward, forward]” move the robot?', 6, {
      explanation: 'Each time through the loop moves 2 squares. 3 times 2 is 6.',
      tag: LOOP_TAG,
      hints: ['How many forwards are inside the loop?', '2 + 2 + 2 = 6.'],
    }),
  ],
  game: {
    type: 'robot-route',
    allowRepeat: true,
    levels: [
      { width: 8, height: 3, start: { x: 0, y: 1, dir: 'E' }, goal: { x: 7, y: 1 }, walls: [] },
      {
        width: 4,
        height: 4,
        start: { x: 0, y: 3, dir: 'E' },
        goal: { x: 3, y: 0 },
        walls: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 0 }, { x: 2, y: 3 }, { x: 3, y: 3 }, { x: 3, y: 2 }],
      },
      { width: 6, height: 6, start: { x: 0, y: 5, dir: 'N' }, goal: { x: 5, y: 0 }, walls: [{ x: 2, y: 2 }, { x: 3, y: 3 }] },
    ],
  },
  practiceItems: [
    robot('practice-01', 'Reach the gem using 2 blocks or fewer.', { width: 7, height: 3, start: { x: 0, y: 1, dir: 'E' }, goal: { x: 6, y: 1 }, walls: [] }, 'repeat 6 [forward]', { allowRepeat: true, maxBlocks: 2, requireRepeat: true }, {
      explanation: 'repeat 6 [forward] reaches the gem 6 squares away.',
      tag: LOOP_TAG,
      hints: ['Count the squares: the repeat number should match.', 'repeat ? [forward]'],
    }),
    numeric('practice-02', 'A program is: repeat 4 [forward], then forward. How many squares does the robot move?', 5, {
      explanation: 'The loop moves 4 squares, and the extra forward after it moves 1 more: 5.',
      tag: LOOP_TAG,
      hints: ['How many squares does the loop move?', 'Then add the command after the loop.'],
    }),
    robot(
      'practice-03',
      'Climb the staircase to the gem. Use a repeat block and 5 blocks or fewer.',
      {
        width: 4,
        height: 4,
        start: { x: 0, y: 3, dir: 'E' },
        goal: { x: 3, y: 0 },
        walls: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 0 }, { x: 2, y: 3 }, { x: 3, y: 3 }, { x: 3, y: 2 }],
      },
      'repeat 3 [forward, left, forward, right]',
      { allowRepeat: true, maxBlocks: 5, requireRepeat: true },
      {
        explanation: 'Each stair is forward, left, forward, right. Repeating it 3 times climbs all three stairs.',
        tag: 'misses-repeating-chunk',
        hints: ['Write the commands for one stair first.', 'One stair is: forward, left, forward, right. How many stairs are there?'],
      },
    ),
    choice('practice-04', 'Which program does the same as: forward, forward, forward, forward?', opts('repeat 4 [forward]', 'repeat 2 [forward]', 'repeat 4 [right]'), 'a', {
      explanation: 'Four forwards in a row is the same as repeating forward 4 times.',
      tag: LOOP_TAG,
      hints: ['Count the forwards.', 'The repeat number must match how many times the command happens.'],
    }),
    robot('practice-05', 'Reach the gem using 2 blocks or fewer. The robot faces north.', { width: 5, height: 5, start: { x: 0, y: 4, dir: 'N' }, goal: { x: 0, y: 0 }, walls: [] }, 'repeat 4 [forward]', { allowRepeat: true, maxBlocks: 2, requireRepeat: true }, {
      explanation: 'The gem is 4 squares north, so repeat 4 [forward] reaches it.',
      tag: LOOP_TAG,
      hints: ['The robot already faces the gem.', 'repeat 4 [forward].'],
    }),
    choice('practice-06', 'A program is: forward, right, forward, right, forward, right. Which repeat block does the same?', opts('repeat 3 [forward, right]', 'repeat 6 [forward, right]', 'repeat 3 [forward]'), 'a', {
      explanation: '“forward, right” happens 3 times, so repeat 3 [forward, right] matches.',
      tag: 'misses-repeating-chunk',
      hints: ['Find the chunk that repeats.', 'How many times does “forward, right” appear?'],
    }),
  ],
  challenges: [
    robot('challenge-01', 'Reach the gem in the far corner using 5 blocks or fewer.', { width: 6, height: 4, start: { x: 0, y: 3, dir: 'E' }, goal: { x: 5, y: 0 }, walls: [] }, 'repeat 5 [forward], left, repeat 3 [forward]', { allowRepeat: true, maxBlocks: 5, requireRepeat: true }, {
      explanation: 'One loop goes east, a turn faces north, and a second loop goes up: 5 blocks.',
      tag: LOOP_TAG,
      hints: ['Split the route into a straight part, a turn, and another straight part.', 'You can use two repeat blocks.'],
    }),
    robot('challenge-02', 'Go down the stairs to the gem using a repeat block and 5 blocks or fewer.', { width: 5, height: 5, start: { x: 0, y: 0, dir: 'E' }, goal: { x: 4, y: 4 }, walls: [] }, 'repeat 4 [forward, right, forward, left]', { allowRepeat: true, maxBlocks: 5, requireRepeat: true }, {
      explanation: 'Each step down is forward, right, forward, left. Repeating it 4 times reaches the gem. Two straight loops also work.',
      tag: 'misses-repeating-chunk',
      hints: ['Find the moves for one step.', 'Turning right from east faces south; turning left from south faces east again.'],
    }),
  ],
  reflection: {
    type: 'choice',
    prompt: 'When is a repeat block most useful?',
    options: [
      { id: 'same', text: 'When the same commands happen several times in a row' },
      { id: 'once', text: 'When a command happens only once' },
    ],
    correctOptionIds: ['same'],
    explanation: 'Loops save writing the same commands again and again, and they make programs easier to change.',
  },
  audio: null,
  offlineActivity: 'Make up a dance with a repeat: “repeat 3 [clap, jump]”. Take turns writing a dance program and performing it.',
};
