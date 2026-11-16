// Run with: node tests/grid.test.js
const assert = require('assert');
const { generateGrid, isAdjacent, countPaths } = require('../js/grid.js');

// Load the round list without a browser.
global.window = {};
require('../js/rounds.js');
const rounds = global.window.LINX_ROUNDS;

assert.strictEqual(rounds.length, 10, 'there should be 10 rounds');

for (const r of rounds) {
  for (let trial = 0; trial < 200; trial++) {
    for (const diagonal of [false, true]) {
      const g = generateGrid([r.word, r.bonus], { size: 5, diagonal });
      assert.strictEqual(g.letters.length, 25);
      const seen = new Set();
      [r.word, r.bonus].forEach((w, k) => {
        const p = g.paths[k];
        assert.strictEqual(p.map((i) => g.letters[i]).join(''), w);
        p.forEach((i, n) => {
          assert(!seen.has(i), 'tiles must not be shared between words');
          seen.add(i);
          if (n) assert(isAdjacent(p[n - 1], i, 5, diagonal), `${w}: tiles must touch`);
        });
        assert.strictEqual(countPaths(g.letters, w, 5, diagonal), 1, `${w} must have one path`);
      });
    }
  }
}
console.log(`ok - ${rounds.length} rounds x 400 grids each`);
