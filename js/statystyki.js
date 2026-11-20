// Statystyki (czyste funkcje): kalendarz aktywności, najdłuższa seria, historia opanowanych, najczęściej mylone.
import { dzien } from './stan.js';
import { status } from './srs.js';

/** Siatka ostatnich `tygodni` tygodni (kolumny = tygodnie od poniedziałku, wiersze = dni), poziom 0–4 względem celu. */
export function kalendarz(dni, cel, tygodnie = 18, teraz = Date.now()) {
  const dzis = new Date(teraz); dzis.setHours(12, 0, 0, 0);
  const pon = new Date(dzis); pon.setDate(dzis.getDate() - ((dzis.getDay() + 6) % 7) - 7 * (tygodnie - 1));
  const kolumny = [];
  for (let w = 0; w < tygodnie; w++) {
    const kol = [];
    for (let d = 0; d < 7; d++) {
      const data = new Date(pon); data.setDate(pon.getDate() + w * 7 + d);
      if (data > dzis) { kol.push(null); continue; }
      const k = dzien(data.getTime()), n = dni[k] || 0;
      kol.push({ k, n, poziom: !n ? 0 : n >= cel * 1.5 ? 4 : n >= cel ? 3 : n >= cel / 2 ? 2 : 1 });
    }
    kolumny.push(kol);
  }
  return kolumny;
}

export function najdluzszaSeria(dni, cel) {
  const klucze = Object.keys(dni).filter(k => dni[k] >= cel).sort();
  let naj = 0, biez = 0, poprz = null;
  for (const k of klucze) {
    const t = new Date(k + 'T12:00:00').getTime();
    biez = poprz != null && Math.round((t - poprz) / 864e5) === 1 ? biez + 1 : 1;
    naj = Math.max(naj, biez); poprz = t;
  }
  return naj;
}

export const liczOpanowane = srs => Object.values(srs).filter(s => status(s) === 'opanowane').length;

/** Punkty wykresu z ostatnich `ile` dni (wartość z dnia albo ostatnia znana wcześniej). */
export function seriaOpanowanych(hist, ile = 30, teraz = Date.now()) {
  const klucze = Object.keys(hist).sort();
  const pkt = [];
  let ost = 0;
  const pierwszy = dzien(teraz - (ile - 1) * 864e5);
  for (const k of klucze) if (k < pierwszy) ost = hist[k];
  for (let i = ile - 1; i >= 0; i--) {
    const k = dzien(teraz - i * 864e5);
    if (hist[k] != null) ost = hist[k];
    pkt.push({ k, n: ost });
  }
  return pkt;
}

/** Najczęściej mylone pozycje: [{ id, zle, ok }] posortowane malejąco po błędach. */
export function najczesciejMylone(srs, ile = 10, filtr = () => true) {
  return Object.entries(srs).filter(([id, s]) => s && s.zle > 0 && filtr(id))
    .sort((a, b) => b[1].zle - a[1].zle || (a[1].ok || 0) - (b[1].ok || 0)).slice(0, ile)
    .map(([id, s]) => ({ id, zle: s.zle, ok: s.ok || 0 }));
}
