// „Rodzajnik w 3 sekundy”: el czy la? Przesuń w lewo (el) albo w prawo (la), klawisze ← →. 20 słów, rekord.
import { $, esc } from './wspolne.js';
import { SLOWKA, POZIOMY } from '../dane/index.js';
import { tasuj, bezRodzajnika } from '../tekst.js';

export function widokRodzajnika(el, app) {
  const G = { lista: [], nr: 0, wynik: 0, timer: null, koniec: 0, blok: false, bledy: [] };
  function pula() {
    const i = POZIOMY.indexOf(app.stan.ui.poziom);
    return SLOWKA.filter(w => POZIOMY.indexOf(w.p) <= i && /^(el|la) [^ ]+$/.test(w.es) && (w.rodzaj === 'm' || w.rodzaj === 'f'));
  }
  function menu() {
    clearInterval(G.timer);
    el.innerHTML = `<div class="rz-start"><p class="etykieta">El czy la?</p>
      <p>${'Masz 3 sekundy na każde słowo. Stuknij <b>el</b> albo <b>la</b>, przesuń kartę w lewo (el) lub w prawo (la), albo użyj strzałek ← →.'}</p>
      <p class="male">Uważaj na wyjątki: el día, el mapa, el problema, la mano, la foto… Rekord: ${app.stan.rekordy.rodzajnik || 0}/20</p>
      <button type="button" class="btn btn--akcent btn--szeroki btn--duzy" data-rd-start>Start</button></div>`;
  }
  function start() { G.lista = tasuj(pula()).slice(0, 20); G.nr = 0; G.wynik = 0; G.bledy = []; slowo(); }
  function slowo() {
    const w = G.lista[G.nr]; G.blok = false;
    el.innerHTML = `<div class="wz-gora"><span class="chip">${G.nr + 1}/20</span><span class="chip chip--akcent">✓ ${G.wynik}</span></div>
      <div class="rd-pasek"><i data-rd-czas></i></div>
      <div class="rd-karta" data-rd-karta><b>${esc(bezRodzajnika(w.es))}</b><small>${esc(String(w.pl).split(',')[0])}</small></div>
      <div class="rd-przyciski"><button type="button" class="btn btn--duzy" data-rd="m">← el</button><button type="button" class="btn btn--duzy" data-rd="f">la →</button></div>`;
    G.koniec = Date.now() + 3000;
    clearInterval(G.timer);
    G.timer = setInterval(() => {
      const z = Math.max(0, G.koniec - Date.now()), p = $('[data-rd-czas]', el);
      if (p) p.style.width = (z / 30) + '%';
      if (z <= 0) odp(null);
    }, 50);
  }
  function odp(r) {
    if (G.blok) return; G.blok = true; clearInterval(G.timer);
    const w = G.lista[G.nr], ok = r === w.rodzaj;
    if (ok) G.wynik++; else { G.bledy.push(w); app.blad('rodzajnik', { przyklad: w.es, id: w.id }); }
    app.ocen(w.id, ok ? 3 : 1, { bezAktywnosci: false });
    const k = $('[data-rd-karta]', el);
    k.classList.add(ok ? 'ok' : 'zle'); k.querySelector('b').textContent = w.es;
    setTimeout(() => { G.nr++; if (G.nr < G.lista.length) slowo(); else koniec(); }, ok ? 350 : 900);
  }
  function koniec() {
    const rek = app.rekord('rodzajnik', G.wynik);
    el.innerHTML = `<div class="podsumowanie"><p class="etykieta">El czy la? – wynik</p><div class="liczby"><div><b>${G.wynik}/20</b><span>poprawnych</span></div><div><b>${app.stan.rekordy.rodzajnik || 0}</b><span>rekord</span></div></div>
      ${rek ? '<p class="srodek tekst-ok"><b>Nowy rekord! 🎉</b></p>' : ''}
      ${G.bledy.length ? `<ul class="lista lista--zwarta">${G.bledy.map(w => `<li><div class="lista-tekst"><b>${esc(w.es)}</b><span>${esc(w.pl)}</span></div></li>`).join('')}</ul>` : ''}
      <button type="button" class="btn btn--akcent btn--szeroki" data-rd-start>Jeszcze raz</button></div>`;
    app.odswiez();
  }
  // przesunięcie karty palcem
  let x0 = null;
  el.addEventListener('pointerdown', e => { if (e.target.closest('[data-rd-karta]')) x0 = e.clientX; });
  el.addEventListener('pointerup', e => { if (x0 == null) return; const dx = e.clientX - x0; x0 = null; if (Math.abs(dx) > 50) odp(dx < 0 ? 'm' : 'f'); });
  el.addEventListener('click', e => {
    if (e.target.closest('[data-rd-start]')) return start();
    const b = e.target.closest('[data-rd]'); if (b) odp(b.dataset.rd);
  });
  return {
    pokaz: menu,
    klawisz(e) {
      if (G.lista.length && !G.blok && G.nr < G.lista.length && el.querySelector('[data-rd-karta]')) {
        if (e.key === 'ArrowLeft') { odp('m'); return true; }
        if (e.key === 'ArrowRight') { odp('f'); return true; }
      }
      return false;
    },
  };
}
