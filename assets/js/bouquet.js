// Draws pipe-cleaner bouquets as SVG, so wrap and ribbon colours can change on click.
// bouquetSrc(["sunflower", "rose"], "Kraft", "Twine") returns an image URL.
(function () {
  const WRAP = {
    Kraft: "#d8b98d", Pink: "#f5c6d1", Lavender: "#d5c3ec", Yellow: "#f4dc94",
    "Black & Gold": "#2b2427", Black: "#2b2427", "Grey & Gold": "#8e8c91", Grey: "#a9a8ad",
  };
  const RIBBON = {
    Pink: "#ef9db2", Lavender: "#a685d6", Gold: "#e0ad35", Red: "#c41f33",
    Twine: "#a8834f", Silver: "#c3c7cf",
  };
  const GOLD_EDGE = { "Black & Gold": true, "Grey & Gold": true };

  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    const t = amt < 0 ? 0 : 255, p = Math.abs(amt);
    r = Math.round((t - r) * p + r); g = Math.round((t - g) * p + g); b = Math.round((t - b) * p + b);
    return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
  }

  // ---------- Flowers (drawn around 0,0, roughly 110px across) ----------
  function petals(n, draw) {
    let s = "";
    for (let i = 0; i < n; i++) s += `<g transform="rotate(${(360 / n) * i})">${draw(i)}</g>`;
    return s;
  }

  const FLOWERS = {
    sunflower: () => `
      <g filter="url(#fuzz)">
        ${petals(16, () => `<path d="M0 -20 C 13 -32 11 -52 0 -60 C -11 -52 -13 -32 0 -20Z" fill="url(#sunPetal)" stroke="#d9a20f" stroke-width="2"/>`)}
        <circle r="26" fill="#4a2a17"/>
        ${[22, 16, 10, 4].map((r, i) => `<circle r="${r}" fill="none" stroke="${i % 2 ? "#6b3f22" : "#3a2010"}" stroke-width="4"/>`).join("")}
      </g>`,
    rose: () => `
      <g filter="url(#fuzz)">
        ${petals(6, () => `<path d="M0 -8 C 26 -14 40 -36 22 -48 C 10 -56 -10 -56 -22 -48 C -40 -36 -26 -14 0 -8Z" fill="#b5172f" stroke="#8a0f22" stroke-width="2"/>`)}
        <circle r="30" fill="#c21d36"/>
        <path d="M2 0 C 2 -8 -10 -8 -10 2 C -10 14 8 16 14 4 C 20 -10 6 -22 -8 -20 C -24 -16 -28 4 -18 16 C -8 28 16 26 24 12" fill="none" stroke="#7d0a1c" stroke-width="5" stroke-linecap="round"/>
      </g>`,
    tulip: () => `
      <g filter="url(#fuzz)" transform="translate(0 6)">
        <path d="M-34 -6 C -40 -40 -30 -60 -18 -66 C -10 -44 -8 -24 -6 18 C -24 18 -32 10 -34 -6Z" fill="#ee8fb3" stroke="#d26c95" stroke-width="2"/>
        <path d="M34 -6 C 40 -40 30 -60 18 -66 C 10 -44 8 -24 6 18 C 24 18 32 10 34 -6Z" fill="#ee8fb3" stroke="#d26c95" stroke-width="2"/>
        <path d="M0 -70 C 22 -54 26 -20 18 10 C 12 22 -12 22 -18 10 C -26 -20 -22 -54 0 -70Z" fill="url(#tulipPetal)" stroke="#d26c95" stroke-width="2"/>
      </g>`,
    lily: () => `
      <g filter="url(#fuzz)">
        ${petals(6, (i) => `<path d="M0 -4 C 20 -20 18 -46 0 -64 C -18 -46 -20 -20 0 -4Z" fill="${i % 2 ? "#f7bfd1" : "#f9cfdc"}" stroke="#e48aa9" stroke-width="2"/><path d="M0 -10 L0 -48" stroke="#e57aa0" stroke-width="2" stroke-linecap="round"/>`)}
        ${petals(6, () => `<path d="M0 0 L4 -26" stroke="#c9a23a" stroke-width="2"/><ellipse cx="4" cy="-28" rx="3" ry="5" fill="#b7562e"/>`)}
      </g>`,
    daisy: () => `
      <g filter="url(#fuzz)">
        ${petals(18, () => `<path d="M0 -14 C 7 -24 7 -46 0 -54 C -7 -46 -7 -24 0 -14Z" fill="#ffffff" stroke="#e3dfe2" stroke-width="2"/>`)}
        <circle r="17" fill="#f2c230" stroke="#dca614" stroke-width="3"/>
      </g>`,
    custom: () => `
      <g filter="url(#fuzz)">
        ${petals(5, () => `<path d="M0 -10 C 22 -18 26 -46 0 -54 C -26 -46 -22 -18 0 -10Z" fill="#7e62d4" stroke="#5f45b4" stroke-width="2"/><path d="M0 -16 C 10 -22 12 -40 0 -46 C -12 -40 -10 -22 0 -16Z" fill="#9a83e2"/>`)}
        <circle r="15" fill="#f2c230" stroke="#dca614" stroke-width="3"/>
      </g>`,
  };

  // Flower positions for 1, 2 and 3 flowers: [x, y, scale]
  const LAYOUT = {
    1: [[200, 165, 1.45]],
    2: [[158, 175, 1.15], [246, 160, 1.15]],
    3: [[132, 198, 1.0], [204, 140, 1.05], [272, 196, 1.0]],
  };
  const GX = 200, GY = 372; // where the wrap is gathered and tied

  // Tall pleated sheets behind the flowers
  function backWrap(color) {
    const light = shade(color, 0.22), dark = shade(color, -0.14), line = shade(color, -0.28);
    return [-44, -30, -15, 0, 15, 30, 44].map((a, i) => {
      const fill = [dark, color, light, color, light, color, dark][i];
      const h = 340 - Math.abs(a) * 1.8;
      return `<path transform="rotate(${a} ${GX} ${GY})" d="M${GX} ${GY} L${GX - 50} ${GY - h + 30} Q${GX} ${GY - h - 24} ${GX + 50} ${GY - h + 30} Z" fill="${fill}" stroke="${line}" stroke-width="1.6" stroke-linejoin="round"/>`;
    }).join("");
  }

  function tissue() {
    return [-28, -10, 10, 28].map((a, i) =>
      `<path transform="rotate(${a} ${GX} ${GY})" d="M${GX} ${GY} L${GX - 40} ${GY - 196} Q${GX} ${GY - 232} ${GX + 40} ${GY - 196} Z" fill="${i % 2 ? "#ffffff" : "#fbf5f1"}" stroke="#ebdfd8" stroke-width="1.4"/>`).join("");
  }

  // Two front sheets crossing into a V, plus the pleated skirt below the bow
  function frontWrap(color, goldEdge) {
    const light = shade(color, 0.2), dark = shade(color, -0.16), line = shade(color, -0.3);
    const edge = goldEdge ? "#d6b25e" : line, ew = goldEdge ? 3.5 : 1.6;
    const skirt = [-22, -11, 0, 11, 22].map((a, i) =>
      `<path transform="rotate(${a} ${GX} ${GY})" d="M${GX} ${GY} L${GX - 24} ${GY + 108} L${GX + 24} ${GY + 108} Z" fill="${i % 2 ? dark : color}" stroke="${line}" stroke-width="1.4" stroke-linejoin="round"/>`).join("");
    return `${skirt}
      <path d="M62 222 C 110 236 168 268 214 312 L206 ${GY + 6} L194 ${GY + 6} Z" fill="${light}" stroke="${edge}" stroke-width="${ew}" stroke-linejoin="round"/>
      <path d="M338 222 C 290 236 232 268 186 312 L194 ${GY + 6} L206 ${GY + 6} Z" fill="${color}" stroke="${edge}" stroke-width="${ew}" stroke-linejoin="round"/>
      <path d="M100 236 C 140 252 176 276 200 300" fill="none" stroke="${dark}" stroke-width="1.2" opacity=".5"/>
      <path d="M300 236 C 260 252 224 276 200 300" fill="none" stroke="${dark}" stroke-width="1.2" opacity=".5"/>`;
  }

  function bow(color, twine) {
    if (twine) {
      return `<g transform="translate(${GX} ${GY}) scale(1.35) translate(${-GX} ${-GY})" fill="none" stroke="${color}" stroke-width="4" stroke-linecap="round">
        <path d="M200 372 C 170 350 140 362 150 380 C 160 396 186 384 200 374"/>
        <path d="M200 372 C 230 350 260 362 250 380 C 240 396 214 384 200 374"/>
        <path d="M198 376 C 190 400 180 418 170 432"/><path d="M202 376 C 210 400 220 418 230 432"/>
        <path d="M160 372 L240 372" stroke-width="4"/></g>`;
    }
    const dark = shade(color, -0.2), light = shade(color, 0.3);
    return `<g transform="translate(${GX} ${GY}) scale(1.35) translate(${-GX} ${-GY})" stroke="${dark}" stroke-width="2" stroke-linejoin="round">
      <path d="M196 380 L166 440 L182 434 L190 448 L204 384Z" fill="${color}"/>
      <path d="M204 380 L234 440 L218 434 L210 448 L196 384Z" fill="${color}"/>
      <path d="M200 374 C 168 340 128 350 136 378 C 142 400 178 394 200 380Z" fill="${color}"/>
      <path d="M200 374 C 232 340 272 350 264 378 C 258 400 222 394 200 380Z" fill="${color}"/>
      <path d="M190 366 Q200 362 210 366 L212 388 Q200 392 188 388Z" fill="${dark}"/>
      <path d="M150 372 C 158 358 178 358 192 372" fill="none" stroke="${light}" stroke-width="3" stroke-linecap="round"/>
      <path d="M250 372 C 242 358 222 358 208 372" fill="none" stroke="${light}" stroke-width="3" stroke-linecap="round"/></g>`;
  }

  window.bouquetSVG = function (flowers, wrapName, ribbonName) {
    const wrap = WRAP[wrapName] || WRAP.Kraft;
    const ribbon = RIBBON[ribbonName] || RIBBON.Pink;
    const spots = LAYOUT[Math.min(flowers.length, 3)] || LAYOUT[1];
    const stems = spots.map(([x, y]) => `<path d="M${x} ${y} Q${(x + GX) / 2} ${(y + GY) / 2 + 10} ${GX} ${GY}" stroke="#3f7a3a" stroke-width="7" fill="none" stroke-linecap="round"/>`).join("");
    const heads = spots.map(([x, y, s], i) => `<g transform="translate(${x} ${y}) scale(${s})">${(FLOWERS[flowers[i]] || FLOWERS.rose)()}</g>`).join("");
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="800" height="1000">
      <defs>
        <radialGradient id="bg" cx="50%" cy="40%" r="70%"><stop offset="0" stop-color="#fffaf5"/><stop offset="1" stop-color="#f6e9e2"/></radialGradient>
        <linearGradient id="sunPetal" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#f3b70f"/><stop offset="1" stop-color="#ffd84a"/></linearGradient>
        <linearGradient id="tulipPetal" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#e57aa3"/><stop offset="1" stop-color="#f7aecb"/></linearGradient>
        <filter id="fuzz" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4"/>
          <feDisplacementMap in="SourceGraphic" scale="2.6"/>
        </filter>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#5e273c" flood-opacity=".18"/></filter>
      </defs>
      <rect width="400" height="500" fill="url(#bg)"/>
      <g filter="url(#shadow)">
        ${backWrap(wrap)}
        ${tissue()}
        ${stems}
        ${heads}
        ${frontWrap(wrap, GOLD_EDGE[wrapName])}
        ${bow(ribbon, ribbonName === "Twine")}
      </g>
    </svg>`;
  };

  window.bouquetSrc = (flowers, wrap, ribbon) => "data:image/svg+xml;charset=utf-8," + encodeURIComponent(bouquetSVG(flowers, wrap, ribbon));
})();
