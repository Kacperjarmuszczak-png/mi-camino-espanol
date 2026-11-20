// Wspólna pula słów do gier: słowa z poziomu (i niższych), jednowyrazowe po zdjęciu rodzajnika.
import { SLOWKA, POZIOMY } from '../dane/index.js';
import { bezRodzajnika } from '../tekst.js';
import { HISP } from '../jezyk.js';

export const pierwszeZnaczenie = pl => String(pl).split(/[,/;(]/)[0].trim();
export function slowaGry(poziom, { min = 3, max = 10 } = {}) {
  const i = POZIOMY.indexOf(poziom);
  const re = HISP ? /^[a-ząćęłńóśźż]+$/i : /^[a-záéíóúüñ]+$/i;
  const l = SLOWKA.filter(w => POZIOMY.indexOf(w.p) <= i).map(w => ({ w, s: bezRodzajnika(w.es.toLowerCase()).trim() }))
    .filter(x => re.test(x.s) && x.s.length >= min && x.s.length <= max);
  return l.length >= 20 ? l : SLOWKA.map(w => ({ w, s: bezRodzajnika(w.es.toLowerCase()).trim() })).filter(x => re.test(x.s) && x.s.length >= min && x.s.length <= max);
}
