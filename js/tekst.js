// Tekst: normalizacja i sprawdzanie odpowiedzi (czyste funkcje, bez DOM – testowane w tests/).
import { HISP } from './jezyk.js';

export const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// usuwa akcenty, ale zostawia ñ (tylda nad n to osobna litera w hiszpańskim)
export const bezAkcentow = s => s.normalize('NFD').replace(/(n)̃/gi, '$1\u0000').replace(/[̀-ͯ]/g, '').replace(/\u0000/g, '̃').normalize('NFC');
// usuwa wszystkie znaki diakrytyczne, także ñ i polskie (do porównań „prawie”)
export const bezZnakow = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ł/g, 'l').replace(/Ł/g, 'L').normalize('NFC');

export const czysc = s => String(s).toLowerCase()
  .replace(/[¿?¡!.,;:"„”«»()…]/g, ' ').replace(/\s+/g, ' ').trim();

export const RODZAJNIKI = /^(el|la|los|las|un|una|unos|unas) /;
export const bezRodzajnika = s => s.replace(RODZAJNIKI, '');

// Odległość edycyjna z zamianą sąsiednich liter jako jednym błędem (Damerau, wariant OSA): „ordenadro” → 1.
export function levenshtein(a, b) {
  if (a === b) return 0;
  const m = a.length, n = b.length;
  if (!m) return n; if (!n) return m;
  let pp = new Array(n + 1).fill(0), prev = Array.from({ length: n + 1 }, (_, j) => j), cur = new Array(n + 1);
  for (let i = 1; i <= m; i++) {
    cur[0] = i;
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) cur[j] = Math.min(cur[j], pp[j - 2] + 1);
    }
    [pp, prev, cur] = [prev, cur, pp];
  }
  return prev[n];
}

// Polskie tłumaczenie: „chłopak, narzeczony (czyjś)” → [„chłopak”, „narzeczony”]
export function warianty(odp) {
  const bez = String(odp).replace(/\([^)]*\)/g, ' ');
  const czesci = bez.split(/[,/;]| lub | albo /).map(czysc).filter(Boolean);
  const pelna = czysc(odp);
  return [...new Set([...czesci, pelna])];
}

// Zaznacza miejsca, w których wpis różni się od odpowiedzi tylko akcentem / tyldą.
export function brakujaceAkcenty(wpis, odp) {
  const w = [...wpis], o = [...odp];
  if (w.length !== o.length) return [];
  const idx = [];
  for (let i = 0; i < o.length; i++) if (w[i] !== o[i] && bezZnakow(w[i]) === bezZnakow(o[i])) idx.push(i);
  return idx;
}

/**
 * Sprawdza odpowiedź.
 * @param {string} wpis – co wpisał użytkownik
 * @param {string[]} dobre – akceptowane odpowiedzi (pełne zapisy)
 * @param {{rodzajnik?: boolean}} opcje – rodzajnik: czy hiszpańska odpowiedź ma rodzajnik
 * @returns {{wynik: 'dobrze'|'akcent'|'literowka'|'rodzajnik'|'zle', wzor: string, akcenty: number[]}}
 *   wynik ≠ 'zle' oznacza zaliczenie (z uwagą).
 */
export function sprawdz(wpis, dobre, opcje = {}) {
  const w = czysc(wpis);
  const lista = dobre.flatMap(d => warianty(d)).filter(Boolean);
  if (!w || !lista.length) return { wynik: 'zle', wzor: dobre[0] || '', akcenty: [] };
  // 1. dokładnie
  for (const d of lista) if (w === d) return { wynik: 'dobrze', wzor: d, akcenty: [] };
  // 2. bez rodzajnika (hiszpański rzeczownik bez el/la)
  for (const d of lista) if (RODZAJNIKI.test(d) && w === bezRodzajnika(d)) return { wynik: 'rodzajnik', wzor: d, akcenty: [] };
  for (const d of lista) if (!RODZAJNIKI.test(d) && RODZAJNIKI.test(w) && bezRodzajnika(w) === d) return { wynik: 'dobrze', wzor: d, akcenty: [] };
  // 2b. zły rodzajnik (la problema zamiast el problema)
  for (const d of lista) if (RODZAJNIKI.test(d) && RODZAJNIKI.test(w) && bezZnakow(bezRodzajnika(w)) === bezZnakow(bezRodzajnika(d))) return { wynik: 'zlyRodzajnik', wzor: d, akcenty: [] };
  // 3. tylko akcenty / tylda
  for (const d of lista) {
    for (const [ww, dd] of [[w, d], [bezRodzajnika(w), bezRodzajnika(d)]]) {
      if (bezZnakow(ww) === bezZnakow(dd)) return { wynik: 'akcent', wzor: d, akcenty: brakujaceAkcenty(ww, dd) };
    }
  }
  // 4. jedna literówka (dla słów od 5 liter), dwie dla długich
  for (const d of lista) {
    const a = bezZnakow(bezRodzajnika(w)), b = bezZnakow(bezRodzajnika(d));
    const limit = b.length >= 10 ? 2 : b.length >= 5 ? 1 : 0;
    if (limit && levenshtein(a, b) <= limit) return { wynik: 'literowka', wzor: d, akcenty: [] };
  }
  return { wynik: 'zle', wzor: lista[0], akcenty: [] };
}

