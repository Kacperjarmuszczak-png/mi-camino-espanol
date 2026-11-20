// Silnik sesji z kartami (słówka i zwroty): kolejka SRS, 4 tryby ćwiczeń, podpowiedzi, oceny, podsumowanie sesji.
import { $, esc, IKONY, przyciskGlosu, przyciskGwiazdki, podswietl, bezGwiazdek, wpisZAkcentami, toast, otworzModal, sygnalModalu, kapsulaOpcji } from './wspolne.js';
import { budujKolejke, poOcenie, status, doPowtorki } from '../srs.js';
import { sprawdz, komunikat, ocenaZWyniku, tasuj, bezRodzajnika, czysc, warianty } from '../tekst.js';
import { wWariancie, odpowiedziEs } from '../dane/index.js';
import { t as tr, HISP, CEL } from '../jezyk.js';

export const TRYBY = [
  ['fiszka', tr('Fiszka', 'Tarjeta')], ['wpisz', tr('Wpisz', 'Escribir')], ['wybor', tr('Wybór', 'Elegir')], ['sluchanie', tr('Słuchanie', 'Escuchar')],
];
// „es” = język nauki → język użytkownika
const KIERUNKI = HISP ? [['es', 'PL → ES'], ['pl', 'ES → PL'], ['mix', 'Mixto']] : [['es', 'ES → PL'], ['pl', 'PL → ES'], ['mix', 'Mieszany']];
const RODZAJ = { m: 'rodzaj męski', f: 'rodzaj żeński', mpl: 'męski, l. mnoga', fpl: 'żeński, l. mnoga' };
export const REJESTR = HISP ? { form: 'formal', nieform: 'informal', neutr: 'neutro' } : { form: 'formalny', nieform: 'nieformalny', neutr: 'neutralny' };
const JEZ_CEL = tr('po hiszpańsku', 'en polaco'), JEZ_MOJ = tr('po polsku', 'en español');
const LANG_CEL = CEL, LANG_MOJ = HISP ? 'es' : 'pl';

function dystraktory(x, pula, pole, ile = 3) {
  const cel = czysc(x[pole]);
  const kand = pula.filter(y => y.id !== x.id && czysc(y[pole]) !== cel && !warianty(y.pl).some(v => warianty(x.pl).includes(v)));
  const oc = y => (y.t === x.t ? 3 : 0) + (y.rodzaj && y.rodzaj === x.rodzaj ? 2 : 0)
    + (Math.abs(y[pole].length - x[pole].length) <= 3 ? 1 : 0) + (y[pole][0] === x[pole][0] ? 1 : 0) + Math.random() * 2.5;
  const wynik = [], uzyte = new Set();
  for (const y of kand.map(y => [oc(y), y]).sort((a, b) => b[0] - a[0]).map(p => p[1])) {
    const k = czysc(y[pole]); if (uzyte.has(k)) continue;
    uzyte.add(k); wynik.push(y); if (wynik.length === ile) break;
  }
  return wynik;
}

/**
 * @param {HTMLElement} root
 * @param {{app: object, rodzaj: 'slowka'|'zwroty', pula: () => object[], pelnaPula: () => object[]}} cfg
 */
