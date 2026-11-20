// Liczebniki słownie (czyste funkcje): hiszpańskie 0–9999, ceny i godziny; polskie 0–9999 i ceny w złotych.
const JED = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce', 'trece', 'catorce', 'quince',
  'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve', 'veinte', 'veintiuno', 'veintidós', 'veintitrés', 'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve'];
const DZ = { 3: 'treinta', 4: 'cuarenta', 5: 'cincuenta', 6: 'sesenta', 7: 'setenta', 8: 'ochenta', 9: 'noventa' };
const SET = { 1: 'ciento', 2: 'doscientos', 3: 'trescientos', 4: 'cuatrocientos', 5: 'quinientos', 6: 'seiscientos', 7: 'setecientos', 8: 'ochocientos', 9: 'novecientos' };

function es99(n) {
  if (n < 30) return JED[n];
  const d = Math.floor(n / 10), j = n % 10;
  return DZ[d] + (j ? ' y ' + JED[j] : '');
}
function es999(n) {
  if (n === 100) return 'cien';
  const s = Math.floor(n / 100), r = n % 100;
  return [s ? SET[s] : '', r || !s ? es99(r) : ''].filter(Boolean).join(' ');
}
/** Liczba słownie po hiszpańsku (0–9999). apokopa: „un” / „veintiún” przed rzeczownikiem rodzaju męskiego. */
export function liczbaEs(n, { apokopa = false } = {}) {
  let t;
  if (n < 1000) t = es999(n);
  else {
    const ty = Math.floor(n / 1000), r = n % 1000;
    t = (ty === 1 ? 'mil' : es999(ty).replace(/uno$/, 'ún').replace(/^ún$/, 'un') + ' mil') + (r ? ' ' + es999(r) : '');
    t = t.replace(/veintiún mil/, 'veintiún mil');
  }
  if (apokopa) t = t.replace(/veintiuno$/, 'veintiún').replace(/uno$/, 'un');
  return t;
}
export function cenaEs(euro, centy) {
  const e = euro === 1 ? 'un euro' : `${liczbaEs(euro, { apokopa: true })} euros`;
  return centy ? `${e} con ${liczbaEs(centy)}` : e;
}
/** Godzina po hiszpańsku: h 1–12, m wielokrotność 5. */
export function godzinaEs(h, m) {
  const nast = h % 12 + 1;
  const godz = x => (x === 1 ? 'la una' : `las ${liczbaEs(x)}`);
  const zw = x => (x === 1 ? 'Es' : 'Son');
  if (m === 0) return `${zw(h)} ${godz(h)} en punto`;
  if (m <= 30) return `${zw(h)} ${godz(h)} y ${m === 15 ? 'cuarto' : m === 30 ? 'media' : liczbaEs(m)}`;
  const r = 60 - m;
  return `${zw(nast)} ${godz(nast)} menos ${r === 15 ? 'cuarto' : liczbaEs(r)}`;
}

// --- polski ---
const PJ = ['zero', 'jeden', 'dwa', 'trzy', 'cztery', 'pięć', 'sześć', 'siedem', 'osiem', 'dziewięć', 'dziesięć', 'jedenaście', 'dwanaście', 'trzynaście', 'czternaście', 'piętnaście', 'szesnaście', 'siedemnaście', 'osiemnaście', 'dziewiętnaście'];
const PD = { 2: 'dwadzieścia', 3: 'trzydzieści', 4: 'czterdzieści', 5: 'pięćdziesiąt', 6: 'sześćdziesiąt', 7: 'siedemdziesiąt', 8: 'osiemdziesiąt', 9: 'dziewięćdziesiąt' };
const PS = { 1: 'sto', 2: 'dwieście', 3: 'trzysta', 4: 'czterysta', 5: 'pięćset', 6: 'sześćset', 7: 'siedemset', 8: 'osiemset', 9: 'dziewięćset' };
function pl999(n) {
  const s = Math.floor(n / 100), r = n % 100, cz = [];
  if (s) cz.push(PS[s]);
  if (r >= 20) { cz.push(PD[Math.floor(r / 10)]); if (r % 10) cz.push(PJ[r % 10]); } else if (r || !s) cz.push(PJ[r]);
  return cz.join(' ');
}
/** Forma rzeczownika po liczebniku: 1 → f1, 2–4 (bez 12–14) → f2, reszta → f5. */
export const formaPl = (n, f1, f2, f5) => (n === 1 ? f1 : n % 10 >= 2 && n % 10 <= 4 && !(n % 100 >= 12 && n % 100 <= 14) ? f2 : f5);
export function liczbaPl(n) {
  if (n < 1000) return pl999(n);
  const ty = Math.floor(n / 1000), r = n % 1000;
  const t = ty === 1 ? 'tysiąc' : `${pl999(ty)} ${formaPl(ty, 'tysiąc', 'tysiące', 'tysięcy')}`;
  return t + (r ? ' ' + pl999(r) : '');
}
export function cenaPl(zl, gr) {
  const z = `${liczbaPl(zl)} ${formaPl(zl, 'złoty', 'złote', 'złotych')}`;
  return gr ? `${z} ${liczbaPl(gr)} ${formaPl(gr, 'grosz', 'grosze', 'groszy')}` : z;
}
