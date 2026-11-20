// Tryb jasny (19.11 (5)): przełącznik w stopce. Domyślnie strona jest ciemna (jej własny styl); wybór zapamiętany
// na tym urządzeniu (localStorage jkf-motyw). Klasę html.jasny ustawia już skrypt w <head> (bez mignięcia).
// Pływające szkło (wyspa, kula, czat, języki) zostaje ciemne - zmienia się tło i treść sekcji (jasny.css).
(() => {
  const b = document.getElementById('motyw');
  if (!b) return;
  const T = { pl: ['Tryb jasny', 'Tryb ciemny'], en: ['Light mode', 'Dark mode'], de: ['Heller Modus', 'Dunkler Modus'], es: ['Modo claro', 'Modo oscuro'] };
  const SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4"/></svg>';
  const MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10z"/></svg>';
  const html = document.documentElement, meta = document.querySelector('meta[name="theme-color"]');
  const lang = () => (window.I18N && T[I18N.lang] ? I18N.lang : 'pl');
  function rysuj() {
    const j = html.classList.contains('jasny');
    b.setAttribute('aria-pressed', String(j));
    b.querySelector('.motyw__ik').innerHTML = j ? MOON : SUN;
    b.querySelector('.motyw__t').textContent = T[lang()][j ? 1 : 0];
  }
  b.addEventListener('click', () => {
    const j = !html.classList.contains('jasny');
    html.classList.toggle('jasny', j);
    if (meta) meta.content = j ? '#f4efe3' : '#1c241f';
    try { if (j) localStorage.setItem('jkf-motyw', 'jasny'); else localStorage.removeItem('jkf-motyw'); } catch (e) { /* tryb prywatny */ }
    rysuj();
  });
  document.addEventListener('jkf:language', rysuj);
  rysuj();
})();
