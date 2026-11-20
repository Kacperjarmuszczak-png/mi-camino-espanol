// Analizator zdań hiszpańskich: słowo po słowie (forma podstawowa, znaczenie, część mowy, czas i osoba),
// wyrażenia wielowyrazowe i reguły „dlaczego tak się pisze” (akcenty, ¿¡, al/del, zgodność, ser/estar, gustar, tryb łączący…).
// Działa offline na danych aplikacji. Czyste funkcje – testy w tests/analiza.test.js.
import { SLOWKA, CZAS } from './dane/index.js';
import { formy, CZASY, OSOBY, regula } from './odmiana.js';
import { FUNKCYJNE, MALA_LITERA, PARY_AKCENTU } from './dane/funkcyjne.js';
import { bezZnakow, warianty } from './tekst.js';

const NAZWA_CZASU = Object.fromEntries(CZASY.map(c => [c.k, c.n]));
const RODZ = { m: 'rodzaj męski', f: 'rodzaj żeński', mpl: 'męski', fpl: 'żeński' };
const ROD_ART = {
  el: ['m', 'poj'], la: ['f', 'poj'], los: ['m', 'mn'], las: ['f', 'mn'], un: ['m', 'poj'], una: ['f', 'poj'], unos: ['m', 'mn'], unas: ['f', 'mn'],
  este: ['m', 'poj'], esta: ['f', 'poj'], estos: ['m', 'mn'], estas: ['f', 'mn'], ese: ['m', 'poj'], esa: ['f', 'poj'], esos: ['m', 'mn'], esas: ['f', 'mn'],
  aquel: ['m', 'poj'], aquella: ['f', 'poj'], aquellos: ['m', 'mn'], aquellas: ['f', 'mn'], mucho: ['m', 'poj'], mucha: ['f', 'poj'], muchos: ['m', 'mn'], muchas: ['f', 'mn'],
  otro: ['m', 'poj'], otra: ['f', 'poj'], otros: ['m', 'mn'], otras: ['f', 'mn'], nuestro: ['m', 'poj'], nuestra: ['f', 'poj'], nuestros: ['m', 'mn'], nuestras: ['f', 'mn'],
};
const POPRAWNY_ART = { 'm,poj': { el: 'el', un: 'un', este: 'este', ese: 'ese', aquel: 'aquel' }, 'f,poj': { el: 'la', un: 'una', este: 'esta', ese: 'esa', aquel: 'aquella' },
  'm,mn': { el: 'los', un: 'unos', este: 'estos', ese: 'esos', aquel: 'aquellos' }, 'f,mn': { el: 'las', un: 'unas', este: 'estas', ese: 'esas', aquel: 'aquellas' } };
const RODZINA_ART = { el: 'el', la: 'el', los: 'el', las: 'el', un: 'un', una: 'un', unos: 'un', unas: 'un', este: 'este', esta: 'este', estos: 'este', estas: 'este',
  ese: 'ese', esa: 'ese', esos: 'ese', esas: 'ese', aquel: 'aquel', aquella: 'aquel', aquellos: 'aquel', aquellas: 'aquel' };
const OKRESLNIKI = new Set([...Object.keys(ROD_ART), 'mi', 'tu', 'su', 'mis', 'tus', 'sus', 'cada', 'al', 'del', 'de', 'en', 'para', 'por', 'con', 'sin', 'sobre', 'a']);
const PODMIOT = { yo: 0, 'tú': 1, 'él': 2, ella: 2, usted: 2, nosotros: 3, nosotras: 3, vosotros: 4, vosotras: 4, ellos: 5, ellas: 5, ustedes: 5 };
const ZAIMKI_ZWROTNE = new Set(['me', 'te', 'se', 'nos', 'os']);
const HABER = { he: 0, has: 1, ha: 2, hemos: 3, 'habéis': 4, han: 5 };
const JAK_GUSTAR = /^(gusta|gustan|encanta|encantan|interesa|interesan|duele|duelen|apetece|apetecen|molesta|molestan|importa|importan|parece|parecen|queda|quedan|falta|faltan)$/;
const FEM_EL = new Set(['agua', 'águila', 'hambre', 'aula', 'arma', 'alma', 'área', 'hacha', 'ala']);
const OSOBA_NAZWA = ['yo', 'tú', 'él/ella/usted', 'nosotros', 'vosotros', 'ellos/ustedes'];
const WYZWALACZE_SUBJ = [
  ['ojalá', 'Po „ojalá” (oby) zawsze tryb łączący.'], ['para que', '„Para que” (żeby) zawsze z trybem łączącym.'],
  ['antes de que', '„Antes de que” (zanim) zawsze z trybem łączącym.'], ['quiero que', 'Chcieć, żeby ktoś inny coś zrobił: querer que + tryb łączący.'],
  ['quieres que', 'querer que + tryb łączący.'], ['quiere que', 'querer que + tryb łączący.'], ['queremos que', 'querer que + tryb łączący.'],
  ['espero que', 'Nadzieja (esperar que) + tryb łączący.'], ['es importante que', 'Ocena (es importante / necesario que) + tryb łączący.'],
  ['es necesario que', 'Ocena + tryb łączący.'], ['no creo que', 'Przeczona opinia (no creo que) + tryb łączący.'], ['me alegro de que', 'Emocja + tryb łączący.'],
];

