// Lista z wyszukiwarką, filtrami, sortowaniem, gwiazdką, odsłuchem i przyciskiem „Ćwicz”.
import { $, esc, przyciskGlosu, przyciskGwiazdki } from './wspolne.js';
import { FILTRY, SORTY, filtruj, sortuj } from '../filtry.js';
import { status } from '../srs.js';

const ETYK = { nowe: 'nowe', nauka: 'w nauce', utrwalane: 'utrwalane', opanowane: 'opanowane' };

/**
 * @param {HTMLElement} kontener
 * @param {{id: string, app: object, pobierz: () => object[], opis: (x) => string, mow: (x) => string, cwicz: (x) => void, tytul: string}} o
 */
export function utworzListe(kontener, o) {
  const { app } = o;
  const st = { q: '', filtr: 'wszystkie', sort: 'domyslnie', ile: 40 };
  kontener.innerHTML = `
    <details class="lista-szuflada" id="${o.id}">
      <summary><span>${esc(o.tytul)}</span><span class="licznik" data-ile></span></summary>
      <div class="lista-narzedzia">
        <input type="search" class="pole" data-q placeholder="Szukaj po polsku albo po hiszpańsku" aria-label="Szukaj" autocomplete="off" spellcheck="false" data-znaki>
        <div class="pigulki" role="group" aria-label="Filtr">${FILTRY.map(([k, n]) => `<button type="button" class="pigulka" data-filtr="${k}" aria-pressed="${k === 'wszystkie'}">${n}</button>`).join('')}</div>
        <label class="wybor"><span>Sortuj</span><select class="pole" data-sort aria-label="Sortowanie">${SORTY.map(([k, n]) => `<option value="${k}">${n}</option>`).join('')}</select></label>
      </div>
      <ul class="lista" data-lista></ul>
      <button type="button" class="btn btn--male wiecej" data-wiecej hidden>Pokaż więcej</button>
    </details>`;
  const ul = $('[data-lista]', kontener);
  function rysuj() {
    const wynik = sortuj(filtruj(o.pobierz(), { q: st.q, filtr: st.filtr, stany: app.stan.srs, ulub: app.stan.ulub }), st.sort, app.stan.srs);
    $('[data-ile]', kontener).textContent = wynik.length;
    ul.innerHTML = wynik.slice(0, st.ile).map(x => {
      const s = status(app.stan.srs[x.id]);
      return `<li data-id="${esc(x.id)}" class="st-${s}">
        <button type="button" class="lista-tekst" data-cwicz="${esc(x.id)}" aria-label="Ćwicz: ${esc(x.es)}">
          <b>${esc(x.es)}</b><span>${o.opis(x)}</span>
        </button>
        <span class="znacznik znacznik--${s}" title="${ETYK[s]}">${ETYK[s]}</span>
        ${przyciskGlosu(o.mow(x))}${przyciskGwiazdki(x.id, app.stan.ulub[x.id])}
      </li>`;
    }).join('') || '<li class="pusto">Nic tu nie ma. Zmień filtr albo wyszukiwanie.</li>';
    $('[data-wiecej]', kontener).hidden = wynik.length <= st.ile;
  }
  $('[data-q]', kontener).addEventListener('input', e => { st.q = e.target.value; st.ile = 40; rysuj(); });
  $('[data-sort]', kontener).addEventListener('change', e => { st.sort = e.target.value; rysuj(); });
  kontener.addEventListener('click', e => {
    const f = e.target.closest('[data-filtr]');
    if (f) { st.filtr = f.dataset.filtr; kontener.querySelectorAll('[data-filtr]').forEach(b => b.setAttribute('aria-pressed', b === f)); st.ile = 40; rysuj(); return; }
    if (e.target.closest('[data-wiecej]')) { st.ile += 60; rysuj(); return; }
    const c = e.target.closest('[data-cwicz]');
    if (c) { const x = o.pobierz().find(y => y.id === c.dataset.cwicz); if (x) o.cwicz(x); }
  });
  $('details', kontener).addEventListener('toggle', e => { if (e.target.open) rysuj(); });
  return { rysuj: () => { if ($('details', kontener).open) rysuj(); else $('[data-ile]', kontener).textContent = o.pobierz().length; } };
}
