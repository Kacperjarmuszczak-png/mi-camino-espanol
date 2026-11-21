// Dźwięki odpowiedzi (dobrze / źle) – Web Audio, bez plików.
// Ćwiczenia nie muszą nic wołać: obserwator wychwytuje oznaczenie odpowiedzi (klasy „ok” / „zle”
// dodane do przycisku albo pokazany wynik „wynik--ok/uwaga/zle”). Gry mogą wołać dzwiekOdpowiedzi() wprost.
let ctx = null, wlaczone = true, ostatni = 0;
export function ustawDzwieki(t) { wlaczone = !!t; }

function ton(nuty, typ = 'sine', glos = 0.18) {
  if (!wlaczone) return;
  try {
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    ctx = ctx || new AC();
    if (ctx.state === 'suspended') ctx.resume();
    const t0 = ctx.currentTime;
    for (const [f, start, dl] of nuty) {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = typ; o.frequency.value = f;
      const s = t0 + start;
      g.gain.setValueAtTime(0.0001, s);
      g.gain.exponentialRampToValueAtTime(glos, s + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, s + dl);
      o.connect(g).connect(ctx.destination);
      o.start(s); o.stop(s + dl + 0.02);
    }
  } catch (e) { /* bez dźwięku */ }
}
/** @param {'ok'|'prawie'|'zle'} wynik */
export function dzwiekOdpowiedzi(wynik) {
  const t = Date.now(); if (t - ostatni < 250) return; ostatni = t;
  if (wynik === 'ok') ton([[784, 0, 0.12], [1175, 0.09, 0.22]]);              // G5 → D6, jasne „ding-ding”
  else if (wynik === 'prawie') ton([[659, 0, 0.14], [784, 0.1, 0.18]], 'sine', 0.14);
  else ton([[220, 0, 0.16], [175, 0.12, 0.26]], 'triangle', 0.22);            // niskie „bu-bu”
}

export function uruchomObserwatorOdpowiedzi(root = document.body) {
  if (typeof MutationObserver === 'undefined') return;
  let wynik = null, timer = null;
  const ranga = { ok: 1, prawie: 2, zle: 3 };
  const zglos = w => { if (!wynik || ranga[w] > ranga[wynik]) wynik = w; clearTimeout(timer); timer = setTimeout(() => { dzwiekOdpowiedzi(wynik); wynik = null; }, 40); };
  const zWyniku = el => el.classList.contains('wynik--ok') ? 'ok' : el.classList.contains('wynik--uwaga') ? 'prawie' : el.classList.contains('wynik--zle') ? 'zle' : null;
  new MutationObserver(lista => {
    for (const m of lista) {
      if (m.type === 'attributes') {
        const el = m.target, stare = ' ' + (m.oldValue || '') + ' ';
        if (!(el instanceof HTMLElement)) continue;
        if (el.classList.contains('wynik')) {
          const w = zWyniku(el);
          if (w && (!stare.includes(' wynik--') || stare.trim() !== el.className.trim()) && !el.hidden) zglos(w);
          continue;
        }
        if (el.classList.contains('zle') && !stare.includes(' zle ')) zglos('zle');
        else if (el.classList.contains('ok') && !stare.includes(' ok ')) zglos('ok');
      } else {
        for (const n of m.addedNodes) {
          if (!(n instanceof HTMLElement)) continue;
          const els = n.classList.contains('wynik') ? [n] : n.querySelectorAll ? n.querySelectorAll('.wynik') : [];
          for (const el of els) { const w = !el.hidden && zWyniku(el); if (w) zglos(w); }
        }
      }
    }
  }).observe(root, { subtree: true, childList: true, attributes: true, attributeFilter: ['class', 'hidden'], attributeOldValue: true });
}
