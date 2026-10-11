/**
 * ============================================================
 *  TOY ROOM ADVENTURE — ALL WORDS & SENTENCES LIVE HERE
 * ============================================================
 *  Teachers: edit the text in quotes to change the lines you are given to read.
 *  - `word`      : the word shown for the picture (the teacher reads it aloud)
 *  - `thisIs`    : the answer to "What is this?"
 *  - `hello`     : what the toy says in the Toy Parade
 *  - `plural`    : used in "Do you like ___?" and counting games
 *  - `iHave`     : the answer in "Run, Teddy, Run!" ("I have a doll.")
 *  The `id` values must match a picture in src/components/ItemArt.tsx,
 *  so change the words, not the ids.
 */

export type ToyId = 'doll' | 'puzzle' | 'blocks' | 'ball' | 'kite' | 'teddy';
export type ShapeId = 'circle' | 'square' | 'triangle' | 'heart';
export type RoomId = 'window' | 'lamp' | 'door' | 'clock' | 'bed' | 'toybox';
export type SillyId = 'sock' | 'spider' | 'worm' | 'monster';
export type ItemId = ToyId | ShapeId | RoomId | SillyId;
export type Prep = 'in' | 'on' | 'under';

export interface VocabItem {
  id: ItemId;
  word: string;
  thisIs: string;
  plural: string;
}

// ---------- TOYS ----------
export const TOYS: (VocabItem & { id: ToyId; hello: string; iHave: string })[] = [
  { id: 'doll', word: 'doll', thisIs: 'This is a doll.', plural: 'dolls', hello: "Hello! I'm a doll!", iHave: 'I have a doll.' },
  { id: 'puzzle', word: 'puzzle', thisIs: 'This is a puzzle.', plural: 'puzzles', hello: "Hello! I'm a puzzle!", iHave: 'I have a puzzle.' },
  { id: 'blocks', word: 'blocks', thisIs: 'These are blocks.', plural: 'blocks', hello: "Hello! We are blocks!", iHave: 'I have blocks.' },
  { id: 'ball', word: 'ball', thisIs: 'This is a ball.', plural: 'balls', hello: "Hello! I'm a ball!", iHave: 'I have a ball.' },
  { id: 'kite', word: 'kite', thisIs: 'This is a kite.', plural: 'kites', hello: "Hello! I'm a kite!", iHave: 'I have a kite.' },
  { id: 'teddy', word: 'teddy bear', thisIs: 'This is a teddy bear.', plural: 'teddy bears', hello: "Hello! I'm a teddy bear!", iHave: 'I have a teddy bear.' },
];

// ---------- SHAPES ----------
export const SHAPES: (VocabItem & { id: ShapeId; itIs: string; iHave: string })[] = [
  { id: 'circle', word: 'circle', thisIs: 'This is a circle.', itIs: "It's a circle!", plural: 'circles', iHave: 'I have a circle.' },
  { id: 'square', word: 'square', thisIs: 'This is a square.', itIs: "It's a square!", plural: 'squares', iHave: 'I have a square.' },
  { id: 'triangle', word: 'triangle', thisIs: 'This is a triangle.', itIs: "It's a triangle!", plural: 'triangles', iHave: 'I have a triangle.' },
  { id: 'heart', word: 'heart', thisIs: 'This is a heart.', itIs: "It's a heart!", plural: 'hearts', iHave: 'I have a heart.' },
];

// ---------- ROOM ----------
export const ROOM: (VocabItem & { id: RoomId })[] = [
  { id: 'window', word: 'window', thisIs: 'This is a window.', plural: 'windows' },
  { id: 'lamp', word: 'lamp', thisIs: 'This is a lamp.', plural: 'lamps' },
  { id: 'door', word: 'door', thisIs: 'This is a door.', plural: 'doors' },
  { id: 'clock', word: 'clock', thisIs: 'This is a clock.', plural: 'clocks' },
  { id: 'bed', word: 'bed', thisIs: 'This is a bed.', plural: 'beds' },
  { id: 'toybox', word: 'toy box', thisIs: 'This is a toy box.', plural: 'toy boxes' },
];

