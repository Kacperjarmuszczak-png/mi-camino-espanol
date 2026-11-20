// Filtrowanie i sortowanie list słówek, czasowników i zwrotów (czyste funkcje).
import { status, doPowtorki } from './srs.js';
import { pasuje } from './tekst.js';

export const FILTRY = [
  ['wszystkie', 'Wszystkie'], ['nieumiane', 'Nieumiane'], ['powtorka', 'Do powtórki'], ['opanowane', 'Opanowane'], ['ulubione', '★ Ulubione'],
];
export const SORTY = [
  ['domyslnie', 'Kolejność tematów'], ['es', 'Alfabetycznie (ES)'], ['pl', 'Alfabetycznie (PL)'], ['postep', 'Najsłabiej opanowane'], ['trudne', 'Najczęściej mylone'],
];

export function filtruj(lista, { q = '', filtr = 'wszystkie', stany = {}, ulub = {}, teraz = Date.now() } = {}) {
  return lista.filter(x => {
    if (!pasuje(q, x.es, x.pl, x.latam && x.latam.es)) return false;
    const s = stany[x.id];
    switch (filtr) {
      case 'nieumiane': return status(s) === 'nowe' || status(s) === 'nauka';
      case 'powtorka': return doPowtorki(s, teraz);
      case 'opanowane': return status(s) === 'opanowane';
      case 'ulubione': return !!ulub[x.id];
      default: return true;
    }
  });
}

const RANGA = { nowe: 1, nauka: 0, utrwalane: 2, opanowane: 3 };
const porownaj = (a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' });
const bezRodz = s => s.replace(/^(el|la|los|las|¿|¡)\s*/i, '');

export function sortuj(lista, sort, stany = {}) {
  const l = lista.slice();
  switch (sort) {
    case 'es': return l.sort((a, b) => porownaj(bezRodz(a.es), bezRodz(b.es)));
    case 'pl': return l.sort((a, b) => a.pl.localeCompare(b.pl, 'pl', { sensitivity: 'base' }));
    case 'postep': return l.sort((a, b) => RANGA[status(stany[a.id])] - RANGA[status(stany[b.id])]);
    case 'trudne': return l.sort((a, b) => ((stany[b.id] || {}).zle || 0) - ((stany[a.id] || {}).zle || 0));
    default: return l;
  }
}
