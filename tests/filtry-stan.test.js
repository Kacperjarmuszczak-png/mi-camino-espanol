import { test } from 'node:test';
import assert from 'node:assert/strict';
import { filtruj, sortuj } from '../js/filtry.js';
import { migruj, seria, dodajAktywnosc, dzien, eksportuj, importuj, nowyStanAplikacji, WERSJA } from '../js/stan.js';
import { ocen, DZIEN } from '../js/srs.js';

const T0 = Date.now();
const L = [
  { id: 'w:el gato', es: 'el gato', pl: 'kot' },
  { id: 'w:la casa', es: 'la casa', pl: 'dom' },
  { id: 'w:el agua', es: 'el agua', pl: 'woda' },
  { id: 'w:el coche', es: 'el coche', pl: 'samochód', latam: { es: 'el carro' } },
];
const stany = {
  'w:el gato': ocen(ocen(ocen(null, 3, T0 - 6 * DZIEN), 3, T0 - 5 * DZIEN), 3, T0 - 2 * DZIEN),     // opanowany (odstęp ≥ 7), jeszcze nie zaległy
  'w:la casa': ocen(null, 1, T0 - DZIEN),                                                        // pomylony, zaległy
};

test('filtry: wszystkie, nieumiane, do powtórki, opanowane, ulubione', () => {
  assert.equal(filtruj(L, { stany }).length, 4);
  assert.deepEqual(filtruj(L, { filtr: 'nieumiane', stany }).map(x => x.id), ['w:la casa', 'w:el agua', 'w:el coche']);
  assert.deepEqual(filtruj(L, { filtr: 'powtorka', stany, teraz: T0 }).map(x => x.id), ['w:la casa']);
  assert.deepEqual(filtruj(L, { filtr: 'opanowane', stany }).map(x => x.id), ['w:el gato']);
  assert.deepEqual(filtruj(L, { filtr: 'ulubione', ulub: { 'w:el agua': 1 } }).map(x => x.id), ['w:el agua']);
});

test('wyszukiwanie po polsku, hiszpańsku i wariancie LATAM', () => {
  assert.deepEqual(filtruj(L, { q: 'kot' }).map(x => x.es), ['el gato']);
  assert.deepEqual(filtruj(L, { q: 'CASA' }).map(x => x.es), ['la casa']);
  assert.deepEqual(filtruj(L, { q: 'carro' }).map(x => x.es), ['el coche']);
  assert.deepEqual(filtruj(L, { q: 'samochod' }).map(x => x.es), ['el coche']);
});

test('sortowanie: alfabetycznie bez rodzajnika, po polsku, najsłabsze, najczęściej mylone', () => {
  assert.deepEqual(sortuj(L, 'es').map(x => x.es), ['el agua', 'la casa', 'el coche', 'el gato']);
  assert.deepEqual(sortuj(L, 'pl').map(x => x.pl), ['dom', 'kot', 'samochód', 'woda']);
  assert.equal(sortuj(L, 'postep', stany)[0].id, 'w:la casa');
  assert.equal(sortuj(L, 'trudne', stany)[0].id, 'w:la casa');
  assert.deepEqual(sortuj(L, 'domyslnie'), L);
});

test('migracja ze starej wersji: „umiem” → stan SRS, wyniki egzaminów, poziom', () => {
  const s = migruj(null, { poziom: 'B1', umiem: { 'el gato': 1, 'hola': 1 }, egz: { A1: 80 }, glos: 'x' }, T0);
  assert.equal(s.v, WERSJA);
  assert.equal(Object.keys(s.srs).length, 2);
  assert.equal(s.srs['w:el gato'].ok, 1);
  assert.equal(s.egz.A1, 80);
  assert.equal(s.ui.poziom, 'B1');
  assert.equal(s.ust.glos, 'x');
});

test('migracja uzupełnia nowe pola ustawień w zapisanym stanie v2', () => {
  const s = migruj({ v: 2, srs: { a: 1 }, ust: { cel: 50 } });
  assert.equal(s.ust.cel, 50);
  assert.equal(s.ust.skala, 2);
  assert.equal(s.ui.zakladka, 'slowka');
});

test('aktywność dzienna i seria dni z osiągniętym celem', () => {
  const s = nowyStanAplikacji(); s.ust.cel = 10;
  const d = n => T0 - n * DZIEN;
  s.dni[dzien(d(1))] = 12; s.dni[dzien(d(2))] = 10; s.dni[dzien(d(3))] = 4; s.dni[dzien(d(4))] = 30;
  assert.equal(seria(s, T0), 3);                 // dziś bez celu: seria z wczoraj trwa; dzień 3 zamrożony, dzień 4 się liczy
  dodajAktywnosc(s, 10, T0);
  assert.equal(s.dni[dzien(T0)], 10);
  assert.equal(seria(s, T0), 4);
  s.dni[dzien(d(1))] = 0;
  assert.equal(seria(s, T0), 2);                 // dziś + (wczoraj zamrożony) + dzień 2; drugi brak w tym tygodniu przerywa
  s.dni[dzien(d(2))] = 0;
  assert.equal(seria(s, T0), 1);                 // dwa dni z rzędu bez celu przerywają serię
});

test('eksport i import postępów', () => {
  const s = nowyStanAplikacji(); s.srs['w:hola'] = ocen(null, 3, T0); s.egz.A2 = 90;
  const z = importuj(eksportuj(s));
  assert.equal(z.srs['w:hola'].ok, 1);
  assert.equal(z.egz.A2, 90);
  assert.throws(() => importuj('{"cos":1}'), /nie jest plik/);
  assert.throws(() => importuj('to nie json'));
});