// ---------- SILLY SURPRISES (Yes I Do / No I Don't) ----------
export const SILLY: { id: SillyId; question: string; yesReply: string; noReply: string }[] = [
  { id: 'sock', question: 'Do you like... a stinky sock?', yesReply: 'Really? Pee-yew! Silly!', noReply: 'Me neither! Yuck!' },
  { id: 'spider', question: 'Do you like... a spider in your bed?', yesReply: 'A spider? Silly you!', noReply: 'Me neither! Eek!' },
  { id: 'worm', question: 'Do you like... worms for breakfast?', yesReply: 'Wiggly worms? Yuck! Silly!', noReply: 'Me neither! Blech!' },
  { id: 'monster', question: 'Do you like... a monster under your bed?', yesReply: 'Ha ha! He is a friendly monster!', noReply: 'Oh no! Hide!' },
];

export const ALL_ITEMS: VocabItem[] = [...TOYS, ...SHAPES, ...ROOM];

export function item(id: ItemId): VocabItem {
  const found = ALL_ITEMS.find((i) => i.id === id);
  if (found) return found;
  return { id, word: id, thisIs: '', plural: id };
}

// ---------- NUMBERS 1–14 ----------
export const NUMBER_WORDS = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven',
  'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen',
];
export const MAX_COUNT = 14;

// ---------- SENTENCES ----------
export const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const SENTENCES = {
  welcome: 'Welcome to Toy Room Adventure!',
  whatIsThis: 'What is this?',
  whatShape: 'What shape is it?',
  whatShapeIs: (word: string) => `What shape is the ${word}?`,
  doYouLike: (plural: string) => `Do you like ${plural}?`,
  yesIDo: 'Yes, I do!',
  noIDont: "No, I don't!",
  whereIsTeddy: 'Where is Teddy?',
  whatDoYouHave: 'What do you have?',
  openYourEyes: 'Open your eyes! Where is Teddy?',
  teddyIs: (prep: Prep, word: string) => `Teddy is ${prep} the ${word}.`,
  notThe: (word: string) => `Not the ${word}!`,
  howMany: (plural: string) => `How many ${plural}?`,
  standSit: 'Stand up for yes! Sit down for no!',
  greatJob: 'Great job!',
  goodbye: 'Great job! Goodbye!',
  /** "Ball!" */
  name: (word: string) => `${cap(word)}!`,
  /** Toy Parade reveal: "This is a ball. Ball!" */
  thisIsName: (thisIs: string, word: string) => `${thisIs} ${cap(word)}!`,
  /** Toy Parade review tap: "Ball! This is a ball." */
  nameThisIs: (word: string, thisIs: string) => `${cap(word)}! ${thisIs}`,
  drawA: (word: string) => `Draw a ${word}!`,
  /** "It's a circle! A circle!" */
  itIsTwice: (itIs: string, word: string) => `${itIs} A ${word}!`,
  iWant: (word: string) => `I'm hungry! I want a ${word}!`,
  iWantShort: (word: string) => `I want a ${word}!`,
  meToo: (plural: string) => `Me too! I like ${plural}!`,
  letsCount: (plural: string) => `Let's count ${plural}!`,
  fourteenHooray: (plural: string) => `Fourteen ${plural}! Hooray!`,
  /** "Six!" */
  number: (n: number) => `${cap(NUMBER_WORDS[n])}!`,
  /** "Six balls!" */
  countResult: (n: number, words: string) => `${cap(NUMBER_WORDS[n])} ${words}!`,
  /** Kite finale: "Ball! Bye-bye, ball!" */
  byeBye: (word: string) => `${cap(word)}! Bye-bye, ${word}!`,
  prep: (p: Prep) => `${cap(p)}!`,
};

// ---------- BLOCK TOWER — things to count in "How many?" ----------
export const HOWMANY_ITEMS: ItemId[] = ['ball', 'kite', 'heart', 'doll', 'teddy', 'circle', 'square', 'triangle', 'puzzle'];
export const COUNT_MODES = ['kite', 'ball', 'heart'] as const;

