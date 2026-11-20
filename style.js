// 22 style Liquid Glass (domyślny: Andalucía – głębokie indygo z bursztynem i terakotą). Ładowany w <head>, żeby zapisany styl był widoczny od pierwszej klatki.
// t: ciemny (d) albo jasny (j); tlo: kolor bazowy; plamy: trzy kolory rozmytych plam pod szkłem;
// a: kolor akcentu; tx: tekst; sz: tekst drugoplanowy.
(() => {
  const S = [
    { id: 'andalucia', n: 'Andalucía', t: 'd', tlo: '#0d0b1a', plamy: ['#a8492f', '#b8862f', '#2a2f7a'], a: '#f2b45c', tx: '#f7efe4', sz: '#c7bcb0' },
    { id: 'burdeos', n: 'Burdeos', t: 'd', tlo: '#14070b', plamy: ['#7a1838', '#d6467a', '#3d0d22'], a: '#ff8fb3', tx: '#fbeef2', sz: '#cfb2bc' },
    { id: 'las', n: 'Las', t: 'd', tlo: '#0c1712', plamy: ['#1f6a47', '#c9a24a', '#0f4a48'], a: '#e0bd74', tx: '#eef0e6', sz: '#aebcb1' },
    { id: 'aurora', n: 'Aurora', t: 'd', tlo: '#070f1c', plamy: ['#14b892', '#7b4dff', '#1c6dd0'], a: '#6ff3cf', tx: '#eaf6f4', sz: '#a3bcc4' },
    { id: 'ocean', n: 'Ocean', t: 'd', tlo: '#04142a', plamy: ['#0077b6', '#00b4d8', '#1e3fa0'], a: '#8be0ff', tx: '#e8f4ff', sz: '#a3bbd0' },
    { id: 'madryt', n: 'Noc w Madrycie', t: 'd', tlo: '#0a0f24', plamy: ['#22357a', '#f0a93a', '#4a2384'], a: '#ffcb6b', tx: '#f3f1ea', sz: '#b0b5c8' },
    { id: 'zachod', n: 'Zachód słońca', t: 'd', tlo: '#1a0b1f', plamy: ['#ff7a3d', '#ff3d81', '#7b2ff7'], a: '#ffbe7d', tx: '#fff2ea', sz: '#d6b9bd' },
    { id: 'neon', n: 'Neon', t: 'd', tlo: '#0b0614', plamy: ['#ff2fb3', '#00d5ef', '#6a00ff'], a: '#ff7ddb', tx: '#f7effc', sz: '#bdadcc' },
    { id: 'kosmos', n: 'Kosmos', t: 'd', tlo: '#080418', plamy: ['#5b2bd6', '#1a4fd6', '#b83cd0'], a: '#bfa6ff', tx: '#f0ebff', sz: '#afa7cc' },
    { id: 'wino', n: 'Wino', t: 'd', tlo: '#1a070c', plamy: ['#8a1a38', '#c2410c', '#4a0d26'], a: '#f7b2c2', tx: '#fcf0f2', sz: '#caabb2' },
    { id: 'grafit', n: 'Grafit', t: 'd', tlo: '#111214', plamy: ['#4b5058', '#7a8290', '#262c36'], a: '#eceef2', tx: '#f4f5f7', sz: '#a7abb3' },
    { id: 'sevilla', n: 'Sewilla', t: 'j', tlo: '#f6e7d3', plamy: ['#ec8a4e', '#f2c14e', '#9aab66'], a: '#a8421a', tx: '#2b1a10', sz: '#6c5546' },
    { id: 'barcelona', n: 'Barcelona', t: 'j', tlo: '#e9f2fb', plamy: ['#3a8ae8', '#ffd23f', '#ff7b7b'], a: '#1556ad', tx: '#0f1d33', sz: '#4d5d76' },
    { id: 'krysztal', n: 'Kryształ', t: 'j', tlo: '#eef1f6', plamy: ['#c7d2fe', '#a5f3fc', '#fbcfe8'], a: '#3451c9', tx: '#111827', sz: '#596273' },
    { id: 'lawenda', n: 'Lawenda', t: 'j', tlo: '#f1ecfb', plamy: ['#c4b5fd', '#f0abfc', '#a5b4fc'], a: '#6526c9', tx: '#1f1235', sz: '#62567a' },
    { id: 'mieta', n: 'Mięta', t: 'j', tlo: '#e9f8f2', plamy: ['#6ee7b7', '#bdf5dc', '#67e8f9'], a: '#04704f', tx: '#0b2a20', sz: '#4a685d' },
    { id: 'roza', n: 'Róża', t: 'j', tlo: '#fdeef3', plamy: ['#f9a8d4', '#fda4af', '#fcd5ce'], a: '#b3175a', tx: '#3a0f22', sz: '#795365' },
    { id: 'piasek', n: 'Piasek', t: 'j', tlo: '#f5efe4', plamy: ['#e8d5b0', '#d6b98c', '#f6e6c6'], a: '#7f6123', tx: '#2a2216', sz: '#6b5f4d' },
    { id: 'lod', n: 'Lód', t: 'j', tlo: '#edf6fb', plamy: ['#bae6fd', '#e6f4fe', '#a5d8ff'], a: '#03649a', tx: '#0c2233', sz: '#4c697e' },
    { id: 'cytrus', n: 'Cytrus', t: 'j', tlo: '#f7fbe6', plamy: ['#d9f99d', '#fde68a', '#a3e635'], a: '#46710d', tx: '#1c2a0b', sz: '#5a6943' },
    { id: 'koral', n: 'Koral', t: 'j', tlo: '#fff1ea', plamy: ['#fdba74', '#fb7185', '#fed7aa'], a: '#b33c0b', tx: '#33140a', sz: '#785245' },
    { id: 'mono', n: 'Monochrom', t: 'j', tlo: '#f2f2f2', plamy: ['#d0d0d0', '#ffffff', '#b8b8b8'], a: '#111111', tx: '#111111', sz: '#5c5c5c' },
  ];
  const SZKLO = {
    d: { szklo: 'rgba(255,255,255,.08)', brzeg: 'rgba(255,255,255,.18)', blask: 'rgba(255,255,255,.28)', pole: 'rgba(255,255,255,.07)', linia: 'rgba(255,255,255,.12)', cien: 'rgba(0,0,0,.35)', ok: '#7fd6a2', zle: '#ff9a8a', na: '#10131a' },
    j: { szklo: 'rgba(255,255,255,.55)', brzeg: 'rgba(255,255,255,.75)', blask: 'rgba(255,255,255,.95)', pole: 'rgba(255,255,255,.5)', linia: 'rgba(20,30,50,.09)', cien: 'rgba(30,40,70,.13)', ok: '#1f7a49', zle: '#b8321e', na: '#ffffff' },
  };
  function zastosuj(id) {
    const s = S.find(x => x.id === id) || S[0], g = SZKLO[s.t], r = document.documentElement;
    const v = { '--tlo': s.tlo, '--p1': s.plamy[0], '--p2': s.plamy[1], '--p3': s.plamy[2], '--zloto': s.a, '--tekst': s.tx, '--szary': s.sz,
      '--szklo': g.szklo, '--szklo-brzeg': g.brzeg, '--blask': g.blask, '--pole': g.pole, '--linia': g.linia, '--cien': g.cien,
      '--ok': g.ok, '--zle': g.zle, '--uwaga': s.t === 'd' ? '#f3c76b' : '#8a5a00', '--na-zlocie': g.na };
    for (const k in v) r.style.setProperty(k, v[k]);
    r.style.colorScheme = s.t === 'd' ? 'dark' : 'light';
    r.dataset.styl = s.id;
    const m = document.querySelector('meta[name="theme-color"]'); if (m) m.content = s.tlo;
    return s;
  }
  let zapisany = 'andalucia';
  try {
    const v2 = JSON.parse(localStorage.getItem('es-nauka-v2') || 'null');
    zapisany = (v2 && v2.ust && v2.ust.styl) || 'andalucia';
    // jednorazowo: dawny styl domyślny (Burdeos) przechodzi na nowy domyślny; wybór jest dalej w Ustawieniach
    if (zapisany === 'burdeos' && !(v2 && v2.ust && v2.ust.styl3)) zapisany = 'andalucia';
  } catch (e) { /* brak dostępu */ }
  zastosuj(zapisany);
  window.STYLE = { lista: S, zastosuj };
})();
