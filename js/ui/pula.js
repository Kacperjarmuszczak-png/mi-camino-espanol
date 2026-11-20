// Wspólna pula zdań do dyktanda i układania zdań (przykłady słówek + przykłady z lekcji gramatyki).
import { SLOWKA } from '../dane/index.js';
import { LEKCJE } from '../dane/lekcje-gramatyki.js';
import { HISP } from '../jezyk.js';
import { pulaZdan, doPoziomu } from '../cwiczenia-logika.js';

let cache = null;
export function zdania(poziom) {
  if (!cache) cache = pulaZdan(SLOWKA, HISP ? [] : LEKCJE.flatMap(l => l.przyklady.filter(([es]) => !/ \/ /.test(es)).map(([es, pl]) => [es, pl, l.p])));
  const p = doPoziomu(cache, poziom);
  return p.length >= 5 ? p : cache;
}
