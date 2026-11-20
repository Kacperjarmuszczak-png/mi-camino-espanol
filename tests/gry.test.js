import { test } from 'node:test';
import assert from 'node:assert/strict';
import { wykreslanka, linia } from '../js/gry.js';

test('wykreślanka: każde słowo w siatce na swojej pozycji', () => {
  let ziarno = 7; const los = () => ((ziarno = (ziarno * 16807) % 2147483647) / 2147483647);
  const slowa = ['CASA', 'PERRO', 'NIÑO', 'LIBRO', 'MESA', 'AGUA'];
  const { siatka, pozycje } = wykreslanka(slowa, 10, 'ABC', los);
  assert.equal(siatka.length, 10); assert.ok(siatka.every(w => w.length === 10 && w.every(Boolean)));
  for (const p of pozycje) assert.equal([...p.slowo].map((_, i) => siatka[p.r + p.dr * i][p.c + p.dc * i]).join(''), p.slowo);
  assert.ok(pozycje.length >= 5);
});
test('linia między polami', () => {
  assert.equal(linia({ r: 0, c: 0 }, { r: 0, c: 3 }).length, 4);
  assert.equal(linia({ r: 2, c: 2 }, { r: 0, c: 0 }).length, 3);
  assert.equal(linia({ r: 0, c: 0 }, { r: 1, c: 3 }), null);
});
