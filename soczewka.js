// Soczewka jak w iOS 26 (Liquid Glass, film klienta 19.11): przy dotknięciu i przesuwaniu szklana soczewka suwaka
// rośnie ponad szkło, jej krawędź mieni się kolorami, a w ruchu rozciąga się w kierunku przesuwania (jak
// galaretka) i wraca do koła, gdy palec zwalnia. Po puszczeniu sprężyście kurczy się z powrotem.
// Używają jej: karuzela kontaktów (kula-karuzela.js), „Na górę / Na dół” (kula-pion.js), suwak instrukcji w czacie.
// Soczewka = element z klasą .soczewka i dzieckiem .soczewka__szklo (to ono jest skalowane - tylko transform).
window.JKFSoczewka = (() => {
  const st = new WeakMap(), WIEKSZA = 1.32, MAX = .22;
  const szklo = el => el && el.querySelector('.soczewka__szklo');
  function ustaw(el, s) {
    const g = szklo(el); if (!g) return;
    const k = Math.min(MAX, Math.abs(s.v) * .42), dl = WIEKSZA * (1 + k), kr = WIEKSZA * (1 - k * .45);
    g.style.transform = s.os === 'x' ? `scale(${dl.toFixed(3)}, ${kr.toFixed(3)})` : `scale(${kr.toFixed(3)}, ${dl.toFixed(3)})`;
  }
  function wcisnij(el, os = 'x') {
    if (!szklo(el)) return;
    const s = { os, p: null, t: 0, v: 0, raf: 0 };
    st.set(el, s); el.classList.add('is-wcisnieta'); ustaw(el, s);
  }
  // poz: położenie palca w osi suwaka (px); prędkość wygładzona, wygasa sama, gdy palec stoi
  function ruch(el, poz) {
    const s = st.get(el); if (!s) return;
    const t = performance.now();
    if (s.p !== null && t > s.t) s.v = s.v * .55 + ((poz - s.p) / (t - s.t)) * .45;
    s.p = poz; s.t = t; ustaw(el, s);
    cancelAnimationFrame(s.raf);
    const wygas = () => { s.v *= .86; ustaw(el, s); if (Math.abs(s.v) > .01) s.raf = requestAnimationFrame(wygas); };
    s.raf = requestAnimationFrame(wygas);
  }
  function pusc(el) {
    const s = st.get(el); if (s) cancelAnimationFrame(s.raf);
    st.delete(el); if (!el) return;
    el.classList.remove('is-wcisnieta');
    const g = szklo(el); if (g) g.style.transform = '';
  }
  return { wcisnij, ruch, pusc };
})();
