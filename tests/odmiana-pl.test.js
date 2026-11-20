import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CZASOWNIKI_PL, formyPl } from '../js/odmiana-pl.js';
import { utworzAnalizatorPl } from '../js/analiza-pl.js';

const v = inf => CZASOWNIKI_PL.find(x => x.inf === inf);

test('czas teraźniejszy z 1. i 2. osoby', () => {
  assert.deepEqual(formyPl(v('robić')).ter, ['robię', 'robisz', 'robi', 'robimy', 'robicie', 'robią']);
  assert.deepEqual(formyPl(v('czytać')).ter, ['czytam', 'czytasz', 'czyta', 'czytamy', 'czytacie', 'czytają']);
  assert.deepEqual(formyPl(v('jeść')).ter, ['jem', 'jesz', 'je', 'jemy', 'jecie', 'jedzą']);
  assert.deepEqual(formyPl(v('być')).ter, ['jestem', 'jesteś', 'jest', 'jesteśmy', 'jesteście', 'są']);
  assert.equal(formyPl(v('brać')).ter[5], 'biorą');
});

test('czas przeszły z rodzajem i nieregularne tematy', () => {
  assert.equal(formyPl(v('mieć')).prz[3], 'mieliśmy / miałyśmy');
  assert.equal(formyPl(v('iść')).prz[0], 'szedłem / szłam');
  assert.equal(formyPl(v('wziąć')).prz[2], 'wziął / wzięła / wzięło');
  assert.equal(formyPl(v('uczyć się')).prz[0], 'uczyłem się / uczyłam się');
});

test('aspekt: dokonane bez teraźniejszego, przyszły prosty', () => {
  assert.equal(formyPl(v('zrobić')).ter, null);
  assert.equal(formyPl(v('zrobić')).przysz[0], 'zrobię');
  assert.equal(formyPl(v('robić')).przysz[0], 'będę robić');
  assert.equal(formyPl(v('móc')).war[0], 'mógłbym / mogłabym');
  assert.deepEqual(formyPl(v('iść')).rozk.filter(Boolean), ['idź', 'niech idzie', 'idźmy', 'idźcie', 'niech idą']);
});

test('analizator rozpoznaje formy czasowników i hasła', () => {
  const a = utworzAnalizatorPl([{ es: 'kino', pl: 'el cine', id: 'p:kino' }, { es: 'zupa', pl: 'la sopa', id: 'p:zupa' }]);
  const w = a('Wczoraj byłam w kinie i jadłem zupę.').slowa;
  assert.equal(w.find(x => x.t === 'byłam').haslo, 'być');
  assert.equal(w.find(x => x.t === 'jadłem').haslo, 'jeść');
  assert.equal(w.find(x => x.t === 'kinie').haslo, 'kino');
  assert.equal(w.find(x => x.t === 'w').es, 'en');
});
