// Zakładka „Tłumacz”: wpisz zdanie lub tekst, dostaniesz tłumaczenie, analizę słowo po słowie i wyjaśnienia „dlaczego tak”.
import { $, esc, przyciskGlosu, przyciskGwiazdki, toast, zamknijModal } from './wspolne.js';
import { analizuj, slownikPl } from '../analiza.js';
import { tlumaczOnline } from '../tlumaczenie.js';
import { szukajWSlowniku, ZRODLO_SLOWNIKA } from '../slownik.js';
import { dodajWlasne } from '../wlasne.js';

const PRZYKLADY = {
  es: ['Me gustaría reservar una mesa para dos.', '¿Dónde está la estación de tren?', 'Ayer fui al cine con mis amigos.', 'Quiero que vengas conmigo.', 'Tengo que trabajar mañana por la mañana.', 'Donde esta el baño?', 'Me gusta los perros.'],
  pl: ['Gdzie jest najbliższa apteka?', 'Chciałbym zamówić kawę z mlekiem.', 'Jutro idę do pracy autobusem.', 'Czy możesz mówić wolniej?'],
};
const KLASA = t => /czasownik/.test(t) ? 'cz' : /rzeczownik/.test(t) ? 'rz' : /przymiotnik/.test(t) ? 'pz' : /rodzajnik|zaimek|przyimek|spójnik|ściągnięcie/.test(t) ? 'fn' : t === 'nieznane' ? 'nz' : 'in';

