// „Zgłoś błąd” przy słowie: zapis na liście, którą można skopiować / udostępnić i wkleić twórcy aplikacji.
import { $, esc, otworzModal, zamknijModal, sygnalModalu, toast } from './wspolne.js';
import { t as tr } from '../jezyk.js';

const POWODY = () => [tr('Złe tłumaczenie', 'Traducción incorrecta'), tr('Zły rodzajnik / rodzaj', 'Artículo o género incorrecto'), tr('Literówka', 'Errata'), tr('Złe zdanie przykładowe', 'Ejemplo incorrecto'), tr('Złe nagranie / wymowa', 'Pronunciación incorrecta'), tr('Inne', 'Otro')];

export const przyciskZgloszenia = id => `<button type="button" class="zglos" data-zglos="${esc(id)}">⚑ ${tr('Zgłoś błąd', 'Avisar de un error')}</button>`;

export function zglos(app, x) {
  if (!x) return;
  const el = otworzModal(tr('Zgłoś błąd', 'Avisar de un error'), `<div class="arkusz">
    <p class="pytanie-sr">${esc(x.es)}</p><p class="srodek">${esc(x.pl)}</p>
    <p class="etykieta">${tr('Co jest nie tak?', '¿Qué está mal?')}</p>
    <div class="pigulki">${POWODY().map((p, i) => `<button type="button" class="pigulka" data-zp="${i}" aria-pressed="${i === 0}">${esc(p)}</button>`).join('')}</div>
    <textarea class="pole" id="zg-uwaga" rows="3" placeholder="${tr('Opcjonalnie: jak powinno być?', 'Opcional: ¿cómo debería ser?')}"></textarea>
    <button type="button" class="btn btn--akcent btn--szeroki" data-zg-zapisz>${tr('Zapisz zgłoszenie', 'Guardar aviso')}</button>
    <p class="male">${tr('Zgłoszenia trafiają na listę w Ustawieniach → „Zgłoszone błędy”. Stamtąd skopiujesz je jednym przyciskiem.', 'Los avisos se guardan en Ajustes → «Errores avisados»; desde allí los copias con un botón.')}</p></div>`);
  let powod = 0;
  el.addEventListener('click', e => {
    const p = e.target.closest('[data-zp]');
    if (p) { powod = +p.dataset.zp; el.querySelectorAll('[data-zp]').forEach(b => b.setAttribute('aria-pressed', b === p)); return; }
    if (e.target.closest('[data-zg-zapisz]')) {
      const st = app.stan; st.zgloszenia = st.zgloszenia || [];
      st.zgloszenia.unshift({ id: x.id || '', es: x.es, pl: x.pl, powod: POWODY()[powod], uwaga: $('#zg-uwaga').value.trim(), d: new Date().toISOString().slice(0, 10) });
      st.zgloszenia = st.zgloszenia.slice(0, 200);
      app.zapisz(); zamknijModal(); toast(tr('Dzięki! Zgłoszenie zapisane.', '¡Gracias! Aviso guardado.'));
    }
  }, { signal: sygnalModalu() });
}

export const tekstZgloszen = l => l.map(z => `${z.es} | ${z.pl} | ${z.powod}${z.uwaga ? ' | ' + z.uwaga : ''}`).join('\n');

export function listaZgloszen(app) {
  const st = app.stan;
  const rysuj = () => {
    const l = st.zgloszenia || [];
    return `<div class="arkusz">${l.length ? `<ul class="lista lista--zwarta">${l.map((z, i) => `<li><div class="lista-tekst"><b>${esc(z.es)}</b><span>${esc(z.pl)} · <i>${esc(z.powod)}${z.uwaga ? ': ' + esc(z.uwaga) : ''}</i></span></div><button type="button" class="btn btn--male btn--cichy" data-zg-usun="${i}" aria-label="${tr('Usuń', 'Borrar')}">✕</button></li>`).join('')}</ul>
      <div class="akcje-poziom"><button type="button" class="btn btn--akcent" data-zg-kopiuj>${tr('Kopiuj wszystkie', 'Copiar todos')}</button>${navigator.share ? `<button type="button" class="btn" data-zg-udostepnij>${tr('Udostępnij', 'Compartir')}</button>` : ''}<button type="button" class="btn btn--cichy" data-zg-wyczysc>${tr('Wyczyść', 'Borrar todo')}</button></div>
      <p class="male">${tr('Wklej skopiowaną listę w rozmowie z twórcą aplikacji – błędy zostaną poprawione.', 'Pega la lista copiada en la conversación con el autor de la app.')}</p>`
      : `<p class="pusto">${tr('Brak zgłoszeń. Przycisk „⚑ Zgłoś błąd” znajdziesz przy każdym słowie (po odpowiedzi na fiszce i w wyszukiwarce).', 'No hay avisos. El botón «⚑ Avisar de un error» está junto a cada palabra.')}</p>`}</div>`;
  };
  const el = otworzModal(tr('Zgłoszone błędy', 'Errores avisados'), rysuj());
  el.addEventListener('click', async e => {
    const u = e.target.closest('[data-zg-usun]');
    if (u) { st.zgloszenia.splice(+u.dataset.zgUsun, 1); app.zapisz(); el.innerHTML = rysuj(); return; }
    const tekst = tekstZgloszen(st.zgloszenia || []);
    if (e.target.closest('[data-zg-kopiuj]')) { try { await navigator.clipboard.writeText(tekst); toast(tr('Skopiowano.', 'Copiado.')); } catch (er) { toast(tr('Nie udało się skopiować.', 'No se pudo copiar.')); } return; }
    if (e.target.closest('[data-zg-udostepnij]')) { try { await navigator.share({ text: tekst }); } catch (er) { /* anulowano */ } return; }
    if (e.target.closest('[data-zg-wyczysc]')) { st.zgloszenia = []; app.zapisz(); el.innerHTML = rysuj(); }
  }, { signal: sygnalModalu() });
}
