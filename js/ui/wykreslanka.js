// Wykreślanka: znajdź w siatce słowa (podpowiedzi to tłumaczenia). Stuknij pierwszą i ostatnią literę słowa.
import { esc } from './wspolne.js';
import { tasuj, bezZnakow } from '../tekst.js';
import { HISP, t as tr } from '../jezyk.js';
import { wykreslanka, linia } from '../gry.js';
import { slowaGry, pierwszeZnaczenie } from './gry-pula.js';

const norm = s => (HISP ? bezZnakow(s) : bezZnakow(s.replace(/ñ/g, '\u0001')).replace(/\u0001/g, 'ñ')).toUpperCase();

export function widokWykreslanki(el, app) {
  const G = { siatka: [], slowa: [], znalezione: new Set(), pola: new Set(), start: null };
  function nowa() {
    const pula = slowaGry(app.stan.ui.poziom, { min: 4, max: 8 });
    const wybor = [], byly = new Set();
    for (const x of tasuj(pula)) { const n = norm(x.s); if (!byly.has(n)) { byly.add(n); wybor.push({ ...x, n }); } if (wybor.length === 7) break; }
    const w = wykreslanka(wybor.map(x => x.n), 10, HISP ? 'AĄBCDEFGHIJKLMNOPRSTUWYZ' : 'ABCDEFGHIJLMNÑOPRSTUVZ');
    G.siatka = w.siatka; G.slowa = wybor.filter(x => w.pozycje.some(p => p.slowo === x.n)); G.znalezione = new Set(); G.pola = new Set(); G.start = null;
    rysuj();
  }
  function rysuj() {
    el.innerHTML = `<p class="male srodek">${tr('Stuknij pierwszą, a potem ostatnią literę słowa. Słowa idą w poziomie, w pionie albo po skosie.', 'Toca la primera y luego la última letra. Las palabras van en horizontal, vertical o diagonal.')}</p>
      <div class="wk-siatka">${G.siatka.map((w, r) => w.map((ch, c) => `<button type="button" class="wk-pole${G.pola.has(r + ',' + c) ? ' zn' : ''}${G.start && G.start.r === r && G.start.c === c ? ' st' : ''}" data-wk="${r},${c}">${ch}</button>`).join('')).join('')}</div>
      <ul class="wk-lista">${G.slowa.map(x => `<li class="${G.znalezione.has(x.n) ? 'zn' : ''}"><span>${esc(pierwszeZnaczenie(x.w.pl))}</span><b>${G.znalezione.has(x.n) ? esc(x.w.es) : '·'.repeat(x.n.length)}</b></li>`).join('')}</ul>
      ${G.znalezione.size === G.slowa.length ? `<p class="srodek tekst-ok"><b>${tr('Wszystkie znalezione! 🎉', '¡Todas encontradas! 🎉')}</b></p><button type="button" class="btn btn--akcent btn--szeroki" data-wk-nowa>${tr('Nowa wykreślanka', 'Nueva sopa de letras')}</button>` : ''}`;
  }
  function pole(r, c) {
    if (!G.start) { G.start = { r, c }; return rysuj(); }
    const l = linia(G.start, { r, c }); G.start = null;
    if (l) {
      const tekst = l.map(p => G.siatka[p.r][p.c]).join('');
      const x = G.slowa.find(s => !G.znalezione.has(s.n) && (s.n === tekst || s.n === [...tekst].reverse().join('')));
      if (x) { G.znalezione.add(x.n); l.forEach(p => G.pola.add(p.r + ',' + p.c)); app.ocen(x.w.id, 3); app.mowa.powiedz(x.w.es); }
    }
    rysuj();
  }
  el.addEventListener('click', e => {
    const p = e.target.closest('[data-wk]'); if (p) { const [r, c] = p.dataset.wk.split(',').map(Number); return pole(r, c); }
    if (e.target.closest('[data-wk-nowa]')) nowa();
  });
  return { pokaz: nowa };
}
