// Wspólne elementy interfejsu: skróty DOM, modal, komunikat (toast), pasek znaków hiszpańskich, przyciski.
import { esc } from '../tekst.js';
import { t as tr, HISP } from '../jezyk.js';

export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export { esc };

export const IKONY = {
  glos: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 9v6h4l5 4V5L8 9H4zm12.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z"/></svg>',
  wolno: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 14.5a6.5 6.5 0 1 1 0-13 6.5 6.5 0 0 1 0 13zM12.75 8h-1.5v4.6l3.9 2.3.75-1.25-3.15-1.85V8z"/></svg>',
  gwiazda: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5l2.6 5.3 5.9.9-4.25 4.1 1 5.85L12 16.9l-5.25 2.75 1-5.85L3.5 9.7l5.9-.9z"/></svg>',
  ustawienia: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M19.4 13a7.6 7.6 0 0 0 0-2l2-1.6-2-3.4-2.4 1a7.4 7.4 0 0 0-1.7-1L15 3.5h-4l-.4 2.5a7.4 7.4 0 0 0-1.7 1l-2.4-1-2 3.4 2 1.6a7.6 7.6 0 0 0 0 2l-2 1.6 2 3.4 2.4-1a7.4 7.4 0 0 0 1.7 1l.4 2.5h4l.4-2.5a7.4 7.4 0 0 0 1.7-1l2.4 1 2-3.4-2-1.6zM13 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z" transform="translate(-1 0)"/></svg>',
  opcje: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" d="M4 7h10m4 0h2M4 17h4m4 0h8"/><circle cx="16" cy="7" r="2.2" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="10" cy="17" r="2.2" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
  ogien: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M13.5 2s.7 3-1.4 5.6C10.3 9.8 8 11.3 8 14.6A4.2 4.2 0 0 0 12 19a4.2 4.2 0 0 0 4-4.4c0-1.6-.8-2.8-1.5-3.6.1 1.4-.5 2.4-1.4 2.6.6-2.8-.4-5.4 2-8.3-1-.2-1.4-1.6-1.6-3.3zM12 22a7 7 0 0 1-7-7.2c0-4.3 3.1-6.3 4.8-8.4.6 2 1.6 3 1.6 3 .7-2.3 2.4-4.1 2.4-7.4 0 0 5.2 3 5.2 10.8A7 7 0 0 1 12 22z"/></svg>',
  podpowiedz: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a7 7 0 0 0-4 12.7V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.3A7 7 0 0 0 12 2zm2 11.6V16h-4v-2.4a5 5 0 1 1 4 0zM9 20h6v2H9z"/></svg>',
};

export const przyciskGlosu = (tekst, etykieta = tr('Posłuchaj', 'Escuchar')) =>
  `<button type="button" class="glos" data-mow="${esc(tekst)}" aria-label="${esc(etykieta)}: ${esc(tekst)}">${IKONY.glos}</button>`;
export const przyciskGwiazdki = (id, aktywna) =>
  `<button type="button" class="gwiazdka${aktywna ? ' on' : ''}" data-ulub="${esc(id)}" aria-pressed="${!!aktywna}" aria-label="${aktywna ? tr('Usuń z ulubionych', 'Quitar de favoritos') : tr('Dodaj do ulubionych', 'Añadir a favoritos')}">${IKONY.gwiazda}</button>`;

// Podświetla *słowo* w zdaniu przykładowym
export const podswietl = s => esc(s).replace(/\*([^*]+)\*/g, '<mark>$1</mark>');
export const bezGwiazdek = s => s.replace(/\*/g, '');

// --- komunikat ---
let toastCzas;
export function toast(tekst) {
  const t = $('#toast');
  t.textContent = tekst; t.hidden = false; t.classList.add('widoczny');
  clearTimeout(toastCzas);
  toastCzas = setTimeout(() => { t.classList.remove('widoczny'); setTimeout(() => { t.hidden = true; }, 300); }, 2600);
}