// Opis wyniku dla użytkownika (po polsku)
export function komunikat(r, poprawna) {
  if (HISP) {
    switch (r.wynik) {
      case 'dobrze': return `Dobrze! ${poprawna}`;
      case 'akcent': return `Casi: falta un signo diacrítico (ą, ć, ę, ł, ń, ó, ś, ź, ż). Correcto: ${poprawna}`;
      case 'rodzajnik': case 'zlyRodzajnik': return `Bien. Correcto: ${poprawna}`;
      case 'literowka': return `Casi: una pequeña errata. Correcto: ${poprawna}`;
      default: return `Correcto: ${poprawna}`;
    }
  }
  switch (r.wynik) {
    case 'dobrze': return `¡Correcto! ${poprawna}`;
    case 'akcent': return `Prawie: brakuje akcentu lub tyldy. Poprawnie: ${poprawna}`;
    case 'rodzajnik': return `Dobrze, ale zapamiętaj rodzajnik: ${poprawna}`;
    case 'zlyRodzajnik': return `Prawie: zły rodzajnik. Poprawnie: ${poprawna}`;
    case 'literowka': return `Prawie: drobna literówka. Poprawnie: ${poprawna}`;
    default: return `Poprawnie: ${poprawna}`;
  }
}

// Zaliczenie i ocena SRS wynikająca z odpowiedzi wpisanej
export const ocenaZWyniku = w => ({ dobrze: 3, rodzajnik: 2, zlyRodzajnik: 2, akcent: 2, literowka: 2, zle: 1 }[w]);

export const tasuj = (a, los = Math.random) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(los() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
export const losowy = (a, los = Math.random) => a[Math.floor(los() * a.length)];

// Pasujące do wyszukiwania (po polsku i hiszpańsku, bez akcentów)
export const pasuje = (q, ...pola) => {
  const n = bezZnakow(czysc(q));
  return !n || pola.some(p => bezZnakow(czysc(p || '')).includes(n));
};

// --- ocena wymowy (rozpoznana mowa vs wzorzec) ---
// Podobieństwo 0–1 bez akcentów, wielkości liter, znaków interpunkcyjnych i rodzajnika.
export function podobienstwo(a, b) {
  const n = s => bezZnakow(bezRodzajnika(czysc(s))).replace(/\s+/g, ' ');
  const x = n(a), y = n(b);
  if (!x || !y) return 0;
  if (x === y) return 1;
  return Math.max(0, 1 - levenshtein(x, y) / Math.max(x.length, y.length));
}
/**
 * @param {string[]} slyszane – alternatywy z rozpoznawania mowy
 * @param {string[]} wzorce – poprawne formy (pełne zapisy, z wariantami po przecinku)
 * @returns {{wynik: 'dobrze'|'prawie'|'zle', proc: number, slyszane: string}}
 */
export function ocenWymowe(slyszane, wzorce) {
  const cele = wzorce.flatMap(w => warianty(w));
  let naj = { proc: 0, slyszane: slyszane[0] || '' };
  for (const s of slyszane) for (const c of cele) {
    // rozpoznawanie czasem dokleja słowa („la casa sí”) – liczy się też dopasowanie fragmentu
    const p = Math.max(podobienstwo(s, c), czysc(s).split(' ').length > czysc(c).split(' ').length && bezZnakow(czysc(s)).includes(bezZnakow(bezRodzajnika(czysc(c)))) ? 0.9 : 0);
    if (p > naj.proc) naj = { proc: p, slyszane: s };
  }
  const proc = Math.round(naj.proc * 100);
  return { wynik: proc >= 85 ? 'dobrze' : proc >= 60 ? 'prawie' : 'zle', proc, slyszane: naj.slyszane };
}
