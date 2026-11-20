// Zakładka „Traductor” (tryb dla hiszpańskojęzycznych): polski ⇄ hiszpański, analiza polskich słów jedna po drugiej.
// Te same identyfikatory co w module polskim (#t-kier, #t-opcje, #t-online, #t-przyklady), więc górna kapsuła działa bez zmian.
import { $, esc, przyciskGlosu, przyciskGwiazdki, zamknijModal } from './wspolne.js';
import { utworzAnalizatorPl } from '../analiza-pl.js';
import { tlumaczOnline } from '../tlumaczenie.js';
import { SLOWKA, ZWROTY_LISTA } from '../dane/index.js';

const PRZYKLADY = {
  pl: ['Gdzie jest najbliższa apteka?', 'Chciałbym zamówić kawę z mlekiem.', 'Jutro idę do pracy autobusem.', 'Czy możesz mówić wolniej?', 'Wczoraj byłam w kinie z przyjaciółmi.'],
  es: ['¿Dónde está la estación de tren?', 'Me gustaría reservar una mesa para dos.', 'Mañana tengo que trabajar.', '¿Puedes hablar más despacio?'],
};
const BLEDY = {
  siec: 'No hay conexión con el servicio de traducción.', limit: 'Se agotó el límite diario de traducciones gratuitas en este dispositivo. Inténtalo mañana.',
  blad: 'El servicio de traducción no respondió correctamente.',
};

