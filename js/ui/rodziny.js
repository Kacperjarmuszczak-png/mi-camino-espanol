// Rodziny wyrazów (trabajar → trabajo → trabajador) oraz synonimy i antonimy – lista i quiz.
import { $, esc, przyciskGlosu } from './wspolne.js';
import { RODZINY, CZESCI, SYNONIMY, ANTONIMY } from '../dane/rodziny.js';
import { tasuj, losowy, czysc } from '../tekst.js';

function quizWidok(el, app, { tytul, opis, generuj, lista, licznik }) {
  const Q = { pyt: [], nr: 0, dobrze: 0, odp: false };
  function menu() {
    Q.pyt = [];
    el.innerHTML = `<p class="etykieta">${tytul}</p><p class="male">${opis}</p>
      <button type="button" class="btn btn--akcent btn--szeroki" data-q-start>Quiz (10 pytań)</button>${lista()}`;
  }
  function start() { Q.pyt = Array.from({ length: 10 }, generuj); Q.nr = 0; Q.dobrze = 0; pytanie(); }
  function pytanie() {
    const q = Q.pyt[Q.nr]; Q.odp = false;
    el.innerHTML = `<div class="sesja-pasek"><div class="postep"><i style="width:${10 * Q.nr}%"></i></div><span>${Q.nr + 1} / 10 · dobrze ${Q.dobrze}</span></div>
      <p class="egz-tytul">${q.tytul}</p><div class="pytanie-duze">${esc(q.tekst)}</div>${q.pod ? `<p class="male srodek">${esc(q.pod)}</p>` : ''}
      <div class="opcje">${q.opcje.map((o, i) => `<button type="button" class="opcja" data-qo="${i}"><kbd>${i + 1}</kbd><span>${esc(o)}</span></button>`).join('')}</div>
      <div class="wynik" data-qw hidden></div>`;
  }
  function odp(i) {
    if (Q.odp) return; Q.odp = true;
    const q = Q.pyt[Q.nr], ok = q.opcje[i] === q.odp;
    if (ok) Q.dobrze++;
    app.dodajAktywnosc(1);
    el.querySelectorAll('[data-qo]').forEach(b => { b.disabled = true; const o = q.opcje[+b.dataset.qo]; if (o === q.odp) b.classList.add('ok'); else if (+b.dataset.qo === i) b.classList.add('zle'); });
    const w = $('[data-qw]', el); w.hidden = false; w.className = 'wynik wynik--' + (ok ? 'ok' : 'zle');
    w.innerHTML = `<p>${ok ? '¡Correcto!' : `Poprawnie: <b>${esc(q.odp)}</b>`} ${przyciskGlosu(q.odp)}</p>${q.wyj ? `<p class="male">${q.wyj}</p>` : ''}
      <button type="button" class="btn btn--akcent btn--szeroki" data-q-dalej>${Q.nr >= 9 ? 'Zobacz wynik' : 'Dalej'} <kbd>Enter</kbd></button>`;
    app.mowa.powiedz(q.odp);
  }
  function dalej() {
    Q.nr++;
    if (Q.nr < 10) return pytanie();
    app.licz(licznik);
    el.innerHTML = `<div class="podsumowanie"><p class="etykieta">Wynik</p><div class="liczby"><div><b>${Q.dobrze}/10</b><span>poprawnych</span></div></div>
      <div class="akcje-pion"><button type="button" class="btn btn--akcent btn--szeroki" data-q-start>Jeszcze raz</button><button type="button" class="btn btn--szeroki" data-q-menu>Lista</button></div></div>`;
    Q.pyt = []; app.odswiez();
  }
  el.addEventListener('click', e => {
    const t = e.target;
    if (t.closest('[data-q-start]')) return start();
    if (t.closest('[data-q-menu]')) return menu();
    const o = t.closest('[data-qo]'); if (o) return odp(+o.dataset.qo);
    if (t.closest('[data-q-dalej]')) return dalej();
  });
  return {
    pokaz: menu,
    klawisz(e) {
      if (!Q.pyt.length) return false;
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= 4 && !Q.odp) { odp(n - 1); return true; }
      if (e.key === 'Enter' && Q.odp) { dalej(); return true; }
      return false;
    },
  };
}

export function widokRodzin(el, app) {
  return quizWidok(el, app, {
    tytul: 'Rodziny wyrazów', licznik: 'rodziny',
    opis: 'Jedno słowo prowadzi do kolejnych: trabajar (pracować) → el trabajo (praca) → el trabajador (pracownik). Ucząc się całej rodziny, poznajesz kilka słów naraz.',
    lista: () => `<div class="fp-lista">${RODZINY.map(r => `<article class="fp-karta">${r.map(([es, pl, c]) => `<p class="rd-wiersz"><span class="chip">${CZESCI[c]}</span><b>${esc(es)}</b><span class="male">${esc(pl)}</span></p>`).join('')}</article>`).join('')}</div>`,
    generuj() {
      const r = losowy(RODZINY), [baza, cel] = tasuj(r).slice(0, 2);
      const inne = tasuj(RODZINY.filter(x => x !== r).flatMap(x => x).filter(x => x[2] === cel[2] || (cel[2].startsWith('rz') && x[2].startsWith('rz')))).slice(0, 2).map(x => x[0]);
      const zRodziny = r.filter(x => x !== cel && x !== baza).map(x => x[0]);
      const opcje = tasuj([cel[0], ...[...zRodziny, ...inne].filter((x, i, a) => a.indexOf(x) === i && x !== cel[0]).slice(0, 3)]);
      return { tytul: `${CZESCI[cel[2]][0].toUpperCase() + CZESCI[cel[2]].slice(1)} od tego słowa (${cel[1]})?`, tekst: baza[0], pod: baza[1], opcje, odp: cel[0],
        wyj: r.map(([es, pl]) => `${esc(es)} – ${esc(pl)}`).join(' · ') };
    },
  });
}

export function widokSynonimow(el, app) {
  return quizWidok(el, app, {
    tytul: 'Synonimy i antonimy', licznik: 'synonimy',
    opis: 'Synonim znaczy to samo (empezar = comenzar), antonim – przeciwieństwo (rápido ↔ lento).',
    lista: () => `<p class="etykieta">Synonimy</p><ul class="lista lista--zwarta">${SYNONIMY.map(([a, b, pl]) => `<li><div class="lista-tekst"><b>${esc(a)} = ${esc(b)}</b><span>${esc(pl)}</span></div></li>`).join('')}</ul>
      <p class="etykieta">Antonimy</p><ul class="lista lista--zwarta">${ANTONIMY.map(([a, b, pl]) => `<li><div class="lista-tekst"><b>${esc(a)} ↔ ${esc(b)}</b><span>${esc(pl)}</span></div></li>`).join('')}</ul>`,
    generuj() {
      const syn = Math.random() < 0.5, zb = syn ? SYNONIMY : ANTONIMY, para = losowy(zb);
      const [slowo, odp] = Math.random() < 0.5 ? [para[0], para[1]] : [para[1], para[0]];
      const inne = tasuj(zb.filter(x => x !== para).flatMap(x => [x[0], x[1]])).filter(x => czysc(x) !== czysc(odp) && czysc(x) !== czysc(slowo)).slice(0, 3);
      return { tytul: syn ? 'Synonim (to samo znaczenie)?' : 'Antonim (przeciwieństwo)?', tekst: slowo, pod: para[2], opcje: tasuj([odp, ...inne]), odp,
        wyj: `${esc(para[0])} ${syn ? '=' : '↔'} ${esc(para[1])} (${esc(para[2])})` };
    },
  });
}
