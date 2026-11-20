import { test } from 'node:test';
import assert from 'node:assert/strict';
import { utworzKontekst } from '../js/kontekst.js';

test('słowo w kontekście: całe słowo, bez rodzajnika, bez własnego przykładu', () => {
  const k = utworzKontekst([{ es: 'Mi casa es muy grande.', pl: 'Mój dom jest duży.' }, { es: 'Vivo en una casa pequeña.' }, { es: 'Está casado con Ana.' }, { es: 'Las casas son caras aquí.' }]);
  const w = k('la casa');
  assert.deepEqual(w.map(z => z.es), ['Mi casa es muy grande.', 'Vivo en una casa pequeña.']);
  assert.equal(k('la casa', { bez: 'Mi casa es muy grande.' }).length, 1);
  assert.equal(k('buenos días').length, 0);
  assert.equal(utworzKontekst([{ es: 'Buenos días, ¿cómo está?' }])('buenos días').length, 1);
});
