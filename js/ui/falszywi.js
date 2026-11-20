// Widok „Fałszywi przyjaciele”: lista słów, które wyglądają znajomo, a znaczą co innego, + quiz „co to naprawdę znaczy?”.
import { $, esc, przyciskGlosu } from './wspolne.js';
import { FALSZYWI, FALSZYWI_PL } from '../dane/falszywi.js';
import { tasuj } from '../tekst.js';
import { HISP, t as tr } from '../jezyk.js';

const DANE = (HISP ? FALSZYWI_PL : FALSZYWI).map(([s, mylne, znaczy, zamiast, prz, przT, p]) => ({ s, mylne, znaczy, zamiast, prz, przT, p }));
const bezNaw = t => t.replace(/\s*\([^)]*\)/g, '').trim();

export function widokFalszywych(el, app) {
  const Q = { pyt: [], nr: 0, dobrze: 0, odp: false };
  function lista() {
    Q.pyt = [];
    el.innerHTML = `<p class="etykieta">${tr('Fałszywi przyjaciele', 'Falsos amigos')} <span class="male">(${DANE.length})</span></p>
      <p class="male">${tr('Słowa, które wyglądają znajomo, a znaczą coś innego. Klasyczna wpadka: „Estoy embarazada” to nie „jestem zawstydzona”, tylko „jestem w ciąży”.', 'Palabras polacas que parecen españolas pero significan otra cosa. Por ejemplo, «cena» no es la comida de la noche, sino el precio.')}</p>
      <button type="button" class="btn btn--akcent btn--szeroki" data-fp-quiz>${tr('Quiz: co to naprawdę znaczy? (10 pytań)', 'Test: ¿qué significa de verdad? (10 preguntas)')}</button>
      <div class="fp-lista">${DANE.map(d => `<article class="fp-karta">
        <div class="fp-gora"><b>${esc(d.s)}</b><span class="chip">${d.p}</span>${przyciskGlosu(d.s)}</div>
        <p class="fp-nie">✗ ${tr('nie', 'no es')}: ${esc(d.mylne)}</p>
        <p class="fp-tak">✓ ${tr('znaczy', 'significa')}: <b>${esc(d.znaczy)}</b></p>
        ${d.zamiast && d.zamiast !== '—' ? `<p class="male">${tr('A „' + esc(bezNaw(d.mylne)) + '” to po hiszpańsku', '«' + esc(bezNaw(d.mylne)) + '» en polaco se dice')}: <b>${esc(d.zamiast)}</b></p>` : ''}
        <p class="fp-prz">${esc(d.prz)} ${przyciskGlosu(d.prz, tr('Posłuchaj zdania', 'Escuchar la frase'))}<small>${esc(d.przT)}</small></p></article>`).join('')}</div>`;
  }
  function startQuiz() {
    Q.pyt = tasuj(DANE).slice(0, 10).map(d => {
      const inne = tasuj(DANE.filter(x => x !== d)).slice(0, 2).map(x => x.znaczy);
      return { d, opcje: tasuj([d.znaczy, bezNaw(d.mylne), ...inne]) };
    });
    Q.nr = 0; Q.dobrze = 0; pytanie();
  }
  function pytanie() {
    const { d, opcje } = Q.pyt[Q.nr]; Q.odp = false;
    el.innerHTML = `<div class="sesja-pasek"><div class="postep"><i style="width:${10 * Q.nr}%"></i></div><span>${Q.nr + 1} / 10 · ${tr('dobrze', 'bien')} ${Q.dobrze}</span></div>
      <p class="egz-tytul">${tr('Co to naprawdę znaczy?', '¿Qué significa de verdad?')}</p>
      <div class="pytanie-duze">${esc(d.s)}</div>
      <div class="opcje">${opcje.map((o, i) => `<button type="button" class="opcja" data-fpo="${i}"><kbd>${i + 1}</kbd><span>${esc(o)}</span></button>`).join('')}</div>
      <div class="wynik" data-fpw hidden></div>`;
    app.mowa.powiedz(d.s);
  }
  function odpowiedz(i) {
    if (Q.odp) return; Q.odp = true;
    const { d, opcje } = Q.pyt[Q.nr], ok = opcje[i] === d.znaczy, pulapka = opcje[i] === bezNaw(d.mylne);
    if (ok) Q.dobrze++;
    app.dodajAktywnosc(1);
    el.querySelectorAll('[data-fpo]').forEach(b => { b.disabled = true; const o = opcje[+b.dataset.fpo]; if (o === d.znaczy) b.classList.add('ok'); else if (+b.dataset.fpo === i) b.classList.add('zle'); });
    const w = $('[data-fpw]', el); w.hidden = false; w.className = 'wynik wynik--' + (ok ? 'ok' : 'zle');
    w.innerHTML = `<p>${ok ? tr('¡Correcto!', '¡Correcto! Dobrze!') : pulapka ? tr('To właśnie pułapka! ', '¡Esa es la trampa! ') + `${tr('Znaczy', 'Significa')}: <b>${esc(d.znaczy)}</b>` : `${tr('Znaczy', 'Significa')}: <b>${esc(d.znaczy)}</b>`}</p>
      <p class="drill-pelne">${esc(d.prz)} ${przyciskGlosu(d.prz)}</p><p class="male">${esc(d.przT)}</p>
      <button type="button" class="btn btn--akcent btn--szeroki" data-fp-dalej>${Q.nr >= 9 ? tr('Zobacz wynik', 'Ver el resultado') : tr('Dalej', 'Siguiente')} <kbd>Enter</kbd></button>`;
  }
  function dalej() {
    Q.nr++;
    if (Q.nr < Q.pyt.length) return pytanie();
    app.licz('falszywi');
    el.innerHTML = `<div class="podsumowanie"><p class="etykieta">${tr('Wynik', 'Resultado')}</p><div class="liczby"><div><b>${Q.dobrze}/10</b><span>${tr('poprawnych', 'correctas')}</span></div></div>
      <div class="akcje-pion"><button type="button" class="btn btn--akcent btn--szeroki" data-fp-quiz>${tr('Jeszcze raz', 'Otra vez')}</button><button type="button" class="btn btn--szeroki" data-fp-lista>${tr('Lista słów', 'Lista de palabras')}</button></div></div>`;
    Q.pyt = [];
    app.odswiez();
  }
  el.addEventListener('click', e => {
    const t = e.target;
    if (t.closest('[data-fp-quiz]')) return startQuiz();
    if (t.closest('[data-fp-lista]')) return lista();
    const o = t.closest('[data-fpo]'); if (o) return odpowiedz(+o.dataset.fpo);
    if (t.closest('[data-fp-dalej]')) return dalej();
  });
  return {
    pokaz: lista,
    klawisz(e) {
      if (!Q.pyt.length) return false;
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= 4 && !Q.odp) { odpowiedz(n - 1); return true; }
      if (e.key === 'Enter' && Q.odp) { dalej(); return true; }
      return false;
    },
  };
}
