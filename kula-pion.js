// Kapsułka „↑ Na górę / ↓ Na dół” (projekt B, dla wszystkich od 16.11): przytrzymanie dolnej kuli wysuwa
// z niej w górę pionową kapsułkę (jak kółko języków); zastąpiła „Do góry” w stopce.
// Przytrzymanie: 450 ms bez ruszania palcem na kuli. Stuknięcie opcji przewija stronę, kapsułka chowa się
// z powrotem w kulę; stuknięcie w dół kapsułki (kulę) albo obok - zamyka. Ruch: transform i opacity
// (skala w pionie z korektą zaokrąglenia w każdej klatce, sprężyna i czasy jak w wyspie: 620 / 420 ms).
(() => {
  const d = document.documentElement;
  d.classList.add('kula-pion');                    // pasek.js: przy przytrzymaniu kula nie rozwija się od razu w poziomie
  const bar = document.getElementById('quickbar');
  const knob = bar && bar.querySelector('.suwak__knob');
  if (!knob) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TXT = { pl: ['NA GÓRĘ', 'NA DÓŁ', 'Zamknij'], en: ['TOP', 'BOTTOM', 'Close'], de: ['OBEN', 'UNTEN', 'Schließen'], es: ['ARRIBA', 'ABAJO', 'Cerrar'] };
  const t = () => TXT[d.lang] || TXT.pl;
  const svg = p => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;

  const box = document.createElement('div');
  box.className = 'kpion';
  box.innerHTML = `<span class="kpion__shape"></span><span class="kpion__lens soczewka" aria-hidden="true"><span class="soczewka__szklo"></span></span>
    <button type="button" class="kpion__opt" data-dokad="gora">${svg('<path d="M12 19V5M6 11l6-6 6 6"/>')}<small></small></button>
    <button type="button" class="kpion__opt" data-dokad="dol">${svg('<path d="M12 5v14M6 13l6 6 6-6"/>')}<small></small></button>
    <button type="button" class="kpion__zamknij"><span class="kpion__mono" aria-hidden="true"></span></button>`;
  document.body.appendChild(box);
  const shape = box.querySelector('.kpion__shape');
  const opts = [...box.querySelectorAll('.kpion__opt')];
  const lens = box.querySelector('.kpion__lens');
  // środki (y od góry kapsułki): „na górę”, „na dół”, kula
  const CY = { gora: 30, dol: 100, kula: 170 };   // soczewka 50 px w kapsułce 60 × 200: 5 px od każdej krawędzi

  const ZETA = 0.72, OMEGA = 12, WD = OMEGA * Math.sqrt(1 - ZETA * ZETA);
  const spring = u => { if (u >= 1) return 1; const x = u * 0.62; return 1 - Math.exp(-ZETA * OMEGA * x) * (Math.cos(WD * x) + ZETA * OMEGA / WD * Math.sin(WD * x)); };
  const easeOut = u => 1 - Math.pow(1 - u, 3);
  let open = false, armed = false, anims = [];
  // Ruch jak kapsułka języków: tafla wyrasta z kuli w górę (skala w pionie od dołu, zaokrąglenie korygowane
  // w każdej klatce), a strzałki i napisy jadą razem z jej górną krawędzią i rozjaśniają się dopiero,
  // gdy szkło je obejmie (film 16.11: napisy wisiały nad krótką jeszcze taflą). Kula z paska jest na ten
  // czas schowana - tafla zaczyna jako to samo kółko, bez ciemnego podwójnego szkła.
  function morph(to) {
    let from = to ? 0 : 1;
    if (anims.length) {
      const cur = new DOMMatrix(getComputedStyle(shape).transform).d;
      from = Math.min(1, Math.max(0, (cur - 0.3) / 0.7));
    }
    anims.forEach(a => a.cancel()); anims = [];
    const H = box.offsetHeight, W = box.offsetWidth, s0 = W / H, R = W / 2;
    const curve = to ? spring : easeOut;
    const dur = reduce ? 1 : (to ? 620 : 420) * Math.max(0.35, Math.abs(to - from));
    const N = 40, fs = [], fo = [[], []], fl = [];
    const lens0 = ly;
    for (let i = 0; i <= N; i++) {
      const u = i / N, k = from + (to - from) * curve(u), sy = s0 + (1 - s0) * k;
      fs.push({ offset: u, transform: `scaleY(${sy.toFixed(4)})`, borderRadius: `${R}px / ${(R / sy).toFixed(2)}px` });
      opts.forEach((o, j) => {
        const c = CY[o.dataset.dokad], ty = (H - c) * (1 - sy);            // jedzie razem ze szkłem
        const a0 = j ? 0.3 : 0.45, op = Math.max(0, Math.min(1, (k - a0) / 0.4));
        fo[j].push({ offset: u, opacity: op.toFixed(3), transform: `translateY(${ty.toFixed(2)}px) scale(${(0.85 + 0.15 * op).toFixed(3)})` });
      });
      // przy zamykaniu soczewka zjeżdża do kuli razem z górną krawędzią szkła
      if (!to) { const q = from <= 0 ? 1 : 1 - k / from; fl.push({ offset: u, transform: lensPose(lens0 + (CY.kula - lens0) * q, 1) }); }
    }
    anims.push(shape.animate(fs, { duration: dur, easing: 'linear', fill: 'forwards' }));
    opts.forEach((o, j) => anims.push(o.animate(fo[j], { duration: dur, easing: 'linear', fill: 'forwards' })));
    if (!to) { if (lensAnim) { lensAnim.cancel(); lensAnim = null; } ly = CY.kula; anims.push(lens.animate(fl, { duration: dur, easing: 'linear', fill: 'forwards' })); }
    const mine = anims;
    mine[0].finished.then(() => {
      if (anims !== mine) return;                   // w międzyczasie zmiana kierunku
      if (to) { mine.forEach(a => a.cancel()); anims = []; }   // spoczynek: zwykły styl (kapsułka bez skalowania)
      else { box.classList.remove('is-open'); d.classList.remove('kpion-on'); mine.forEach(a => a.cancel()); anims = []; lens.style.transform = lensPose(CY.kula, 1); }
    }).catch(() => {});
  }
  function show() {
    if (open) return;
    open = true; armed = false;
    setLens(CY.kula, 1); lens.classList.remove('is-drag'); box.classList.remove('is-wcisk'); if (window.JKFSoczewka) JKFSoczewka.pusc(lens);
    const [g, dl] = t();
    opts[0].querySelector('small').textContent = g; opts[1].querySelector('small').textContent = dl;
    box.querySelector('.kpion__zamknij').setAttribute('aria-label', t()[2]);
    // podpowiedź: na górze strony podświetlone „na dół”, niżej „na górę”
    const nearTop = scrollY < (d.scrollHeight - innerHeight) * 0.5;
    opts.forEach(o => o.classList.toggle('is-on', (o.dataset.dokad === 'dol') === nearTop));
    box.classList.add('is-open'); d.classList.add('kpion-on');
    if (navigator.vibrate) { try { navigator.vibrate(8); } catch (e) { /* brak */ } }
    morph(1);
  }
  function hide() { if (!open) return; open = false; drag = null; clearTimeout(idle); morph(0); }

  // --- soczewka: szklane kółko w kapsułce, jedzie za palcem (jak gałka poziomej kuli) ---
  let ly = CY.kula, lensAnim = null, idle = 0;
  const lensPose = (cy, s) => `translateY(${(cy - CY.kula).toFixed(2)}px) scale(${s.toFixed(3)})`;
  function setLens(cy, s) { if (lensAnim) { lensAnim.cancel(); lensAnim = null; } ly = cy; lens.style.transform = lensPose(cy, s); mark(cy); }
  function glideLens(to, s = 1) {
    const from = lensAnim ? new DOMMatrix(getComputedStyle(lens).transform).m42 + CY.kula : ly;
    setLens(to, s);
    if (reduce || Math.abs(to - from) < 0.5) return;
    const fr = [];
    for (let i = 0; i <= 30; i++) { const u = i / 30; fr.push({ offset: u, transform: lensPose(from + (to - from) * spring(u), s) }); }
    lensAnim = lens.animate(fr, { duration: 460, easing: 'linear' });
  }
  const zone = cy => cy < 65 ? 'gora' : cy < 135 ? 'dol' : null;
  function mark(cy) { const z = zone(cy); opts.forEach(o => o.classList.toggle('is-hot', o.dataset.dokad === z)); }
  function dragTo(clientY) {
    const r = box.getBoundingClientRect();
    const cy = Math.max(CY.gora, Math.min(CY.kula, clientY - r.top));   // zawsze w środku szkła, bez rozciągania
    ly = cy; lens.style.transform = lensPose(cy, 1); mark(cy);
  }
  function release(cy) {
    const z = zone(cy);
    if (z) pick(z); else { glideLens(CY.kula); closeLater(); }
  }
  function pick(z) {
    glideLens(CY[z]);
    go(z === 'gora' ? 0 : d.scrollHeight);
    clearTimeout(idle); idle = setTimeout(hide, 380);           // soczewka dojeżdża, potem kapsułka chowa się w kulę
  }
  function closeLater() { clearTimeout(idle); idle = setTimeout(hide, 5000); }

  // przeciąganie: palcem, który przytrzymał kulę, albo nowym dotknięciem w kapsułce
  let drag = null;
  document.addEventListener('pointermove', ev => {
    if (!drag || ev.pointerId !== drag.id) return;
    if (!drag.moved && Math.abs(ev.clientY - drag.y0) < 6) return;
    drag.moved = true; clearTimeout(idle);
    if (lensAnim) { lensAnim.cancel(); lensAnim = null; }
    dragTo(ev.clientY);
    if (window.JKFSoczewka) JKFSoczewka.ruch(lens, ev.clientY);
  });
  const up = ev => {
    if (!drag || ev.pointerId !== drag.id) return;
    const m = drag.moved; drag = null; lens.classList.remove('is-drag'); box.classList.remove('is-wcisk'); if (window.JKFSoczewka) JKFSoczewka.pusc(lens);
    if (m) { suppress = true; setTimeout(() => { suppress = false; }, 400); release(ly); }
    else closeLater();
  };
  document.addEventListener('pointerup', up);
  document.addEventListener('pointercancel', ev => { if (drag && ev.pointerId === drag.id) { drag = null; lens.classList.remove('is-drag'); box.classList.remove('is-wcisk'); if (window.JKFSoczewka) JKFSoczewka.pusc(lens); glideLens(CY.kula); closeLater(); } });
  // iPhone: przy przeciąganiu soczewki strona nie może się przewijać
  document.addEventListener('touchmove', ev => { if (drag) ev.preventDefault(); }, { passive: false });
  let suppress = false;
  box.addEventListener('click', ev => { if (suppress) { ev.stopPropagation(); ev.preventDefault(); } }, true);

  // przytrzymanie kuli: 450 ms bez ruchu (ruch w bok to zwykły suwak kuli, w pionie - przewijanie strony)
  let timer = 0, sx = 0, sy = 0, pid = null;
  knob.addEventListener('pointerdown', ev => {
    if (ev.button || open) return;
    sx = ev.clientX; sy = ev.clientY; pid = ev.pointerId;
    clearTimeout(timer);
    const id = pid;
    timer = setTimeout(() => { pid = null; document.dispatchEvent(new CustomEvent('jkf:kula-pion')); show(); drag = { id, y0: sy, moved: false }; lens.classList.add('is-drag'); box.classList.add('is-wcisk'); if (window.JKFSoczewka) JKFSoczewka.wcisnij(lens, 'y'); }, 450);
  });
  const cancel = ev => { if (ev.pointerId === pid) { clearTimeout(timer); pid = null; } };
  knob.addEventListener('pointermove', ev => { if (ev.pointerId === pid && Math.hypot(ev.clientX - sx, ev.clientY - sy) > 8) cancel(ev); });
  knob.addEventListener('pointerup', cancel);
  knob.addEventListener('pointercancel', cancel);
  knob.addEventListener('contextmenu', ev => ev.preventDefault());

  const go = y => scrollTo({ top: y, behavior: reduce ? 'instant' : 'smooth' });
  opts.forEach(o => o.addEventListener('click', () => pick(o.dataset.dokad)));
  // puszczenie palca po przytrzymaniu daje kliknięcie w przycisk nad kulą - liczy się dopiero nowe dotknięcie
  box.addEventListener('pointerdown', ev => { armed = true; if (!ev.button) { drag = { id: ev.pointerId, y0: ev.clientY, moved: false }; lens.classList.add('is-drag'); box.classList.add('is-wcisk'); if (window.JKFSoczewka) JKFSoczewka.wcisnij(lens, 'y'); clearTimeout(idle); } });
  box.querySelector('.kpion__zamknij').addEventListener('click', () => { if (armed) hide(); });
  document.addEventListener('pointerdown', ev => { if (open && !box.contains(ev.target)) hide(); }, true);
})();
