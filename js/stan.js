// Stan aplikacji w localStorage: wersja schematu, migracja, eksport/import, aktywność dzienna i seria dni.
import { HISP } from './jezyk.js';
export const WERSJA = 2;
// osobne profile: Polak uczy się hiszpańskiego / osoba hiszpańskojęzyczna uczy się polskiego
export const KLUCZ = HISP ? 'pl-nauka-v1' : 'es-nauka-v2';
const STARY_KLUCZ = HISP ? null : 'es-nauka';

export const domyslneUstawienia = () => ({
  wariant: 'es',          // 'es' Hiszpania | 'latam' Ameryka Łacińska | 'neutral'
  bezVosotros: false,     // ukryj formę vosotros w odmianach i ćwiczeniach
  glos: '', tempo: 1, auto: true,
  cel: 20,                // cel dzienny: liczba przećwiczonych pozycji
  skala: 2,               // 2 przyciski (Jeszcze nie / Umiem) albo 4 (Nie wiem / Trudne / Dobrze / Łatwe)
  styl: 'andalucia',
  styl3: true,            // styl ustawiony już po zmianie domyślnego na Andalucía
  przyp: '19:00',         // godzina codziennego przypomnienia (Kalendarz)
  plakietka: false,       // liczba powtórek na ikonie aplikacji
});

export const nowyStanAplikacji = () => ({
  v: WERSJA,
  srs: {},                // id elementu → stan SRS
  ulub: {},               // id → 1 (oznaczone gwiazdką)
  egz: {},                // poziom → najlepszy wynik %
  dni: {},                // 'RRRR-MM-DD' → liczba przećwiczonych pozycji
  hist: {},               // 'RRRR-MM-DD' → liczba opanowanych pozycji (wykres postępu)
  xp: 0, xpDni: {},       // punkty doświadczenia: razem i na dzień
  odznaki: {},            // id odznaki → data zdobycia
  licz: {},               // liczniki aktywności (dyktando, rozmowa, lekcja dnia…)
  rekordy: {},            // najlepsze wyniki wyzwań
  lekcjeDnia: {},         // 'RRRR-MM-DD' → wynik mini-quizu lekcji dnia
  rozmowy: {},            // ukończone scenki rozmowy
  ust: domyslneUstawienia(),
  ui: { poziom: 'A1', zakladka: 'slowka', tryb: 'fiszka', kier: 'es', temat: '' },
});

export function dzien(t = Date.now()) {
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Uzupełnia brakujące pola i podnosi stare wersje schematu.
export function migruj(dane, stareV1 = null, teraz = Date.now()) {
  const s = nowyStanAplikacji();
  if (dane && typeof dane === 'object' && dane.v >= 2) {
    Object.assign(s, dane, { ust: { ...s.ust, ...(dane.ust || {}) }, ui: { ...s.ui, ...(dane.ui || {}) } });
    if (!(dane.ust && dane.ust.styl3)) { if (s.ust.styl === 'burdeos') s.ust.styl = 'andalucia'; s.ust.styl3 = true; }
    s.v = WERSJA;
    return s;
  }
  // wersja 1 (stara strona): { poziom, umiem: {es: 1}, egz, seria, najlepsza, styl, glos }
  if (stareV1 && typeof stareV1 === 'object') {
    for (const es of Object.keys(stareV1.umiem || {})) {
      s.srs['w:' + es] = { n: 1, ok: 1, zle: 0, ef: 2.5, iv: 3, due: teraz + 3 * 864e5, last: teraz, myl: false };
    }
    Object.assign(s.egz, stareV1.egz || {});
    if (stareV1.poziom) s.ui.poziom = stareV1.poziom;
    if (stareV1.glos) s.ust.glos = stareV1.glos;
  }
  return s;
}

export function wczytaj(magazyn = globalThis.localStorage) {
  try {
    const nowe = JSON.parse(magazyn.getItem(KLUCZ) || 'null');
    const stare = nowe || !STARY_KLUCZ ? null : JSON.parse(magazyn.getItem(STARY_KLUCZ) || 'null');
    return migruj(nowe, stare);
  } catch (e) { return nowyStanAplikacji(); }
}

export function zapisz(stan, magazyn = globalThis.localStorage) {
  try { magazyn.setItem(KLUCZ, JSON.stringify(stan)); return true; } catch (e) { return false; }
}

// --- aktywność dzienna i seria ---
export function dodajAktywnosc(stan, ile = 1, teraz = Date.now()) {
  const d = dzien(teraz);
  stan.dni[d] = (stan.dni[d] || 0) + ile;
  return stan.dni[d];
}

// Seria: kolejne dni z osiągniętym celem. Dzisiejszy dzień liczy się, gdy cel już osiągnięty;
// jeśli jeszcze nie, seria z wczoraj trwa (do północy).
// Zamrożenie serii: jeden opuszczony dzień na 7 dni nie przerywa serii (sam się nie liczy), o ile dzień przed nim miał cel.
export function seriaSzczegoly(stan, teraz = Date.now()) {
  const cel = stan.ust.cel, ok = t => (stan.dni[dzien(t)] || 0) >= cel;
  let n = ok(teraz) ? 1 : 0, ostZamr = -99;
  const zamrozone = [];
  let t = teraz - 864e5;
  // idziemy po datach (dzien() liczy datę lokalną, więc zmiana czasu nie przeszkadza)
  for (let i = 0; i < 3650; i++, t -= 864e5) {
    if (ok(t)) { n++; continue; }
    if (i - ostZamr >= 7 && ok(t - 864e5)) { ostZamr = i; zamrozone.push(dzien(t)); continue; }
    break;
  }
  return { n, zamrozone };
}
export const seria = (stan, teraz = Date.now()) => seriaSzczegoly(stan, teraz).n;

// --- eksport / import ---
export const eksportuj = stan => JSON.stringify({ aplikacja: HISP ? 'polaco-jkf' : 'espanol-jkf', ...stan }, null, 1);

export function importuj(tekst) {
  const d = JSON.parse(tekst);
  if (!d || typeof d !== 'object' || !d.srs || typeof d.srs !== 'object') throw new Error(HISP ? 'Este archivo no contiene progreso de esta aplicación.' : 'To nie jest plik z postępami tej aplikacji.');
  return migruj({ ...d, v: Math.max(2, d.v || 2) });
}
