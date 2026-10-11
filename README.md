# 🧸 Toy Room Adventure

A teacher-led English vocabulary game for 3–4 year olds (non-readers, English learners), made for a projector or touch smartboard and a 90-minute class.

- Nobody can fail: no scores, no losing, no pressure timers. A wrong tap gets a wobble, a silly "boing", and then a glowing hint.
- **No computer voice: you are the voice.** Every line to say appears in big text in the teacher bar at the bottom of the screen (🗣️). Read it aloud, and the game waits a natural reading time before moving on. Tapping a picture or word shows its word there too.
- Each round asks a question, shows a pulsing **🗣️ Say it!** bubble so the class can shout the answer, then reveals the answer and shows you the full sentence to say.
- **Always clear what to tap**, so children can take turns on a tablet. A bouncing 👆 hand with a ripple shows the next thing to tap, and everything tappable glows gold. In guessing games the hand appears on the right answer only after two wrong tries, so nobody gets stuck.
- The class shares one **Star Jar** (top right) that fills up across all the games.
- Teddy, the class mascot, laughs, dances, sneezes and hides along the way.

The pictures are drawn with SVG and CSS. The sound effects and background music are played live in code with Web Audio, so there are no image or audio files and it needs **no internet**.

---

## Running it

You need [Node.js](https://nodejs.org) 18 or newer.

```bash
npm install      # once
npm run dev      # development server → http://localhost:5173
npm run build    # makes dist/index.html
```

### Using it in class (offline)

`npm run build` makes **one self-contained file: `dist/index.html`**. Copy it to the classroom computer (a USB stick works) and double-click it to open it in **Chrome or Edge**. It runs with no internet and no server.

### Before class
1. Open the app and press **⛶ Fullscreen**.
2. Press **▶ Play**. This switches on the sound (browsers need one tap first) and starts the class timer.
3. To start a fresh class, press **🔄 New class** on the start screen (or in ⚙️ Settings). It empties the Star Jar, clears the map stars and resets the timer.

---

## Teacher controls

The small bar along the bottom of the screen:

| Button | What it does |
|---|---|
| 🏠 | Back to the activity map |
| ▶ Next | Moves the current game on (next toy, next round, stop the music, etc.) |
| ✅ | Marks this game done and shows "Great job!" with a ▶ Next game button |
| ⏭ | Skips to the next game |
| 🔊 / slider | Sound on/off and volume |
| ⏱ | Minutes since class started |
| 🗣️ line | **The line to read aloud to the class** |
| ⚙️ | Settings: how long each line stays (shorter/longer), the "Say it!" pause (2–6 s), sound and music on/off |
| ⛶ | Fullscreen |

**Tip:** tap the **🗣️ Say it!** bubble to reveal the answer straight away.

---

## The 10 activities (about 90 minutes)

| # | Activity | Time | How it works |
|---|---|---|---|
| 1 | **Toy Parade** | 8′ | Toys march in to a drum beat and say "Hello! I'm a ball!", then "What is this?" → Say it! → "This is a ball!". Tap 🥁 for the next toy. At the end, tap a toy to hear it again, or press 🥁 Parade! to march them all. |
| 2 | **Mystery Gift Box** | 10′ | Tap the box: it shakes, rattles and drumrolls, then pops open and the whole item jumps out. "What is this?" → Say it! → "This is a kite!" with confetti. Every toy and room item comes up twice, in random order. |
| 3 | **Shape Freeze Dance** | 8′ | Music and dancing shapes. Press ✋ Stop: "Freeze!", then a giant shape appears with "What shape is it?" → Say it! → "Draw a circle!" (a finger traces it) → it spins: "It's a circle!". Press 💃 Dance to start again. |
| 4 | **Hungry Shape Monster** | 12′ | "I'm hungry! I want a triangle!" Tap the right shape: it flies into the monster's mouth (chomp, burp, giggle), then "What shape is it? It's a triangle!". A wrong shape gets "No, thank you!" and a hint glow. **Level 2** (🕐 button): "What shape is the clock? It's a circle!" |
| 5 | **Where's Teddy?** | 12′ | Lights dim and Teddy hides **in / on / under** the bed, lamp, window or toy box. Tap where the class guesses. Right answer: "Peek-a-boo!" → Where is Teddy? → Say it! → "Teddy is under the bed." with a big arrow. ✋ mode: drag Teddy anywhere and the app says the sentence. |
| 6 | **Copy Teddy** | 8′ | Teddy's paw goes ON / IN / UNDER a box, then "Put your hand on your chair!". The children copy. 10 random prompts. |
| 7 | **Block Tower Count** | 10′ | Each tap adds a block and shows the number (1–14) for the class to count aloud. At 14 the tower wobbles and CRASHES, and Teddy laughs. The top buttons switch to counting kites, balls or hearts, or **?** "How many?" (the class counts, then the app counts with them). |
| 8 | **Yes, I do! / No, I don't!** | 8′ | "Do you like balls?" Stand up for YES, sit down for NO. Tap 👍 or 👎 and Teddy reacts. Silly surprises pop up too ("…a stinky sock?"). |
| 9 | **Run, Teddy, Run!** | 8′ | Teddy runs from a cheeky little villain monster (sly grin, scheming eyes — mischievous, not scary). At each fork, **one path has a picture card and the other path has the monster**. The card is either **🙋 "What do you have?" → "I have a doll."** or **❓ "Do you like kites?" → "Yes, I do!" / "No, I don't!"** (the teacher bar shows the answer to listen for: ✔ …). The class says the sentence, then **you tap the card's path if they said it right**: Teddy runs off happy, the monster is sad 😢, and the next fork appears. **Tap the monster if they didn't**: it rushes down, grabs a sad, crying Teddy and carries him off cackling "hee hee hee!". Then 🔄 Again brings Teddy back so the class can help him. Children quickly learn the monster is the path to avoid. When Teddy reaches home, the monster sulks. After 6 forks Teddy reaches his house. |
| 10 | **Kite Goodbye** | 6′ | Count the 14 kites together. Tap each kite to fly it away with its word. When they're all gone, the Star Jar overflows into fireworks and Teddy sings goodbye. |

Teachers can jump to any activity from the map. Finished activities get a ⭐.

---

## Changing the vocabulary

**All the words and sentences are in one file: [`src/content/vocab.ts`](src/content/vocab.ts).**

- **Change the lines you read:** edit the text in quotes. For example, change `thisIs: 'This is a kite.'` or `hello: "Hello! I'm a kite!"`.
- **Plurals for "Do you like…?" and counting:** edit `plural: 'kites'`.
- **Silly questions:** edit the `SILLY` list (question and Teddy's replies).
- **Copy Teddy prompts:** edit `COPY_PROMPTS`. Each one has a preposition, a sentence and an emoji picture. You can add more.
- **Where's Teddy hiding places:** edit `HIDING_SPOTS`.
- **Run, Teddy, Run!:** each toy and shape has an `iHave` sentence (`'I have a doll.'`, `'I have blocks.'`). `ESCAPE_HAVE` and `ESCAPE_LIKE` pick which pictures appear on the cards, and `ESCAPE_STEPS` sets how many forks there are (6).
- **Star Jar size:** `STAR_GOAL` (60 by default) is how many stars fill the jar.
- **Fixed sentence patterns** ("What is this?", "Teddy is __ the __." …) are in `SENTENCES`.

Each item has an `id` (like `kite`) that links it to its picture in `src/components/ItemArt.tsx`. Change the **words**, not the ids. A brand-new item also needs a new picture drawn in `ItemArt.tsx`.

After editing, run `npm run build` again and copy the new `dist/index.html`.

---

## Background music

The music is played live by the app (Web Audio). It uses traditional **public-domain** children's songs that are free for anyone to use, arranged with banjo, brass, glockenspiel, music box, strings and drums:

| Where | Song | Style |
|---|---|---|
| Shape Freeze Dance | "Skip to My Lou" + "Old MacDonald Had a Farm" | bouncy hoedown, loops until you press ✋ Stop (then it cuts to silence instantly) |
| Toy Parade | "Yankee Doodle" | brass-band march with snare drum, while toys march in and during 🥁 Parade! |
| Kite Goodbye | "Twinkle Twinkle Little Star" | gentle music-box lullaby with harp and strings, after the last kite flies away |

Turn the music on/off in ⚙️ Settings (the sound effects have their own switch), or use the volume slider. The songs live in `src/audio/music.ts`, written as simple note lists (e.g. `C5 C5 G5 G5 A5 A5 G5:2`), so you can change or add tunes there.

---

## Project layout

```
src/
  content/vocab.ts        ← all words & sentences (edit me!)
  games/                  ← one component per activity
    ToyParade.tsx  MysteryBox.tsx  FreezeDance.tsx  HungryMonster.tsx  WheresTeddy.tsx
    CopyTeddy.tsx  BlockTower.tsx  YesNo.tsx  KiteFinale.tsx
  audio/
    sfx.ts                ← synthesized pop, boing, drumroll, giggle, burp, crash, cheer, twinkle…
    music.ts              ← background music (public-domain songs, arranged in code)
    director.ts           ← runs "scripts" (line → wait → Say it! → reveal) and cancels them cleanly
  components/             ← cue.ts (teacher lines), Teddy, Monster, ItemArt (all SVG), Star Jar, teacher bar, map, overlays
  state/store.ts          ← settings + class progress (saved in the browser)
```

The app is laid out on a fixed 1600×900 (16:9) stage that scales to fit any screen. Settings and Star Jar progress are saved in the browser's local storage, so a page refresh doesn't lose them.
