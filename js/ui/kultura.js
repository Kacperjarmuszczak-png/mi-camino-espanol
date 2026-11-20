// Widok „Kultura”: krótkie notatki o Hiszpanii i Ameryce Łacińskiej + słówka z tematu i ćwiczenie z nich.
import { esc, przyciskGlosu, przyciskGwiazdki } from './wspolne.js';
import { KULTURA } from '../dane/kultura.js';
import { POD_ID } from '../dane/index.js';

export function widokKultury(el, app, ctx) {
  const slowaNotatki = k => k.slowa.split(';').map(w => POD_ID.get('w:' + w.split('|')[0])).filter(Boolean);
  function lista() {
    el.innerHTML = `<p class="etykieta">Kultura i zwyczaje</p>
      <div class="ku-lista">${KULTURA.map(k => `<button type="button" class="cw-kafel cw-kafel--szeroki" data-ku="${k.id}"><span class="cw-ik">${k.flaga}</span><b>${esc(k.t)} <span class="chip">${k.p}</span></b><small>${esc(k.tEs)}${(app.stan.licz['kultura:' + k.id]) ? ' · ✓' : ''}</small></button>`).join('')}</div>`;
  }
  function notatka(id) {
    const k = KULTURA.find(x => x.id === id); if (!k) return lista();
    const sl = slowaNotatki(k);
    if (!app.stan.licz['kultura:' + k.id]) app.licz('kultura:' + k.id);
    el.innerHTML = `<div class="gr"><div class="gr-naglowek"><span class="ku-flaga">${k.flaga}</span><h2>${esc(k.t)}</h2></div>
      <div class="gr-regula">${k.tekst.map(p => `<p>${esc(p)}</p>`).join('')}</div>
      <p class="etykieta">Słówka z tematu</p>
      <ul class="lista lista--zwarta">${sl.map(x => `<li><div class="lista-tekst"><b>${esc(x.es)}</b><span>${esc(x.pl)}</span></div>${przyciskGlosu(x.es)}${przyciskGwiazdki(x.id, app.stan.ulub[x.id])}</li>`).join('')}</ul>
      <div class="akcje-pion"><button type="button" class="btn btn--akcent btn--szeroki" data-ku-cwicz="${k.id}">Ćwicz te słówka</button><button type="button" class="btn btn--szeroki" data-ku-lista>Wszystkie notatki</button></div></div>`;
    scrollTo({ top: 0 });
  }
  el.addEventListener('click', e => {
    const t = e.target;
    const k = t.closest('[data-ku]'); if (k) return notatka(k.dataset.ku);
    if (t.closest('[data-ku-lista]')) return lista();
    const c = t.closest('[data-ku-cwicz]'); if (c) return ctx.cwicz(slowaNotatki(KULTURA.find(x => x.id === c.dataset.kuCwicz)));
  });
  return { pokaz: lista };
}
