// Wisielec: zgadnij słowo po literze; podpowiedzią jest tłumaczenie. 7 pomyłek = koniec.
import { esc } from './wspolne.js';
import { dzwiekOdpowiedzi } from '../dzwieki.js';
import { losowy, bezZnakow } from '../tekst.js';
import { HISP, t as tr } from '../jezyk.js';
import { slowaGry, pierwszeZnaczenie } from './gry-pula.js';

const ALFABET = HISP ? 'aąbcćdeęfghijklłmnńoóprsśtuwyzźż'.split('') : 'abcdefghijklmnñopqrstuvwxyz'.split('');
// hiszpański: litery z akcentem liczą się jak bez (á = a), ale ñ to osobna litera; polski: każda litera osobno
const klucz = c => (HISP ? c : c === 'ñ' ? 'ñ' : bezZnakow(c));
const CZESCI = ['<line x1="10" y1="95" x2="70" y2="95"/>', '<line x1="25" y1="95" x2="25" y2="8"/>', '<line x1="25" y1="8" x2="65" y2="8"/>', '<line x1="65" y1="8" x2="65" y2="20"/>',
  '<circle cx="65" cy="28" r="8"/>', '<line x1="65" y1="36" x2="65" y2="62"/>', '<path d="M65 44 54 54M65 44l11 10M65 62l-10 16M65 62l10 16"/>'];

export function widokWisielca(el, app) {
  const G = { slowo: '', w: null, zgadniete: new Set(), bledy: 0, koniec: false };
  function start() {
    const x = losowy(slowaGry(app.stan.ui.poziom, { min: 4, max: 10 }));
    G.slowo = x.s; G.w = x.w; G.zgadniete = new Set(); G.bledy = 0; G.koniec = false; rysuj();
  }
  const odkryte = () => [...G.slowo].every(c => G.zgadniete.has(klucz(c)));
  function rysuj(info = '') {
    el.innerHTML = `<div class="wis">
      <svg class="wis-rys" viewBox="0 0 90 100" aria-label="${tr('Pomyłki', 'Errores')}: ${G.bledy}/7">${CZESCI.slice(0, G.bledy).join('')}</svg>
      <div class="wis-prawa"><small>${tr('Podpowiedź', 'Pista')}</small><b>${esc(pierwszeZnaczenie(G.w.pl))}</b><span class="male">${tr('Pomyłki', 'Errores')}: ${G.bledy}/7</span></div></div>
      <p class="wis-slowo" aria-live="polite">${[...G.slowo].map(c => (G.zgadniete.has(klucz(c)) || G.koniec ? `<span${!G.zgadniete.has(klucz(c)) ? ' class="brak"' : ''}>${esc(c)}</span>` : '<span>_</span>')).join('')}</p>
      ${info ? `<p class="srodek ${G.bledy >= 7 ? 'tekst-zle' : 'tekst-ok'}"><b>${info}</b></p>` : ''}
      ${G.koniec ? `<p class="srodek">${esc(G.w.es)} – ${esc(G.w.pl)}</p><button type="button" class="btn btn--akcent btn--szeroki" data-wis-nowa>${tr('Nowe słowo', 'Nueva palabra')}</button>`
        : `<div class="wis-klaw">${ALFABET.map(c => `<button type="button" data-wl="${c}" ${G.zgadniete.has(c) ? 'disabled' : ''} class="${G.zgadniete.has(c) ? ([...G.slowo].some(x => klucz(x) === c) ? 'tak' : 'nie') : ''}">${c}</button>`).join('')}</div>`}`;
  }
  function litera(c) {
    if (G.koniec || G.zgadniete.has(c)) return;
    G.zgadniete.add(c);
    if (![...G.slowo].some(x => klucz(x) === c)) { G.bledy++; dzwiekOdpowiedzi('zle'); } else dzwiekOdpowiedzi('ok');
    if (odkryte()) { G.koniec = true; app.ocen(G.w.id, G.bledy <= 2 ? 3 : 2); app.mowa.powiedz(G.w.es); return rysuj(tr('Brawo! 🎉', '¡Bravo! 🎉')); }
    if (G.bledy >= 7) { G.koniec = true; app.ocen(G.w.id, 1); app.mowa.powiedz(G.w.es); return rysuj(tr('Tym razem się nie udało', 'Esta vez no')); }
    rysuj();
  }
  el.addEventListener('click', e => {
    const l = e.target.closest('[data-wl]'); if (l) return litera(l.dataset.wl);
    if (e.target.closest('[data-wis-nowa]')) start();
  });
  return {
    pokaz: start,
    klawisz(e) {
      const c = e.key.toLowerCase();
      if (!G.koniec && ALFABET.includes(c)) { litera(c); return true; }
      if (G.koniec && e.key === 'Enter') { start(); return true; }
      return false;
    },
  };
}