let IDX = null;
function dodaj(m, k, v) { k = k.toLowerCase(); if (!m.has(k)) m.set(k, []); m.get(k).push(v); }
export function indeks() {
  if (IDX) return IDX;
  const slowa = new Map(), frazy = new Map(), czas = new Map(), bezAkc = new Map(), plIdx = new Map();
  const fun = new Map(FUNKCYJNE.map(f => [f[0], { typ: f[1], pl: f[2], opis: f[3], uwaga: f[4] }]));
  for (const w of SLOWKA) {
    const m = w.es.match(/^(el|la|los|las) (.+)$/);
    if (m && !m[2].includes(' ')) {
      dodaj(slowa, m[2], { w, typ: 'rzeczownik', rodzaj: (w.rodzaj || '').replace('pl', ''), liczba: /pl$/.test(w.rodzaj || '') ? 'mn' : 'poj' });
      const mm = w.mnoga && w.mnoga.match(/^(los|las) ([^ ]+)$/);
      if (mm) dodaj(slowa, mm[2], { w, typ: 'rzeczownik', rodzaj: (w.rodzaj || '').replace('pl', ''), liczba: 'mn' });
    } else if (m) {
      frazy.set(w.es.toLowerCase(), { w, typ: 'wyrażenie rzeczownikowe' });
      if (!/^(me|te|se|le|nos|os|lo|les) /.test(m[2])) frazy.set(m[2].toLowerCase(), { w, typ: 'wyrażenie rzeczownikowe' });
    } else {
      const e = w.es.toLowerCase().replace(/[¿?¡!.]/g, '').trim();
      if (!e) continue;
      if (!e.includes(' ') && !e.includes('/')) {
        dodaj(slowa, e, { w, typ: '', liczba: 'poj' });
        if (/[^aeiou]o$/.test(e)) {
          const r = e.slice(0, -1);
          dodaj(slowa, r + 'a', { w, typ: 'przymiotnik', rodzaj: 'f', liczba: 'poj', odm: true });
          dodaj(slowa, r + 'os', { w, typ: 'przymiotnik', rodzaj: 'm', liczba: 'mn', odm: true });
          dodaj(slowa, r + 'as', { w, typ: 'przymiotnik', rodzaj: 'f', liczba: 'mn', odm: true });
        } else if (/e$/.test(e)) dodaj(slowa, e + 's', { w, typ: 'przymiotnik', liczba: 'mn', odm: true });
        else if (/[lr]$/.test(e)) dodaj(slowa, e + 'es', { w, typ: 'przymiotnik', liczba: 'mn', odm: true });
      } else if (!e.includes('/')) frazy.set(e, { w, typ: 'wyrażenie' });
    }
  }
  for (const v of CZAS) {
    const zw = /se$/.test(v.inf) && v.inf !== 'ser';
    const rdzen = zw ? v.inf.slice(0, -2) : v.inf;
    dodaj(czas, v.inf, { v, czas: 'bezokolicznik' });
    if (zw) dodaj(czas, rdzen, { v, czas: 'bezokolicznik' });
    const f = formy(v);
    for (const c of CZASY) {
      if (c.k === 'perfecto' || c.k === 'imperativoNeg' || !f[c.k]) continue;
      f[c.k].forEach((x, i) => { if (x) dodaj(czas, x.replace(/^(me|te|se|nos|os) /, ''), { v, czas: c.k, os: i }); });
    }
    dodaj(czas, f.part, { v, czas: 'participio' });
    const ger = f.ger.replace(/se$/, '').replace('ándo', 'ando').replace('éndo', 'endo');
    dodaj(czas, ger, { v, czas: 'gerundio' });
    if (zw) dodaj(czas, f.ger, { v, czas: 'gerundio' });
  }
  for (const [k] of [...slowa, ...czas, ...fun]) { const b = bezZnakow(k); if (b !== k) dodaj(bezAkc, b, k); }
  for (const x of [...SLOWKA, ...CZAS]) for (const p of warianty(x.pl)) for (const s of p.split(' ')) if (s.length > 2) dodaj(plIdx, s, x);
  IDX = { slowa, frazy, czas, fun, bezAkc, plIdx };
  return IDX;
}

