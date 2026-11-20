// „Gdzie akcent?”: zasady pisowni z tyldą + ćwiczenie – stuknij samogłoskę, która dostaje tildę, albo „bez akcentu”.
import { $, esc, przyciskGlosu } from './wspolne.js';
import { SLOWKA, POZIOMY } from '../dane/index.js';
import { tasuj, bezRodzajnika } from '../tekst.js';
import { analizaAkcentu, bezTyldy } from '../akcent.js';

const ZASADY = ['<b>Aguda</b> (akcent na ostatniej sylabie): tilde, gdy kończy się na samogłoskę, -n lub -s – café, canción, inglés.',
  '<b>Llana</b> (przedostatnia sylaba – najczęstsza): tilde, gdy kończy się na inną spółgłoskę – árbol, fácil, lápiz.',
  '<b>Esdrújula</b> (trzecia od końca): zawsze tilde – médico, teléfono, rápido.',
  '<b>Rozziew</b>: akcentowane í / ú obok a, e, o – día, país, río, búho.',
  'Tilde odróżnia też słowa jednosylabowe: tú (ty) / tu (twój), él (on) / el, sí (tak) / si (jeśli), más (więcej) / mas.'];

export function widokAkcentu(el, app) {
  const G = { lista: [], nr: 0, dobrze: 0, zrobione: false };
  function pula() {
    const i = POZIOMY.indexOf(app.stan.ui.poziom);
    const l = SLOWKA.filter(w => POZIOMY.indexOf(w.p) <= i + 1).map(w => ({ w, s: bezRodzajnika(w.es.toLowerCase()) })).filter(x => /^[a-záéíóúñ]{3,12}$/.test(x.s));
    const z = tasuj(l.filter(x => /[áéíóú]/.test(x.s))).slice(0, 7), bez = tasuj(l.filter(x => !/[áéíóú]/.test(x.s))).slice(0, 3);
    return tasuj([...z, ...bez]);
  }
  function wstep() {
    el.innerHTML = `<p class="etykieta">Gdzie postawić akcent?</p><div class="gr-regula">${ZASADY.map(z => `<p>${z}</p>`).join('')}</div>
      <button type="button" class="btn btn--akcent btn--szeroki btn--duzy" data-ga-start>Ćwiczenie (10 słów)</button>`;
  }
  function start() { G.lista = pula(); G.nr = 0; G.dobrze = 0; pytanie(); }
  function pytanie() {
    const x = G.lista[G.nr]; G.zrobione = false;
    const goly = bezTyldy(x.s);
    el.innerHTML = `<div class="sesja-pasek"><div class="postep"><i style="width:${10 * G.nr}%"></i></div><span>${G.nr + 1} / ${G.lista.length} · dobrze ${G.dobrze}</span></div>
      <p class="egz-tytul">Stuknij samogłoskę z akcentem graficznym <span class="male">(${esc(String(x.w.pl).split(',')[0])})</span></p>
      <div class="ga-slowo">${[...goly].map((c, i) => ('aeiou'.includes(c) ? `<button type="button" class="ga-lit" data-ga="${i}">${c}</button>` : `<span class="ga-lit ga-lit--sp">${c}</span>`)).join('')}</div>
      <button type="button" class="btn btn--szeroki" data-ga="-1">Bez akcentu graficznego</button>
      <div class="wynik" data-ga-wynik hidden></div>`;
  }
  function odp(i) {
    if (G.zrobione) return; G.zrobione = true;
    const x = G.lista[G.nr], a = analizaAkcentu(x.s), ok = i === a.indeks;
    if (ok) G.dobrze++;
    app.ocen(x.w.id, ok ? 3 : 1);
    el.querySelectorAll('[data-ga]').forEach(b => { b.disabled = true; if (+b.dataset.ga === a.indeks) b.classList.add('ok'); else if (+b.dataset.ga === i) b.classList.add('zle'); });
    const w = $('[data-ga-wynik]', el); w.hidden = false; w.className = 'wynik wynik--' + (ok ? 'ok' : 'zle');
    w.innerHTML = `<p><b>${esc(x.s)}</b> ${przyciskGlosu(x.s)}</p><p class="male">${esc(a.regula)}</p>
      <button type="button" class="btn btn--akcent btn--szeroki" data-ga-dalej>${G.nr + 1 >= G.lista.length ? 'Zobacz wynik' : 'Dalej'} <kbd>Enter</kbd></button>`;
    app.mowa.powiedz(x.s);
  }
  function dalej() {
    G.nr++;
    if (G.nr < G.lista.length) return pytanie();
    el.innerHTML = `<div class="podsumowanie"><p class="etykieta">Wynik</p><div class="liczby"><div><b>${G.dobrze}/${G.lista.length}</b><span>poprawnych</span></div></div>
      <div class="akcje-pion"><button type="button" class="btn btn--akcent btn--szeroki" data-ga-start>Kolejne słowa</button><button type="button" class="btn btn--szeroki" data-ga-zasady>Zasady</button></div></div>`;
    app.odswiez();
  }
  el.addEventListener('click', e => {
    const t = e.target;
    if (t.closest('[data-ga-start]')) return start();
    if (t.closest('[data-ga-zasady]')) return wstep();
    const b = t.closest('[data-ga]'); if (b) return odp(+b.dataset.ga);
    if (t.closest('[data-ga-dalej]')) return dalej();
  });
  return { pokaz: wstep, klawisz(e) { if (e.key === 'Enter' && G.zrobione) { dalej(); return true; } return false; } };
}
