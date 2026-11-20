import { test } from 'node:test';
import assert from 'node:assert/strict';
import { plikIcs } from '../js/przypomnienia.js';

test('plik .ics: codziennie, z alarmem, następnego dnia gdy godzina minęła', () => {
  const ics = plikIcs({ godzina: '19:30', tytul: 'Hiszpański – 20 słówek', opis: 'Seria: 3 dni', url: 'https://example.org/app/', teraz: new Date(2026, 10, 20, 20, 0) });
  assert.match(ics, /DTSTART:20261121T193000/);
  assert.match(ics, /RRULE:FREQ=DAILY/);
  assert.match(ics, /BEGIN:VALARM[\s\S]*TRIGGER:PT0M/);
  assert.match(ics, /SUMMARY:Hiszpański – 20 słówek/);
  assert.ok(ics.split('\r\n').every(l => l.length <= 75));
  const rano = plikIcs({ godzina: '19:30', tytul: 't', opis: 'o', url: 'u', teraz: new Date(2026, 10, 20, 8, 0) });
  assert.match(rano, /DTSTART:20261120T193000/);
});
