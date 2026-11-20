// Rok w stopce
document.getElementById('year').textContent = new Date().getFullYear();

// Menu mobilne
const burger = document.getElementById('burger');
const nav = document.getElementById('nav');
const setMenu = open => {
  nav.classList.toggle('is-open', open);
  burger.setAttribute('aria-expanded', open);
  document.body.classList.toggle('menu-open', open); // blokuje przewijanie strony pod menu
};
burger.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));

// Dolny pasek na telefonie (szklany suwak, pasek.js): widoczny cały czas (decyzja klienta 15.11;
// przyciski w hero są na telefonie schowane). Chowa się tylko przy otwartym czacie (wiadomosci.css).
// Klasa is-visible po wczytaniu: pasek wjeżdża od dołu (przejście transform w style.css).
const quickbar = document.getElementById('quickbar');
const hero = document.querySelector('.hero');      // używane też niżej (animacje przewijania)
requestAnimationFrame(() => quickbar.classList.add('is-visible'));

// Zdjęcia: jeśli plik istnieje, chowamy podpis-placeholder.
// Gdy pliku jeszcze nie ma, a element ma data-sample, wstawiamy zdjęcie przykładowe
// (darmowe zdjęcia z Unsplash). Prawdziwy plik pod tą samą nazwą zawsze ma pierwszeństwo.
// Zdjęcia w hero ładują się od razu, pozostałe dopiero, gdy sekcja jest ok. półtora ekranu
// od widoku (mniej danych na starcie, hero pojawia się szybciej). Zdjęcie pokazujemy dopiero
// po zdekodowaniu (img.decode), żeby Safari nie dekodował go w trakcie przewijania.
// Na telefonie lżejsza wersja (data-tel): duże zdjęcie z sekcji „Każdy kadr” to pionowy wycinek w pełnej
// rozdzielczości (na telefonie i tak widać tylko taki), „O mnie” w rozmiarze ekranu. Mniej pamięci = Safari
// rzadziej gubi zdjęcie przy szybkim przewijaniu (film 16.11, 01:50: zielone pole zamiast zdjęcia).
const phonePhotos = matchMedia('(max-width: 760px)').matches;
const loadPhoto = fig => {
  let m = (fig.getAttribute('style') || '').match(/url\(['"]?([^'")]+)/);
  if (!m) return;
  fig.dataset.full = m[1];                   // powiększenie (lightbox) zawsze w pełnej jakości
  if (phonePhotos && fig.dataset.tel) {
    m = [null, fig.dataset.tel];
    if (fig.dataset.telPos) fig.style.setProperty('--pos', fig.dataset.telPos);
  }
  // w HTML plik jest w --plik (nieużywanym przez CSS, więc przeglądarka go sama nie pobiera);
  // --img, którego używa tło .photo, ustawiamy dopiero po wczytaniu
  const show = src => { fig.style.setProperty('--img', `url('${src}')`); fig.classList.add('has-img'); fig.dataset.src = src; };
  const ready = (im, src) => (im.decode ? im.decode() : Promise.resolve()).catch(() => {}).then(() => show(src));
  const img = new Image();
  img.onload = () => ready(img, m[1]);
  img.onerror = () => {
    const sample = fig.dataset.sample;
    if (!sample) return;
    const s = new Image();
    s.onload = () => ready(s, sample);
    s.src = sample;
  };
  img.src = m[1];
};
// Zdjęcia strony podmienione w panelu (19.11, Strona → Portfolio → „Zdjęcia na stronie”): miejsce = nazwa pliku z img/
// (hero, hero-2, o-mnie, duze, galeria/1-10). Ostatnio znane podmiany są w pamięci przeglądarki, więc nowe zdjęcie
// wchodzi od razu, bez mignięcia starego; strona-dane.js po pobraniu /api/strona woła JKFZdjecia.ustaw().
// Gdy podmienione zdjęcie się nie wczyta, wraca oryginał z img/ (data-sample).
const zdjeciaPanel = (() => { try { return JSON.parse(localStorage.getItem('jkf-zdjecia') || '{}'); } catch (e) { return {}; } })();
function podmienZdjecie(fig, mapa) {
  if (!fig.dataset.miejsce) {
    const m = (fig.getAttribute('style') || '').match(/--plik:\s*url\(['"]?img\/([\w\/-]+)\.jpg/);
    if (!m) return false;
    Object.assign(fig.dataset, { miejsce: m[1], orgPlik: `img/${m[1]}.jpg`, orgTel: fig.dataset.tel || '', orgSample: fig.dataset.sample || '' });
  }
  const w = mapa[fig.dataset.miejsce], m = fig.dataset.miejsce;
  const plik = w ? `/api/zdjecie-strony?m=${m}&v=pod&w=${w}` : fig.dataset.orgPlik;
  if ((fig.getAttribute('style') || '').includes(plik)) return false;
  fig.style.setProperty('--plik', `url('${plik}')`);
  if (w) { fig.dataset.tel = `/api/zdjecie-strony?m=${m}&v=min&w=${w}`; fig.dataset.sample = fig.dataset.orgPlik; }
  else { if (fig.dataset.orgTel) fig.dataset.tel = fig.dataset.orgTel; else delete fig.dataset.tel; if (fig.dataset.orgSample) fig.dataset.sample = fig.dataset.orgSample; else delete fig.dataset.sample; }
  return true;
}
document.querySelectorAll('.photo').forEach(fig => podmienZdjecie(fig, zdjeciaPanel));
window.JKFZdjecia = {
  ustaw(mapa) {
    try { localStorage.setItem('jkf-zdjecia', JSON.stringify(mapa || {})); } catch (e) { /* tryb prywatny */ }
    document.querySelectorAll('.photo[data-miejsce]').forEach(fig => {
      if (podmienZdjecie(fig, mapa || {}) && fig.classList.contains('has-img')) loadPhoto(fig);   // już widoczne - wczytaj nowe
    });
  },
};
const lazyPhotos = new IntersectionObserver(entries => entries.forEach(e => {
  if (!e.isIntersecting) return;
  lazyPhotos.unobserve(e.target);
  loadPhoto(e.target);
}), { rootMargin: '150% 0px' });
document.querySelectorAll('.photo').forEach(fig => {
  if (fig.closest('.hero')) loadPhoto(fig);
  else lazyPhotos.observe(fig);
});

// Filtry galerii (19.11: zdjęcia mogą dochodzić z panelu - strona-dane.js - więc lista liczona przy każdym użyciu)
const filters = document.querySelectorAll('.filter');
const galeriaZdjecia = () => document.querySelectorAll('#gallery .photo');
// Filtr bez żadnego zdjęcia w swojej kategorii chowamy (np. brak zdjęć z komunii)
function odswiezFiltry() {
  const items = [...galeriaZdjecia()];
  filters.forEach(btn => {
    const f = btn.dataset.filter;
    btn.hidden = f !== 'all' && !items.some(it => it.dataset.cat === f);
  });
}
odswiezFiltry();
filters.forEach(btn => btn.addEventListener('click', () => {
  filters.forEach(b => b.classList.remove('is-active'));
  btn.classList.add('is-active');
  const f = btn.dataset.filter;
  galeriaZdjecia().forEach(it => it.classList.toggle('is-hidden', f !== 'all' && it.dataset.cat !== f));
}));

// Lightbox (działa tylko dla wgranych zdjęć)
const lb = document.createElement('div');
lb.className = 'lightbox';
lb.innerHTML = '<button aria-label="Zamknij">×</button><img alt="">';
document.body.appendChild(lb);
const lbImg = lb.querySelector('img');
document.getElementById('gallery')?.addEventListener('click', e => {
  const it = e.target.closest('.photo');
  if (!it || !it.dataset.src) return;
  // pełna wersja, jeśli istnieje (na telefonie w siatce jest lżejsza); przy błędzie wraca wersja z siatki
  lbImg.onerror = () => { lbImg.onerror = null; lbImg.src = it.dataset.src; };
  lbImg.src = it.dataset.full && it.dataset.src.indexOf('unsplash') < 0 ? it.dataset.full : it.dataset.src;
  lb.classList.add('is-open');
});
lb.addEventListener('click', e => { if (e.target !== lbImg) lb.classList.remove('is-open'); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') lb.classList.remove('is-open'); });

// zdjęcia dokładane do galerii z panelu (strona-dane.js): wczytanie, filtr, pojawianie się
window.JKFGaleria = {
  dodaj(fig) {
    const aktywny = document.querySelector('.filter.is-active');
    const f = aktywny ? aktywny.dataset.filter : 'all';
    fig.classList.toggle('is-hidden', f !== 'all' && fig.dataset.cat !== f);
    lazyPhotos.observe(fig);
    if (window.__jkfIo && !matchMedia('(prefers-reduced-motion: reduce)').matches) { fig.classList.add('reveal'); window.__jkfIo.observe(fig); }
    odswiezFiltry();
  },
};

// (Formularz kontaktowy usunięty 15.11: zapytania o termin przyjmuje czat w kapsułce wiadomości.)

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Animacja pojawiania się: kolejne elementy w tej samej grupie startują z opóźnieniem (--d)
const io = new IntersectionObserver(entries => entries.forEach(en => {
  if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
}), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
window.__jkfIo = io;
document.querySelectorAll('.section__head, .kal, .card, .about > *, .plan, .quotes blockquote, .steps li, .contact > *, .gallery .photo, .filters')
  .forEach(el => {
    const siblings = [...el.parentElement.children];
    el.style.setProperty('--d', `${(siblings.indexOf(el) % 6) * 0.08}s`);
    el.classList.add('reveal');
    io.observe(el);
  });

// Manifest: każde słowo w osobnym <span>, żeby zapalać je po kolei
const statement = document.getElementById('statement');
const words = [];
let litCount = -1;
function splitStatement() {
  words.length = 0;
  litCount = -1;
  [...statement.childNodes].forEach(node => {
    const gold = node.nodeType === 1;                     // <em> = słowa złote
    node.textContent.split(/(\s+)/).forEach(part => {
      if (!part.trim()) { statement.appendChild(document.createTextNode(part)); return; }
      const s = document.createElement('span');
      s.className = 'w' + (gold ? ' gold' : '');
      s.textContent = part;
      statement.appendChild(s);
      words.push(s);
    });
    node.remove();
  });
}
splitStatement();
// po zmianie języka i18n.js podmienia tekst manifestu - dzielimy go na słowa od nowa
document.addEventListener('jkf:language', () => {
  splitStatement();
  if (typeof onScroll === 'function') onScroll();
});

// Animacje sterowane przewijaniem (hero, manifest, zoom, szklany nagłówek)
const topbar = document.querySelector('.topbar');
const scrollers = [...document.querySelectorAll('[data-scroll]')];
const clamp = v => Math.min(1, Math.max(0, v));
let ticking = false;
const varCache = new WeakMap();
function setVar(el, name, value) {
  let c = varCache.get(el);
  if (!c) varCache.set(el, c = {});
  if (c[name] !== value) { c[name] = value; el.style.setProperty(name, value); }
}

// Pozycje sekcji liczymy z góry (przy starcie, po wczytaniu i przy zmianie rozmiaru okna).
// Wcześniej skrypt w każdej klatce przewijania na przemian zapisywał style i czytał pozycje
// (offsetHeight, getBoundingClientRect), co zmuszało przeglądarkę do przeliczania układu
// strony kilka razy na klatkę - na iPhonie to było widać jako przycinanie.
let geo = { heroH: 1, vh: 1, secs: [] };
function measureGeo() {
  const sy = window.scrollY;
  geo = {
    heroH: hero.offsetHeight || 1,
    vh: window.innerHeight,
    secs: scrollers.map(sec => {
      const r = sec.getBoundingClientRect();
      return { top: r.top + sy, height: r.height };
    }),
  };
}
measureGeo();
window.addEventListener('load', () => { measureGeo(); onScroll(); });
if (document.fonts) document.fonts.ready.then(() => { measureGeo(); onScroll(); });

let scrolledState = null;
// Otwarty czat przypina stronę (wiadomosci.js, body position: fixed) - wtedy scrollY = 0,
// więc efekty przewijania stoją, żeby nic pod przyciemnionym tłem nie przeskoczyło.
const pageLocked = () => document.documentElement.classList.contains('is-chat-open');
function onScroll() {
  if (pageLocked()) { ticking = false; return; }
  const y = window.scrollY, vh = geo.vh;
  const scrolled = y > 30;
  if (scrolled !== scrolledState) { scrolledState = scrolled; topbar.classList.toggle('is-scrolled', scrolled); }

  // od tego miejsca tylko zapisy (bez odczytów układu); zmienne CSS tylko gdy wartość się zmieniła
  if (!reduceMotion) setVar(hero, '--hp', clamp(y / geo.heroH).toFixed(3));

  scrollers.forEach((sec, idx) => {
    const g = geo.secs[idx];
    const p = reduceMotion ? 1 : clamp((y - g.top) / (g.height - vh));   // 0 = początek sekcji, 1 = koniec
    setVar(sec, '--p', p.toFixed(3));
    if (sec.classList.contains('zoom')) {
      setVar(sec, '--z', clamp(p * 1.7).toFixed(3));          // zdjęcie rośnie w 60% drogi
      setVar(sec, '--c', clamp((p - 0.6) * 3.5).toFixed(3));  // potem wjeżdża podpis
    }
    if (sec.classList.contains('statement')) {
      const lit = Math.round(clamp(p * 1.25) * words.length);
      if (lit !== litCount) { litCount = lit; words.forEach((w, i) => w.classList.toggle('on', i < lit)); }
    }
  });
  ticking = false;
}
window.addEventListener('scroll', () => {
  if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
}, { passive: true });
window.addEventListener('resize', () => { if (!pageLocked()) { measureGeo(); onScroll(); } });
onScroll();

// Po odświeżeniu zawsze od góry. Safari na iPhonie potrafi przywrócić pozycję dopiero
// po wczytaniu strony, więc ustawiamy górę jeszcze raz po zdarzeniu load.
// behavior: 'instant', bo strona ma scroll-behavior: smooth i inaczej by „zjeżdżała”.
window.addEventListener('load', () => window.scrollTo({ top: 0, left: 0, behavior: 'instant' }));
window.addEventListener('pageshow', e => {
  // powrót z pamięci podręcznej (np. przycisk Wstecz) zostawiamy w spokoju - to nie odświeżenie
  if (!e.persisted) window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
});

// Dynamiczna wyspa języków: komponent z jezyki.js, tłumaczenia z i18n.js
const langRoot = document.getElementById('lang-switcher');
if (langRoot && window.createLanguageIsland && window.I18N) {
  const langIsland = createLanguageIsland(langRoot, {
    languages: I18N.LANGUAGES,
    value: I18N.lang,
    onChange: code => I18N.set(code),
  });
  // gdy język zmieni się w inny sposób (np. z kodu), kapsułka pokazuje aktualny
  document.addEventListener('jkf:language', e => langIsland && langIsland.setValue(e.detail.lang));

  // Kółko języków i dynamiczna wyspa jak podzielona wyspa w iPhonie:
  // - otwieranie menu: kółko przyspiesza w stronę prawego końca wyspy, maleje i „wlewa się” w nią,
  // - zamykanie: gdy wyspa jest już prawie pigułką, kółko wyskakuje z jej prawego końca,
  //   rozciąga się jak kropla i ze sprężystym dociągnięciem wraca na swoje miejsce.
  // Animowane są tylko transform i opacity (płynnie także w Safari).
  const reduceLang = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const islandPill = document.querySelector('.island__pill');
  const langToggle = langRoot.querySelector('.lang__toggle');
  let langAnims = [], langTimer = 0;
  const stopLangAnims = () => { clearTimeout(langTimer); langAnims.forEach(a => a.cancel()); langAnims = []; };

  // wektor od środka kółka do prawego końca wyspy (pigułka ma stały rozmiar, więc pomiar jest stały)
  function mergeVector() {
    const I = islandPill.getBoundingClientRect(), L = langRoot.getBoundingClientRect();
    const tx = I.right - I.height / 2, ty = I.top + I.height / 2;
    return { dx: tx - (L.left + L.width / 2), dy: ty - (L.top + L.height / 2) };
  }

  // Ruch rozdzielony na dwa elementy: kontener dostaje tylko transform, a przezroczystość
  // dostaje samo szkło (.lang__shape). Przezroczystość na kontenerze odcina rozmycie tła
  // (szkło widzi wtedy tylko pustą warstwę), więc kółko na chwilę stawało się ciemną kulką.
  const langShape = langRoot.querySelector('.lang__shape');
  const move = (frames, opt) => [
    langRoot.animate(frames.map(({ opacity, ...f }) => f), opt),
    langShape.animate(frames.map(({ transform, ...f }) => f), opt),
  ];

  document.addEventListener('jkf:island', e => {
    const { open, closeMs } = e.detail;
    if (langIsland) langIsland.close();
    stopLangAnims();                               // pomiar bez transformacji z poprzedniego ruchu
    const { dx, dy } = mergeVector();
    const at = (k, s, o) => ({ transform: `translate(${(dx * k).toFixed(1)}px, ${(dy * k).toFixed(1)}px) scale(${s})`, opacity: o });

    if (open) {
      langRoot.classList.add('is-merged');
      if (reduceLang) { langAnims = move([{ opacity: 0 }], { duration: 1, fill: 'forwards' }); return; }
      e.detail.delay = 190;                        // wyspa rozwija się, gdy kółko już się z nią łączy
      langAnims = [
        // zawartość kółka (kod języka) rozmywa się na początku, jak kropka w iPhonie
        langToggle.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120, easing: 'ease-out', fill: 'forwards' }),
        // kółko przyspiesza w stronę wyspy i znika w jej prawym końcu (gaśnie, zanim wejdzie pod szkło wyspy)
        ...move([
          { offset: 0,    ...at(0, 1, 1) },
          { offset: 0.55, ...at(0.55, 0.92, 1) },
          { offset: 0.8,  ...at(0.85, 0.75, 0.35) },
          { offset: 1,    ...at(1, 0.55, 0) },
        ], { duration: 230, easing: 'cubic-bezier(.55, 0, .8, .35)', fill: 'forwards' }),
      ];
    } else {
      if (reduceLang) { langRoot.classList.remove('is-merged'); return; }
      // kółko czeka ukryte w wyspie, aż ta skurczy się do pigułki
      langAnims = [
        ...move([at(1, 0.55, 0)], { duration: 1, fill: 'forwards' }),
        langToggle.animate([{ opacity: 0 }], { duration: 1, fill: 'forwards' }),
      ];
      langTimer = setTimeout(() => {
        stopLangAnims();
        langAnims = [
          // wybrzuszenie z prawego końca wyspy -> oderwanie (rozciągnięcie w poziomie) -> powrót.
          // Póki kółko nachodzi na wyspę, jest prawie niewidoczne; pełne staje się dopiero po oderwaniu.
          ...move([
            { offset: 0,    ...at(1, 0.55, 0), easing: 'ease-out' },
            { offset: 0.25, ...at(0.85, 0.72, 0.1), easing: 'ease-in-out' },
            { offset: 0.45, transform: `translate(${(dx * 0.42).toFixed(1)}px, ${(dy * 0.42).toFixed(1)}px) scale(1.1, 0.92)`, opacity: 0.85, easing: 'ease-out' },
            { offset: 0.72, transform: `translate(${(-dx * 0.04).toFixed(1)}px, 0px) scale(0.99, 1.02)`, opacity: 1, easing: 'ease-in-out' },
            { offset: 1,    ...at(0, 1, 1) },
          ], { duration: 620, easing: 'linear' }),
          // kod języka pojawia się, gdy kółko już się oderwie
          langToggle.animate([{ opacity: 0, offset: 0 }, { opacity: 0, offset: 0.5 }, { opacity: 1, offset: 1 }], { duration: 620, easing: 'ease-out' }),
        ];
        const a = langAnims;
        a[0].finished.then(() => { if (langAnims === a) { langAnims = []; langRoot.classList.remove('is-merged'); } }).catch(() => {});
      }, Math.round(closeMs * 0.8));               // start, gdy wyspa jest już prawie pigułką
    }
  });
}

// Linki do #top (logo w nagłówku): cel #top to przyklejony nagłówek, który zawsze jest na
// górze ekranu, więc przeglądarka uznawała, że „już tam jesteśmy”, i prawie nie przewijała.
// Przewijamy więc sami na sam początek strony, bez dopisywania #top do adresu.
document.querySelectorAll('a[href="#top"]').forEach(a => a.addEventListener('click', e => {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
}));
