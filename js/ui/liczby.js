// Trener liczb, cen i godzin: lektor czyta, wpisujesz cyfry. Zakres liczb rośnie z poziomem.
import { $, esc, IKONY } from './wspolne.js';
import { liczbaEs, cenaEs, godzinaEs, liczbaPl, cenaPl } from '../liczby.js';
import { HISP, t as tr, CEL } from '../jezyk.js';

const ZAKRES = { A1: 100, A2: 1000, B1: 9999, B2: 9999, C1: 9999, C2: 9999 };
const los = n => Math.floor(Math.random() * n);

export function widokLiczb(el, app) {
  const ui = app.stan.ui;
  const G = { tryb: HISP && ui.lTryb === 'godziny' ? 'liczby' : ui.lTryb || 'liczby', nr: 0, dobrze: 0, pyt: null, zrobione: false };
  const TRYBY = HISP ? [['liczby', 'Números'], ['ceny', 'Precios']] : [['liczby', 'Liczby'], ['ceny', 'Ceny'], ['godziny', 'Godziny']];
  function nowe() {
    const max = ZAKRES[ui.poziom] || 100;
    if (G.tryb === 'liczby') { const n = los(max + 1); return { slowa: HISP ? liczbaPl(n) : liczbaEs(n), odp: [String(n)], pokaz: String(n) }; }
    if (G.tryb === 'ceny') {
      const e = 1 + los(Math.min(max, 200)), c = [0, 5, 10, 20, 25, 30, 45, 50, 75, 90, 95, 99][los(12)];
      const t = c ? `${e},${String(c).padStart(2, '0')}` : String(e);
      return { slowa: HISP ? cenaPl(e, c) : cenaEs(e, c), odp: [t, t.replace(',', '.'), c && c % 10 === 0 ? `${e},${c / 10}` : t], pokaz: t + (HISP ? ' zł' : ' €') };
    }
    const h = 1 + los(12), m = 5 * los(12);
    const mm = String(m).padStart(2, '0');
    return { slowa: godzinaEs(h, m), odp: [`${h}:${mm}`, `${h + 12}:${mm}`, `${h}.${mm}`, `${h + 12}.${mm}`, `${String(h).padStart(2, '0')}:${mm}`], pokaz: `${h}:${mm}` };
  }
  function start() { G.nr = 0; G.dobrze = 0; pytanie(); }
  function pytanie() {
    G.pyt = nowe(); G.zrobione = false;
    el.innerHTML = `<div class="seg seg--pelny" role="group" aria-label="${tr('Rodzaj', 'Tipo')}">${TRYBY.map(([k, n]) => `<button type="button" data-lt="${k}" aria-pressed="${k === G.tryb}">${n}</button>`).join('')}</div>
      <div class="sesja-pasek"><div class="postep"><i style="width:${10 * G.nr}%"></i></div><span>${G.nr + 1} / 10 · ${tr('dobrze', 'bien')} ${G.dobrze}</span></div>
      <div class="sluchaj"><button type="button" class="btn btn--akcent btn--duzy" data-lg>${IKONY.glos}<span>${tr('Odtwórz', 'Reproducir')}</span></button><button type="button" class="btn" data-lw>${IKONY.wolno}<span>${tr('Wolniej', 'Más lento')}</span></button></div>
      <p class="male srodek">${G.tryb === 'liczby' ? tr('Wpisz liczbę cyframi.', 'Escribe el número en cifras.') : G.tryb === 'ceny' ? tr('Wpisz cenę, np. 23,50.', 'Escribe el precio, p. ej. 23,50.') : 'Wpisz godzinę, np. 4:45.'}</p>
      <form class="pole-odp" data-lf autocomplete="off"><input class="pole" data-lwpis inputmode="decimal" aria-label="${tr('Odpowiedź', 'Respuesta')}"><button type="submit" class="btn btn--akcent" data-ls>${tr('Sprawdź', 'Comprobar')}</button></form>
      <div class="wynik" data-lwyn hidden></div>`;
    setTimeout(() => app.mowa.powiedz(G.pyt.slowa), 200);
    if (matchMedia('(pointer: fine)').matches) setTimeout(() => { const i = $('[data-lwpis]', el); if (i) i.focus(); }, 30);
  }
  function sprawdz() {
    if (G.zrobione) return dalej();
    const w = $('[data-lwpis]', el).value.trim().replace(/\s/g, '').replace(/[€zł]/g, '');
    if (!w) return;
    G.zrobione = true;
    const ok = G.pyt.odp.includes(w) || G.pyt.odp.includes(w.replace(/^0+(\d)/, '$1'));
    if (ok) G.dobrze++;
    app.dodajAktywnosc(1);
    const r = $('[data-lwyn]', el); r.hidden = false; r.className = 'wynik wynik--' + (ok ? 'ok' : 'zle');
    r.innerHTML = `<p><b>${esc(G.pyt.pokaz)}</b> – ${esc(G.pyt.slowa)}</p>
      <button type="button" class="btn btn--akcent btn--szeroki" data-ld>${G.nr >= 9 ? tr('Zobacz wynik', 'Ver el resultado') : tr('Dalej', 'Siguiente')} <kbd>Enter</kbd></button>`;
    $('[data-ls]', el).textContent = tr('Dalej', 'Siguiente');
  }
  function dalej() {
    G.nr++;
    if (G.nr < 10) return pytanie();
    app.rekord('liczby', G.dobrze);
    el.innerHTML = `<div class="podsumowanie"><p class="etykieta">${tr('Wynik', 'Resultado')}</p><div class="liczby"><div><b>${G.dobrze}/10</b><span>${tr('poprawnych', 'correctas')}</span></div></div>
      <button type="button" class="btn btn--akcent btn--szeroki" data-lnowe>${tr('Jeszcze raz', 'Otra vez')}</button></div>`;
    app.odswiez();
  }
  el.addEventListener('submit', e => { if (e.target.matches('[data-lf]')) { e.preventDefault(); sprawdz(); } });
  el.addEventListener('click', e => {
    const t = e.target;
    const tb = t.closest('[data-lt]'); if (tb) { G.tryb = ui.lTryb = tb.dataset.lt; app.zapisz(); return start(); }
    if (t.closest('[data-lg]')) return app.mowa.powiedz(G.pyt.slowa);
    if (t.closest('[data-lw]')) return app.mowa.powiedz(G.pyt.slowa, { wolniej: true });
    if (t.closest('[data-ld]')) return dalej();
    if (t.closest('[data-lnowe]')) return start();
  });
  return { pokaz: start, klawisz(e) { if (e.key === 'Enter' && G.zrobione) { dalej(); return true; } return false; } };
}
export { CEL };
