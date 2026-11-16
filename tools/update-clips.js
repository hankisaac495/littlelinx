// Rebuilds audio/clips.json from the mp3 files in audio/, and lists any
// narrator lines (js/lines.js) that still have no recording.
// Run with: node tools/update-clips.js
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
global.window = globalThis;
require(path.join(root, 'js/rounds.js'));
const LINES = require(path.join(root, 'js/lines.js'));

const dir = path.join(root, 'audio');
const have = fs.readdirSync(dir).filter((f) => f.endsWith('.mp3')).map((f) => f.slice(0, -4));
const known = have.filter((k) => k in LINES).sort();
fs.writeFileSync(path.join(dir, 'clips.json'), JSON.stringify(known, null, 1) + '\n');

const missing = Object.keys(LINES).filter((k) => !have.includes(k));
const extra = have.filter((k) => !(k in LINES));
console.log(`${known.length} clips listed, ${missing.length} lines still use the browser voice.`);
if (missing.length) console.log('Missing:\n' + missing.map((k) => `  ${k}.mp3  "${LINES[k]}"`).join('\n'));
if (extra.length) console.log('Not used by the game: ' + extra.join(', '));