// --- arkusz od dołu (dawny modal; API bez zmian: otworzModal / zamknijModal) ---
let poZamknieciu = null, ostatniFokus = null, kontrolerModalu = null, chowanie = 0;
// Sygnał bieżącego arkusza: słuchacze dodane z { signal: sygnalModalu() } znikają przy zamknięciu / następnym otwarciu.
export const sygnalModalu = () => kontrolerModalu.signal;
export function otworzModal(tytul, html, { naZamkniecie } = {}) {
  if (poZamknieciu) { const f = poZamknieciu; poZamknieciu = null; f(); }   // np. odłóż przeniesiony element na miejsce
  if (kontrolerModalu) kontrolerModalu.abort();
  kontrolerModalu = new AbortController();
  clearTimeout(chowanie);
  const m = $('#modal');
  if (m.hidden) ostatniFokus = document.activeElement;
  $('#modal-tytul').textContent = tytul;
  $('#modal-tresc').innerHTML = html;
  $('.modal-okno', m).style.transform = '';
  m.hidden = false;
  requestAnimationFrame(() => m.classList.add('otwarty'));
  poZamknieciu = naZamkniecie || null;
  setTimeout(() => $('#modal-zamknij').focus({ preventScroll: true }), 30);
  return $('#modal-tresc');
}
export function zamknijModal() {
  const m = $('#modal');
  if (m.hidden) return;
  m.classList.remove('otwarty');
  if (kontrolerModalu) kontrolerModalu.abort();
  if (poZamknieciu) { const f = poZamknieciu; poZamknieciu = null; f(); }
  clearTimeout(chowanie);
  chowanie = setTimeout(() => { m.hidden = true; $('#modal-tresc').innerHTML = ''; $('.modal-okno', m).style.transform = ''; }, 380);
  if (ostatniFokus && ostatniFokus.focus) ostatniFokus.focus({ preventScroll: true });
}
// Przenosi istniejący element (z jego stanem i słuchaczami) do arkusza; po zamknięciu wraca na swoje miejsce.
export function arkuszZElementem(tytul, el) {
  const miejsce = document.createComment('miejsce arkusza');
  el.before(miejsce);
  const tresc = otworzModal(tytul, '', { naZamkniecie: () => miejsce.replaceWith(el) });
  tresc.append(el);
  return tresc;
}
// Przeciągnięcie arkusza w dół (za uchwyt / nagłówek) zamyka go
export function zainicjujArkusz() {
  const okno = $('.modal-okno');
  let d = null;
  okno.addEventListener('pointerdown', e => {
    if (!e.target.closest('.arkusz-uchwyt, .modal-gora') || e.target.closest('button')) return;
    d = { id: e.pointerId, y0: e.clientY, t0: performance.now(), dy: 0 };
    okno.setPointerCapture(e.pointerId);
    okno.classList.add('ciagniety');
  });
  okno.addEventListener('pointermove', e => {
    if (!d || e.pointerId !== d.id) return;
    d.dy = Math.max(0, e.clientY - d.y0);
    okno.style.transform = `translateY(${d.dy}px)`;
  });
  const koniec = e => {
    if (!d || e.pointerId !== d.id) return;
    const v = d.dy / Math.max(1, performance.now() - d.t0);
    okno.classList.remove('ciagniety');
    if (d.dy > 110 || v > 0.6) { okno.style.transform = 'translateY(110%)'; zamknijModal(); }
    else okno.style.transform = '';
    d = null;
  };
  okno.addEventListener('pointerup', koniec);
  okno.addEventListener('pointercancel', koniec);
}

// --- gruby szklany suwak (input range) z dymkiem wartości widocznym tylko w trakcie przesuwania ---
export function suwakZakres({ id, min, max, krok = 1, wartosc, format = v => v, etykieta }) {
  const p = (wartosc - min) / (max - min) * 100;
  return `<label class="zakres" style="--p:${p}%"><span class="zakres-et">${esc(etykieta)}</span>
    <span class="zakres-tor"><input type="range" id="${id}" min="${min}" max="${max}" step="${krok}" value="${wartosc}" aria-valuetext="${esc(format(wartosc))}">
    <output class="zakres-dymek" for="${id}">${esc(format(wartosc))}</output></span></label>`;
}
const formaty = new WeakMap();
export function podlaczZakres(input, format, naZmiane) {
  formaty.set(input, format);
  const odswiez = () => {
    const v = +input.value, p = (v - input.min) / (input.max - input.min) * 100;
    const l = input.closest('.zakres'); l.style.setProperty('--p', p + '%');
    const t = format(v); l.querySelector('.zakres-dymek').textContent = t; input.setAttribute('aria-valuetext', t);
  };
  input.addEventListener('input', () => { odswiez(); naZmiane(+input.value, false); });
  input.addEventListener('change', () => naZmiane(+input.value, true));
  const l = input.closest('.zakres');
  const wl = () => l.classList.add('aktywny'), wyl = () => setTimeout(() => l.classList.remove('aktywny'), 450);
  input.addEventListener('pointerdown', wl); input.addEventListener('pointerup', wyl); input.addEventListener('pointercancel', wyl);
  input.addEventListener('keydown', wl); input.addEventListener('keyup', wyl); input.addEventListener('blur', wyl);
  odswiez();
}
export const modalOtwarty = () => !$('#modal').hidden;

