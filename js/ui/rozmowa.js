// Rozmowa z lektorem: scenka (kawiarnia, droga, restauracja…) – lektor mówi, odpowiadasz głosem albo wpisując.
import { $, esc, przyciskGlosu, IKONY } from './wspolne.js';
import { ROZMOWY } from '../dane/rozmowy.js';
import { ocenWymowe } from '../tekst.js';
import { rozpoznawanieDostepne, sluchaj, przerwijSluchanie } from '../rozpoznawanie.js';

const MIK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 14.5a3.5 3.5 0 0 0 3.5-3.5V5.5a3.5 3.5 0 1 0-7 0V11a3.5 3.5 0 0 0 3.5 3.5zm6-3.5h-1.6a4.4 4.4 0 0 1-8.8 0H6a6 6 0 0 0 5.2 5.9V20H9v1.6h6V20h-2.2v-3.1A6 6 0 0 0 18 11z"/></svg>';

export function widokRozmowy(el, app) {
  let S = null;
  function menu() {
    S = null; przerwijSluchanie();
    el.innerHTML = `<p class="etykieta">Rozmowa z lektorem</p>
      <p class="male">Lektor zaczyna rozmowę, a Ty odpowiadasz po hiszpańsku – głosem (mikrofon) albo pisząc. Podpowiedź mówi, co masz powiedzieć.</p>
      ${ROZMOWY.map(r => `<button type="button" class="cw-kafel cw-kafel--szeroki" data-rz="${r.id}"><span class="cw-ik">${r.ik}</span><b>${esc(r.t)} <span class="chip">${r.p}</span></b><small>${esc(r.o)}${(app.stan.rozmowy || {})[r.id] ? ' · ✓' : ''}</small></button>`).join('')}`;
  }
  function start(id) { S = { r: ROZMOWY.find(x => x.id === id), nr: 0, log: [], proby: 0, dobrze: 0 }; tura(); }
  function rysuj(info = '') {
    const k = S.r.kwestie[S.nr];
    el.innerHTML = `<p class="etykieta">${S.r.ik} ${esc(S.r.t)} · ${Math.min(S.nr + 1, S.r.kwestie.length)}/${S.r.kwestie.length}</p>
      <div class="rz-czat">${S.log.map(l => `<p class="kwestia kwestia--${l.kto}"><span>${l.kto === 'a' ? '🧑‍🍳' : 'Ty'}</span>${esc(l.t)}${l.kto === 'a' ? przyciskGlosu(l.t) : ''}</p>`).join('')}</div>
      ${k ? `<div class="rz-zadanie"><small>Twoja kolej</small><b>${esc(k.pl)}</b></div>
        <div class="rz-odp">${rozpoznawanieDostepne() ? `<button type="button" class="mikrofon mikrofon--maly" data-rz-mik aria-label="Odpowiedz głosem">${MIK}</button>` : ''}
          <form class="pole-odp" data-rz-form autocomplete="off"><input class="pole" data-rz-wpis type="text" placeholder="albo wpisz odpowiedź" lang="es" data-znaki autocapitalize="off" spellcheck="false" aria-label="Twoja odpowiedź"><button type="submit" class="btn btn--akcent">OK</button></form></div>
        <p class="male srodek" data-rz-info>${info}</p>
        <div class="akcje-poziom"><button type="button" class="btn btn--cichy btn--male" data-rz-pokaz>Pokaż przykładową odpowiedź</button><button type="button" class="btn btn--cichy btn--male" data-rz-powtorz>${IKONY.glos} Powtórz</button></div>` : ''}`;
    const czat = $('.rz-czat', el); czat.scrollTop = czat.scrollHeight;
  }
  function tura() {
    const k = S.r.kwestie[S.nr];
    S.log.push({ kto: 'a', t: k.bot }); S.proby = 0;
    rysuj();
    app.mowa.powiedz(k.bot);
  }
  function ocen(alt) {
    const k = S.r.kwestie[S.nr], o = ocenWymowe(alt, k.odp);
    S.proby++;
    if (o.wynik !== 'zle' || S.proby >= 3) {
      if (o.wynik !== 'zle') S.dobrze++;
      S.log.push({ kto: 'b', t: o.wynik !== 'zle' ? o.slyszane : `${o.slyszane} → ${k.odp[0]}` });
      app.dodajAktywnosc(1);
      S.nr++;
      if (S.nr >= S.r.kwestie.length) return koniec();
      setTimeout(tura, 300);
      rysuj();
    } else rysuj(`Nie do końca („${esc(o.slyszane)}”). Spróbuj jeszcze raz (${S.proby}/3) albo zobacz przykład.`);
  }
  function koniec() {
    if (!app.stan.rozmowy) app.stan.rozmowy = {};
    app.stan.rozmowy[S.r.id] = 1; app.licz('rozmowa');
    rysuj();
    el.insertAdjacentHTML('beforeend', `<div class="podsumowanie"><p class="etykieta">Rozmowa zakończona 🎉</p><div class="liczby"><div><b>${S.dobrze}/${S.r.kwestie.length}</b><span>odpowiedzi bez pomocy</span></div></div>
      <div class="akcje-pion"><button type="button" class="btn btn--akcent btn--szeroki" data-rz="${S.r.id}">Jeszcze raz</button><button type="button" class="btn btn--szeroki" data-rz-menu>Inne scenki</button></div></div>`);
    app.odswiez();
  }
  async function mikrofon() {
    const b = $('[data-rz-mik]', el), info = $('[data-rz-info]', el);
    if (b.classList.contains('slucha')) { przerwijSluchanie(); return; }
    app.mowa.stop(); b.classList.add('slucha'); info.textContent = 'Słucham…';
    try { ocen(await sluchaj(app.stan.ust.wariant === 'latam' ? 'es-MX' : 'es-ES')); }
    catch (e) { const i = $('[data-rz-info]', el); if (i) i.textContent = e.message === 'zgoda' ? 'Brak dostępu do mikrofonu – możesz też wpisać odpowiedź.' : e.message === 'cisza' ? 'Nic nie usłyszałem. Spróbuj jeszcze raz albo wpisz.' : ''; }
    finally { const bb = $('[data-rz-mik]', el); if (bb) bb.classList.remove('slucha'); }
  }
  el.addEventListener('submit', e => { if (e.target.matches('[data-rz-form]')) { e.preventDefault(); const v = $('[data-rz-wpis]', el).value.trim(); if (v) ocen([v]); } });
  el.addEventListener('click', e => {
    const t = e.target;
    const r = t.closest('[data-rz]'); if (r) return start(r.dataset.rz);
    if (t.closest('[data-rz-menu]')) return menu();
    if (t.closest('[data-rz-mik]')) return mikrofon();
    if (t.closest('[data-rz-pokaz]')) { const i = $('[data-rz-info]', el); i.innerHTML = `Na przykład: <b>${esc(S.r.kwestie[S.nr].odp[0])}</b>`; app.mowa.powiedz(S.r.kwestie[S.nr].odp[0]); return; }
    if (t.closest('[data-rz-powtorz]')) return app.mowa.powiedz(S.r.kwestie[S.nr].bot);
  });
  return { pokaz: menu };
}