// ---------- KITE GOODBYE — the 14 pictures on the kites ----------
export const KITE_ITEMS: ItemId[] = ['doll', 'puzzle', 'blocks', 'ball', 'kite', 'teddy', 'circle', 'square', 'triangle', 'heart', 'window', 'lamp', 'clock', 'toybox'];

// ---------- HUNGRY SHAPE MONSTER — level 2: shapes in the room ----------
// (the pictures are drawn to match: round clock, square window, triangle lamp shade…)
export const SHAPE_IN_ROOM: { thing: ItemId; shape: ShapeId }[] = [
  { thing: 'clock', shape: 'circle' },
  { thing: 'window', shape: 'square' },
  { thing: 'lamp', shape: 'triangle' },
  { thing: 'ball', shape: 'circle' },
  { thing: 'toybox', shape: 'heart' }, // the toy box has a big heart on it
];

// ---------- WHERE'S TEDDY — hiding places ----------
export const HIDING_SPOTS: { id: string; prep: Prep; object: RoomId }[] = [
  { id: 'in-toybox', prep: 'in', object: 'toybox' },
  { id: 'on-toybox', prep: 'on', object: 'toybox' },
  { id: 'on-bed', prep: 'on', object: 'bed' },
  { id: 'under-bed', prep: 'under', object: 'bed' },
  { id: 'under-lamp', prep: 'under', object: 'lamp' },
  { id: 'in-window', prep: 'in', object: 'window' },
  { id: 'under-window', prep: 'under', object: 'window' },
  { id: 'on-lamp', prep: 'on', object: 'lamp' },
];

// ---------- COPY TEDDY — action prompts ----------
export const COPY_PROMPTS: { prep: Prep; text: string; emoji: string }[] = [
  { prep: 'on', text: 'Put your hand on your head!', emoji: '🙆' },
  { prep: 'on', text: 'Put your hand on your chair!', emoji: '🪑' },
  { prep: 'under', text: 'Put your hand under your chair!', emoji: '🪑' },
  { prep: 'on', text: 'Put your hand on your nose!', emoji: '👃' },
  { prep: 'under', text: 'Put your hand under your chin!', emoji: '🤔' },
  { prep: 'in', text: 'Put your hand in the air!', emoji: '🙋' },
  { prep: 'on', text: 'Put your hands on your knees!', emoji: '🦵' },
  { prep: 'under', text: 'Put your foot under your chair!', emoji: '🦶' },
  { prep: 'in', text: 'Put your hands in your lap!', emoji: '🤲' },
  { prep: 'on', text: 'Put your hand on your ear!', emoji: '👂' },
  { prep: 'on', text: 'Put your hands on the floor!', emoji: '👇' },
  { prep: 'in', text: 'Put your hand in your pocket!', emoji: '👖' },
];

// ---------- STAR JAR ----------
/** Stars needed to fill the class Star Jar. */
export const STAR_GOAL = 60;

// ---------- RUN, TEDDY, RUN! ----------
/** Number of forks in the path before Teddy reaches his house. */
export const ESCAPE_STEPS = 6;
/** Pictures for "What do you have?" → "I have a ___." cards. */
export const ESCAPE_HAVE: ItemId[] = ['doll', 'puzzle', 'blocks', 'ball', 'kite', 'teddy', 'circle', 'square', 'triangle', 'heart'];
/** Pictures for "Do you like ___?" → "Yes, I do! / No, I don't!" cards. */
export const ESCAPE_LIKE: ItemId[] = ['doll', 'puzzle', 'blocks', 'ball', 'kite', 'teddy', 'circle', 'square', 'triangle', 'heart'];

/** The "I have …" sentence for a toy or shape. */
export function iHave(id: ItemId) {
  return [...TOYS, ...SHAPES].find((x) => x.id === id)?.iHave ?? `I have a ${item(id).word}.`;
}
