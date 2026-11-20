// Widok „Moje słowa”: wszystkie pozycje oznaczone gwiazdką w jednym miejscu + ćwiczenie tylko z nich.
import { esc, przyciskGlosu, przyciskGwiazdki } from './wspolne.js';
import { POD_ID } from '../dane/index.js';
import { status } from '../srs.js';
import { t as tr } from '../jezyk.js';

const ETYK = () => ({ nowe: tr('nowe', 'nueva'), nauka: tr('w nauce', 'aprendiendo'), utrwalane: tr('utrwalane', 'afianzando'), opanowane: tr('opanowane', 'dominada') });

export function widokMoich(el, app, ctx) {
  const pozycje = () => Object.keys(app.stan.ulub).map(id => POD_ID.get(id)).filter(Boolean);
  function rysuj() {
    const p = pozycje(), et = ETYK();
    const doKart = p.filter(x => x.typ !== 'czasownik');
    el.innerHTML = `<p class="etykieta">${tr('Moje słowa', 'Mis palabras')} <span class="male">(${p.length})</span></p>
      ${p.length ? `<ul class="lista">${p.map(x => { const s = status(app.stan.srs[x.id]); return `<li class="st-${s}">
        <div class="lista-tekst"><b>${esc(x.es)}</b><span>${esc(x.pl)} <i>· ${x.p}</i></span></div>
        <span class="znacznik znacznik--${s}">${et[s]}</span>${x.typ === 'czasownik' ? `<button type="button" class="btn btn--male" data-moj-cz="${esc(x.inf)}">${tr('Odmiana', 'Conjugar')}</button>` : ''}${przyciskGlosu(x.es)}${przyciskGwiazdki(x.id, true)}</li>`; }).join('')}</ul>
        ${doKart.length ? `<button type="button" class="btn btn--akcent btn--szeroki" data-moj-cwicz>${tr(`Ćwicz moje słowa (${doKart.length})`, `Practicar mis palabras (${doKart.length})`)}</button>` : ''}`
        : `<p class="pusto-duze">${tr('Nie masz jeszcze ulubionych. Stuknij gwiazdkę ☆ przy słowie, zwrocie albo czasowniku, a pojawi się tutaj.', 'Todavía no tienes favoritos. Toca la estrella ☆ junto a una palabra, frase o verbo y aparecerá aquí.')}</p>`}`;
  }
  el.addEventListener('click', e => {
    const t = e.target;
    if (t.closest('[data-moj-cwicz]')) return ctx.cwicz(pozycje().filter(x => x.typ !== 'czasownik'));
    const c = t.closest('[data-moj-cz]'); if (c) return app.otworzCzasownik(c.dataset.mojCz);
    if (t.closest('[data-ulub]')) setTimeout(rysuj, 50);
  });
  return { pokaz: rysuj };
}
