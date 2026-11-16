// Audio: the narrator and simple sound effects.
//
// The narrator plays recorded clips from audio/<key>.mp3 (see js/lines.js for
// every key and its words). If a clip is missing or fails to load, the same
// words are read by the browser's built-in voice instead.

(function (root) {
  const synth = root.speechSynthesis;
  const GAP = 0.12; // seconds of silence between clips in a sequence
  let voice = null;
  let ctx = null;
  let muted = false;

  const buffers = {};   // key -> decoded AudioBuffer
  const loading = {};   // key -> Promise
  let current = null;   // the clip that is playing now
  let token = 0;        // bumps on every new sequence so old ones stop

  function audioCtx() {
    if (!ctx) {
      const AC = root.AudioContext || root.webkitAudioContext;
      if (AC) ctx = new AC();
    }
    return ctx;
  }

  // ---------- Recorded clips ----------
  // audio/clips.json lists the clips that exist, so missing ones aren't requested.
  let available = null;
  function clipList() {
    if (!available) {
      available = typeof fetch !== 'function'
        ? Promise.resolve(new Set())
        : fetch('audio/clips.json')
          .then((r) => (r.ok ? r.json() : []))
          .then((list) => new Set(list))
          .catch(() => new Set());
    }
    return available;
  }

  async function load(key) {
    if (buffers[key]) return buffers[key];
    if (!(await clipList()).has(key)) return null;
    return fetchClip(key);
  }

  function fetchClip(key) {
    if (loading[key]) return loading[key];
    const c = audioCtx();
    if (!c) return Promise.resolve(null);
    loading[key] = fetch(`audio/${key}.mp3`)
      .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(r.status)))
      .then((data) => new Promise((ok, fail) => c.decodeAudioData(data, ok, fail)))
      .then((buf) => (buffers[key] = buf))
      .catch(() => null);
    return loading[key];
  }

  function preload(keys) {
    return Promise.all(keys.map(load));
  }

  function playBuffer(buf) {
    return new Promise((resolve) => {
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(ctx.destination);
      src.onended = () => { if (current === src) current = null; resolve(); };
      current = src;
      src.start();
    });
  }

  const wait = (s) => new Promise((r) => setTimeout(r, s * 1000));

  function stop() {
    token++;
    if (current) { try { current.stop(); } catch (e) { /* already stopped */ } current = null; }
    if (synth) synth.cancel();
  }

  // Say a list of clip keys in order. Starting a new sequence stops the old one.
  async function say(...keys) {
    stop();
    const mine = token;
    for (let i = 0; i < keys.length; i++) {
      if (mine !== token || muted) return;
      const key = keys[i];
      const buf = await load(key);
      if (mine !== token || muted) return;
      if (buf && ctx) await playBuffer(buf);
      else await speakText((root.LINX_LINES || {})[key] || key);
      if (i < keys.length - 1) await wait(GAP);
    }
  }

  // ---------- Built-in voice fallback ----------
  function pickVoice() {
    if (!synth) return;
    const english = synth.getVoices().filter((v) => /^en/i.test(v.lang));
    const preferred = ['Samantha', 'Google US English', 'Karen', 'Moira', 'Microsoft Aria', 'Microsoft Jenny'];
    voice =
      english.find((v) => preferred.some((p) => v.name.includes(p))) ||
      english.find((v) => v.localService) ||
      english[0] ||
      null;
  }
  if (synth) {
    pickVoice();
    synth.onvoiceschanged = pickVoice;
  }

  function speakText(text) {
    return new Promise((resolve) => {
      if (!synth || muted) return resolve();
      const u = new SpeechSynthesisUtterance(text);
      if (voice) u.voice = voice;
      u.rate = 0.85;
      u.pitch = 1.15;
      u.onend = u.onerror = () => resolve();
      synth.speak(u);
    });
  }

  // Must be called from a user gesture (tap) so mobile browsers allow audio.
  function unlock() {
    const c = audioCtx();
    if (c && c.state === 'suspended') c.resume();
    if (synth) synth.speak(new SpeechSynthesisUtterance(''));
  }

  // ---------- Sound effects ----------
  function tone(freq, start, dur, type = 'sine', gain = 0.18) {
    if (!ctx || muted) return;
    const t = ctx.currentTime + start;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(g).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }

  const sfx = {
    tap(step = 0) { tone(440 * Math.pow(2, step / 12), 0, 0.12, 'triangle', 0.06); },
    oops() { tone(300, 0, 0.18, 'sine', 0.12); tone(240, 0.12, 0.25, 'sine', 0.12); },
    win() { [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.11, 0.3, 'triangle')); },
    bonus() { [784, 988, 1175, 1568, 1976].forEach((f, i) => tone(f, i * 0.08, 0.25, 'sine', 0.14)); },
    fanfare() {
      [523, 523, 523, 659, 784, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.14, 0.3, 'triangle'));
    },
  };

  function setMuted(m) {
    muted = m;
    if (m) stop();
  }

  root.LinxAudio = { unlock, say, preload, stop, sfx, setMuted, isMuted: () => muted };
})(window);
