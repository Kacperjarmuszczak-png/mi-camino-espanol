// Przygotowanie do DELE (A2, B1, B2): czytanie, słuchanie (lektor, maks. 2 odsłuchy jak na egzaminie) i pisanie z oceną orientacyjną.
import { $, esc, przyciskGlosu } from './wspolne.js';
import { DELE } from '../dane/dele.js';
import { analizuj } from '../analiza.js';
import { tasuj } from '../tekst.js';

const CZESCI = [['czytanie', 'Comprensión de lectura', 'Czytanie'], ['sluchanie', 'Comprensión auditiva', 'Słuchanie'], ['pisanie', 'Expresión escrita', 'Pisanie']];
const slowaW = t => (t.trim().match(/[\p{L}\p{N}]+/gu) || []).length;

/** Ocena orientacyjna pisania (0–25 jak w DELE): zadanie, długość, poprawność, bogactwo. */
export function ocenPisanie(tekst, zad) {
  const n = slowaW(tekst), maly = tekst.toLowerCase();
  // \b w JS nie zna liter z akcentami (gustó, opinión) – granica słowa liczona po literach Unicode
  const GR = '(?:(?<=[\\p{L}\\p{N}])(?![\\p{L}\\p{N}])|(?<![\\p{L}\\p{N}])(?=[\\p{L}\\p{N}]))';
  const punkty = zad.punkty.map(p => ({ ...p, ok: new RegExp(p.wzor.replace(/\\b/g, GR), 'iu').test(maly) }));
  const a = analizuj(tekst);
  const bledy = a.zdania.flatMap(z => z.uwagi).filter(u => u.typ === 'blad');
  const slowa = maly.match(/\p{L}+/gu) || [], rozne = new Set(slowa).size;
  const zadanie = Math.round(8 * punkty.filter(p => p.ok).length / punkty.length);
  const dlugosc = n >= zad.min && n <= zad.max * 1.1 ? 4 : n >= zad.min * 0.8 ? 2 : 0;
  const na100 = n ? bledy.length * 100 / n : 0;
  const poprawnosc = n < 20 ? 0 : na100 === 0 ? 8 : na100 < 2 ? 6 : na100 < 4 ? 4 : 2;
  const bogactwo = n < 20 ? 0 : rozne / slowa.length > 0.6 ? 5 : rozne / slowa.length > 0.45 ? 3 : 1;
  let suma = zadanie + dlugosc + poprawnosc + bogactwo;
  if (n < zad.min * 0.7) suma = Math.min(suma, 12);   // za krótki tekst nie może zdać (jak na egzaminie)
  return { n, punkty, bledy, czesci: { zadanie, dlugosc, poprawnosc, bogactwo }, suma, zdane: suma >= 15 };
}

