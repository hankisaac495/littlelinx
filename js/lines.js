// Every line the narrator can say, keyed by clip name.
// Recorded clips live in audio/<key>.mp3 and are listed in audio/clips.json
// (run `node tools/update-clips.js` after adding files).
// If a clip is missing, the game falls back to the browser's built-in voice
// reading the same text, so new rounds work before their audio is recorded.

(function (root) {
  // Letter names chosen so a voice says the name ("dee"), never "capital D".
  const LETTER_TEXT = {
    A: 'A!', B: 'Bee.', C: 'See.', D: 'Dee.', E: 'Ee.', F: 'Eff.', G: 'Gee.',
    H: 'Aitch.', I: 'Eye.', J: 'Jay.', K: 'Kay.', L: 'Ell.', M: 'Em.', N: 'En.',
    O: 'Oh.', P: 'Pee.', Q: 'Queue.', R: 'Are.', S: 'Ess.', T: 'Tea.', U: 'You.',
    V: 'Vee.', W: 'Double you.', X: 'Ex.', Y: 'Why.', Z: 'Zee.',
  };
  const NUMBERS = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
  const cap = (w) => w[0].toUpperCase() + w.slice(1).toLowerCase();

  const LINES = {
    intro: 'Put your finger on the first letter, and slide to spell the word. Then lift your finger.',
    oops: 'Oops! Try again.',
    yes: 'Yes!',
    wow: 'Wow!',
    bothFound: 'You found both words!',
    bonusFound: 'You found the bonus word!',
    thatsBonus: "That's the bonus word!",
    nowFind: 'Now find the word...',
    tapArrow: 'Tap the arrow for the next picture.',
    orTapArrow: 'Or tap the arrow for the next picture.',
    startsWith: 'starts with the letter...',
    fingerOn: 'Put your finger on the...',
    andSlide: 'and slide.',
    liftFinger: 'Then lift your finger.',
    didIt: 'You did it! Look at all your stars!',
    playAgain: 'Tap the button to play again.',
  };
  Object.entries(LETTER_TEXT).forEach(([ch, t]) => { LINES['letter_' + ch] = t; });
  NUMBERS.forEach((n, i) => { LINES['picture_' + (i + 1)] = `Picture ${n}.`; });
  (root.LINX_ROUNDS || []).forEach((r) => {
    LINES['prompt_' + r.word] = r.prompt;
    LINES['bonusq_' + r.word] = r.bonusPrompt;
    LINES['word_' + r.word] = cap(r.word) + '!';
    LINES['word_' + r.bonus] = cap(r.bonus) + '!';
  });

  root.LINX_LINES = LINES;
  if (typeof module !== 'undefined' && module.exports) module.exports = LINES;
})(typeof window !== 'undefined' ? window : globalThis);
