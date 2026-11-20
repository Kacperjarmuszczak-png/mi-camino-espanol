// Kopia z Fotografii JKF (19.11), działy nauki zamiast kontaktów. Dolna kula jako „karuzela” wszystkich kontaktów (projekt 5, dla wszystkich od 18.11, wybór klienta).
// Stuknięcie albo przesunięcie w bok rozwija kulę w szklaną kapsułę; przesuwanie palcem kręci kontaktami jak
// bębnem (w kółko), środkowy jest pod soczewką z nazwą i danymi nad kapsułą. Stuknięcie w środkowy otwiera
// kontakt, w boczny - przesuwa go na środek. Przytrzymanie kuli: dalej „Na górę / Na dół” (kula-pion.js).
// Ruch: transform i opacity (kształt skalowany w poziomie z korektą zaokrąglenia, sprężyna jak w wyspie).
(() => {
  const d = document.documentElement;
  d.classList.add('kula-karuzela');
  const bar = document.getElementById('quickbar');
  const knob = bar && bar.querySelector('.suwak__knob');
  if (!knob) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Wersja do nauki hiszpańskiego: zamiast kontaktów - działy strony (stuknięcie środka przewija do działu).
  const IK = {
    fiszki: '<rect x="3.5" y="6" width="13" height="13" rx="2"/><path d="M7.5 6V4.5h13v13H17"/>',
    quiz: '<circle cx="12" cy="12" r="8.5"/><path d="M9.6 9.6a2.5 2.5 0 1 1 3.4 2.3c-.7.3-1 .8-1 1.5v.4"/><circle cx="12" cy="16.7" r=".6" fill="currentColor"/>',
    odmiana: '<path d="M4 6h16M4 12h10M4 18h7"/><path d="m16 15 2.5 3 3.5-5"/>',
    slownik: '<path d="M5 4.5h11a3 3 0 0 1 3 3v12H8a3 3 0 0 1-3-3z"/><path d="M5 16.5a3 3 0 0 1 3-3h11"/>',
    zwroty: '<path d="M4 5.5h16v10H9l-5 4z"/><path d="M8 9.5h8M8 12h5"/>',
    gram: '<path d="M12 3.5 3.5 8 12 12.5 20.5 8z"/><path d="M6.5 10v5c0 1.5 2.5 3 5.5 3s5.5-1.5 5.5-3v-5"/>',
  };
  const T = { pl: { fiszki: 'Fiszki', quiz: 'Quiz', odmiana: 'Odmiana', slownik: 'Słownik', zwroty: 'Zwroty', gram: 'Gramatyka',
    fiszkiD: 'ucz się słówek', quizD: 'sprawdź się', odmianaD: 'czasowniki w 7 czasach', slownikD: 'szukaj słowa', zwrotyD: 'gotowe zdania', gramD: 'najważniejsze zasady', hint: 'przesuń · stuknij środek' } };
  const t = () => T.pl;
  const do_ = id => () => { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); };
  const POZ = [
    { k: 'fiszki', opis: () => t().fiszkiD, idz: do_('fiszki') },
    { k: 'quiz', opis: () => t().quizD, idz: do_('quiz') },
    { k: 'odmiana', opis: () => t().odmianaD, idz: do_('odmiana') },
    { k: 'slownik', opis: () => t().slownikD, idz: do_('slownik') },
    { k: 'zwroty', opis: () => t().zwrotyD, idz: do_('zwroty') },
    { k: 'gram', opis: () => t().gramD, idz: do_('gramatyka') },
  ];
  const N = POZ.length, KROK = 64, W = 300;

  const box = document.createElement('div');
  box.className = 'kkar';
  box.innerHTML = `<span class="kkar__shape"></span><span class="kkar__mono" aria-hidden="true"></span><span class="kkar__lens soczewka" aria-hidden="true"><span class="soczewka__szklo"></span></span>`
    + POZ.map((p, i) => `<button type="button" class="kkar__ik" data-i="${i}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IK[p.k]}</svg></button>`).join('')
    + `<div class="kkar__tip" aria-live="polite"><b></b><small></small></div>`;
  document.body.appendChild(box);
  const shape = box.querySelector('.kkar__shape'), lens = box.querySelector('.kkar__lens'), tip = box.querySelector('.kkar__tip'), mono = box.querySelector('.kkar__mono');
  const pom = (e, od, dl) => Math.max(0, Math.min(1, (e - od) / dl));             // 0..1 w przedziale postępu ruchu
  const iki = [...box.querySelectorAll('.kkar__ik')];

  // pozycja bębna: liczba (może być ułamkowa w trakcie przesuwania), środek = Math.round(poz) mod N
  let poz = 0, open = false, anims = [];
  const mod = n => ((n % N) + N) % N;
  // położenie ikony na bębnie: x od środka, skala i jasność (ikona „z tyłu bębna” ma jasność 0)
  function stan(i) {
    let dd = i - poz; dd = ((dd % N) + N) % N; if (dd > N / 2) dd -= N;            // najkrótsza odległość po bębnie
    const a = Math.abs(dd);
    return { dd, a, x: dd * KROK, s: Math.max(.5, 1 - a * .22), o: a > 2.3 ? 0 : Math.max(0, 1 - Math.max(0, a - .6) * .45) };
  }
  function rysuj() {
    iki.forEach((el, i) => {
      const { a, x, s, o } = stan(i);
      el.style.transform = `translateX(${x.toFixed(1)}px) scale(${s.toFixed(3)})`;
      el.style.opacity = o.toFixed(3);
      el.classList.toggle('is-srodek', a < .5);
      el.tabIndex = a < .5 ? 0 : -1;
    });
    const p = POZ[mod(Math.round(poz))];
    tip.querySelector('b').textContent = t()[p.k];
    tip.querySelector('small').textContent = p.opis();
    iki.forEach((el, i) => el.setAttribute('aria-label', `${t()[POZ[i].k]}: ${POZ[i].opis()}`));
  }
  let jedzie = 0;
  function dojedz(cel) {                                // sprężyste dociągnięcie bębna do pozycji
    cancelAnimationFrame(jedzie);
    const od = poz, t0 = performance.now(), dur = reduce ? 1 : 420;
    const krok = now => { const u = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - u, 3); poz = od + (cel - od) * e; rysuj(); if (u < 1) jedzie = requestAnimationFrame(krok); };
    jedzie = requestAnimationFrame(krok);
  }

  // kształt: kula (60 px) -> kapsuła (300 px), skala w poziomie z korektą zaokrąglenia (jak pasek.js)
  const ZETA = 0.72, OMEGA = 12, WD = OMEGA * Math.sqrt(1 - ZETA * ZETA);
  const spring = u => { if (u >= 1) return 1; const x = u * 0.62; return 1 - Math.exp(-ZETA * OMEGA * x) * (Math.cos(WD * x) + ZETA * OMEGA / WD * Math.sin(WD * x)); };
  const easeOut = u => 1 - Math.pow(1 - u, 3);
  function morph(to) {
    anims.forEach(a => a.cancel()); anims = [];
    const s0 = 60 / W, R = 30, fr = [], dur = reduce ? 1 : to ? 620 : 420, c = to ? spring : easeOut;
    for (let i = 0; i <= 40; i++) { const u = i / 40, e = to ? c(u) : 1 - c(u), sx = s0 + (1 - s0) * e; fr.push({ offset: u, transform: `scaleX(${sx.toFixed(4)})`, borderRadius: `${(R / sx).toFixed(2)}px / ${R}px` }); }
    anims.push(shape.animate(fr, { duration: dur, easing: 'linear', fill: 'forwards' }));
    // Ikony jadą razem z krawędzią szkła (film 18.11: wisiały w pustym miejscu przed otwarciem i po zamknięciu):
    // położenie rośnie od środka kuli z tą samą krzywą co szkło, a ikona jaśnieje dopiero, gdy jest w środku
    // szkła (z 10 px zapasu od krawędzi). Ikona z tyłu bębna (jasność 0) zostaje niewidoczna przez cały ruch.
    iki.forEach((el, i) => {
      const st = stan(i), kl = [];
      for (let k = 0; k <= 40; k++) {
        const u = k / 40, e = to ? c(u) : 1 - c(u), sx = s0 + (1 - s0) * e, pol = W / 2 * sx;
        const x = st.x * Math.min(1, e), w = 25 * st.s;                             // połowa szerokości ikony
        const wSrodku = Math.max(0, Math.min(1, (pol - Math.abs(x) - w - 6) / 16));
        kl.push({ offset: u, transform: `translateX(${x.toFixed(1)}px) scale(${(st.s * (.7 + .3 * Math.min(1, e))).toFixed(3)})`, opacity: (st.o * (st.a < .5 ? pom(e, .15, .35) : Math.min(wSrodku, pom(e, .3, .4)))).toFixed(3) });
      }
      anims.push(el.animate(kl, { duration: dur, easing: 'linear', fill: 'forwards' }));
    });
    // przejście z kuli (19.11): monogram JKF z kuli gaśnie, gdy szkło zaczyna rosnąć, a ikona środka i soczewka
    // rozjaśniają się w miarę rozwijania (wcześniej zamieniały się w jednej klatce); przy zamykaniu odwrotnie
    const mf = [], lf = [];
    for (let k = 0; k <= 40; k++) {
      const u = k / 40, e = to ? c(u) : 1 - c(u);
      mf.push({ offset: u, opacity: (1 - pom(e, 0, .35)).toFixed(3) });
      lf.push({ offset: u, opacity: pom(e, .1, .35).toFixed(3), transform: `scale(${(.78 + .22 * Math.min(1, e)).toFixed(3)})` });
    }
    anims.push(mono.animate(mf, { duration: dur, easing: 'linear', fill: 'forwards' }));
    anims.push(lens.animate(lf, { duration: dur, easing: 'linear', fill: 'forwards' }));
    // dymek z nazwą: dopiero przy prawie rozwiniętej kapsule; przy zamykaniu gaśnie od razu
    anims.push(tip.animate(to ? [{ opacity: 0 }, { opacity: 0, offset: .45 }, { opacity: 1 }] : [{ opacity: 1 }, { opacity: 0, offset: .3 }, { opacity: 0 }], { duration: dur, fill: 'forwards' }));
    const mine = anims;
    mine[0].finished.then(() => {
      if (anims !== mine) return;
      mine.forEach(a => a.cancel()); anims = [];
      if (!to) { box.classList.remove('is-open'); d.classList.remove('kkar-on'); }
    }).catch(() => {});
  }
  let zamknijT = 0;
  function pokaz() { if (open) return; open = true; rysuj(); box.classList.add('is-open'); d.classList.add('kkar-on'); morph(1); odlicz(); }
  function schowaj() { if (!open) return; open = false; clearTimeout(zamknijT); morph(0); }
  const odlicz = () => { clearTimeout(zamknijT); zamknijT = setTimeout(schowaj, 6000); };

  // dotyk: na kuli (zamkniętej) i na kapsule (otwartej) - przesuwanie kręci bębnem
  let dot = null;
  const startuj = (ev, naKuli) => {
    if (ev.button) return;
    dot = { id: ev.pointerId, x0: ev.clientX, y0: ev.clientY, p0: poz, ruch: false, naKuli, cel: ev.target.closest('.kkar__ik') };
    cancelAnimationFrame(jedzie); clearTimeout(zamknijT);
  };
  knob.addEventListener('pointerdown', ev => { if (!open) startuj(ev, true); });
  box.addEventListener('pointerdown', ev => startuj(ev, false));
  document.addEventListener('pointermove', ev => {
    if (!dot || ev.pointerId !== dot.id) return;
    const dx = ev.clientX - dot.x0;
    if (!dot.ruch && Math.abs(dx) < 8) return;
    if (!dot.ruch) { if (Math.abs(ev.clientY - dot.y0) > Math.abs(dx)) { dot = null; return; } dot.ruch = true; pokaz(); wcisk(true); }
    poz = dot.p0 - dx / KROK; rysuj();
    if (window.JKFSoczewka) JKFSoczewka.ruch(lens, ev.clientX);
  });
  // iPhone: przy kręceniu bębnem strona stoi
  document.addEventListener('touchmove', ev => { if (dot && dot.ruch) ev.preventDefault(); }, { passive: false });
  let pomin = false;
  document.addEventListener('pointerup', ev => {
    if (!dot || ev.pointerId !== dot.id) return;
    const x = dot; dot = null;
    if (x.ruch) { wcisk(false); dojedz(Math.round(poz)); odlicz(); pomin = true; setTimeout(() => { pomin = false; }, 350); return; }
    // stuknięcie w kulę otwiera kapsułę; kliknięcie, które przeglądarka doda zaraz potem, trafiłoby w środkowy
    // kontakt (np. „Zadzwoń”) - pomijamy je
    if (x.naKuli) { pomin = true; setTimeout(() => { pomin = false; }, 450); pokaz(); return; }
  });
  document.addEventListener('pointercancel', ev => { if (dot && ev.pointerId === dot.id) { if (dot.ruch) { wcisk(false); dojedz(Math.round(poz)); } dot = null; } });
  // soczewka jak w iOS: rośnie i „ciągnie się” w trakcie kręcenia, ikona pod nią się powiększa (soczewka.js)
  function wcisk(on) {
    box.classList.toggle('is-wcisk', on);
    if (!window.JKFSoczewka) return;
    if (on) JKFSoczewka.wcisnij(lens, 'x'); else JKFSoczewka.pusc(lens);
  }
  // przytrzymanie kuli otwiera „Na górę / Na dół” - wtedy karuzela się nie rozwija
  document.addEventListener('jkf:kula-pion', () => { dot = null; schowaj(); });
  // stuknięcie w kontakt: środkowy otwiera, boczny jedzie na środek (iPhone: przejście tylko po zwykłym stuknięciu)
  box.addEventListener('click', ev => {
    if (pomin) return;
    const b = ev.target.closest('.kkar__ik');
    if (!b) return;
    const i = +b.dataset.i;
    if (b.classList.contains('is-srodek')) { POZ[i].idz(); schowaj(); return; }
    let dd = i - Math.round(poz); dd = ((dd % N) + N) % N; if (dd > N / 2) dd -= N;
    dojedz(Math.round(poz) + dd); odlicz();
  });
  document.addEventListener('pointerdown', ev => { if (open && !box.contains(ev.target) && !bar.contains(ev.target)) schowaj(); }, true);
  addEventListener('scroll', () => { if (open && !dot) schowaj(); }, { passive: true });
  document.addEventListener('jkf:language', () => { if (open) rysuj(); });
  rysuj();
})();
