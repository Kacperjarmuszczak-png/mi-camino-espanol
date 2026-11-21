// Dział „Ćwiczenia”: wyszukiwarka globalna, kafelki ćwiczeń i widoki szczegółowe (każdy w osobnym module).
// Otwierany z górnej kapsuły; dolny dock zostaje z 4 ikonami.
import { $, esc, przyciskGlosu, przyciskGwiazdki, otworzModal, zamknijModal, sygnalModalu } from './wspolne.js';
import { HISP, t as tr } from '../jezyk.js';
import { SLOWKA, CZAS, ZWROTY_LISTA, POD_ID, POZIOMY } from '../dane/index.js';
import { LEKCJE } from '../dane/lekcje-gramatyki.js';
import { CZYTANIE } from '../dane/czytanie.js';
import { CZYTANIE_PL } from '../dane/czytanie-pl.js';
import { pasuje, czysc, bezZnakow, bezRodzajnika } from '../tekst.js';
import { szukajWSlowniku, ZRODLO_SLOWNIKA } from '../slownik.js';
import { dodajWlasne } from '../wlasne.js';
import { CEL } from '../jezyk.js';
import { przyciskZgloszenia } from './zgloszenia.js';

/**
 * @param {HTMLElement} root
 * @param {object} app
 * @param {{ kafelki: {id: string, ikona: string, n: string, o: string, widok?: (el, app, ctx) => {pokaz: Function, klawisz?: Function}, akcja?: Function, ukryj?: boolean}[], pasekXp: () => string }} cfg
 */
