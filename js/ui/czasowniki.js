// Zakładka „Czasowniki”: tabela odmiany z podświetleniem końcówek i nieregularności + drill zdań z luką.
import { $, esc, przyciskGlosu, przyciskGwiazdki } from './wspolne.js';
import { utworzListe } from './lista.js';
import { CZAS, POZIOMY } from '../dane/index.js';
import { CZASY, OSOBY, OSOBY_ROZKAZ, GRUPY, formy, czesciFormy, regula, zwrotny } from '../odmiana.js';
import { czasyNaPoziomie, ZDANIA, PODMIOTY, BEZ_DRILLU } from '../dane/czasowniki.js';
import { budujKolejke, doPowtorki } from '../srs.js';
import { sprawdz, komunikat, ocenaZWyniku, tasuj, losowy, czysc } from '../tekst.js';

const NAZWA_GRUPY = Object.fromEntries(GRUPY);
const czasNazwa = k => CZASY.find(c => c.k === k).n;

export function zakladkaCzasowniki(root, app) {
  const ui = app.stan.ui, ust = () => app.stan.ust;
  root.innerHTML = `
    <div class="seg seg--pelny" role="group" aria-label="Widok" id="c-widoki">
      <button type="button" data-cw="tabela">Tabela odmiany</button><button type="button" data-cw="drill">Drill odmian i zdań</button>
    </div>
    <div id="c-tabela"></div>
    <div id="c-drill" hidden></div>`;
  const tab = $('#c-tabela', root), drill = $('#c-drill', root);
  const widok = () => ui.cWidok || 'tabela';
  const doPoziomu = v => POZIOMY.indexOf(v.p) <= POZIOMY.indexOf(ui.poziom);
  const wGrupie = v => !ui.cGrupa || (ui.cGrupa === 'zwrotny' ? zwrotny(v) : v.grupa === ui.cGrupa);
  const osoby = () => [0, 1, 2, 3, 4, 5].filter(i => !(ust().bezVosotros && i === 4));

  // ---------- TABELA ----------
  tab.innerHTML = `
    <div class="wiersz">
      <label class="wybor"><span>Grupa</span><select class="pole" id="c-grupa" aria-label="Rodzaj czasowników">${GRUPY.map(([k, n]) => `<option value="${k}">${n}</option>`).join('')}</select></label>
    </div>
    <div class="szukaj">
      <input class="pole" id="c-szukaj" type="search" list="c-podpowiedzi" placeholder="Czasownik, np. tener albo „mieć”" autocomplete="off" autocapitalize="off" spellcheck="false" data-znaki aria-label="Szukaj czasownika">
      <datalist id="c-podpowiedzi"></datalist>
      <button type="button" class="btn btn--male" id="c-losuj">Losuj</button>
    </div>
    <div class="czas-naglowek" id="c-naglowek"></div>
    <div class="czasy" id="c-czasy" role="tablist" aria-label="Czas"></div>
    <p class="male" id="c-opis"></p>
    <div class="tabela-ramka"><table class="tabela" id="c-tab"></table></div>
    <p class="legenda"><span class="f-temat">temat</span> <span class="f-konc">końcówka</span> <span class="f-zmiana">nieregularność / zmiana</span></p>
    <div id="c-lista"></div>`;
  $('#c-podpowiedzi', tab).innerHTML = CZAS.map(v => `<option value="${esc(v.inf)}">${esc(v.pl)}</option>`).join('');
  const pulaTabeli = () => CZAS.filter(v => wGrupie(v));
  let V = CZAS.find(v => v.inf === (ui.cVerb || 'tener')) || CZAS[0];
  const lista = utworzListe($('#c-lista', tab), {
    id: 'c-lista-szuflada', app, tytul: 'Lista czasowników', pobierz: () => pulaTabeli().filter(doPoziomu),
    opis: v => `${esc(v.pl)} <i>· ${NAZWA_GRUPY[v.grupa] || ''} · ${v.p}</i>`, mow: v => v.inf,
    cwicz: v => { pokazCzasownik(v); tab.scrollIntoView({ behavior: 'smooth', block: 'start' }); },
  });

  function pokazCzasownik(v) {
    V = v; ui.cVerb = v.inf; app.zapisz();
    const f = formy(v);
    $('#c-naglowek', tab).innerHTML = `
      <div class="czas-tytul"><h2>${esc(v.inf)}</h2><span>${przyciskGlosu(v.inf)}${przyciskGwiazdki(v.id, app.stan.ulub[v.id])}</span></div>
      <p>${esc(v.pl)}</p>
      <div class="chipy"><span class="chip">${NAZWA_GRUPY[v.grupa] || ''}</span>${zwrotny(v) ? '<span class="chip">zwrotny</span>' : ''}<span class="chip">poziom ${v.p}</span></div>
      <p class="male">gerundio: <b>${esc(f.ger)}</b> · participio: <b>${esc(f.part)}</b></p>`;
    rysujTabele();
  }
  function rysujTabele() {
    const czas = ui.cCzas || 'presente';
    $('#c-czasy', tab).innerHTML = CZASY.map(c => `<button type="button" role="tab" data-czas="${c.k}" aria-selected="${c.k === czas}" class="${czasyNaPoziomie(ui.poziom).includes(c.k) ? '' : 'ponad'}">${esc(c.n)}</button>`).join('');
    const c = CZASY.find(x => x.k === czas);
    const f = formy(V)[czas];
    $('#c-opis', tab).textContent = `${c.n} – ${c.pl}. ${c.o}${czasyNaPoziomie(ui.poziom).includes(czas) ? '' : ' (materiał z wyższego poziomu)'}`;
    if (!f) { $('#c-tab', tab).innerHTML = '<tr><td>Ten czasownik nie ma tej formy (np. czasowniki bezosobowe nie mają trybu rozkazującego).</td></tr>'; return; }
    const rozkaz = czas.startsWith('imperativo');
    $('#c-tab', tab).innerHTML = osoby().filter(i => f[i]).map(i => {
      const os = rozkaz ? OSOBY_ROZKAZ[i] : OSOBY[i];
      const html = czesciFormy(V, czas, i, f[i]).map(p => `<span class="f-${p.k}">${esc(p.t)}</span>`).join('');
      return `<tr><th scope="row">${esc(os[0])}<small>${esc(os[1])}</small></th><td class="forma">${html}</td><td>${przyciskGlosu(f[i])}</td></tr>`;
    }).join('');
  }
  function szukaj() {
    const q = czysc($('#c-szukaj', tab).value); if (!q) return;
    const v = CZAS.find(x => x.inf === q) || CZAS.find(x => czysc(x.inf) === q) || CZAS.find(x => x.pl.split(/[,(]/).some(p => czysc(p) === q)) || CZAS.find(x => czysc(x.pl).includes(q));
    if (v) { pokazCzasownik(v); $('#c-szukaj', tab).blur(); }
  }
  $('#c-szukaj', tab).addEventListener('change', szukaj);
  $('#c-szukaj', tab).addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); szukaj(); } });
  $('#c-losuj', tab).addEventListener('click', () => { const p = pulaTabeli().filter(doPoziomu); pokazCzasownik(losowy(p.length ? p : CZAS)); });
  $('#c-grupa', tab).addEventListener('change', e => { ui.cGrupa = e.target.value; app.zapisz(); lista.rysuj(); if (!wGrupie(V)) { const p = pulaTabeli().filter(doPoziomu); if (p.length) pokazCzasownik(p[0]); } });
  $('#c-czasy', tab).addEventListener('click', e => { const b = e.target.closest('[data-czas]'); if (!b) return; ui.cCzas = b.dataset.czas; app.zapisz(); rysujTabele(); });

  // ---------- DRILL ----------
  const D = { kolejka: [], nr: 0, dobrze: 0, bledy: [], pyt: null, ile: 10 };
  const czasyDrillu = () => (ui.dCzasy && ui.dCzasy.length ? ui.dCzasy : czasyNaPoziomie(ui.poziom)).filter(k => czasyNaPoziomie(ui.poziom).includes(k));
  function ustawieniaDrillu() {
    const dost = czasyNaPoziomie(ui.poziom), wybr = czasyDrillu();
    return `<div class="drill-ust">
      <p class="etykieta">Czasy w drillu</p>
      <div class="pigulki" role="group" aria-label="Czasy">${dost.map(k => `<button type="button" class="pigulka" data-dczas="${k}" aria-pressed="${wybr.includes(k)}">${esc(czasNazwa(k))}</button>`).join('')}</div>
      <div class="wiersz">
        <label class="wybor"><span>Grupa</span><select class="pole" id="d-grupa">${GRUPY.map(([k, n]) => `<option value="${k}"${k === (ui.cGrupa || '') ? ' selected' : ''}>${n}</option>`).join('')}</select></label>
        <div class="seg" role="group" aria-label="Sposób odpowiedzi"><button type="button" data-dtryb="wpisz" aria-pressed="${(ui.dTryb || 'wpisz') === 'wpisz'}">Wpisz</button><button type="button" data-dtryb="wybor" aria-pressed="${ui.dTryb === 'wybor'}">Wybierz</button></div>
      </div></div>`;
  }
  function startDrill(wlasne = null) {
    const pula = CZAS.filter(v => doPoziomu(v) && wGrupie(v) && !BEZ_DRILLU.has(v.inf.replace(/se$/, '')) && !BEZ_DRILLU.has(v.inf));
    if (wlasne) D.kolejka = wlasne.slice();
    else {
      const zal = pula.filter(v => doPowtorki(app.stan.srs[v.id])).length;
      const ids = budujKolejke(pula.map(v => v.id), app.stan.srs, { rozmiar: D.ile, nowych: Math.max(5, D.ile - zal) });
      const czasy = czasyDrillu();
      D.kolejka = ids.map(id => {
        const v = app.dane.get(id), czas = losowy(czasy);
        const dostOs = czas.startsWith('imperativo') ? osoby().filter(i => i > 0) : osoby();
        return { v, czas, i: losowy(dostOs), wzor: losowy(ZDANIA[czas]) };
      });
    }
    D.nr = 0; D.dobrze = 0; D.bledy = [];
    if (!D.kolejka.length) { drill.innerHTML = ustawieniaDrillu() + '<p class="pusto-duze">Brak czasowników w tym wyborze. Zmień grupę lub poziom.</p>'; return; }
    pytanie();
  }
  function zdanie(p, forma) {
    const pod = p.czas.startsWith('imperativo') ? '' : PODMIOTY[p.i];
    let s = p.wzor[0].replace('{S}', pod).replace(/\s+/g, ' ').replace(/^ /, '');
    s = s.charAt(0) === '¡' ? s : s.charAt(0).toUpperCase() + s.slice(1);
    return forma === undefined ? s : s.replace('___', forma);
  }
  function pytanie() {
    const p = D.kolejka[D.nr];
    const f = formy(p.v)[p.czas];
    if (!f || !f[p.i]) { D.kolejka.splice(D.nr, 1); if (D.nr >= D.kolejka.length) return koniec(); return pytanie(); }
    p.odp = f[p.i]; p.zrobione = false;
    const os = p.czas.startsWith('imperativo') ? OSOBY_ROZKAZ[p.i] : OSOBY[p.i];
    const tekst = zdanie(p);
    let opcje = '';
    if ((ui.dTryb || 'wpisz') === 'wybor') {
      const pule = new Set();
      for (const k of czasyDrillu()) { const ff = formy(p.v)[k]; if (ff) ff.forEach((x, j) => { if (x && x !== p.odp && (j !== 4 || !ust().bezVosotros)) pule.add(x); }); }
      p.opcje = tasuj([p.odp, ...tasuj([...pule]).slice(0, 3)]);
      opcje = `<div class="opcje">${p.opcje.map((o, i) => `<button type="button" class="opcja" data-dopc="${esc(o)}"><kbd>${i + 1}</kbd><span>${esc(o)}</span></button>`).join('')}</div>`;
    }
    drill.innerHTML = `${ustawieniaDrillu()}
      <div class="sesja-pasek"><div class="postep"><i style="width:${100 * D.nr / D.kolejka.length}%"></i></div><span>Zdanie ${D.nr + 1} z ${D.kolejka.length} · dobrze ${D.dobrze}</span></div>
      <div class="drill-karta">
        <div class="chipy"><span class="chip chip--akcent">${esc(czasNazwa(p.czas))}</span><span class="chip">${esc(os[0])} (${esc(os[1])})</span></div>
        <p class="drill-zdanie">${esc(tekst).replace('___', '<span class="luka">_____</span>')}</p>
        <p class="male"><b>${esc(p.v.inf)}</b> – ${esc(p.v.pl)}${zwrotny(p.v) ? ' · podaj formę z zaimkiem (me, te, se…)' : ''}</p>
      </div>
      ${opcje || `<form class="pole-odp" id="d-form" autocomplete="off">
        <input class="pole" id="d-wpis" type="text" placeholder="wpisz formę" autocapitalize="off" autocorrect="off" spellcheck="false" data-znaki lang="es" aria-label="Forma czasownika">
        <button type="submit" class="btn btn--akcent" id="d-sprawdz">Sprawdź</button></form>`}
      <div class="wynik" id="d-wynik" hidden></div>`;
    if (!opcje && matchMedia('(pointer: fine)').matches) setTimeout(() => { const i = $('#d-wpis', drill); if (i) i.focus(); }, 30);
  }
  function ocenOdpowiedz(wpis) {
    const p = D.kolejka[D.nr];
    if (p.zrobione) return nastepne();
    let r = sprawdz(wpis, [p.odp]);
    // forma zwrotna bez zaimka: zaliczamy z uwagą
    if (r.wynik === 'zle' && zwrotny(p.v)) {
      const bez = p.odp.replace(/^(no )?(me|te|se|nos|os) /, '$1');
      if (czysc(wpis) === czysc(bez)) r = { wynik: 'rodzajnik', wzor: p.odp, akcenty: [] };
    }
    p.zrobione = true;
    const ok = r.wynik !== 'zle';
    if (ok) D.dobrze++; else D.bledy.push(p);
    app.ocen(p.v.id, ocenaZWyniku(r.wynik));
    const msg = r.wynik === 'rodzajnik' && zwrotny(p.v) ? `Dobrze, ale pamiętaj o zaimku: ${p.odp}` : komunikat(r, p.odp);
    const pelne = zdanie(p, p.odp);
    const w = $('#d-wynik', drill);
    w.hidden = false; w.className = 'wynik wynik--' + (r.wynik === 'dobrze' ? 'ok' : ok ? 'uwaga' : 'zle');
    w.innerHTML = `<p>${esc(msg)}</p>
      <p class="drill-pelne">${esc(pelne)} ${przyciskGlosu(pelne, 'Posłuchaj zdania')}</p>
      <p class="regula"><b>Reguła:</b> ${esc(regula(p.v, p.czas))}</p>
      <p class="forma-podzial">${czesciFormy(p.v, p.czas, p.i, p.odp).map(c => `<span class="f-${c.k}">${esc(c.t)}</span>`).join('')}</p>
      <button type="button" class="btn btn--akcent btn--szeroki" id="d-dalej">${D.nr + 1 >= D.kolejka.length ? 'Zobacz wynik' : 'Dalej'} <kbd>Enter</kbd></button>`;
    const s = $('#d-sprawdz', drill); if (s) s.textContent = 'Dalej';
    drill.querySelectorAll('[data-dopc]').forEach(b => { b.disabled = true; if (b.dataset.dopc === p.odp) b.classList.add('ok'); else if (b.dataset.dopc === wpis) b.classList.add('zle'); });
    if (ust().auto) app.mowa.powiedz(pelne);
  }
  function nastepne() { D.nr++; if (D.nr >= D.kolejka.length) koniec(); else pytanie(); }
  function koniec() {
    const proc = D.kolejka.length ? Math.round(100 * D.dobrze / D.kolejka.length) : 0;
    drill.innerHTML = `${ustawieniaDrillu()}<div class="podsumowanie"><p class="etykieta">Wynik drillu</p>
      <div class="liczby"><div><b>${D.dobrze}/${D.kolejka.length}</b><span>poprawnych</span></div><div><b>${proc}%</b><span>skuteczność</span></div></div>
      ${D.bledy.length ? `<p class="etykieta">Do poprawy</p><ul class="lista lista--zwarta">${D.bledy.map(p => `<li><div class="lista-tekst"><b>${esc(p.odp)}</b><span>${esc(p.v.inf)} · ${esc(czasNazwa(p.czas))} · ${esc((p.czas.startsWith('imperativo') ? OSOBY_ROZKAZ : OSOBY)[p.i][0])}</span></div>${przyciskGlosu(p.odp)}</li>`).join('')}</ul>` : '<p class="srodek">Bezbłędnie! ¡Muy bien!</p>'}
      <div class="akcje-pion">${D.bledy.length ? '<button type="button" class="btn btn--akcent btn--szeroki" id="d-bledne">Ćwicz tylko błędne</button>' : ''}<button type="button" class="btn btn--szeroki" id="d-nowy">Nowy drill</button></div></div>`;
    app.odswiez();
  }
  drill.addEventListener('submit', e => { e.preventDefault(); ocenOdpowiedz($('#d-wpis', drill).value); });
  drill.addEventListener('click', e => {
    const t = e.target;
    const dc = t.closest('[data-dczas]');
    if (dc) {
      let w = czasyDrillu().slice();
      w = w.includes(dc.dataset.dczas) ? w.filter(k => k !== dc.dataset.dczas) : [...w, dc.dataset.dczas];
      ui.dCzasy = w.length ? w : [dc.dataset.dczas]; app.zapisz(); startDrill(); return;
    }
    const dt = t.closest('[data-dtryb]'); if (dt) { ui.dTryb = dt.dataset.dtryb; app.zapisz(); startDrill(); return; }
    const o = t.closest('[data-dopc]'); if (o) return ocenOdpowiedz(o.dataset.dopc);
    if (t.closest('#d-dalej')) return nastepne();
    if (t.closest('#d-bledne')) return startDrill(D.bledy.map(p => ({ ...p, zrobione: false })));
    if (t.closest('#d-nowy')) return startDrill();
  });
  drill.addEventListener('change', e => { if (e.target.id === 'd-grupa') { ui.cGrupa = e.target.value; $('#c-grupa', tab).value = ui.cGrupa; app.zapisz(); startDrill(); } });

  function pokazWidok() {
    root.querySelectorAll('[data-cw]').forEach(b => b.setAttribute('aria-pressed', b.dataset.cw === widok()));
    tab.hidden = widok() !== 'tabela'; drill.hidden = widok() !== 'drill';
    if (widok() === 'drill') startDrill();
  }
  root.querySelector('#c-widoki').addEventListener('click', e => { const b = e.target.closest('[data-cw]'); if (!b) return; ui.cWidok = b.dataset.cw; app.zapisz(); pokazWidok(); });

  return {
    pokaz(inf) { const v = CZAS.find(x => x.inf === inf); if (v) { pokazCzasownik(v); tab.scrollIntoView({ block: 'start' }); } },
    poziom() {
      $('#c-grupa', tab).value = ui.cGrupa || '';
      if (!czasyNaPoziomie(ui.poziom).includes(ui.cCzas || 'presente') && !ui.cCzas) ui.cCzas = 'presente';
      pokazCzasownik(V); lista.rysuj(); pokazWidok();
    },
    odswiezListe: () => { lista.rysuj(); rysujTabele(); },
    klawisz(e) {
      if (widok() !== 'drill' || !D.kolejka.length) return false;
      const p = D.kolejka[D.nr]; if (!p) { if (e.key === 'Enter') { startDrill(); return true; } return false; }
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= 4 && p.opcje && !p.zrobione) { const b = drill.querySelectorAll('[data-dopc]')[n - 1]; if (b) ocenOdpowiedz(b.dataset.dopc); return true; }
      if (e.key === 'Enter' && p.zrobione) { nastepne(); return true; }
      if (e.key === ' ' && p.zrobione) { app.mowa.powiedz(zdanie(p, p.odp)); return true; }
      return false;
    },
  };
}
