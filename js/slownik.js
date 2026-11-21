// Wyszukiwanie w słowniku aplikacji (słówka, czasowniki, zwroty) z rozpoznawaniem form odmienionych:
// liczby mnogiej, rodzaju żeńskiego, form czasowników (także nieregularnych) i doklejonych zaimków.

const KONC_CZAS = [
  // [końcówka, zamiany na bezokolicznik]
  ['ábamos', ['ar']], ['abais', ['ar']], ['aban', ['ar']], ['abas', ['ar']], ['aba', ['ar']],
  ['íamos', ['er', 'ir']], ['íais', ['er', 'ir']], ['ían', ['er', 'ir']], ['ías', ['er', 'ir']], ['ía', ['er', 'ir']],
  ['aremos', ['ar']], ['eremos', ['er']], ['iremos', ['ir']], ['arán', ['ar']], ['erán', ['er']], ['irán', ['ir']], ['aré', ['ar']], ['eré', ['er']], ['iré', ['ir']],
  ['arás', ['ar']], ['erás', ['er']], ['irás', ['ir']], ['ará', ['ar']], ['erá', ['er']], ['irá', ['ir']],
  ['aríamos', ['ar']], ['eríamos', ['er']], ['iríamos', ['ir']], ['arían', ['ar']], ['erían', ['er']], ['irían', ['ir']], ['aría', ['ar']], ['ería', ['er']], ['iría', ['ir']],
  ['asteis', ['ar']], ['isteis', ['er', 'ir']], ['aron', ['ar']], ['ieron', ['er', 'ir']], ['aste', ['ar']], ['iste', ['er', 'ir']], ['ió', ['er', 'ir']],
  ['ando', ['ar']], ['iendo', ['er', 'ir']], ['yendo', ['er', 'ir']], ['ados', ['ar']], ['adas', ['ar']], ['ado', ['ar']], ['ada', ['ar']],
  ['idos', ['er', 'ir']], ['idas', ['er', 'ir']], ['ido', ['er', 'ir']], ['ida', ['er', 'ir']],
  ['amos', ['ar']], ['emos', ['er']], ['imos', ['ir']], ['áis', ['ar']], ['éis', ['er']], ['ís', ['ir']],
  ['asen', ['ar']], ['aran', ['ar']], ['ieran', ['er', 'ir']], ['iesen', ['er', 'ir']], ['ara', ['ar']], ['iera', ['er', 'ir']],
  ['an', ['ar']], ['en', ['er', 'ir', 'ar']], ['as', ['ar']], ['es', ['er', 'ir', 'ar']], ['é', ['ar']], ['í', ['er', 'ir']], ['ó', ['ar']],
  ['o', ['ar', 'er', 'ir']], ['a', ['ar', 'er', 'ir']], ['e', ['er', 'ir', 'ar']],
];
const ZMIANY_TEMATU = [['ie', 'e'], ['ue', 'o'], ['i', 'e'], ['ue', 'u'], ['zc', 'c'], ['g', ''], ['j', 'g'], ['y', 'i']];
const ZAIMKI = ['selos', 'selas', 'selo', 'sela', 'melo', 'mela', 'telo', 'tela', 'nos', 'os', 'los', 'las', 'les', 'se', 'me', 'te', 'lo', 'la', 'le'];
const bezAkc = s => s.replace(/[áéíóú]/g, c => ({ á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u' }[c]));
import { CZASOWNIKI, formy } from './odmiana.js';

// formy nieregularne z silnika odmiany (575 czasowników): forma → bezokolicznik
let formyCzas = null;
function indeksForm() {
  if (formyCzas) return formyCzas;
  formyCzas = new Map();
  for (const v of CZASOWNIKI) {
    const f = formy(v);
    for (const [czas, l] of Object.entries(f)) {
      for (const x of [].concat(l || [])) {
        if (!x) continue;
        for (const cz of String(x).split(/[ ,/]+/)) if (cz.length > 1 && !/^(no|me|te|se|nos|os|he|has|ha|hemos|habéis|han)$/.test(cz) && !formyCzas.has(cz)) formyCzas.set(cz, v.inf.replace(/se$/, ''));
      }
    }
  }
  return formyCzas;
}

/** Kandydaci na hasło dla hiszpańskiej formy: [{ w, opis }] od najbardziej prawdopodobnego. */
export function kandydaciEs(slowo) {
  const s = slowo.toLowerCase().trim(), w = [], dodaj = (x, opis) => { if (x && x.length > 1 && !w.some(k => k.w === x)) w.push({ w: x, opis }); };
  dodaj(s, '');
  if (s !== slowo.trim()) dodaj(slowo.trim(), '');
  // rzeczowniki i przymiotniki
  if (/ces$/.test(s)) dodaj(s.slice(0, -3) + 'z', 'liczba mnoga');
  if (/[^aeiou]es$/.test(s)) dodaj(bezAkc(s.slice(0, -2)) === s.slice(0, -2) ? s.slice(0, -2) : s.slice(0, -2), 'liczba mnoga');
  if (/ones$/.test(s)) dodaj(s.slice(0, -4) + 'ón', 'liczba mnoga');
  if (/s$/.test(s)) dodaj(s.slice(0, -1), 'liczba mnoga');
  if (/oras?$/.test(s)) dodaj(s.replace(/oras?$/, 'or'), 'rodzaj żeński');
  if (/as$/.test(s)) dodaj(s.slice(0, -2) + 'o', 'rodzaj żeński, l. mnoga');
  if (/a$/.test(s)) dodaj(s.slice(0, -1) + 'o', 'rodzaj żeński');
  if (/ísim[oa]s?$/.test(s)) dodaj(s.replace(/ísim[oa]s?$/, 'o'), 'stopień najwyższy (-ísimo)');
  if (/mente$/.test(s)) dodaj(s.slice(0, -5), 'przysłówek od');
  formaNieregularna(s, dodaj);
  // zaimki doklejone (dímelo, levantarse, haciéndolo)
  for (const z of ZAIMKI) {
    if (s.length > z.length + 2 && s.endsWith(z)) {
      const r = bezAkc(s.slice(0, -z.length));
      if (/(ar|er|ir)$/.test(r)) dodaj(r, 'bezokolicznik z zaimkiem');
      for (const x of kandydaciCzasownika(r)) dodaj(x.w, x.opis + ' + zaimek');
    }
  }
  for (const x of kandydaciCzasownika(s)) dodaj(x.w, x.opis);
  return w;
}
function formaNieregularna(s, dodaj) {
  const m = indeksForm();
  if (m.has(s)) dodaj(m.get(s), 'forma czasownika');
  for (const z of ZAIMKI) if (s.length > z.length + 1 && s.endsWith(z)) { const r = s.slice(0, -z.length), r2 = bezAkc(r); for (const x of [r, r2]) if (m.has(x)) dodaj(m.get(x), 'forma czasownika + zaimek'); }
}
function kandydaciCzasownika(s) {
  const w = [];
  for (const [k, infs] of KONC_CZAS) {
    if (!s.endsWith(k) || s.length - k.length < 2) continue;
    const temat = s.slice(0, -k.length);
    for (const inf of infs) {
      w.push({ w: bezAkc(temat) + inf, opis: 'forma czasownika' });
      for (const [z, na] of ZMIANY_TEMATU) {
        const i = temat.lastIndexOf(z);
        if (i >= 0) w.push({ w: bezAkc(temat.slice(0, i) + na + temat.slice(i + z.length)) + inf, opis: 'forma czasownika' });
      }
    }
  }
  return w;
}
export function kandydaciPl(slowo) {
  const s = slowo.toLowerCase().trim(), w = [{ w: s, opis: '' }];
  if (s !== slowo.trim()) w.push({ w: slowo.trim(), opis: '' });
  return w;
}

// --- indeks w pamięci: słówka, czasowniki i zwroty aplikacji ---
import { SLOWKA, CZAS, ZWROTY_LISTA } from './dane/index.js';
const zwykle = s => s.normalize('NFD').replace(/[\u0300-\u0302\u0304-\u036f]/g, '').normalize('NFC');
let IDX = null;
function indeks() {
  if (IDX) return IDX;
  const es = new Map(), esBez = new Map(), pl = new Map();
  const dodaj = (m, k, x) => { if (k && !m.has(k)) m.set(k, x); };
  for (const x of [...SLOWKA, ...CZAS, ...ZWROTY_LISTA]) {
    const k = String(x.es).toLowerCase().replace(/[¿?¡!.]/g, '').replace(/^(el|la|los|las) /, '').trim();
    dodaj(es, k, x); dodaj(esBez, zwykle(k), x);
    for (const t of String(x.pl).replace(/\([^)]*\)/g, '').split(/[,/;]/)) dodaj(pl, t.trim().toLowerCase(), x);
  }
  IDX = { es, esBez, pl };
  return IDX;
}

/**
 * Szuka słowa w słowniku aplikacji (z rozpoznawaniem form odmienionych).
 * @param {'es'|'pl'} jez – język wpisanego słowa
 * @returns {Promise<null | { haslo: string, tlum: string[], opis: string, przybl: boolean, ang: string, x: object }>}
 */
export async function szukajWSlowniku(slowo, jez = 'es') {
  if (!slowo || slowo.length < 2) return null;
  const I = indeks();
  if (jez === 'pl') {
    const x = I.pl.get(slowo.toLowerCase().trim());
    return x ? { haslo: slowo, tlum: [x.es], opis: '', przybl: false, ang: '', x } : null;
  }
  for (const k of kandydaciEs(slowo)) {
    const x = I.es.get(k.w) || I.esBez.get(zwykle(k.w));
    if (x) return { haslo: x.es, tlum: String(x.pl).split(/, | \/ /), opis: k.opis, przybl: false, ang: '', x };
  }
  return null;
}
export const ZRODLO_SLOWNIKA = 'słownik aplikacji';
