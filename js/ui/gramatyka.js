// Widok „Gramatyka”: lista lekcji wg poziomu → reguła, przykłady, ćwiczenie (wybór z 4) z wyjaśnieniem.
import { $, esc, przyciskGlosu } from './wspolne.js';
import { LEKCJE } from '../dane/lekcje-gramatyki.js';
import { GRAMATYKA } from '../dane/gramatyka.js';
import { POZIOMY } from '../dane/index.js';
import { tasuj } from '../tekst.js';

export function widokGramatyki(el, app) {
  const st = app.stan;
  if (!st.gram) st.gram = {};
  let L = null, Z = null;

  function lista() {
    L = null;
    el.innerHTML = `<p class="etykieta">Gramatyka · lekcje</p>
      <div class="gr-lista">${POZIOMY.map(p => {
        const l = LEKCJE.filter(x => x.p === p);
        return l.length ? `<p class="gr-poziom${p === st.ui.poziom ? ' gr-poziom--ten' : ''}">${p}</p>${l.map(x => `<button type="button" class="gr-lekcja" data-gl="${x.id}"><b>${esc(x.t)}</b><span>${st.gram[x.id] != null ? `najlepiej ${st.gram[x.id]}%` : 'nowa'}</span></button>`).join('')}` : '';
      }).join('')}</div>`;
  }
  function lekcja(id) {
    L = LEKCJE.find(x => x.id === id); if (!L) return lista();
    const dodatkowe = GRAMATYKA.filter(g => L.gram.includes(g[1])).map(g => [g[2], g[3], g[4]]);
    Z = { pyt: tasuj([...L.cwiczenia, ...dodatkowe]).slice(0, 8).map(q => ({ q, opcje: tasuj(q[1]) })), nr: 0, dobrze: 0, odp: false };
    el.innerHTML = `<div class="gr">
      <div class="gr-naglowek"><span class="chip">${L.p}</span><h2>${esc(L.t)}</h2></div>
      <div class="gr-regula">${L.regula.map(r => `<p>${r}</p>`).join('')}</div>
      <p class="etykieta">Przykłady</p>
      <ul class="lista lista--zwarta">${L.przyklady.map(([es, pl]) => `<li><div class="lista-tekst"><b>${esc(es)}</b><span>${esc(pl)}</span></div>${przyciskGlosu(es)}</li>`).join('')}</ul>
      <p class="etykieta">Ćwiczenie</p>
      <div data-gr-cw></div></div>`;
    pytanie();
  }
  function pytanie() {
    const box = $('[data-gr-cw]', el);
    if (Z.nr >= Z.pyt.length) {
      const proc = Math.round(100 * Z.dobrze / Z.pyt.length);
      st.gram[L.id] = Math.max(st.gram[L.id] || 0, proc); app.zapisz();
      box.innerHTML = `<div class="podsumowanie"><div class="liczby"><div><b>${Z.dobrze}/${Z.pyt.length}</b><span>poprawnych</span></div><div><b>${proc}%</b><span>wynik</span></div></div>
        <div class="akcje-pion"><button type="button" class="btn btn--akcent btn--szeroki" data-gl="${L.id}">Jeszcze raz</button><button type="button" class="btn btn--szeroki" data-gr-lista>Wszystkie lekcje</button></div></div>`;
      app.odswiez();
      return;
    }
    const { q, opcje } = Z.pyt[Z.nr]; Z.odp = false;
    box.innerHTML = `<div class="sesja-pasek"><div class="postep"><i style="width:${100 * Z.nr / Z.pyt.length}%"></i></div><span>${Z.nr + 1} z ${Z.pyt.length}</span></div>
      <p class="egz-tekst">${esc(q[0]).replace(/_{3,}/, '<span class="luka">___</span>')}</p>
      <div class="opcje">${opcje.map((o, i) => `<button type="button" class="opcja" data-go="${i}"><kbd>${i + 1}</kbd><span>${esc(o)}</span></button>`).join('')}</div>
      <div class="wynik" data-gw hidden></div>`;
  }
  function odpowiedz(i) {
    if (Z.odp) return;
    Z.odp = true;
    const { q, opcje } = Z.pyt[Z.nr], ok = opcje[i] === q[1][0];
    if (ok) Z.dobrze++;
    app.dodajAktywnosc(1);
    el.querySelectorAll('[data-go]').forEach(b => { b.disabled = true; const o = opcje[+b.dataset.go]; if (o === q[1][0]) b.classList.add('ok'); else if (+b.dataset.go === i) b.classList.add('zle'); });
    const w = $('[data-gw]', el); w.hidden = false; w.className = 'wynik wynik--' + (ok ? 'ok' : 'zle');
    const pelne = q[0].replace(/_{3,}/, q[1][0]);
    w.innerHTML = `<p>${ok ? '¡Correcto!' : `Poprawnie: <b>${esc(q[1][0])}</b>`}</p><p class="drill-pelne">${esc(pelne)} ${przyciskGlosu(pelne)}</p><p class="male">${esc(q[2])}</p>
      <button type="button" class="btn btn--akcent btn--szeroki" data-gd>${Z.nr + 1 >= Z.pyt.length ? 'Zobacz wynik' : 'Dalej'} <kbd>Enter</kbd></button>`;
  }
  el.addEventListener('click', e => {
    const t = e.target;
    const l = t.closest('[data-gl]'); if (l) { lekcja(l.dataset.gl); scrollTo({ top: 0 }); return; }
    if (t.closest('[data-gr-lista]')) return lista();
    const o = t.closest('[data-go]'); if (o) return odpowiedz(+o.dataset.go);
    if (t.closest('[data-gd]')) { Z.nr++; pytanie(); }
  });
  return {
    pokaz(id) { if (id) lekcja(id); else if (!L) lista(); },
    klawisz(e) {
      if (!L || !Z) return false;
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= 4 && !Z.odp) { odpowiedz(n - 1); return true; }
      if (e.key === 'Enter' && Z.odp) { Z.nr++; pytanie(); return true; }
      return false;
    },
  };
}
