// Przenoszenie postępów na inne urządzenie bez serwera: stan → kompresja (deflate) → base64url → link / kod QR.
// Link otwiera aplikację z „#przenies=…”, a ta proponuje import.
export const ZNACZNIK = '#przenies=';

const doB64 = bajty => { let s = ''; for (let i = 0; i < bajty.length; i += 0x8000) s += String.fromCharCode(...bajty.subarray(i, i + 0x8000)); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
const zB64 = t => { const s = atob(t.replace(/-/g, '+').replace(/_/g, '/')); return Uint8Array.from(s, c => c.charCodeAt(0)); };
async function strumien(bajty, Klasa) {
  const s = new Blob([bajty]).stream().pipeThrough(new Klasa('deflate-raw'));
  return new Uint8Array(await new Response(s).arrayBuffer());
}

/** @returns {Promise<string>} „z.<base64url>” (skompresowane) albo „j.<base64url>” (bez kompresji) */
export async function spakuj(obiekt) {
  const json = new TextEncoder().encode(JSON.stringify(obiekt));
  if (typeof CompressionStream !== 'undefined') return 'z.' + doB64(await strumien(json, CompressionStream));
  return 'j.' + doB64(json);
}
export async function rozpakuj(tekst) {
  const [rodzaj, dane] = [tekst.slice(0, 2), tekst.slice(2)];
  let bajty = zB64(dane);
  if (rodzaj === 'z.') bajty = await strumien(bajty, DecompressionStream);
  else if (rodzaj !== 'j.') throw new Error('zły format');
  return JSON.parse(new TextDecoder().decode(bajty));
}

// biblioteka QR (MIT, Kazuhiko Arase) – ładowana dopiero, gdy potrzebna
let ladowanieQr = null;
export function kodQr(tekst) {
  if (!ladowanieQr) ladowanieQr = new Promise((ok, zle) => { const s = document.createElement('script'); s.src = 'js/lib/qrcode.js'; s.onload = ok; s.onerror = zle; document.head.append(s); });
  return ladowanieQr.then(() => {
    const q = window.qrcode(0, 'L'); q.addData(tekst); q.make();
    return q.createSvgTag({ cellSize: 3, margin: 2, scalable: true });
  });
}
export const MAKS_QR = 2900;   // bajtów w kodzie QR (wersja 40, poziom L)
