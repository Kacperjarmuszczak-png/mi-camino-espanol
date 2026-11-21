// Widok „Czytanie” (w zakładce Zwroty): krótkie teksty z poziomu, stuknięcie słowa = tłumaczenie, pytania ze zrozumienia.
import { $, esc, przyciskGlosu } from './wspolne.js';
import { CZYTANIE } from '../dane/czytanie.js';
import { CZYTANIE_PL } from '../dane/czytanie-pl.js';
import { POZIOMY, SLOWKA, ZWROTY_LISTA } from '../dane/index.js';
import { analizuj } from '../analiza.js';
import { utworzAnalizatorPl } from '../analiza-pl.js';
import { HISP, t as tr } from '../jezyk.js';
import { tasuj, czysc } from '../tekst.js';
import { szukajWSlowniku } from '../slownik.js';

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
    const tekstHtml = T.tekst.replace(/[\p{L}]+|[^\p{L}]+/gu, (w, o) => (/\p{L}/u.test(w) ? `<span class="cz-slowo" data-cz="${esc(w)}" data-o="${o}">${esc(w)}</span>` : esc(w)));
    el.innerHTML = `<div class="czytanie">
      <div class="pigulki cz-lista" role="group" aria-label="${tr('Teksty', 'Textos')}">${lista.map((x, j) => `<button type="button" class="pigulka" data-czt="${x.i}" aria-pressed="${x.i === ui.czTekst}">${x.p} · ${j + 1}</button>`).join('')}</div>
      <article class="cz-tekst" lang="${HISP ? 'pl' : 'es'}">
        <div class="cz-gora"><span class="chip">${T.p}</span><span class="cz-graj"><button type="button" class="btn btn--male" data-cz-czytaj>▶ ${tr('Czytaj na głos', 'Leer en voz alta')}</button><button type="button" class="btn btn--male btn--cichy" data-cz-wolno>${tr('Wolniej', 'Más lento')}</button></span></div>
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
      app.licz('czytanie');
      $('[data-cz-koniec]', el).innerHTML = `<p class="srodek"><b>${dobrze}/${T.q.length}</b> ${tr('poprawnych odpowiedzi', 'respuestas correctas')}</p>`;
    }
  }
  // czytanie na głos z podświetlaniem bieżącego słowa (zdarzenia „boundary” syntezy mowy)
  function czytaj(wolniej) {
    const slowa = [...el.querySelectorAll('.cz-slowo')];
    const zgas = () => slowa.forEach(s => s.classList.remove('czytane'));
    zgas();
    app.mowa.powiedz(T.tekst, { wolniej, granica: i => {
      let akt = null;
      for (const s of slowa) { if (+s.dataset.o <= i) akt = s; else break; }
      zgas(); if (akt) akt.classList.add('czytane');
    }, koniec: zgas });
  }
  el.addEventListener('click', e => {
    const t = e.target;
    if (t.closest('[data-cz-czytaj]')) return czytaj(false);
    if (t.closest('[data-cz-wolno]')) return czytaj(true);
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
      if (!d || !d.tlum) {
        const slowo = w.dataset.cz;
        szukajWSlowniku(slowo, HISP ? 'pl' : 'es').then(r => {
          if (!r || !w.classList.contains('aktywne')) return;
          slownik.set(czysc(slowo), { tlum: r.tlum.slice(0, 3).join(', '), haslo: r.haslo, opis: r.opis || tr('słownik ogólny', 'diccionario general') });
          dymek.innerHTML = `<b>${esc(slowo)}</b>${czysc(r.haslo) !== czysc(slowo) ? ` <span class="male">→ ${esc(r.haslo)}</span>` : ''}<span>${esc(r.tlum.slice(0, 3).join(', '))}</span><small>${esc(r.opis || tr('słownik ogólny', 'diccionario general'))}</small>`;
        });
      }
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
