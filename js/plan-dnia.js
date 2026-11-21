// „Plan na dziś”: jedna krótka, gotowa sesja – powtórki + nowe słowa, zwrot dnia i ćwiczenie dnia
// (oraz – jeśli są – powtórka częstego błędu). Stan dnia: stan.planDnia = { d, kroki: { id: 1 }, oczekuje }.
import { SLOWKA, ZWROTY_LISTA, POZIOMY } from './dane/index.js';
import { wybierzNaDzien } from './cwiczenia-logika.js';
import { dzien } from './stan.js';
import { HISP, t as tr } from './jezyk.js';
import { czesteBledy, opisKategorii } from './bledy.js';

const CWICZENIA = HISP
  ? ['dyktando', 'uloz', 'liczby', 'czytanie', 'falszywi', 'shadowing', 'memory']
  : ['dyktando', 'uloz', 'liczby', 'czytanie', 'falszywi', 'tilde', 'rodzajnik', 'shadowing', 'gramatyka', 'rozmowa'];

export function stanPlanu(stan) {
  const d = dzien();
  if (!stan.planDnia || stan.planDnia.d !== d) stan.planDnia = { d, kroki: {}, oczekuje: '' };
  return stan.planDnia;
}

/** Słowa do fiszek planu: do 5 zaległych powtórek (najstarsze), reszta do 10 – nowe z poziomu w kolejności od podstawowych. */
export function slowaPlanu(stan, teraz = Date.now()) {
  const zalegle = SLOWKA.filter(w => { const s = stan.srs[w.id]; return s && (s.ok || s.zle) && s.due <= teraz; })
    .sort((a, b) => stan.srs[a.id].due - stan.srs[b.id].due).slice(0, 5);
  const nowe = SLOWKA.filter(w => w.p === stan.ui.poziom && !stan.srs[w.id]).slice(0, 10 - zalegle.length);
  return { zalegle, nowe, lista: [...zalegle, ...nowe] };
}

export function zwrotDnia(stan) {
  const i = POZIOMY.indexOf(stan.ui.poziom);
  const pula = ZWROTY_LISTA.filter(z => POZIOMY.indexOf(z.p) <= i);
  const nieznane = pula.filter(z => !stan.srs[z.id]);
  return wybierzNaDzien(nieznane.length ? nieznane : pula, dzien(), 'plan-z');
}

export const cwiczenieDnia = () => wybierzNaDzien(CWICZENIA, dzien(), 'plan-c');

/** Lista kroków z informacją, czy zrobione. */
export function krokiPlanu(stan) {
  const P = stanPlanu(stan), s = slowaPlanu(stan);
  const k = [
    { id: 'karty', ik: '🃏', n: tr('Fiszki', 'Tarjetas'), o: s.zalegle.length ? tr(`${s.zalegle.length} powtórek + ${s.nowe.length} nowych słów`, `${s.zalegle.length} repasos + ${s.nowe.length} palabras nuevas`) : tr(`${s.nowe.length} nowych słów`, `${s.nowe.length} palabras nuevas`) },
    { id: 'zwrot', ik: '💬', n: tr('Zwrot dnia', 'Frase del día'), o: zwrotDnia(stan).es },
    { id: 'cw', ik: '🎯', n: tr('Ćwiczenie dnia', 'Ejercicio del día'), o: '', kafel: cwiczenieDnia() },
  ];
  const b = czesteBledy(stan)[0];
  if (b) k.push({ id: 'blad', ik: '🩹', n: tr('Twój częsty błąd', 'Tu error frecuente'), o: opisKategorii(b.kat, b).n, kat: b.kat });
  return k.map(x => ({ ...x, zrobione: !!P.kroki[x.id] }));
}
export function oznaczKrok(stan, id) { stanPlanu(stan).kroki[id] = 1; }