// --- tokenizacja ---
const RE_TOKEN = /[\p{L}\p{M}]+|\d+(?:[.,]\d+)?|[¿?¡!.,;:…"«»()\-–]/gu;
export function tokenizuj(tekst) {
  return [...String(tekst).matchAll(RE_TOKEN)].map(m => ({ t: m[0], n: m[0].toLowerCase(), slowo: /[\p{L}\d]/u.test(m[0]), poz: m.index }));
}
export function podzielNaZdania(tekst) {
  const z = String(tekst).replace(/\s+/g, ' ').trim().match(/[^.!?…]+(?:[.!?…]+|$)/g) || [];
  return z.map(s => s.trim()).filter(Boolean);
}

const czescMowy = t => /Liczby/.test(t || '') ? 'liczebnik' : /Przysłówki|Czas|łączniki|Położenie/.test(t || '') ? 'przysłówek / wyrażenie'
  : /Przymiotniki|Kolory|Uczucia|Charakter|Przeciwieństwa|opisy/.test(t || '') ? 'przymiotnik' : /Kraje/.test(t || '') ? 'nazwa / przymiotnik' : 'słowo';
const pierwszyPl = pl => (warianty(pl)[0] || pl).replace(/\s*\/.*$/, '');
const jestBezok = k => k.some(x => x.czas === 'bezokolicznik');
const opisCzasownika = x => x.czas === 'bezokolicznik' ? 'bezokolicznik' : x.czas === 'participio' ? 'imiesłów (participio)' : x.czas === 'gerundio' ? 'gerundio (forma -ando/-iendo)'
  : `${NAZWA_CZASU[x.czas]}, ${x.czas.startsWith('imperativo') ? ['', 'tú', 'usted', 'nosotros', 'vosotros', 'ustedes'][x.os] : OSOBA_NAZWA[x.os]}`;

// --- analiza jednego zdania ---
function analizujZdanie(zdanie) {
  const I = indeks();
  const tok = tokenizuj(zdanie);
  const slowa = tok.filter(t => t.slowo);
  const uwagi = [];
  const uwaga = (tytul, tekst, idx = [], typ = 'info') => { if (!uwagi.some(u => u.tytul === tytul && u.tekst === tekst)) uwagi.push({ tytul, tekst, idx, typ }); };

  // 1) wyrażenia wielowyrazowe (najdłuższe dopasowanie)
  const wynik = [];
  for (let i = 0; i < slowa.length; i++) {
    let dop = null;
    for (let n = Math.min(6, slowa.length - i); n >= 2 && !dop; n--) {
      const k = slowa.slice(i, i + n).map(t => t.n).join(' ');
      if (I.frazy.has(k)) dop = { n, f: I.frazy.get(k) };
    }
    if (dop) {
      const t = slowa.slice(i, i + dop.n);
      wynik.push({ t: t.map(x => x.t).join(' '), n: t.map(x => x.n).join(' '), typ: dop.f.typ, lemat: dop.f.w.es, pl: dop.f.w.pl, id: dop.f.w.id, opis: '', znany: true, fraza: true, kand: { czas: [] } });
      i += dop.n - 1;
      continue;
    }
    const t = slowa[i], po = tok[tok.indexOf(t) + 1];
    wynik.push({ t: t.t, n: t.n, nastPunkt: !po || !po.slowo, kand: { fun: I.fun.get(t.n), slowa: I.slowa.get(t.n) || [], czas: I.czas.get(t.n) || [] } });
  }

  // 2) wybór znaczenia z kontekstu
  wynik.forEach((w, i) => {
    if (w.fraza) return;
    const { fun, slowa: sl, czas: cz } = w.kand;
    const prev = wynik[i - 1], prevN = prev ? prev.n : '';
    const poOkreslniku = OKRESLNIKI.has(prevN) && !(prevN === 'a' && cz.length);
    const rzecz = sl.find(s => s.typ === 'rzeczownik');
    const poPodmiocie = prevN in PODMIOT || prevN === 'no' || ZAIMKI_ZWROTNE.has(prevN) || (/^(lo|la|los|las|le|les)$/.test(prevN) && cz.length && !rzecz);
    const poSerEstar = prev && prev.czasownik && ['ser', 'estar'].includes(prev.czasownik.v.inf) && sl.some(x => x.typ !== 'rzeczownik');
    if (fun && !(cz.length && (poPodmiocie && !(prevN in PODMIOT && /^(que|como)$/.test(w.n))))) {
      Object.assign(w, { typ: fun.typ, lemat: w.n, pl: fun.pl, opis: fun.opis, uwagaFun: fun.uwaga, znany: true });
      if (w.n === 'la' || w.n === 'los' || w.n === 'las' || w.n === 'lo') {
        const nast = wynik[i + 1];
        if (nast && nast.kand && nast.kand.czas.length && !nast.kand.slowa.some(s => s.typ === 'rzeczownik')) { w.typ = 'zaimek (dopełnienie)'; w.pl = { la: 'ją', los: 'ich', las: 'je', lo: 'go / to' }[w.n]; }
      }
    } else if (cz.length && !poSerEstar && (!rzecz || poPodmiocie || !poOkreslniku)) {
      const nastN = wynik[i + 1] ? wynik[i + 1].n : '';
      let x = cz.find(c => c.czas !== 'bezokolicznik' && ZAIMKI_ZWROTNE.has(prevN) && /se$/.test(c.v.inf))
        || (cz.some(c => c.v.inf === 'ir') && cz.some(c => c.v.inf === 'ser') ? cz.find(c => c.v.inf === (/^(a|al|hacia|para|de)$/.test(nastN) ? 'ir' : 'ser')) : null)
        || cz.find(c => !/se$/.test(c.v.inf) || c.v.inf === 'ser') || cz[0];
      // gustar, encantar, doler…: z zaimkiem celownika czasownik jest w 3. osobie (me gusta = podoba mi się)
      if (/^(gustar|encantar|interesar|doler|apetecer|molestar|importar|parecer|quedar|faltar)$/.test(x.v.inf) && /^(me|te|le|nos|os|les)$/.test(prevN)) {
        const trzecia = cz.find(c => c.v === x.v && c.czas === x.czas && (c.os === 2 || c.os === 5));
        if (trzecia) x = trzecia;
      }
      Object.assign(w, { typ: 'czasownik', lemat: x.v.inf, pl: pierwszyPl(x.v.pl), opis: opisCzasownika(x), czasownik: x, id: x.v.id, znany: true });
      w.alternatywy = [...new Map(cz.filter(c => c !== x).map(c => [c.v.inf + c.czas + c.os, c])).values()].slice(0, 3);
    } else if (sl.length) {
      const s = rzecz && (poOkreslniku || !sl.some(x => x.typ !== 'rzeczownik')) ? rzecz : (sl.find(x => x.typ !== 'rzeczownik') || sl[0]);
      Object.assign(w, {
        typ: s.typ || (s.odm ? 'przymiotnik' : czescMowy(s.w.t)), lemat: s.w.es, pl: pierwszyPl(s.w.pl), plPelne: s.w.pl, id: s.w.id, znany: true, rzecz: s,
        opis: s.typ === 'rzeczownik' ? `${RODZ[s.rodzaj] || ''}, liczba ${s.liczba === 'mn' ? 'mnoga' : 'pojedyncza'}${s.liczba === 'mn' && s.w.mnoga ? '' : s.w.mnoga ? ` (l. mn. ${s.w.mnoga})` : ''}`
          : s.odm ? `forma ${s.rodzaj === 'f' ? 'żeńska' : s.rodzaj === 'm' ? 'męska' : ''}${s.liczba === 'mn' ? ', l. mnoga' : ''} od „${s.w.es}”` : '',
      });
    } else if (/^\d/.test(w.n)) Object.assign(w, { typ: 'liczba', lemat: w.t, pl: w.t, opis: '', znany: true });
    else {
      w.znany = false; w.typ = 'nieznane'; w.lemat = w.t; w.pl = '?';
      const b = I.bezAkc.get(bezZnakow(w.n)) || (bezZnakow(w.n) !== w.n ? null : null);
      const popr = b && b.find(k => k !== w.n);
      if (popr) { w.poprawka = popr; uwaga(`Pisownia: „${w.t}” → „${popr}”`, `W hiszpańskim akcent graficzny (tilde) zmienia znaczenie lub wskazuje akcentowaną sylabę. Poprawnie: ${popr}.`, [i], 'blad'); }
      else if (/^[A-ZÁÉÍÓÚÑ]/.test(w.t) && i > 0) { w.typ = 'nazwa własna'; w.pl = w.t; w.znany = true; }
    }
  });

  // 3) czas złożony: haber + imiesłów (pretérito perfecto)
  wynik.forEach((w, i) => {
    const n = wynik[i + 1];
    if (w.n in HABER && n && n.kand && n.kand.czas.some(c => c.czas === 'participio')) {
      const p = n.kand.czas.find(c => c.czas === 'participio');
      Object.assign(w, { typ: 'czasownik posiłkowy', lemat: 'haber', pl: '(posiłkowy)', opis: `haber, ${OSOBA_NAZWA[HABER[w.n]]}`, znany: true });
      Object.assign(n, { typ: 'czasownik', lemat: p.v.inf, pl: pierwszyPl(p.v.pl), opis: `Pretérito perfecto, ${OSOBA_NAZWA[HABER[w.n]]} (${w.t} ${n.t})`, czasownik: { v: p.v, czas: 'perfecto', os: HABER[w.n] }, id: p.v.id, znany: true });
      uwaga('Pretérito perfecto (haber + imiesłów)', `„${w.t} ${n.t}” = haber w odpowiedniej osobie + imiesłów na -ado / -ido. Mówi o czynności zakończonej w okresie, który jeszcze trwa (hoy, esta semana, nunca) albo o doświadczeniu. Imiesłów się nie odmienia.`, [i, i + 1]);
    }
  });

  // 4) reguły
  const t0 = tok[0], tEnd = tok[tok.length - 1];
  if (tEnd && tEnd.t === '?' && !tok.some(t => t.t === '¿')) uwaga('Brakuje „¿” na początku pytania', 'Po hiszpańsku pytanie ma znak zapytania na początku (odwrócony) i na końcu: ¿Dónde estás?', [0], 'blad');
  if (tEnd && tEnd.t === '!' && !tok.some(t => t.t === '¡')) uwaga('Brakuje „¡” na początku wykrzyknienia', 'Wykrzyknienie ma znak na początku (odwrócony) i na końcu: ¡Qué bonito!', [0], 'blad');
  const pytanie = tEnd && tEnd.t === '?';
  void t0;

  wynik.forEach((w, i) => {
    const prev = wynik[i - 1], nast = wynik[i + 1], nast2 = wynik[i + 2];
    // ściągnięcia al / del
    if ((w.n === 'a' || w.n === 'de') && nast && nast.n === 'el') uwaga(`„${w.t} el” → „${w.n === 'a' ? 'al' : 'del'}”`, `Przyimek ${w.n} łączy się z rodzajnikiem el w jedno słowo: ${w.n} + el = ${w.n === 'a' ? 'al' : 'del'} (voy al cine, vengo del trabajo). Nie dotyczy zaimka „él”.`, [i, i + 1], 'blad');
    if (w.n === 'al' || w.n === 'del') uwaga(`„${w.t}” = ${w.n === 'al' ? 'a + el' : 'de + el'}`, `Ściągnięcie przyimka z rodzajnikiem el. Piszemy zawsze ${w.n}, nigdy „${w.n === 'al' ? 'a el' : 'de el'}”.`, [i]);
    // akcent wyróżniający
    const para = PARY_AKCENTU[w.n];
    if (para) {
      const nastCzas = nast && nast.typ === 'czasownik', nastRzecz = nast && nast.typ === 'rzeczownik';
      let blad = null;
      if (w.n === 'tu' && nastCzas) blad = 'tú';
      else if (w.n === 'tú' && nastRzecz) blad = 'tu';
      else if (w.n === 'el' && (w.nastPunkt || nastCzas || ['que', 'y', 'también'].includes(nast.n)) && !nastRzecz) blad = 'él';
      else if (w.n === 'él' && nastRzecz) blad = 'el';
      else if (w.n === 'si' && w.nastPunkt) blad = 'sí';
      else if (w.n === 'mi' && prev && ['para', 'a', 'de', 'por', 'sin', 'sobre'].includes(prev.n) && (!nast || nastCzas || !nast.znany)) blad = 'mí';
      else if (w.n === 'te' && prev && ['un', 'el', 'del', 'al'].includes(prev.n)) blad = 'té';
      else if (w.n === 'mas') blad = 'más';
      if (blad) uwaga(`„${w.t}” → „${blad}”?`, `Akcent wyróżniający: ${para[1]}. Tutaj pasuje „${blad}”.`, [i], 'blad');
      else if (/[áéíóú]/.test(w.n)) uwaga(`Dlaczego „${w.t}” ma akcent?`, `Akcent wyróżniający (tilde diacrítica): ${para[1]}.`, [i]);
    }
    const estaCzasownik = nast && (nast.typ === 'przymiotnik'
      || /^(el|la|los|las|un|una|mi|tu|su|en|aquí|allí|bien|mal|cerca|lejos|muy|listo|lista|cansado|cansada)$/.test(nast.n)
      || (nast.kand && nast.kand.czas.some(c => c.czas === 'participio' || c.czas === 'gerundio')));
    if (w.n === 'esta' && (w.nastPunkt || estaCzasownik))
      uwaga('„esta” → „está”?', '„Esta” = ta (zaimek), „está” = jest (czasownik estar). Przed przymiotnikiem, miejscem lub „bien/mal” potrzebny jest czasownik: está.', [i], 'blad');
    // pytajniki bez akcentu
    if (pytanie && /^(que|como|donde|cuando|quien|cual|cuanto|cuanta|cuantos|cuantas|adonde)$/.test(w.n) && (i === 0 || (prev && /^(por|de|a|en|con|para|hasta|desde)$/.test(prev.n) && i === 1)))
      uwaga(`„${w.t}” w pytaniu → z akcentem`, `Zaimki pytające mają akcent: ¿qué?, ¿cómo?, ¿dónde?, ¿cuándo?, ¿quién?, ¿cuál?, ¿cuánto?. Bez akcentu tylko w zdaniu twierdzącym (cuando llego…).`, [i], 'blad');
    // wielka litera
    if (i > 0 && /^[A-ZÁÉÍÓÚ]/.test(w.t) && MALA_LITERA.has(w.n)) uwaga(`„${w.t}” małą literą`, 'Dni tygodnia, miesiące, języki i narodowości piszemy po hiszpańsku małą literą (el lunes, en enero, hablo español).', [i], 'blad');
    // zgodność rodzajnik / określnik + rzeczownik
    if (ROD_ART[w.n] && nast && nast.rzecz && nast.rzecz.typ === 'rzeczownik' && nast.rzecz.rodzaj) {
      const [r, l] = ROD_ART[w.n], s = nast.rzecz;
      const femEl = w.n === 'el' && s.rodzaj === 'f' && FEM_EL.has(nast.n);
      if (femEl) uwaga(`„el ${nast.t}” – dlaczego „el”?`, `„${nast.t}” jest rodzaju żeńskiego, ale zaczyna się od akcentowanego a-/ha-, więc w l. poj. bierze rodzajnik „el” (el agua fría, las aguas). Przymiotnik zostaje żeński.`, [i, i + 1]);
      else if ((r !== s.rodzaj || l !== s.liczba) && RODZINA_ART[w.n]) {
        const popr = POPRAWNY_ART[`${s.rodzaj},${s.liczba}`][RODZINA_ART[w.n]];
        uwaga(`„${w.t} ${nast.t}” → „${popr} ${nast.t}”`, `„${nast.t}” to ${RODZ[s.rodzaj]}, liczba ${s.liczba === 'mn' ? 'mnoga' : 'pojedyncza'}, więc określnik też musi się zgadzać: ${popr}.`, [i, i + 1], 'blad');
      } else if (i < 6 && RODZINA_ART[w.n] && !uwagi.some(u => u.tytul.startsWith('Zgodność'))) uwaga('Zgodność rodzaju i liczby', `„${w.t} ${nast.t}”: rodzajnik / zaimek zgadza się z rzeczownikiem (${RODZ[s.rodzaj]}, l. ${s.liczba === 'mn' ? 'mnoga' : 'poj.'}). Przymiotniki też się dopasowują (casa blanca, coches rojos).`, [i, i + 1]);
    }
    // zgodność rzeczownik + przymiotnik
    if (w.rzecz && w.rzecz.typ === 'rzeczownik' && nast && nast.rzecz && nast.typ === 'przymiotnik' && nast.rzecz.rodzaj && w.rzecz.rodzaj) {
      const s = w.rzecz, a = nast.rzecz;
      if (a.rodzaj !== s.rodzaj || (a.liczba !== s.liczba)) {
        const baza = a.w.es.replace(/o$/, '');
        const popr = baza + (s.rodzaj === 'f' ? 'a' : 'o') + (s.liczba === 'mn' ? 's' : '');
        uwaga(`„${w.t} ${nast.t}” → „${w.t} ${popr}”`, `Przymiotnik dopasowuje się do rzeczownika: „${w.t}” to ${RODZ[s.rodzaj]}, l. ${s.liczba === 'mn' ? 'mnoga' : 'poj.'}. Przymiotnik zwykle stoi po rzeczowniku.`, [i, i + 1], 'blad');
      }
    } else if (w.rzecz && w.rzecz.typ === 'rzeczownik' && nast && nast.n.match(/[^aeiou]o$/) && nast.rzecz && !nast.rzecz.typ && w.rzecz.rodzaj === 'f' && w.rzecz.liczba === 'poj' && !/^(muy|poco|algo|mucho|todo|como|pero|no|lo|tampoco)$/.test(nast.n))
      uwaga(`„${w.t} ${nast.t}” → „${w.t} ${nast.n.slice(0, -1)}a”?`, `„${w.t}” jest rodzaju żeńskiego, więc przymiotnik kończy się na -a.`, [i, i + 1], 'blad');
    // podmiot + czasownik
    if (w.n in PODMIOT) {
      let j = i + 1; while (wynik[j] && (wynik[j].n === 'no' || ZAIMKI_ZWROTNE.has(wynik[j].n) || /^(lo|la|los|las|le|les|también|tampoco|ya|siempre|nunca)$/.test(wynik[j].n))) j++;
      const v = wynik[j];
      if (v && v.typ === 'czasownik' && v.czasownik && typeof v.czasownik.os === 'number' && !v.czasownik.czas.startsWith('imperativo')) {
        const oczek = PODMIOT[w.n];
        const pasuje = v.kand && v.kand.czas.some(c => c.os === oczek && c.czas === v.czasownik.czas) || v.czasownik.os === oczek;
        if (!pasuje) {
          const f = formy(v.czasownik.v)[v.czasownik.czas];
          const popr = f && f[oczek] ? f[oczek].replace(/^(me|te|se|nos|os) /, '') : null;
          if (popr) uwaga(`„${w.t} ${v.t}” → „${w.t} ${popr}”`, `Czasownik zgadza się z podmiotem. Dla „${w.t}” (${OSOBY[oczek][1]}) forma ${NAZWA_CZASU[v.czasownik.czas]} od „${v.czasownik.v.inf}” to: ${popr}.`, [i, j], 'blad');
        }
      }
      if (i === 0 && wynik[j] && wynik[j].typ === 'czasownik' && /^(yo|tú|nosotros|vosotros)$/.test(w.n)) uwaga('Zaimek osobowy często się pomija', `Końcówka czasownika już pokazuje osobę („${wynik[j].t}” wystarczy). „${w.t}” dodaje się dla podkreślenia lub kontrastu.`, [i]);
    }
    // ser / estar
    if (w.czasownik && ['ser', 'estar'].includes(w.czasownik.v.inf) && !uwagi.some(u => u.tytul.startsWith('Ser czy estar'))) {
      uwaga(`Ser czy estar? Tu: ${w.czasownik.v.inf}`, w.czasownik.v.inf === 'ser'
        ? 'SER: kim/czym ktoś jest – tożsamość, zawód, pochodzenie, cechy stałe, godzina, cena, miejsce wydarzenia (soy polaco, es médico, la fiesta es en mi casa).'
        : 'ESTAR: gdzie coś jest i w jakim jest stanie – położenie, samopoczucie, stany chwilowe, estar + gerundio (estoy cansado, está en Madrid, estamos comiendo).', [i]);
    }
    // gustar i podobne
    if (JAK_GUSTAR.test(w.n)) {
      const zaimek = prev && /^(me|te|le|nos|os|les)$/.test(prev.n);
      uwaga(`Konstrukcja jak „gustar”: ${w.t}`, `Dosłownie „coś mi się podoba”: osoba stoi w celowniku (me, te, le, nos, os, les), a czasownik zgadza się z tym, CO się podoba: me gusta el café, me gustan los perros, me gusta bailar.${zaimek ? '' : ' Brakuje zaimka (me, te, le…).'}`, [i], zaimek ? 'info' : 'blad');
      if (prev && prev.n === 'yo') uwaga(`„yo ${w.t}” → „(a mí) me ${w.t}”`, 'Z gustar nie używamy „yo” jako podmiotu. Mówimy: me gusta (a mí me gusta – dla podkreślenia).', [i - 1, i], 'blad');
      const po = nast && nast.n === 'la' || nast && nast.n === 'el' ? nast2 : nast;
      const mnoga = (nast && /^(los|las|mis|tus|sus)$/.test(nast.n)) || (po && po.rzecz && po.rzecz.liczba === 'mn');
      if (/[^n]$/.test(w.n) && mnoga) uwaga(`„${w.t}” → „${w.n}n”`, 'To, co się podoba, jest w liczbie mnogiej, więc czasownik też: me gustan los perros.', [i], 'blad');
      if (/n$/.test(w.n) && nast && (nast.typ === 'czasownik' && nast.czasownik && nast.czasownik.czas === 'bezokolicznik' || /^(el|la)$/.test(nast.n))) uwaga(`„${w.t}” → „${w.n.slice(0, -1)}”`, 'Przed bezokolicznikiem i rzeczownikiem w l. poj. czasownik stoi w l. poj.: me gusta bailar, me gusta la música.', [i], 'blad');
    }
    // peryfrazy
    const lem = w.czasownik && w.czasownik.v.inf;
    const bezok = x => x && x.kand && x.kand.czas.length && jestBezok(x.kand.czas);
    if (lem === 'tener' && nast && nast.n === 'que' && bezok(nast2)) uwaga('tener que + bezokolicznik = musieć', `„${w.t} que ${nast2.t}” = muszę / musisz… ${nast2.pl ? '(' + nast2.pl + ')' : ''}. Obowiązek konkretnej osoby. Bezosobowo: hay que + bezokolicznik (trzeba).`, [i, i + 1, i + 2]);
    if (w.n === 'hay' && nast && nast.n === 'que' && bezok(nast2)) uwaga('hay que + bezokolicznik = trzeba', 'Bezosobowy obowiązek: hay que reservar (trzeba zarezerwować).', [i, i + 1, i + 2]);
    if (lem === 'ir' && nast && nast.n === 'a' && bezok(nast2)) uwaga('ir a + bezokolicznik = czas przyszły (plany)', `„${w.t} a ${nast2.t}” = zamierzam / zaraz… Najczęstszy sposób mówienia o planach (voy a viajar = będę podróżować).`, [i, i + 1, i + 2]);
    if (lem === 'acabar' && nast && nast.n === 'de' && bezok(nast2)) uwaga('acabar de + bezokolicznik = właśnie (coś zrobić)', 'Czynność przed chwilą zakończona: acabo de llegar = właśnie przyjechałem.', [i, i + 1, i + 2]);
    if (lem === 'volver' && nast && nast.n === 'a' && bezok(nast2)) uwaga('volver a + bezokolicznik = zrobić znowu', 'Powtórzenie czynności: vuelvo a llamar = dzwonię jeszcze raz.', [i, i + 1, i + 2]);
    if (lem === 'dejar' && nast && nast.n === 'de' && bezok(nast2)) uwaga('dejar de + bezokolicznik = przestać', 'Zakończenie nawyku: dejé de fumar = rzuciłem palenie.', [i, i + 1, i + 2]);
    if (lem === 'estar' && nast && nast.kand && nast.kand.czas.some(c => c.czas === 'gerundio')) uwaga('estar + gerundio = czynność w trakcie', `„${w.t} ${nast.t}” = właśnie teraz (estoy comiendo = właśnie jem). Gerundio kończy się na -ando / -iendo.`, [i, i + 1]);
    if (['poder', 'querer', 'deber', 'saber', 'necesitar', 'soler', 'preferir', 'pensar', 'esperar', 'intentar'].includes(lem) && bezok(nast) && w.czasownik.czas !== 'bezokolicznik')
      uwaga(`${lem} + bezokolicznik`, `Po czasowniku modalnym drugi czasownik stoi w bezokoliczniku: ${w.t} ${nast.t}.`, [i, i + 1]);
    // przeczenie
    if (w.n === 'no' && wynik.slice(i + 2).some(x => /^(nada|nadie|nunca|ningún|ninguno|ninguna|tampoco|jamás)$/.test(x.n))) uwaga('Podwójne przeczenie jest poprawne', '„No” przed czasownikiem + nada / nadie / nunca po nim: no veo nada (dosłownie „nie widzę nic”). Tak jak po polsku.', [i]);
    // zaimek zwrotny + czasownik zwrotny
    if (ZAIMKI_ZWROTNE.has(w.n) && nast && nast.czasownik && /se$/.test(nast.czasownik.v.inf)) uwaga(`Czasownik zwrotny: ${nast.czasownik.v.inf}`, `Zaimek zwrotny (me, te, se, nos, os, se) stoi przed odmienionym czasownikiem: ${w.t} ${nast.t}. W bezokoliczniku i trybie rozkazującym dołączamy go na końcu (levantarse, levántate).`, [i, i + 1]);
    // a osobowe
    if (w.n === 'a' && prev && prev.typ === 'czasownik' && nast && ((/^[A-ZÁÉÍÓÚ]/.test(nast.t)) || (/^(mi|tu|su|mis|tus|sus)$/.test(nast.n) && nast2 && nast2.rzecz && /(madre|padre|amig|herman|hij|abuel|novi|jefe|profesor|vecin|famili|compañer|primo|prima|tío|tía|mujer|marido)/.test(nast2.n))))
      uwaga('„a” osobowe', 'Gdy dopełnieniem jest konkretna osoba (lub zwierzę domowe), stawiamy przed nią „a”: veo a María, llamo a mi madre. Po polsku tego nie tłumaczymy.', [i]);
  });

  // tryb łączący po wyrażeniach
  const tekstN = wynik.map(w => w.n).join(' ');
  for (const [wyr, opis] of WYZWALACZE_SUBJ) {
    const p = (' ' + tekstN + ' ').indexOf(' ' + wyr + ' ');
    if (p < 0) continue;
    const start = (' ' + tekstN + ' ').slice(0, p).split(' ').filter(Boolean).length + wyr.split(' ').length;
    const v = wynik.slice(start).find(x => x.typ === 'czasownik' && x.czasownik);
    if (!v) continue;
    const idx = wynik.indexOf(v);
    const subj = v.kand && v.kand.czas.find(c => c.czas === 'subjuntivo');
    if (subj) { v.opis = opisCzasownika(subj); v.czasownik = subj; uwaga(`Tryb łączący po „${wyr}”`, `${opis} Forma „${v.t}” = presente de subjuntivo od „${subj.v.inf}” (temat z „yo” + odwrotna końcówka: -ar → -e, -er/-ir → -a).`, [idx]); }
    else if (v.czasownik.czas === 'presente') {
      const f = formy(v.czasownik.v).subjuntivo, popr = f && f[v.czasownik.os] && f[v.czasownik.os].replace(/^(me|te|se|nos|os) /, '');
      if (popr) uwaga(`„${v.t}” → „${popr}” (tryb łączący)`, `${opis} Zamiast trybu oznajmującego potrzebny jest subjuntivo: ${popr}.`, [idx], 'blad');
    }
  }

  // tłumaczenie dosłowne (słowo po słowie)
  const doslownie = wynik.map((w, i) => {
    const prev = wynik[i - 1], nast = wynik[i + 1];
    if (w.n === 'que' && prev && prev.czasownik && prev.czasownik.v.inf === 'tener') return '';
    if (w.n === 'a' && ((nast && nast.czasownik && nast.czasownik.czas === 'bezokolicznik') || (nast && /^[A-ZÁÉÍÓÚ]/.test(nast.t)) || (nast && /^(mi|tu|su)$/.test(nast.n) && prev && prev.typ === 'czasownik'))) return '';
    if (w.czasownik && w.czasownik.v.inf === 'tener' && nast && nast.n === 'que') return `musieć (${OSOBA_NAZWA[w.czasownik.os] || ''})`;
    if (!w.znany) return w.t;
    if (/^(el|la|los|las|lo)$/.test(w.n) && w.typ === 'rodzajnik') return '';
    if (w.typ === 'czasownik posiłkowy') return '';
    const pl = String(w.pl || '').replace(/\([^)]*\)/g, '').replace(/^\s*–\s*/, '').split(/[,/]/)[0].trim();
    return w.czasownik && w.czasownik.czas !== 'bezokolicznik' && typeof w.czasownik.os === 'number' ? `${pl} (${OSOBA_NAZWA[w.czasownik.os]})` : pl;
  }).filter(Boolean).join(' ');

  // szczegóły czasowników: reguła tworzenia formy
  for (const w of wynik) if (w.czasownik && w.czasownik.czas && !['bezokolicznik', 'participio', 'gerundio'].includes(w.czasownik.czas)) w.regula = regula(w.czasownik.v, w.czasownik.czas);

  return { tekst: zdanie, slowa: wynik.map(({ kand, rzecz, ...r }) => r), uwagi, doslownie };
}

export function analizuj(tekst) {
  const zdania = podzielNaZdania(tekst).map(analizujZdanie);
  const nieznane = zdania.flatMap(z => z.slowa.filter(w => !w.znany).map(w => w.t));
  return { zdania, nieznane, bledy: zdania.reduce((a, z) => a + z.uwagi.filter(u => u.typ === 'blad').length, 0) };
}

// Polski → hiszpański bez internetu: propozycje ze słownika dla każdego słowa.
export function slownikPl(tekst) {
  const I = indeks();
  return tokenizuj(tekst).filter(t => t.slowo).map(t => {
    const n = t.n;
    let traf = I.plIdx.get(n) || [];
    for (let k = 1; !traf.length && k <= 3 && n.length - k >= 3; k++) {
      const rdzen = n.slice(0, -k);
      for (const [klucz, lista] of I.plIdx) if (klucz.startsWith(rdzen) && klucz.length - rdzen.length <= 3) { traf = traf.concat(lista); if (traf.length > 6) break; }
    }
    const uniq = [...new Map(traf.map(x => [x.id, x])).values()].slice(0, 4);
    return { t: t.t, propozycje: uniq.map(x => ({ es: x.es || x.inf, pl: x.pl, id: x.id })) };
  });
}
