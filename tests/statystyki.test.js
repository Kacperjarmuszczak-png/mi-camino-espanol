import { test } from 'node:test';
import assert from 'node:assert/strict';
import { kalendarz, najdluzszaSeria, seriaOpanowanych, najczesciejMylone } from '../js/statystyki.js';

test('kalendarz: 18 tygodni po 7 dni, przyszłe dni puste, poziom wg celu', () => {
  const teraz = new Date(2026, 10, 20, 12).getTime();   // piątek
  const k = kalendarz({ '2026-11-20': 30, '2026-11-19': 5 }, 20, 18, teraz);
  assert.equal(k.length, 18); assert.ok(k.every(c => c.length === 7));
  const ost = k[17];
  assert.equal(ost[4].k, '2026-11-20'); assert.equal(ost[4].poziom, 4);
  assert.equal(ost[3].poziom, 1); assert.equal(ost[5], null);
});
test('najdłuższa seria i historia opanowanych', () => {
  assert.equal(najdluzszaSeria({ '2026-11-01': 20, '2026-11-02': 25, '2026-11-03': 3, '2026-11-04': 20 }, 20), 2);
  const p = seriaOpanowanych({ '2026-10-01': 4, '2026-11-19': 9 }, 5, new Date(2026, 10, 20, 12).getTime());
  assert.deepEqual(p.map(x => x.n), [4, 4, 4, 9, 9]);
});
test('najczęściej mylone', () => {
  const m = najczesciejMylone({ a: { zle: 1, ok: 3 }, b: { zle: 4, ok: 0 }, c: { zle: 0 } });
  assert.deepEqual(m.map(x => x.id), ['b', 'a']);
});
