// Korpus zdań dla „słowa w kontekście” (budowany raz, przy pierwszym użyciu).
import { utworzKontekst, podzielZdania } from '../kontekst.js';
import { SLOWKA, ZWROTY_LISTA } from '../dane/index.js';
import { HISP } from '../jezyk.js';
import { LEKCJE } from '../dane/lekcje-gramatyki.js';
import { CZYTANIE } from '../dane/czytanie.js';
import { CZYTANIE_PL } from '../dane/czytanie-pl.js';
import { ROZMOWY } from '../dane/rozmowy.js';
import { GRAMATYKA } from '../dane/gramatyka.js';

let fn = null;
export function kontekstSlowa(x, ile = 2) {
  if (!fn) {
    const z = [];
    for (const w of SLOWKA) if (w.przyklad) z.push({ es: w.przyklad.es, pl: w.przyklad.pl });
    if (HISP) for (const t of CZYTANIE_PL) for (const s of podzielZdania(t.tekst)) z.push({ es: s });
    else {
      for (const l of LEKCJE) for (const [es, pl] of l.przyklady) z.push({ es, pl });
      for (const t of CZYTANIE) for (const s of podzielZdania(t.tekst)) z.push({ es: s });
      for (const zw of ZWROTY_LISTA) for (const k of zw.dialog || []) z.push({ es: k.tekst });
      for (const r of ROZMOWY) for (const k of r.kwestie) { z.push({ es: k.bot }); }
      for (const g of GRAMATYKA) z.push({ es: g[2].replace(/_{3,}/, g[3][0]) });
    }
    fn = utworzKontekst(z);
  }
  return fn(x.es, { ile, bez: x.przyklad ? x.przyklad.es : '' });
}
