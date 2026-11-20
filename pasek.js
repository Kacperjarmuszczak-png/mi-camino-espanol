// Dolny pasek na telefonie: szklana kula, która rozciąga się w suwak (pasek.css).
//
// Spoczynek: kula na środku (tor zwinięty do koła, w nim jaśniejsza gałka).
// Dotknięcie gałki: tor sprężyście rozciąga się w kapsułkę (scaleX, zaokrąglenie korygowane
// w każdej klatce: R/sx w poziomie, R w pionie), po bokach pojawiają się „Zadzwoń” i „Zarezerwuj”.
// Przesunięcie gałki w lewo albo w prawo i puszczenie za połową drogi wykonuje czynność
// (w zdarzeniu puszczenia palca, więc iPhone pokaże okno połączenia), potem wszystko wraca do kuli.
// Puszczenie bliżej środka: gałka wraca, kula się zwija. Samo stuknięcie zostawia kapsułkę otwartą
// (można stuknąć w napis); zwija się po kilku sekundach, przy przewijaniu albo po stuknięciu w gałkę.
// Ruch tylko transform i opacity (WAAPI, klatki liczone z góry).
(() => {
  const bar = document.getElementById('quickbar');
  if (!bar || !bar.classList.contains('suwak')) return;
  const track = bar.querySelector('.suwak__track');
  const knob = bar.querySelector('.suwak__knob');
  const optL = bar.querySelector('.suwak__opt--l');
  const optR = bar.querySelector('.suwak__opt--r');
  const opts = [optL, optR];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ta sama sprężyna co wyspa i kapsułki (tłumienie 0,72); zamykanie: miękkie lądowanie
  const ZETA = 0.72, OMEGA = 12, WD = OMEGA * Math.sqrt(1 - ZETA * ZETA);
  const spring = u => {
    if (u >= 1) return 1;
    const t = u * 0.62;
    return 1 - Math.exp(-ZETA * OMEGA * t) * (Math.cos(WD * t) + ZETA * OMEGA / WD * Math.sin(WD * t));
  };
  const easeOut = u => 1 - Math.pow(1 - u, 3);
  const OPEN_MS = 520, CLOSE_MS = 360, ACT = 0.5;     // ACT: część drogi, od której puszczenie wykonuje czynność

  let W = 380, H = 60, MAX = 160;                   // szerokość toru, wysokość, zasięg gałki od środka
  const measure = () => { W = bar.clientWidth || W; H = bar.clientHeight || H; MAX = Math.max(40, W / 2 - H / 2); };

  // --- tor: e = 0 kula, e = 1 kapsułka ---
  let e = 0, trackAnim = null, fadeAnim = null;
  const trackPose = v => {
    const sx = H / W + (1 - H / W) * v, R = H / 2;
    return { transform: `scaleX(${sx.toFixed(4)})`, borderRadius: `${(R / Math.max(sx, 0.01)).toFixed(2)}px / ${R}px` };
  };
  const setTrack = v => { const p = trackPose(v); track.style.transform = p.transform; track.style.borderRadius = p.borderRadius; };
  function liveE() {
    if (!trackAnim) return e;
    const a = trackAnim, u = Math.min(1, (performance.now() - a.t0) / a.dur);
    return a.from + (a.to - a.from) * a.curve(u);
  }
  function morph(to) {
    const from = liveE();
    if (trackAnim) { trackAnim.list.forEach(x => x.cancel()); trackAnim = null; }
    e = to; setTrack(to);
    opts.forEach(o => { o.style.opacity = to; });
    bar.classList.toggle('is-open', to === 1);
    knob.setAttribute('aria-expanded', String(to === 1));
    if (reduce || Math.abs(to - from) < 0.001) return;
    const opening = to > from, curve = opening ? spring : easeOut;
    const dur = (opening ? OPEN_MS : CLOSE_MS) * Math.max(0.4, Math.abs(to - from));
    const tf = [], of = [];
    for (let k = 0; k <= 40; k++) {
      const u = k / 40, v = from + (to - from) * curve(u);
      tf.push({ offset: u, ...trackPose(v) });
    }
    // napisy: przy otwieraniu pojawiają się w drugiej części ruchu, przy zamykaniu gasną od razu
    const fade = opening
      ? [{ opacity: from, offset: 0 }, { opacity: from, offset: 0.25 }, { opacity: 1, offset: 0.7 }, { opacity: 1, offset: 1 }]
      : [{ opacity: from }, { opacity: 0, offset: 0.4 }, { opacity: 0 }];
    const opt = { duration: dur, easing: 'linear' };
    const list = [track.animate(tf, opt), ...opts.map(o => o.animate(fade, opt))];
    const a = { from, to, curve, t0: performance.now(), dur, list };
    trackAnim = a;
    bar.classList.add('is-moving');
    list[0].finished.then(() => { if (trackAnim === a) { trackAnim = null; if (!down) bar.classList.remove('is-moving'); } }).catch(() => {});
  }

  // --- gałka: x od środka (ujemne w lewo) ---
  let x = 0, knobAnim = null;
  const knobPose = (px, s = 1) => `translateX(${px.toFixed(2)}px) scale(${s.toFixed(3)})`;
  function liveX() {
    if (!knobAnim) return x;
    return new DOMMatrix(getComputedStyle(knob).transform).m41;
  }
  function glide(to, s = 1) {
    const from = liveX();
    if (knobAnim) { knobAnim.cancel(); knobAnim = null; }
    x = to; knob.style.transform = knobPose(to, s); cover(to);
    if (reduce || Math.abs(to - from) < 0.5) return;
    const fr = [];
    for (let k = 0; k <= 30; k++) { const u = k / 30; fr.push({ offset: u, transform: knobPose(from + (to - from) * spring(u), s) }); }
    const a = knob.animate(fr, { duration: 460, easing: 'linear' });
    knobAnim = a;
    a.finished.then(() => { if (knobAnim === a) knobAnim = null; }).catch(() => {});
  }
  const hot = side => {
    opts.forEach((o, i) => o.classList.toggle('is-hot', side === (i ? 1 : -1)));
    bar.classList.toggle('hot-l', side < 0); bar.classList.toggle('hot-r', side > 0);
  };
  // napis po stronie, w którą jedzie gałka, gaśnie od ok. połowy drogi (przy końcu jest pod gałką)
  const cover = px => {
    const t = Math.max(0, Math.min(1, (Math.abs(px) / MAX - 0.45) / 0.4));
    optL.style.setProperty('--cover', px < 0 ? (1 - t).toFixed(3) : '1');
    optR.style.setProperty('--cover', px > 0 ? (1 - t).toFixed(3) : '1');
  };

  // --- czynność ---
  let actedAt = 0;
  function act(side) {
    actedAt = performance.now();                     // przewijanie po „Zarezerwuj” nie zwija od razu
    const a = side < 0 ? optL : optR, href = a.getAttribute('href');
    if (href.startsWith('#')) {
      const t = document.querySelector(href);
      if (t) t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    } else {
      location.href = href;
    }
  }
  let closeTimer = 0;
  function closeSoon(ms) { clearTimeout(closeTimer); closeTimer = setTimeout(close, ms); }
  function close() { clearTimeout(closeTimer); hot(0); glide(0); morph(0); }
  function open() { measure(); clearTimeout(closeTimer); morph(1); }

  // --- dotyk ---
  let down = null, dragged = false;
  // kula-pion.js: przytrzymanie kuli wysuwa pionową kapsułkę „na górę / na dół”. Dlatego kula rozwija się
  // w poziomie dopiero po ruchu w bok albo po puszczeniu (stuknięcie), nie od razu, a kula-pion.js
  // przejmuje dotyk zdarzeniem jkf:kula-pion. Bez kula-pion.js (brak klasy kula-pion na <html>) rozwija się od razu.
  const pionTryb = () => document.documentElement.classList.contains('kula-pion');
  // karuzela kontaktów (kula-karuzela.js, od 18.11): kulą steruje karuzela, pasek tylko ją rysuje
  const karuzela = () => document.documentElement.classList.contains('kula-karuzela');
  document.addEventListener('jkf:kula-pion', () => {
    if (!down) return;
    down = null; dragged = false; bar.classList.remove('is-moving');
    glide(0); if (e) close();
  });
  function start(ev) {
    if (ev.button !== 0 || karuzela()) return;
    measure();
    down = { id: ev.pointerId, cx: ev.clientX, x0: liveX(), wasOpen: e === 1, onOpt: ev.target.closest('.suwak__opt') };
    dragged = false;
    if (down.onOpt) return;                          // stuknięcie w napis: zwykły link (niżej, click)
    if (knobAnim) { x = down.x0; knobAnim.cancel(); knobAnim = null; }
    knob.style.transform = knobPose(x, 1.08);         // lekkie „wciśnięcie” jak w iOS
    if (!down.wasOpen) { if (pionTryb()) down.wait = true; else open(); }
  }
  bar.addEventListener('pointerdown', start);
  bar.addEventListener('pointermove', ev => {
    if (!down || ev.pointerId !== down.id || down.onOpt) return;
    const dx = ev.clientX - down.cx;
    if (!dragged && Math.abs(dx) < 6) return;
    if (!dragged) { dragged = true; bar.classList.add('is-moving'); try { bar.setPointerCapture(ev.pointerId); } catch (err) { /* stary Safari */ } }
    if (down.wait) { down.wait = false; open(); }
    x = Math.max(-MAX, Math.min(MAX, down.x0 + dx));
    knob.style.transform = knobPose(x, 1.08); cover(x);
    hot(Math.abs(x) >= MAX * ACT ? Math.sign(x) : 0);
  });
  function end(ev, cancelled) {
    if (!down || ev.pointerId !== down.id) return;
    const d = down; down = null;
    bar.classList.remove('is-moving');
    if (d.onOpt) return;
    if (dragged) {
      const side = !cancelled && Math.abs(x) >= MAX * ACT ? Math.sign(x) : 0;
      if (side) {
        glide(side * MAX); hot(side);
        act(side);                                    // w zdarzeniu puszczenia palca
        closeSoon(650);
      } else {
        close();
      }
    } else if (cancelled) {
      if (!d.wasOpen) close(); else glide(0);         // przewijanie strony zaczęte na pasku
    } else if (d.wasOpen) {
      close();                                        // stuknięcie w gałkę przy otwartej kapsułce
    } else {
      if (d.wait) open();                             // z kula-pion.js: rozwinięcie dopiero przy puszczeniu
      glide(0); closeSoon(4000);                      // samo stuknięcie: kapsułka zostaje chwilę otwarta
    }
  }
  bar.addEventListener('pointerup', ev => end(ev, false));
  bar.addEventListener('pointercancel', ev => end(ev, true));
  // po przeciągnięciu czynność już się wykonała: kliknięcie, które doda przeglądarka, pomijamy
  bar.addEventListener('click', ev => {
    if (dragged) { ev.preventDefault(); dragged = false; return; }
    const o = ev.target.closest('.suwak__opt');
    if (o) {                                          // stuknięcie w napis: gałka jedzie do niego, link działa
      const side = o === optL ? -1 : 1;
      if (o.getAttribute('href').startsWith('#')) { ev.preventDefault(); act(side); }
      glide(side * MAX); hot(side); closeSoon(650);
    }
  }, true);
  // klawiatura: Enter / spacja otwiera, strzałki wybierają czynność
  knob.addEventListener('keydown', ev => {
    if (karuzela()) return;
    if (ev.key === 'ArrowLeft' || ev.key === 'ArrowRight') {
      ev.preventDefault(); measure(); if (e !== 1) open();
      const side = ev.key === 'ArrowLeft' ? -1 : 1;
      glide(side * MAX); hot(side); act(side); closeSoon(650);
    }
  });
  knob.addEventListener('click', ev => { if (karuzela()) return; if (ev.detail === 0) { if (e === 1) close(); else { open(); closeSoon(6000); } } });

  // otwarta kapsułka zwija się przy przewijaniu strony
  addEventListener('scroll', () => { if (e === 1 && !down && performance.now() - actedAt > 700) close(); }, { passive: true });
  addEventListener('resize', () => { measure(); setTrack(e); glide(e === 1 ? Math.sign(x) * Math.min(Math.abs(x), MAX) : 0); });

  measure(); setTrack(0); knob.style.transform = knobPose(0);
  opts.forEach(o => { o.style.opacity = 0; });
})();
