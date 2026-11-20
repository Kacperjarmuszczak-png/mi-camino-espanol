// Język aplikacji (tryb nauki), ustalany raz przy starcie:
//  'pl' – Polak uczy się hiszpańskiego (domyślnie),
//  'es' – osoba hiszpańskojęzyczna uczy się polskiego (interfejs po hiszpańsku, osobny profil postępów).
// Bez zapisanego wyboru: przeglądarka po hiszpańsku i brak polskiego profilu → tryb 'es'.
export const KLUCZ_JEZYKA = 'jkf-jezyk';

function odczytaj() {
  try {
    const ls = globalThis.localStorage;
    if (!ls) return 'pl';
    const z = ls.getItem(KLUCZ_JEZYKA);
    if (z === 'pl' || z === 'es') return z;
    if (ls.getItem('es-nauka-v2') || ls.getItem('es-nauka')) return 'pl';
    const nav = globalThis.navigator;
    return nav && /^es\b/i.test(nav.language || '') ? 'es' : 'pl';
  } catch (e) { return 'pl'; }
}

export const JEZYK = odczytaj();
/** true: interfejs po hiszpańsku, uczymy się polskiego */
export const HISP = JEZYK === 'es';
/** Tekst interfejsu w języku użytkownika: t('po polsku', 'en español') */
export const t = (pl, es) => (HISP ? es : pl);
/** Kod języka, którego się uczymy (pole „es” elementów danych zawiera tekst w tym języku) */
export const CEL = HISP ? 'pl' : 'es';

export function ustawJezyk(j) {
  try { globalThis.localStorage.setItem(KLUCZ_JEZYKA, j); } catch (e) { /* brak pamięci */ }
  location.reload();
}

if (typeof document !== 'undefined') document.documentElement.lang = HISP ? 'es' : 'pl';
