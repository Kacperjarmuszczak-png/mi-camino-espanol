// Dynamiczna wyspa jak w iPhonie: kapsułka rozciąga się z wyspy i zwija z powrotem do niej.
//
// Jak to działa (tylko transform i zaokrąglenie - Safari liczy to na karcie graficznej):
// - panel ma stały, pełny rozmiar; skalujemy go osobno w poziomie (sx) i pionie (sy), tak że
//   przy postępie 0 wygląda dokładnie jak pigułka wyspy, a przy 1 jak pełny panel,
// - przy nierównej skali okrągły róg zrobiłby się owalny, więc w każdej klatce ustawiamy
//   promień R/sx w poziomie i R/sy w pionie - po przeskalowaniu wychodzi okrąg,
// - zawartość dostaje skalę odwrotną (1/sx, 1/sy), więc się nie rozciąga,
// - logo, napis i JKF z wyspy zostają widoczne: logo i JKF jadą z krawędziami kapsułki.
//   (Wersja z maską clip-path na iPhonie przeskakiwała i gubiła rozmycie tła.)
(() => {
  const island = document.getElementById('island');
  if (!island) return;
  const pill = island.querySelector('.island__pill');
  const panel = island.querySelector('.island__panel');
  const content = island.querySelector('.island__content');
  const closeBtn = island.querySelector('.island__close');
  const links = [...panel.querySelectorAll('.island__menu a')];
  const pLogo = pill.querySelector('.island__logo');
  const pJkf = pill.querySelector('.island__jkf');
  const labMenu = pill.querySelector('.island__label--menu');
  const labClose = pill.querySelector('.island__label--close');
  links.forEach((a, i) => a.style.setProperty('--i', i));   // kolejność wejścia pozycji
  panel.inert = true;

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const OPEN_MS = reduce ? 1 : 620;
  const CLOSE_MS = reduce ? 1 : 420;
  const R_OPEN = 34;                       // promień rogów rozwiniętego panelu
  const STEPS = 60;

  // otwieranie: tłumiona sprężyna (tłumienie 0,72) - widoczny wzrost i lekkie dociągnięcie
  const ZETA = 0.72, OMEGA = 12, WD = OMEGA * Math.sqrt(1 - ZETA * ZETA);
  const spring = u => {
    if (u >= 1) return 1;
    const t = u * 0.62;
    return 1 - Math.exp(-ZETA * OMEGA * t) * (Math.cos(WD * t) + ZETA * OMEGA / WD * Math.sin(WD * t));
  };
  // zamykanie: szybki start, miękkie lądowanie dokładnie w kształcie wyspy
  const easeOut = u => 1 - Math.pow(1 - u, 3);

  let W = 1, H = 1, PW = 126, PH = 37, sx0 = 0.25, sy0 = 0.12, SHIFT_X = 0, SHIFT_Y = 0;
  function measure() {
    W = panel.offsetWidth; H = panel.offsetHeight;
    PW = pill.offsetWidth; PH = pill.offsetHeight;
    sx0 = PW / W; sy0 = PH / H;
    // o ile przesunąć logo (w lewo) i JKF (w prawo), żeby przy rozwiniętym panelu stały
    // w rogach: krawędź kapsułki odsuwa się o (W - szerokość pigułki) / 2, a odstęp od
    // krawędzi rośnie z wcięcia pigułki do wcięcia wiersza „Zamknij”
    const slotHalf = parseFloat(getComputedStyle(pill).gridTemplateColumns) / 2;
    const insetPill = parseFloat(getComputedStyle(pill).paddingLeft) + slotHalf;
    const insetOpen = parseFloat(getComputedStyle(closeBtn).paddingLeft) + slotHalf;
    SHIFT_X = -(W - PW) / 2 + (insetOpen - insetPill);
    SHIFT_Y = (closeBtn.offsetHeight - PH) / 2;
  }

  // MENU -> ZAMKNIJ: krótkie przenikanie (postęp 0,38-0,54), żeby oba słowa nie nakładały się
  // na siebie przez dłuższą chwilę; suma widoczności nadal zawsze 1, więc napis nie znika
  const swap = k => { const x = Math.min(1, Math.max(0, (k - 0.38) / 0.16)); return x * x * (3 - 2 * x); };

  // wygląd dla postępu e (0 = wyspa, 1 = pełny panel; sprężyna może lekko przekroczyć 1)
  function frame(e) {
    const sx = sx0 + (1 - sx0) * e;
    const sy = sy0 + (1 - sy0) * e;
    const k = Math.min(Math.max(e, 0), 1);
    const R = PH / 2 + (R_OPEN - PH / 2) * k;
    return {
      panel: {
        transform: `translateX(-50%) scale(${sx.toFixed(4)}, ${sy.toFixed(4)})`,
        borderRadius: `${(R / sx).toFixed(2)}px / ${(R / sy).toFixed(2)}px`,
      },
      content: { transform: `scale(${(1 / sx).toFixed(4)}, ${(1 / sy).toFixed(4)})` },
      // logo i JKF jadą razem z krawędziami kapsułki (ta sama sprężyna)
      logo: { transform: `translate(${(SHIFT_X * e).toFixed(2)}px, ${(SHIFT_Y * k).toFixed(2)}px)` },
      jkf:  { transform: `translate(${(-SHIFT_X * e).toFixed(2)}px, ${(SHIFT_Y * k).toFixed(2)}px)` },
      // przenikanie dopełniające: suma widoczności zawsze 1, więc napis nigdy nie znika
      menu:  { opacity: (1 - swap(k)).toFixed(3) },
      close: { opacity: swap(k).toFixed(3) },
    };
  }
  function applyStatic(e) {
    const f = frame(e);
    Object.assign(panel.style, f.panel);
    content.style.transform = f.content.transform;
    pLogo.style.transform = f.logo.transform;
    pJkf.style.transform = f.jkf.transform;
    labMenu.style.opacity = f.menu.opacity;
    labClose.style.opacity = f.close.opacity;
  }

  measure();
  applyStatic(0);
  const remeasure = () => { measure(); if (!anim) applyStatic(restE); };
  if (document.fonts) document.fonts.ready.then(remeasure);
  let resizeQueued = false;
  window.addEventListener('resize', () => {
    if (resizeQueued) return;
    resizeQueued = true;
    requestAnimationFrame(() => { resizeQueued = false; remeasure(); });
  });

  // --- animacja ---
  let anim = null;        // { from, to, curve, start, dur, list: [Animation] }
  let restE = 0;          // stan w spoczynku (0 = wyspa, 1 = rozwinięty)
  function currentE() {
    if (!anim) return restE;
    const u = Math.min(1, (performance.now() - anim.start) / anim.dur);
    return anim.from + (anim.to - anim.from) * anim.curve(u);
  }
  function stopAnim() {
    if (!anim) return;
    anim.list.forEach(a => a.cancel());
    anim = null;
  }

  function run(to) {
    const from = currentE();
    stopAnim();
    const opening = to === 1;
    const curve = opening ? spring : easeOut;
    const dur = (opening ? OPEN_MS : CLOSE_MS) * Math.max(0.35, Math.abs(to - from));
    const pk = [], ck = [], lk = [], jk = [], mk = [], zk = [];
    for (let i = 0; i <= STEPS; i++) {
      const u = i / STEPS, f = frame(from + (to - from) * curve(u));
      pk.push({ offset: u, ...f.panel });
      ck.push({ offset: u, transform: f.content.transform });
      lk.push({ offset: u, ...f.logo });
      jk.push({ offset: u, ...f.jkf });
      mk.push({ offset: u, ...f.menu });
      zk.push({ offset: u, ...f.close });
    }
    panel.style.opacity = '1';
    // pigułka traci tylko tło (pod nią jest kapsułka o identycznym kształcie i tle);
    // obwódka w trakcie ruchu jest wygaszona (przy skalowaniu rozciągałaby się nierówno)
    island.classList.add('pill-bare', 'is-morphing');
    const opacityFrames = opening
      ? [{ opacity: 0, offset: 0 }, { opacity: 0, offset: 0.18 }, { opacity: 1, offset: 0.6 }, { opacity: 1, offset: 1 }]
      : [{ opacity: 1, offset: 0 }, { opacity: 0, offset: 0.35 }, { opacity: 0, offset: 1 }];
    const opt = { duration: dur, easing: 'linear', fill: 'forwards' };
    const list = [
      panel.animate(pk, opt),
      content.animate(ck, opt),
      content.animate(opacityFrames, opt),
      pLogo.animate(lk, opt),
      pJkf.animate(jk, opt),
      labMenu.animate(mk, opt),
      labClose.animate(zk, opt),
    ];
    const a = { from, to, curve, start: performance.now(), dur, list };
    anim = a;
    list[0].finished.then(() => {
      if (anim !== a) return;                     // w międzyczasie zmiana kierunku
      restE = to;
      applyStatic(to);
      content.style.opacity = opening ? '1' : '0';
      island.classList.remove('is-morphing');     // obwódka wraca (płynnie, 0,2 s)
      // po zwinięciu kapsułka ma dokładnie kształt i tło pigułki - podmiana jest niewidoczna
      if (!opening) { panel.style.opacity = '0'; island.classList.remove('pill-bare'); }
      stopAnim();
    }).catch(() => {});
  }

  // --- otwieranie / zamykanie ---
  let open = false, openedAt = 0, startTimer = 0;
  function setOpen(next, { focus = false } = {}) {
    if (next === open) return;
    open = next;
    openedAt = window.scrollY;
    island.classList.toggle('is-open', open);
    pill.setAttribute('aria-expanded', String(open));
    panel.inert = !open;
    // informacja dla innych elementów (kółko języków „wlewa się” w wyspę i z niej wyskakuje);
    // słuchacz może poprosić o chwilę zwłoki przed rozwinięciem (detail.delay), jak w iPhonie:
    // najpierw kółko łączy się z pigułką, dopiero potem pigułka się rozwija
    const ev = new CustomEvent('jkf:island', { detail: { open, openMs: OPEN_MS, closeMs: CLOSE_MS, delay: 0 } });
    document.dispatchEvent(ev);
    clearTimeout(startTimer);
    if (open && ev.detail.delay > 0 && !reduce) startTimer = setTimeout(() => run(1), ev.detail.delay);
    else run(open ? 1 : 0);
    if (focus) setTimeout(() => (open ? links[0] : pill).focus({ preventScroll: true }), open ? 300 + ev.detail.delay : CLOSE_MS);
  }

  // e.detail === 0 oznacza kliknięcie z klawiatury - wtedy przenosimy fokus
  pill.addEventListener('click', e => setOpen(true, { focus: e.detail === 0 }));
  closeBtn.addEventListener('click', e => setOpen(false, { focus: e.detail === 0 }));
  links.forEach(a => a.addEventListener('click', () => setOpen(false)));
  // złoty przycisk: czat otwiera się, gdy menu już się zwinie (kapsułka czatu wchłania wtedy wyspę)
  const chatBtn = panel.querySelector('.island__chat');
  if (chatBtn) chatBtn.addEventListener('click', e => {
    e.preventDefault();
    setTimeout(() => document.dispatchEvent(new CustomEvent('jkf:open-chat', { detail: {} })), CLOSE_MS + 30);
  });
  // bieżąca sekcja: jej pozycja w menu świeci (soczewka); sekcja w połowie wysokości ekranu
  const secLinks = links.filter(a => !a.classList.contains('btn') && /^#[\w-]+$/.test(a.getAttribute('href')));
  const io = new IntersectionObserver(entries => entries.forEach(en => {
    if (!en.isIntersecting) return;
    secLinks.forEach(a => a.classList.toggle('is-current', a.getAttribute('href') === '#' + en.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  secLinks.forEach(a => { const s = document.querySelector(a.getAttribute('href')); if (s) io.observe(s); });
  document.addEventListener('click', e => { if (open && !island.contains(e.target)) setOpen(false); });
  document.addEventListener('keydown', e => { if (open && e.key === 'Escape') setOpen(false, { focus: true }); });
  // rozwinięte menu zwija się dopiero po wyraźnym przewinięciu
  window.addEventListener('scroll', () => {
    if (open && Math.abs(window.scrollY - openedAt) > 80) setOpen(false);
  }, { passive: true });
})();

// Suwak kontaktu w menu: E-mail (lewo) i Instagram (prawo). Szklana gałka czeka w obrysie koła na środku.
// Przeciągnięcie: gałka jedzie za palcem, napis, do którego się zbliża, gaśnie, a na gałce pojawia się
// jego ikona; puszczona za połową drogi wykonuje opcję (w zdarzeniu puszczenia palca), menu się zwija.
// Po każdym puszczeniu gałka sprężyście wraca do obrysu. Stuknięcie w napis: zwykły link.
(() => {
  const bar = document.querySelector('.island__kontakt.slide');
  if (!bar) return;
  const knob = bar.querySelector('.slide__knob');
  const optL = bar.querySelector('.slide__opt--l'), optR = bar.querySelector('.slide__opt--r');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ZETA = 0.72, OMEGA = 12, WD = OMEGA * Math.sqrt(1 - ZETA * ZETA);
  const spring = u => { if (u >= 1) return 1; const t = u * 0.62; return 1 - Math.exp(-ZETA * OMEGA * t) * (Math.cos(WD * t) + ZETA * OMEGA / WD * Math.sin(WD * t)); };
  const ACT = 0.5;
  let MAX = 120, x = 0, anim = null, backT = 0;
  const measure = () => { MAX = Math.max(40, bar.clientWidth / 2 - knob.offsetWidth / 2 - 5); };
  const pose = (px, s = 1) => `translateX(${px.toFixed(2)}px) scale(${s.toFixed(3)})`;
  const hot = side => {
    optL.classList.toggle('is-hot', side < 0); optR.classList.toggle('is-hot', side > 0);
    bar.classList.toggle('hot-l', side < 0); bar.classList.toggle('hot-r', side > 0);
  };
  const cover = px => {
    const t = Math.max(0, Math.min(1, (Math.abs(px) / MAX - 0.45) / 0.4));
    optL.style.setProperty('--cover', px < 0 ? (1 - t).toFixed(3) : '1');
    optR.style.setProperty('--cover', px > 0 ? (1 - t).toFixed(3) : '1');
  };
  const live = () => (anim ? new DOMMatrix(getComputedStyle(knob).transform).m41 : x);
  function glide(to, then) {
    const from = live();
    if (anim) { anim.cancel(); anim = null; }
    x = to; knob.style.transform = pose(to); cover(to);
    if (reduce || Math.abs(to - from) < 0.5) { if (then) then(); return; }
    const fr = [];
    for (let k = 0; k <= 30; k++) { const u = k / 30; fr.push({ offset: u, transform: pose(from + (to - from) * spring(u)) }); }
    const a = knob.animate(fr, { duration: 480, easing: 'linear' });
    anim = a;
    a.finished.then(() => { if (anim === a) { anim = null; if (then) then(); } }).catch(() => {});
  }
  const home = (ms = 0) => { clearTimeout(backT); backT = setTimeout(() => { hot(0); glide(0); }, ms); };
  function act(side) {
    // Zawsze w tej samej karcie: Safari na iPhonie po cichu blokował nową kartę (window.open) otwieraną
    // po przeciągnięciu - puszczenie palca nie liczy się tam jako stuknięcie (15.11, Instagram nie działał).
    // Przejścia w tej samej karcie Safari nie blokuje; z aplikacją Instagram iPhone może ją zaproponować.
    const a = side < 0 ? optL : optR;
    location.href = a.getAttribute('href');
    const close = document.querySelector('.island__close');       // menu zwija się jak po stuknięciu linku
    if (close) setTimeout(() => close.click(), 250);
  }
  let down = null, dragged = false;
  knob.addEventListener('pointerdown', e => {
    if (e.button !== 0) return;
    measure(); clearTimeout(backT);
    down = { id: e.pointerId, cx: e.clientX, x0: live() };
    if (anim) { x = down.x0; anim.cancel(); anim = null; }
    dragged = false;
    knob.style.transform = pose(x, 1.08);                          // lekkie „wciśnięcie” jak w iOS
  });
  knob.addEventListener('pointermove', e => {
    if (!down || e.pointerId !== down.id) return;
    const dx = e.clientX - down.cx;
    if (!dragged && Math.abs(dx) < 5) return;
    if (!dragged) { dragged = true; bar.classList.add('is-moving'); try { knob.setPointerCapture(e.pointerId); } catch (err) { /* stary Safari */ } }
    x = Math.max(-MAX, Math.min(MAX, down.x0 + dx));
    knob.style.transform = pose(x, 1.08); cover(x);
    hot(Math.abs(x) >= MAX * ACT ? Math.sign(x) : 0);
  });
  const end = (e, cancelled) => {
    if (!down || e.pointerId !== down.id) return;
    down = null; bar.classList.remove('is-moving');
    const side = dragged && !cancelled && Math.abs(x) >= MAX * ACT ? Math.sign(x) : 0;
    if (side) { glide(side * MAX); act(side); home(450); }           // na koniec drogi, potem do obrysu
    else { hot(0); glide(0); }
  };
  knob.addEventListener('pointerup', e => end(e, false));
  knob.addEventListener('pointercancel', e => end(e, true));
  // stuknięcie w napis: gałka mignie w jego stronę i wraca, link działa normalnie (menu zwija wyspa)
  [optL, optR].forEach((o, i) => o.addEventListener('click', () => { measure(); const s = i ? 1 : -1; hot(s); glide(s * MAX); home(450); }));
  // klawiatura: strzałki na gałce
  knob.addEventListener('keydown', e => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault(); measure();
    const s = e.key === 'ArrowLeft' ? -1 : 1; hot(s); glide(s * MAX); act(s); home(450);
  });
  knob.style.transform = pose(0);
})();
