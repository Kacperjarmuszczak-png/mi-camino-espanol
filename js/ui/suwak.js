// Szklany suwak jak w iOS 26 (przeniesiony ze strony fotograficznej): pod wybraną opcją stoi szklana soczewka.
// Stuknięcie przesuwa ją sprężyście; przeciągnięcie wiezie ją palcem (rośnie, rozciąga się z prędkością, krawędź mieni się),
// po puszczeniu wybiera najbliższą opcję. Działa samo dla każdego elementu pasującego do SELEKTOR
// (obserwator DOM uzbraja też przełączniki dorysowane później). Wybór = kliknięcie przycisku, więc logika zakładek się nie zmienia.
const SELEKTOR = '.seg, #zakladki, #poziomy';
const WIEKSZA = 1.28, MAX = 0.22;
const ruchOgr = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export function soczewkaEfekt(lens) {
  const g = () => lens.firstElementChild;
  const s = { p: null, t: 0, v: 0, raf: 0 };
  const ustaw = () => {
    if (!g()) return;
    const k = Math.min(MAX, Math.abs(s.v) * 0.42);
    g().style.transform = `scale(${(WIEKSZA * (1 + k)).toFixed(3)}, ${(WIEKSZA * (1 - k * 0.45)).toFixed(3)})`;
  };
  return {
    wcisnij() { if (ruchOgr()) return; s.p = null; s.v = 0; lens.classList.add('is-wcisnieta'); ustaw(); },
    ruch(x) {
      if (ruchOgr()) return;
      const t = performance.now();
      if (s.p !== null && t > s.t) s.v = s.v * 0.55 + ((x - s.p) / (t - s.t)) * 0.45;
      s.p = x; s.t = t; ustaw();
      cancelAnimationFrame(s.raf);
      const wygas = () => { s.v *= 0.86; ustaw(); if (Math.abs(s.v) > 0.01) s.raf = requestAnimationFrame(wygas); };
      s.raf = requestAnimationFrame(wygas);
    },
    pusc() { cancelAnimationFrame(s.raf); lens.classList.remove('is-wcisnieta'); if (g()) g().style.transform = ''; },
  };
}

