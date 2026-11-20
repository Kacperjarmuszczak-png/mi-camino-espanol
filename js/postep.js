// Motywacja (czyste funkcje): punkty doświadczenia (XP), poziom gracza, odznaki, podsumowanie tygodnia.
import { dzien } from './stan.js';
import { t as tr } from './jezyk.js';

export const xpZaOcene = o => (o >= 3 ? 10 : o === 2 ? 6 : 2);

// próg poziomu L: 100 · (L-1) · L / 2  → 0, 100, 300, 600, 1000, 1500…
const prog = L => 50 * (L - 1) * L;
export function poziomGracza(xp) {
  let L = 1;
  while (prog(L + 1) <= xp) L++;
  const od = prog(L), doN = prog(L + 1);
  return { poziom: L, xp, od, do: doN, proc: Math.round(100 * (xp - od) / (doN - od)) };
}

/** Odznaki: warunek na podstawie zestawienia { odp, seria, najdl, opan, egz, licz, poziom, rekordy }. */
export const ODZNAKI = [
  { id: 'start', ik: '🌱', n: tr('Pierwszy krok', 'Primer paso'), o: tr('Pierwsza odpowiedź', 'Primera respuesta'), w: z => z.odp >= 1 },
  { id: 'odp100', ik: '💬', n: tr('Rozgrzewka', 'Calentamiento'), o: tr('100 odpowiedzi', '100 respuestas'), w: z => z.odp >= 100 },
  { id: 'odp1000', ik: '🔥', n: tr('Maratończyk', 'Maratonista'), o: tr('1000 odpowiedzi', '1000 respuestas'), w: z => z.odp >= 1000 },
  { id: 'odp5000', ik: '🚀', n: tr('Niezmordowany', 'Incansable'), o: tr('5000 odpowiedzi', '5000 respuestas'), w: z => z.odp >= 5000 },
  { id: 'seria3', ik: '📅', n: tr('Trzy dni z rzędu', 'Tres días seguidos'), o: tr('Seria 3 dni', 'Racha de 3 días'), w: z => z.najdl >= 3 },
  { id: 'seria7', ik: '⭐', n: tr('Tydzień', 'Una semana'), o: tr('Seria 7 dni', 'Racha de 7 días'), w: z => z.najdl >= 7 },
  { id: 'seria30', ik: '🏆', n: tr('Miesiąc nauki', 'Un mes'), o: tr('Seria 30 dni', 'Racha de 30 días'), w: z => z.najdl >= 30 },
  { id: 'seria100', ik: '👑', n: tr('Sto dni', 'Cien días'), o: tr('Seria 100 dni', 'Racha de 100 días'), w: z => z.najdl >= 100 },
  { id: 'opan10', ik: '🧠', n: tr('Pierwsze opanowane', 'Primeras dominadas'), o: tr('10 opanowanych', '10 dominadas'), w: z => z.opan >= 10 },
  { id: 'opan100', ik: '📚', n: tr('Setka', 'Cien palabras'), o: tr('100 opanowanych', '100 dominadas'), w: z => z.opan >= 100 },
  { id: 'opan500', ik: '🎓', n: tr('Erudyta', 'Erudito'), o: tr('500 opanowanych', '500 dominadas'), w: z => z.opan >= 500 },
  { id: 'opan1000', ik: '💎', n: tr('Tysiąc', 'Mil'), o: tr('1000 opanowanych', '1000 dominadas'), w: z => z.opan >= 1000 },
  { id: 'egzA1', ik: '🥉', n: tr('Zdany A1', 'A1 aprobado'), o: tr('Egzamin A1 ≥ 70%', 'Examen A1 ≥ 70 %'), w: z => (z.egz.A1 || 0) >= 70 },
  { id: 'egzA2', ik: '🥈', n: tr('Zdany A2', 'A2 aprobado'), o: tr('Egzamin A2 ≥ 70%', 'Examen A2 ≥ 70 %'), w: z => (z.egz.A2 || 0) >= 70 },
  { id: 'egzB1', ik: '🥇', n: tr('Zdany B1', 'B1 aprobado'), o: tr('Egzamin B1 ≥ 70%', 'Examen B1 ≥ 70 %'), w: z => (z.egz.B1 || 0) >= 70 },
  { id: 'egzB2', ik: '🏅', n: tr('Zdany B2', 'B2 aprobado'), o: tr('Egzamin B2 ≥ 70%', 'Examen B2 ≥ 70 %'), w: z => (z.egz.B2 || 0) >= 70 },
  { id: 'egzC', ik: '🎖️', n: tr('Poziom C', 'Nivel C'), o: tr('Egzamin C1 lub C2 ≥ 70%', 'Examen C1 o C2 ≥ 70 %'), w: z => (z.egz.C1 || 0) >= 70 || (z.egz.C2 || 0) >= 70 },
  { id: 'lekcja7', ik: '☀️', n: tr('Codzienna lekcja', 'Lección diaria'), o: tr('7 lekcji dnia', '7 lecciones del día'), w: z => (z.licz.lekcja || 0) >= 7 },
  { id: 'dyktando20', ik: '✍️', n: tr('Ucho i pióro', 'Oído y pluma'), o: tr('20 dyktand', '20 dictados'), w: z => (z.licz.dyktando || 0) >= 20 },
  { id: 'zdania20', ik: '🧩', n: tr('Architekt zdań', 'Arquitecto de frases'), o: tr('20 ułożonych zdań', '20 frases ordenadas'), w: z => (z.licz.zdania || 0) >= 20 },
  { id: 'rozmowa3', ik: '🗣️', n: tr('Rozmówca', 'Conversador'), o: tr('3 rozmowy do końca', '3 conversaciones completas'), w: z => (z.licz.rozmowa || 0) >= 3 },
  { id: 'mow50', ik: '🎙️', n: tr('Dobra wymowa', 'Buena pronunciación'), o: tr('50 słów wymówionych dobrze', '50 palabras bien pronunciadas'), w: z => (z.licz.mow || 0) >= 50 },
  { id: 'czytanie10', ik: '📖', n: tr('Czytelnik', 'Lector'), o: tr('10 przeczytanych tekstów', '10 textos leídos'), w: z => (z.licz.czytanie || 0) >= 10 },
  { id: 'ekspres20', ik: '⚡', n: tr('Błyskawica', 'Relámpago'), o: tr('20 punktów w ekspresie', '20 puntos en el exprés'), w: z => (z.rekordy.ekspres || 0) >= 20 },
  { id: 'bezbledu20', ik: '🎯', n: tr('Snajper', 'Francotirador'), o: tr('20 bez błędu', '20 sin fallar'), w: z => (z.rekordy.bezbledu || 0) >= 20 },
  { id: 'poz5', ik: '🌟', n: tr('Poziom 5', 'Nivel 5'), o: tr('Poziom gracza 5', 'Nivel de jugador 5'), w: z => z.poziom >= 5 },
  { id: 'poz10', ik: '🌠', n: tr('Poziom 10', 'Nivel 10'), o: tr('Poziom gracza 10', 'Nivel de jugador 10'), w: z => z.poziom >= 10 },
];

