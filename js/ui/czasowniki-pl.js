// Zakładka „Verbos” (tryb dla hiszpańskojęzycznych): tabela odmiany polskich czasowników i drill form.
// Te same identyfikatory co w module hiszpańskim (#c-widoki, #c-grupa-kapsula, #c-lista, #d-opcje), więc górna kapsuła działa bez zmian.
import { $, esc, przyciskGlosu, przyciskGwiazdki, otworzModal, zamknijModal, sygnalModalu, kapsulaOpcji } from './wspolne.js';
import { utworzListe } from './lista.js';
import { CZAS, POZIOMY } from '../dane/index.js';
import { CZASY_PL, OSOBY_PL, ASPEKT, formyPl, regulaPl, czasyNaPoziomiePl } from '../odmiana-pl.js';
import { budujKolejke, doPowtorki } from '../srs.js';
import { sprawdz, komunikat, ocenaZWyniku, tasuj, losowy, czysc } from '../tekst.js';
import { widokPrzypadkow } from './przypadki.js';

const GRUPY = [['', 'Todos'], ['ndk', 'Imperfectivos'], ['dk', 'Perfectivos'], ['zwrotny', 'Reflexivos (się)']];
const NAZWA_GRUPY = Object.fromEntries(GRUPY);
const czasNazwa = k => CZASY_PL.find(c => c.k === k).n;

