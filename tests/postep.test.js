import { test } from 'node:test';
import assert from 'node:assert/strict';
import { poziomGracza, noweOdznaki, tydzien, xpZaOcene } from '../js/postep.js';
import { nowyStanAplikacji, dzien } from '../js/stan.js';

test('poziom gracza z XP', () => {
  assert.equal(poziomGracza(0).poziom, 1);
  assert.equal(poziomGracza(99).poziom, 1);
  assert.equal(poziomGracza(100).poziom, 2);
  assert.equal(poziomGracza(300).poziom, 3);
  assert.equal(poziomGracza(150).proc, 25);
  assert.equal(xpZaOcene(3), 10); assert.equal(xpZaOcene(1), 2);
});
test('odznaki zdobywane raz', () => {
  const z = { odp: 120, najdl: 3, opan: 0, egz: {}, licz: {}, rekordy: {}, poziom: 1 };
  assert.deepEqual(noweOdznaki(z, {}).map(o => o.id), ['start', 'odp100', 'seria3']);
  assert.deepEqual(noweOdznaki(z, { start: 1, odp100: 1, seria3: 1 }), []);
});
test('tydzień: suma od poniedziałku i porównanie', () => {
  const s = nowyStanAplikacji(); s.ust.cel = 10;
  const pt = new Date(2026, 10, 20, 12).getTime();          // piątek
  s.dni[dzien(pt)] = 12; s.dni[dzien(pt - 864e5)] = 5; s.dni[dzien(pt - 7 * 864e5)] = 4;
  const t = tydzien(s, pt);
  assert.equal(t.dni.length, 5); assert.equal(t.odp, 17); assert.equal(t.odpPoprz, 4);
  assert.equal(t.aktywne, 2); assert.equal(t.celOsiagniety, 1); assert.equal(t.najlepszy.n, 12);
});