export function zakladkaTlumaczPl(root, app) {
  const ui = app.stan.ui;
  const kier = () => ui.tKier === 'es' ? 'es' : 'pl';   // pl: polaco → español; es: español → polaco
  const analizuj = utworzAnalizatorPl([...SLOWKA, ...ZWROTY_LISTA.filter(z => !/\s/.test(z.es.trim()))]);
  root.innerHTML = `
    <div class="seg seg--pelny" role="group" aria-label="Dirección de la traducción" id="t-kier">
      <button type="button" data-tk="pl">Polaco → español</button><button type="button" data-tk="es">Español → polaco</button>
    </div>
    <textarea class="pole pole--tekst" id="t-tekst" rows="4" spellcheck="false" autocapitalize="sentences" aria-label="Texto para traducir"></textarea>
    <div class="wiersz">
      <button type="button" class="btn btn--akcent" id="t-start">Traducir y explicar <kbd>Ctrl + Enter</kbd></button>
      <button type="button" class="btn btn--male btn--cichy" id="t-wyczysc">Borrar</button>
    </div>
    <div class="arkusz" id="t-opcje">
      <label class="cc-kafel cc-kafel--szeroki"><input type="checkbox" id="t-online"><span class="tgl" aria-hidden="true"></span><b>Traducción en línea</b><small id="t-info-online"></small></label>
      <p class="etykieta">Frases de ejemplo</p>
      <div class="pigulki pigulki--pion" id="t-przyklady" aria-label="Ejemplos"></div>
    </div>
    <div id="t-wynik" aria-live="polite"></div>`;
  const pole = $('#t-tekst', root), wynikEl = $('#t-wynik', root), online = $('#t-online', root);
  online.checked = ui.tOnline !== false;
  let ostatnia = null, kontroler = null;

  function rysujKier() {
    root.querySelectorAll('[data-tk]').forEach(b => b.setAttribute('aria-pressed', b.dataset.tk === kier()));
    pole.setAttribute('lang', kier());
    pole.toggleAttribute('data-znaki', kier() === 'pl');
    pole.placeholder = kier() === 'pl' ? 'Escribe una frase en polaco, p. ej. «Gdzie jest najbliższa apteka?»' : 'Escribe una frase en español, p. ej. «¿Dónde está la estación?»';
    $('#t-przyklady').innerHTML = PRZYKLADY[kier()].map(p => `<button type="button" class="pigulka" data-tp="${esc(p)}">${esc(p)}</button>`).join('');
    $('#t-info-online').textContent = online.checked
      ? 'La frase completa la traduce el servicio gratuito MyMemory (el texto se envía allí; unos 5000 caracteres al día). El análisis palabra por palabra funciona sin internet.'
      : kier() === 'pl' ? 'Sin traducción en línea: solo el análisis palabra por palabra (sin internet).' : 'Sin traducción en línea no se puede pasar del español al polaco.';
  }

  function rysujAnalize(a, naglowek = '') {
    ostatnia = a;
    const znane = a.slowa.length - a.nieznane;
    wynikEl.innerHTML = `${naglowek}
      <section class="analiza-zdanie">
        <p class="etykieta">Palabra por palabra <span class="male">(toca una palabra)</span></p>
        <div class="slowa-chipy">${a.slowa.map((w, i) => `<button type="button" class="slowo-chip typ-${w.czasownik ? 'cz' : w.znany ? (w.przyblizony ? 'rz' : 'in') : 'nz'}" data-ts="${i}" aria-expanded="false"><b>${esc(w.t)}</b><small>${esc((w.es || '?').slice(0, 40))}</small></button>`).join('')}</div>
        <div class="szczegol-miejsce" data-sz></div>
        <p class="doslownie"><b>Literalmente:</b> ${esc(a.doslownie || '–')}</p>
        <p class="male">Reconocidas ${znane} de ${a.slowa.length} palabras. Las terminaciones polacas cambian según el caso, por eso algunas formas se reconocen solo de forma aproximada.</p>
      </section>`;
  }
  function szczegol(w) {
    return `<div class="slowo-szczegol">
      <div class="szczegol-gora"><h3>${esc(w.t)}${w.haslo && w.haslo.toLowerCase() !== w.t.toLowerCase() ? ` <span>→ ${esc(w.haslo)}</span>` : ''}</h3>
        <span>${przyciskGlosu(w.t)}${w.id ? przyciskGwiazdki(w.id, app.stan.ulub[w.id]) : ''}</span></div>
      <p><span class="chip">${esc(w.typ)}</span></p>
      <p><b>Significado:</b> ${esc(w.es || '–')}</p>
      ${w.opis ? `<p class="male">${esc(w.opis)}</p>` : ''}
      ${!w.znany ? '<p class="male">Esta palabra no está en el diccionario de la aplicación. Puede ser un nombre propio, una palabra poco frecuente o una forma declinada.</p>' : ''}
      ${w.czasownik ? `<button type="button" class="btn btn--male" data-todm="${esc(w.czasownik)}">Ver la conjugación de «${esc(w.czasownik)}»</button>` : ''}
    </div>`;
  }

  async function start() {
    const tekst = pole.value.trim();
    if (!tekst) { pole.focus(); return; }
    if (kontroler) kontroler.abort();
    kontroler = new AbortController();
    const h = (ui.tHist || []).filter(x => x !== tekst); h.unshift(tekst); ui.tHist = h.slice(0, 8); app.zapisz();
    const z = kier();
    if (z === 'pl') rysujAnalize(analizuj(tekst), online.checked ? '<div class="tlumaczenie ladowanie">Traduciendo…</div>' : '');
    else wynikEl.innerHTML = online.checked ? '<div class="tlumaczenie ladowanie">Traduciendo al polaco…</div>' : '<div class="tlumaczenie tlumaczenie--blad"><p>Activa la traducción en línea (Opciones) para traducir del español al polaco.</p></div>';
    if (!online.checked) return;
    try {
      const t = await tlumaczOnline(tekst, z, z === 'pl' ? 'es' : 'pl', { sygnal: kontroler.signal });
      const karta = `<div class="tlumaczenie"><p class="etykieta">${z === 'pl' ? 'En español' : 'En polaco'}</p><p class="tlumaczenie-tekst">${esc(t)}</p>${z === 'es' ? przyciskGlosu(t) : ''}<p class="male">Traducción automática (MyMemory). El análisis de palabras viene del diccionario de la aplicación.</p></div>`;
      if (z === 'pl') { const l = $('.tlumaczenie', wynikEl); if (l) l.outerHTML = karta; }
      else rysujAnalize(analizuj(t), karta);
      app.dodajAktywnosc(1);
    } catch (e) {
      if (e.name === 'AbortError') return;
      const info = `<div class="tlumaczenie tlumaczenie--blad"><p><b>Traducción completa no disponible.</b> ${esc(BLEDY[e.rodzaj] || '')}</p></div>`;
      const l = $('.tlumaczenie', wynikEl); if (l) l.outerHTML = info; else wynikEl.insertAdjacentHTML('afterbegin', info);
    }
  }

  root.addEventListener('click', e => {
    const t = e.target;
    const k = t.closest('[data-tk]'); if (k) { ui.tKier = k.dataset.tk; app.zapisz(); rysujKier(); wynikEl.innerHTML = ''; ostatnia = null; return; }
    if (t.closest('#t-start')) return start();
    if (t.closest('#t-wyczysc')) { pole.value = ''; wynikEl.innerHTML = ''; pole.focus(); return; }
    const s = t.closest('[data-ts]');
    if (s && ostatnia) {
      const miejsce = root.querySelector('[data-sz]');
      const otwarte = s.getAttribute('aria-expanded') === 'true';
      root.querySelectorAll('[data-ts]').forEach(b => b.setAttribute('aria-expanded', 'false'));
      if (otwarte) { miejsce.innerHTML = ''; return; }
      s.setAttribute('aria-expanded', 'true');
      const w = ostatnia.slowa[+s.dataset.ts];
      miejsce.innerHTML = szczegol(w);
      app.mowa.powiedz(w.t);
      return;
    }
    const o = t.closest('[data-todm]'); if (o) app.otworzCzasownik(o.dataset.todm);
  });
  $('#t-opcje', root).addEventListener('click', e => {
    const p = e.target.closest('[data-tp]'); if (!p) return;
    pole.value = p.dataset.tp; zamknijModal(); start();
  });
  online.addEventListener('change', () => { ui.tOnline = online.checked; app.zapisz(); rysujKier(); });
  pole.addEventListener('keydown', e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); start(); } });

  return {
    poziom() {
      rysujKier();
      if (!pole.value && ui.tHist && ui.tHist.length) pole.value = ui.tHist[0];
      if (pole.value && !ostatnia && kier() === 'pl') rysujAnalize(analizuj(pole.value));
    },
    odswiezListe() {},
    klawisz() { return false; },
  };
}
