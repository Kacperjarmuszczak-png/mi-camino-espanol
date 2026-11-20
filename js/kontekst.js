// Słowo w kontekście: wyszukuje zdania z całej aplikacji (przykłady, lekcje, teksty, dialogi), w których występuje słowo.
import { czysc, bezZnakow } from './tekst.js';

const norm = s => bezZnakow(czysc(String(s).replace(/\*/g, ''))).replace(/[–—-]/g, ' ').replace(/\s+/g, ' ').trim();
const ARTYKULY = /^(el|la|los|las|un|una|unos|unas|lo)\s+/;

/** @param {{es: string, pl?: string}[]} zdania */
export function utworzKontekst(zdania) {
  const lista = [], byly = new Set(), indeks = new Map();
  for (const z of zdania) {
    const es = String(z.es).replace(/\*/g, '').trim(), k = norm(es);
    if (!k || byly.has(k) || k.split(' ').length < 3) continue;
    byly.add(k);
    const i = lista.push({ es, pl: z.pl ? String(z.pl).replace(/\*/g, '') : '', n: ` ${k} ` }) - 1;
    for (const t of new Set(k.split(' '))) { if (!indeks.has(t)) indeks.set(t, []); indeks.get(t).push(i); }
  }
  /** Zdania z danym słowem (bez zdania wykluczonego), krótsze najpierw. */
  return function kontekst(slowo, { ile = 2, bez = '' } = {}) {
    const fraza = norm(String(slowo).split(/[,/(]/)[0]).replace(ARTYKULY, '').trim();
    if (!fraza || fraza.length < 2) return [];
    const tokeny = fraza.split(' ');
    const kand = indeks.get(tokeny.reduce((a, b) => (b.length > a.length ? b : a))) || [];
    const wyklucz = norm(bez);
    return kand.map(i => lista[i]).filter(z => z.n.includes(` ${fraza} `) && norm(z.es) !== wyklucz)
      .sort((a, b) => a.es.length - b.es.length).slice(0, ile);
  };
}
export const podzielZdania = t => String(t).match(/[^.!?]+[.!?]+/g)?.map(s => s.trim()) || [String(t)];
