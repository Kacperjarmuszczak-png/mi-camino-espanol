// System powtórek w odstępach (wariant SM-2). Czyste funkcje: łatwo testować i podmieniać.
// Stan elementu: { n: seria udanych powtórek, ok, zle, ef: łatwość, iv: odstęp w dniach,
//                  due: termin następnej powtórki (ms), last: ostatnia odpowiedź (ms), myl: czy był mylony }
// Oceny: 1 = nie wiem (Jeszcze nie), 2 = trudne, 3 = dobrze (Umiem), 4 = łatwe.

export const DZIEN = 864e5;
export const MINUTA = 6e4;
export const OPANOWANE_OD = 7;      // odstęp (dni), od którego element liczymy jako opanowany

export const nowyStan = () => ({ n: 0, ok: 0, zle: 0, ef: 2.5, iv: 0, due: 0, last: 0, myl: false });

export function ocen(stan, ocena, teraz = Date.now()) {
  const s = { ...nowyStan(), ...(stan || {}) };
  s.last = teraz;
  if (ocena <= 1) {
    if (s.n > 0 || s.ok > 0) s.myl = true;      // już raz umiał, a teraz pomylił
    s.zle++; s.n = 0; s.iv = 0;
    s.ef = Math.max(1.3, s.ef - 0.2);
    s.due = teraz + 10 * MINUTA;
    return s;
  }
  s.ok++;
  if (s.n === 0) s.iv = ocena === 4 ? 3 : 1;
  else if (s.n === 1) s.iv = ocena === 2 ? 2 : ocena === 4 ? 6 : 3;
  else s.iv = s.iv * (ocena === 2 ? 1.2 : ocena === 4 ? s.ef * 1.3 : s.ef);
  s.iv = Math.min(365, Math.round(s.iv * 10) / 10);
  s.ef = Math.max(1.3, Math.min(3, s.ef + (ocena === 2 ? -0.15 : ocena === 4 ? 0.1 : 0)));
  s.n++;
  s.due = teraz + s.iv * DZIEN;
  return s;
}

// 'nowe' | 'nauka' | 'utrwalane' | 'opanowane'
export function status(stan) {
  if (!stan || (!stan.ok && !stan.zle)) return 'nowe';
  if (stan.n === 0 || stan.iv < 1) return 'nauka';
  return stan.iv >= OPANOWANE_OD ? 'opanowane' : 'utrwalane';
}
export const doPowtorki = (stan, teraz = Date.now()) => !!stan && (stan.ok + stan.zle) > 0 && stan.due <= teraz;

// Udział w postępie (0–1)
export const postep = stan => ({ nowe: 0, nauka: 0.2, utrwalane: 0.6, opanowane: 1 }[status(stan)]);

/**
 * Kolejka sesji: najpierw zaległe powtórki (najstarsze najpierw), potem nowe elementy,
 * wplatane co kilka powtórek. Elementy jeszcze niezaległe pomijamy, chyba że brakuje materiału.
 * @param {string[]} ids – kolejność bazowa (np. po temacie)
 * @param {object} stany – mapa id → stan
 */
export function budujKolejke(ids, stany, { teraz = Date.now(), nowych = 10, rozmiar = 20, los = Math.random } = {}) {
  const zalegle = [], nowe = [], reszta = [];
  for (const id of ids) {
    const s = stany[id];
    if (!s || (!s.ok && !s.zle)) nowe.push(id);
    else if (s.due <= teraz) zalegle.push(id);
    else reszta.push(id);
  }
  zalegle.sort((a, b) => stany[a].due - stany[b].due);
  // nowe w losowej kolejności, żeby nie zawsze te same pierwsze słowa z tematu
  for (let i = nowe.length - 1; i > 0; i--) { const j = Math.floor(los() * (i + 1)); [nowe[i], nowe[j]] = [nowe[j], nowe[i]]; }
  const wynik = [], n = nowe.slice(0, nowych);
  let zi = 0, ni = 0;
  while (wynik.length < rozmiar && (zi < zalegle.length || ni < n.length)) {
    for (let k = 0; k < 3 && zi < zalegle.length && wynik.length < rozmiar; k++) wynik.push(zalegle[zi++]);
    if (ni < n.length && wynik.length < rozmiar) wynik.push(n[ni++]);
  }
  // gdy wszystko jest opanowane i nic nie czeka: powtórka najdawniej ćwiczonych (trening dodatkowy)
  if (!wynik.length && reszta.length) {
    reszta.sort((a, b) => stany[a].last - stany[b].last);
    return reszta.slice(0, rozmiar);
  }
  return wynik;
}

// Po ocenie w trakcie sesji: „nie wiem” wraca za kilka kart, „trudne” pod koniec sesji (raz).
export function poOcenie(kolejka, id, ocena, ileRazy = {}) {
  const k = kolejka.slice();
  if (ocena <= 1 && (ileRazy[id] || 0) < 3) k.splice(Math.min(k.length, 3), 0, id);
  else if (ocena === 2 && !(ileRazy[id] > 0)) k.push(id);
  return k;
}
