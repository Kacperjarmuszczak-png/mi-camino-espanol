// Generator wykreślanki (czyste funkcje): słowa w siatce poziomo, pionowo i po skosie; reszta pól losowa.
const KIER = [[0, 1], [1, 0], [1, 1], [-1, 1]];

export function wykreslanka(slowa, rozmiar = 10, alfabet = 'ABCDEFGHIJLMNOPRSTUVZ', los = Math.random) {
  const s = Array.from({ length: rozmiar }, () => Array(rozmiar).fill(''));
  const pozycje = [];
  for (const slowo of [...slowa].sort((a, b) => b.length - a.length)) {
    const z = [...slowo];
    if (z.length > rozmiar) continue;
    let ok = false;
    for (let proba = 0; proba < 300 && !ok; proba++) {
      const [dr, dc] = KIER[Math.floor(los() * KIER.length)];
      const r0 = Math.floor(los() * rozmiar), c0 = Math.floor(los() * rozmiar);
      const rk = r0 + dr * (z.length - 1), ck = c0 + dc * (z.length - 1);
      if (rk < 0 || rk >= rozmiar || ck >= rozmiar) continue;
      if (!z.every((ch, i) => { const v = s[r0 + dr * i][c0 + dc * i]; return !v || v === ch; })) continue;
      z.forEach((ch, i) => { s[r0 + dr * i][c0 + dc * i] = ch; });
      pozycje.push({ slowo, r: r0, c: c0, dr, dc });
      ok = true;
    }
  }
  const lit = [...alfabet];
  for (const w of s) for (let c = 0; c < rozmiar; c++) if (!w[c]) w[c] = lit[Math.floor(los() * lit.length)];
  return { siatka: s, pozycje };
}

/** Komórki między dwoma polami (linia prosta: poziom, pion, skos) albo null. */
export function linia(a, b) {
  const dr = Math.sign(b.r - a.r), dc = Math.sign(b.c - a.c);
  const n = Math.max(Math.abs(b.r - a.r), Math.abs(b.c - a.c));
  if (!(a.r === b.r || a.c === b.c || Math.abs(b.r - a.r) === Math.abs(b.c - a.c))) return null;
  return Array.from({ length: n + 1 }, (_, i) => ({ r: a.r + dr * i, c: a.c + dc * i }));
}
