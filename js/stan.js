// Stan aplikacji w localStorage: wersja schematu, migracja, eksport/import, aktywność dzienna i seria dni.
export const WERSJA = 2;
export const KLUCZ = 'es-nauka-v2';
const STARY_KLUCZ = 'es-nauka';

export const domyslneUstawienia = () => ({
  wariant: 'es',          // 'es' Hiszpania | 'latam' Ameryka Łacińska | 'neutral'
  bezVosotros: false,     // ukryj formę vosotros w odmianach i ćwiczeniach
  glos: '', tempo: 1, auto: true,
  cel: 20,                // cel dzienny: liczba przećwiczonych pozycji
  skala: 2,               // 2 przyciski (Jeszcze nie / Umiem) albo 4 (Nie wiem / Trudne / Dobrze / Łatwe)
  styl: 'burdeos',
});

export const nowyStanAplikacji = () => ({
  v: WERSJA,
  srs: {},                // id elementu → stan SRS
  ulub: {},               // id → 1 (oznaczone gwiazdką)
  egz: {},                // poziom → najlepszy wynik %
  dni: {},                // 'RRRR-MM-DD' → liczba przećwiczonych pozycji
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
    const stare = nowe ? null : JSON.parse(magazyn.getItem(STARY_KLUCZ) || 'null');
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
export function seria(stan, teraz = Date.now()) {
  const cel = stan.ust.cel;
  let n = 0, t = teraz;
  if ((stan.dni[dzien(t)] || 0) >= cel) n = 1;
  t -= 864e5;
  // przejście przez zmianę czasu: idziemy po datach, nie po stałych 24 h
  for (let i = 0; i < 3650; i++) {
    const d = dzien(t);
    if ((stan.dni[d] || 0) >= cel) { n++; t -= 864e5; } else break;
  }
  return n;
}

// --- eksport / import ---
export const eksportuj = stan => JSON.stringify({ aplikacja: 'espanol-jkf', ...stan }, null, 1);

export function importuj(tekst) {
  const d = JSON.parse(tekst);
  if (!d || typeof d !== 'object' || !d.srs || typeof d.srs !== 'object') throw new Error('To nie jest plik z postępami tej aplikacji.');
  return migruj({ ...d, v: Math.max(2, d.v || 2) });
}
