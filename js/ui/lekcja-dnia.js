// Lekcja dnia (~3 minuty): słowo dnia, zwrot dnia, reguła dnia i mini-quiz z 3 pytań. Ta sama przez cały dzień.
import { $, esc, przyciskGlosu } from './wspolne.js';
import { SLOWKA, ZWROTY_LISTA, POZIOMY } from '../dane/index.js';
import { LEKCJE } from '../dane/lekcje-gramatyki.js';
import { RZECZOWNIKI, PRZYPADKI, zadanie } from '../przypadki.js';
import { wybierzNaDzien } from '../cwiczenia-logika.js';
import { dzien } from '../stan.js';
import { tasuj, czysc } from '../tekst.js';
import { HISP, t as tr } from '../jezyk.js';

export function widokLekcjiDnia(el, app, ctx) {
  const st = app.stan;
  let Q = null;
  function przygotuj() {
    const d = dzien(), i = POZIOMY.indexOf(st.ui.poziom);
    const slowaP = SLOWKA.filter(w => w.p === st.ui.poziom);
    const nowe = slowaP.filter(w => !st.srs[w.id]);
    const slowo = wybierzNaDzien(nowe.length ? nowe : slowaP, d, 's');
    const zwroty = ZWROTY_LISTA.filter(z => POZIOMY.indexOf(z.p) <= i);
    const zwrot = wybierzNaDzien(zwroty, d, 'z');
    const inneSl = tasuj(slowaP.filter(w => czysc(w.pl) !== czysc(slowo.pl))).slice(0, 3);
    const inneZw = tasuj(zwroty.filter(z => z.id !== zwrot.id)).slice(0, 3);
    let regula, pyt3;
    if (HISP) {
      const pr = wybierzNaDzien(PRZYPADKI.filter(p => p.k !== 'mian'), d, 'p'), r = wybierzNaDzien(RZECZOWNIKI, d, 'r');
      const z = zadanie(r, pr.k);
      regula = { t: `${pr.n} (${pr.pl}) – ${pr.pyt}`, akapity: [pr.o], przyklad: [z.zdanie.replace('___', z.odp), z.tlum] };
      const opcje = [...new Set(Object.values(r.formy))].filter(f => f !== z.odp).slice(0, 3);
      pyt3 = { tekst: z.zdanie, opcje: tasuj([z.odp, ...opcje]), odp: z.odp, wyj: `${pr.n}: ${z.zdanie.replace('___', z.odp)}` };
    } else {
      const lek = wybierzNaDzien(LEKCJE.filter(l => POZIOMY.indexOf(l.p) <= i), d, 'g');
      regula = { t: lek.t, akapity: lek.regula.slice(0, 2), przyklad: lek.przyklady[0], id: lek.id };
      const c = wybierzNaDzien(lek.cwiczenia, d, 'c');
      pyt3 = { tekst: c[0], opcje: tasuj(c[1]), odp: c[1][0], wyj: c[2] };
    }
    Q = { d, slowo, zwrot, regula, nr: 0, dobrze: 0, odp: false,
      pyt: [
        { tekst: slowo.es, tytul: tr('Słowo dnia – co znaczy?', 'Palabra del día: ¿qué significa?'), opcje: tasuj([slowo.pl, ...inneSl.map(w => w.pl)]), odp: slowo.pl, id: slowo.id, wyj: `${slowo.es} = ${slowo.pl}` },
        { tekst: zwrot.es, tytul: tr('Zwrot dnia – co znaczy?', 'Frase del día: ¿qué significa?'), opcje: tasuj([zwrot.pl, ...inneZw.map(z => z.pl)]), odp: zwrot.pl, id: zwrot.id, wyj: `${zwrot.es} = ${zwrot.pl}` },
        { ...pyt3, tytul: tr('Reguła dnia – uzupełnij', 'Regla del día: completa') },
      ] };
  }
  function nauka() {
    przygotuj();
    const zrobiona = (st.lekcjeDnia || {})[Q.d];
    const { slowo, zwrot, regula } = Q;
    el.innerHTML = `<p class="etykieta">${tr('Lekcja dnia', 'Lección del día')} · ${Q.d.split('-').reverse().join('.')}${zrobiona != null ? ` · ✓ ${zrobiona}/3` : ''}</p>
      <div class="ld-karta"><small>${tr('Słowo dnia', 'Palabra del día')}</small><b class="fiszka-slowo">${esc(slowo.es)}</b><span>${esc(slowo.pl)}</span>${przyciskGlosu(slowo.es)}
        ${slowo.przyklad ? `<p class="male">${esc(slowo.przyklad.es.replace(/\*/g, ''))}<br>${esc(slowo.przyklad.pl.replace(/\*/g, ''))}</p>` : ''}</div>
      <div class="ld-karta"><small>${tr('Zwrot dnia', 'Frase del día')}</small><b>${esc(zwrot.es)}</b><span>${esc(zwrot.pl)}</span>${przyciskGlosu(zwrot.es)}${zwrot.kiedy ? `<p class="male">${esc(zwrot.kiedy)}</p>` : ''}</div>
      <div class="ld-karta ld-karta--regula"><small>${tr('Reguła dnia', 'Regla del día')}</small><b>${esc(regula.t)}</b>${regula.akapity.map(a => `<p>${a}</p>`).join('')}
        <p class="male"><i>${esc(regula.przyklad[0])}</i> – ${esc(regula.przyklad[1])}</p>${regula.id ? `<button type="button" class="link" data-ld-lekcja="${regula.id}">${tr('Cała lekcja →', 'Lección completa →')}</button>` : ''}</div>
      <button type="button" class="btn btn--akcent btn--szeroki btn--duzy" data-ld-quiz>${tr('Mini-quiz (3 pytania)', 'Mini test (3 preguntas)')}</button>`;
  }
  function pytanie() {
    const q = Q.pyt[Q.nr]; Q.odp = false;
    el.innerHTML = `<div class="sesja-pasek"><div class="postep"><i style="width:${100 * Q.nr / 3}%"></i></div><span>${Q.nr + 1} / 3</span></div>
      <p class="egz-tytul">${esc(q.tytul)}</p><p class="egz-tekst">${esc(q.tekst).replace(/_{3,}/, '<span class="luka">___</span>')}</p>
      <div class="opcje">${q.opcje.map((o, i) => `<button type="button" class="opcja" data-ldo="${i}"><kbd>${i + 1}</kbd><span>${esc(o)}</span></button>`).join('')}</div>
      <div class="wynik" data-ldw hidden></div>`;
  }
  function odpowiedz(i) {
    if (Q.odp) return; Q.odp = true;
    const q = Q.pyt[Q.nr], ok = q.opcje[i] === q.odp;
    if (ok) Q.dobrze++;
    if (q.id) app.ocen(q.id, ok ? 3 : 1); else app.dodajAktywnosc(1);
    el.querySelectorAll('[data-ldo]').forEach(b => { b.disabled = true; const o = q.opcje[+b.dataset.ldo]; if (o === q.odp) b.classList.add('ok'); else if (+b.dataset.ldo === i) b.classList.add('zle'); });
    const w = $('[data-ldw]', el); w.hidden = false; w.className = 'wynik wynik--' + (ok ? 'ok' : 'zle');
    w.innerHTML = `<p>${ok ? tr('¡Correcto!', '¡Correcto! Dobrze!') : `${tr('Poprawnie', 'Correcto')}: <b>${esc(q.odp)}</b>`}</p><p class="male">${esc(q.wyj)}</p>
      <button type="button" class="btn btn--akcent btn--szeroki" data-ld-dalej>${Q.nr >= 2 ? tr('Zakończ lekcję', 'Terminar la lección') : tr('Dalej', 'Siguiente')} <kbd>Enter</kbd></button>`;
  }
  function dalej() {
    Q.nr++;
    if (Q.nr < 3) return pytanie();
    if (!st.lekcjeDnia) st.lekcjeDnia = {};
    const pierwszy = st.lekcjeDnia[Q.d] == null;
    st.lekcjeDnia[Q.d] = Math.max(st.lekcjeDnia[Q.d] || 0, Q.dobrze);
    if (pierwszy) { app.licz('lekcja'); app.dodajAktywnosc(3); } else app.zapisz();
    el.innerHTML = `<div class="podsumowanie"><p class="etykieta">${tr('Lekcja dnia zaliczona', 'Lección del día completada')} ☀️</p>
      <div class="liczby"><div><b>${Q.dobrze}/3</b><span>${tr('poprawnych', 'correctas')}</span></div><div><b>${st.licz.lekcja || 0}</b><span>${tr('lekcji łącznie', 'lecciones en total')}</span></div></div>
      <p class="male srodek">${tr('Nowa lekcja jutro. Słowo i zwrot dnia trafiły do Twoich powtórek.', 'Mañana habrá una nueva. La palabra y la frase del día se añadieron a tus repasos.')}</p>
      <button type="button" class="btn btn--szeroki" data-ld-pokaz>${tr('Wróć do lekcji', 'Volver a la lección')}</button></div>`;
    app.odswiez();
  }
  el.addEventListener('click', e => {
    const t = e.target;
    if (t.closest('[data-ld-quiz]')) return pytanie();
    const o = t.closest('[data-ldo]'); if (o) return odpowiedz(+o.dataset.ldo);
    if (t.closest('[data-ld-dalej]')) return dalej();
    if (t.closest('[data-ld-pokaz]')) return nauka();
    const l = t.closest('[data-ld-lekcja]'); if (l) return ctx.otworz('gramatyka', l.dataset.ldLekcja);
  });
  return {
    pokaz: nauka,
    klawisz(e) {
      if (!Q) return false;
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= 4 && !Q.odp && el.querySelector('[data-ldo]')) { odpowiedz(n - 1); return true; }
      if (e.key === 'Enter' && Q.odp && el.querySelector('[data-ld-dalej]')) { dalej(); return true; }
      return false;
    },
  };
}
