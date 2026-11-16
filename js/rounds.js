// Round content. Each round has:
//   word   – the main word (the thing in the picture)
//   bonus  – a describing word that is visible in the picture (usually a color)
//   prompt – what is spoken at the start of the round
//   bonusPrompt – the spoken bonus question
//   art    – an inline SVG illustration (viewBox 0 0 240 180).
//            Swap for an <img> URL later by setting `image: 'images/dog.png'` instead.

(function (root) {
  const svg = (body) =>
    `<svg viewBox="0 0 240 180" xmlns="http://www.w3.org/2000/svg" role="img">${body}</svg>`;
  const ground = '<ellipse cx="120" cy="165" rx="95" ry="10" fill="#000" opacity=".08"/>';
  const eye = (x, y, r = 6) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff"/><circle cx="${x + 1}" cy="${y + 1}" r="${r * 0.55}" fill="#222"/><circle cx="${x + 2}" cy="${y - 1}" r="${r * 0.2}" fill="#fff"/>`;

  const ROUNDS = [
    {
      word: 'DOG', bonus: 'BLACK',
      prompt: 'Look at the picture. Find the word, dog!',
      bonusPrompt: 'Bonus! What color is the dog?',
      art: svg(`${ground}
        <rect x="70" y="85" width="105" height="55" rx="26" fill="#222"/>
        <rect x="80" y="125" width="16" height="38" rx="8" fill="#222"/>
        <rect x="150" y="125" width="16" height="38" rx="8" fill="#222"/>
        <path d="M172 95 q30 -20 22 -45" stroke="#222" stroke-width="12" fill="none" stroke-linecap="round"/>
        <circle cx="72" cy="72" r="36" fill="#2b2b2b"/>
        <ellipse cx="44" cy="70" rx="13" ry="26" fill="#111" transform="rotate(20 44 70)"/>
        <ellipse cx="100" cy="70" rx="13" ry="26" fill="#111" transform="rotate(-20 100 70)"/>
        ${eye(60, 66)}${eye(84, 66)}
        <ellipse cx="72" cy="86" rx="9" ry="6" fill="#555"/>
        <path d="M64 96 q8 8 16 0" stroke="#e66" stroke-width="4" fill="none" stroke-linecap="round"/>
        <rect x="58" y="104" width="30" height="7" rx="3" fill="#e33"/>`),
    },
    {
      word: 'CAT', bonus: 'WHITE',
      prompt: 'Look at the picture. Find the word, cat!',
      bonusPrompt: 'Bonus! What color is the cat?',
      art: svg(`<rect x="0" y="0" width="240" height="180" fill="#cfe8ff" opacity=".6"/>${ground}
        <ellipse cx="135" cy="125" rx="55" ry="38" fill="#fff" stroke="#ccc" stroke-width="2"/>
        <path d="M185 125 q40 -10 25 -55" stroke="#fff" stroke-width="14" fill="none" stroke-linecap="round"/>
        <path d="M185 125 q40 -10 25 -55" stroke="#ccc" stroke-width="2" fill="none" transform="translate(0,7)" opacity=".4"/>
        <circle cx="95" cy="85" r="38" fill="#fff" stroke="#ccc" stroke-width="2"/>
        <path d="M62 68 L66 30 L90 52 Z" fill="#fff" stroke="#ccc" stroke-width="2"/>
        <path d="M128 68 L124 30 L100 52 Z" fill="#fff" stroke="#ccc" stroke-width="2"/>
        <path d="M68 60 L69 40 L84 53 Z" fill="#f9b"/><path d="M122 60 L121 40 L106 53 Z" fill="#f9b"/>
        <ellipse cx="81" cy="82" rx="6" ry="9" fill="#4a4"/><ellipse cx="109" cy="82" rx="6" ry="9" fill="#4a4"/>
        <ellipse cx="81" cy="82" rx="2" ry="7" fill="#111"/><ellipse cx="109" cy="82" rx="2" ry="7" fill="#111"/>
        <path d="M90 96 l5 5 l5 -5 Z" fill="#f79"/>
        <path d="M95 101 q-6 7 -12 2 M95 101 q6 7 12 2" stroke="#999" stroke-width="2" fill="none"/>
        <path d="M70 98 h-22 M70 103 l-20 6 M120 98 h22 M120 103 l20 6" stroke="#aaa" stroke-width="2"/>`),
    },
    {
      word: 'SUN', bonus: 'YELLOW',
      prompt: 'Look up in the sky. Find the word, sun!',
      bonusPrompt: 'Bonus! What color is the sun?',
      art: svg(`<rect x="0" y="0" width="240" height="180" fill="#bfe6ff"/>
        <g transform="translate(120 90)">
          ${Array.from({ length: 12 }, (_, i) =>
            `<rect x="-6" y="-82" width="12" height="26" rx="6" fill="#ffc800" transform="rotate(${i * 30})"/>`).join('')}
          <circle r="50" fill="#ffd60a"/>
          ${eye(-17, -8, 7)}${eye(17, -8, 7)}
          <circle cx="-30" cy="12" r="7" fill="#ff9f43" opacity=".6"/><circle cx="30" cy="12" r="7" fill="#ff9f43" opacity=".6"/>
          <path d="M-16 14 q16 18 32 0" stroke="#c46a00" stroke-width="5" fill="none" stroke-linecap="round"/>
        </g>`),
    },
    {
      word: 'PIG', bonus: 'PINK',
      prompt: 'Oink oink! Find the word, pig!',
      bonusPrompt: 'Bonus! What color is the pig?',
      art: svg(`<rect x="0" y="130" width="240" height="50" fill="#a5d66f"/>${ground}
        <ellipse cx="130" cy="110" rx="62" ry="42" fill="#ffadc6"/>
        <rect x="90" y="135" width="15" height="30" rx="7" fill="#f79ab6"/>
        <rect x="155" y="135" width="15" height="30" rx="7" fill="#f79ab6"/>
        <path d="M192 100 q16 -4 10 -16 q-8 -8 -4 8" stroke="#f79ab6" stroke-width="5" fill="none" stroke-linecap="round"/>
        <circle cx="80" cy="85" r="38" fill="#ffb8cf"/>
        <path d="M52 60 L50 32 L74 50 Z" fill="#f79ab6"/><path d="M108 60 L110 32 L86 50 Z" fill="#f79ab6"/>
        ${eye(66, 76, 6)}${eye(94, 76, 6)}
        <ellipse cx="80" cy="98" rx="17" ry="12" fill="#ff8fb1"/>
        <ellipse cx="74" cy="98" rx="3" ry="5" fill="#b0476b"/><ellipse cx="86" cy="98" rx="3" ry="5" fill="#b0476b"/>`),
    },
    {
      word: 'FROG', bonus: 'GREEN',
      prompt: 'Ribbit! Find the word, frog!',
      bonusPrompt: 'Bonus! What color is the frog?',
      art: svg(`<rect x="0" y="0" width="240" height="180" fill="#d9f3ff"/>
        <ellipse cx="120" cy="155" rx="100" ry="20" fill="#5aa9e6"/>
        <ellipse cx="120" cy="150" rx="70" ry="12" fill="#3f9b3f"/>
        <ellipse cx="120" cy="115" rx="58" ry="40" fill="#4cc44c"/>
        <ellipse cx="120" cy="125" rx="38" ry="24" fill="#bff0a8"/>
        <circle cx="92" cy="72" r="20" fill="#4cc44c"/><circle cx="148" cy="72" r="20" fill="#4cc44c"/>
        ${eye(92, 70, 11)}${eye(148, 70, 11)}
        <path d="M95 104 q25 18 50 0" stroke="#226622" stroke-width="5" fill="none" stroke-linecap="round"/>
        <ellipse cx="72" cy="146" rx="20" ry="8" fill="#3aa83a"/><ellipse cx="168" cy="146" rx="20" ry="8" fill="#3aa83a"/>`),
    },
    {
      word: 'CAR', bonus: 'RED',
      prompt: 'Beep beep! Find the word, car!',
      bonusPrompt: 'Bonus! What color is the car?',
      art: svg(`<rect x="0" y="140" width="240" height="40" fill="#777"/>
        <rect x="20" y="158" width="30" height="5" fill="#fff"/><rect x="105" y="158" width="30" height="5" fill="#fff"/><rect x="190" y="158" width="30" height="5" fill="#fff"/>
        <path d="M30 125 L30 100 Q32 90 45 88 L75 85 L100 55 Q105 50 115 50 L160 50 Q170 50 176 58 L195 85 L210 90 Q218 93 218 105 L218 125 Z" fill="#e8262c"/>
        <path d="M108 60 L158 60 Q164 60 168 66 L180 84 L92 84 Z" fill="#bfe6ff"/>
        <rect x="132" y="58" width="6" height="28" fill="#e8262c"/>
        <circle cx="205" cy="102" r="6" fill="#ffe066"/>
        <circle cx="70" cy="128" r="20" fill="#222"/><circle cx="70" cy="128" r="8" fill="#bbb"/>
        <circle cx="180" cy="128" r="20" fill="#222"/><circle cx="180" cy="128" r="8" fill="#bbb"/>`),
    },
    {
      word: 'FISH', bonus: 'BLUE',
      prompt: 'Splash! Find the word, fish!',
      bonusPrompt: 'Bonus! What color is the fish?',
      art: svg(`<rect x="0" y="0" width="240" height="180" fill="#d8f4f0"/>
        <circle cx="50" cy="40" r="8" fill="none" stroke="#9cd" stroke-width="3"/><circle cx="35" cy="70" r="5" fill="none" stroke="#9cd" stroke-width="3"/>
        <path d="M170 90 L215 55 L210 90 L215 125 Z" fill="#1e64d6"/>
        <ellipse cx="115" cy="90" rx="65" ry="42" fill="#2f80ed"/>
        <path d="M100 50 q20 -25 45 -5 Z" fill="#1e64d6"/>
        <path d="M110 128 q15 18 30 0 Z" fill="#1e64d6"/>
        <path d="M120 60 q10 30 0 60 M140 62 q10 28 0 56" stroke="#5aa0ff" stroke-width="4" fill="none"/>
        ${eye(78, 80, 10)}
        <path d="M55 100 q8 6 16 0" stroke="#0d3a80" stroke-width="4" fill="none" stroke-linecap="round"/>`),
    },
    {
      word: 'COW', bonus: 'BROWN',
      prompt: 'Moo! Find the word, cow!',
      bonusPrompt: 'Bonus! What color is the cow?',
      art: svg(`<rect x="0" y="130" width="240" height="50" fill="#a5d66f"/>${ground}
        <rect x="80" y="80" width="120" height="58" rx="24" fill="#8b5a2b"/>
        <ellipse cx="160" cy="98" rx="18" ry="13" fill="#6b3f17"/>
        <rect x="92" y="125" width="16" height="40" rx="7" fill="#7a4a20"/>
        <rect x="170" y="125" width="16" height="40" rx="7" fill="#7a4a20"/>
        <ellipse cx="140" cy="140" rx="12" ry="8" fill="#f7a8b8"/>
        <path d="M198 90 q18 20 6 45" stroke="#7a4a20" stroke-width="6" fill="none" stroke-linecap="round"/>
        <path d="M45 48 q-12 -14 0 -22 M95 48 q12 -14 0 -22" stroke="#eee3c4" stroke-width="8" fill="none" stroke-linecap="round"/>
        <ellipse cx="70" cy="78" rx="34" ry="36" fill="#8b5a2b"/>
        <ellipse cx="34" cy="62" rx="14" ry="8" fill="#6b3f17"/><ellipse cx="106" cy="62" rx="14" ry="8" fill="#6b3f17"/>
        ${eye(57, 70, 7)}${eye(83, 70, 7)}
        <ellipse cx="70" cy="100" rx="24" ry="16" fill="#f2c6a0"/>
        <ellipse cx="62" cy="100" rx="4" ry="5" fill="#6b3f17"/><ellipse cx="78" cy="100" rx="4" ry="5" fill="#6b3f17"/>`),
    },
    {
      word: 'HAT', bonus: 'PURPLE',
      prompt: 'Put it on your head! Find the word, hat!',
      bonusPrompt: 'Bonus! What color is the hat?',
      art: svg(`<rect x="0" y="0" width="240" height="180" fill="#fff3d6"/>${ground}
        <ellipse cx="120" cy="140" rx="100" ry="22" fill="#6a2fb0"/>
        <path d="M65 140 L72 55 Q120 30 168 55 L175 140 Z" fill="#8e44d8"/>
        <path d="M68 115 L172 115 L174 135 L66 135 Z" fill="#ffd60a"/>
        <circle cx="150" cy="125" r="9" fill="#ff5d8f"/>
        <ellipse cx="120" cy="142" rx="56" ry="9" fill="#5b2896" opacity=".5"/>`),
    },
    {
      word: 'STAR', bonus: 'GOLD',
      prompt: 'Twinkle twinkle! Find the word, star!',
      bonusPrompt: 'Bonus! This star is shiny. What color is it?',
      art: svg(`<rect x="0" y="0" width="240" height="180" fill="#1d2a5c"/>
        <circle cx="30" cy="30" r="2" fill="#fff"/><circle cx="210" cy="40" r="2" fill="#fff"/><circle cx="40" cy="150" r="2" fill="#fff"/><circle cx="200" cy="150" r="2" fill="#fff"/><circle cx="190" cy="95" r="1.5" fill="#fff"/>
        <defs><linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#fff2a8"/><stop offset=".5" stop-color="#f5c000"/><stop offset="1" stop-color="#c8900a"/>
        </linearGradient></defs>
        <path d="M120 18 L141 68 L195 72 L153 106 L167 160 L120 130 L73 160 L87 106 L45 72 L99 68 Z" fill="url(#gold)" stroke="#a87400" stroke-width="3" stroke-linejoin="round"/>
        ${eye(106, 92, 7)}${eye(134, 92, 7)}
        <path d="M108 110 q12 12 24 0" stroke="#8a5a00" stroke-width="4" fill="none" stroke-linecap="round"/>`),
    },
  ];

  root.LINX_ROUNDS = ROUNDS;
})(window);
