// Suwak z szklaną soczewką jak w iOS 26 (19.11): wspólny dla panelu (zakładki, Pakiet / Kwota - panel-szklo.js),
// przełącznika języka na podstronach (jezyki-strony.js) i podglądu przycisków (przyciski-szklo.js). Soczewka (soczewka.js) stoi pod wybraną opcją; stuknięcie
// przesuwa ją sprężyście, przeciągnięcie wiezie ją palcem (rośnie i rozciąga się z prędkością), po puszczeniu
// wybiera najbliższą opcję. Wygląd: szklo-suwak.css. Ruch tylko transform.
// JKFSuwak(root, opcje(), aktywny(), wybierz(i)) -> { odswiez(), ustaw(x, w, bezRuchu), pozycja() }
window.JKFSuwak = (() => {
  // root: pojemnik; opcje(): elementy; aktywny(): indeks; wybierz(i): czynność (zwykłe kliknięcie)
  function suwak(root, opcje, aktywny, wybierz) {
    root.classList.add('szk-seg');
    const lens = document.createElement('span');
    lens.className = 'szk-seg__lens soczewka'; lens.setAttribute('aria-hidden', 'true');
    lens.innerHTML = '<span class="soczewka__szklo"></span>';
    root.prepend(lens);
    let x0 = 0, drag = null, pominDo = 0;
    const rect = el => ({ l: el.offsetLeft, w: el.offsetWidth });
    function ustaw(x, w) { lens.style.width = w + 'px'; lens.style.transform = `translateX(${x.toFixed(1)}px)`; x0 = x; }
    function naAktywny() { const o = opcje(), i = aktywny(); if (!o[i] || !o[i].offsetWidth) return; const r = rect(o[i]); ustaw(r.l, r.w); o.forEach((e, j) => e.classList.toggle('is-wyb', j === i)); }
    const najblizszy = x => { const o = opcje(); let b = 0, d = 1e9; o.forEach((e, j) => { const r = rect(e), dd = Math.abs(r.l + r.w / 2 - x); if (dd < d) { d = dd; b = j; } }); return b; };
    new ResizeObserver(naAktywny).observe(root);
    root.addEventListener('pointerdown', e => {
      if (e.button) return;
      const o = opcje(), i = aktywny(); if (!o[i]) return;
      const r = rect(o[i]), bx = root.getBoundingClientRect().left;
      drag = { id: e.pointerId, sx: e.clientX, bx, w: r.w, start: x0, ruszyl: false, naSoczewce: e.clientX - bx >= r.l && e.clientX - bx <= r.l + r.w };
    });
    root.addEventListener('pointermove', e => {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.sx;
      if (!drag.ruszyl) {
        if (Math.abs(dx) < 6) return;
        drag.ruszyl = true; root.classList.add('is-drag');
        // chwycona obok soczewki: soczewka dojeżdża pod palec płynnie (krótkie przejście), a nie skokiem
        if (!drag.naSoczewce) { root.classList.add('is-dogon'); clearTimeout(root._dogon); root._dogon = setTimeout(() => root.classList.remove('is-dogon'), 220); }
        try { root.setPointerCapture(e.pointerId); } catch (err) {}
        window.JKFSoczewka && JKFSoczewka.wcisnij(lens, 'x');
      }
      const maks = root.clientWidth - drag.w - 4;
      // soczewka chwycona: jedzie z palcem; chwycona obok: dojeżdża pod palec
      const cel = drag.naSoczewce ? drag.start + dx : e.clientX - drag.bx - drag.w / 2;
      const x = Math.max(4, Math.min(maks, cel));
      ustaw(x, drag.w);
      const k = najblizszy(x + drag.w / 2); opcje().forEach((el, j) => el.classList.toggle('is-pod', j === k));
      window.JKFSoczewka && JKFSoczewka.ruch(lens, e.clientX);
    });
    const koniec = e => {
      if (!drag || e.pointerId !== drag.id) return;
      const d = drag; drag = null;
      if (!d.ruszyl) return;                         // zwykłe stuknięcie: klik zrobi swoje
      root.classList.remove('is-drag'); opcje().forEach(el => el.classList.remove('is-pod'));
      window.JKFSoczewka && JKFSoczewka.pusc(lens);
      const k = najblizszy(x0 + d.w / 2);
      pominDo = performance.now() + 600;            // klik wygenerowany po przeciągnięciu nie liczy się
      if (k !== aktywny()) wybierz(k); else naAktywny();
      requestAnimationFrame(naAktywny);
    };
    root.addEventListener('pointerup', koniec);
    root.addEventListener('pointercancel', e => { if (drag && drag.ruszyl) { drag = null; root.classList.remove('is-drag'); window.JKFSoczewka && JKFSoczewka.pusc(lens); naAktywny(); } else drag = null; });
    root.addEventListener('click', e => { if (e.isTrusted && performance.now() < pominDo) { e.stopPropagation(); e.preventDefault(); } }, true);
    // ustaw(x, w, bezRuchu): soczewka od razu w danym miejscu (np. start przejścia z innego przełącznika)
    function ustawTu(x, w, bezRuchu) {
      if (bezRuchu) { lens.style.transition = 'none'; ustaw(x, w); void lens.offsetWidth; getComputedStyle(lens).transform; lens.style.transition = ''; }
      else ustaw(x, w);
    }
    return { odswiez: naAktywny, ustaw: ustawTu, pozycja: () => ({ x: x0, w: parseFloat(lens.style.width) || 0 }) };
  }
  return suwak;
})();
