// Plan nauki do celu: wybierasz poziom i datę, aplikacja liczy, ile dziennie i czy jesteś na kursie.
import { $, esc, toast } from './wspolne.js';
import { planNauki, sugerowanyCel } from '../plan.js';
import { SLOWKA, CZAS, ZWROTY_LISTA, POZIOMY } from '../dane/index.js';
import { dzien } from '../stan.js';
import { t as tr } from '../jezyk.js';

export function widokPlanu(el, app) {
  const st = app.stan;
  function rysuj() {
    const cel = st.plan || { poziom: POZIOMY[Math.min(5, POZIOMY.indexOf(st.ui.poziom) + 1)], data: dzien(Date.now() + 180 * 864e5) };
    const p = st.plan ? planNauki(st, [...SLOWKA, ...CZAS, ...ZWROTY_LISTA], cel) : null;
    const sug = p ? sugerowanyCel(p.naDzien) : null;
    el.innerHTML = `<p class="etykieta">${tr('Plan nauki', 'Plan de estudio')}</p>
      <form class="wl-form" data-pl-form><div class="szukaj">
        <label class="wybor"><span>${tr('Cel', 'Meta')}</span><select class="pole" name="poziom">${POZIOMY.map(x => `<option${x === cel.poziom ? ' selected' : ''}>${x}</option>`).join('')}</select></label>
        <label class="wybor"><span>${tr('do', 'para el')}</span><input class="pole" type="date" name="data" value="${esc(cel.data)}" min="${dzien()}" required></label></div>
        <button type="submit" class="btn btn--akcent btn--szeroki">${st.plan ? tr('Zmień plan', 'Cambiar el plan') : tr('Ustaw plan', 'Crear el plan')}</button></form>
      ${p ? `<div class="xp-pasek"><div class="xp-gora"><b>${tr('Poziom', 'Nivel')} ${cel.poziom} · ${p.procent}%</b><span>${p.opanowane}/${p.razem} ${tr('opanowanych', 'dominadas')}</span></div><div class="postep"><i style="width:${p.procent}%"></i></div></div>
        <div class="liczby liczby--4">
          <div><b>${p.dni}</b><span>${tr('dni do celu', 'días hasta la meta')}</span></div>
          <div><b>${p.pozostale}</b><span>${tr('do opanowania', 'por dominar')}</span></div>
          <div><b>${p.naDzien}</b><span>${tr('nowych dziennie', 'nuevas al día')}</span></div>
          <div><b>${p.tempo}</b><span>${tr('Twoje tempo / dzień', 'tu ritmo / día')}</span></div></div>
        <div class="wynik wynik--${p.naKursie ? 'ok' : 'uwaga'}"><p><b>${p.naKursie ? tr('Jesteś na kursie! 🎯', '¡Vas bien! 🎯') : tr('Trzeba przyspieszyć', 'Hay que acelerar')}</b></p>
          <p class="male">${p.prognoza ? tr(`W obecnym tempie cel osiągniesz ok. ${p.prognoza.split('-').reverse().join('.')}.`, `A este ritmo llegarás hacia el ${p.prognoza.split('-').reverse().join('.')}.`) : tr('Jeszcze za mało danych o tempie – ucz się kilka dni, a pojawi się prognoza.', 'Aún no hay datos de ritmo: practica unos días y verás la previsión.')}
          ${tr(`Sugerowany cel dzienny: ${sug} odpowiedzi (teraz ${st.ust.cel}).`, `Meta diaria sugerida: ${sug} respuestas (ahora ${st.ust.cel}).`)}</p>
          ${sug !== st.ust.cel ? `<button type="button" class="btn btn--male" data-pl-cel="${sug}">${tr(`Ustaw cel dzienny na ${sug}`, `Poner la meta en ${sug}`)}</button>` : ''}</div>
        <p class="male">${tr('Liczą się słówka, czasowniki i zwroty ze wszystkich poziomów do wybranego. Pozycja jest opanowana, gdy następna powtórka wypada za co najmniej 7 dni.', 'Cuentan las palabras, verbos y frases de todos los niveles hasta el elegido. Un elemento está dominado cuando su próximo repaso es dentro de 7 días o más.')}</p>
        <button type="button" class="btn btn--cichy btn--male" data-pl-usun>${tr('Usuń plan', 'Eliminar el plan')}</button>`
        : `<p class="male">${tr('Wybierz poziom i datę, np. „B1 do czerwca”. Aplikacja wyliczy, ile nowych słów dziennie potrzebujesz i czy obecne tempo wystarczy.', 'Elige un nivel y una fecha, p. ej. «B1 para junio». La app calculará cuántas palabras nuevas necesitas al día.')}</p>`}`;
  }
  el.addEventListener('submit', e => {
    if (!e.target.matches('[data-pl-form]')) return; e.preventDefault();
    const f = new FormData(e.target);
    st.plan = { poziom: f.get('poziom'), data: f.get('data') }; app.zapisz(); rysuj();
  });
  el.addEventListener('click', e => {
    const c = e.target.closest('[data-pl-cel]'); if (c) { st.ust.cel = +c.dataset.plCel; app.zapisz(); app.odswiez(); toast(tr('Cel dzienny zmieniony.', 'Meta diaria cambiada.')); return rysuj(); }
    if (e.target.closest('[data-pl-usun]')) { delete st.plan; app.zapisz(); rysuj(); }
  });
  return { pokaz: rysuj };
}
