// Dolna kula z monogramem JKF jako karuzela działów (przeniesione ze strony Fotografia JKF, film klienta 20.11).
// Stuknięcie albo przesunięcie w bok rozwija kulę w szklaną kapsułę; przesuwanie palcem kręci działami jak bębnem
// (w kółko), środkowy stoi pod soczewką z nazwą i opisem w dymku nad kapsułą. Stuknięcie środkowego otwiera dział,
// bocznego – przesuwa go na środek. Po 6 s bez dotyku kapsuła zwija się w kulę. Przytrzymanie kuli: na górę strony.
// Ruch tylko transform i opacity (szkło skalowane w poziomie z korektą zaokrąglenia, sprężyna).
import { soczewkaEfekt } from './suwak.js';

const IK = {
  slowka: '<path d="M6 3h9l5 5v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm8 0v5h6M8 13h8M8 17h5"/>',
  egzamin: '<path d="M9 4h6m-7 2h8a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2zm1 7 2 2 4-4"/>',
  czasowniki: '<path d="M4 6h16M4 12h10M4 18h13M17 10l3 2-3 2"/>',
  tlumacz: '<path d="M3 5h9M7.5 3v2m3 0c-.8 3.4-3.3 6.3-6.5 7.8M6 8.5c1.2 1.8 3 3.3 5 4.2M13 21l4-9 4 9m-6.8-3h5.6"/>',
  zwroty: '<path d="M4 4h11a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H9l-4 3v-3H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm16 5a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-1v3l-4-3h-3"/>',
  ustawienia: '<circle cx="12" cy="12" r="3.2"/><path d="M19.4 13a7.6 7.6 0 0 0 0-2l2-1.6-2-3.4-2.4 1a7.4 7.4 0 0 0-1.7-1L15 3.5h-4l-.4 2.5a7.4 7.4 0 0 0-1.7 1l-2.4-1-2 3.4 2 1.6a7.6 7.6 0 0 0 0 2l-2 1.6 2 3.4 2.4-1a7.4 7.4 0 0 0 1.7 1l.4 2.5h4l.4-2.5a7.4 7.4 0 0 0 1.7-1l2.4 1 2-3.4z"/>',
};
const POZ = [
  { k: 'slowka', n: 'Słówka', o: 'fiszki i powtórki' },
  { k: 'egzamin', n: 'Egzamin', o: 'sprawdź swój poziom' },
  { k: 'czasowniki', n: 'Czasowniki', o: 'odmiana i drill zdań' },
  { k: 'tlumacz', n: 'Tłumacz', o: 'zdania słowo po słowie' },
  { k: 'zwroty', n: 'Zwroty', o: 'dialogi z życia' },
  { k: 'ustawienia', n: 'Ustawienia', o: 'głos, styl i cel dnia' },
];
const N = POZ.length, KROK = 64, W = 300;

/**
 * @param {{ aktywna: () => string, otworz: (k: string) => void }} o
 *   aktywna – klucz bieżącej zakładki (kapsuła otwiera się na niej), otworz – przejście do działu
 */