export function zakladkaTlumacz(root, app) {
  const ui = app.stan.ui;
  const kier = () => ui.tKier || 'es';
  root.innerHTML = `
    <div class="seg seg--pelny" role="group" aria-label="Kierunek tłumaczenia" id="t-kier">
      <button type="button" data-tk="es">Hiszpański → polski</button><button type="button" data-tk="pl">Polski → hiszpański</button>
    </div>
    <textarea class="pole pole--tekst" id="t-tekst" rows="4" data-znaki spellcheck="false" autocapitalize="sentences" aria-label="Tekst do przetłumaczenia"></textarea>
    <div class="wiersz">
      <button type="button" class="btn btn--akcent" id="t-start">Przetłumacz i wyjaśnij <kbd>Ctrl + Enter</kbd></button>
      <button type="button" class="btn btn--male btn--cichy" id="t-wyczysc">Wyczyść</button>
    </div>
    <div class="arkusz" id="t-opcje">
      <label class="cc-kafel cc-kafel--szeroki"><input type="checkbox" id="t-online"><span class="tgl" aria-hidden="true"></span><b>Tłumaczenie online</b><small id="t-info-online"></small></label>
      <p class="etykieta">Przykładowe zdania</p>
      <div class="pigulki pigulki--pion" id="t-przyklady" aria-label="Przykłady"></div>
    </div>
    <div id="t-wynik" aria-live="polite"></div>`;
  const pole = $('#t-tekst', root), wynikEl = $('#t-wynik', root), online = $('#t-online', root);
  online.checked = ui.tOnline !== false;
  let ostatnia = null, kontroler = null;

  function rysujKier() {
    root.querySelectorAll('[data-tk]').forEach(b => b.setAttribute('aria-pressed', b.dataset.tk === kier()));
    pole.setAttribute('lang', kier());
    pole.placeholder = kier() === 'es' ? 'Wpisz zdanie lub tekst po hiszpańsku, np. „Me gustaría reservar una mesa para dos.”' : 'Wpisz zdanie po polsku, np. „Gdzie jest najbliższa apteka?”';
    $('#t-przyklady').innerHTML = PRZYKLADY[kier()].map(p => `<button type="button" class="pigulka" data-tp="${esc(p)}">${esc(p)}</button>`).join('');
    $('#t-info-online').textContent = online.checked
      ? 'Całe zdanie tłumaczy darmowy serwis MyMemory (tekst jest do niego wysyłany, limit ok. 5000 znaków dziennie). Analiza słów i wyjaśnienia działają bez internetu.'
      : kier() === 'es' ? 'Bez tłumaczenia online: analiza słowo po słowie i wyjaśnienia działają offline.' : 'Bez tłumaczenia online dostaniesz propozycje hiszpańskich słów dla każdego polskiego słowa.';
  }

  // --- wyniki ---
  function kartaSlowa(w, zi, i, uwagi) {
    const moje = uwagi.filter(u => u.idx.includes(i));
    const blad = moje.some(u => u.typ === 'blad');
    return `<button type="button" class="slowo-chip typ-${KLASA(w.typ)}${blad ? ' blad' : ''}" data-ts="${zi},${i}" aria-expanded="false">
      <b>${esc(w.t)}</b><small>${esc(String(w.pl || '').replace(/\s*–\s*$/, '').slice(0, 40))}</small></button>`;
  }
  function szczegolSlowa(w, uwagi, i) {
    const moje = uwagi.filter(u => u.idx.includes(i));
    const v = w.czasownik;
    return `<div class="slowo-szczegol">
      <div class="szczegol-gora"><h3>${esc(w.t)}${w.lemat && w.lemat.toLowerCase() !== w.t.toLowerCase() ? ` <span>→ ${esc(w.lemat)}</span>` : ''}</h3>
        <span>${przyciskGlosu(w.t)}${w.id ? przyciskGwiazdki(w.id, app.stan.ulub[w.id]) : ''}</span></div>
      <p><span class="chip">${esc(w.typ || 'słowo')}</span> ${w.opis ? `<span class="male">${esc(w.opis)}</span>` : ''}</p>
      <p><b>Znaczenie:</b> ${esc(w.plPelne || w.pl || '–')}</p>
      ${w.uwagaFun ? `<p class="male">${esc(w.uwagaFun)}</p>` : ''}
      ${w.regula ? `<p class="regula"><b>Jak powstaje ta forma:</b> ${esc(w.regula)}</p>` : ''}
      ${w.alternatywy && w.alternatywy.length ? `<p class="male">Ta sama forma może też być: ${w.alternatywy.map(a => `${esc(a.v.inf)} (${esc(a.czas)})`).join(', ')}.</p>` : ''}
      ${moje.map(u => `<p class="${u.typ === 'blad' ? 'tekst-zle' : ''}"><b>${esc(u.tytul)}</b> – ${esc(u.tekst)}</p>`).join('')}
      ${w.zSlownika ? `<p class="male">Ze słownika ogólnego (${ZRODLO_SLOWNIKA})${w.przybl ? ' – tłumaczenie przybliżone przez angielski' + (w.ang ? ` (ang. ${esc(w.ang)})` : '') : ''}.</p>
        <button type="button" class="btn btn--male" data-tdodaj="${esc(w.lemat || w.t)}|${esc(String(w.pl))}">+ Dodaj do moich słówek</button>` : ''}
      ${!w.znany ? '<p class="male">Tego słowa nie ma w słowniku aplikacji. Może to nazwa własna, bardzo rzadkie słowo albo literówka.</p>' : ''}
      ${v && v.v ? `<button type="button" class="btn btn--male" data-todm="${esc(v.v.inf)}">Pokaż odmianę „${esc(v.v.inf)}”</button>` : ''}
    </div>`;
  }
  function rysujAnalize(a, naglowek = '') {
    const html = a.zdania.map((z, zi) => `
      <section class="analiza-zdanie">
        <div class="zdanie-gora"><p class="zdanie-tekst">${esc(z.tekst)}</p>${przyciskGlosu(z.tekst, 'Posłuchaj zdania')}</div>
        <p class="etykieta">Słowo po słowie <span class="male">(stuknij słowo)</span></p>
        <div class="slowa-chipy">${z.slowa.map((w, i) => kartaSlowa(w, zi, i, z.uwagi)).join('')}</div>
        <div class="szczegol-miejsce" data-sz="${zi}"></div>
        <p class="doslownie"><b>Dosłownie:</b> ${esc(z.doslownie || '–')}</p>
        ${z.uwagi.length ? `<p class="etykieta">Dlaczego tak?</p><ol class="uwagi">${[...z.uwagi].sort((x, y) => (y.typ === 'blad') - (x.typ === 'blad')).map(u => `<li class="uwaga uwaga--${u.typ}"><b>${u.typ === 'blad' ? '✗ ' : ''}${esc(u.tytul)}</b><span>${esc(u.tekst)}</span></li>`).join('')}</ol>` : ''}
      </section>`).join('');
    const ileSlow = a.zdania.reduce((s, z) => s + z.slowa.length, 0);
    const znane = ileSlow - a.nieznane.length;
    wynikEl.innerHTML = `${naglowek}
      <p class="male podsumowanie-analizy">Rozpoznano ${znane} z ${ileSlow} słów · ${a.bledy ? `<span class="tekst-zle">${a.bledy} ${a.bledy === 1 ? 'możliwy błąd' : 'możliwe błędy'}</span>` : 'bez błędów'} · ${a.zdania.reduce((s, z) => s + z.uwagi.length, 0)} wyjaśnień</p>
      ${html}`;
    ostatnia = a;
    uzupelnijZSlownika(a);
  }
  // słowa spoza słownika aplikacji: szukamy w dużym słowniku ogólnym (wczytywanym w tle)
  async function uzupelnijZSlownika(a) {
    const nieznane = [];
    a.zdania.forEach((z, zi) => z.slowa.forEach((w, i) => { if (!w.znany && /\p{L}/u.test(w.t)) nieznane.push([w, zi, i]); }));
    for (const [w, zi, i] of nieznane) {
      const r = await szukajWSlowniku(w.t, 'es');
      if (!r || ostatnia !== a) continue;
      Object.assign(w, { znany: true, zSlownika: true, typ: 'słownik ogólny', pl: r.tlum.slice(0, 2).join(', '), plPelne: r.tlum.join(', '), lemat: r.haslo, opis: r.opis ? `${r.opis}: ${r.haslo}` : '', przybl: r.przybl, ang: r.ang });
      a.nieznane = a.nieznane.filter(x => x !== w.t);
      const chip = wynikEl.querySelector(`[data-ts="${zi},${i}"]`);
      if (chip) { chip.classList.remove('typ-nz'); chip.classList.add('typ-in', 'z-slownika'); chip.querySelector('small').textContent = w.pl.slice(0, 40); }
    }
    const ileSlow = a.zdania.reduce((s, z) => s + z.slowa.length, 0), pods = wynikEl.querySelector('.podsumowanie-analizy b, .podsumowanie-analizy');
    if (pods && ostatnia === a) pods.innerHTML = pods.innerHTML.replace(/Rozpoznano \d+ z \d+ słów/, `Rozpoznano ${ileSlow - a.nieznane.length} z ${ileSlow} słów`);
  }
  function rysujSlownikPl(lista, naglowek = '') {
    wynikEl.innerHTML = `${naglowek}<section class="analiza-zdanie"><p class="etykieta">Słownik słowo po słowie (polski → hiszpański)</p>
      <ul class="lista">${lista.map(x => `<li><div class="lista-tekst"><b>${esc(x.t)}</b><span>${x.propozycje.length ? x.propozycje.map(p => `${esc(p.es)} <i>(${esc(p.pl)})</i>`).join(' · ') : 'brak w słowniku'}</span></div>${x.propozycje[0] ? przyciskGlosu(x.propozycje[0].es) : ''}</li>`).join('')}</ul>
      <p class="male">Żeby dostać całe zdanie po hiszpańsku z wyjaśnieniem gramatyki, włącz tłumaczenie online.</p></section>`;
  }

  async function start() {
    const tekst = pole.value.trim();
    if (!tekst) { pole.focus(); return; }
    if (kontroler) kontroler.abort();
    kontroler = new AbortController();
    zapiszHistorie(tekst);
    const z = kier(), na = z === 'es' ? 'pl' : 'es';
    const czyOnline = online.checked;
    // pojedyncze słowo ze słownika aplikacji: pewne tłumaczenie zamiast maszynowego
    const zeSlownika = /^\p{L}+$/u.test(tekst) ? await szukajWSlowniku(tekst, z) : null;
    const karta = zeSlownika ? `<div class="tlumaczenie tlumaczenie--slownik"><p class="etykieta">Słownik</p>
      <p class="tlumaczenie-tekst">${esc(z === 'es' ? zeSlownika.haslo : tekst)} → ${esc(zeSlownika.tlum.join(', '))}</p>${zeSlownika.opis ? `<p class="male">${esc(zeSlownika.opis)}: ${esc(zeSlownika.haslo)}</p>` : ''}</div>` : '';
    if (z === 'es') rysujAnalize(analizuj(tekst), karta || (czyOnline ? '<div class="tlumaczenie ladowanie">Tłumaczę…</div>' : ''));
    else wynikEl.innerHTML = karta || (czyOnline ? '<div class="tlumaczenie ladowanie">Tłumaczę na hiszpański…</div>' : '');
    if (zeSlownika) return;
    if (!czyOnline) { if (z === 'pl') rysujSlownikPl(slownikPl(tekst)); return; }
    try {
      const t = await tlumaczOnline(tekst, z, na, { sygnal: kontroler.signal });
      const karta = `<div class="tlumaczenie"><p class="etykieta">${z === 'es' ? 'Tłumaczenie na polski' : 'Po hiszpańsku'}</p><p class="tlumaczenie-tekst">${esc(t)}</p>${z === 'pl' ? przyciskGlosu(t, 'Posłuchaj') : ''}<p class="male">Tłumaczenie maszynowe (MyMemory). Słowo po słowie i reguły poniżej pochodzą ze słownika aplikacji.</p></div>`;
      if (z === 'es') { const l = $('.tlumaczenie.ladowanie', wynikEl); if (l) l.outerHTML = karta; }
      else rysujAnalize(analizuj(t), karta);
      app.dodajAktywnosc(1);
    } catch (e) {
      if (e.name === 'AbortError') return;
      const info = `<div class="tlumaczenie tlumaczenie--blad"><p><b>Pełne tłumaczenie niedostępne.</b> ${esc(e.message || '')}</p><p class="male">${z === 'es' ? 'Analiza słowo po słowie poniżej działa bez internetu.' : 'Poniżej propozycje słów ze słownika aplikacji.'}</p></div>`;
      if (z === 'es') { const l = $('.tlumaczenie.ladowanie', wynikEl); if (l) l.outerHTML = info; }
      else rysujSlownikPl(slownikPl(tekst), info);
    }
  }
  function zapiszHistorie(t) {
    const h = (ui.tHist || []).filter(x => x !== t);
    h.unshift(t); ui.tHist = h.slice(0, 8); app.zapisz();
  }

  // --- zdarzenia ---
  root.addEventListener('click', e => {
    const t = e.target;
    const k = t.closest('[data-tk]'); if (k) { ui.tKier = k.dataset.tk; app.zapisz(); rysujKier(); wynikEl.innerHTML = ''; return; }
    if (t.closest('#t-start')) return start();
    if (t.closest('#t-wyczysc')) { pole.value = ''; wynikEl.innerHTML = ''; pole.focus(); return; }
    const s = t.closest('[data-ts]');
    if (s && ostatnia) {
      const [zi, i] = s.dataset.ts.split(',').map(Number);
      const miejsce = root.querySelector(`[data-sz="${zi}"]`);
      const otwarte = s.getAttribute('aria-expanded') === 'true';
      root.querySelectorAll(`[data-ts^="${zi},"]`).forEach(b => b.setAttribute('aria-expanded', 'false'));
      if (otwarte) { miejsce.innerHTML = ''; return; }
      s.setAttribute('aria-expanded', 'true');
      const z = ostatnia.zdania[zi];
      miejsce.innerHTML = szczegolSlowa(z.slowa[i], z.uwagi, i);
      app.mowa.powiedz(z.slowa[i].t);
      return;
    }
    const o = t.closest('[data-todm]'); if (o) { app.otworzCzasownik(o.dataset.todm); return; }
    const d = t.closest('[data-tdodaj]');
    if (d) { const [es, pl] = d.dataset.tdodaj.split('|'); const x = dodajWlasne(app.stan, { es, pl, p: app.stan.ui.poziom }); app.zapisz(); toast(x ? `Dodano do moich słówek: ${es}` : 'To słowo już jest na liście.'); d.disabled = true; }
  });
  // opcje (online, przykłady) żyją w arkuszu otwieranym z górnej kapsuły
  $('#t-opcje', root).addEventListener('click', e => {
    const p = e.target.closest('[data-tp]'); if (!p) return;
    pole.value = p.dataset.tp; zamknijModal(); start();
  });
  online.addEventListener('change', () => { ui.tOnline = online.checked; app.zapisz(); rysujKier(); });
  pole.addEventListener('keydown', e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); start(); } });

  return {
    poziom() {
      rysujKier();
      if (!pole.value && ui.tHist && ui.tHist.length) pole.value = ui.tHist[0];
      if (pole.value && !ostatnia && kier() === 'es') rysujAnalize(analizuj(pole.value));
    },
    odswiezListe() {},
    klawisz() { return false; },
  };
}