// --- pływający pasek znaków (nad klawiaturą telefonu): litery języka pola, do którego piszesz ---
const ZNAKI = { es: ['á', 'é', 'í', 'ó', 'ú', 'ü', 'ñ', '¿', '¡'], pl: ['ą', 'ć', 'ę', 'ł', 'ń', 'ó', 'ś', 'ź', 'ż'] };
export function zainicjujZnaki() {
  const pasek = $('#znaki');
  let pole = null, wielkie = false, zestaw = '';
  const rysuj = j => {
    if (j === zestaw) return;
    zestaw = j;
    pasek.innerHTML = ZNAKI[j].map(z => `<button type="button" tabindex="-1" data-znak="${z}" aria-label="${tr('Wstaw', 'Insertar')} ${z}">${z}</button>`).join('')
      + `<button type="button" tabindex="-1" data-znak="⇧" class="wielkie" aria-label="${tr('Wielkie litery', 'Mayúsculas')}" aria-pressed="${wielkie}">⇧</button>`;
  };
  // pozycja liczona od widocznego obszaru (visualViewport): tuż nad klawiaturą, a bez klawiatury nad dolnym dockiem
  const ustawPozycje = () => {
    if (pasek.hidden) return;
    const vv = window.visualViewport;
    const gora = vv ? vv.offsetTop : 0, wys = vv ? vv.height : window.innerHeight;
    const klawiatura = window.innerHeight - wys > 120;
    let dol = gora + wys;
    const dock = $('#zakladki');
    if (!klawiatura && dock && getComputedStyle(dock).display !== 'none') dol = Math.min(dol, dock.getBoundingClientRect().top + gora);
    pasek.style.setProperty('--y', Math.max(gora + 8, dol - pasek.offsetHeight - 8) + 'px');
  };
  document.addEventListener('focusin', e => {
    const t = e.target;
    if (t.matches && t.matches('input[data-znaki], textarea[data-znaki]')) {
      pole = t; rysuj((t.getAttribute('lang') || (HISP ? 'pl' : 'es')).startsWith('pl') ? 'pl' : 'es');
      pasek.hidden = false; document.body.classList.add('z-znakami');
      ustawPozycje(); setTimeout(ustawPozycje, 300); setTimeout(ustawPozycje, 700);
    }
  });
  document.addEventListener('focusout', () => setTimeout(() => {
    const a = document.activeElement;
    if (!(a && a.matches && a.matches('input[data-znaki], textarea[data-znaki]'))) { pasek.hidden = true; document.body.classList.remove('z-znakami'); }
  }, 120));
  if (window.visualViewport) { visualViewport.addEventListener('resize', ustawPozycje); visualViewport.addEventListener('scroll', ustawPozycje); }
  window.addEventListener('scroll', ustawPozycje, { passive: true });
  pasek.addEventListener('pointerdown', e => e.preventDefault());   // pole nie traci fokusu
  pasek.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b || !pole) return;
    const z = b.dataset.znak;
    if (z === '⇧') { wielkie = !wielkie; b.setAttribute('aria-pressed', wielkie); pasek.classList.toggle('wielkie-on', wielkie); return; }
    const znak = wielkie && !'¿¡'.includes(z) ? z.toUpperCase() : z;
    const s = pole.selectionStart ?? pole.value.length, k = pole.selectionEnd ?? s;
    pole.value = pole.value.slice(0, s) + znak + pole.value.slice(k);
    pole.setSelectionRange(s + 1, s + 1);
    pole.dispatchEvent(new Event('input', { bubbles: true }));
    pole.focus();
  });
}

// Pokazuje wpis z zaznaczonymi miejscami, gdzie brakuje akcentu
export function wpisZAkcentami(wpis, akcenty) {
  return [...wpis].map((c, i) => akcenty.includes(i) ? `<span class="brak-akcentu">${esc(c)}</span>` : esc(c)).join('');
}

// Połysk pod palcem / kursorem na szklanych elementach
export function zainicjujPolysk() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.addEventListener('pointermove', e => {
    const el = e.target.closest && e.target.closest('.btn, .szklo, .opcja, .fiszka');
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
    el.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
  }, { passive: true });
}

// Kapsuła „opcje”: jedna pigułka z podsumowaniem ustawień; po stuknięciu otwiera panel z resztą
export const kapsulaOpcji = (id, tekst) => `<button type="button" class="opcje-kapsula" id="${id}" aria-haspopup="dialog">${IKONY.opcje}<span>${tekst}</span></button>`;