export function zakladkaCzasownikiPl(root, app) {
  const ui = app.stan.ui;
  root.innerHTML = `
    <div class="seg seg--pelny" role="group" aria-label="Vista" id="c-widoki">
      <button type="button" data-cw="tabela">Conjugación</button><button type="button" data-cw="drill">Práctica</button><button type="button" data-cw="przypadki">Casos</button>
    </div>
    <div id="c-tabela"></div>
    <div id="c-drill" hidden></div>
    <div id="c-przyp" hidden></div>`;
  const tab = $('#c-tabela', root), drill = $('#c-drill', root), przypEl = $('#c-przyp', root);
  const przypadki = widokPrzypadkow(przypEl, app);
  const widok = () => ui.cWidok || 'tabela';
  const doPoziomu = v => POZIOMY.indexOf(v.p) <= POZIOMY.indexOf(ui.poziom);
  const wGrupie = v => !ui.cGrupa || (ui.cGrupa === 'zwrotny' ? v.zwrotny : v.asp === ui.cGrupa);

  // ---------- TABELA ----------
  tab.innerHTML = `
    <div class="szukaj">
      <input class="pole" id="c-szukaj" type="search" list="c-podpowiedzi" placeholder="Verbo: robić o «hacer»" autocomplete="off" autocapitalize="off" spellcheck="false" data-znaki lang="pl" aria-label="Buscar verbo">
      <datalist id="c-podpowiedzi"></datalist>
      <button type="button" class="btn btn--male" id="c-losuj">Al azar</button>
    </div>
    <div class="wiersz-narzedzi">${kapsulaOpcji('c-grupa-kapsula', '')}</div>
    <div class="czas-naglowek" id="c-naglowek"></div>
    <div class="czasy" id="c-czasy" role="tablist" aria-label="Tiempo"></div>
    <p class="male" id="c-opis"></p>
    <div class="tabela-ramka"><table class="tabela" id="c-tab"></table></div>
    <div id="c-lista"></div>`;
  $('#c-podpowiedzi', tab).innerHTML = CZAS.map(v => `<option value="${esc(v.inf)}">${esc(v.pl)}</option>`).join('');
  const pulaTabeli = () => CZAS.filter(wGrupie);
  let V = CZAS.find(v => v.inf === (ui.cVerb || 'robić')) || CZAS[0];
  const lista = utworzListe($('#c-lista', tab), {
    id: 'c-lista-szuflada', app, tytul: 'Lista de verbos', pobierz: () => pulaTabeli().filter(doPoziomu),
    opis: v => `${esc(v.pl)} <i>· ${ASPEKT[v.asp]} · ${v.p}</i>`, mow: v => v.inf,
    cwicz: v => { pokazCzasownik(v); tab.scrollIntoView({ behavior: 'smooth', block: 'start' }); },
  });

  function pokazCzasownik(v) {
    V = v; ui.cVerb = v.inf; app.zapisz();
    const para = v.para && CZAS.find(x => x.inf === v.para);
    $('#c-naglowek', tab).innerHTML = `
      <div class="czas-tytul"><h2>${esc(v.inf)}</h2><span>${przyciskGlosu(v.inf)}${przyciskGwiazdki(v.id, app.stan.ulub[v.id])}</span></div>
      <p>${esc(v.pl)}</p>
      <div class="chipy"><span class="chip">${ASPEKT[v.asp]}</span>${v.zwrotny ? '<span class="chip">reflexivo</span>' : ''}<span class="chip">nivel ${v.p}</span></div>
      ${v.para ? `<p class="male">Par de aspecto: ${para ? `<button type="button" class="link" data-para="${esc(v.para)}"><b>${esc(v.para)}</b></button>` : `<b>${esc(v.para)}</b>`} (${v.asp === 'ndk' ? 'perfectivo: acción terminada, resultado' : 'imperfectivo: proceso, costumbre'})</p>` : ''}`;
    rysujTabele();
  }
  function rysujTabele() {
    const czas = ui.cCzasPl || 'ter';
    const dost = czasyNaPoziomiePl(ui.poziom);
    $('#c-czasy', tab).innerHTML = CZASY_PL.map(c => `<button type="button" role="tab" data-czas="${c.k}" aria-selected="${c.k === czas}" class="${dost.includes(c.k) ? '' : 'ponad'}">${esc(c.n)}</button>`).join('');
    const c = CZASY_PL.find(x => x.k === czas);
    $('#c-opis', tab).textContent = `${c.n}: ${c.o}${dost.includes(czas) ? '' : ' (contenido de un nivel superior)'}`;
    const f = formyPl(V)[czas];
    if (!f) {
      $('#c-tab', tab).innerHTML = `<tr><td>${czas === 'ter' ? `Los verbos perfectivos no tienen presente: su forma «presente» expresa futuro (mira la pestaña Futuro).${V.para ? ` Para el presente usa ${esc(V.para)}.` : ''}` : 'Este verbo casi no se usa en imperativo.'}</td></tr>`;
      return;
    }
    $('#c-tab', tab).innerHTML = [0, 1, 2, 3, 4, 5].filter(i => f[i]).map(i => `<tr><th scope="row">${esc(OSOBY_PL[i][0])}<small>${esc(OSOBY_PL[i][1])}</small></th><td class="forma">${esc(f[i])}</td><td>${przyciskGlosu(f[i].split(' / ')[0])}</td></tr>`).join('')
      + `<tr><td colspan="3" class="male">${esc(regulaPl(V, czas))}</td></tr>`;
  }
  function szukaj() {
    const q = czysc($('#c-szukaj', tab).value); if (!q) return;
    const v = CZAS.find(x => czysc(x.inf) === q) || CZAS.find(x => x.pl.split(/[,(]/).some(p => czysc(p) === q)) || CZAS.find(x => czysc(x.pl).includes(q)) || CZAS.find(x => czysc(x.inf).startsWith(q));
    if (v) { pokazCzasownik(v); $('#c-szukaj', tab).blur(); }
  }
  $('#c-szukaj', tab).addEventListener('change', szukaj);
  $('#c-szukaj', tab).addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); szukaj(); } });
  $('#c-losuj', tab).addEventListener('click', () => { const p = pulaTabeli().filter(doPoziomu); pokazCzasownik(losowy(p.length ? p : CZAS)); });
  tab.addEventListener('click', e => { const b = e.target.closest('[data-para]'); if (b) { const v = CZAS.find(x => x.inf === b.dataset.para); if (v) pokazCzasownik(v); } });
  const rysujGrupe = () => { $('#c-grupa-kapsula span', tab).innerHTML = `Grupo: <b>${esc(NAZWA_GRUPY[ui.cGrupa || ''])}</b>`; };
  const pigulkiGrup = () => `<div class="pigulki pigulki--pion">${GRUPY.map(([k, n]) => `<button type="button" class="pigulka" data-cg="${k}" aria-pressed="${k === (ui.cGrupa || '')}">${esc(n)} (${CZAS.filter(v => doPoziomu(v) && (!k || (k === 'zwrotny' ? v.zwrotny : v.asp === k))).length})</button>`).join('')}</div>`;
  function ustawGrupe(k) {
    ui.cGrupa = k; app.zapisz(); rysujGrupe(); lista.rysuj();
    if (!wGrupie(V)) { const p = pulaTabeli().filter(doPoziomu); if (p.length) pokazCzasownik(p[0]); }
  }
  $('#c-grupa-kapsula', tab).addEventListener('click', () => {
    const el = otworzModal('Grupo de verbos', `<div class="arkusz">${pigulkiGrup()}<p class="male">Entre paréntesis: verbos hasta tu nivel. El aspecto es clave en polaco: imperfectivo = proceso o costumbre; perfectivo = acción completa.</p></div>`);
    el.addEventListener('click', e => { const b = e.target.closest('[data-cg]'); if (b) { ustawGrupe(b.dataset.cg); zamknijModal(); } }, { signal: sygnalModalu() });
  });
  $('#c-czasy', tab).addEventListener('click', e => { const b = e.target.closest('[data-czas]'); if (!b) return; ui.cCzasPl = b.dataset.czas; app.zapisz(); rysujTabele(); });

  // ---------- DRILL ----------
  const D = { kolejka: [], nr: 0, dobrze: 0, bledy: [], ile: 10 };
  const czasyDrillu = () => { const dost = czasyNaPoziomiePl(ui.poziom); const w = (ui.dCzasyPl || []).filter(k => dost.includes(k)); return w.length ? w : dost; };
  const ustawieniaDrillu = () => `<div class="wiersz-narzedzi drill-ust">${kapsulaOpcji('d-opcje', `<b>${esc(czasyDrillu().map(czasNazwa).join(', '))}</b> · ${(ui.dTryb || 'wpisz') === 'wpisz' ? 'escribir' : 'elegir'}`)}</div>`;
  function otworzOpcjeDrillu() {
    const tresc = () => {
      const dost = czasyNaPoziomiePl(ui.poziom), wybr = czasyDrillu();
      return `<div class="arkusz">
        <p class="etykieta">Tiempos</p>
        <div class="pigulki" role="group" aria-label="Tiempos">${dost.map(k => `<button type="button" class="pigulka" data-dczas="${k}" aria-pressed="${wybr.includes(k)}">${esc(czasNazwa(k))}</button>`).join('')}</div>
        <p class="etykieta">Respuesta</p>
        <div class="seg seg--pelny" role="group" aria-label="Respuesta"><button type="button" data-dtryb="wpisz" aria-pressed="${(ui.dTryb || 'wpisz') === 'wpisz'}">Escribir</button><button type="button" data-dtryb="wybor" aria-pressed="${ui.dTryb === 'wybor'}">Elegir entre 4</button></div>
        <p class="etykieta">Grupo de verbos</p>${pigulkiGrup()}
        <button type="button" class="btn btn--akcent btn--szeroki" data-zamknij>Listo</button></div>`;
    };
    const el = otworzModal('Ajustes de la práctica', tresc());
    el.addEventListener('click', e => {
      const t = e.target;
      const dc = t.closest('[data-dczas]');
      if (dc) {
        let w = czasyDrillu().slice();
        w = w.includes(dc.dataset.dczas) ? w.filter(k => k !== dc.dataset.dczas) : [...w, dc.dataset.dczas];
        ui.dCzasyPl = w.length ? w : [dc.dataset.dczas];
      } else if (t.closest('[data-dtryb]')) ui.dTryb = t.closest('[data-dtryb]').dataset.dtryb;
      else if (t.closest('[data-cg]')) ustawGrupe(t.closest('[data-cg]').dataset.cg);
      else return;
      app.zapisz(); el.innerHTML = tresc(); startDrill();
    }, { signal: sygnalModalu() });
  }
  function startDrill(wlasne = null) {
    const pula = CZAS.filter(v => doPoziomu(v) && wGrupie(v));
    if (wlasne) D.kolejka = wlasne.slice();
    else {
      const zal = pula.filter(v => doPowtorki(app.stan.srs[v.id])).length;
      const ids = budujKolejke(pula.map(v => v.id), app.stan.srs, { rozmiar: D.ile, nowych: Math.max(5, D.ile - zal) });
      D.kolejka = ids.map(id => {
        const v = app.dane.get(id), f = formyPl(v);
        const czasy = czasyDrillu().filter(k => f[k]);
        if (!czasy.length) return null;
        const czas = losowy(czasy);
        return { v, czas, i: losowy([0, 1, 2, 3, 4, 5].filter(i => f[czas][i])) };
      }).filter(Boolean);
    }
    D.nr = 0; D.dobrze = 0; D.bledy = [];
    if (!D.kolejka.length) { drill.innerHTML = ustawieniaDrillu() + '<p class="pusto-duze">No hay verbos con esta selección. Cambia el grupo o el nivel.</p>'; return; }
    pytanie();
  }
  function pytanie() {
    const p = D.kolejka[D.nr];
    p.odp = formyPl(p.v)[p.czas][p.i]; p.zrobione = false;
    let opcje = '';
    if ((ui.dTryb || 'wpisz') === 'wybor') {
      const pule = new Set();
      for (const k of CZASY_PL.map(c => c.k)) { const ff = formyPl(p.v)[k]; if (ff) ff.forEach(x => { if (x && x !== p.odp) pule.add(x); }); }
      p.opcje = tasuj([p.odp, ...tasuj([...pule]).slice(0, 3)]);
      opcje = `<div class="opcje">${p.opcje.map((o, i) => `<button type="button" class="opcja" data-dopc="${esc(o)}"><kbd>${i + 1}</kbd><span>${esc(o)}</span></button>`).join('')}</div>`;
    }
    drill.innerHTML = `${ustawieniaDrillu()}
      <div class="sesja-pasek"><div class="postep"><i style="width:${100 * D.nr / D.kolejka.length}%"></i></div><span>Forma ${D.nr + 1} de ${D.kolejka.length} · bien ${D.dobrze}</span></div>
      <div class="drill-karta">
        <div class="chipy"><span class="chip chip--akcent">${esc(czasNazwa(p.czas))}</span><span class="chip">${esc(OSOBY_PL[p.i][0])} (${esc(OSOBY_PL[p.i][1])})</span><span class="chip">${ASPEKT[p.v.asp]}</span></div>
        <p class="drill-zdanie">${esc(OSOBY_PL[p.i][0].split(' / ')[0])} <span class="luka">_____</span></p>
        <p class="male"><b>${esc(p.v.inf)}</b> – ${esc(p.v.pl)}${p.czas === 'prz' || p.czas === 'war' ? ' · vale la forma masculina o femenina' : ''}</p>
      </div>
      ${opcje || `<form class="pole-odp" id="d-form" autocomplete="off">
        <input class="pole" id="d-wpis" type="text" placeholder="escribe la forma" autocapitalize="off" autocorrect="off" spellcheck="false" data-znaki lang="pl" aria-label="Forma del verbo">
        <button type="submit" class="btn btn--akcent" id="d-sprawdz">Comprobar</button></form>`}
      <div class="wynik" id="d-wynik" hidden></div>`;
    if (!opcje && matchMedia('(pointer: fine)').matches) setTimeout(() => { const i = $('#d-wpis', drill); if (i) i.focus(); }, 30);
  }
  function ocenOdpowiedz(wpis) {
    const p = D.kolejka[D.nr];
    if (p.zrobione) return nastepne();
    const r = sprawdz(wpis, [p.odp]);
    p.zrobione = true;
    const ok = r.wynik !== 'zle';
    if (ok) D.dobrze++; else D.bledy.push(p);
    app.ocen(p.v.id, ocenaZWyniku(r.wynik));
    const w = $('#d-wynik', drill);
    w.hidden = false; w.className = 'wynik wynik--' + (r.wynik === 'dobrze' ? 'ok' : ok ? 'uwaga' : 'zle');
    w.innerHTML = `<p>${esc(komunikat(r, p.odp))}</p>
      <p class="drill-pelne">${esc(OSOBY_PL[p.i][0].split(' / ')[0])} ${esc(p.odp)} ${przyciskGlosu(p.odp.split(' / ')[0])}</p>
      <p class="regula"><b>Regla:</b> ${esc(regulaPl(p.v, p.czas))}</p>
      <button type="button" class="btn btn--akcent btn--szeroki" id="d-dalej">${D.nr + 1 >= D.kolejka.length ? 'Ver el resultado' : 'Siguiente'} <kbd>Enter</kbd></button>`;
    const s = $('#d-sprawdz', drill); if (s) s.textContent = 'Siguiente';
    drill.querySelectorAll('[data-dopc]').forEach(b => { b.disabled = true; if (b.dataset.dopc === p.odp) b.classList.add('ok'); else if (b.dataset.dopc === wpis) b.classList.add('zle'); });
    if (app.stan.ust.auto) app.mowa.powiedz(p.odp.split(' / ')[0]);
  }
  function nastepne() { D.nr++; if (D.nr >= D.kolejka.length) koniec(); else pytanie(); }
  function koniec() {
    const proc = D.kolejka.length ? Math.round(100 * D.dobrze / D.kolejka.length) : 0;
    drill.innerHTML = `${ustawieniaDrillu()}<div class="podsumowanie"><p class="etykieta">Resultado</p>
      <div class="liczby"><div><b>${D.dobrze}/${D.kolejka.length}</b><span>correctas</span></div><div><b>${proc}%</b><span>acierto</span></div></div>
      ${D.bledy.length ? `<p class="etykieta">Para repasar</p><ul class="lista lista--zwarta">${D.bledy.map(p => `<li><div class="lista-tekst"><b>${esc(p.odp)}</b><span>${esc(p.v.inf)} · ${esc(czasNazwa(p.czas))} · ${esc(OSOBY_PL[p.i][0])}</span></div>${przyciskGlosu(p.odp.split(' / ')[0])}</li>`).join('')}</ul>` : '<p class="srodek">¡Sin errores! Świetnie!</p>'}
      <div class="akcje-pion">${D.bledy.length ? '<button type="button" class="btn btn--akcent btn--szeroki" id="d-bledne">Practicar solo los errores</button>' : ''}<button type="button" class="btn btn--szeroki" id="d-nowy">Nueva práctica</button></div></div>`;
    app.odswiez();
  }
  drill.addEventListener('submit', e => { e.preventDefault(); ocenOdpowiedz($('#d-wpis', drill).value); });
  drill.addEventListener('click', e => {
    const t = e.target;
    if (t.closest('#d-opcje')) return otworzOpcjeDrillu();
    const o = t.closest('[data-dopc]'); if (o) return ocenOdpowiedz(o.dataset.dopc);
    if (t.closest('#d-dalej')) return nastepne();
    if (t.closest('#d-bledne')) return startDrill(D.bledy.map(p => ({ ...p, zrobione: false })));
    if (t.closest('#d-nowy')) return startDrill();
  });

  function pokazWidok() {
    root.querySelectorAll('[data-cw]').forEach(b => b.setAttribute('aria-pressed', b.dataset.cw === widok()));
    tab.hidden = widok() !== 'tabela'; drill.hidden = widok() !== 'drill'; przypEl.hidden = widok() !== 'przypadki';
    if (widok() === 'drill') startDrill();
    if (widok() === 'przypadki') przypadki.pokaz();
  }
  root.querySelector('#c-widoki').addEventListener('click', e => { const b = e.target.closest('[data-cw]'); if (!b) return; ui.cWidok = b.dataset.cw; app.zapisz(); pokazWidok(); });

  return {
    pokaz(inf) { const v = CZAS.find(x => x.inf === inf); if (v) { pokazCzasownik(v); tab.scrollIntoView({ block: 'start' }); } },
    poziom() { rysujGrupe(); pokazCzasownik(V); lista.rysuj(); pokazWidok(); },
    odswiezListe: () => { lista.rysuj(); rysujTabele(); },
    klawisz(e) {
      if (widok() === 'przypadki') return przypadki.klawisz(e);
      if (widok() !== 'drill' || !D.kolejka.length) return false;
      const p = D.kolejka[D.nr]; if (!p) { if (e.key === 'Enter') { startDrill(); return true; } return false; }
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= 4 && p.opcje && !p.zrobione) { const b = drill.querySelectorAll('[data-dopc]')[n - 1]; if (b) ocenOdpowiedz(b.dataset.dopc); return true; }
      if (e.key === 'Enter' && p.zrobione) { nastepne(); return true; }
      return false;
    },
  };
}
