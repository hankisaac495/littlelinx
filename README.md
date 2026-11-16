# LittleLinx

A LetterLinx word game for young children. Each game has **10 pictures**. For every picture the child finds the matching word in a **5×5 letter grid** by sliding a finger across touching letters, plus an optional **bonus word** that describes the picture (e.g. a picture of a **DOG** with the bonus word **BLACK**).

Because young players are still learning to read, every instruction is **spoken aloud** by a narrator.

## Install as an app (no browser controls)

LittleLinx is a Progressive Web App (PWA). Added to the home screen, it opens full screen with no address bar or browser buttons:

- **iPhone / iPad (Safari):** Share button → **Add to Home Screen**.
- **Android (Chrome):** menu ⋮ → **Install app** (or **Add to Home screen**).
- **Desktop Chrome / Edge:** install icon in the address bar.

In a regular browser tab, tapping ▶ asks for full screen on Android and desktop. iPhone Safari doesn't allow full screen in a tab, so use Add to Home Screen there. Once installed, the game also works offline.

## How to play

1. Tap the big green ▶ button (this also turns on sound on phones and tablets).
2. Look at the picture and listen to the instructions.
3. Put a finger on the first letter and slide across letters that touch (up, down, left or right). A line connects the letters, and each letter is said aloud as it's reached. The word is checked only when the finger is lifted (or the mouse button released).
4. Find the main word to earn a ⭐. Find the bonus word to earn a 🌟.
5. Tap the green arrow to go to the next picture.

| Button | What it does |
| --- | --- |
| 👂 (or tap the picture) | Plays the instructions again |
| 💡 | First press lights up the first letter. Pressing again shows the whole word's path and spells it aloud |
| 🔊 | Turns sound on or off |

Help for young players:

- The empty boxes above the grid show how many letters each word has. They fill in as the child taps.
- Filler tiles never use letters from that round's words, and each word can be spelled in only one place.
- If the letters don't spell a word when the finger is lifted, the tiles shake and "Try again" is spoken. After 2 misses in a row, a hint appears on its own. Tapping a single letter just says it aloud and doesn't count as a miss.
- Sliding back onto the previous letter undoes the last letter.
- Found words keep their line (green for the word, gold for the bonus).

## Project layout

```
index.html        page shell (start, game and end screens)
css/style.css     styling and animations
js/rounds.js      the 10 rounds: word, bonus word, spoken prompts, illustration
js/grid.js        5x5 grid generator (places both words as paths of touching tiles)
js/lines.js       every narrator line, keyed by clip name
js/audio.js       plays narrator clips (falls back to the browser voice) and sound effects
audio/            recorded narrator clips: <key>.mp3, listed in clips.json
tools/update-clips.js  rebuilds audio/clips.json and lists lines still missing a recording
manifest.webmanifest, sw.js, icons/   PWA: install to home screen, full screen, offline
js/game.js        game flow, tile selection, hints and scoring
tests/grid.test.js
```

There is no build step. It's a plain static site.

## Run locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Test

```bash
node tests/grid.test.js
```

## Deploying on Vercel

Import the repo with the **Other** framework preset and leave the build command and output directory empty. Vercel serves `index.html` from the repo root.

## Narrator voice

Each line the narrator says is a short clip named after its key in `js/lines.js`, for example `letter_D.mp3` ("Dee."), `word_DOG.mp3` ("Dog!") and `prompt_DOG.mp3` ("Look at the picture. Find the word, dog!"). Longer sentences are built by playing clips one after another. For example, a found word plays `yes` + `letter_D` + `letter_O` + `letter_G` + `word_DOG`.

To add or replace recordings:

1. Put the mp3 files in `audio/`, named `<key>.mp3`. The narrator voice is Ainsley from Higgsfield (Seed Audio model, speech rate −10). Recorded one at a time, the voice model often said the last word twice ("Dog! Dog!"). To avoid that, the lines were recorded as lists with long pauses between items (for example `"H...\nI...\nJ..."`) and cut at those pauses, so each clip holds exactly one item. The clips are trimmed to start and end on the speech and set to the same volume.
2. Run `node tools/update-clips.js`. This updates `audio/clips.json` and lists any lines that still have no recording.

Any line without a recording is read by the browser's built-in voice instead, so the game always works.

## Changing the content

Edit `js/rounds.js`. Each round looks like this:

```js
{
  word: 'DOG', bonus: 'BLACK',
  prompt: 'Look at the picture. Find the word, dog!',
  bonusPrompt: 'Bonus! What color is the dog?',
  art: svg(`...`),            // built-in drawing
  // image: 'images/dog.png', // or use your own image file instead of `art`
}
```

The two words together must fit in the grid (25 letters at most). A new round adds new narrator lines (`prompt_`, `bonusq_` and `word_` keys); record them, or let the browser voice read them. You can change the main settings at the top of `js/game.js` (`CONFIG`): `diagonal` (also allow diagonal moves), `shuffleRounds` and `autoHintAfterMisses`.