function uzbroj(root) {
  if (root._suwak) return root._suwak;
  root.classList.add('szk-seg');
  const opcje = () => [...root.children].filter(e => e.tagName === 'BUTTON' && !e.hidden);
  const aktywny = () => opcje().findIndex(b => b.getAttribute('aria-pressed') === 'true' || b.getAttribute('aria-selected') === 'true');
  let lens = null, x0 = 0, drag = null, pominDo = 0, efekt = null;
  function zapewnijSoczewke() {
    if (lens && lens.parentNode === root) return false;
    lens = document.createElement('span');
    lens.className = 'szk-soczewka'; lens.setAttribute('aria-hidden', 'true');
    lens.innerHTML = '<span class="szk-soczewka__szklo"></span>';
    root.prepend(lens);
    efekt = soczewkaEfekt(lens);
    return true;
  }
  const geom = el => ({ l: el.offsetLeft, t: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight });
  function ustaw(x, w, t, h) {
    lens.style.width = w + 'px'; lens.style.height = h + 'px';
    lens.style.transform = `translate(${x.toFixed(1)}px, ${t}px)`; x0 = x;
  }
  function naAktywny(bezRuchu = false) {
    const nowa = zapewnijSoczewke();
    const o = opcje(), i = aktywny();
    lens.style.opacity = i < 0 ? '0' : '1';
    if (i < 0 || !o[i].offsetWidth) return;
    const r = geom(o[i]);
    if (bezRuchu || nowa) { lens.style.transition = 'none'; ustaw(r.l, r.w, r.t, r.h); void lens.offsetWidth; lens.style.transition = ''; }
    else ustaw(r.l, r.w, r.t, r.h);
  }
  const najblizszy = x => { let b = 0, d = 1e9; opcje().forEach((e, j) => { const r = geom(e), dd = Math.abs(r.l + r.w / 2 - x); if (dd < d) { d = dd; b = j; } }); return b; };

  root.addEventListener('pointerdown', e => {
    if (e.button) return;
    const o = opcje(), i = aktywny(); if (!o[i]) return;
    const r = geom(o[i]), bx = root.getBoundingClientRect().left;
    drag = { id: e.pointerId, sx: e.clientX, bx, r, start: x0, ruszyl: false, naSoczewce: e.clientX - bx >= r.l && e.clientX - bx <= r.l + r.w };
  });
  root.addEventListener('pointermove', e => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.sx;
    if (!drag.ruszyl) {
      if (Math.abs(dx) < 6) return;
      drag.ruszyl = true; root.classList.add('is-drag');
      if (!drag.naSoczewce) { root.classList.add('is-dogon'); setTimeout(() => root.classList.remove('is-dogon'), 220); }
      try { root.setPointerCapture(e.pointerId); } catch (err) { /* stary przeglądarka */ }
      efekt.wcisnij();
    }
    const o = opcje(), ost = o[o.length - 1];
    const min = o[0].offsetLeft, maks = ost.offsetLeft + ost.offsetWidth - drag.r.w;
    const cel = drag.naSoczewce ? drag.start + dx : e.clientX - drag.bx - drag.r.w / 2;
    const x = Math.max(min, Math.min(maks, cel));
    ustaw(x, drag.r.w, drag.r.t, drag.r.h);
    const k = najblizszy(x + drag.r.w / 2);
    o.forEach((el, j) => el.classList.toggle('is-pod', j === k));
    efekt.ruch(e.clientX);
  });
  const koniec = e => {
    if (!drag || e.pointerId !== drag.id) return;
    const d = drag; drag = null;
    if (!d.ruszyl) return;                      // zwykłe stuknięcie: kliknięcie zrobi swoje
    root.classList.remove('is-drag');
    opcje().forEach(el => el.classList.remove('is-pod'));
    efekt.pusc();
    const k = najblizszy(x0 + d.r.w / 2);
    pominDo = performance.now() + 500;          // kliknięcie wygenerowane po przeciągnięciu się nie liczy
    if (k !== aktywny()) opcje()[k].click();
    requestAnimationFrame(() => naAktywny());
  };
  root.addEventListener('pointerup', koniec);
  root.addEventListener('pointercancel', () => { if (drag && drag.ruszyl) { root.classList.remove('is-drag'); efekt.pusc(); naAktywny(); } drag = null; });
  // blokujemy tylko prawdziwe kliknięcie palca po przeciągnięciu, nie własne .click() wybierające opcję
  root.addEventListener('click', e => { if (e.isTrusted && performance.now() < pominDo) { e.stopPropagation(); e.preventDefault(); } }, true);
  // dotknięcie bez przeciągania też „wciska” soczewkę (szkło rośnie pod palcem)
  root.addEventListener('pointerdown', e => { const b = e.target.closest('button'); if (b && b.getAttribute('aria-pressed') === 'true' || b && b.getAttribute('aria-selected') === 'true') efekt && efekt.wcisnij(); });
  root.addEventListener('pointerup', () => { if (!drag) setTimeout(() => efekt && efekt.pusc(), 120); });

  new ResizeObserver(() => naAktywny(true)).observe(root);
  new MutationObserver(lista => {
    const przerysowany = lista.some(m => m.type === 'childList' && [...m.removedNodes].includes(lens));
    naAktywny(przerysowany);
  }).observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['aria-pressed', 'aria-selected', 'hidden'] });
  requestAnimationFrame(() => naAktywny(true));
  root._suwak = { odswiez: () => naAktywny() };
  return root._suwak;
}

export function zainicjujSuwaki(dokument = document) {
  const uzbrojWszystkie = () => dokument.querySelectorAll(SELEKTOR).forEach(uzbroj);
  uzbrojWszystkie();
  let czeka = false;
  new MutationObserver(() => { if (czeka) return; czeka = true; queueMicrotask(() => { czeka = false; uzbrojWszystkie(); }); })
    .observe(dokument.body, { childList: true, subtree: true });
}
