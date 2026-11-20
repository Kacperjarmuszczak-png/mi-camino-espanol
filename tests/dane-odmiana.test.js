import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CZASOWNIKI, formy, czesciFormy, akcentPrzedZaimkiem, grupa } from '../js/odmiana.js';
import { SLOWKA, CZAS, ZWROTY_LISTA, POD_ID, liczbaMnoga, POZIOMY } from '../js/dane/index.js';
import { utworzEgzamin, szacujPoziom } from '../js/egzamin.js';
import { GRAMATYKA } from '../js/dane/gramatyka.js';

const v = inf => CZASOWNIKI.find(x => x.inf === inf);

test('odmiana: wybrane formy nieregularne i ze zmianą tematu', () => {
  assert.deepEqual(formy(v('ser')).presente, ['soy', 'eres', 'es', 'somos', 'sois', 'son']);
  assert.equal(formy(v('tener')).indefinido[2], 'tuvo');
  assert.equal(formy(v('pedir')).indefinido[5], 'pidieron');
  assert.equal(formy(v('dormir')).subjuntivo[3], 'durmamos');
  assert.equal(formy(v('conocer')).presente[0], 'conozco');
  assert.equal(formy(v('huir')).indefinido[0], 'hui');
  assert.equal(formy(v('reír')).indefinido[2], 'rio');
  assert.equal(formy(v('sonreír')).indefinido[2], 'sonrió');
});

test('tryb rozkazujący, także z zaimkiem', () => {
  assert.deepEqual(formy(v('hacer')).imperativo, [null, 'haz', 'haga', 'hagamos', 'haced', 'hagan']);
  assert.deepEqual(formy(v('levantarse')).imperativo, [null, 'levántate', 'levántese', 'levantémonos', 'levantaos', 'levántense']);
  assert.deepEqual(formy(v('irse')).imperativo, [null, 'vete', 'váyase', 'vámonos', 'idos', 'váyanse']);
  assert.equal(formy(v('vestirse')).imperativo[4], 'vestíos');
  assert.equal(formy(v('obtener')).imperativo[1], 'obtén');
  assert.equal(formy(v('hablar')).imperativoNeg[1], 'no hables');
  assert.equal(formy(v('haber')).imperativo, undefined);
  assert.equal(akcentPrzedZaimkiem('pon'), 'pon');
  assert.equal(akcentPrzedZaimkiem('sienta'), 'siénta');
});

test('podział formy: temat, zmiana, końcówka', () => {
  const s = (inf, c, i) => czesciFormy(v(inf), c, i, formy(v(inf))[c][i]).map(p => `${p.k}:${p.t}`).join(' ');
  assert.equal(s('hablar', 'presente', 1), 'temat:habl konc:as');
  assert.equal(s('dormir', 'presente', 5), 'temat:d zmiana:ue temat:rm konc:en');
  assert.equal(s('tener', 'presente', 0), 'temat:ten zmiana:g konc:o');
  assert.equal(s('levantarse', 'presente', 0), 'pre:me  temat:levant konc:o');
});

test('klasyfikacja czasowników do filtrów', () => {
  assert.equal(grupa(v('hablar')), 'reg-ar');
  assert.equal(grupa(v('vivir')), 'reg-ir');
  assert.equal(grupa(v('tener')), 'nieregularny');
  assert.equal(grupa(v('pensar')), 'e-ie');
  assert.equal(grupa(v('poder')), 'nieregularny');
  assert.equal(grupa(v('volver')), 'o-ue');
  assert.equal(grupa(v('pedir')), 'e-i');
});

test('dane: każdy element ma poziom, unikalne id i niepuste tłumaczenie', () => {
  const wszystkie = [...SLOWKA, ...CZAS, ...ZWROTY_LISTA];
  assert.equal(POD_ID.size, wszystkie.length);
  for (const x of wszystkie) {
    assert.ok(POZIOMY.includes(x.p), x.id);
    assert.ok(x.pl && x.pl.trim(), x.id);
  }
  for (const p of POZIOMY) assert.ok(SLOWKA.filter(w => w.p === p).length >= 50, p);
  assert.ok(SLOWKA.filter(w => w.przyklad).length >= 300);
  for (const z of ZWROTY_LISTA.filter(z => z.dialog.length)) assert.ok(z.dialog.some(l => l.tekst.includes('*')), z.es);
});

test('rodzaj i liczba mnoga rzeczowników', () => {
  assert.equal(POD_ID.get('w:el agua').rodzaj, 'f');
  assert.equal(POD_ID.get('w:la casa').rodzaj, 'f');
  assert.equal(liczbaMnoga('el lápiz'), 'los lápices');
  assert.equal(liczbaMnoga('la habitación'), 'las habitaciones');
  assert.equal(liczbaMnoga('el corazón'), 'los corazones');
  assert.equal(liczbaMnoga('el examen'), 'los exámenes');
  assert.equal(liczbaMnoga('el hotel'), 'los hoteles');
  assert.equal(liczbaMnoga('la puerta de embarque'), 'las puertas de embarque');
  assert.equal(liczbaMnoga('el vino tinto'), null);
});

test('bank gramatyki: luka i 4 różne odpowiedzi', () => {
  for (const g of GRAMATYKA) { assert.ok(g[2].includes('___'), g[2]); assert.equal(new Set(g[3]).size, 4, g[2]); }
});

test('egzamin: liczba pytań, poprawna odpowiedź wśród opcji, wyjaśnienie', () => {
  for (const p of POZIOMY) {
    const e = utworzEgzamin({ zakres: 'poziom', p, ile: 20 }, { bezVosotros: true });
    assert.equal(e.length, 20, p);
    for (const q of e) {
      assert.ok(q.opcje.includes(q.odp), `${p} ${q.typ}: ${q.tekst}`);
      assert.equal(new Set(q.opcje).size, q.opcje.length, `${p} ${q.typ}: powtórzona opcja`);
      assert.ok(q.wyj, `${p} ${q.typ}: brak wyjaśnienia`);
      if (q.typ === 'czasownik') assert.ok(!/^vosotros/.test(q.tytul.split('·').pop().trim()));
    }
  }
  const poz = utworzEgzamin({ zakres: 'poziomujacy' });
  assert.equal(poz.length, 24);
  assert.equal(szacujPoziom(poz, poz.map(q => q.odp)), 'C2');
  assert.equal(szacujPoziom(poz, poz.map(() => null)), 'poniżej A1');
});
