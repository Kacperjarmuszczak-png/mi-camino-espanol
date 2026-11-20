// Widok „Czytanie” (w zakładce Zwroty): krótkie teksty z poziomu, stuknięcie słowa = tłumaczenie, pytania ze zrozumienia.
import { $, esc, przyciskGlosu } from './wspolne.js';
import { CZYTANIE } from '../dane/czytanie.js';
import { CZYTANIE_PL } from '../dane/czytanie-pl.js';
import { POZIOMY, SLOWKA, ZWROTY_LISTA } from '../dane/index.js';
import { analizuj } from '../analiza.js';
import { utworzAnalizatorPl } from '../analiza-pl.js';
import { HISP, t as tr } from '../jezyk.js';
import { tasuj, czysc } from '../tekst.js';

const TEKSTY = HISP ? CZYTANIE_PL : CZYTANIE;
let analizatorPl = null;

// słowo → { tlum, haslo } dla całego tekstu
function slownikTekstu(tekst) {
  const m = new Map();
  if (HISP) {
    analizatorPl = analizatorPl || utworzAnalizatorPl([...SLOWKA, ...ZWROTY_LISTA.filter(z => !/\s/.test(z.es.trim()))]);
    for (const w of analizatorPl(tekst).slowa) m.set(czysc(w.t), { tlum: w.es, haslo: w.haslo, opis: w.opis || w.typ });
  } else {
    for (const z of analizuj(tekst).zdania) for (const w of z.slowa) {
      const k = czysc(w.t);
      if (!m.has(k)) m.set(k, { tlum: String(w.pl || '').replace(/\s*–\s*$/, ''), haslo: w.lemat, opis: w.opis || w.typ });
    }
  }
  return m;
}

export function widokCzytania(el, app) {
  const ui = app.stan.ui;
  let T = null, slownik = null, odp = [];

  const dostepne = () => TEKSTY.map((x, i) => ({ ...x, i })).filter(x => POZIOMY.indexOf(x.p) <= POZIOMY.indexOf(ui.poziom));
  function wybierz(i) {
    T = TEKSTY[i]; ui.czTekst = i; app.zapisz();
    slownik = slownikTekstu(T.tekst);
    odp = T.q.map(q => ({ opcje: tasuj(q[1]), wybor: null }));
    rysuj();
  }
  function rysuj() {
    const lista = dostepne();
    const nr = lista.findIndex(x => x.i === ui.czTekst);
    const tekstHtml = esc(T.tekst).replace(/[\p{L}]+/gu, w => `<span class="cz-slowo" data-cz="${esc(w)}">${w}</span>`);
    el.innerHTML = `<div class="czytanie">
      <div class="pigulki cz-lista" role="group" aria-label="${tr('Teksty', 'Textos')}">${lista.map((x, j) => `<button type="button" class="pigulka" data-czt="${x.i}" aria-pressed="${x.i === ui.czTekst}">${x.p} · ${j + 1}</button>`).join('')}</div>
      <article class="cz-tekst" lang="${HISP ? 'pl' : 'es'}">
        <div class="cz-gora"><span class="chip">${T.p}</span>${przyciskGlosu(T.tekst, tr('Posłuchaj tekstu', 'Escuchar el texto'))}</div>
        <p>${tekstHtml}</p>
        <div class="cz-dymek" data-cz-dymek hidden></div>
        <p class="male">${tr('Stuknij słowo, żeby zobaczyć tłumaczenie.', 'Toca una palabra para ver la traducción.')}</p>
      </article>
      <p class="etykieta">${tr('Pytania', 'Preguntas')}</p>
      <ol class="cz-pytania">${T.q.map((q, qi) => `<li><p class="cz-pyt">${esc(q[0])}</p>
        <div class="opcje">${odp[qi].opcje.map((o, oi) => `<button type="button" class="opcja" data-czq="${qi}" data-czo="${oi}"><kbd>${oi + 1}</kbd><span>${esc(o)}</span></button>`).join('')}</div>
        <div class="wynik" data-czw="${qi}" hidden></div></li>`).join('')}</ol>
      <div data-cz-koniec></div>
      ${nr >= 0 && nr + 1 < lista.length ? `<button type="button" class="btn btn--szeroki" data-czt="${lista[nr + 1].i}">${tr('Następny tekst', 'Siguiente texto')} →</button>` : ''}
    </div>`;
  }
  function odpowiedz(qi, oi) {
    const st = odp[qi]; if (st.wybor != null) return;
    st.wybor = oi;
    const q = T.q[qi], ok = st.opcje[oi] === q[1][0];
    el.querySelectorAll(`[data-czq="${qi}"]`).forEach(b => { b.disabled = true; const o = st.opcje[+b.dataset.czo]; if (o === q[1][0]) b.classList.add('ok'); else if (+b.dataset.czo === oi) b.classList.add('zle'); });
    const w = $(`[data-czw="${qi}"]`, el); w.hidden = false; w.className = 'wynik wynik--' + (ok ? 'ok' : 'zle');
    w.innerHTML = `<p>${ok ? tr('¡Correcto!', '¡Correcto! Dobrze!') : `${tr('Poprawnie', 'Correcto')}: <b>${esc(q[1][0])}</b>`}</p><p class="male">${esc(q[2])}</p>`;
    app.dodajAktywnosc(1);
    if (odp.every(x => x.wybor != null)) {
      const dobrze = odp.filter((x, i) => x.opcje[x.wybor] === T.q[i][1][0]).length;
      $('[data-cz-koniec]', el).innerHTML = `<p class="srodek"><b>${dobrze}/${T.q.length}</b> ${tr('poprawnych odpowiedzi', 'respuestas correctas')}</p>`;
    }
  }
  el.addEventListener('click', e => {
    const t = e.target;
    const s = t.closest('[data-czt]'); if (s) { wybierz(+s.dataset.czt); el.scrollIntoView({ block: 'start', behavior: 'smooth' }); return; }
    const o = t.closest('[data-czo]'); if (o) return odpowiedz(+o.dataset.czq, +o.dataset.czo);
    const w = t.closest('[data-cz]');
    if (w) {
      el.querySelectorAll('.cz-slowo.aktywne').forEach(x => x.classList.remove('aktywne'));
      w.classList.add('aktywne');
      const d = slownik.get(czysc(w.dataset.cz)), dymek = $('[data-cz-dymek]', el);
      dymek.hidden = false;
      dymek.innerHTML = `<b>${esc(w.dataset.cz)}</b>${d && d.haslo && czysc(d.haslo) !== czysc(w.dataset.cz) ? ` <span class="male">→ ${esc(d.haslo)}</span>` : ''}
        <span>${d && d.tlum ? esc(d.tlum) : tr('brak w słowniku', 'no está en el diccionario')}</span>${d && d.opis ? `<small>${esc(d.opis)}</small>` : ''}`;
      app.mowa.powiedz(w.dataset.cz);
    }
  });
  return {
    pokaz() {
      const lista = dostepne();
      const naPoz = lista.filter(x => x.p === ui.poziom);
      const i = lista.some(x => x.i === ui.czTekst) ? ui.czTekst : (naPoz[0] || lista[0]).i;
      wybierz(i);
    },
    klawisz(e) {
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= 4) { const qi = odp.findIndex(x => x.wybor == null); if (qi >= 0) { odpowiedz(qi, n - 1); return true; } }
      return false;
    },
  };
}
