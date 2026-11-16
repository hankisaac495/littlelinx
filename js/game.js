// LittleLinx game flow: 10 rounds, a picture, a 5x5 letter grid,
// one main word and one bonus word per round. Everything is spoken aloud.

(function () {
  const CONFIG = {
    size: 5,
    rounds: 10,
    diagonal: false,      // little fingers: up/down/left/right only
    shuffleRounds: false,
    autoHintAfterMisses: 2,
  };

  const A = window.LinxAudio;
  const $ = (id) => document.getElementById(id);
  const els = {
    start: $('start'), game: $('game'), end: $('end'),
    picture: $('picture'), grid: $('grid'), progress: $('progress'),
    mainSlots: $('mainSlots'), bonusSlots: $('bonusSlots'),
    nextBtn: $('nextBtn'), hearBtn: $('hearBtn'), hintBtn: $('hintBtn'),
    muteBtn: $('muteBtn'), playBtn: $('playBtn'), againBtn: $('againBtn'),
    endStars: $('endStars'), confetti: $('confetti'),
  };

  const state = {
    rounds: [], index: 0, round: null, board: null, tiles: [],
    selection: [], found: { main: false, bonus: false },
    misses: 0, results: [], dragging: false, busy: false,
    pointer: null, foundLines: [], hintPath: null, hintLevel: 0,
  };

  // ---------- Speech sequencing ----------
  // Any new speech cancels whatever sequence was playing before.
  let sayToken = 0;
  async function say(...parts) {
    const token = ++sayToken;
    for (const part of parts) {
      if (token !== sayToken) return;
      await A.speak(part);
    }
  }
  const spelled = (word) => word.split('').map(A.letterName).join(', ');
  const lower = (w) => w.toLowerCase();

  // ---------- Screens ----------
  function show(screen) {
    [els.start, els.game, els.end].forEach((s) => s.classList.toggle('active', s === screen));
  }

  function startGame() {
    A.unlock();
    let rounds = window.LINX_ROUNDS.slice();
    if (CONFIG.shuffleRounds) rounds.sort(() => Math.random() - 0.5);
    state.rounds = rounds.slice(0, CONFIG.rounds);
    state.index = 0;
    state.results = [];
    show(els.game);
    startRound();
  }

  function startRound() {
    const round = state.rounds[state.index];
    state.round = round;
    state.found = { main: false, bonus: false };
    state.results[state.index] = state.found;
    state.selection = [];
    state.misses = 0;
    state.foundLines = [];
    state.hintPath = null;
    state.hintLevel = 0;
    state.dragging = false;
    state.board = LinxGrid.generateGrid([round.word, round.bonus], {
      size: CONFIG.size, diagonal: CONFIG.diagonal,
    });

    renderProgress();
    renderPicture();
    renderGrid();
    renderSlots();
    els.nextBtn.classList.add('hidden');

    const intro = state.index === 0
      ? ['Put your finger on the first letter, and slide to spell the word. Then lift your finger.']
      : [];
    say(`Picture ${state.index + 1}.`, round.prompt, ...intro);
  }

  function finishRound() {
    state.index++;
    if (state.index >= state.rounds.length) showEnd();
    else startRound();
  }

  function showEnd() {
    show(els.end);
    const stars = state.results.reduce((n, r) => n + (r.main ? 1 : 0) + (r.bonus ? 1 : 0), 0);
    els.endStars.innerHTML = '';
    // One badge per picture: big star for the word, small star for the bonus.
    state.results.forEach((r, i) => {
      const b = document.createElement('div');
      b.className = 'badge';
      b.style.animationDelay = `${i * 0.1}s`;
      b.innerHTML = `<span class="${r.main ? '' : 'off'}">⭐</span>` +
        (r.bonus ? '<span class="b">🌟</span>' : '');
      els.endStars.appendChild(b);
    });
    A.sfx.fanfare();
    confetti(80);
    say(`You did it! You got ${stars} stars!`, 'Tap the button to play again.');
  }

  // ---------- Rendering ----------
  function renderProgress() {
    els.progress.innerHTML = '';
    state.rounds.forEach((_, i) => {
      const d = document.createElement('div');
      d.className = 'dot';
      const r = state.results[i];
      if (r && r.main) d.classList.add('done');
      if (r && r.bonus) d.classList.add('bonus');
      if (i === state.index) d.classList.add('current');
      els.progress.appendChild(d);
    });
  }

  function renderPicture() {
    const r = state.round;
    els.picture.innerHTML = r.image
      ? `<img src="${r.image}" alt="${lower(r.word)}">`
      : r.art;
    els.picture.setAttribute('aria-label', lower(r.word));
    els.picture.classList.remove('enter');
    void els.picture.offsetWidth; // restart animation
    els.picture.classList.add('enter');
  }

  function renderGrid() {
    els.grid.innerHTML = '';
    state.tiles = state.board.letters.map((ch, i) => {
      const t = document.createElement('div');
      t.className = 'tile';
      t.innerHTML = `<span class="ch">${ch}</span>`;
      t.dataset.idx = i;
      t.setAttribute('role', 'gridcell');
      t.style.animationDelay = `${(Math.floor(i / CONFIG.size) + (i % CONFIG.size)) * 0.04}s`;
      els.grid.appendChild(t);
      return t;
    });
    state.lines = document.createElementNS(SVGNS, 'svg');
    state.lines.setAttribute('class', 'lines');
    els.grid.appendChild(state.lines);
    requestAnimationFrame(drawLines);
  }

  // ---------- Connecting lines ----------
  const SVGNS = 'http://www.w3.org/2000/svg';

  function tileCenter(i) {
    const t = state.tiles[i];
    return [t.offsetLeft + t.offsetWidth / 2, t.offsetTop + t.offsetHeight / 2];
  }

  function polyline(points, cls) {
    const el = document.createElementNS(SVGNS, 'polyline');
    el.setAttribute('points', points.map((p) => p.join(',')).join(' '));
    el.setAttribute('class', cls);
    return el;
  }

  function drawLines() {
    const svg = state.lines;
    if (!svg || !state.tiles.length) return;
    svg.setAttribute('viewBox', `0 0 ${els.grid.clientWidth} ${els.grid.clientHeight}`);
    svg.style.setProperty('--w', state.tiles[0].offsetWidth * 0.26 + 'px');
    svg.innerHTML = '';
    if (state.hintPath) svg.appendChild(polyline(state.hintPath.map(tileCenter), 'line hint'));
    state.foundLines.forEach((f) => svg.appendChild(polyline(f.path.map(tileCenter), 'line ' + f.kind)));
    if (state.selection.length) {
      const pts = state.selection.map(tileCenter);
      // While dragging, stretch the line from the last letter to the finger.
      if (state.dragging && state.pointer) {
        const g = els.grid.getBoundingClientRect();
        pts.push([state.pointer[0] - g.left - els.grid.clientLeft, state.pointer[1] - g.top - els.grid.clientTop]);
      }
      svg.appendChild(polyline(pts, 'line current'));
      const [x, y] = pts[0];
      const dot = document.createElementNS(SVGNS, 'circle');
      dot.setAttribute('cx', x); dot.setAttribute('cy', y);
      dot.setAttribute('class', 'line-start');
      svg.appendChild(dot);
    }
  }

  function renderSlots() {
    const sel = selectedWord();
    const fill = (box, word, done) => {
      box.innerHTML = '';
      const typing = !done && sel && word.startsWith(sel) && targetFor(sel) === word;
      box.classList.toggle('typing', typing);
      for (let i = 0; i < word.length; i++) {
        const s = document.createElement('div');
        s.className = 'slot';
        if (done) { s.textContent = word[i]; s.classList.add('filled'); }
        else if (typing && i < sel.length) { s.textContent = sel[i]; s.classList.add('filled'); }
        box.appendChild(s);
      }
    };
    fill(els.mainSlots, state.round.word, state.found.main);
    fill(els.bonusSlots, state.round.bonus, state.found.bonus);
  }

  function renderSelection() {
    state.tiles.forEach((t, i) => {
      const at = state.selection.indexOf(i);
      t.classList.toggle('selected', at >= 0);
      t.classList.toggle('last', at >= 0 && at === state.selection.length - 1);
    });
    renderSlots();
    drawLines();
  }

  // ---------- Selection logic ----------
  const selectedWord = () => state.selection.map((i) => state.board.letters[i]).join('');

  function remainingWords() {
    const out = [];
    if (!state.found.main) out.push(state.round.word);
    if (!state.found.bonus) out.push(state.round.bonus);
    return out;
  }

  // Which unfound word the current letters are heading toward (main word wins ties).
  function targetFor(prefix) {
    return remainingWords().find((w) => w.startsWith(prefix)) || null;
  }

  function isFoundTile(i) {
    return state.tiles[i].classList.contains('found-main') || state.tiles[i].classList.contains('found-bonus');
  }

  function adjacent(a, b) {
    return LinxGrid.isAdjacent(a, b, CONFIG.size, CONFIG.diagonal);
  }

  // Finger (or mouse button) goes down on a tile: start a new word there.
  function pressTile(i) {
    if (state.busy || isFoundTile(i)) return;
    state.dragging = true;
    state.selection = [i];
    afterChange(true);
  }

  // Finger sliding across tiles while pressed: add the next touching tile,
  // or slide back onto the previous tile to undo the last letter.
  function dragOver(i) {
    if (state.busy || isFoundTile(i)) return;
    const sel = state.selection;
    if (!sel.length || i === sel[sel.length - 1]) return;
    if (sel.length > 1 && i === sel[sel.length - 2]) { sel.pop(); afterChange(false); return; }
    if (adjacent(sel[sel.length - 1], i) && !sel.includes(i)) { sel.push(i); afterChange(true); }
  }

  // Finger lifted / mouse released: only now is the word checked.
  function release() {
    if (!state.dragging) return;
    state.dragging = false;
    state.pointer = null;
    const word = selectedWord();
    if (!state.found.main && word === state.round.word) return foundWord('main');
    if (!state.found.bonus && word === state.round.bonus) return foundWord('bonus');
    if (state.selection.length <= 1) {
      // A single tap just says the letter; it isn't counted as a try.
      state.selection = [];
      renderSelection();
      return;
    }
    miss();
  }

  function cancelDrag() {
    state.dragging = false;
    state.pointer = null;
    state.selection = [];
    renderSelection();
  }

  function afterChange(added) {
    renderSelection();
    if (added) {
      const word = selectedWord();
      A.sfx.tap(state.selection.length * 2);
      sayToken++;
      A.sayLetter(word[word.length - 1]);
    }
  }

  function miss() {
    state.busy = true;
    const tiles = state.selection.map((i) => state.tiles[i]);
    setTimeout(() => {
      A.sfx.oops();
      tiles.forEach((t) => { t.classList.remove('shake'); void t.offsetWidth; t.classList.add('shake'); });
    }, 250);
    setTimeout(() => {
      tiles.forEach((t) => t.classList.remove('shake'));
      state.selection = [];
      state.busy = false;
      renderSelection();
      state.misses++;
      if (state.misses >= CONFIG.autoHintAfterMisses) {
        state.misses = 0;
        hint();
      } else {
        say('Oops! Try again.');
      }
    }, 700);
  }

  async function foundWord(kind) {
    const r = state.round;
    const word = kind === 'main' ? r.word : r.bonus;
    state.found[kind] = true;
    renderProgress();
    const tiles = state.selection.slice();
    state.selection = [];
    state.foundLines.push({ path: tiles, kind });
    state.hintLevel = 0;
    clearHints();
    tiles.forEach((i, n) => {
      const t = state.tiles[i];
      t.classList.remove('selected', 'last');
      setTimeout(() => t.classList.add(kind === 'main' ? 'found-main' : 'found-bonus'), n * 90);
    });
    renderSelection();
    state.misses = 0;

    if (kind === 'main') {
      A.sfx.win();
      confetti(40);
      els.picture.classList.remove('wiggle'); void els.picture.offsetWidth; els.picture.classList.add('wiggle');
      els.nextBtn.classList.remove('hidden');
      if (state.found.bonus) {
        say(`Yes! ${spelled(word)}. ${lower(word)}!`, 'You found both words! Tap the arrow for the next picture.');
      } else {
        say(`Yes! ${spelled(word)}. ${lower(word)}!`, r.bonusPrompt,
          'Or tap the arrow for the next picture.');
      }
    } else {
      A.sfx.bonus();
      confetti(60, true);
      if (state.found.main) {
        say(`Wow! ${lower(word)}! You found the bonus word!`, 'Tap the arrow for the next picture.');
      } else {
        say(`Wow! ${lower(word)}! That's the bonus word!`, `Now find the word, ${lower(r.word)}.`);
      }
    }
  }

  // ---------- Help ----------
  function clearHints() {
    state.tiles.forEach((t) => t.classList.remove('hint'));
    state.hintPath = null;
    drawLines();
  }

  // First hint: light up the first letter. Next hints: show the whole path.
  function hint() {
    const r = state.round;
    const kind = !state.found.main ? 'main' : !state.found.bonus ? 'bonus' : null;
    if (!kind) return say('Tap the arrow for the next picture.');
    const word = kind === 'main' ? r.word : r.bonus;
    const path = state.board.paths[kind === 'main' ? 0 : 1];
    clearHints();

    const ch = A.letterName(word[0]);
    if (state.hintLevel === 0) {
      state.tiles[path[0]].classList.add('hint');
      say(`${lower(word)} starts with the letter ${ch}.`, `Put your finger on the ${ch}.`);
    } else {
      path.forEach((i) => state.tiles[i].classList.add('hint'));
      state.hintPath = path;
      drawLines();
      say(`Put your finger on the ${ch}, and slide. ${spelled(word)}. Then lift your finger.`);
    }
    state.hintLevel++;
  }

  function repeatPrompt() {
    const r = state.round;
    if (!state.found.main) say(r.prompt);
    else if (!state.found.bonus) say(r.bonusPrompt);
    else say('Tap the arrow for the next picture.');
  }

  // ---------- Effects ----------
  function confetti(n, gold) {
    const colors = gold ? ['#ffb400', '#ffd60a', '#fff2a8', '#ff9f43'] : ['#7c5cff', '#2ec27e', '#ff5d8f', '#ffd60a', '#2f80ed'];
    for (let i = 0; i < n; i++) {
      const c = document.createElement('i');
      c.style.left = Math.random() * 100 + 'vw';
      c.style.background = colors[i % colors.length];
      c.style.animationDuration = 1.4 + Math.random() * 1.6 + 's';
      c.style.animationDelay = Math.random() * 0.4 + 's';
      els.confetti.appendChild(c);
      setTimeout(() => c.remove(), 3500);
    }
  }

  // ---------- Input ----------
  function tileFromPoint(x, y, strict) {
    const el = document.elementFromPoint(x, y);
    const tile = el && el.closest('.tile');
    if (!tile) return -1;
    if (strict) {
      // While dragging, only count the middle of a tile so a finger brushing
      // the corner of a neighbour doesn't add it by accident.
      const b = tile.getBoundingClientRect();
      const dx = Math.abs(x - (b.left + b.width / 2));
      const dy = Math.abs(y - (b.top + b.height / 2));
      if (dx > b.width * 0.38 || dy > b.height * 0.38) return -1;
    }
    return Number(tile.dataset.idx);
  }

  els.grid.addEventListener('pointerdown', (e) => {
    if (e.button > 0) return;
    const i = tileFromPoint(e.clientX, e.clientY, false);
    if (i < 0) return;
    e.preventDefault();
    state.pointer = [e.clientX, e.clientY];
    pressTile(i);
  });
  window.addEventListener('pointermove', (e) => {
    if (!state.dragging) return;
    state.pointer = [e.clientX, e.clientY];
    const i = tileFromPoint(e.clientX, e.clientY, true);
    if (i >= 0) dragOver(i);
    drawLines();
  });
  window.addEventListener('pointerup', release);
  window.addEventListener('pointercancel', cancelDrag);
  window.addEventListener('blur', cancelDrag);
  window.addEventListener('resize', () => drawLines());

  els.playBtn.addEventListener('click', startGame);
  els.againBtn.addEventListener('click', startGame);
  els.nextBtn.addEventListener('click', () => { A.stop(); finishRound(); });
  els.hearBtn.addEventListener('click', repeatPrompt);
  els.picture.addEventListener('click', () => {
    els.picture.classList.remove('wiggle'); void els.picture.offsetWidth; els.picture.classList.add('wiggle');
    repeatPrompt();
  });
  els.hintBtn.addEventListener('click', hint);
  els.muteBtn.addEventListener('click', () => {
    A.setMuted(!A.isMuted());
    els.muteBtn.textContent = A.isMuted() ? '🔇' : '🔊';
  });

  // Expose for debugging / tests.
  window.LittleLinx = { state, CONFIG, startGame };
})();
