import { test } from 'node:test';
import assert from 'node:assert/strict';
import { szukajWSlowniku, kandydaciEs } from '../js/slownik.js';

test('słownik aplikacji: hasła i formy odmienione', async () => {
  const s = async w => (await szukajWSlowniku(w, 'es'));
  assert.ok((await s('matadora')).tlum.join(' ').includes('zabójczyni'));
  assert.equal((await s('matadores')).haslo, 'el matador');
  assert.equal((await s('casas')).haslo, 'la casa');
  assert.equal((await s('tienes')).haslo, 'tener');
  assert.equal((await s('pusieron')).haslo, 'poner');
  assert.equal((await s('canciones')).haslo, 'la canción');
  assert.equal(await s('xqzwv'), null);
  assert.equal((await szukajWSlowniku('pies', 'pl')).tlum[0], 'el perro');
});
test('kandydaci form', () => {
  assert.ok(kandydaciEs('canciones').some(k => k.w === 'canción'));
});
