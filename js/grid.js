// LittleLinx grid generator.
// Places each target word as a path of adjacent tiles (no tile reused),
// then fills the remaining tiles with letters that are NOT in any target
// word, so young players are not distracted by look-alike paths.

(function (root) {
  const ALPHABET = 'ABCDEFGHIJKLMNOPRSTUVWY'; // no Q/X/Z – hard for early readers

  function neighbors(idx, size, diagonal) {
    const r = Math.floor(idx / size);
    const c = idx % size;
    const out = [];
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        if (!diagonal && dr !== 0 && dc !== 0) continue;
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < size && nc >= 0 && nc < size) out.push(nr * size + nc);
      }
    }
    return out;
  }

  function isAdjacent(a, b, size, diagonal) {
    return neighbors(a, size, diagonal).includes(b);
  }

  function shuffle(arr, rng) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // Randomised depth-first search for a self-avoiding path spelling `word`.
  function placeWord(word, cells, size, diagonal, rng) {
    const starts = shuffle([...Array(size * size).keys()], rng);
    for (const start of starts) {
      if (cells[start] !== null) continue;
      const path = [start];
      if (extend(path)) return path;
    }
    return null;

    function extend(path) {
      if (path.length === word.length) return true;
      const last = path[path.length - 1];
      const options = shuffle(neighbors(last, size, diagonal), rng);
      for (const n of options) {
        if (cells[n] !== null || path.includes(n)) continue;
        path.push(n);
        if (extend(path)) return true;
        path.pop();
      }
      return false;
    }
  }

  // Count every path of adjacent, distinct tiles that spells `word`.
  function countPaths(letters, word, size, diagonal, limit = 2) {
    let count = 0;
    const visit = (path) => {
      if (count >= limit) return;
      if (path.length === word.length) { count++; return; }
      const last = path[path.length - 1];
      for (const n of neighbors(last, size, diagonal)) {
        if (!path.includes(n) && letters[n] === word[path.length]) visit([...path, n]);
      }
    };
    letters.forEach((ch, i) => { if (ch === word[0]) visit([i]); });
    return count;
  }

  function generateGrid(words, opts = {}) {
    const size = opts.size || 5;
    const diagonal = !!opts.diagonal;
    const rng = opts.rng || Math.random;
    const upper = words.map((w) => w.toUpperCase());
    const total = upper.reduce((n, w) => n + w.length, 0);
    if (total > size * size) throw new Error('Words do not fit in the grid');

    const used = new Set(upper.join(''));
    let filler = ALPHABET.split('').filter((ch) => !used.has(ch));
    if (filler.length === 0) filler = ALPHABET.split('');

    for (let attempt = 0; attempt < 500; attempt++) {
      const cells = Array(size * size).fill(null);
      const paths = [];
      let ok = true;
      for (const word of upper) {
        const path = placeWord(word, cells, size, diagonal, rng);
        if (!path) { ok = false; break; }
        path.forEach((idx, i) => { cells[idx] = word[i]; });
        paths.push(path);
      }
      if (!ok) continue;
      const letters = cells.map((ch) => ch || filler[Math.floor(rng() * filler.length)]);
      // Words can share letters (COW / BROWN). Make sure each word can be spelled
      // in exactly one place, so finding one word never "uses up" the other.
      if (!upper.every((w) => countPaths(letters, w, size, diagonal) === 1)) continue;
      return { letters, paths, size, diagonal };
    }
    throw new Error('Could not place words: ' + upper.join(', '));
  }

  const api = { generateGrid, neighbors, isAdjacent, countPaths };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.LinxGrid = api;
})(typeof window !== 'undefined' ? window : globalThis);
