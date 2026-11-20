// Dyktando: lektor czyta zdanie, wpisujesz je w całości; błędy zaznaczone znak po znaku.
import { $, esc, IKONY } from './wspolne.js';
import { porownajDyktando } from '../cwiczenia-logika.js';
import { tasuj } from '../tekst.js';
import { t as tr, CEL } from '../jezyk.js';
import { zdania } from './pula.js';

const KL = { ok: 'd-ok', zle: 'd-zle', brak: 'd-brak', nadmiar: 'd-nadmiar', akcent: 'd-akcent' };

export function widokDyktanda(el, app) {
  const D = { lista: [], nr: 0, suma: 0, zrobione: false };
  function start() { D.lista = tasuj(zdania(app.stan.ui.poziom)).slice(0, 8); D.nr = 0; D.suma = 0; pytanie(); }
  function pytanie() {
    const z = D.lista[D.nr]; D.zrobione = false;
    el.innerHTML = `<p class="etykieta">${tr('Dyktando', 'Dictado')}</p>
      <div class="sesja-pasek"><div class="postep"><i style="width:${100 * D.nr / D.lista.length}%"></i></div><span>${D.nr + 1} / ${D.lista.length}</span></div>
      <div class="sluchaj"><button type="button" class="btn btn--akcent btn--duzy" data-dk-graj>${IKONY.glos}<span>${tr('Odtwórz', 'Reproducir')}</span></button><button type="button" class="btn" data-dk-wolno>${IKONY.wolno}<span>${tr('Wolniej', 'Más lento')}</span></button></div>
      <p class="male srodek">${tr('Wpisz całe zdanie, które słyszysz. Interpunkcja i wielkie litery nie mają znaczenia.', 'Escribe la frase completa que oyes. La puntuación y las mayúsculas no cuentan.')}</p>
      <form class="dk-form" data-dk-form autocomplete="off">
        <textarea class="pole" data-dk-wpis rows="2" lang="${CEL}" data-znaki autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="${tr('Twoje zdanie', 'Tu frase')}"></textarea>
        <button type="submit" class="btn btn--akcent btn--szeroki" data-dk-sprawdz>${tr('Sprawdź', 'Comprobar')}</button>
      </form>
      <div class="wynik" data-dk-wynik hidden></div>`;
    setTimeout(() => app.mowa.powiedz(z.es), 250);
  }
  function sprawdzD() {
    if (D.zrobione) return dalej();
    const z = D.lista[D.nr], wpis = $('[data-dk-wpis]', el).value;
    if (!wpis.trim()) return;
    D.zrobione = true;
    const r = porownajDyktando(z.es, wpis);
    D.suma += r.proc;
    app.dodajAktywnosc(1); app.licz('dyktando');
    const w = $('[data-dk-wynik]', el);
    w.hidden = false; w.className = 'wynik wynik--' + (r.proc >= 95 ? 'ok' : r.proc >= 70 ? 'uwaga' : 'zle');
    w.innerHTML = `<p><b>${r.proc}%</b> · ${r.bledy ? `${tr('błędy', 'errores')}: ${r.bledy}` : tr('bez błędów', 'sin errores')}${r.akcenty ? ` · ${tr('akcenty', 'tildes')}: ${r.akcenty}` : ''}</p>
      <p class="dk-diff">${r.segmenty.map(s => `<span class="${KL[s.k]}">${esc(s.t)}</span>`).join('')}</p>
      <p class="drill-pelne">${esc(z.es)}</p><p class="male">${esc(z.pl)}</p>
      <p class="dk-legenda"><span class="d-zle">${tr('błąd', 'error')}</span> <span class="d-brak">${tr('brakuje', 'falta')}</span> <span class="d-nadmiar">${tr('zbędne', 'sobra')}</span> <span class="d-akcent">${tr('akcent', 'tilde')}</span></p>`;
    $('[data-dk-sprawdz]', el).innerHTML = `${D.nr + 1 >= D.lista.length ? tr('Zobacz wynik', 'Ver el resultado') : tr('Dalej', 'Siguiente')} <kbd>Enter</kbd>`;
  }
  function dalej() {
    D.nr++;
    if (D.nr < D.lista.length) return pytanie();
    const sr = Math.round(D.suma / D.lista.length);
    el.innerHTML = `<div class="podsumowanie"><p class="etykieta">${tr('Dyktando – wynik', 'Dictado – resultado')}</p><div class="liczby"><div><b>${sr}%</b><span>${tr('średnia dokładność', 'precisión media')}</span></div></div>
      <button type="button" class="btn btn--akcent btn--szeroki" data-dk-nowe>${tr('Nowe dyktando', 'Nuevo dictado')}</button></div>`;
    app.odswiez();
  }
  el.addEventListener('submit', e => { if (e.target.matches('[data-dk-form]')) { e.preventDefault(); sprawdzD(); } });
  el.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey && e.target.matches('[data-dk-wpis]')) { e.preventDefault(); sprawdzD(); } });
  el.addEventListener('click', e => {
    const t = e.target;
    if (t.closest('[data-dk-graj]')) return app.mowa.powiedz(D.lista[D.nr].es);
    if (t.closest('[data-dk-wolno]')) return app.mowa.powiedz(D.lista[D.nr].es, { wolniej: true });
    if (t.closest('[data-dk-nowe]')) return start();
  });
  return { pokaz: start, klawisz(e) { if (e.key === 'Enter' && D.zrobione) { dalej(); return true; } return false; } };
}
