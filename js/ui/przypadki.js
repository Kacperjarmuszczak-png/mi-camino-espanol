// Ćwiczenie polskich przypadków (tryb dla hiszpańskojęzycznych): zdanie z luką, wpisz właściwą formę rzeczownika.
import { $, esc, przyciskGlosu } from './wspolne.js';
import { RZECZOWNIKI, PRZYPADKI, zadanie } from '../przypadki.js';
import { sprawdz, komunikat, ocenaZWyniku, losowy, tasuj } from '../tekst.js';

const CWICZONE = ['dop', 'cel', 'bier', 'narz', 'miej'];
const opis = k => PRZYPADKI.find(p => p.k === k);

export function widokPrzypadkow(el, app) {
  const ui = app.stan.ui;
  const P = { lista: [], nr: 0, dobrze: 0, bledy: [], zrobione: false };
  const wybrane = () => (ui.pPrzyp && ui.pPrzyp.length ? ui.pPrzyp : CWICZONE);

  function start(wlasne = null) {
    P.lista = wlasne || Array.from({ length: 10 }, () => zadanie(losowy(RZECZOWNIKI), losowy(wybrane())));
    P.nr = 0; P.dobrze = 0; P.bledy = [];
    pytanie();
  }
  const tabela = r => `<div class="tabela-ramka"><table class="tabela tabela--przyp">${PRZYPADKI.map(p => `<tr><th scope="row">${p.n}<small>${p.pl} · ${p.pyt}</small></th><td class="forma">${esc(r.formy[p.k])}</td></tr>`).join('')}</table></div>`;
  function pytanie() {
    const z = P.lista[P.nr]; P.zrobione = false;
    const o = opis(z.przypadek);
    el.innerHTML = `<div class="przyp">
      <div class="pigulki" role="group" aria-label="Casos">${CWICZONE.map(k => `<button type="button" class="pigulka" data-pp="${k}" aria-pressed="${wybrane().includes(k)}">${opis(k).n}</button>`).join('')}</div>
      <div class="sesja-pasek"><div class="postep"><i style="width:${100 * P.nr / P.lista.length}%"></i></div><span>Frase ${P.nr + 1} de ${P.lista.length} · bien ${P.dobrze}</span></div>
      <div class="drill-karta">
        <div class="chipy"><span class="chip chip--akcent">${o.n} · ${o.pl}</span><span class="chip">${o.pyt}</span></div>
        <p class="drill-zdanie" lang="pl">${esc(z.zdanie).replace('___', '<span class="luka">_____</span>')}</p>
        <p class="male"><b>${esc(z.r.formy.mian)}</b> – ${esc(z.r.es)} · ${esc(z.tlum)}</p>
      </div>
      <form class="pole-odp" data-pform autocomplete="off">
        <input class="pole" data-pwpis type="text" placeholder="escribe la forma" autocapitalize="off" autocorrect="off" spellcheck="false" data-znaki lang="pl" aria-label="Forma del sustantivo">
        <button type="submit" class="btn btn--akcent" data-psprawdz>Comprobar</button>
      </form>
      <div class="wynik" data-pwynik hidden></div></div>`;
    if (matchMedia('(pointer: fine)').matches) setTimeout(() => { const i = $('[data-pwpis]', el); if (i) i.focus(); }, 30);
  }
  function ocen() {
    if (P.zrobione) return dalej();
    const z = P.lista[P.nr], wpis = $('[data-pwpis]', el).value;
    if (!wpis.trim()) return;
    const r = sprawdz(wpis, [z.odp]);
    P.zrobione = true;
    const ok = r.wynik !== 'zle';
    if (ok) P.dobrze++; else P.bledy.push(z);
    app.ocen(z.r.id, ocenaZWyniku(r.wynik));
    const pelne = z.zdanie.replace('___', z.odp);
    const w = $('[data-pwynik]', el);
    w.hidden = false; w.className = 'wynik wynik--' + (r.wynik === 'dobrze' ? 'ok' : ok ? 'uwaga' : 'zle');
    w.innerHTML = `<p>${esc(komunikat(r, z.odp))}</p>
      <p class="drill-pelne" lang="pl">${esc(pelne)} ${przyciskGlosu(pelne)}</p>
      <p class="regula"><b>${opis(z.przypadek).n}:</b> ${esc(opis(z.przypadek).o)}</p>
      <details class="zwin"><summary>Declinación de «${esc(z.r.formy.mian)}»</summary>${tabela(z.r)}</details>
      <button type="button" class="btn btn--akcent btn--szeroki" data-pdalej>${P.nr + 1 >= P.lista.length ? 'Ver el resultado' : 'Siguiente'} <kbd>Enter</kbd></button>`;
    $('[data-psprawdz]', el).textContent = 'Siguiente';
    if (app.stan.ust.auto) app.mowa.powiedz(pelne);
  }
  function dalej() {
    P.nr++;
    if (P.nr < P.lista.length) return pytanie();
    el.innerHTML = `<div class="podsumowanie"><p class="etykieta">Resultado</p>
      <div class="liczby"><div><b>${P.dobrze}/${P.lista.length}</b><span>correctas</span></div></div>
      ${P.bledy.length ? `<ul class="lista lista--zwarta">${P.bledy.map(z => `<li><div class="lista-tekst"><b>${esc(z.zdanie.replace('___', z.odp))}</b><span>${opis(z.przypadek).n} · ${esc(z.r.formy.mian)}</span></div>${przyciskGlosu(z.zdanie.replace('___', z.odp))}</li>`).join('')}</ul>` : '<p class="srodek">¡Sin errores! Świetnie!</p>'}
      <div class="akcje-pion">${P.bledy.length ? '<button type="button" class="btn btn--akcent btn--szeroki" data-pbledne>Practicar solo los errores</button>' : ''}<button type="button" class="btn btn--szeroki" data-pnowe>Otras 10 frases</button></div></div>`;
    app.odswiez();
  }
  el.addEventListener('submit', e => { if (e.target.matches('[data-pform]')) { e.preventDefault(); ocen(); } });
  el.addEventListener('click', e => {
    const t = e.target;
    const pp = t.closest('[data-pp]');
    if (pp) {
      let w = wybrane().slice();
      w = w.includes(pp.dataset.pp) ? w.filter(k => k !== pp.dataset.pp) : [...w, pp.dataset.pp];
      ui.pPrzyp = w.length ? w : [pp.dataset.pp]; app.zapisz(); start(); return;
    }
    if (t.closest('[data-pdalej]')) return dalej();
    if (t.closest('[data-pbledne]')) return start(tasuj(P.bledy));
    if (t.closest('[data-pnowe]')) return start();
  });
  return {
    pokaz: () => start(),
    klawisz(e) { if (e.key === 'Enter' && P.zrobione) { dalej(); return true; } return false; },
  };
}
