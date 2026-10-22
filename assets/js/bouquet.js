// Draws bouquets as SVG so the picture follows the customer's choices:
// wrap (White, Black, Newspaper), ribbon colour, number of flowers, flower colours and glitter.
//
// bouquetSrc({ kind: "pipe", flowers: ["rose", "tulip"], count: 6, wrap: "White", ribbon: "Red" })
// bouquetSrc({ kind: "ribbon", colours: "Red & White", count: 20, wrap: "Black", ribbon: "Red", glitter: true })
(function () {
  const WRAPS = {
    White: { fill: "#fbfaf6", shade: "#ece8df", edge: "#c9ab6e", line: "#e3ddd1" },
    Black: { fill: "#232022", shade: "#141213", edge: "#c9ab6e", line: "#3a3537" },
    Newspaper: { fill: "#e6d8bb", shade: "#cdbb97", edge: "#a8916a", line: "#cdbb97", print: true },
  };
  const RIBBONS = {
    Red: "#d1202f", Burgundy: "#8c1626", Pink: "#ee93ab", Lavender: "#a585d6",
    Blue: "#1f86d1", Gold: "#d9a531", Black: "#1b1a1b", White: "#f4f3f1",
  };
  // Satin rose colours: [base, highlight, shadow]
  const ROSE = {
    red: ["#cf1f2e", "#f0525c", "#8e0f1a"], burgundy: ["#9b1b2b", "#c8404f", "#5e0b16"],
    blue: ["#2a8ad6", "#7cc2f2", "#165a95"], white: ["#eef0f3", "#ffffff", "#c3c8d0"],
    black: ["#232125", "#55515a", "#0c0b0d"], pink: ["#f2a3b8", "#ffd3df", "#cf6f8b"],
  };
  // Named colour mixes for ribbon rose bouquets. "ring" puts the second colour in the middle.
  const MIXES = {
    Red: ["red"], Burgundy: ["burgundy"], Blue: ["blue"], White: ["white"], Black: ["black"], Pink: ["pink"],
    "Red & White": ["red", "white"], "Black & White": ["black", "white"],
    "Blue & White": { ring: ["blue", "white"] },
  };

  function rng(seed) {
    let s = seed >>> 0;
    return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  }
  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    const t = amt < 0 ? 0 : 255, p = Math.abs(amt);
    r = Math.round((t - r) * p + r); g = Math.round((t - g) * p + g); b = Math.round((t - b) * p + b);
    return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
  }
  function petals(n, draw) {
    let s = "";
    for (let i = 0; i < n; i++) s += `<g transform="rotate(${(360 / n) * i})">${draw(i)}</g>`;
    return s;
  }

  // ---------- Pipe-cleaner flowers, drawn about 110px across around 0,0 ----------
  const PIPE = {
    sunflower: () => `${petals(16, () => `<path d="M0 -20 C 13 -32 11 -52 0 -60 C -11 -52 -13 -32 0 -20Z" fill="url(#sunPetal)" stroke="#d9a20f" stroke-width="2"/>`)}
      <circle r="26" fill="#4a2a17"/>${[22, 16, 10, 4].map((r, i) => `<circle r="${r}" fill="none" stroke="${i % 2 ? "#6b3f22" : "#3a2010"}" stroke-width="4"/>`).join("")}`,
    rose: () => `${petals(6, () => `<path d="M0 -8 C 26 -14 40 -36 22 -48 C 10 -56 -10 -56 -22 -48 C -40 -36 -26 -14 0 -8Z" fill="#b5172f" stroke="#8a0f22" stroke-width="2"/>`)}
      <circle r="30" fill="#c21d36"/><path d="M2 0 C 2 -8 -10 -8 -10 2 C -10 14 8 16 14 4 C 20 -10 6 -22 -8 -20 C -24 -16 -28 4 -18 16 C -8 28 16 26 24 12" fill="none" stroke="#7d0a1c" stroke-width="5" stroke-linecap="round"/>`,
    tulip: () => `<g transform="translate(0 6)">
      <path d="M-34 -6 C -40 -40 -30 -60 -18 -66 C -10 -44 -8 -24 -6 18 C -24 18 -32 10 -34 -6Z" fill="#ee8fb3" stroke="#d26c95" stroke-width="2"/>
      <path d="M34 -6 C 40 -40 30 -60 18 -66 C 10 -44 8 -24 6 18 C 24 18 32 10 34 -6Z" fill="#ee8fb3" stroke="#d26c95" stroke-width="2"/>
      <path d="M0 -70 C 22 -54 26 -20 18 10 C 12 22 -12 22 -18 10 C -26 -20 -22 -54 0 -70Z" fill="url(#tulipPetal)" stroke="#d26c95" stroke-width="2"/></g>`,
    lily: () => `${petals(6, (i) => `<path d="M0 -4 C 20 -20 18 -46 0 -64 C -18 -46 -20 -20 0 -4Z" fill="${i % 2 ? "#f7bfd1" : "#f9cfdc"}" stroke="#e48aa9" stroke-width="2"/><path d="M0 -10 L0 -48" stroke="#e57aa0" stroke-width="2" stroke-linecap="round"/>`)}
      ${petals(6, () => `<path d="M0 0 L4 -26" stroke="#c9a23a" stroke-width="2"/><ellipse cx="4" cy="-28" rx="3" ry="5" fill="#b7562e"/>`)}`,
    daisy: () => `${petals(18, () => `<path d="M0 -14 C 7 -24 7 -46 0 -54 C -7 -46 -7 -24 0 -14Z" fill="#ffffff" stroke="#e3dfe2" stroke-width="2"/>`)}
      <circle r="17" fill="#f2c230" stroke="#dca614" stroke-width="3"/>`,
    custom: () => `${petals(5, () => `<path d="M0 -10 C 22 -18 26 -46 0 -54 C -26 -46 -22 -18 0 -10Z" fill="#7e62d4" stroke="#5f45b4" stroke-width="2"/><path d="M0 -16 C 10 -22 12 -40 0 -46 C -12 -40 -10 -22 0 -16Z" fill="#9a83e2"/>`)}
      <circle r="15" fill="#f2c230" stroke="#dca614" stroke-width="3"/>`,
  };

  // ---------- Satin ribbon rose, about 110px across ----------
  // Satin shading: dark at the heart of the rose, bright along the rolled petal edges
  function roseGradients() {
    return Object.entries(ROSE).map(([name, [base, hi, lo]]) => `
      <radialGradient id="rg-${name}" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="58">
        <stop offset="0" stop-color="${shade(lo, -0.15)}"/><stop offset=".45" stop-color="${base}"/>
        <stop offset=".82" stop-color="${hi}"/><stop offset="1" stop-color="${base}"/></radialGradient>`).join("");
  }

  function ribbonRose(colour, glitter, rand) {
    const c = ROSE[colour] ? colour : "red";
    const [base, hi, lo] = ROSE[c];
    const fill = `url(#rg-${c})`;
    const petal = (w, h) => `<path d="M0 0 C ${w} -4 ${w * 1.45} ${-h * 0.55} ${w} ${-h * 0.9} C ${w * 0.6} ${-h * 1.12} ${-w * 0.6} ${-h * 1.12} ${-w} ${-h * 0.9} C ${-w * 1.45} ${-h * 0.55} ${-w} -4 0 0Z" fill="${fill}" stroke="${lo}" stroke-width="1.6"/>
      <path d="M${-w * 0.85} ${-h * 0.92} C ${-w * 0.4} ${-h * 1.08} ${w * 0.4} ${-h * 1.08} ${w * 0.85} ${-h * 0.92}" fill="none" stroke="${hi}" stroke-width="2.6" stroke-linecap="round" opacity=".85"/>`;
    const outer = petals(5, () => petal(30, 54));
    const mid = `<g transform="rotate(36)">${petals(5, () => petal(22, 38))}</g>`;
    const inner = `<g transform="rotate(12)">${petals(3, () => petal(15, 24))}</g>`;
    const bud = `<ellipse rx="13" ry="11" fill="${lo}"/>
      <path d="M-11 2 C -10 -10 8 -12 11 -2 C 13 6 2 11 -5 7" fill="none" stroke="${hi}" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M-5 3 C -4 -4 5 -4 5 1" fill="none" stroke="${base}" stroke-width="2.4" stroke-linecap="round"/>`;
    let sparkle = "";
    if (glitter) {
      for (let i = 0; i < 30; i++) {
        const a = rand() * Math.PI * 2, r = Math.sqrt(rand()) * 50;
        sparkle += `<circle cx="${(Math.cos(a) * r).toFixed(1)}" cy="${(Math.sin(a) * r).toFixed(1)}" r="${(0.7 + rand() * 1.3).toFixed(1)}" fill="${c === "white" ? "#aab4c2" : "#fff"}" opacity="${(0.5 + rand() * 0.5).toFixed(2)}"/>`;
      }
    }
    const gem = `<circle r="3.6" fill="#f7f8fb" stroke="#9aa3b0" stroke-width="1"/><circle cx="-1" cy="-1" r="1.2" fill="#fff"/>`;
    return outer + mid + inner + bud + sparkle + gem;
  }

  // Flower positions inside the dome, back to front: [x, y, size]
  function layout(n) {
    const cx = 200, cy = 196;
    if (n === 1) return [[cx, cy, 150]];
    if (n === 2) return [[cx - 52, cy + 6, 118], [cx + 52, cy - 6, 118]];
    if (n === 3) return [[cx, cy - 44, 104], [cx - 58, cy + 24, 104], [cx + 58, cy + 24, 104]];
    // The dome grows with the number of flowers; flowers shrink so they stay inside the wrap.
    const rx = Math.min(122, 62 + n * 4), ry = rx * 0.7;
    const size = Math.max(38, Math.min(84, 1.7 * Math.sqrt((Math.PI * rx * ry) / n)));
    const ix = rx - size * 0.38, iy = ry - size * 0.3;
    const pts = [];
    for (let i = 0; i < n; i++) {
      const r = Math.sqrt((i + 0.5) / n), a = i * 2.39996;
      pts.push([cx + Math.cos(a) * r * ix, cy + Math.sin(a) * r * iy, size, r]);
    }
    return pts.sort((p, q) => p[1] - q[1]);
  }

  function printPattern() {
    // Columns of fine grey lines that read as newsprint, with an occasional headline
    let lines = "";
    for (let col = 0; col < 2; col++) {
      for (let y = 10; y < 78; y += 4) {
        const len = 26 - ((y * 7 + col * 5) % 9);
        lines += `<path d="M${3 + col * 33} ${y} h${len}" stroke="#5b4b38" stroke-width="1.1" opacity=".38"/>`;
      }
    }
    return `<pattern id="print" width="68" height="84" patternUnits="userSpaceOnUse" patternTransform="rotate(-6)">
      <rect width="68" height="84" fill="#e6d8bb"/>${lines}
      <rect x="3" y="2" width="44" height="4" fill="#4a3d2d" opacity=".45"/></pattern>`;
  }

  // Tall pointed sheets behind and around the flowers
  function backWrap(w) {
    const fill = w.print ? "url(#print)" : w.fill;
    return [-62, -42, -21, 0, 21, 42, 62].map((a) => {
      const h = 290 - Math.abs(a) * 0.9;
      return `<path transform="rotate(${a} 200 340)" d="M200 340 L132 ${340 - h + 70} L200 ${340 - h} L268 ${340 - h + 70} Z" fill="${fill}" stroke="${w.edge}" stroke-width="3.5" stroke-linejoin="round"/>
        <path transform="rotate(${a} 200 340)" d="M200 ${340 - h + 10} L200 330" stroke="${w.line}" stroke-width="1.5" opacity=".6"/>`;
    }).join("");
  }

  function frontWrap(w) {
    const fill = w.print ? "url(#print)" : w.fill;
    return `
      <path d="M58 236 C 120 262 170 296 214 334 L210 352 L190 352 L120 312 C 92 292 70 266 58 236Z" fill="${fill}" stroke="${w.edge}" stroke-width="3.5" stroke-linejoin="round"/>
      <path d="M342 236 C 280 262 230 296 186 334 L190 352 L210 352 L280 312 C 308 292 330 266 342 236Z" fill="${fill}" stroke="${w.edge}" stroke-width="3.5" stroke-linejoin="round"/>
      <path d="M90 262 C 140 284 176 310 200 336 C 224 310 260 284 310 262" fill="none" stroke="${w.shade}" stroke-width="2" opacity=".7"/>`;
  }

  // Sleeve below the bow, flaring a little like a vase
  function sleeve(w) {
    const fill = w.print ? "url(#print)" : w.fill;
    return `<path d="M168 344 L232 344 L262 478 Q200 490 138 478 Z" fill="${fill}" stroke="${w.edge}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M186 350 L170 476 M214 350 L230 476 M200 350 L200 482" stroke="${w.shade}" stroke-width="2" opacity=".8"/>`;
  }

  // Double satin bow: two loops each side, a knot and two long tails
  function bow(colour) {
    const c = RIBBONS[colour] || RIBBONS.Red;
    const dark = shade(c, -0.25), light = shade(c, colour === "Black" ? 0.35 : 0.35);
    const tail = (d) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="11" stroke-linecap="butt" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${light}" stroke-width="2.5" opacity=".55"/>`;
    return `<g stroke-linejoin="round">
      ${tail("M196 352 C 180 392 150 420 120 452")}
      ${tail("M198 352 C 186 400 176 440 168 478")}
      ${tail("M204 352 C 216 400 226 440 236 474")}
      ${tail("M206 352 C 222 392 252 422 280 448")}
      <path d="M200 346 C 172 312 128 306 122 332 C 118 354 160 360 200 350Z" fill="${c}" stroke="${dark}" stroke-width="2"/>
      <path d="M200 346 C 228 312 272 306 278 332 C 282 354 240 360 200 350Z" fill="${c}" stroke="${dark}" stroke-width="2"/>
      <path d="M198 348 C 182 326 156 324 154 338 C 152 350 176 352 198 350Z" fill="${shade(c, -0.08)}" stroke="${dark}" stroke-width="1.5"/>
      <path d="M202 348 C 218 326 244 324 246 338 C 248 350 224 352 202 350Z" fill="${shade(c, -0.08)}" stroke="${dark}" stroke-width="1.5"/>
      <path d="M132 328 C 146 316 168 318 184 330" fill="none" stroke="${light}" stroke-width="3" stroke-linecap="round" opacity=".7"/>
      <path d="M268 328 C 254 316 232 318 216 330" fill="none" stroke="${light}" stroke-width="3" stroke-linecap="round" opacity=".7"/>
      <rect x="190" y="338" width="20" height="20" rx="6" fill="${c}" stroke="${dark}" stroke-width="2"/></g>`;
  }

  function colourAt(mix, i, n, rRel) {
    const m = MIXES[mix] || MIXES.Red;
    if (m.ring) return rRel !== undefined && rRel < 0.6 ? m.ring[1] : m.ring[0];
    return m[i % m.length];
  }

  window.bouquetSVG = function (o) {
    const w = WRAPS[o.wrap] || WRAPS.White;
    const max = o.kind === "ribbon" ? 30 : 20;
    const n = Math.max(1, Math.min(max, o.count || 1));
    const rand = rng(n * 97 + 13);
    const spots = layout(n);
    const flowers = spots.map(([x, y, size, rRel], i) => {
      const s = (size / 110).toFixed(3);
      const tilt = n > 3 ? Math.round((rand() - 0.5) * 30) : 0;
      const body = o.kind === "ribbon"
        ? ribbonRose(colourAt(o.colours, i, n, rRel === undefined ? (i === 0 && n === 3 ? 0 : 1) : rRel), o.glitter, rand)
        : `<g filter="url(#fuzz)">${(PIPE[o.flowers[i % o.flowers.length]] || PIPE.rose)()}</g>`;
      return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${tilt}) scale(${s})">${body}</g>`;
    }).join("");
    // a soft inner lining so gaps between flowers read as wrap, not background
    const lining = n > 3 ? `<ellipse cx="200" cy="200" rx="${Math.min(130, 70 + n * 4)}" ry="${Math.min(96, 52 + n * 3)}" fill="${o.wrap === "Black" ? "#2e2a2c" : "#efe9e0"}"/>` : "";
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="800" height="1000">
      <defs>
        <radialGradient id="bg" cx="50%" cy="40%" r="75%"><stop offset="0" stop-color="#fbf9f5"/><stop offset="1" stop-color="#ece8e1"/></radialGradient>
        <linearGradient id="sunPetal" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#f3b70f"/><stop offset="1" stop-color="#ffd84a"/></linearGradient>
        <linearGradient id="tulipPetal" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#e57aa3"/><stop offset="1" stop-color="#f7aecb"/></linearGradient>
        <filter id="fuzz" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4"/><feDisplacementMap in="SourceGraphic" scale="2.6"/></filter>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="8" stdDeviation="9" flood-color="#3b2a2f" flood-opacity=".22"/></filter>
        ${w.print ? printPattern() : ""}
        ${o.kind === "ribbon" ? roseGradients() : ""}
      </defs>
      <rect width="400" height="500" fill="url(#bg)"/>
      <ellipse cx="200" cy="486" rx="86" ry="9" fill="#3b2a2f" opacity=".12"/>
      <g filter="url(#shadow)">
        ${sleeve(w)}
        ${backWrap(w)}
        ${lining}
        ${flowers}
        ${frontWrap(w)}
        ${bow(o.ribbon)}
      </g>
    </svg>`;
  };

  window.bouquetSrc = (o) => "data:image/svg+xml;charset=utf-8," + encodeURIComponent(bouquetSVG(o));
  window.BOUQUET_OPTIONS = { wraps: Object.keys(WRAPS), ribbons: Object.keys(RIBBONS), mixes: Object.keys(MIXES) };
})();
