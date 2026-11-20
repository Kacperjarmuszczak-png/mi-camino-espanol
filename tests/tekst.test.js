import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sprawdz, warianty, levenshtein, bezAkcentow, bezZnakow, brakujaceAkcenty, pasuje, ocenaZWyniku } from '../js/tekst.js';

test('dokładna odpowiedź, wielkość liter i znaki interpunkcyjne bez znaczenia', () => {
  assert.equal(sprawdz('El Gato', ['el gato']).wynik, 'dobrze');
  assert.equal(sprawdz('¿Qué tal?', ['¿qué tal?']).wynik, 'dobrze');
  assert.equal(sprawdz('  que   tal ', ['¿Qué tal?']).wynik, 'akcent');
});

test('brak rodzajnika przy hiszpańskim rzeczowniku: zaliczone z uwagą', () => {
  assert.equal(sprawdz('gato', ['el gato']).wynik, 'rodzajnik');
});

test('brak akcentu lub tyldy: zaliczone z uwagą i wskazaniem miejsca', () => {
  const r = sprawdz('manana', ['mañana']);
  assert.equal(r.wynik, 'akcent');
  assert.deepEqual(r.akcenty, [2]);
  assert.equal(sprawdz('cafe', ['el café']).wynik, 'akcent');
  assert.equal(sprawdz('dziekuje', ['dziękuję']).wynik, 'akcent');
});

test('literówka w dłuższym słowie: zaliczone, w krótkim nie', () => {
  assert.equal(sprawdz('trabajr', ['trabajar']).wynik, 'literowka');
  assert.equal(sprawdz('sol', ['sal']).wynik, 'zle');
  assert.equal(sprawdz('ordenadro', ['el ordenador']).wynik, 'literowka');
});

test('polskie tłumaczenie z kilkoma znaczeniami i dopiskiem w nawiasie', () => {
  assert.deepEqual(warianty('chłopak, narzeczony (czyjś)'), ['chłopak', 'narzeczony', 'chłopak narzeczony czyjś']);
  assert.equal(sprawdz('narzeczony', ['chłopak, narzeczony']).wynik, 'dobrze');
  assert.equal(sprawdz('dobranoc', ['dobry wieczór / dobranoc']).wynik, 'dobrze');
  assert.equal(sprawdz('kot', ['pies']).wynik, 'zle');
  assert.equal(sprawdz('', ['pies']).wynik, 'zle');
});

test('kilka akceptowanych odpowiedzi (ES i LATAM)', () => {
  assert.equal(sprawdz('el carro', ['el coche', 'el carro']).wynik, 'dobrze');
});

test('pomocnicze: Levenshtein, akcenty, ñ, wyszukiwanie', () => {
  assert.equal(levenshtein('kitten', 'sitting'), 3);
  assert.equal(levenshtein('', 'abc'), 3);
  assert.equal(bezAkcentow('canción año'), 'cancion año');
  assert.equal(bezZnakow('año łódź'), 'ano lodz');
  assert.deepEqual(brakujaceAkcenty('cancion', 'canción'), [5]);
  assert.ok(pasuje('manana', 'mañana', 'jutro'));
  assert.ok(pasuje('JUTRO', 'mañana', 'jutro'));
  assert.ok(!pasuje('kot', 'el perro', 'pies'));
  assert.ok(pasuje('', 'cokolwiek'));
  assert.deepEqual(['dobrze', 'akcent', 'zle'].map(ocenaZWyniku), [3, 2, 1]);
});

import { ocenWymowe, podobienstwo } from '../js/tekst.js';
test('ocena wymowy: rozpoznana mowa vs wzorzec', () => {
  assert.equal(ocenWymowe(['La casa'], ['la casa']).wynik, 'dobrze');
  assert.equal(ocenWymowe(['casa'], ['la casa']).wynik, 'dobrze');          // bez rodzajnika
  assert.equal(ocenWymowe(['cancion'], ['la canción']).wynik, 'dobrze');     // bez akcentu
  assert.equal(ocenWymowe(['casita'], ['la casa']).wynik, 'prawie');
  assert.equal(ocenWymowe(['perro'], ['la casa']).wynik, 'zle');
  assert.equal(ocenWymowe(['hola buenos días'], ['buenos días']).wynik, 'dobrze');
  assert.equal(ocenWymowe(['xyz', 'gracias'], ['gracias']).wynik, 'dobrze');   // druga alternatywa
  assert.ok(podobienstwo('dziękuję', 'dziekuje') === 1);
});
