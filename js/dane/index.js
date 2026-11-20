// Jeden model danych z pakietów. Nowy pakiet słówek / zwrotów: zaimportuj go i dopisz do listy PAKIETY_*.
import { SLOWA } from './slowa.js';
import { PRZYKLADY } from './przyklady.js';
import { WARIANTY, RODZAJ_WYJATKI, MNOGA } from './warianty.js';
import { ZWROTY } from './zwroty.js';
import { ZWROTY_DODATKOWE } from './zwroty-dodatkowe.js';
import { poziomCzasownika } from './czasowniki.js';
import { CZASOWNIKI, grupa } from '../odmiana.js';

export const POZIOMY = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
export const OPIS_POZIOMU = {
  A1: { n: 'Początkujący', o: 'Powitania, liczby, rodzina, jedzenie, dom, pytania. Czas teraźniejszy, ser/estar, hay, gustar.' },
  A2: { n: 'Podstawowy', o: 'Miasto, podróże, zakupy, zdrowie, praca. Czasy przeszłe (perfecto, indefinido, imperfecto), futuro, tryb rozkazujący.' },
  B1: { n: 'Średnio zaawansowany', o: 'Praca i kariera, relacje, środowisko, media, opinie. Tryb łączący, condicional, zakazy.' },
  B2: { n: 'Wyższy średni', o: 'Społeczeństwo, gospodarka, nauka, emocje, mowa potoczna. Subjuntivo imperfecto, zdania warunkowe.' },
  C1: { n: 'Zaawansowany', o: 'Argumentacja, urzędy i prawo, pojęcia abstrakcyjne, rejestr formalny.' },
  C2: { n: 'Biegły', o: 'Idiomy, język literacki i książkowy, precyzyjne czasowniki, niuanse rejestru.' },
};

const PAKIETY_SLOW = [SLOWA];
const PAKIETY_ZWROTOW = [ZWROTY];

const ROD = { el: 'm', la: 'f', los: 'mpl', las: 'fpl' };
const AKC = { á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u' };

// Liczba mnoga z reguł; null, gdy reguła byłaby niepewna (wtedy nic nie pokazujemy).
export function liczbaMnoga(es) {
  if (MNOGA[es]) return MNOGA[es];
  const m = es.match(/^(el|la) ([^ ]+)( .+)?$/);
  if (!m) return null;
  const [, rodz, slowo, reszta = ''] = m;
  const art = rodz === 'el' ? 'los' : 'las';
  // przymiotnik w złożeniu („el vino tinto”) też by się odmieniał – pomijamy złożenia z przymiotnikiem
  if (reszta && !/^ (de|del|con|sin|a) /.test(reszta)) return null;
  let mn;
  if (/[aeiouáéó]$/.test(slowo)) mn = slowo + 's';
  else if (/[íú]$/.test(slowo)) mn = slowo + 'es';
  else if (/z$/.test(slowo)) mn = slowo.slice(0, -1) + 'ces';
  else if (/[áéíóú][ns]$/.test(slowo)) mn = slowo.replace(/[áéíóú](?=[ns]$)/, c => AKC[c]) + 'es';
  else if (/[ldrjy]$/.test(slowo)) mn = slowo + 'es';
  else if (/n$/.test(slowo) && !/[aeiou][^aeiou]*[aeiou]n$/.test(slowo)) mn = slowo + 'es';
  else return null;
  return `${art} ${mn}${reszta}`;
}

function przyklad(es) {
  const p = PRZYKLADY[es];
  if (!p) return null;
  const [e, pl] = p.split('|');
  return { es: e, pl };
}

// --- słówka ---
export const SLOWKA = [];
const widziane = new Set();
for (const pakiet of PAKIETY_SLOW) {
  for (const [p, tematy] of Object.entries(pakiet)) {
    for (const [t, lista] of Object.entries(tematy)) {
      for (const wpis of lista.split(';')) {
        const [es, pl] = wpis.split('|');
        const id = 'w:' + es;
        if (widziane.has(id)) {              // słowo wieloznaczne: jedno hasło, wszystkie znaczenia
          const w0 = SLOWKA.find(x => x.id === id);
          for (const z of pl.split(/, ?/)) if (!w0.pl.split(/, ?/).includes(z)) w0.pl += ', ' + z;
          continue;
        }
        widziane.add(id);
        const art = (es.match(/^(el|la|los|las) /) || [])[1];
        const rodzaj = RODZAJ_WYJATKI[es] || (art ? ROD[art] : null);
        const w = WARIANTY[es];
        SLOWKA.push({
          id, typ: 'slowo', es, pl, p, t,
          rodzaj, mnoga: art === 'el' || art === 'la' ? liczbaMnoga(es) : null,
          przyklad: przyklad(es),
          latam: w ? { es: w.latam, nota: w.nota } : null,
        });
      }
    }
  }
}

// --- czasowniki ---
export const CZAS = CZASOWNIKI.map(v => ({ id: 'v:' + v.inf, typ: 'czasownik', ...v, es: v.inf, p: poziomCzasownika(v.inf), grupa: grupa(v) }));

// --- zwroty ---
export const KATEGORIE_ZWROTOW = [];
export const ZWROTY_LISTA = [];
const czysc = s => s.toLowerCase().replace(/[¿?¡!.,…]/g, '').trim();
const juzZwrot = new Set();
for (const pakiet of PAKIETY_ZWROTOW) {
  for (const kat of pakiet) {
    KATEGORIE_ZWROTOW.push({ t: kat.t, p: kat.p });
    for (const [es, pl, reg, kiedy, dialog] of kat.z) {
      const kw = dialog.split('|').map(l => ({ kto: l.slice(0, 1), tekst: l.slice(3) }));
      const luka = (dialog.match(/\*([^*]+)\*/) || [])[1] || es;
      juzZwrot.add(czysc(es));
      ZWROTY_LISTA.push({ id: 'z:' + es, typ: 'zwrot', es, pl, reg, kiedy, dialog: kw, luka, t: kat.t, p: kat.p });
    }
  }
}
for (const [kat, lista] of Object.entries(ZWROTY_DODATKOWE)) {
  const t = kat.trim();
  let k = KATEGORIE_ZWROTOW.find(x => x.t === t);
  if (!k) { k = { t, p: 'A1' }; KATEGORIE_ZWROTOW.push(k); }
  for (const wpis of lista.split(';')) {
    const [es, pl] = wpis.split('|');
    if (juzZwrot.has(czysc(es))) continue;
    juzZwrot.add(czysc(es));
    ZWROTY_LISTA.push({ id: 'z:' + es, typ: 'zwrot', es, pl, reg: 'neutr', kiedy: '', dialog: [], luka: '', t, p: k.p });
  }
}

export const WSZYSTKIE = [...SLOWKA, ...CZAS, ...ZWROTY_LISTA];
export const POD_ID = new Map(WSZYSTKIE.map(x => [x.id, x]));
export const naPoziomie = (lista, p) => lista.filter(x => x.p === p);
export const tematy = (lista, p) => [...new Set(lista.filter(x => !p || x.p === p).map(x => x.t))];

// Słowo do wyświetlenia w wybranym wariancie (ES / LATAM / neutralny – ES z dopiskiem LATAM).
export const wWariancie = (w, wariant) => (wariant === 'latam' && w.latam ? w.latam.es : w.es);
// Wszystkie akceptowane hiszpańskie odpowiedzi
export const odpowiedziEs = w => {
  const z = [w.es];
  if (w.latam) z.push(...w.latam.es.split(' / '));
  return z;
};