export function zakladkaCwiczenia(root, app, cfg) {
  const ui = app.stan.ui;
  const widoki = {};
  root.innerHTML = `<div class="cw-hub" id="cw-hub"></div><div class="cw-widok" id="cw-widok" hidden>
    <button type="button" class="cw-wstecz" data-cw-wstecz>← ${tr('Ćwiczenia', 'Práctica')}</button><div id="cw-tresc"></div></div>`;
  const hub = $('#cw-hub', root), widokEl = $('#cw-widok', root), tresc = $('#cw-tresc', root);
  const kafelki = () => cfg.kafelki.filter(k => !k.ukryj);
  let aktywny = null;

  function rysujHub() {
    hub.innerHTML = `
      <div class="szukaj cw-szukaj"><input class="pole" type="search" id="cw-q" placeholder="${tr('Szukaj: słowo, zwrot, czasownik, tekst…', 'Buscar: palabra, frase, verbo, texto…')}" autocomplete="off" spellcheck="false" aria-label="${tr('Szukaj wszędzie', 'Buscar en todo')}"></div>
      <div id="cw-wyniki" hidden></div>
      <div id="cw-kafle-wrap">${cfg.pasekXp()}
      ${(cfg.grupy || [['', '']]).map(([g, nazwa]) => { const l = kafelki().filter(k => (k.grupa || '') === g); return l.length ? `${nazwa ? `<p class="etykieta cw-grupa">${esc(nazwa)}</p>` : ''}<div class="cw-kafle">${l.map(k => `<button type="button" class="cw-kafel" data-cwk="${k.id}"><span class="cw-ik" aria-hidden="true">${k.ikona}</span><b>${esc(k.n)}</b><small>${esc(k.o)}</small></button>`).join('')}</div>` : ''; }).join('')}</div>`;
  }
  function otworz(id, arg) {
    const k = cfg.kafelki.find(x => x.id === id); if (!k) return;
    if (k.akcja) { k.akcja(arg); return; }
    aktywny = id; ui.cwWidok = id; app.zapisz();
    hub.hidden = true; widokEl.hidden = false;
    if (!widoki[id]) { const el = document.createElement('div'); el.dataset.cwv = id; tresc.append(el); widoki[id] = { el, w: k.widok(el, app, ctx) }; }
    Object.entries(widoki).forEach(([kk, v]) => { v.el.hidden = kk !== id; });
    widoki[id].w.pokaz(arg);
    scrollTo({ top: 0 });
  }
  function wroc() { aktywny = null; ui.cwWidok = ''; app.zapisz(); widokEl.hidden = true; hub.hidden = false; rysujHub(); }
  const ctx = { otworz, wroc, cwicz: l => cfg.cwicz(l), kafel: id => cfg.kafelki.find(k => k.id === id) };

  // --- wyszukiwarka globalna ---
  const TEKSTY = HISP ? CZYTANIE_PL : CZYTANIE;
  function szukaj(q) {
    const wyn = $('#cw-wyniki', root), kafle = $('#cw-kafle-wrap', root);
    if (q.trim().length < 2) { wyn.hidden = true; kafle.hidden = false; return; }
    const n = s => bezZnakow(bezRodzajnika(czysc(s || '')));
    const qq = n(q);
    const ocena = x => Math.min(...[x.es, ...String(x.pl).split(/[,/]/)].map(s => { const v = n(s); return v === qq ? 0 : v.startsWith(qq) ? 1 : v.includes(qq) ? 2 : 3; }));
    const lim = (l, ile) => l.map(x => [ocena(x), x]).sort((a, b) => a[0] - b[0]).slice(0, ile).map(p => p[1]);
    const slowa = lim(SLOWKA.filter(x => pasuje(q, x.es, x.pl)), 12);
    const zwr = lim(ZWROTY_LISTA.filter(x => pasuje(q, x.es, x.pl)), 8);
    const cz = lim(CZAS.filter(x => pasuje(q, x.es, x.pl)), 6);
    const tek = TEKSTY.map((x, i) => ({ ...x, i })).filter(x => pasuje(q, x.tekst)).slice(0, 4);
    const lek = HISP ? [] : LEKCJE.filter(l => pasuje(q, l.t, l.regula.join(' '))).slice(0, 4);
    const grupa = (n, l, f) => l.length ? `<p class="etykieta">${n} <span class="male">(${l.length})</span></p><ul class="lista lista--zwarta">${l.map(f).join('')}</ul>` : '';
    const poz = x => `<li><button type="button" class="lista-tekst" data-sz="${esc(x.id)}"><b>${esc(x.es)}</b><span>${esc(x.pl)} <i>· ${x.p}</i></span></button>${przyciskGlosu(x.es)}${przyciskGwiazdki(x.id, app.stan.ulub[x.id])}</li>`;
    const html = grupa(tr('Słówka', 'Palabras'), slowa, poz) + grupa(tr('Zwroty', 'Frases'), zwr, poz)
      + grupa(tr('Czasowniki', 'Verbos'), cz, x => `<li><button type="button" class="lista-tekst" data-szv="${esc(x.inf)}"><b>${esc(x.es)}</b><span>${esc(x.pl)} <i>· ${x.p}</i></span></button>${przyciskGlosu(x.es)}</li>`)
      + grupa(tr('Teksty', 'Textos'), tek, x => `<li><button type="button" class="lista-tekst" data-szt="${x.i}"><b>${x.p}</b><span>${esc(x.tekst.slice(0, 90))}…</span></button></li>`)
      + grupa(tr('Gramatyka', 'Gramática'), lek, l => `<li><button type="button" class="lista-tekst" data-szl="${l.id}"><b>${esc(l.t)}</b><span>${l.p}</span></button></li>`);
    wyn.innerHTML = `<div data-sz-slownik></div>` + (html || `<p class="pusto" data-sz-pusto>${tr('Nic nie znaleziono w materiałach aplikacji.', 'No se encontró nada en los materiales.')}</p>`);
    // słownik aplikacji (z formami odmienionymi): w języku nauki i – gdy nic – w języku użytkownika
    const zap = q.trim();
    if (/^[\p{L}]+$/u.test(zap)) {
      (async () => {
        let r = await szukajWSlowniku(zap, CEL), odwr = false;
        if (!r) { r = await szukajWSlowniku(zap, CEL === 'es' ? 'pl' : 'es'); odwr = !!r; }
        const box = $('[data-sz-slownik]', root);
        if (!r || !box || $('#cw-q', root).value.trim() !== zap) return;
        const cel = odwr ? r.tlum[0] : r.haslo, moj = odwr ? r.haslo : r.tlum.slice(0, 3).join(', ');
        box.innerHTML = `<p class="etykieta">${tr('Słownik ogólny', 'Diccionario general')}</p><div class="tlumaczenie tlumaczenie--slownik">
          <p class="tlumaczenie-tekst">${esc(odwr ? r.haslo : r.haslo)} → ${esc(r.tlum.join(', '))} ${przyciskGlosu(cel)}</p>
          ${r.opis ? `<p class="male">${esc(r.opis)}: ${esc(r.haslo)}</p>` : ''}${r.przybl ? `<p class="male">${tr('Przybliżone przez angielski', 'Aproximado vía inglés')}${r.ang ? ` (${esc(r.ang)})` : ''}.</p>` : ''}
          <button type="button" class="btn btn--male" data-sz-dodaj="${esc(cel)}|${esc(moj)}">+ ${tr('Dodaj do moich słówek', 'Añadir a mis palabras')}</button>
          <p class="male">${tr('Źródło', 'Fuente')}: ${ZRODLO_SLOWNIKA}</p></div>`;
        const p = $('[data-sz-pusto]', root); if (p) p.remove();
      })();
    }
    wyn.hidden = false; kafle.hidden = true;
  }
  function pokazPozycje(x) {
    const el = otworzModal(x.es, `<div class="arkusz">
      <p class="pytanie-sr">${esc(x.es)} ${przyciskGlosu(x.es)}</p><p class="srodek">${esc(x.pl)}</p>
      ${x.przyklad ? `<div class="przyklad"><p class="przyklad-es">${esc(x.przyklad.es.replace(/\*/g, ''))}</p><p class="przyklad-pl">${esc(x.przyklad.pl.replace(/\*/g, ''))}</p></div>` : ''}
      <p class="male">${esc(x.t || '')} · ${x.p}</p>
      ${przyciskZgloszenia(x.id)}
      <button type="button" class="btn btn--akcent btn--szeroki" data-sz-cwicz>${tr('Ćwicz to słowo', 'Practicar')}</button></div>`);
    el.addEventListener('click', e => { if (e.target.closest('[data-sz-cwicz]')) { zamknijModal(); cfg.cwicz([x]); } }, { signal: sygnalModalu() });
  }

  root.addEventListener('input', e => { if (e.target.id === 'cw-q') szukaj(e.target.value); });
  root.addEventListener('click', e => {
    const t = e.target;
    if (t.closest('[data-cw-wstecz]')) return wroc();
    const k = t.closest('[data-cwk]'); if (k) return otworz(k.dataset.cwk);
    const s = t.closest('[data-sz]'); if (s) { const x = POD_ID.get(s.dataset.sz); if (x) pokazPozycje(x); return; }
    const v = t.closest('[data-szv]'); if (v) return app.otworzCzasownik(v.dataset.szv);
    const tx = t.closest('[data-szt]'); if (tx) return cfg.otworzTekst(+tx.dataset.szt);
    const l = t.closest('[data-szl]'); if (l) return otworz('gramatyka', l.dataset.szl);
    const d = t.closest('[data-sz-dodaj]');
    if (d) { const [es, pl] = d.dataset.szDodaj.split('|'); const x = dodajWlasne(app.stan, { es, pl, p: app.stan.ui.poziom }); app.zapisz(); app.odswiez(); d.disabled = true; d.textContent = x ? '✓ ' + tr('Dodano', 'Añadida') : tr('Już na liście', 'Ya está en la lista'); }
  });

  return {
    otworz, wroc,
    poziom() { if (aktywny && widoki[aktywny]) widoki[aktywny].w.pokaz(); else { widokEl.hidden = true; hub.hidden = false; rysujHub(); } },
    odswiezListe() { if (!aktywny) rysujHub(); },
    klawisz(e) {
      if (e.key === '/' && !aktywny) { const q = $('#cw-q', root); if (q) { q.focus(); return true; } }
      if (aktywny && widoki[aktywny] && widoki[aktywny].w.klawisz) return widoki[aktywny].w.klawisz(e);
      return false;
    },
  };
}
export { POZIOMY };
