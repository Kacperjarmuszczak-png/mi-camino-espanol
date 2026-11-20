// Analiza polskiego tekstu słowo po słowie dla osób hiszpańskojęzycznych (czyste funkcje, bez DOM).
// Rozpoznaje: hasła ze słownika aplikacji, formy czasowników z odmiany (czas, osoba) i – w przybliżeniu –
// odmienione rzeczowniki / przymiotniki (polskie przypadki zmieniają końcówkę).
import { CZASOWNIKI_PL, CZASY_PL, OSOBY_PL, formyPl, ASPEKT } from './odmiana-pl.js';
import { czysc, bezZnakow } from './tekst.js';

const norm = s => czysc(s).replace(/[–—-]/g, ' ').trim();

// słowa funkcyjne z krótkim wyjaśnieniem po hiszpańsku
const FUNKCYJNE = {
  i: ['y', 'conjunción'], a: ['y, pero (contraste)', 'conjunción'], ale: ['pero', 'conjunción'], lub: ['o', 'conjunción'], albo: ['o', 'conjunción'],
  że: ['que', 'conjunción'], bo: ['porque', 'conjunción'], czy: ['¿…? (pregunta sí/no) / si', 'partícula interrogativa'], nie: ['no', 'negación: va delante del verbo'],
  się: ['se, me, te… (reflexivo)', 'pronombre reflexivo'], w: ['en', 'preposición + locativo (dónde)'], we: ['en', 'preposición (forma ante consonantes difíciles)'],
  na: ['en, sobre, a', 'preposición + locativo (dónde) o acusativo (adónde)'], do: ['a, hacia, hasta', 'preposición + genitivo'], z: ['con, de', 'preposición: con + instrumental, de (origen) + genitivo'],
  ze: ['con, de', 'preposición'], o: ['sobre, de (tema)', 'preposición + locativo'], od: ['desde, de', 'preposición + genitivo'], po: ['después de, por', 'preposición'],
  przy: ['junto a', 'preposición + locativo'], dla: ['para', 'preposición + genitivo'], bez: ['sin', 'preposición + genitivo'], u: ['en casa de', 'preposición + genitivo'],
  przez: ['por, a través de', 'preposición + acusativo'], za: ['detrás de, por', 'preposición'], pod: ['debajo de', 'preposición'], nad: ['encima de', 'preposición'],
  przed: ['delante de, antes de', 'preposición + instrumental'], ja: ['yo', 'pronombre'], ty: ['tú', 'pronombre'], on: ['él', 'pronombre'], ona: ['ella', 'pronombre'],
  ono: ['ello', 'pronombre'], my: ['nosotros', 'pronombre'], wy: ['vosotros', 'pronombre'], oni: ['ellos', 'pronombre'], one: ['ellas', 'pronombre'],
  mnie: ['me, a mí', 'pronombre (genitivo / dativo / acusativo)'], mi: ['me, a mí', 'pronombre (dativo)'], cię: ['te', 'pronombre (acusativo)'], ci: ['te, a ti', 'pronombre (dativo)'],
  go: ['lo, a él', 'pronombre (acusativo)'], jej: ['la, le, su (de ella)', 'pronombre'], mu: ['le, a él', 'pronombre (dativo)'], nas: ['nos', 'pronombre'], was: ['os', 'pronombre'],
  ich: ['los, su (de ellos)', 'pronombre'], im: ['les', 'pronombre (dativo)'], to: ['esto, eso, es', 'pronombre demostrativo'], ten: ['este', 'demostrativo (masc.)'],
  ta: ['esta', 'demostrativo (fem.)'], te: ['estos, estas', 'demostrativo (plural)'], tu: ['aquí', 'adverbio'], tam: ['allí', 'adverbio'], gdzie: ['dónde', 'interrogativo'],
  kiedy: ['cuándo', 'interrogativo'], jak: ['cómo', 'interrogativo'], co: ['qué', 'interrogativo'], kto: ['quién', 'interrogativo'], dlaczego: ['por qué', 'interrogativo'],
  ile: ['cuánto', 'interrogativo'], bardzo: ['muy, mucho', 'adverbio'], już: ['ya', 'adverbio'], jeszcze: ['todavía', 'adverbio'], też: ['también', 'adverbio'], tylko: ['solo', 'partícula'],
  proszę: ['por favor / aquí tiene', 'fórmula de cortesía (también: pido)'], dziękuję: ['gracias', 'fórmula de cortesía'], tak: ['sí, así', 'partícula'], jest: ['es, está, hay', 'verbo być (3.ª persona)'],
  są: ['son, están, hay', 'verbo być (3.ª plural)'], mój: ['mi', 'posesivo (masc.)'], moja: ['mi', 'posesivo (fem.)'], moje: ['mi, mis', 'posesivo (neutro / plural)'],
  twój: ['tu', 'posesivo (masc.)'], twoja: ['tu', 'posesivo (fem.)'], jego: ['su (de él), lo', 'posesivo / pronombre'], który: ['que, el cual', 'relativo (masc.)'], która: ['que, la cual', 'relativo (fem.)'],
};

