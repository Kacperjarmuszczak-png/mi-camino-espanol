// Wymowa przez Web Speech API: wybór głosu (preferowany wariant ES / LATAM, jakość Premium), tempo, bezpieczny brak głosu.
// W trybie dla hiszpańskojęzycznych (CEL = 'pl') lektor mówi po polsku.
import { CEL } from './jezyk.js';
const synt = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;

const jakosc = v => /premium/i.test(v.name + v.voiceURI) ? 2 : /enhanced|mejorad|rozszerz|neural|natural|online/i.test(v.name + v.voiceURI) ? 1 : 0;
function ocena(v, wariant) {
  if (CEL === 'pl') return (/^pl[-_]PL/i.test(v.lang) ? 100 : 60) + jakosc(v) * 30 + (/google/i.test(v.name) ? 15 : 0) + (/zosia|ewa|krzysztof|agnieszka|jacek|marek/i.test(v.name) ? 5 : 0);
  const es = /^es[-_]ES/i.test(v.lang), latam = /^es[-_](MX|US|419|AR|CO|CL|PE)/i.test(v.lang);
  const kraj = wariant === 'latam' ? (latam ? 100 : es ? 40 : 30) : (es ? 100 : latam ? 40 : 30);
  return kraj + jakosc(v) * 30 + (/google/i.test(v.name) ? 15 : 0) + (/m[oó]nica|jorge|paulina|marisol|luc[ií]a|elvira|[aá]lvaro/i.test(v.name) ? 5 : 0);
}

export function utworzMowe(ust) {
  let glosy = [], wybrany = null;
  const sluchacze = new Set();
  const odswiez = () => {
    if (!synt) return;
    glosy = synt.getVoices().filter(v => new RegExp('^' + CEL, 'i').test(v.lang)).sort((a, b) => ocena(b, ust.wariant) - ocena(a, ust.wariant));
    wybrany = glosy.find(v => v.voiceURI === ust.glos) || glosy[0] || null;
    sluchacze.forEach(f => f());
  };
  if (synt) { odswiez(); synt.addEventListener ? synt.addEventListener('voiceschanged', odswiez) : (synt.onvoiceschanged = odswiez); setTimeout(odswiez, 400); setTimeout(odswiez, 1500); }

  return {
    get dostepna() { return !!synt; },
    get maGlosHiszpanski() { return !!wybrany; },
    get glosy() { return glosy; },
    get wybrany() { return wybrany; },
    opisGlosu: v => `${v.name}${jakosc(v) === 2 && !/premium/i.test(v.name) ? ' (Premium)' : jakosc(v) === 1 && !/enhanced|rozszerz|mejorad/i.test(v.name) ? ' (Rozszerzony)' : ''} · ${v.lang.replace('_', '-')}`,
    jakoscGlosu: jakosc,
    odswiez,
    naZmiane: f => sluchacze.add(f),
    stop() { if (synt) synt.cancel(); },
    // tempo: mnożnik z ustawień (0.75 / 1 / 1.15); wolniej: dodatkowe spowolnienie
    powiedz(tekst, { wolniej = false } = {}) {
      if (!synt || !tekst) return false;
      try {
        synt.cancel();
        const u = new SpeechSynthesisUtterance(String(tekst).replace(/\*/g, '').replace(/…/g, '').replace(/\([^)]*\)/g, ' '));
        u.lang = wybrany ? wybrany.lang : CEL === 'pl' ? 'pl-PL' : (ust.wariant === 'latam' ? 'es-MX' : 'es-ES');
        if (wybrany) u.voice = wybrany;
        u.rate = Math.max(0.5, 0.95 * (ust.tempo || 1) * (wolniej ? 0.7 : 1));
        synt.speak(u);
        return true;
      } catch (e) { return false; }
    },
  };
}
