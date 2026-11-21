// Rozpoznawanie mowy (Web Speech API: SpeechRecognition / webkitSpeechRecognition – Safari na iPhonie, Chrome).
// Krótki dźwięk na start i koniec słuchania; słuchanie kończy się samo chwilę po tym, jak przestaniesz mówić
// (Safari na iPhonie potrafi czekać bardzo długo, więc pilnujemy ciszy sami na wynikach cząstkowych).
const klasa = () => (typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null);
export const rozpoznawanieDostepne = () => !!klasa();

let biezace = null;
/** Przerywa słuchanie bez wyniku. */
export function przerwijSluchanie() { if (biezace) { const r = biezace; biezace = null; try { r.abort(); } catch (e) { /* brak */ } } }
/** Kończy słuchanie i ocenia to, co już usłyszano (np. ponowne stuknięcie mikrofonu). */
export function zakonczSluchanie() { if (biezace) { try { biezace.stop(); } catch (e) { /* brak */ } } }
export const slucham = () => !!biezace;

// --- dźwięki (Web Audio, bez plików) ---
let ctx = null;
function dzwiek(rosnacy) {
  try {
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    ctx = ctx || new AC();
    if (ctx.state === 'suspended') ctx.resume();
    const t = ctx.currentTime;
    const nuty = rosnacy ? [660, 990] : [880, 590];
    nuty.forEach((f, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine'; o.frequency.value = f;
      const s = t + i * 0.085;
      g.gain.setValueAtTime(0.0001, s);
      g.gain.exponentialRampToValueAtTime(0.22, s + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, s + 0.11);
      o.connect(g).connect(ctx.destination);
      o.start(s); o.stop(s + 0.12);
    });
  } catch (e) { /* brak dźwięku nie blokuje słuchania */ }
}

const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\p{L}\p{N} ]/gu, ' ').replace(/\s+/g, ' ').trim();

/**
 * Słucha jednej wypowiedzi. Zwraca listę alternatyw (najbardziej prawdopodobna pierwsza).
 * Błędy: 'brak' (brak obsługi), 'zgoda' (brak dostępu do mikrofonu), 'cisza' (nic nie usłyszano), 'przerwane', 'blad'.
 * @param {string} lang
 * @param {{ oczekiwane?: string[], cisza?: number, maks?: number, dzwieki?: boolean }} [o]
 *   oczekiwane – gdy usłyszymy dokładnie to, kończymy od razu; cisza – ms ciszy po mowie do końca słuchania.
 */
export function sluchaj(lang, { oczekiwane = [], cisza = 850, maks = 9000, dzwieki = true } = {}) {
  return new Promise((ok, zle) => {
    const Klasa = klasa();
    if (!Klasa) return zle(new Error('brak'));
    przerwijSluchanie();
    const r = new Klasa();
    biezace = r;
    r.lang = lang; r.interimResults = true; r.maxAlternatives = 5; r.continuous = false;
    const cele = oczekiwane.map(norm).filter(Boolean);
    let wynik = null, tCisza = null, tStart = null, tMaks = null, koniec = false;
    const zatrzymaj = () => { if (biezace === r) { try { r.stop(); } catch (e) { /* brak */ } } };
    const sprzataj = () => { clearTimeout(tCisza); clearTimeout(tStart); clearTimeout(tMaks); if (biezace === r) biezace = null; };
    const zakoncz = (blad) => {
      if (koniec) return; koniec = true; sprzataj();
      if (dzwieki && blad !== 'przerwane') dzwiek(false);
      if (!blad && wynik && wynik.length) ok(wynik); else zle(new Error(blad || 'cisza'));
    };
    r.onresult = e => {
      const wyniki = [...e.results];
      const pierwszy = wyniki.map(x => x[0].transcript).join(' ').trim();
      const alt = wyniki.length === 1 ? [...wyniki[0]].map(a => a.transcript.trim()) : [pierwszy];
      wynik = [...new Set([pierwszy, ...alt])].filter(Boolean);
      clearTimeout(tStart);
      const gotowe = wyniki.every(x => x.isFinal);
      if (gotowe || (cele.length && wynik.some(w => cele.includes(norm(w))))) { zatrzymaj(); return; }
      clearTimeout(tCisza); tCisza = setTimeout(zatrzymaj, cisza);
    };
    r.onspeechend = zatrzymaj;
    r.onerror = e => zakoncz(e.error === 'not-allowed' || e.error === 'service-not-allowed' ? 'zgoda' : e.error === 'no-speech' ? 'cisza' : e.error === 'aborted' ? 'przerwane' : (wynik ? null : 'blad'));
    r.onend = () => zakoncz(null);
    const uruchom = () => {
      if (biezace !== r) return zle(new Error('przerwane'));
      try { r.start(); } catch (e) { sprzataj(); return zle(new Error('blad')); }
      tStart = setTimeout(zatrzymaj, 6000);   // nikt nic nie mówi
      tMaks = setTimeout(zatrzymaj, maks);    // twardy limit
    };
    if (dzwieki) { dzwiek(true); setTimeout(uruchom, 180); } else uruchom();
  });
}
