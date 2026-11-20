// Wyzwania: „Ekspres 60 s” (jak najwięcej poprawnych w minutę) i „Bez błędu” (do pierwszej pomyłki). Rekordy zapisywane.
import { $, esc } from './wspolne.js';
import { SLOWKA, POZIOMY } from '../dane/index.js';
import { tasuj, losowy, czysc } from '../tekst.js';
import { t as tr } from '../jezyk.js';

export function widokWyzwan(el, app) {
  const W = { tryb: null, wynik: 0, koniec: 0, timer: null, pyt: null, blokada: false };
  const pula = () => { const i = POZIOMY.indexOf(app.stan.ui.poziom); const p = SLOWKA.filter(w => POZIOMY.indexOf(w.p) <= i); return p.length >= 8 ? p : SLOWKA; };
  function menu() {
    clearInterval(W.timer); W.tryb = null;
    const r = app.stan.rekordy;
    el.innerHTML = `<p class="etykieta">${tr('Wyzwania', 'Retos')}</p>
      <button type="button" class="cw-kafel cw-kafel--szeroki" data-wz="ekspres"><span class="cw-ik">⚡</span><b>${tr('Ekspres 60 sekund', 'Exprés 60 segundos')}</b><small>${tr('Ile słówek zdążysz w minutę? Rekord', '¿Cuántas palabras en un minuto? Récord')}: ${r.ekspres || 0}</small></button>
      <button type="button" class="cw-kafel cw-kafel--szeroki" data-wz="bezbledu"><span class="cw-ik">🎯</span><b>${tr('Bez błędu', 'Sin fallar')}</b><small>${tr('Odpowiadaj, aż się pomylisz. Cel: 10. Rekord', 'Responde hasta el primer error. Meta: 10. Récord')}: ${r.bezbledu || 0}</small></button>`;
  }
  function start(tryb) {
    W.tryb = tryb; W.wynik = 0;
    if (tryb === 'ekspres') { W.koniec = Date.now() + 60000; clearInterval(W.timer); W.timer = setInterval(tik, 250); }
    pytanie();
  }
  function tik() {
    const z = Math.max(0, Math.ceil((W.koniec - Date.now()) / 1000));
    const e = $('[data-wz-zegar]', el); if (e) { e.textContent = z + ' s'; e.classList.toggle('malo', z <= 10); }
    if (z <= 0) koniec();
  }
  function pytanie() {
    const p = pula(), x = losowy(p);
    const inne = []; const byly = new Set([czysc(x.pl)]);
    for (const y of tasuj(p)) { if (inne.length === 3) break; const k = czysc(y.pl); if (!byly.has(k)) { byly.add(k); inne.push(y); } }
    W.pyt = { x, opcje: tasuj([x, ...inne]) }; W.blokada = false;
    el.innerHTML = `<div class="wz-gora"><span class="chip chip--akcent">${W.tryb === 'ekspres' ? '⚡' : '🎯'} ${W.wynik}</span>${W.tryb === 'ekspres' ? '<span class="zegar" data-wz-zegar></span>' : ''}</div>
      <div class="pytanie-duze">${esc(x.es)}</div>
      <div class="opcje">${W.pyt.opcje.map((o, i) => `<button type="button" class="opcja" data-wo="${i}"><kbd>${i + 1}</kbd><span>${esc(o.pl)}</span></button>`).join('')}</div>`;
    if (W.tryb === 'ekspres') tik();
  }
  function odp(i) {
    if (W.blokada || !W.tryb) return;
    W.blokada = true;
    const ok = W.pyt.opcje[i] === W.pyt.x;
    el.querySelectorAll('[data-wo]').forEach(b => { b.disabled = true; const o = W.pyt.opcje[+b.dataset.wo]; if (o === W.pyt.x) b.classList.add('ok'); else if (+b.dataset.wo === i) b.classList.add('zle'); });
    app.ocen(W.pyt.x.id, ok ? 3 : 1);
    if (ok) W.wynik++;
    if (!ok && W.tryb === 'bezbledu') return setTimeout(koniec, 700);
    setTimeout(() => { if (W.tryb) pytanie(); }, ok ? 250 : 700);
  }
  function koniec() {
    clearInterval(W.timer);
    const tryb = W.tryb; W.tryb = null;
    const rekord = app.rekord(tryb, W.wynik);
    el.innerHTML = `<div class="podsumowanie"><p class="etykieta">${tryb === 'ekspres' ? tr('Ekspres – koniec czasu', 'Exprés – tiempo') : tr('Bez błędu – koniec', 'Sin fallar – fin')}</p>
      <div class="liczby"><div><b>${W.wynik}</b><span>${tr('punktów', 'puntos')}</span></div><div><b>${app.stan.rekordy[tryb] || 0}</b><span>${tr('rekord', 'récord')}</span></div></div>
      ${rekord ? `<p class="srodek tekst-ok"><b>${tr('Nowy rekord!', '¡Nuevo récord!')} 🎉</b></p>` : ''}
      <div class="akcje-pion"><button type="button" class="btn btn--akcent btn--szeroki" data-wz="${tryb}">${tr('Jeszcze raz', 'Otra vez')}</button><button type="button" class="btn btn--szeroki" data-wz-menu>${tr('Inne wyzwania', 'Otros retos')}</button></div></div>`;
    app.odswiez();
  }
  el.addEventListener('click', e => {
    const t = e.target;
    const z = t.closest('[data-wz]'); if (z) return start(z.dataset.wz);
    const o = t.closest('[data-wo]'); if (o) return odp(+o.dataset.wo);
    if (t.closest('[data-wz-menu]')) return menu();
  });
  return {
    pokaz: menu,
    klawisz(e) { const n = parseInt(e.key, 10); if (W.tryb && n >= 1 && n <= 4) { odp(n - 1); return true; } return false; },
  };
}
