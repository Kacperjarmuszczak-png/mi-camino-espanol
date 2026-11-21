// Dziennik częstych błędów: ćwiczenia zgłaszają kategorię pomyłki (akcent, rodzajnik, ser/estar, czas…),
// a widok „Twoje częste błędy” podsuwa krótką powtórkę właśnie z tego.
import { HISP, t as tr } from './jezyk.js';

/** Kategorie: etykieta, reguła w jednym zdaniu i co ćwiczyć (kafelek / lekcja gramatyki). */
export function opisKategorii(kat, b = {}) {
  if (kat.startsWith('czas:')) {
    const c = b.nazwa || kat.slice(5);
    return { n: tr(`Odmiana: ${c}`, `Conjugación: ${c}`), r: tr('Mylisz formy w tym czasie – zrób krótki drill tylko z niego.', 'Fallas formas en este tiempo: haz un ejercicio solo con él.'), akcja: { czas: kat.slice(5) } };
  }
  if (kat.startsWith('gram:')) {
    const id = kat.slice(5);
    return { n: tr('Gramatyka', 'Gramática') + ': ' + (TYTULY[id] || id), r: tr('Wróć do reguły i zrób ćwiczenie jeszcze raz.', 'Vuelve a la regla y repite el ejercicio.'), akcja: { lekcja: id } };
  }
  const K = {
    akcent: HISP
      ? { n: 'Signos polacos (ą, ę, ó, ł…)', r: 'Las letras con signo son letras distintas: «laska» y «łaska» no significan lo mismo.', akcja: { slowa: 'akcent' } }
      : { n: 'Akcenty i tylda (á, é, ñ…)', r: 'Akcent zmienia znaczenie i wymowę: «papa» (ziemniak) i «papá» (tata). Ćwicz zasady tildy.', akcja: { kafel: 'tilde' } },
    rodzajnik: { n: 'Rodzajnik el / la', r: 'Ucz się rzeczownika razem z rodzajnikiem. Uwaga na wyjątki: el problema, el mapa, la mano, el agua.', akcja: { kafel: 'rodzajnik' } },
    'ser-estar': { n: 'Ser czy estar', r: 'Ser – cecha stała, tożsamość, zawód, godzina. Estar – stan, samopoczucie, położenie.', akcja: { lekcja: 'ser-estar' } },
    pisownia: { n: tr('Literówki i pisownia', 'Ortografía'), r: tr('Słowo prawie dobre – przepisz je kilka razy i przećwicz w trybie „Wpisz”.', 'Palabra casi correcta: escríbela varias veces en el modo «Escribir».'), akcja: { slowa: 'pisownia' } },
    falszywi: { n: tr('Fałszywi przyjaciele', 'Falsos amigos'), r: tr('Słowa podobne do polskich, ale znaczące co innego (embarazada = w ciąży).', 'Palabras parecidas que significan otra cosa.'), akcja: { kafel: 'falszywi' } },
    slowa: { n: tr('Słowa, które mylisz', 'Palabras que confundes'), r: tr('Te słowa najczęściej sprawiają Ci kłopot – krótka sesja tylko z nimi.', 'Estas palabras te cuestan más: una sesión corta solo con ellas.'), akcja: { slowa: 'mylone' } },
  };
  return K[kat] || { n: kat, r: '', akcja: null };
}
const TYTULY = {};
export function ustawTytulyLekcji(lekcje) { for (const l of lekcje) TYTULY[l.id] = l.t; }

/** Zapisuje błąd danej kategorii (z przykładem i – opcjonalnie – id słowa). */
export function zapiszBlad(stan, kat, { przyklad = '', id = '', nazwa = '' } = {}) {
  if (!kat) return;
  const B = stan.bledyTyp || (stan.bledyTyp = {});
  const b = B[kat] || (B[kat] = { n: 0, last: 0, prz: [], ids: [] });
  b.n++; b.last = Date.now(); if (nazwa) b.nazwa = nazwa;
  if (przyklad && !b.prz.includes(przyklad)) { b.prz.unshift(przyklad); b.prz = b.prz.slice(0, 4); }
  if (id && !b.ids.includes(id)) { b.ids.unshift(id); b.ids = b.ids.slice(0, 30); }
}

/** Kategorie posortowane: ważne = dużo błędów i niedawno. */
export function czesteBledy(stan, { teraz = Date.now(), min = 2 } = {}) {
  const B = stan.bledyTyp || {};
  return Object.entries(B)
    .filter(([, b]) => b.n >= min)
    .map(([kat, b]) => ({ kat, ...b, waga: b.n * (teraz - b.last < 14 * 864e5 ? 2 : 1) }))
    .sort((a, b) => b.waga - a.waga);
}
