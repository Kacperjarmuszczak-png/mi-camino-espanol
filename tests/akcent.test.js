import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analizaAkcentu, jadra } from '../js/akcent.js';

test('typy akcentu', () => {
  assert.equal(analizaAkcentu('canción').typ, 'aguda');
  assert.equal(analizaAkcentu('café').typ, 'aguda');
  assert.equal(analizaAkcentu('árbol').typ, 'llana');
  assert.equal(analizaAkcentu('fácil').typ, 'llana');
  assert.equal(analizaAkcentu('médico').typ, 'esdrújula');
  assert.equal(analizaAkcentu('música').typ, 'esdrújula');
  assert.equal(analizaAkcentu('día').typ, 'hiato');
  assert.equal(analizaAkcentu('país').typ, 'hiato');
  assert.equal(analizaAkcentu('casa').typ, 'zwykły');
  assert.equal(analizaAkcentu('canción').indeks, 5);
  assert.equal(jadra('ciudad').length, 2);
  assert.equal(jadra('teatro').length, 3);
});
