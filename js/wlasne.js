// Własne słówka: zapisane w stanie, dołączane do SLOWKA i POD_ID (temat „Moje słówka”), więc działają w kartach, listach i grach.
import { SLOWKA, POD_ID } from './dane/index.js';
import { t as tr } from './jezyk.js';

export const TEMAT_WLASNE = tr('Moje słówka', 'Mis palabras');
const element = w => ({ id: 'u:' + w.es, typ: 'slowo', es: w.es, pl: w.pl, p: w.p, t: TEMAT_WLASNE, rodzaj: null, mnoga: null, przyklad: null, latam: null, wlasne: true });

export function wczytajWlasne(stan) {
  for (const w of stan.wlasne || []) { const x = element(w); if (!POD_ID.has(x.id)) { SLOWKA.push(x); POD_ID.set(x.id, x); } }
}
export function dodajWlasne(stan, { es, pl, p }) {
  es = es.trim(); pl = pl.trim();
  if (!es || !pl) return null;
  if (!stan.wlasne) stan.wlasne = [];
  if (stan.wlasne.some(w => w.es === es)) return null;
  const w = { es, pl, p }; stan.wlasne.push(w);
  const x = element(w); SLOWKA.push(x); POD_ID.set(x.id, x);
  return x;
}
export function usunWlasne(stan, es) {
  stan.wlasne = (stan.wlasne || []).filter(w => w.es !== es);
  const id = 'u:' + es, i = SLOWKA.findIndex(x => x.id === id);
  if (i >= 0) SLOWKA.splice(i, 1);
  POD_ID.delete(id); delete stan.srs[id]; delete stan.ulub[id];
}
