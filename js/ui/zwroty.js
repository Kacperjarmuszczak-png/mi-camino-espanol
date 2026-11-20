// Zakładka „Zwroty”: przegląd z dialogami, fiszki (SRS), dobieranie reakcji do sytuacji i dialog z luką.
import { $, esc, przyciskGlosu, przyciskGwiazdki, podswietl, bezGwiazdek } from './wspolne.js';
import { silnikKart } from './karty.js';
import { utworzListe } from './lista.js';
import { ZWROTY_LISTA, KATEGORIE_ZWROTOW, POZIOMY } from '../dane/index.js';
import { tasuj } from '../tekst.js';

const WIDOKI = [['przeglad', 'Przegląd'], ['fiszki', 'Fiszki'], ['reakcja', 'Reakcja'], ['dialog', 'Dialog z luką']];
const REJESTR = { form: 'formalny', nieform: 'nieformalny', neutr: 'neutralny' };

export function zakladkaZwroty(root, app) {
  const ui = app.stan.ui;
  root.innerHTML = `
    <div class="wiersz">
      <label class="wybor"><span>Sytuacja</span><select class="pole" id="z-kat" aria-label="Kategoria zwrotów"></select></label>
    </div>
    <div class="seg seg--pelny" role="group" aria-label="Widok" id="z-widoki">${WIDOKI.map(([k, n]) => `<button type="button" data-widok="${k}">${n}</button>`).join('')}</div>
    <div id="z-tresc"></div>
    <div id="z-karty"></div>
    <div id="z-lista"></div>`;
  const sel = $('#z-kat', root), tresc = $('#z-tresc', root), kartyEl = $('#z-karty', root);
  const dostepneKat = () => KATEGORIE_ZWROTOW.filter(k => POZIOMY.indexOf(k.p) <= POZIOMY.indexOf(ui.poziom));
  const pula = () => ZWROTY_LISTA.filter(z => (ui.zKat ? z.t === ui.zKat : dostepneKat().some(k => k.t === z.t)));
  const zDialogiem = () => pula().filter(z => z.dialog.length);
  const silnik = silnikKart(kartyEl, { app, rodzaj: 'zwroty', pula, pelnaPula: () => ZWROTY_LISTA });
  const lista = utworzListe($('#z-lista', root), {
    id: 'z-lista-szuflada', app, tytul: 'Lista zwrotów', pobierz: pula,
    opis: z => esc(z.pl) + ` <i>· ${REJESTR[z.reg]}</i>`, mow: z => z.es,
    cwicz: z => { ui.zWidok = 'fiszki'; rysujWidoki(); silnik.cwiczJeden(z); root.scrollIntoView({ behavior: 'smooth', block: 'start' }); },
  });
  const widok = () => ui.zWidok || 'przeglad';

  function rysujKategorie() {
    const k = dostepneKat();
    if (ui.zKat && !k.some(x => x.t === ui.zKat)) ui.zKat = '';
    sel.innerHTML = `<option value="">Wszystkie dostępne (${ZWROTY_LISTA.filter(z => k.some(x => x.t === z.t)).length})</option>` +
      k.map(x => `<option value="${esc(x.t)}"${x.t === ui.zKat ? ' selected' : ''}>${esc(x.t)} · ${x.p}</option>`).join('');
  }
  function rysujWidoki() {
    root.querySelectorAll('[data-widok]').forEach(b => b.setAttribute('aria-pressed', b.dataset.widok === widok()));
    kartyEl.hidden = widok() !== 'fiszki';
    tresc.hidden = widok() === 'fiszki';
  }

  // --- przegląd: karty zwrotów z dialogami ---
  function przeglad() {
    const z = pula();
    tresc.innerHTML = `<div class="zwroty-karty">${z.slice(0, 60).map(x => `
      <article class="zwrot">
        <div class="zwrot-gora"><h3>${esc(x.es)}</h3><span class="zwrot-akcje">${przyciskGlosu(x.es)}${przyciskGwiazdki(x.id, app.stan.ulub[x.id])}</span></div>
        <p class="zwrot-pl">${esc(x.pl)}</p>
        <div class="chipy"><span class="chip chip--${x.reg}">${REJESTR[x.reg]}</span><span class="chip">${esc(x.t)}</span></div>
        ${x.kiedy ? `<p class="kiedy"><b>Kiedy:</b> ${esc(x.kiedy)}</p>` : ''}
        ${x.dialog.length ? `<details class="dialog-zwin"><summary>Przykładowy dialog</summary><div class="dialog">${x.dialog.map(l => `<p class="kwestia kwestia--${l.kto === 'A' ? 'a' : 'b'}"><span>${l.kto}</span>${podswietl(l.tekst)}</p>`).join('')}${przyciskGlosu(x.dialog.map(l => bezGwiazdek(l.tekst)).join(' '), 'Posłuchaj dialogu')}</div></details>` : ''}
      </article>`).join('')}</div>
      ${z.length > 60 ? `<p class="male srodek">Pokazano 60 z ${z.length}. Wybierz sytuację, żeby zobaczyć resztę, albo użyj listy poniżej.</p>` : ''}`;
  }

  // --- ćwiczenia: reakcja i dialog z luką ---
  const C = { nr: 0, dobrze: 0, pyt: null, bledy: [] };
  function nowePytanie() {
    const zrodlo = widok() === 'reakcja' ? zDialogiem().filter(z => z.kiedy) : zDialogiem();
    if (zrodlo.length < 4) { tresc.innerHTML = '<p class="pusto-duze">Za mało zwrotów z dialogami w tym zakresie. Wybierz „Wszystkie dostępne”.</p>'; return; }
    const x = zrodlo[Math.floor(Math.random() * zrodlo.length)];
    const pole = widok() === 'reakcja' ? 'es' : 'luka';
    const inne = tasuj(ZWROTY_LISTA.filter(y => y.id !== x.id && y.dialog.length && y[pole] !== x[pole]))
      .sort((a, b) => (b.t === x.t) - (a.t === x.t)).slice(0, 3);
    C.pyt = { x, pole, opcje: tasuj([x, ...inne]), odp: false };
    const tresPytania = widok() === 'reakcja'
      ? `<p class="etykieta">Sytuacja</p><p class="sytuacja">${esc(x.kiedy)}</p><p class="male">Co powiesz?</p>`
      : `<p class="etykieta">Uzupełnij dialog</p><div class="dialog">${x.dialog.map(l => `<p class="kwestia kwestia--${l.kto === 'A' ? 'a' : 'b'}"><span>${l.kto}</span>${esc(l.tekst).replace(/\*[^*]+\*/, '<span class="luka">_____</span>')}</p>`).join('')}</div>`;
    tresc.innerHTML = `<div class="cwiczenie">
      <div class="sesja-pasek"><div class="postep"><i style="width:${(C.nr % 10) * 10}%"></i></div><span>Pytanie ${C.nr % 10 + 1} z 10 · dobrze ${C.dobrze}</span></div>
      ${tresPytania}
      <div class="opcje">${C.pyt.opcje.map((y, i) => `<button type="button" class="opcja" data-z="${esc(y.id)}"><kbd>${i + 1}</kbd><span>${esc(bezGwiazdek(y[pole]))}</span></button>`).join('')}</div>
      <div class="wynik" data-wynik hidden></div></div>`;
  }
  function odpowiedz(id) {
    if (!C.pyt || C.pyt.odp) return;
    const { x } = C.pyt, ok = id === x.id;
    C.pyt.odp = true;
    tresc.querySelectorAll('[data-z]').forEach(b => { b.disabled = true; if (b.dataset.z === x.id) b.classList.add('ok'); else if (b.dataset.z === id) b.classList.add('zle'); });
    if (ok) C.dobrze++; else C.bledy.push(x);
    app.ocen(x.id, ok ? 3 : 1);
    const w = $('[data-wynik]', tresc);
    w.hidden = false; w.className = 'wynik wynik--' + (ok ? 'ok' : 'zle');
    w.innerHTML = `${ok ? '¡Correcto!' : 'Poprawna odpowiedź:'} <b>${esc(x.es)}</b> – ${esc(x.pl)} <span class="chip chip--${x.reg}">${REJESTR[x.reg]}</span>
      <div class="dialog">${x.dialog.map(l => `<p class="kwestia kwestia--${l.kto === 'A' ? 'a' : 'b'}"><span>${l.kto}</span>${podswietl(l.tekst)}</p>`).join('')}</div>
      <button type="button" class="btn btn--akcent btn--szeroki" data-dalej-z>${(C.nr + 1) % 10 === 0 ? 'Zobacz wynik' : 'Dalej'} <kbd>Enter</kbd></button>`;
    app.mowa.powiedz(bezGwiazdek(x.luka || x.es));
  }
  function dalej() {
    C.nr++;
    if (C.nr % 10 === 0) {
      const bl = C.bledy.splice(0);
      tresc.innerHTML = `<div class="podsumowanie"><p class="etykieta">Wynik</p><div class="liczby"><div><b>${C.dobrze}/10</b><span>poprawnych</span></div></div>
        ${bl.length ? `<ul class="lista lista--zwarta">${bl.map(x => `<li><div class="lista-tekst"><b>${esc(x.es)}</b><span>${esc(x.pl)}</span></div>${przyciskGlosu(x.es)}</li>`).join('')}</ul>` : '<p class="srodek">Wszystko dobrze!</p>'}
        <button type="button" class="btn btn--akcent btn--szeroki" data-znowu-z>Kolejne 10 pytań</button></div>`;
      C.dobrze = 0; app.odswiez(); return;
    }
    nowePytanie();
  }

  function pokaz() {
    rysujWidoki();
    const w = widok();
    if (w === 'przeglad') przeglad();
    else if (w === 'fiszki') silnik.start();
    else { C.nr = 0; C.dobrze = 0; C.bledy = []; nowePytanie(); }
  }

  sel.addEventListener('change', () => { ui.zKat = sel.value; app.zapisz(); pokaz(); lista.rysuj(); });
  root.addEventListener('click', e => {
    const w = e.target.closest('[data-widok]');
    if (w) { ui.zWidok = w.dataset.widok; app.zapisz(); pokaz(); return; }
    const o = e.target.closest('[data-z]'); if (o) return odpowiedz(o.dataset.z);
    if (e.target.closest('[data-dalej-z]')) return dalej();
    if (e.target.closest('[data-znowu-z]')) { C.nr = 0; C.bledy = []; nowePytanie(); }
  });

  return {
    poziom() { rysujKategorie(); pokaz(); lista.rysuj(); },
    odswiezListe: () => lista.rysuj(),
    klawisz(e) {
      if (widok() === 'fiszki') return silnik.klawisz(e);
      if (widok() === 'reakcja' || widok() === 'dialog') {
        const n = parseInt(e.key, 10);
        if (n >= 1 && n <= 4 && C.pyt && !C.pyt.odp) { const b = tresc.querySelectorAll('[data-z]')[n - 1]; if (b) odpowiedz(b.dataset.z); return true; }
        if (e.key === 'Enter') { const b = tresc.querySelector('[data-dalej-z], [data-znowu-z]'); if (b) { b.click(); return true; } }
      }
      return false;
    },
  };
}
