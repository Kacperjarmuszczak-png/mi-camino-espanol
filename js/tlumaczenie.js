// Pełne tłumaczenie zdań przez darmowe API MyMemory (bez klucza, CORS dozwolony).
// Limit: ok. 5000 znaków dziennie na urządzenie; pojedyncze zapytanie do ~500 znaków, więc dzielimy tekst po zdaniach.
import { podzielNaZdania } from './analiza.js';

const API = 'https://api.mymemory.translated.net/get';
const pamiec = new Map();

export function kawalki(tekst, max = 450) {
  const wynik = [];
  let biezacy = '';
  for (const z of podzielNaZdania(tekst)) {
    const zz = z.length > max ? z.match(new RegExp(`.{1,${max}}(\\s|$)`, 'g')) : [z];
    for (const k of zz) {
      if (biezacy && (biezacy + ' ' + k).length > max) { wynik.push(biezacy.trim()); biezacy = k; }
      else biezacy = biezacy ? biezacy + ' ' + k : k;
    }
  }
  if (biezacy.trim()) wynik.push(biezacy.trim());
  return wynik;
}

const dekoduj = s => String(s).replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n)).replace(/&quot;/g, '"').replace(/&apos;/g, "'")
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

export class BladTlumaczenia extends Error {
  constructor(rodzaj, tekst) { super(tekst); this.rodzaj = rodzaj; }
}

/**
 * @param {string} tekst
 * @param {'es'|'pl'} z
 * @param {'es'|'pl'} na
 */
export async function tlumaczOnline(tekst, z, na, { pobierz = globalThis.fetch, sygnal } = {}) {
  const klucz = `${z}|${na}|${tekst}`;
  if (pamiec.has(klucz)) return pamiec.get(klucz);
  const czesci = [];
  for (const k of kawalki(tekst)) {
    let r;
    try { r = await pobierz(`${API}?q=${encodeURIComponent(k)}&langpair=${z}|${na}`, { signal: sygnal }); }
    catch (e) { throw new BladTlumaczenia('siec', 'Brak połączenia z serwisem tłumaczącym.'); }
    let d = null;
    try { d = await r.json(); } catch (e) { /* zła odpowiedź */ }
    const t = d && d.responseData && d.responseData.translatedText;
    if (!d || !t) throw new BladTlumaczenia('blad', 'Serwis tłumaczący nie odpowiedział poprawnie.');
    if (+d.responseStatus === 429 || /YOU USED ALL AVAILABLE FREE TRANSLATIONS/i.test(t)) throw new BladTlumaczenia('limit', 'Wyczerpano dzienny limit darmowych tłumaczeń na tym urządzeniu. Spróbuj jutro.');
    if (+d.responseStatus !== 200 || /MYMEMORY WARNING|QUERY LENGTH LIMIT|INVALID/i.test(t)) throw new BladTlumaczenia('blad', 'Serwis tłumaczący odrzucił zapytanie.');
    czesci.push(dekoduj(t));
  }
  const wynik = czesci.join(' ');
  pamiec.set(klucz, wynik);
  return wynik;
}
