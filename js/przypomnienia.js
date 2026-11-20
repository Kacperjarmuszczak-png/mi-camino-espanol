// Przypomnienia bez serwera:
//  1) codzienne wydarzenie w Kalendarzu (plik .ics z powtarzaniem i alarmem) – iPhone przypomina o stałej godzinie,
//  2) plakietka na ikonie aplikacji (ekran główny) z liczbą pozycji do powtórki – Badging API, iOS 16.4+ po zgodzie na powiadomienia.

const dwie = n => String(n).padStart(2, '0');
const dataIcs = d => `${d.getFullYear()}${dwie(d.getMonth() + 1)}${dwie(d.getDate())}`;
const zlam = l => l.match(/.{1,73}/g).join('\r\n ');   // RFC 5545: linie do 75 znaków
const escIcs = s => String(s).replace(/\\/g, '\\\\').replace(/[,;]/g, m => '\\' + m).replace(/\n/g, '\\n');

/**
 * @param {{godzina: string, tytul: string, opis: string, url: string, teraz?: Date}} o – godzina „HH:MM” (czas lokalny)
 */
export function plikIcs({ godzina, tytul, opis, url, teraz = new Date() }) {
  const [h, m] = godzina.split(':').map(Number);
  const start = new Date(teraz); start.setHours(h, m, 0, 0);
  if (start <= teraz) start.setDate(start.getDate() + 1);
  const czas = `${dataIcs(start)}T${dwie(h)}${dwie(m)}00`;
  const koniec = new Date(start.getTime() + 15 * 60000);
  const stamp = teraz.toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Espanol JKF//PL', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'BEGIN:VEVENT', `UID:przypomnienie-${dataIcs(teraz)}-${dwie(h)}${dwie(m)}@espanol-jkf`, `DTSTAMP:${stamp}`,
    `DTSTART:${czas}`, `DTEND:${dataIcs(koniec)}T${dwie(koniec.getHours())}${dwie(koniec.getMinutes())}00`, 'RRULE:FREQ=DAILY',
    zlam(`SUMMARY:${escIcs(tytul)}`), zlam(`DESCRIPTION:${escIcs(opis + '\n' + url)}`), zlam(`URL:${url}`),
    'BEGIN:VALARM', 'ACTION:DISPLAY', zlam(`DESCRIPTION:${escIcs(tytul)}`), 'TRIGGER:PT0M', 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR', ''].join('\r\n');
}

export function pobierzIcs(tresc, nazwa = 'przypomnienie.ics') {
  const blob = new Blob([tresc], { type: 'text/calendar;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = nazwa;
  document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}

export const plakietkaDostepna = () => typeof navigator !== 'undefined' && 'setAppBadge' in navigator;
export async function wlaczPlakietke() {
  if (!plakietkaDostepna()) return 'brak';
  if (typeof Notification !== 'undefined' && Notification.permission !== 'granted') {
    try { if ((await Notification.requestPermission()) !== 'granted') return 'odmowa'; } catch (e) { return 'odmowa'; }
  }
  return 'ok';
}
export function ustawPlakietke(n) {
  if (!plakietkaDostepna()) return;
  try { (n > 0 ? navigator.setAppBadge(n) : navigator.clearAppBadge()).catch(() => {}); } catch (e) { /* brak */ }
}
