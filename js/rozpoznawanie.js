// Rozpoznawanie mowy (Web Speech API: SpeechRecognition / webkitSpeechRecognition – Safari na iPhonie, Chrome).
const klasa = () => (typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null);
export const rozpoznawanieDostepne = () => !!klasa();

let biezace = null;
export function przerwijSluchanie() { if (biezace) { try { biezace.abort(); } catch (e) { /* brak */ } biezace = null; } }

/**
 * Słucha jednej wypowiedzi. Zwraca listę alternatyw (najbardziej prawdopodobna pierwsza).
 * Błędy: 'brak' (brak obsługi), 'zgoda' (brak dostępu do mikrofonu), 'cisza' (nic nie usłyszano), 'blad'.
 */
export function sluchaj(lang) {
  return new Promise((ok, zle) => {
    const Klasa = klasa();
    if (!Klasa) return zle(new Error('brak'));
    przerwijSluchanie();
    const r = new Klasa();
    biezace = r;
    r.lang = lang; r.interimResults = false; r.maxAlternatives = 5; r.continuous = false;
    let wynik = null;
    r.onresult = e => { const res = e.results[0]; wynik = [...res].map(a => a.transcript.trim()).filter(Boolean); };
    r.onerror = e => { biezace = null; zle(new Error(e.error === 'not-allowed' || e.error === 'service-not-allowed' ? 'zgoda' : e.error === 'no-speech' ? 'cisza' : e.error === 'aborted' ? 'przerwane' : 'blad')); };
    r.onend = () => { biezace = null; if (wynik && wynik.length) ok(wynik); else zle(new Error('cisza')); };
    try { r.start(); } catch (e) { biezace = null; zle(new Error('blad')); }
  });
}
