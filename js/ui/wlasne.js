// Widok „Własne słówka”: dodawanie własnych słów (trafiają do powtórek), lista, usuwanie i ćwiczenie.
import { $, esc, przyciskGlosu, toast } from './wspolne.js';
import { dodajWlasne, usunWlasne } from '../wlasne.js';
import { POD_ID, POZIOMY } from '../dane/index.js';
import { t as tr, CEL, HISP } from '../jezyk.js';

export function widokWlasnych(el, app, ctx) {
  const st = app.stan;
  function rysuj() {
    const lista = (st.wlasne || []).slice().reverse();
    el.innerHTML = `<p class="etykieta">${tr('Własne słówka', 'Mis palabras')}</p>
      <form class="wl-form" data-wl-form autocomplete="off">
        <input class="pole" name="es" placeholder="${tr('po hiszpańsku, np. la merienda', 'en polaco, p. ej. podwieczorek')}" lang="${CEL}" data-znaki autocapitalize="off" spellcheck="false" required aria-label="${tr('Słowo', 'Palabra')}">
        <input class="pole" name="pl" placeholder="${tr('tłumaczenie, np. podwieczorek', 'traducción, p. ej. merienda')}" lang="${HISP ? 'es' : 'pl'}" required aria-label="${tr('Tłumaczenie', 'Traducción')}">
        <div class="szukaj"><select class="pole" name="p" aria-label="${tr('Poziom', 'Nivel')}">${POZIOMY.map(p => `<option${p === st.ui.poziom ? ' selected' : ''}>${p}</option>`).join('')}</select>
        <button type="submit" class="btn btn--akcent">${tr('Dodaj', 'Añadir')}</button></div>
      </form>
      <p class="male">${tr('Twoje słowa trafiają do powtórek (temat „Moje słówka” w Słówkach) i do gier. Możesz też dodać notatkę do każdego słowa – przycisk 📝 przy karcie.', 'Tus palabras entran en los repasos (tema «Mis palabras») y en los juegos. También puedes añadir una nota a cada palabra con 📝.')}</p>
      ${lista.length ? `<ul class="lista">${lista.map(w => `<li><div class="lista-tekst"><b>${esc(w.es)}</b><span>${esc(w.pl)} <i>· ${w.p}</i></span></div>${przyciskGlosu(w.es)}<button type="button" class="btn btn--male btn--cichy" data-wl-usun="${esc(w.es)}" aria-label="${tr('Usuń', 'Eliminar')}">✕</button></li>`).join('')}</ul>
        <button type="button" class="btn btn--akcent btn--szeroki" data-wl-cwicz>${tr(`Ćwicz własne słówka (${lista.length})`, `Practicar mis palabras (${lista.length})`)}</button>` : `<p class="pusto">${tr('Jeszcze nic nie dodałeś.', 'Todavía no has añadido nada.')}</p>`}`;
  }
  el.addEventListener('submit', e => {
    if (!e.target.matches('[data-wl-form]')) return;
    e.preventDefault();
    const f = new FormData(e.target);
    const x = dodajWlasne(st, { es: f.get('es'), pl: f.get('pl'), p: f.get('p') });
    if (!x) { toast(tr('To słowo już jest na liście.', 'Esa palabra ya está en la lista.')); return; }
    app.zapisz(); app.odswiez(); toast(tr('Dodano: ', 'Añadida: ') + x.es); rysuj();
    const i = el.querySelector('[name="es"]'); if (i) i.focus();
  });
  el.addEventListener('click', e => {
    const u = e.target.closest('[data-wl-usun]'); if (u) { usunWlasne(st, u.dataset.wlUsun); app.zapisz(); app.odswiez(); return rysuj(); }
    if (e.target.closest('[data-wl-cwicz]')) ctx.cwicz((st.wlasne || []).map(w => POD_ID.get('u:' + w.es)).filter(Boolean));
  });
  return { pokaz: rysuj };
}
