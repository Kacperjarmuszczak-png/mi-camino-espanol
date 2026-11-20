// Układanie zdań: stuknij słowa w poprawnej kolejności (stuknięcie ułożonego słowa odkłada je z powrotem).
import { $, esc, przyciskGlosu } from './wspolne.js';
import { tokeny, sprawdzKolejnosc, tasujInaczej } from '../cwiczenia-logika.js';
import { tasuj } from '../tekst.js';
import { t as tr } from '../jezyk.js';
import { zdania } from './pula.js';

export function widokUkladania(el, app) {
  const U = { lista: [], nr: 0, dobrze: 0, ulozone: [], wolne: [], zrobione: false };
  function start() { U.lista = tasuj(zdania(app.stan.ui.poziom)).slice(0, 8); U.nr = 0; U.dobrze = 0; nowe(); }
  function nowe() {
    const z = U.lista[U.nr];
    U.wolne = tasujInaczej(tokeny(z.es)).map((t, i) => ({ t, i })); U.ulozone = []; U.zrobione = false;
    rysuj();
  }
  function rysuj() {
    const z = U.lista[U.nr];
    el.innerHTML = `<p class="etykieta">${tr('Ułóż zdanie', 'Ordena la frase')}</p>
      <div class="sesja-pasek"><div class="postep"><i style="width:${100 * U.nr / U.lista.length}%"></i></div><span>${U.nr + 1} / ${U.lista.length} · ${tr('dobrze', 'bien')} ${U.dobrze}</span></div>
      <p class="uz-pl">${esc(z.pl)}</p>
      <div class="uz-odp" data-uz-odp>${U.ulozone.map((x, i) => `<button type="button" class="uz-slowo" data-uz-u="${i}">${esc(x.t)}</button>`).join('') || `<span class="male">${tr('Stuknij słowa poniżej…', 'Toca las palabras de abajo…')}</span>`}</div>
      <div class="uz-wolne">${U.wolne.map((x, i) => `<button type="button" class="uz-slowo" data-uz-w="${i}">${esc(x.t)}</button>`).join('')}</div>
      <div class="wynik" data-uz-wynik hidden></div>
      <div class="akcje-poziom"><button type="button" class="btn btn--cichy btn--male" data-uz-reset>${tr('Od nowa', 'Reiniciar')}</button></div>`;
    if (!U.wolne.length && !U.zrobione) sprawdzU();
  }
  function sprawdzU() {
    const z = U.lista[U.nr];
    U.zrobione = true;
    const ok = sprawdzKolejnosc(U.ulozone.map(x => x.t), z.es);
    if (ok) U.dobrze++;
    app.dodajAktywnosc(1); app.licz('zdania');
    const w = $('[data-uz-wynik]', el);
    w.hidden = false; w.className = 'wynik wynik--' + (ok ? 'ok' : 'zle');
    w.innerHTML = `<p>${ok ? tr('¡Correcto!', '¡Correcto! Dobrze!') : tr('Prawie – poprawna kolejność:', 'Casi – el orden correcto:')}</p><p class="drill-pelne">${esc(z.es)} ${przyciskGlosu(z.es)}</p>
      <button type="button" class="btn btn--akcent btn--szeroki" data-uz-dalej>${U.nr + 1 >= U.lista.length ? tr('Zobacz wynik', 'Ver el resultado') : tr('Dalej', 'Siguiente')} <kbd>Enter</kbd></button>`;
    el.querySelectorAll('[data-uz-u]').forEach(b => { b.disabled = true; });
    app.mowa.powiedz(z.es);
  }
  function dalej() {
    U.nr++;
    if (U.nr < U.lista.length) return nowe();
    el.innerHTML = `<div class="podsumowanie"><p class="etykieta">${tr('Wynik', 'Resultado')}</p><div class="liczby"><div><b>${U.dobrze}/${U.lista.length}</b><span>${tr('poprawnych zdań', 'frases correctas')}</span></div></div>
      <button type="button" class="btn btn--akcent btn--szeroki" data-uz-nowe>${tr('Kolejne zdania', 'Más frases')}</button></div>`;
    app.odswiez();
  }
  el.addEventListener('click', e => {
    const t = e.target;
    const w = t.closest('[data-uz-w]'); if (w && !U.zrobione) { U.ulozone.push(U.wolne.splice(+w.dataset.uzW, 1)[0]); return rysuj(); }
    const u = t.closest('[data-uz-u]'); if (u && !U.zrobione) { U.wolne.push(U.ulozone.splice(+u.dataset.uzU, 1)[0]); return rysuj(); }
    if (t.closest('[data-uz-reset]') && !U.zrobione) { U.wolne.push(...U.ulozone.splice(0)); return rysuj(); }
    if (t.closest('[data-uz-dalej]')) return dalej();
    if (t.closest('[data-uz-nowe]')) return start();
  });
  return { pokaz: start, klawisz(e) { if (e.key === 'Enter' && U.zrobione) { dalej(); return true; } return false; } };
}
