// Akcent graficzny (tilde) po hiszpańsku – czyste funkcje: podział na jądra sylab, typ wyrazu i reguła.
const SAM = 'aeiouáéíóúü', MOCNE = 'aeoáéó', AKC = { á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u' };

/** Jądra sylab: [{ od, do }] – grupy samogłosek z podziałem na rozziew (dwie mocne albo akcentowane í/ú obok mocnej). */
export function jadra(slowo) {
  const s = slowo.toLowerCase(), wynik = [];
  let i = 0;
  while (i < s.length) {
    if (!SAM.includes(s[i])) { i++; continue; }
    let j = i + 1;
    while (j < s.length && SAM.includes(s[j])) {
      const a = s[j - 1], b = s[j];
      const rozziew = (MOCNE.includes(a) && MOCNE.includes(b)) || ((a === 'í' || a === 'ú') && MOCNE.includes(b)) || ((b === 'í' || b === 'ú') && MOCNE.includes(a));
      if (rozziew) break;
      j++;
    }
    // „qu”, „gu” + e/i: u nie tworzy osobnego dźwięku, ale i tak należy do tego samego jądra – pomijamy
    wynik.push({ od: i, do: j });
    i = j;
  }
  // w „que/qui/gue/gui” u jest nieme: łączymy z następną samogłoską już w pętli (u + e to dyftong), więc nic nie robimy
  return wynik;
}

/** { indeks: pozycja samogłoski z tyldą albo -1, typ: 'aguda'|'llana'|'esdrújula'|'hiato'|'zwykły', regula } */
export function analizaAkcentu(slowo) {
  const s = slowo.toLowerCase();
  const indeks = [...s].findIndex(c => AKC[c]);
  const j = jadra(s), n = j.length;
  const konc = s[s.length - 1], naSamN = 'aeiouns'.includes(AKC[konc] || konc);
  if (indeks < 0) return { indeks, typ: 'zwykły', regula: naSamN ? 'Kończy się na samogłoskę, -n albo -s, więc akcent pada naturalnie na przedostatnią sylabę – tilde niepotrzebna.' : 'Kończy się na spółgłoskę (nie -n, -s), więc akcent pada naturalnie na ostatnią sylabę – tilde niepotrzebna.' };
  const ktore = j.findIndex(x => indeks >= x.od && indeks < x.do), odKonca = n - 1 - ktore;
  if ((s[indeks] === 'í' || s[indeks] === 'ú') && j.some((x, k) => k !== ktore && (x.do === indeks || x.od === indeks + 1))) return { indeks, typ: 'hiato', regula: 'Rozziew: akcentowane i/u obok a, e, o (día, país, río) zawsze ma tildę, żeby sylaby się nie zlały.' };
  if (odKonca === 0) return { indeks, typ: 'aguda', regula: 'Aguda – akcent na ostatniej sylabie. Gdy kończy się na samogłoskę, -n albo -s, potrzebuje tildy (café, canción, francés).' };
  if (odKonca === 1) return { indeks, typ: 'llana', regula: 'Llana – akcent na przedostatniej sylabie. Tilda tylko wtedy, gdy kończy się na spółgłoskę inną niż -n, -s (árbol, fácil, lápiz).' };
  return { indeks, typ: 'esdrújula', regula: 'Esdrújula – akcent na trzeciej sylabie od końca. Takie słowa ZAWSZE mają tildę (médico, música, rápido).' };
}
export const bezTyldy = s => s.replace(/[áéíóú]/g, c => AKC[c]);