// końcówki przypadków (od najdłuższych) do przybliżonego dopasowania odmienionych form
const KONCOWKI = ['ami', 'ach', 'owi', 'iem', 'ego', 'emu', 'ych', 'ich', 'ymi', 'imi', 'om', 'ów', 'em', 'ie', 'ą', 'ę', 'a', 'u', 'y', 'i', 'e', 'o'];

/**
 * @param {{es: string, pl: string, id: string, t?: string}[]} slowka – hasła (pole „es” po polsku, „pl” po hiszpańsku)
 */
export function utworzAnalizatorPl(slowka) {
  const slownik = new Map();   // forma podstawowa → hasło
  for (const w of slowka) {
    for (const k of w.es.replace(/\([^)]*\)/g, ' ').split(/[,/;]/).map(norm).filter(Boolean)) if (!slownik.has(k)) slownik.set(k, w);
  }
  const formy = new Map();     // forma czasownika → [{ v, czas, i }]
  for (const v of CZASOWNIKI_PL) {
    const f = formyPl(v);
    const ki = norm(v.rdzen);
    if (!formy.has(ki)) formy.set(ki, []);
    formy.get(ki).unshift({ v, czas: 'inf', i: 0 });
    for (const c of CZASY_PL) {
      (f[c.k] || []).forEach((x, i) => {
        if (!x) return;
        for (const war of x.split(' / ')) {
          const k = norm(war.replace(/ się$/, '').replace(/^(niech( nie)?|nie|będę|będziesz|będzie|będziemy|będziecie|będą) /, ''));
          if (!k || k.includes(' ')) continue;
          if (!formy.has(k)) formy.set(k, []);
          if (!formy.get(k).some(y => y.v === v && y.czas === c.k)) formy.get(k).push({ v, czas: c.k, i });
        }
      });
    }
  }
  const tematy = [...slownik.keys()].filter(k => !k.includes(' ') && k.length >= 4);

  function slowo(t) {
    const k = norm(t);
    if (FUNKCYJNE[k]) return { t, znany: true, typ: FUNKCYJNE[k][1], es: FUNKCYJNE[k][0] };
    const w = slownik.get(k);
    if (w) return { t, znany: true, typ: 'palabra', es: w.pl, haslo: w.es, id: w.id };
    const f = formy.get(k);
    if (f) {
      const g = f[0];
      return { t, znany: true, typ: `verbo (${ASPEKT[g.v.asp]})`, es: g.v.es, haslo: g.v.inf, id: 'pv:' + g.v.inf, czasownik: g.v.inf,
        opis: f.slice(0, 3).map(x => (x.czas === 'inf' ? 'infinitivo' : `${CZASY_PL.find(c => c.k === x.czas).n}, ${OSOBY_PL[x.i][1]}`)).join(' · ') };
    }
    // przybliżenie: odcięcie końcówki przypadka i szukanie hasła o tym samym temacie
    for (const kon of KONCOWKI) {
      if (!k.endsWith(kon) || k.length - kon.length < 3) continue;
      const rdzen = k.slice(0, -kon.length);
      const kand = tematy.find(h => h === rdzen || (h.startsWith(rdzen) && h.length - rdzen.length <= 2) || bezZnakow(h).startsWith(bezZnakow(rdzen)) && h.length - rdzen.length <= 2);
      if (kand) { const w2 = slownik.get(kand); return { t, znany: true, przyblizony: true, typ: 'forma declinada', es: w2.pl, haslo: w2.es, id: w2.id,
        opis: `Probablemente «${kand}» con otra terminación: en polaco los sustantivos y adjetivos cambian según el caso (7 casos).` }; }
    }
    return { t, znany: false, typ: 'desconocida', es: '' };
  }

  return function analizujPl(tekst) {
    const slowa = (tekst.match(/[\p{L}]+(?:-[\p{L}]+)*/gu) || []).map(slowo);
    return { slowa, nieznane: slowa.filter(s => !s.znany).length, doslownie: slowa.map(s => (s.es ? s.es.split(/[,/]/)[0].trim() : `[${s.t}]`)).join(' ') };
  };
}