export function silnikKart(root, cfg) {
  const { app } = cfg;
  const ust = () => app.stan.ust;
  const ui = app.stan.ui;
  const S = { kolejka: [], razy: {}, ocenione: 0, dobrze: 0, bledy: new Map(), startStatus: {}, przed: 0, karta: null, koniec: false, wlasna: null };

  root.innerHTML = `
    <div class="przelaczniki">
      <div class="seg seg--pelny" role="group" aria-label="${tr('Tryb ćwiczenia', 'Modo de práctica')}" data-tryby>${TRYBY.map(([k, n]) => `<button type="button" data-tryb="${k}">${n}</button>`).join('')}</div>
      <div class="wiersz-narzedzi">${kapsulaOpcji(cfg.rodzaj + '-opcje', '')}</div>
    </div>
    <div class="sesja-pasek"><div class="postep"><i data-postep></i></div><span data-pozycja></span></div>
    <div class="karta-obszar" data-obszar aria-live="polite"></div>`;
  const obszar = $('[data-obszar]', root);
  const trybKey = cfg.rodzaj + 'Tryb', kierKey = cfg.rodzaj + 'Kier';
  const tryb = () => ui[trybKey] || 'fiszka';
  const kier = () => ui[kierKey] || 'es';

  const NAZWA_KIER = Object.fromEntries(KIERUNKI);
  function rysujPrzelaczniki() {
    root.querySelectorAll('[data-tryb]').forEach(b => b.setAttribute('aria-pressed', b.dataset.tryb === tryb()));
    const zakres = cfg.etykietaZakresu ? cfg.etykietaZakresu() : '';
    $(`#${cfg.rodzaj}-opcje span`, root).innerHTML = `<b>${NAZWA_KIER[kier()]}</b>${zakres ? ' · ' + esc(zakres) : ''}`;
  }
  root.querySelector('[data-tryby]').addEventListener('click', e => {
    const b = e.target.closest('[data-tryb]'); if (!b) return;
    ui[trybKey] = b.dataset.tryb; app.zapisz(); rysujPrzelaczniki();
    if (S.karta && !S.koniec) nowaKarta(S.karta.x); else start();
  });
  // kapsuła opcji: kierunek + ustawienia modułu (temat, kategoria) w wysuwanym panelu
  function otworzOpcje() {
    const el = otworzModal(tr('Opcje ćwiczenia', 'Opciones de práctica'), `<div class="arkusz">
      <p class="etykieta">${tr('Kierunek', 'Dirección')}</p>
      <div class="seg seg--pelny" role="group" aria-label="${tr('Kierunek', 'Dirección')}">${KIERUNKI.map(([k, n]) => `<button type="button" data-ok="${k}" aria-pressed="${k === kier()}">${n}</button>`).join('')}</div>
      ${cfg.opcjeHtml ? cfg.opcjeHtml() : ''}
      <p class="male">${tr(`Sesja ma ${Math.min(50, Math.max(10, ust().cel))} kart (cel dzienny z ustawień). Najpierw idą powtórki, potem nowe słowa.`, `La sesión tiene ${Math.min(50, Math.max(10, ust().cel))} tarjetas (según tu meta diaria). Primero van los repasos y después las palabras nuevas.`)}</p>
      <button type="button" class="btn btn--akcent btn--szeroki" data-zamknij>${tr('Gotowe', 'Listo')}</button></div>`);
    const sygnal = { signal: sygnalModalu() };
    el.addEventListener('click', e => {
      const b = e.target.closest('[data-ok]'); if (!b) return;
      ui[kierKey] = b.dataset.ok; app.zapisz();
      el.querySelectorAll('[data-ok]').forEach(x => x.setAttribute('aria-pressed', x === b));
      rysujPrzelaczniki();
      if (S.karta && !S.koniec) nowaKarta(S.karta.x);
    }, sygnal);
    if (cfg.podlaczOpcje) cfg.podlaczOpcje(el, sygnal, () => { rysujPrzelaczniki(); start(); });
  }
  $(`#${cfg.rodzaj}-opcje`, root).addEventListener('click', otworzOpcje);

  // --- sesja ---
  function start(wlasne = null) {
    const pula = cfg.pula();
    const rozmiar = Math.min(50, Math.max(10, ust().cel));
    S.wlasna = wlasne;
    const teraz = Date.now();
    const zalegle = pula.filter(x => doPowtorki(app.stan.srs[x.id], teraz)).length;
    S.kolejka = wlasne ? tasuj(wlasne.map(x => x.id)) : budujKolejke(pula.map(x => x.id), app.stan.srs, { rozmiar, nowych: Math.max(Math.ceil(rozmiar / 2), rozmiar - zalegle), teraz });
    S.razy = {}; S.ocenione = 0; S.dobrze = 0; S.bledy = new Map(); S.koniec = false;
    S.przed = S.kolejka.length;
    S.startStatus = Object.fromEntries(S.kolejka.map(id => [id, status(app.stan.srs[id])]));
    if (!S.kolejka.length) {
      obszar.innerHTML = `<div class="pusto-duze"><p>${tr('W tym zakresie nie ma jeszcze nic do ćwiczenia.', 'Aquí todavía no hay nada para practicar.')}</p><p class="male">${tr('Wybierz inny temat albo poziom.', 'Elige otro tema u otro nivel.')}</p></div>`;
      $('[data-pozycja]', root).textContent = ''; $('[data-postep]', root).style.width = '0';
      return;
    }
    nastepna();
  }
  function nastepna() {
    if (!S.kolejka.length) return podsumowanie();
    const x = app.dane.get(S.kolejka[0]);
    if (!x) { S.kolejka.shift(); return nastepna(); }
    nowaKarta(x);
  }
  function pozycja() {
    const zrobione = S.ocenione, razem = zrobione + S.kolejka.length;
    $('[data-postep]', root).style.width = (100 * zrobione / Math.max(1, razem)) + '%';
    const s = app.stan.srs[S.karta.x.id];
    const nowa = !s || (!s.ok && !s.zle);
    $('[data-pozycja]', root).textContent = tr(`Karta ${Math.min(zrobione + 1, razem)} z ${razem}${nowa ? ' · nowa' : ' · powtórka'}`, `Tarjeta ${Math.min(zrobione + 1, razem)} de ${razem}${nowa ? ' · nueva' : ' · repaso'}`);
  }

  // --- pojedyncza karta ---
  const tekstEs = x => wWariancie(x, ust().wariant);
  function nowaKarta(x) {
    let k = kier();
    if (k === 'mix') k = Math.random() < 0.5 ? 'es' : 'pl';
    S.karta = { x, k, odkryta: false, odpowiedziano: false, podp: 0, opcje: null };
    pozycja();
    const t = tryb();
    if (t === 'fiszka') rysujFiszke();
    else if (t === 'wpisz') rysujWpisz();
    else if (t === 'wybor') rysujWybor(false);
    else rysujSluchanie();
    if (ust().auto && (S.karta.k === 'es' || t === 'sluchanie') && t !== 'wpisz') app.mowa.powiedz(tekstEs(x));
    if (S.ocenione > 0 || S.wlasna) widocznaKarta();
  }
  // przewija tak, żeby karta (i przyciski pod nią) były na ekranie – ważne na małych telefonach
  const ruch = () => matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
  function widocznaKarta() {
    if (root.closest('[hidden]')) return;
    const el = obszar.querySelector('.fiszka, .pytanie-duze, .sluchaj') || obszar;
    const r = el.getBoundingClientRect();
    if (r.top < 0 || r.bottom > innerHeight - 170) el.scrollIntoView({ block: 'start', behavior: ruch() });
  }
  const pytanie = () => { const { x, k } = S.karta; return k === 'es' ? tekstEs(x) : x.pl; };
  const odpowiedz = () => { const { x, k } = S.karta; return k === 'es' ? x.pl : tekstEs(x); };

  function szczegoly(x) {
    const cz = [];
    if (x.rodzaj) cz.push(`<span class="chip">${RODZAJ[x.rodzaj]}</span>`);
    if (x.mnoga) cz.push(`<span class="chip">l. mn.: ${esc(x.mnoga)}</span>`);
    if (x.reg) cz.push(`<span class="chip chip--${x.reg}">${REJESTR[x.reg]}</span>`);
    if (x.latam) cz.push(`<span class="chip chip--wariant" title="${esc(x.latam.nota)}">${ust().wariant === 'latam' ? 'Hiszpania: ' + esc(x.es) : 'Ameryka Łac.: ' + esc(x.latam.es)}</span>`);
    let h = cz.length ? `<div class="chipy">${cz.join('')}</div>` : '';
    if (x.latam && x.latam.nota) h += `<p class="male">${esc(x.latam.nota)}</p>`;
    if (x.przyklad) {
      h += `<div class="przyklad"><p class="przyklad-es">${podswietl(x.przyklad.es)} ${przyciskGlosu(bezGwiazdek(x.przyklad.es), tr('Posłuchaj zdania', 'Escuchar la frase'))}</p><p class="przyklad-pl">${podswietl(x.przyklad.pl)}</p></div>`;
    }
    if (x.kiedy) h += `<p class="kiedy"><b>Kiedy:</b> ${esc(x.kiedy)}</p>`;
    if (x.dialog && x.dialog.length) {
      h += `<div class="dialog">${x.dialog.map(l => `<p class="kwestia kwestia--${l.kto === 'A' ? 'a' : 'b'}"><span>${l.kto}</span>${podswietl(l.tekst)}</p>`).join('')}
        ${przyciskGlosu(x.dialog.map(l => bezGwiazdek(l.tekst)).join(' '), 'Posłuchaj dialogu')}</div>`;
    }
    return h;
  }
  function naglowekKarty() {
    const { x, k } = S.karta;
    return `<div class="karta-gora"><small>${k === 'es' ? JEZ_CEL : JEZ_MOJ} · ${esc(x.t)}</small>
      <span class="karta-gora-akcje">${przyciskGwiazdki(x.id, app.stan.ulub[x.id])}</span></div>`;
  }
  function podpowiedz() {
    const { x, k } = S.karta, odp = odpowiedz();
    const czesci = [];
    if (k === 'pl') {
      if (x.rodzaj) czesci.push(`${RODZAJ[x.rodzaj]} (${odp.split(' ')[0]} …)`);
      const rdzen = bezRodzajnika(odp);
      if (S.karta.podp >= 2) czesci.push(tr(`zaczyna się na „${rdzen.slice(0, 2)}”, ${rdzen.replace(/[ ¿?¡!.,]/g, '').length} liter`, `empieza por «${rdzen.slice(0, 2)}», ${rdzen.replace(/[ ¿?¡!.,]/g, '').length} letras`));
      else czesci.push(tr(`pierwsza litera: „${rdzen[0]}”`, `primera letra: «${rdzen[0]}»`));
      if (S.karta.podp >= 3 && x.przyklad && /\*/.test(x.przyklad.es)) czesci.push(tr('w zdaniu: ', 'en la frase: ') + esc(x.przyklad.es.replace(/\*[^*]+\*/, '_____')));
    } else {
      czesci.push(tr(`pierwsza litera: „${odp[0]}”`, `primera letra: «${odp[0]}»`));
      if (S.karta.podp >= 2 && x.przyklad) czesci.push(tr('zdanie: ', 'frase: ') + esc(bezGwiazdek(x.przyklad.es)));
      if (S.karta.podp >= 2 && x.kiedy) czesci.push('kiedy: ' + esc(x.kiedy));
      if (S.karta.podp >= 3) czesci.push(`${tr('temat', 'tema')}: ${esc(x.t)}`);
    }
    return czesci.map(c => `<span>${c}</span>`).join('');
  }
  const przyciskPodp = () => `<button type="button" class="btn btn--male btn--cichy" data-podp>${IKONY.podpowiedz}<span>${tr('Podpowiedź', 'Pista')}</span></button>`;
  const przyciskiGlosu = x => `<span class="glosy">${przyciskGlosu(tekstEs(x))}<button type="button" class="glos" data-wolno aria-label="${tr('Posłuchaj wolniej', 'Escuchar más despacio')}">${IKONY.wolno}</button></span>`;

  // 1) fiszka
  function rysujFiszke() {
    const { x } = S.karta;
    obszar.innerHTML = `${naglowekKarty()}
      <button type="button" class="fiszka" data-odkryj aria-label="${tr('Odkryj odpowiedź (spacja). Przesuń w prawo: umiem, w lewo: jeszcze nie', 'Ver la respuesta (espacio). Desliza a la derecha: lo sé; a la izquierda: todavía no')}">
        <b class="fiszka-slowo">${esc(pytanie())}</b>
        <span class="fiszka-odp" data-odp hidden>${esc(odpowiedz())}</span>
        <span class="fiszka-znak fiszka-znak--p" aria-hidden="true">✓</span><span class="fiszka-znak fiszka-znak--l" aria-hidden="true">↺</span>
      </button>
      ${ust().skala === 4 ? `<div class="oceny oceny--4" data-oceny hidden>${przyciskiOcen()}</div>` : `<div class="gesty" data-oceny>${przyciskiOcen()}</div>`}
      <div class="karta-narzedzia">${przyciskPodp()}${przyciskiGlosu(x)}</div>
      <div class="podpowiedz" data-podp-tekst hidden></div>
      <div class="szczegoly" data-szcz hidden>${szczegoly(x)}</div>`;
  }
  function odkryj() {
    if (!S.karta || S.karta.odkryta || tryb() !== 'fiszka') return;
    S.karta.odkryta = true;
    $('[data-odp]', obszar).hidden = false; $('[data-szcz]', obszar).hidden = false; $('[data-oceny]', obszar).hidden = false;
    $('.fiszka', obszar).classList.add('odkryta');
    $('.fiszka', obszar).scrollIntoView({ block: 'nearest', behavior: ruch() });
    if (ust().auto && S.karta.k === 'pl') app.mowa.powiedz(tekstEs(S.karta.x));
    const pierwszy = $('[data-ocena]', obszar); if (pierwszy && matchMedia('(pointer: fine)').matches) pierwszy.focus({ preventScroll: true });
  }
  function przyciskiOcen() {
    if (ust().skala === 4) {
      return [[1, tr('Nie wiem', 'No lo sé'), 'zle'], [2, tr('Trudne', 'Difícil'), 'trudne'], [3, tr('Dobrze', 'Bien'), 'dobrze'], [4, tr('Łatwe', 'Fácil'), 'latwe']]
        .map(([v, n, c], i) => `<button type="button" class="ocena ocena--${c}" data-ocena="${v}"><kbd>${i + 1}</kbd>${n}</button>`).join('');
    }
    // skala 2: tylko dyskretne podpowiedzi gestów (też klikalne i pod klawiszami 1 / 2)
    return `<button type="button" class="gest gest--l" data-ocena="1" aria-label="${tr('Jeszcze nie (klawisz 1)', 'Todavía no (tecla 1)')}"><span aria-hidden="true">←</span> ${tr('jeszcze nie', 'todavía no')}</button>
      <span class="gest-srodek" aria-hidden="true">${tr('stuknij, by odwrócić', 'toca para girar')}</span>
      <button type="button" class="gest gest--p" data-ocena="3" aria-label="${tr('Umiem (klawisz 2)', 'Lo sé (tecla 2)')}">${tr('umiem', 'lo sé')} <span aria-hidden="true">→</span></button>`;
  }

  // 2) wpisywanie
  function rysujWpisz() {
    const { x, k } = S.karta;
    obszar.innerHTML = `${naglowekKarty()}
      <div class="pytanie-duze">${esc(pytanie())}</div>
      <form class="pole-odp" data-form autocomplete="off">
        <input class="pole" data-wpis type="text" placeholder="${k === 'es' ? tr('wpisz po polsku', 'escribe en español') : tr('wpisz po hiszpańsku', 'escribe en polaco')}" autocapitalize="off" autocorrect="off" spellcheck="false" ${k === 'pl' ? `data-znaki lang="${LANG_CEL}"` : `lang="${LANG_MOJ}"`} aria-label="${tr('Twoja odpowiedź', 'Tu respuesta')}">
        <button type="submit" class="btn btn--akcent" data-sprawdz>${tr('Sprawdź', 'Comprobar')}</button>
      </form>
      <div class="podpowiedz" data-podp-tekst hidden></div>
      <div class="wiersz">${przyciskPodp()}<button type="button" class="btn btn--male btn--cichy" data-niewiem>${tr('Nie wiem', 'No lo sé')}</button>${k === 'es' ? przyciskiGlosu(x) : ''}</div>
      <div class="wynik" data-wynik hidden></div>
      <div class="szczegoly" data-szcz hidden>${szczegoly(x)}</div>`;
    setTimeout(() => { const i = $('[data-wpis]', obszar); if (i && matchMedia('(pointer: fine)').matches) i.focus(); }, 30);
  }
  function sprawdzWpis(niewiem = false) {
    if (S.karta.odpowiedziano) return dalej();
    const { x, k } = S.karta;
    const wpis = $('[data-wpis]', obszar).value;
    if (!niewiem && !wpis.trim()) { $('[data-wpis]', obszar).focus(); return; }
    const dobre = k === 'es' ? [x.pl] : odpowiedziEs(x);
    const r = niewiem ? { wynik: 'zle', wzor: dobre[0], akcenty: [] } : sprawdz(wpis, dobre);
    const ocena = ocenaZWyniku(r.wynik);
    pokazWynik(r.wynik !== 'zle', komunikat(r, odpowiedz()) + (r.akcenty.length ? `<br><span class="male">${tr('Twój zapis', 'Lo que escribiste')}: ${wpisZAkcentami(czysc(wpis), r.akcenty)}</span>` : ''), r.wynik === 'dobrze' ? 'ok' : r.wynik === 'zle' ? 'zle' : 'uwaga');
    $('[data-wpis]', obszar).classList.add(r.wynik === 'zle' ? 'zle' : 'ok');
    $('[data-sprawdz]', obszar).textContent = tr('Dalej', 'Siguiente');
    zapiszOcene(ocena);
    app.mowa.powiedz(tekstEs(x));
  }
  function pokazWynik(ok, html, klasa) {
    S.karta.odpowiedziano = true;
    const w = $('[data-wynik]', obszar);
    w.hidden = false; w.className = 'wynik wynik--' + klasa; w.innerHTML = html;
    $('[data-szcz]', obszar).hidden = false;
    if (!$('[data-dalej]', obszar) && !$('[data-sprawdz]', obszar)) w.insertAdjacentHTML('afterend', '<button type="button" class="btn btn--akcent btn--szeroki" data-dalej>' + tr('Dalej', 'Siguiente') + ' <kbd>Enter</kbd></button>');
  }

  // 3) wybór wielokrotny (też w trybie słuchania: wybór znaczenia)
  function rysujWybor(sluch) {
    const { x, k } = S.karta;
    const pole = sluch || k === 'es' ? 'pl' : 'es';
    if (!S.karta.opcje) {
      const d = dystraktory(x, cfg.pelnaPula(), pole);
      S.karta.opcje = tasuj([x, ...d]);
    }
    const tekstOpcji = y => pole === 'es' ? tekstEs(y) : y.pl;
    obszar.innerHTML = `${naglowekKarty()}
      ${sluch ? `<div class="sluchaj"><button type="button" class="btn btn--akcent btn--duzy" data-mow="${esc(tekstEs(x))}">${IKONY.glos}<span>${tr('Odtwórz', 'Reproducir')}</span></button><button type="button" class="btn" data-wolno>${IKONY.wolno}<span>${tr('Wolniej', 'Más lento')}</span></button></div><p class="male srodek">${tr('Co słyszysz? Wybierz znaczenie.', '¿Qué oyes? Elige el significado.')}</p>`
      : `<div class="pytanie-duze">${esc(pytanie())}</div>`}
      <div class="opcje" data-opcje>${S.karta.opcje.map((y, i) => `<button type="button" class="opcja" data-opcja="${esc(y.id)}"><kbd>${i + 1}</kbd><span>${esc(tekstOpcji(y))}</span></button>`).join('')}</div>
      <div class="wynik" data-wynik hidden></div>
      <div class="szczegoly" data-szcz hidden>${sluch ? `<p class="pytanie-sr">${esc(tekstEs(x))}</p>` : ''}${szczegoly(x)}</div>`;
  }
  function wybierz(id) {
    if (S.karta.odpowiedziano) return;
    const { x } = S.karta, ok = id === x.id;
    obszar.querySelectorAll('[data-opcja]').forEach(b => {
      b.disabled = true;
      if (b.dataset.opcja === x.id) b.classList.add('ok');
      else if (b.dataset.opcja === id) b.classList.add('zle');
    });
    pokazWynik(ok, ok ? tr('¡Correcto!', 'Dobrze! ¡Correcto!') : `${tr('Poprawnie', 'Correcto')}: ${esc(odpowiedz())}`, ok ? 'ok' : 'zle');
    zapiszOcene(ok ? 3 : 1);
    if (tryb() !== 'sluchanie') app.mowa.powiedz(tekstEs(x));
  }

  // 4) słuchanie
  function rysujSluchanie() {
    if (!app.mowa.dostepna || !app.mowa.maGlosHiszpanski) {
      obszar.innerHTML = tr(`<div class="ostrzezenie"><p><b>Brak hiszpańskiego głosu w tej przeglądarce.</b></p>
        <p class="male">Na iPhonie: Ustawienia → Dostępność → Treść mówiona → Głosy → Hiszpański. Na Androidzie: Ustawienia → Zamiana tekstu na mowę → zainstaluj język hiszpański. Potem odśwież stronę.</p>
        <button type="button" class="btn btn--akcent" data-tryb-zapas>Ćwicz w trybie Wybór</button></div>`, `<div class="ostrzezenie"><p><b>Este navegador no tiene voz en polaco.</b></p>
        <p class="male">iPhone: Ajustes → Accesibilidad → Contenido leído → Voces → Polaco. Android: Ajustes → Síntesis de voz → instala el polaco. Después recarga la página.</p>
        <button type="button" class="btn btn--akcent" data-tryb-zapas>Practicar en modo Elegir</button></div>`);
      return;
    }
    const pod = ui[cfg.rodzaj + 'Sluch'] || 'wybor';
    if (pod === 'wybor') { rysujWybor(true); dopiszPrzelacznikSluchu(pod); return; }
    const { x } = S.karta;
    obszar.innerHTML = `${naglowekKarty()}
      <div class="sluchaj"><button type="button" class="btn btn--akcent btn--duzy" data-mow="${esc(tekstEs(x))}">${IKONY.glos}<span>${tr('Odtwórz', 'Reproducir')}</span></button><button type="button" class="btn" data-wolno>${IKONY.wolno}<span>${tr('Wolniej', 'Más lento')}</span></button></div>
      <p class="male srodek">${tr('Wpisz po hiszpańsku, co słyszysz.', 'Escribe en polaco lo que oyes.')}</p>
      <form class="pole-odp" data-form-sluch autocomplete="off">
        <input class="pole" data-wpis type="text" placeholder="${tr('co słyszysz?', '¿qué oyes?')}" autocapitalize="off" autocorrect="off" spellcheck="false" data-znaki lang="${LANG_CEL}" aria-label="${tr('Co słyszysz', 'Lo que oyes')}">
        <button type="submit" class="btn btn--akcent" data-sprawdz>${tr('Sprawdź', 'Comprobar')}</button>
      </form>
      <div class="wynik" data-wynik hidden></div>
      <div class="szczegoly" data-szcz hidden><p class="pytanie-sr">${esc(tekstEs(x))} – ${esc(x.pl)}</p>${szczegoly(x)}</div>`;
    dopiszPrzelacznikSluchu(pod);
  }
  function dopiszPrzelacznikSluchu(pod) {
    obszar.insertAdjacentHTML('afterbegin', `<div class="seg seg--maly" role="group" aria-label="${tr('Rodzaj ćwiczenia ze słuchu', 'Tipo de ejercicio de escucha')}">
      <button type="button" data-sluch="wybor" aria-pressed="${pod === 'wybor'}">${tr('Wybierz znaczenie', 'Elige el significado')}</button><button type="button" data-sluch="wpisz" aria-pressed="${pod === 'wpisz'}">${tr('Wpisz, co słyszysz', 'Escribe lo que oyes')}</button></div>`);
  }
  function sprawdzSluch() {
    if (S.karta.odpowiedziano) return dalej();
    const { x } = S.karta, wpis = $('[data-wpis]', obszar).value;
    if (!wpis.trim()) return;
    const r = sprawdz(wpis, odpowiedziEs(x));
    pokazWynik(r.wynik !== 'zle', komunikat(r, tekstEs(x)), r.wynik === 'dobrze' ? 'ok' : r.wynik === 'zle' ? 'zle' : 'uwaga');
    $('[data-sprawdz]', obszar).textContent = tr('Dalej', 'Siguiente');
    zapiszOcene(ocenaZWyniku(r.wynik));
  }

  // --- ocena i przejście dalej ---
  function zapiszOcene(ocena) {
    const { x } = S.karta;
    app.ocen(x.id, ocena);
    S.razy[x.id] = (S.razy[x.id] || 0) + 1;
    S.ocenione++;
    if (ocena >= 2) S.dobrze++; else S.bledy.set(x.id, (S.bledy.get(x.id) || 0) + 1);
    const id = S.kolejka.shift();
    S.kolejka = poOcenie(S.kolejka, id, ocena, S.razy);
    pozycja();
  }
  function ocenFiszke(v) {
    if (!S.karta.odkryta) { if (v <= 1) { odkryj(); return; } }
    zapiszOcene(v);
    nastepna();
  }
  function dalej() { if (S.karta && S.karta.odpowiedziano) nastepna(); }

  function podsumowanie() {
    S.koniec = true;
    $('[data-postep]', root).style.width = '100%';
    $('[data-pozycja]', root).textContent = tr('Sesja zakończona', 'Sesión terminada');
    const ids = Object.keys(S.startStatus);
    const opanowane = ids.filter(id => status(app.stan.srs[id]) === 'opanowane' && S.startStatus[id] !== 'opanowane').length;
    const nauczone = ids.filter(id => S.startStatus[id] === 'nowe' && (app.stan.srs[id] || {}).ok > 0).length;
    const trudne = [...S.bledy.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([id, n]) => ({ x: app.dane.get(id), n })).filter(t => t.x);
    const proc = S.ocenione ? Math.round(100 * S.dobrze / S.ocenione) : 0;
    obszar.innerHTML = `<div class="podsumowanie">
      <p class="etykieta">${tr('Podsumowanie sesji', 'Resumen de la sesión')}</p>
      <div class="liczby">
        <div><b>${S.ocenione}</b><span>${tr('odpowiedzi', 'respuestas')}</span></div>
        <div><b>${proc}%</b><span>${tr('poprawnych', 'correctas')}</span></div>
        <div><b>${nauczone}</b><span>${tr('nowych poznanych', 'nuevas aprendidas')}</span></div>
        <div><b>${opanowane}</b><span>${tr('nowo opanowanych', 'nuevas dominadas')}</span></div>
      </div>
      ${trudne.length ? `<p class="etykieta">${tr('Najwięcej trudności', 'Lo más difícil')}</p><ul class="lista lista--zwarta">${trudne.map(({ x, n }) => `<li><div class="lista-tekst"><b>${esc(tekstEs(x))}</b><span>${esc(x.pl)}</span></div><span class="znacznik znacznik--nauka">${n}× ${tr('błąd', 'error')}</span>${przyciskGlosu(tekstEs(x))}</li>`).join('')}</ul>` : `<p class="srodek">${tr('Bez ani jednego błędu. ¡Enhorabuena!', '¡Ni un solo error! Brawo!')}</p>`}
      <div class="akcje-pion">
        ${trudne.length ? `<button type="button" class="btn btn--akcent btn--szeroki" data-bledne>${tr('Ćwicz tylko błędne z tej sesji', 'Practicar solo los errores')}</button>` : ''}
        <button type="button" class="btn btn--szeroki" data-nowa>${tr('Kolejna sesja', 'Otra sesión')}</button>
      </div></div>`;
    app.odswiez();
    if (S.ocenione) toast(tr(`Sesja zakończona: ${S.ocenione} odpowiedzi, ${proc}% poprawnych.`, `Sesión terminada: ${S.ocenione} respuestas, ${proc} % correctas.`));
  }

  // --- gest na fiszce: przesunięcie w prawo = umiem, w lewo = jeszcze nie (najpierw odsłania odpowiedź) ---
  let gest = null, pominKlik = 0;
  obszar.addEventListener('pointerdown', e => {
    const f = e.target.closest('.fiszka');
    if (!f || tryb() !== 'fiszka' || e.button) return;
    gest = { id: e.pointerId, x0: e.clientX, y0: e.clientY, f, ruch: false, dx: 0 };
  });
  obszar.addEventListener('pointermove', e => {
    if (!gest || e.pointerId !== gest.id) return;
    const dx = e.clientX - gest.x0, dy = e.clientY - gest.y0;
    if (!gest.ruch) {
      if (Math.abs(dx) < 10) return;
      if (Math.abs(dy) > Math.abs(dx)) { gest = null; return; }
      gest.ruch = true; gest.f.classList.add('ciagnieta');
      try { gest.f.setPointerCapture(e.pointerId); } catch (err) { /* stara przeglądarka */ }
    }
    gest.dx = dx;
    gest.f.style.transform = `translateX(${dx}px) rotate(${(dx / 22).toFixed(2)}deg)`;
    gest.f.classList.toggle('w-prawo', dx > 50); gest.f.classList.toggle('w-lewo', dx < -50);
  });
  const koniecGestu = e => {
    if (!gest || e.pointerId !== gest.id) return;
    const g = gest; gest = null;
    if (!g.ruch) return;
    pominKlik = performance.now() + 400;
    g.f.classList.remove('ciagnieta', 'w-prawo', 'w-lewo');
    const wyrzuc = kier => new Promise(r => {
      g.f.style.transition = 'transform .28s cubic-bezier(.32,.72,0,1), opacity .28s';
      g.f.style.transform = `translateX(${kier * 120}%) rotate(${kier * 14}deg)`; g.f.style.opacity = '0';
      setTimeout(r, 230);
    });
    if (g.dx > 90) wyrzuc(1).then(() => ocenFiszke(3));
    else if (g.dx < -90 && S.karta.odkryta) wyrzuc(-1).then(() => ocenFiszke(1));
    else { g.f.style.transform = ''; if (g.dx < -90) odkryj(); }
  };
  obszar.addEventListener('pointerup', koniecGestu);
  obszar.addEventListener('pointercancel', e => { if (gest && gest.ruch) gest.f.style.transform = ''; gest = null; });

  // --- zdarzenia ---
  root.addEventListener('click', e => {
    const t = e.target;
    if (t.closest('[data-odkryj]')) { if (performance.now() < pominKlik) return; return odkryj(); }
    const oc = t.closest('[data-ocena]'); if (oc) return ocenFiszke(+oc.dataset.ocena);
    const op = t.closest('[data-opcja]'); if (op) return wybierz(op.dataset.opcja);
    if (t.closest('[data-dalej]')) return dalej();
    if (t.closest('[data-niewiem]')) return sprawdzWpis(true);
    if (t.closest('[data-wolno]')) return app.mowa.powiedz(tekstEs(S.karta.x), { wolniej: true });
    if (t.closest('[data-podp]')) {
      S.karta.podp = Math.min(3, S.karta.podp + 1);
      const p = $('[data-podp-tekst]', obszar); p.hidden = false; p.innerHTML = podpowiedz(); return;
    }
    const sl = t.closest('[data-sluch]');
    if (sl) { ui[cfg.rodzaj + 'Sluch'] = sl.dataset.sluch; app.zapisz(); S.karta.opcje = null; rysujSluchanie(); return; }
    if (t.closest('[data-tryb-zapas]')) { ui[trybKey] = 'wybor'; app.zapisz(); rysujPrzelaczniki(); nowaKarta(S.karta.x); return; }
    if (t.closest('[data-bledne]')) return start([...S.bledy.keys()].map(id => app.dane.get(id)).filter(Boolean));
    if (t.closest('[data-nowa]')) return start();
  });
  root.addEventListener('submit', e => {
    e.preventDefault();
    if (e.target.matches('[data-form]')) sprawdzWpis();
    else if (e.target.matches('[data-form-sluch]')) sprawdzSluch();
  });

  // skróty klawiszowe (wywoływane z main.js, gdy ta zakładka jest aktywna)
  function klawisz(e) {
    if (!S.karta || S.koniec) { if (e.key === 'Enter') { start(); return true; } return false; }
    const t = tryb(), n = parseInt(e.key, 10);
    if (e.key === ' ') {
      if (t === 'fiszka' && !S.karta.odkryta) odkryj(); else app.mowa.powiedz(tekstEs(S.karta.x));
      return true;
    }
    if (n >= 1 && n <= 4) {
      if (t === 'fiszka' && (S.karta.odkryta || ust().skala !== 4)) { const b = obszar.querySelectorAll('[data-ocena]')[n - 1]; if (b) ocenFiszke(+b.dataset.ocena); return true; }
      if ((t === 'wybor' || t === 'sluchanie') && S.karta.opcje) { const b = obszar.querySelectorAll('[data-opcja]')[n - 1]; if (b) wybierz(b.dataset.opcja); return true; }
    }
    if (e.key === 'Enter' && S.karta.odpowiedziano) { dalej(); return true; }
    return false;
  }

  rysujPrzelaczniki();
  function cwiczJeden(x) {
    start([x]);
    // fokus na kartę, żeby spacja / cyfry działały od razu (a nie ponownie klikały pozycję listy)
    const cel = obszar.querySelector('.fiszka, [data-wpis], .opcja, [data-mow]');
    if (cel) cel.focus({ preventScroll: true });
  }
  return { start, cwiczJeden, klawisz, odswiezOpcje: rysujPrzelaczniki, aktywna: () => !!S.karta && !S.koniec };
}
