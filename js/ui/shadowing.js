// Shadowing: lektor mówi zdanie, a Ty od razu je powtarzasz; mikrofon ocenia podobieństwo.
import { $, esc, IKONY } from './wspolne.js';
import { ocenWymowe, tasuj } from '../tekst.js';
import { rozpoznawanieDostepne, sluchaj, przerwijSluchanie } from '../rozpoznawanie.js';
import { HISP, t as tr } from '../jezyk.js';
import { zdania } from './pula.js';

export function widokShadowingu(el, app) {
  const S = { lista: [], nr: 0, suma: 0, tekst: true, zrobione: false };
  const jezyk = () => (HISP ? 'pl-PL' : app.stan.ust.wariant === 'latam' ? 'es-MX' : 'es-ES');
  function start() { S.lista = tasuj(zdania(app.stan.ui.poziom)).slice(0, 8); S.nr = 0; S.suma = 0; rysuj(); }
  function rysuj(info = '') {
    const z = S.lista[S.nr];
    el.innerHTML = `<p class="etykieta">Shadowing</p>
      <div class="sesja-pasek"><div class="postep"><i style="width:${100 * S.nr / S.lista.length}%"></i></div><span>${S.nr + 1} / ${S.lista.length}</span></div>
      <div class="ld-karta"><small>${tr('Powtórz za lektorem', 'Repite después de la voz')}</small>
        ${S.tekst ? `<b class="sh-zdanie">${esc(z.es)}</b>` : `<b class="sh-zdanie sh-ukryte">• • •</b>`}<span class="male">${esc(z.pl)}</span></div>
      <label class="przelacznik przelacznik--maly"><input type="checkbox" data-sh-tekst ${S.tekst ? 'checked' : ''}><span></span>${tr('Pokazuj tekst (wyłącz dla trudniejszej wersji)', 'Mostrar el texto (desactívalo para más dificultad)')}</label>
      <button type="button" class="btn btn--akcent btn--szeroki btn--duzy" data-sh-start>${IKONY.glos}<span>${S.zrobione ? tr('Jeszcze raz', 'Otra vez') : tr('Słuchaj i powtórz', 'Escucha y repite')}</span></button>
      <p class="srodek male" data-sh-info>${info || (rozpoznawanieDostepne() ? tr('Po zdaniu lektora mikrofon włączy się sam – powtórz od razu.', 'Tras la frase se activará el micrófono: repite enseguida.') : tr('Ta przeglądarka nie rozpoznaje mowy – powtarzaj na głos i oceń się sam.', 'Este navegador no reconoce la voz: repite en voz alta y evalúate tú.'))}</p>
      <div data-sh-wynik></div>`;
  }
  function wynik(html, proc) {
    S.zrobione = true;
    if (proc != null) { S.suma += proc; app.dodajAktywnosc(1); if (proc >= 85) app.licz('mow'); }
    $('[data-sh-wynik]', el).innerHTML = `${html}<button type="button" class="btn btn--szeroki" data-sh-dalej>${S.nr + 1 >= S.lista.length ? tr('Zobacz wynik', 'Ver el resultado') : tr('Następne zdanie', 'Siguiente frase')} <kbd>Enter</kbd></button>`;
  }
  function graj() {
    const z = S.lista[S.nr], info = () => $('[data-sh-info]', el);
    przerwijSluchanie();
    info().textContent = tr('Słuchaj…', 'Escucha…');
    app.mowa.powiedz(z.es, { koniec: async () => {
      if (!rozpoznawanieDostepne()) {
        info().textContent = tr('Powtórz teraz na głos.', 'Repite ahora en voz alta.');
        return wynik(`<div class="akcje-poziom"><button type="button" class="btn" data-sh-sam="1">${tr('Powtórzyłem dobrze', 'Lo repetí bien')}</button><button type="button" class="btn btn--cichy" data-sh-sam="0">${tr('Jeszcze nie', 'Todavía no')}</button></div>`, null);
      }
      info().textContent = tr('🎙️ Teraz Ty!', '🎙️ ¡Ahora tú!');
      try {
        const alt = await sluchaj(jezyk(), { oczekiwane: [z.es] });
        const o = ocenWymowe(alt, [z.es]);
        info().textContent = '';
        wynik(`<div class="wynik wynik--${o.proc >= 85 ? 'ok' : o.proc >= 60 ? 'uwaga' : 'zle'}"><p><b>${o.proc}%</b> · ${o.proc >= 85 ? tr('świetnie!', '¡muy bien!') : o.proc >= 60 ? tr('prawie', 'casi') : tr('spróbuj jeszcze raz', 'inténtalo otra vez')}</p><p class="male">${tr('Usłyszałem', 'He oído')}: „${esc(o.slyszane)}”</p><p class="drill-pelne">${esc(z.es)}</p></div>`, o.proc);
      } catch (e) {
        info().textContent = e.message === 'zgoda' ? tr('Brak dostępu do mikrofonu.', 'Sin acceso al micrófono.') : tr('Nic nie usłyszałem – stuknij i spróbuj jeszcze raz.', 'No he oído nada: toca y vuelve a intentarlo.');
      }
    } });
  }
  function dalej() {
    S.nr++; S.zrobione = false;
    if (S.nr < S.lista.length) return rysuj();
    const sr = Math.round(S.suma / S.lista.length);
    el.innerHTML = `<div class="podsumowanie"><p class="etykieta">Shadowing – ${tr('wynik', 'resultado')}</p><div class="liczby"><div><b>${sr}%</b><span>${tr('średnie podobieństwo', 'parecido medio')}</span></div></div>
      <button type="button" class="btn btn--akcent btn--szeroki" data-sh-nowe>${tr('Nowe zdania', 'Nuevas frases')}</button></div>`;
    app.odswiez();
  }
  el.addEventListener('change', e => { if (e.target.matches('[data-sh-tekst]')) { S.tekst = e.target.checked; rysuj(); } });
  el.addEventListener('click', e => {
    const t = e.target;
    if (t.closest('[data-sh-start]')) return graj();
    const s = t.closest('[data-sh-sam]'); if (s) { S.suma += s.dataset.shSam === '1' ? 100 : 40; app.dodajAktywnosc(1); return dalej(); }
    if (t.closest('[data-sh-dalej]')) return dalej();
    if (t.closest('[data-sh-nowe]')) return start();
  });
  return { pokaz: start, klawisz(e) { if (e.key === 'Enter' && S.zrobione) { dalej(); return true; } return false; } };
}
