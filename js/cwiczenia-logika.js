// Logika ćwiczeń (czyste funkcje): pula zdań, porównanie dyktanda, układanie zdań, wybór „lekcji dnia”.
import { czysc, bezZnakow, levenshtein } from './tekst.js';

const POZ = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const bezG = s => String(s).replace(/\*/g, '');

/** Zdania [{ es, pl, p }] z przykładów słówek (i opcjonalnie lekcji), 3–12 słów, bez powtórzeń. */
export function pulaZdan(slowka, dodatkowe = []) {
  const wynik = [], byly = new Set();
  const dodaj = (es, pl, p) => {
    es = bezG(es).trim(); pl = bezG(pl).trim();
    const n = es.split(/\s+/).length, k = czysc(es);
    if (n < 3 || n > 12 || byly.has(k)) return;
    byly.add(k); wynik.push({ es, pl, p });
  };
  for (const w of slowka) if (w.przyklad) dodaj(w.przyklad.es, w.przyklad.pl, w.p);
  for (const [es, pl, p] of dodatkowe) dodaj(es, pl, p);
  return wynik;
}
export const doPoziomu = (pula, p) => pula.filter(z => POZ.indexOf(z.p) <= POZ.indexOf(p));

// normalizacja dyktanda: małe litery, bez interpunkcji, pojedyncze spacje (akcenty zostają)
const normD = s => czysc(s).replace(/[–—-]/g, ' ').replace(/\s+/g, ' ').trim();

/**
 * Porównanie dyktanda znak po znaku (Levenshtein z odtworzeniem ścieżki).
 * @returns {{ proc: number, bledy: number, akcenty: number, segmenty: {t: string, k: 'ok'|'zle'|'brak'|'nadmiar'|'akcent'}[] }}
 */
export function porownajDyktando(wzor, wpis) {
  const a = [...normD(wpis)], b = [...normD(wzor)];
  const m = a.length, n = b.length;
  const d = Array.from({ length: m + 1 }, (_, i) => Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));
  const koszt = (x, y) => (x === y ? 0 : bezZnakow(x) === bezZnakow(y) ? 0.5 : 1);
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + koszt(a[i - 1], b[j - 1]));
  const seg = [];
  let i = m, j = n, bledy = 0, akcenty = 0;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && d[i][j] === d[i - 1][j - 1] + koszt(a[i - 1], b[j - 1])) {
      const k = a[i - 1] === b[j - 1] ? 'ok' : koszt(a[i - 1], b[j - 1]) === 0.5 ? 'akcent' : 'zle';
      if (k === 'zle') bledy++; if (k === 'akcent') akcenty++;
      seg.push({ t: k === 'ok' ? a[i - 1] : b[j - 1], k }); i--; j--;
    } else if (j > 0 && d[i][j] === d[i][j - 1] + 1) { seg.push({ t: b[j - 1], k: 'brak' }); bledy++; j--; }
    else { seg.push({ t: a[i - 1], k: 'nadmiar' }); bledy++; i--; }
  }
  seg.reverse();
  // sklejenie sąsiednich segmentów tego samego rodzaju
  const sk = [];
  for (const s of seg) { const o = sk[sk.length - 1]; if (o && o.k === s.k) o.t += s.t; else sk.push({ ...s }); }
  const proc = n ? Math.max(0, Math.round(100 * (1 - d[m][n] / Math.max(n, m)))) : 0;
  return { proc, bledy, akcenty, segmenty: sk };
}

// --- układanie zdań ---
export const tokeny = s => bezG(s).replace(/[¿?¡!.,;:"„”«»…]/g, ' ').split(/\s+/).filter(Boolean);
export function sprawdzKolejnosc(ulozone, zdanie) {
  const a = ulozone.map(x => czysc(x)).join(' '), b = tokeny(zdanie).map(x => czysc(x)).join(' ');
  return a === b;
}
/** Tasuje tak, żeby kolejność różniła się od poprawnej (dla zdań z ≥ 2 różnymi słowami). */
export function tasujInaczej(lista, los = Math.random) {
  if (new Set(lista).size < 2) return lista.slice();
  for (let p = 0; p < 20; p++) {
    const a = lista.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(los() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    if (a.join(' ') !== lista.join(' ')) return a;
  }
  return lista.slice().reverse();
}

// --- lekcja dnia: wybór deterministyczny na podstawie daty ---
export function ziarno(tekst) { let h = 2166136261; for (const c of tekst) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
export function wybierzNaDzien(lista, data, sol = '') {
  if (!lista.length) return null;
  return lista[ziarno(data + sol) % lista.length];
}
export { levenshtein };
