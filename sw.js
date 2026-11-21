// Service worker: aplikacja działa offline i można ją dodać do ekranu głównego.
// Strategia „najpierw sieć”: online zawsze najnowsza wersja z GitHub Pages, bez sieci – ostatnia zapisana kopia.
const WERSJA = '7f48067f42';
const PAMIEC = 'espanol-' + WERSJA;
const PLIKI = [
  './',
  './css/app.css',
  './img/ikona-180.png',
  './img/ikona-192.png',
  './img/ikona-512.png',
  './img/ikona-maskable-512.png',
  './index.html',
  './js/akcent.js',
  './js/analiza-pl.js',
  './js/analiza.js',
  './js/cwiczenia-logika.js',
  './js/dane/czasowniki.js',
  './js/dane/czytanie-pl.js',
  './js/dane/czytanie.js',
  './js/dane/falszywi.js',
  './js/dane/funkcyjne.js',
  './js/dane/gramatyka.js',
  './js/dane/index.js',
  './js/dane/kultura.js',
  './js/dane/lekcje-gramatyki.js',
  './js/dane/przyklady-2.js',
  './js/dane/przyklady.js',
  './js/dane/rodziny.js',
  './js/dane/rozmowki.js',
  './js/dane/rozmowy.js',
  './js/dane/slowa-codzienne-a.js',
  './js/dane/slowa-codzienne-b.js',
  './js/dane/slowa-codzienne-c.js',
  './js/dane/slowa-codzienne-d.js',
  './js/dane/slowa-codzienne-e.js',
  './js/dane/slowa-czeste.js',
  './js/dane/slowa-zaawansowane.js',
  './js/dane/slowa.js',
  './js/dane/tematy-es.js',
  './js/dane/warianty.js',
  './js/dane/zwroty-dodatkowe.js',
  './js/dane/zwroty.js',
  './js/dzwieki.js',
  './js/egzamin.js',
  './js/filtry.js',
  './js/gry.js',
  './js/jezyk.js',
  './js/kontekst.js',
  './js/lib/qrcode.js',
  './js/liczby.js',
  './js/main.js',
  './js/mowa.js',
  './js/odmiana-pl.js',
  './js/odmiana.js',
  './js/plan.js',
  './js/postep.js',
  './js/przenoszenie.js',
  './js/przypadki.js',
  './js/przypomnienia.js',
  './js/rozpoznawanie.js',
  './js/slownik.js',
  './js/srs.js',
  './js/stan.js',
  './js/statystyki.js',
  './js/tekst.js',
  './js/tlumaczenie.js',
  './js/ui/akcenty-swiata.js',
  './js/ui/cwiczenia.js',
  './js/ui/czasowniki-pl.js',
  './js/ui/czasowniki.js',
  './js/ui/czytanie.js',
  './js/ui/dyktando.js',
  './js/ui/dziennik.js',
  './js/ui/egzamin.js',
  './js/ui/falszywi.js',
  './js/ui/gdzie-akcent.js',
  './js/ui/gramatyka.js',
  './js/ui/gry-pula.js',
  './js/ui/karty.js',
  './js/ui/kontekst-dane.js',
  './js/ui/kultura.js',
  './js/ui/lekcja-dnia.js',
  './js/ui/liczby.js',
  './js/ui/lista.js',
  './js/ui/memory.js',
  './js/ui/moje.js',
  './js/ui/motywacja.js',
  './js/ui/plan.js',
  './js/ui/przypadki.js',
  './js/ui/pula.js',
  './js/ui/rodzajnik.js',
  './js/ui/rodziny.js',
  './js/ui/rozmowa.js',
  './js/ui/rozmowki.js',
  './js/ui/shadowing.js',
  './js/ui/slowka.js',
  './js/ui/suwak.js',
  './js/ui/tlumacz-pl.js',
  './js/ui/tlumacz.js',
  './js/ui/uloz.js',
  './js/ui/wisielec.js',
  './js/ui/wlasne.js',
  './js/ui/wspolne.js',
  './js/ui/wykreslanka.js',
  './js/ui/wyspa.js',
  './js/ui/wyzwania.js',
  './js/ui/zwroty.js',
  './js/wlasne.js',
  './manifest.webmanifest',
  './style.js',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(PAMIEC).then(c => c.addAll(PLIKI)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n !== PAMIEC).map(n => caches.delete(n)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== self.location.origin) return;   // tłumacz online itp. – bez pośrednictwa
  e.respondWith(fetch(r).then(odp => {
    if (odp.ok) { const kopia = odp.clone(); caches.open(PAMIEC).then(c => c.put(r, kopia)); }
    return odp;
  }).catch(() => caches.match(r, { ignoreSearch: true }).then(z => z || (r.mode === 'navigate' ? caches.match('./index.html') : Response.error()))));
});
// stuknięcie powiadomienia otwiera aplikację
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window' }).then(w => (w[0] ? w[0].focus() : self.clients.openWindow('./'))));
});