export function zainicjujKule(o) {
  const d = document.documentElement;
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const kula = document.createElement('button');
  kula.type = 'button'; kula.className = 'kula';
  kula.setAttribute('aria-label', 'Działy nauki: stuknij albo przesuń w bok; przytrzymaj, aby wrócić na górę');
  kula.setAttribute('aria-expanded', 'false');
  const box = document.createElement('div');
  box.className = 'kkar'; box.setAttribute('role', 'menu'); box.setAttribute('aria-label', 'Działy nauki');
  box.innerHTML = `<span class="kkar__shape"></span><span class="kkar__mono" aria-hidden="true"></span><span class="kkar__lens" aria-hidden="true"><span class="kkar__szklo"></span></span>`
    + POZ.map((p, i) => `<button type="button" class="kkar__ik" role="menuitem" data-i="${i}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IK[p.k]}</svg></button>`).join('')
    + '<div class="kkar__tip" aria-live="polite"><b></b><small></small></div>';
  document.body.append(kula, box);
  const shape = box.querySelector('.kkar__shape'), lens = box.querySelector('.kkar__lens'), tip = box.querySelector('.kkar__tip'), mono = box.querySelector('.kkar__mono');
  const iki = [...box.querySelectorAll('.kkar__ik')];
  const efekt = soczewkaEfekt(lens);
  const pom = (e, od, dl) => Math.max(0, Math.min(1, (e - od) / dl));
  const mod = n => ((n % N) + N) % N;

  let poz = Math.max(0, POZ.findIndex(p => p.k === o.aktywna())), open = false, anims = [];
  function stan(i) {
    let dd = i - poz; dd = ((dd % N) + N) % N; if (dd > N / 2) dd -= N;
    const a = Math.abs(dd);
    return { a, x: dd * KROK, s: Math.max(0.5, 1 - a * 0.22), o: a > 2.3 ? 0 : Math.max(0, 1 - Math.max(0, a - 0.6) * 0.45) };
  }
  function rysuj() {
    iki.forEach((el, i) => {
      const { a, x, s, o: op } = stan(i);
      el.style.transform = `translateX(${x.toFixed(1)}px) scale(${s.toFixed(3)})`;
      el.style.opacity = op.toFixed(3);
      el.classList.toggle('is-srodek', a < 0.5);
      el.classList.toggle('is-aktywna', POZ[i].k === o.aktywna());
      el.tabIndex = a < 0.5 ? 0 : -1;
      el.setAttribute('aria-label', `${POZ[i].n}: ${POZ[i].o}`);
    });
    const p = POZ[mod(Math.round(poz))];
    tip.querySelector('b').textContent = p.n;
    tip.querySelector('small').textContent = p.o;
  }
  let jedzie = 0;
  function dojedz(cel) {
    cancelAnimationFrame(jedzie);
    const od = poz, t0 = performance.now(), dur = reduce() ? 1 : 420;
    const krok = now => { const u = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - u, 3); poz = od + (cel - od) * e; rysuj(); if (u < 1) jedzie = requestAnimationFrame(krok); };
    jedzie = requestAnimationFrame(krok);
  }

  // kształt: kula (60 px) → kapsuła (300 px), skala w poziomie z korektą zaokrąglenia, sprężyna przy otwieraniu
  const ZETA = 0.72, OMEGA = 12, WD = OMEGA * Math.sqrt(1 - ZETA * ZETA);
  const spring = u => { if (u >= 1) return 1; const x = u * 0.62; return 1 - Math.exp(-ZETA * OMEGA * x) * (Math.cos(WD * x) + ZETA * OMEGA / WD * Math.sin(WD * x)); };
  const easeOut = u => 1 - Math.pow(1 - u, 3);
  function morph(to) {
    anims.forEach(a => a.cancel()); anims = [];
    const s0 = 60 / W, R = 30, fr = [], dur = reduce() ? 1 : to ? 620 : 420, c = to ? spring : easeOut;
    for (let i = 0; i <= 40; i++) { const u = i / 40, e = to ? c(u) : 1 - c(u), sx = s0 + (1 - s0) * e; fr.push({ offset: u, transform: `scaleX(${sx.toFixed(4)})`, borderRadius: `${(R / sx).toFixed(2)}px / ${R}px` }); }
    anims.push(shape.animate(fr, { duration: dur, easing: 'linear', fill: 'forwards' }));
    // ikony jadą razem z krawędzią szkła i jaśnieją dopiero wewnątrz niego
    iki.forEach((el, i) => {
      const st = stan(i), kl = [];
      for (let k = 0; k <= 40; k++) {
        const u = k / 40, e = to ? c(u) : 1 - c(u), sx = s0 + (1 - s0) * e, pol = W / 2 * sx;
        const x = st.x * Math.min(1, e), w = 25 * st.s;
        const wSrodku = Math.max(0, Math.min(1, (pol - Math.abs(x) - w - 6) / 16));
        kl.push({ offset: u, transform: `translateX(${x.toFixed(1)}px) scale(${(st.s * (0.7 + 0.3 * Math.min(1, e))).toFixed(3)})`, opacity: (st.o * (st.a < 0.5 ? pom(e, 0.15, 0.35) : Math.min(wSrodku, pom(e, 0.3, 0.4)))).toFixed(3) });
      }
      anims.push(el.animate(kl, { duration: dur, easing: 'linear', fill: 'forwards' }));
    });
    // monogram gaśnie, gdy szkło rośnie; soczewka i ikona środka rozjaśniają się (przy zamykaniu odwrotnie)
    const mf = [], lf = [];
    for (let k = 0; k <= 40; k++) {
      const u = k / 40, e = to ? c(u) : 1 - c(u);
      mf.push({ offset: u, opacity: (1 - pom(e, 0, 0.35)).toFixed(3) });
      lf.push({ offset: u, opacity: pom(e, 0.1, 0.35).toFixed(3), transform: `scale(${(0.78 + 0.22 * Math.min(1, e)).toFixed(3)})` });
    }
    anims.push(mono.animate(mf, { duration: dur, easing: 'linear', fill: 'forwards' }));
    anims.push(lens.animate(lf, { duration: dur, easing: 'linear', fill: 'forwards' }));
    anims.push(tip.animate(to ? [{ opacity: 0 }, { opacity: 0, offset: 0.45 }, { opacity: 1 }] : [{ opacity: 1 }, { opacity: 0, offset: 0.3 }, { opacity: 0 }], { duration: dur, fill: 'forwards' }));
    const moje = anims;
    moje[0].finished.then(() => {
      if (anims !== moje) return;
      moje.forEach(a => a.cancel()); anims = [];
      if (!to) { box.classList.remove('is-open'); d.classList.remove('kkar-on'); }
      rysuj();
    }).catch(() => {});
  }
  let zamknijT = 0;
  const odlicz = () => { clearTimeout(zamknijT); zamknijT = setTimeout(schowaj, 6000); };
  function pokaz() {
    if (open) return;
    open = true; poz = Math.max(0, POZ.findIndex(p => p.k === o.aktywna()));
    rysuj(); box.classList.add('is-open'); d.classList.add('kkar-on'); kula.setAttribute('aria-expanded', 'true');
    morph(1); odlicz();
  }
  function schowaj() { if (!open) return; open = false; clearTimeout(zamknijT); kula.setAttribute('aria-expanded', 'false'); morph(0); }

  // dotyk: na kuli i na kapsule przesuwanie kręci bębnem; przytrzymanie kuli = na górę strony
  let dot = null, pomin = false, trzymT = 0;
  const startuj = (ev, naKuli) => {
    if (ev.button) return;
    dot = { id: ev.pointerId, x0: ev.clientX, y0: ev.clientY, p0: poz, ruch: false, naKuli };
    cancelAnimationFrame(jedzie); clearTimeout(zamknijT);
    if (naKuli) {
      kula.classList.add('is-wcisk');
      clearTimeout(trzymT);
      trzymT = setTimeout(() => {
        if (!dot || dot.ruch) return;
        dot = null; kula.classList.remove('is-wcisk'); pomin = true; setTimeout(() => { pomin = false; }, 500);
        scrollTo({ top: 0, behavior: reduce() ? 'auto' : 'smooth' });
        if (navigator.vibrate) navigator.vibrate(8);
      }, 550);
    }
  };
  kula.addEventListener('pointerdown', ev => { if (!open) startuj(ev, true); });
  box.addEventListener('pointerdown', ev => startuj(ev, false));
  document.addEventListener('pointermove', ev => {
    if (!dot || ev.pointerId !== dot.id) return;
    const dx = ev.clientX - dot.x0;
    if (!dot.ruch && Math.abs(dx) < 8) return;
    if (!dot.ruch) {
      if (Math.abs(ev.clientY - dot.y0) > Math.abs(dx)) { dot = null; clearTimeout(trzymT); kula.classList.remove('is-wcisk'); return; }
      dot.ruch = true; clearTimeout(trzymT); kula.classList.remove('is-wcisk'); pokaz(); wcisk(true);
    }
    poz = dot.p0 - dx / KROK; rysuj();
    efekt.ruch(ev.clientX);
  });
  document.addEventListener('touchmove', ev => { if (dot && dot.ruch) ev.preventDefault(); }, { passive: false });
  document.addEventListener('pointerup', ev => {
    if (!dot || ev.pointerId !== dot.id) return;
    const x = dot; dot = null; clearTimeout(trzymT); kula.classList.remove('is-wcisk');
    if (x.ruch) { wcisk(false); dojedz(Math.round(poz)); odlicz(); pomin = true; setTimeout(() => { pomin = false; }, 350); return; }
    // stuknięcie w kulę otwiera kapsułę; następne kliknięcie przeglądarki trafiłoby w środkowy dział – pomijamy je
    if (x.naKuli) { pomin = true; setTimeout(() => { pomin = false; }, 450); pokaz(); return; }
  });
  document.addEventListener('pointercancel', ev => { if (dot && ev.pointerId === dot.id) { if (dot.ruch) { wcisk(false); dojedz(Math.round(poz)); } dot = null; clearTimeout(trzymT); kula.classList.remove('is-wcisk'); } });
  function wcisk(on) { box.classList.toggle('is-wcisk', on); if (on) efekt.wcisnij(); else efekt.pusc(); }
  // klawiatura: Enter / spacja na kuli otwiera, strzałki kręcą, Esc zamyka
  kula.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); pokaz(); setTimeout(() => { const s = box.querySelector('.is-srodek'); if (s) s.focus(); }, 50); } });
  box.addEventListener('keydown', ev => {
    if (ev.key === 'ArrowRight' || ev.key === 'ArrowLeft') { ev.preventDefault(); ev.stopPropagation(); dojedz(Math.round(poz) + (ev.key === 'ArrowRight' ? 1 : -1)); odlicz(); setTimeout(() => { const s = box.querySelector('.is-srodek'); if (s) s.focus(); }, 440); }
    if (ev.key === 'Escape') { ev.stopPropagation(); schowaj(); kula.focus(); }
  });
  box.addEventListener('click', ev => {
    if (pomin) return;
    const b = ev.target.closest('.kkar__ik'); if (!b) return;
    const i = +b.dataset.i;
    if (b.classList.contains('is-srodek')) { o.otworz(POZ[i].k); schowaj(); return; }
    let dd = i - Math.round(poz); dd = ((dd % N) + N) % N; if (dd > N / 2) dd -= N;
    dojedz(Math.round(poz) + dd); odlicz();
  });
  document.addEventListener('pointerdown', ev => { if (open && !box.contains(ev.target) && !kula.contains(ev.target)) schowaj(); }, true);
  addEventListener('scroll', () => { if (open && !dot) schowaj(); }, { passive: true });
  rysuj();
  return { odswiez: rysuj, schowaj };
}
