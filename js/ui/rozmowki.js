// Rozmówki podróżne: najważniejsze zwroty w kategoriach; stuknięcie pokazuje zwrot dużym drukiem (do pokazania komuś) i czyta go.
import { esc, przyciskGlosu, otworzModal } from './wspolne.js';
import { ROZMOWKI } from '../dane/rozmowki.js';
import { HISP, t as tr } from '../jezyk.js';

const cel = z => (HISP ? z[0] : z[1]), moj = z => (HISP ? z[1] : z[0]);

export function widokRozmowek(el, app) {
  let kat = ROZMOWKI[0].id;
  function rysuj() {
    const k = ROZMOWKI.find(x => x.id === kat);
    el.innerHTML = `<p class="etykieta">${tr('Rozmówki podróżne', 'Guía de conversación')}</p>
      <p class="male">${tr('Stuknij zwrot, żeby pokazać go dużym drukiem i odsłuchać. Działa też bez internetu.', 'Toca una frase para verla en grande y escucharla. Funciona sin internet.')}</p>
      <div class="pigulki cz-lista">${ROZMOWKI.map(x => `<button type="button" class="pigulka" data-rk="${x.id}" aria-pressed="${x.id === kat}">${x.ik} ${esc(HISP ? x.es : x.pl)}</button>`).join('')}</div>
      <ul class="lista">${k.z.map((z, i) => `<li><button type="button" class="lista-tekst" data-rz-i="${i}"><b>${esc(cel(z))}</b><span>${esc(moj(z))}</span></button>${przyciskGlosu(cel(z))}</li>`).join('')}</ul>`;
  }
  function pokaz(i) {
    const z = ROZMOWKI.find(x => x.id === kat).z[i];
    otworzModal(moj(z), `<div class="rk-duze" lang="${HISP ? 'pl' : 'es'}">${esc(cel(z))}</div>
      <div class="srodek">${przyciskGlosu(cel(z))}</div><p class="male srodek">${tr('Pokaż ekran rozmówcy albo stuknij, żeby odsłuchać.', 'Enseña la pantalla o toca para escuchar.')}</p>`);
    app.mowa.powiedz(cel(z));
  }
  el.addEventListener('click', e => {
    const k = e.target.closest('[data-rk]'); if (k) { kat = k.dataset.rk; return rysuj(); }
    const z = e.target.closest('[data-rz-i]'); if (z) pokaz(+z.dataset.rzI);
  });
  return { pokaz: rysuj };
}