/** Zwraca odznaki zdobyte teraz (jeszcze nie zapisane w stan.odznaki). */
export function noweOdznaki(zest, zdobyte) {
  return ODZNAKI.filter(o => !zdobyte[o.id] && o.w(zest));
}

/** Podsumowanie tygodnia: od poniedziałku do dziś vs te same dni poprzedniego tygodnia. */
export function tydzien(stan, teraz = Date.now()) {
  const dzis = new Date(teraz); dzis.setHours(12, 0, 0, 0);
  const ileDni = ((dzis.getDay() + 6) % 7) + 1;    // pon = 1 … ndz = 7
  const zakres = przes => Array.from({ length: ileDni }, (_, i) => dzien(dzis.getTime() - (ileDni - 1 - i + przes) * 864e5));
  const ten = zakres(0), poprz = zakres(7);
  const suma = (d, l) => l.reduce((a, k) => a + (d[k] || 0), 0);
  const najlepszy = ten.reduce((m, k) => ((stan.dni[k] || 0) > (stan.dni[m] || 0) ? k : m), ten[0]);
  const opan = k => { const klucze = Object.keys(stan.hist || {}).filter(x => x <= k).sort(); return klucze.length ? stan.hist[klucze[klucze.length - 1]] : 0; };
  return {
    dni: ten, odp: suma(stan.dni, ten), odpPoprz: suma(stan.dni, poprz), xp: suma(stan.xpDni || {}, ten), xpPoprz: suma(stan.xpDni || {}, poprz),
    aktywne: ten.filter(k => (stan.dni[k] || 0) > 0).length, celOsiagniety: ten.filter(k => (stan.dni[k] || 0) >= stan.ust.cel).length,
    najlepszy: (stan.dni[najlepszy] || 0) ? { k: najlepszy, n: stan.dni[najlepszy] } : null,
    noweOpan: opan(ten[ten.length - 1]) - opan(dzien(dzis.getTime() - ileDni * 864e5)),
  };
}
