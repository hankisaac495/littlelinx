// Audio: spoken instructions (Web Speech API) and simple sound effects (Web Audio).
// Speech is the main way pre-readers get instructions, so every prompt is spoken.

(function (root) {
  const synth = root.speechSynthesis;
  let voice = null;
  let ctx = null;
  let muted = false;

  // Spoken names for every letter. Passing a bare capital ("D") makes many
  // voices say "capital D", so we always speak the name instead.
  const LETTER_NAMES = {
    A: 'ay', B: 'bee', C: 'see', D: 'dee', E: 'ee', F: 'eff', G: 'jee',
    H: 'aitch', I: 'eye', J: 'jay', K: 'kay', L: 'el', M: 'em', N: 'en',
    O: 'oh', P: 'pee', Q: 'cue', R: 'ar', S: 'ess', T: 'tee', U: 'you',
    V: 'vee', W: 'double you', X: 'ex', Y: 'why', Z: 'zee',
  };

  function pickVoice() {
    if (!synth) return;
    const voices = synth.getVoices();
    const english = voices.filter((v) => /^en/i.test(v.lang));
    // Prefer friendly, natural-sounding voices when available.
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

  // Must be called from a user gesture (tap) so mobile browsers allow audio.
  function unlock() {
    if (!ctx) {
      const AC = root.AudioContext || root.webkitAudioContext;
      if (AC) ctx = new AC();
    }
    if (ctx && ctx.state === 'suspended') ctx.resume();
    if (synth) synth.speak(new SpeechSynthesisUtterance(''));
  }

  function speak(text, { interrupt = true, rate = 0.85, pitch = 1.15 } = {}) {
    return new Promise((resolve) => {
      if (!synth || muted) return resolve();
      if (interrupt) synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      if (voice) u.voice = voice;
      u.rate = rate;
      u.pitch = pitch;
      u.onend = u.onerror = () => resolve();
      synth.speak(u);
    });
  }

  function sayLetter(ch) {
    return speak(LETTER_NAMES[ch] || ch, { rate: 0.9 });
  }

  function spell(word) {
    return speak(word.split('').map((ch) => LETTER_NAMES[ch] || ch).join(', '), { rate: 0.6 });
  }

  function stop() {
    if (synth) synth.cancel();
  }

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
    tap(step = 0) { tone(440 * Math.pow(2, step / 12), 0, 0.15, 'triangle', 0.12); },
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

  root.LinxAudio = { letterName: (ch) => LETTER_NAMES[ch] || ch, unlock, speak, sayLetter, spell, stop, sfx, setMuted, isMuted: () => muted };
})(window);
