// Gra Memory: odkryj dwie karty i znajdź pary słowo – tłumaczenie. Liczy ruchy i czas, zapisuje rekord.
import { esc } from './wspolne.js';
import { tasuj } from '../tekst.js';
import { t as tr } from '../jezyk.js';
import { slowaGry, pierwszeZnaczenie } from './gry-pula.js';

export function widokMemory(el, app) {
  const G = { karty: [], odkryte: [], znalezione: 0, ruchy: 0, start: 0, blok: false, timer: null };
  function start() {
    const wybor = tasuj(slowaGry(app.stan.ui.poziom)).filter((x, i, a) => a.findIndex(y => pierwszeZnaczenie(y.w.pl) === pierwszeZnaczenie(x.w.pl)) === i).slice(0, 6);
    G.karty = tasuj(wybor.flatMap((x, i) => [{ para: i, t: x.w.es, jez: 'cel', w: x.w }, { para: i, t: pierwszeZnaczenie(x.w.pl), jez: 'moj', w: x.w }]));
    G.odkryte = []; G.znalezione = 0; G.ruchy = 0; G.start = Date.now(); G.blok = false;
    clearInterval(G.timer); G.timer = setInterval(zegar, 1000);
    rysuj();
  }
  const czas = () => Math.floor((Date.now() - G.start) / 1000);
  function zegar() { const z = el.querySelector('[data-mem-czas]'); if (z) z.textContent = `${czas()} s`; }
  function rysuj() {
    el.innerHTML = `<div class="wz-gora"><span class="chip">${tr('Ruchy', 'Movimientos')}: ${G.ruchy}</span><span class="chip">${G.znalezione}/6</span><span class="zegar" data-mem-czas>${czas()} s</span></div>
      <div class="mem-siatka">${G.karty.map((k, i) => { const widoczna = k.ok || G.odkryte.includes(i); return `<button type="button" class="mem-karta${widoczna ? ' odkryta' : ''}${k.ok ? ' ok' : ''}${k.jez === 'cel' ? ' cel' : ''}" data-mem="${i}" ${k.ok ? 'disabled' : ''}>${widoczna ? esc(k.t) : '<span aria-hidden="true">?</span>'}</button>`; }).join('')}</div>
      <p class="male srodek">${tr('Połącz słowo z tłumaczeniem. Rekord', 'Une la palabra con su traducción. Récord')}: ${app.stan.rekordy.memory ? app.stan.rekordy.memory + ' s' : '–'}</p>`;
  }
  function klik(i) {
    if (G.blok || G.karty[i].ok || G.odkryte.includes(i)) return;
    G.odkryte.push(i);
    const k = G.karty[i];
    if (k.jez === 'cel') app.mowa.powiedz(k.t);
    if (G.odkryte.length === 2) {
      G.ruchy++;
      const [a, b] = G.odkryte.map(j => G.karty[j]);
      if (a.para === b.para && a.jez !== b.jez) {
        a.ok = b.ok = true; G.odkryte = []; G.znalezione++;
        app.ocen(a.w.id, 3);
        if (G.znalezione === 6) return koniec();
      } else { G.blok = true; setTimeout(() => { G.odkryte = []; G.blok = false; rysuj(); }, 900); }
    }
    rysuj();
  }
  function koniec() {
    clearInterval(G.timer);
    const s = czas(), stary = app.stan.rekordy.memory;
    const rekord = !stary || s < stary;
    if (rekord) { app.stan.rekordy.memory = s; app.zapisz(); }
    el.innerHTML = `<div class="podsumowanie"><p class="etykieta">Memory ✓</p><div class="liczby"><div><b>${s} s</b><span>${tr('czas', 'tiempo')}</span></div><div><b>${G.ruchy}</b><span>${tr('ruchów', 'movimientos')}</span></div></div>
      ${rekord ? `<p class="srodek tekst-ok"><b>${tr('Nowy rekord!', '¡Nuevo récord!')} 🎉</b></p>` : ''}<button type="button" class="btn btn--akcent btn--szeroki" data-mem-nowa>${tr('Nowa gra', 'Nueva partida')}</button></div>`;
    app.odswiez();
  }
  el.addEventListener('click', e => {
    const k = e.target.closest('[data-mem]'); if (k) return klik(+k.dataset.mem);
    if (e.target.closest('[data-mem-nowa]')) start();
  });
  return { pokaz: start };
}
