// Widok „Plan na dziś” (w Ćwiczeniach): lista kroków z odhaczaniem.
import { esc, przyciskGlosu } from './wspolne.js';
import { krokiPlanu, slowaPlanu, zwrotDnia, oznaczKrok, stanPlanu } from '../plan-dnia.js';
import { opisKategorii } from '../bledy.js';
import { t as tr } from '../jezyk.js';

export function widokPlanuDnia(el, app, ctx) {
  const st = app.stan;
  function rysuj(pokazZwrot = false) {
    const kroki = krokiPlanu(st), zrob = kroki.filter(k => k.zrobione).length;
    const z = zwrotDnia(st);
    const nazwaKafla = id => { const k = ctx.kafel(id); return k ? k.n : id; };
    el.innerHTML = `<div class="plan-dnia">
      <p class="etykieta">${tr('Plan na dziś', 'Plan de hoy')} · ${zrob}/${kroki.length}</p>
      <div class="postep"><i style="width:${100 * zrob / kroki.length}%"></i></div>
      ${zrob === kroki.length ? `<p class="srodek tekst-ok"><b>${tr('Plan na dziś wykonany! 🎉 Wróć jutro po nowy.', '¡Plan de hoy completado! 🎉 Vuelve mañana.')}</b></p>` : `<p class="male">${tr('Kilka minut, wszystko gotowe – rób po kolei.', 'Unos minutos, todo listo: hazlo en orden.')}</p>`}
      <ol class="plan-kroki">${kroki.map(k => `<li class="${k.zrobione ? 'zrobione' : ''}">
        <button type="button" class="plan-krok" data-pk="${k.id}"><span class="plan-ik" aria-hidden="true">${k.zrobione ? '✓' : k.ik}</span>
          <span><b>${esc(k.n)}</b><small>${esc(k.id === 'cw' ? nazwaKafla(k.kafel) : k.o)}</small></span><span aria-hidden="true">›</span></button></li>`).join('')}</ol>
      ${pokazZwrot ? `<div class="tlumaczenie" data-plan-zwrot>
        <p class="etykieta">${tr('Zwrot dnia', 'Frase del día')}</p>
        <p class="tlumaczenie-tekst">${esc(z.es)} ${przyciskGlosu(z.es)}</p><p>${esc(z.pl)}</p>
        ${z.dialog && z.dialog.length ? `<div class="dialog">${z.dialog.map(l => `<p class="kwestia kwestia--${l.kto === 'A' ? 'a' : 'b'}"><span>${l.kto}</span>${esc(l.tekst.replace(/\*/g, ''))}</p>`).join('')}</div>` : ''}
        <div class="akcje-poziom"><button type="button" class="btn btn--akcent" data-plan-zw="3">${tr('Znam / zapamiętam', 'La sé')}</button><button type="button" class="btn" data-plan-zw="1">${tr('Dodaj do powtórek', 'Añadir a repasos')}</button></div></div>` : ''}
    </div>`;
    if (pokazZwrot) app.mowa.powiedz(z.es);
  }
  el.addEventListener('click', e => {
    const k = e.target.closest('[data-pk]');
    if (k) {
      const id = k.dataset.pk, krok = krokiPlanu(st).find(x => x.id === id);
      if (id === 'karty') {
        const l = slowaPlanu(st).lista;
        if (!l.length) { oznaczKrok(st, 'karty'); app.zapisz(); return rysuj(); }
        stanPlanu(st).oczekuje = 'karty'; app.zapisz();
        return ctx.cwicz(l);
      }
      if (id === 'zwrot') return rysuj(true);
      if (id === 'cw') { oznaczKrok(st, 'cw'); app.zapisz(); return ctx.otworz(krok.kafel); }
      if (id === 'blad') { oznaczKrok(st, 'blad'); app.zapisz(); return app.cwiczBlad(krok.kat); }
      return;
    }
    const zw = e.target.closest('[data-plan-zw]');
    if (zw) { app.ocen(zwrotDnia(st).id, +zw.dataset.planZw); oznaczKrok(st, 'zwrot'); app.zapisz(); rysuj(); }
  });
  return { pokaz: () => rysuj() };
}

/** Krótki pasek na górze zakładki Słówka: „Plan na dziś 1/3 ›” (znika, gdy wszystko zrobione). */
export function pasekPlanu(st) {
  const kroki = krokiPlanu(st), zrob = kroki.filter(k => k.zrobione).length;
  if (zrob === kroki.length) return '';
  return `<button type="button" class="plan-pasek" data-plan-otworz><span aria-hidden="true">☀️</span><b>${tr('Plan na dziś', 'Plan de hoy')}</b><small>${zrob}/${kroki.length} · ${tr('ok. 5 minut', 'unos 5 minutos')}</small><span aria-hidden="true">›</span></button>`;
}
export { opisKategorii };
