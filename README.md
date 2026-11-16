# LittleLinx

A LetterLinx word game for young children. Each game has **10 pictures**. For every picture the child finds the matching word in a **5×5 letter grid** by sliding a finger across touching letters, plus an optional **bonus word** that describes the picture (e.g. a picture of a **DOG** with the bonus word **BLACK**).

Because young players are still learning to read, every instruction is **spoken aloud**.

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
js/audio.js       speech (Web Speech API) and sound effects (Web Audio)
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

The two words together must fit in the grid (25 letters at most). You can change the main settings at the top of `js/game.js` (`CONFIG`): `diagonal` (also allow diagonal moves), `shuffleRounds` and `autoHintAfterMisses`.
