// Plan nauki do celu (czyste funkcje): ile pozycji zostało do opanowania do wybranego poziomu i daty, ile dziennie, czy tempo wystarcza.
import { dzien } from './stan.js';
import { status } from './srs.js';

const POZ = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

/**
 * @param {object} stan
 * @param {{id: string, p: string}[]} elementy – wszystkie słówka, czasowniki i zwroty
 * @param {{poziom: string, data: string}} cel
 */
export function planNauki(stan, elementy, cel, teraz = Date.now()) {
  const i = POZ.indexOf(cel.poziom);
  const zakres = elementy.filter(x => POZ.indexOf(x.p) <= i);
  const opanowane = zakres.filter(x => status(stan.srs[x.id]) === 'opanowane').length;
  const pozostale = zakres.length - opanowane;
  const koniec = new Date(cel.data + 'T23:59:59').getTime();
  const dni = Math.max(1, Math.ceil((koniec - teraz) / 864e5));
  const naDzien = Math.ceil(pozostale / dni);
  // tempo: przyrost opanowanych w ostatnich 14 dniach (z historii)
  const hist = stan.hist || {}, klucze = Object.keys(hist).sort();
  const dzis = hist[dzien(teraz)] ?? (klucze.length ? hist[klucze[klucze.length - 1]] : 0);
  const odK = dzien(teraz - 14 * 864e5);
  const wczesniej = klucze.filter(k => k <= odK);
  const bazowa = wczesniej.length ? hist[wczesniej[wczesniej.length - 1]] : (klucze.length ? hist[klucze[0]] : 0);
  const dniHist = wczesniej.length ? 14 : Math.max(1, Math.round((teraz - new Date((klucze[0] || dzien(teraz)) + 'T12:00:00').getTime()) / 864e5));
  const tempo = Math.max(0, (dzis - bazowa) / dniHist);
  const prognoza = tempo > 0 ? dzien(teraz + Math.ceil(pozostale / tempo) * 864e5) : null;
  const procent = zakres.length ? Math.round(100 * opanowane / zakres.length) : 0;
  return { razem: zakres.length, opanowane, pozostale, dni, naDzien, tempo: Math.round(tempo * 10) / 10, prognoza, naKursie: pozostale === 0 || tempo >= naDzien, procent, po: dni <= 0 };
}
// Sugerowany cel dzienny (odpowiedzi): ok. 3 odpowiedzi na każdą nową pozycję, w krokach po 5, 10–60.
export const sugerowanyCel = naDzien => Math.min(60, Math.max(10, Math.ceil((naDzien * 3) / 5) * 5));
