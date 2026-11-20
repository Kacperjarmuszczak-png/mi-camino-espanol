// Górna kapsuła jak Dynamic Island. Zwinięta: poziom + pierścień postępu dnia + nazwa sekcji.
// Rozwinięta (sprężyna): statystyki, suwak poziomów A1–C2, przełącznik trybu bieżącej sekcji i akcje (opcje, słowniczek,
// egzamin, ustawienia). Przełącznik trybu jest „lustrem” przełączników sekcji: wybór klika ich ukryty przycisk,
// więc logika modułów się nie zmienia. Zwija się po stuknięciu obok, Esc albo po wybraniu akcji.
import { $, esc } from './wspolne.js';

// skąd brać tryby każdej sekcji (przyciski w obszarze roboczym, ukryte stylem)
const ZRODLA = {
  slowka: { et: 'Tryb', sel: '#z-slowka .przelaczniki [data-tryb]' },
  zwroty: { et: 'Widok', sel: '#z-widoki [data-widok]' },
  czasowniki: { et: 'Widok', sel: '#c-widoki [data-cw]' },
  tlumacz: { et: 'Kierunek', sel: '#t-kier [data-tk]' },
  egzamin: { et: 'Zakres', sel: '#z-egzamin [data-ez]' },
};
const NAZWY = { slowka: 'Słówka', zwroty: 'Zwroty', czasowniki: 'Odmiana', tlumacz: 'Tłumacz', egzamin: 'Egzamin' };

/**
 * @param {{ sekcja: () => string, akcja: (k: string) => void, maAkcje: (k: string) => boolean }} o
 */
export function zainicjujWyspe(o) {
  const w = $('#wyspa'), btn = $('#wyspa-btn'), panel = $('#wyspa-panel'), tryby = $('#wyspa-tryby');
  let otwarta = false, najechanie = 0, zjazd = 0;

  function rysujTryby() {
    const z = ZRODLA[o.sekcja()];
    const zrodlo = z ? [...document.querySelectorAll(z.sel)] : [];
    tryby.hidden = !zrodlo.length;
    tryby.setAttribute('aria-label', z ? z.et : 'Tryb');
    tryby.innerHTML = zrodlo.map((b, i) => `<button type="button" data-wt="${i}" aria-pressed="${b.getAttribute('aria-pressed') === 'true'}">${esc(b.textContent.trim())}</button>`).join('');
    w.querySelectorAll('[data-wa]').forEach(b => { b.disabled = !o.maAkcje(b.dataset.wa); });
  }
  function odswiez() {
    $('#wyspa-sekcja').textContent = NAZWY[o.sekcja()] || '';
    if (otwarta) rysujTryby();
  }
  function ustaw(stan) {
    if (stan === otwarta) return;
    otwarta = stan;
    w.classList.toggle('otwarta', stan);
    btn.setAttribute('aria-expanded', stan);
    panel.setAttribute('aria-hidden', !stan);
    panel.inert = !stan;
    if (stan) rysujTryby();
  }
  btn.addEventListener('click', () => ustaw(!otwarta));
  // na komputerze: najechanie rozwija (z małym opóźnieniem), zjechanie zwija
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    w.addEventListener('pointerenter', () => { clearTimeout(zjazd); najechanie = setTimeout(() => ustaw(true), 260); });
    w.addEventListener('pointerleave', () => { clearTimeout(najechanie); zjazd = setTimeout(() => { if (!w.contains(document.activeElement) || document.activeElement === btn) ustaw(false); }, 500); });
  }
  tryby.addEventListener('click', e => {
    const b = e.target.closest('[data-wt]'); if (!b) return;
    const z = ZRODLA[o.sekcja()];
    const zrodlo = z ? [...document.querySelectorAll(z.sel)] : [];
    const cel = zrodlo[+b.dataset.wt];
    if (cel) cel.click();
    setTimeout(rysujTryby, 30);
  });
  w.addEventListener('click', e => {
    const a = e.target.closest('[data-wa], #ustawienia-btn, #dzis, #poziom-info');
    if (!a) return;
    if (a.dataset.wa) o.akcja(a.dataset.wa);
    ustaw(false);
  });
  document.addEventListener('pointerdown', e => { if (otwarta && !w.contains(e.target) && !e.target.closest('#modal')) ustaw(false); }, true);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && otwarta) { ustaw(false); btn.focus(); } });
  panel.inert = true;
  odswiez();
  return { odswiez, zwin: () => ustaw(false), otwarta: () => otwarta };
}
