// Widok „Twoje częste błędy”: kategorie pomyłek z regułą, przykładami i przyciskiem „Ćwicz”.
import { esc } from './wspolne.js';
import { czesteBledy, opisKategorii } from '../bledy.js';
import { t as tr } from '../jezyk.js';

export function mylone(st, ile = 12) {
  return Object.entries(st.srs).filter(([, s]) => s.zle > 0).sort((a, b) => b[1].zle - a[1].zle).slice(0, ile).map(([id]) => id);
}

export function widokBledow(el, app) {
  const st = app.stan;
  function rysuj() {
    const lista = czesteBledy(st, { min: 1 });
    const myl = mylone(st);
    const pozycja = (kat, b) => { const o = opisKategorii(kat, b); return `<li class="blad-kat">
      <div><b>${esc(o.n)}</b> <span class="znacznik znacznik--nauka">${b.n}×</span></div>
      <p class="male">${esc(o.r)}</p>
      ${b.prz && b.prz.length ? `<p class="blad-prz">${b.prz.map(p => `<span>${esc(p)}</span>`).join('')}</p>` : ''}
      ${o.akcja ? `<button type="button" class="btn btn--male btn--akcent" data-bk="${esc(kat)}">${tr('Ćwicz to', 'Practicar')}</button>` : ''}</li>`; };
    el.innerHTML = `<div class="bledy-widok">
      <p class="etykieta">${tr('Twoje częste błędy', 'Tus errores frecuentes')}</p>
      <p class="male">${tr('Aplikacja zapisuje, w czym się mylisz (akcenty, rodzajniki, czasy, reguły gramatyki), i podsuwa krótką powtórkę właśnie z tego.', 'La app guarda en qué te equivocas y te propone un repaso corto de eso.')}</p>
      ${lista.length || myl.length ? `<ul class="lista bledy-lista">
        ${myl.length ? pozycja('slowa', { n: myl.length, prz: myl.slice(0, 4).map(id => { const x = app.dane.get(id); return x ? x.es : ''; }).filter(Boolean) }) : ''}
        ${lista.map(b => pozycja(b.kat, b)).join('')}</ul>
        ${lista.length ? `<button type="button" class="btn btn--cichy btn--szeroki" data-bk-wyczysc>${tr('Wyczyść listę błędów', 'Borrar la lista de errores')}</button>` : ''}`
        : `<p class="pusto">${tr('Na razie nic – po kilku ćwiczeniach zobaczysz tu, co sprawia Ci najwięcej kłopotu.', 'Todavía nada: después de unos ejercicios verás aquí lo que más te cuesta.')}</p>`}
    </div>`;
  }
  el.addEventListener('click', e => {
    const b = e.target.closest('[data-bk]'); if (b) return app.cwiczBlad(b.dataset.bk);
    if (e.target.closest('[data-bk-wyczysc]')) { st.bledyTyp = {}; app.zapisz(); rysuj(); }
  });
  return { pokaz: rysuj };
}