export function widokDele(el, app) {
  const ui = app.stan.ui;
  const poz = () => DELE[ui.delePoz] ? ui.delePoz : (DELE[ui.poziom] ? ui.poziom : 'A2');
  let Z = null;   // bieżące zadanie: { czesc, i, opcje: [[...]], odp: [], odsluchy }

  function start() {
    Z = null;
    const P = DELE[poz()], wyniki = app.stan.dele || {};
    el.innerHTML = `<div class="dele">
      <p class="etykieta">DELE · ${poz()}</p>
      <div class="seg" role="group" aria-label="Poziom DELE">${Object.keys(DELE).map(p => `<button type="button" data-dpoz="${p}" aria-pressed="${p === poz()}">${p}</button>`).join('')}</div>
      <p class="male">Zadania w formacie egzaminu Instytutu Cervantesa. Polecenia są po hiszpańsku, jak na prawdziwym egzaminie; wyjaśnienia – po polsku. Próg zdania każdej części: 60%.</p>
      ${CZESCI.map(([k, es, pl]) => `<p class="etykieta">${pl} · <i>${es}</i> <span class="male">(na egzaminie ok. ${P.czas[k]} min)</span></p>
        <ul class="lista">${P[k].map((z, i) => { const w = wyniki[`${poz()}-${k}-${i}`]; return `<li><button type="button" class="lista-tekst" data-dz="${k}|${i}"><b>${esc(z.t)}</b><span>${k === 'pisanie' ? `${z.min}–${z.max} palabras` : `${z.q.length} preguntas`}${w != null ? ` · <i>Twój wynik: ${w}${k === 'pisanie' ? '/25' : '%'}</i>` : ''}</span></button></li>`; }).join('')}</ul>`).join('')}
    </div>`;
  }

  function zadanie(czesc, i) {
    const z = DELE[poz()][czesc][i];
    Z = { czesc, i, z, opcje: (z.q || []).map(q => tasuj(q[1])), odp: [], odsluchy: 0, sprawdzone: false };
    if (czesc === 'pisanie') return rysujPisanie();
    rysujPytania();
  }
  function rysujPytania() {
    const { z, czesc } = Z;
    el.innerHTML = `<div class="dele">
      <button type="button" class="cw-wstecz" data-dwroc>← DELE ${poz()}</button>
      <p class="etykieta">${czesc === 'czytanie' ? 'Comprensión de lectura' : 'Comprensión auditiva'}</p><h3>${esc(z.t)}</h3>
      ${czesc === 'czytanie' ? `<article class="cz-tekst" lang="es"><p>${esc(z.tekst).replace(/\n/g, '<br>')}</p></article>`
        : `<div class="sluchaj"><button type="button" class="btn btn--akcent btn--duzy" data-dgraj>▶ Escuchar (<span data-dile>${2 - Z.odsluchy}</span>)</button></div>
           <p class="male srodek">Jak na egzaminie: nagranie możesz odsłuchać dwa razy. Najpierw przeczytaj pytania.</p>
           <details class="zwin" data-dtrans hidden><summary>Transkrypcja</summary><p>${esc(z.tekst)}</p></details>`}
      <ol class="cz-pytania">${z.q.map((q, qi) => `<li><p class="cz-pyt">${esc(q[0])}</p>
        <div class="opcje">${Z.opcje[qi].map((o, oi) => `<button type="button" class="opcja" data-dq="${qi}" data-do="${oi}"><kbd>${'abc'[oi]}</kbd><span>${esc(o)}</span></button>`).join('')}</div>
        <div class="wynik" data-dw="${qi}" hidden></div></li>`).join('')}</ol>
      <button type="button" class="btn btn--akcent btn--szeroki" data-dsprawdz>Sprawdź odpowiedzi</button>
      <div data-dkoniec></div></div>`;
  }
  function wybierz(qi, oi) {
    if (Z.sprawdzone) return;
    Z.odp[qi] = oi;
    el.querySelectorAll(`[data-dq="${qi}"]`).forEach(b => b.setAttribute('aria-pressed', +b.dataset.do === oi));
  }
  function sprawdz() {
    if (Z.sprawdzone) return;
    const { z } = Z;
    if (Z.odp.filter(x => x != null).length < z.q.length && !el.querySelector('[data-dpotw]')) {
      $('[data-dkoniec]', el).innerHTML = `<p class="male srodek" data-dpotw>Nie wszystkie pytania mają odpowiedź. Stuknij „Sprawdź” jeszcze raz, żeby zakończyć.</p>`; return;
    }
    Z.sprawdzone = true;
    let dobrze = 0;
    z.q.forEach((q, qi) => {
      const pop = q[1][0], wyb = Z.opcje[qi][Z.odp[qi]], ok = wyb === pop;
      if (ok) dobrze++;
      el.querySelectorAll(`[data-dq="${qi}"]`).forEach(b => { b.disabled = true; const o = Z.opcje[qi][+b.dataset.do]; if (o === pop) b.classList.add('ok'); else if (+b.dataset.do === Z.odp[qi]) b.classList.add('zle'); });
      const w = $(`[data-dw="${qi}"]`, el); w.hidden = false; w.className = 'wynik wynik--' + (ok ? 'ok' : 'zle');
      w.innerHTML = `<p class="male">${esc(q[2])}</p>`;
    });
    const proc = Math.round(100 * dobrze / z.q.length);
    zapiszWynik(proc);
    const tr = el.querySelector('[data-dtrans]'); if (tr) tr.hidden = false;
    app.dodajAktywnosc(z.q.length);
    $('[data-dsprawdz]', el).remove();
    $('[data-dkoniec]', el).innerHTML = `<div class="wynik-egz"><b>${proc}%</b><span>${dobrze} z ${z.q.length} · ${proc >= 60 ? 'APTO – ta część zaliczona' : 'NO APTO – próg to 60%'}</span></div>
      <button type="button" class="btn btn--szeroki" data-dwroc>Wróć do listy zadań</button>`;
  }
  function zapiszWynik(v) {
    const st = app.stan; st.dele = st.dele || {};
    const k = `${poz()}-${Z.czesc}-${Z.i}`;
    st.dele[k] = Math.max(st.dele[k] || 0, v); app.zapisz();
  }

  function rysujPisanie(wynik = '') {
    const { z } = Z, k = `dele-${poz()}-${Z.i}`, szkic = (app.stan.szkice || {})[k] || '';
    el.innerHTML = `<div class="dele">
      <button type="button" class="cw-wstecz" data-dwroc>← DELE ${poz()}</button>
      <p class="etykieta">Expresión escrita</p><h3>${esc(z.t)}</h3>
      <div class="tlumaczenie"><p lang="es">${esc(z.polecenie)}</p><p class="male">${esc(z.pl)}</p><p class="male"><b>${z.min}–${z.max} palabras.</b></p></div>
      <textarea class="pole pole--tekst" id="dele-tekst" rows="10" lang="es" spellcheck="false" data-znaki placeholder="Escribe aquí tu texto…">${esc(szkic)}</textarea>
      <p class="male" data-dlicz>${slowaW(szkic)} palabras</p>
      <button type="button" class="btn btn--akcent btn--szeroki" data-docen>Oceń tekst</button>
      <div data-dwynik>${wynik}</div></div>`;
  }
  function ocen() {
    const tekst = $('#dele-tekst', el).value;
    if (slowaW(tekst) < 10) { $('[data-dwynik]', el).innerHTML = '<p class="male">Napisz najpierw tekst (co najmniej kilka zdań).</p>'; return; }
    const r = ocenPisanie(tekst, Z.z);
    zapiszWynik(r.suma);
    app.dodajAktywnosc(5);
    const pasek = (n, v, max) => `<div class="typ"><span>${n}</span><div class="postep"><i style="width:${100 * v / max}%"></i></div><small>${v}/${max}</small></div>`;
    $('[data-dwynik]', el).innerHTML = `<div class="wynik wynik--${r.zdane ? 'ok' : 'uwaga'}">
      <p><b>Ocena orientacyjna: ${r.suma}/25 · ${r.zdane ? 'APTO' : 'NO APTO'}</b> <span class="male">(próg 15/25)</span></p>
      <div class="typy">${pasek('Realizacja zadania', r.czesci.zadanie, 8)}${pasek('Długość', r.czesci.dlugosc, 4)}${pasek('Poprawność', r.czesci.poprawnosc, 8)}${pasek('Bogactwo słownictwa', r.czesci.bogactwo, 5)}</div>
      <p class="etykieta">Co trzeba było zawrzeć</p>
      ${r.punkty.map(p => `<p>${p.ok ? '✓' : '✗'} ${esc(p.opis)}</p>`).join('')}
      <p class="male">Długość: ${r.n} słów (wymagane ${Z.z.min}–${Z.z.max}).</p>
      ${r.bledy.length ? `<p class="etykieta">Możliwe błędy</p>${r.bledy.map(u => `<p>✗ <b>${esc(u.tytul)}</b> – ${esc(u.tekst)}</p>`).join('')}` : '<p>Automatyczne sprawdzenie nie znalazło typowych błędów.</p>'}
      <p class="male">To ocena automatyczna: sprawdza punkty polecenia, długość, typowe błędy i różnorodność słów. Prawdziwy egzaminator oceni też spójność i styl – warto dać tekst do przeczytania nauczycielowi.</p></div>`;
  }

  el.addEventListener('click', e => {
    const t = e.target;
    const p = t.closest('[data-dpoz]'); if (p) { ui.delePoz = p.dataset.dpoz; app.zapisz(); return start(); }
    const d = t.closest('[data-dz]'); if (d) { const [c, i] = d.dataset.dz.split('|'); zadanie(c, +i); el.scrollIntoView({ block: 'start' }); return; }
    if (t.closest('[data-dwroc]')) { app.mowa.stop(); return start(); }
    const o = t.closest('[data-do]'); if (o) return wybierz(+o.dataset.dq, +o.dataset.do);
    if (t.closest('[data-dsprawdz]')) return sprawdz();
    if (t.closest('[data-docen]')) return ocen();
    const g = t.closest('[data-dgraj]');
    if (g) {
      if (Z.odsluchy >= 2) return;
      Z.odsluchy++; $('[data-dile]', el).textContent = 2 - Z.odsluchy;
      if (Z.odsluchy >= 2) g.disabled = true;
      app.mowa.powiedz(Z.z.tekst.replace(/—/g, ''));
    }
  });
  el.addEventListener('input', e => {
    if (e.target.id !== 'dele-tekst') return;
    const st = app.stan; st.szkice = st.szkice || {}; st.szkice[`dele-${poz()}-${Z.i}`] = e.target.value; app.zapisz();
    const l = $('[data-dlicz]', el); const n = slowaW(e.target.value);
    l.textContent = `${n} palabras`; l.classList.toggle('tekst-zle', n > Z.z.max * 1.1);
  });
  return { pokaz: start };
}
export { przyciskGlosu };
