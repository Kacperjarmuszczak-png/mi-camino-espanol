// Czasowniki: lista „bezokolicznik:znaczenie:znaczniki” i odmiana liczona przez reguły.
// Znaczniki: ie / ue / i / u - zmiana samogłoski w temacie (pensar → pienso, poder → puedo, pedir → pido, jugar → juego),
// zc - conocer → conozco, z - vencer → venzo, í / ú - akcent (enviar → envío, continuar → continúo),
// =baza - czasownik nieregularny (z przedrostkiem: obtener = ob + tener). Końcówka „se” = czasownik zwrotny.
(() => {
  const LISTA = `
ser:być (cecha, kim się jest):=ser
estar:być (stan, miejsce):=estar
haber:czasownik posiłkowy (he comido), hay = jest/są:=haber
tener:mieć:=tener
hacer:robić:=hacer
ir:iść, jechać:=ir
venir:przychodzić, przyjeżdżać:=venir
decir:mówić, powiedzieć:=decir
poder:móc:=poder
querer:chcieć, kochać:=querer
saber:wiedzieć, umieć:=saber
poner:kłaść, stawiać:=poner
salir:wychodzić:=salir
dar:dawać:=dar
ver:widzieć, oglądać:=ver
traer:przynosić:=traer
caer:spadać, upadać:=caer
oír:słyszeć:=oír
andar:chodzić:=andar
caber:mieścić się:=caber
valer:być wartym, kosztować:=valer
reír:śmiać się:=reír
sonreír:uśmiechać się:=reír
oler:pachnieć, wąchać:=oler
conducir:prowadzić (samochód):=ducir
traducir:tłumaczyć:=ducir
producir:produkować:=ducir
reducir:zmniejszać:=ducir
introducir:wprowadzać:=ducir
obtener:otrzymywać, zdobywać:=tener
mantener:utrzymywać:=tener
contener:zawierać:=tener
detener:zatrzymywać:=tener
sostener:podtrzymywać:=tener
entretener:zabawiać:=tener
convenir:odpowiadać, opłacać się:=venir
prevenir:zapobiegać:=venir
intervenir:interweniować:=venir
componer:komponować, składać:=poner
proponer:proponować:=poner
suponer:przypuszczać:=poner
disponer:dysponować:=poner
exponer:wystawiać, przedstawiać:=poner
imponer:narzucać:=poner
deshacer:rozpakowywać, psuć:=hacer
rehacer:przerabiać, robić od nowa:=hacer
atraer:przyciągać:=traer
distraer:rozpraszać:=traer
hablar:mówić, rozmawiać
trabajar:pracować
estudiar:uczyć się, studiować
llamar:dzwonić, wołać
llegar:przyjeżdżać, docierać
pasar:przechodzić, spędzać, dziać się
quedar:zostawać, umawiać się
dejar:zostawiać, pozwalać
llevar:nosić, zabierać
tomar:brać, pić
mirar:patrzeć
esperar:czekać, mieć nadzieję
buscar:szukać
entrar:wchodzić
necesitar:potrzebować
gustar:podobać się (me gusta = lubię)
ayudar:pomagać
comprar:kupować
pagar:płacić
cocinar:gotować
cantar:śpiewać
bailar:tańczyć
viajar:podróżować
visitar:odwiedzać
preguntar:pytać
contestar:odpowiadać
escuchar:słuchać
terminar:kończyć
acabar:kończyć
usar:używać
cambiar:zmieniać
ganar:wygrywać, zarabiać
enseñar:uczyć (kogoś), pokazywać
explicar:wyjaśniać
olvidar:zapominać
preparar:przygotowywać
limpiar:sprzątać, czyścić
lavar:myć, prać
descansar:odpoczywać
caminar:chodzić, spacerować
nadar:pływać
tocar:dotykać, grać (na instrumencie)
sacar:wyjmować, robić (zdjęcie)
practicar:ćwiczyć, uprawiać
firmar:podpisywać
cortar:ciąć
cuidar:opiekować się, dbać
mandar:wysyłać, rozkazywać
invitar:zapraszać
celebrar:świętować
regalar:dawać w prezencie
alquilar:wynajmować
reservar:rezerwować
aparcar:parkować
arreglar:naprawiać
bajar:schodzić, obniżać
echar:wrzucać, wylewać
faltar:brakować
funcionar:działać
intentar:próbować
lograr:osiągać
mejorar:poprawiać
odiar:nienawidzić
organizar:organizować
parar:zatrzymywać się
pesar:ważyć
quitar:zdejmować, zabierać
saludar:witać, pozdrawiać
tirar:rzucać, wyrzucać
tratar:traktować, próbować
utilizar:używać, wykorzystywać
votar:głosować
desayunar:jeść śniadanie
cenar:jeść kolację
apagar:wyłączać, gasić
avisar:uprzedzać, zawiadamiać
borrar:usuwać, ścierać
copiar:kopiować
anunciar:ogłaszać
considerar:uważać, rozważać
crear:tworzyć
dibujar:rysować
disfrutar:cieszyć się (czymś)
durar:trwać
entregar:doręczać, oddawać
escapar:uciekać
evitar:unikać
expresar:wyrażać
fumar:palić (papierosy)
gastar:wydawać (pieniądze)
gritar:krzyczeć
imaginar:wyobrażać sobie
importar:mieć znaczenie, importować
informar:informować
llorar:płakać
manejar:obsługiwać, prowadzić (Ameryka)
marcar:zaznaczać, wybierać (numer)
montar:jeździć (konno, rowerem), składać
notar:zauważać
ocupar:zajmować
participar:uczestniczyć
perdonar:wybaczać
presentar:przedstawiać
prestar:pożyczać (komuś)
quemar:palić, parzyć
robar:kraść
saltar:skakać
salvar:ratować
separar:oddzielać
significar:znaczyć
solucionar:rozwiązywać
besar:całować
abrazar:przytulać
aceptar:akceptować
acompañar:towarzyszyć
aconsejar:radzić
adivinar:zgadywać
alcanzar:osiągać, sięgać
amar:kochać
apoyar:wspierać
arrancar:wyrywać, uruchamiać
asustar:straszyć
aumentar:zwiększać
mostrar:pokazywać:ue
contar:liczyć, opowiadać:ue
costar:kosztować:ue
encontrar:znajdować:ue
probar:próbować, kosztować (smak):ue
recordar:pamiętać, przypominać:ue
soñar:śnić, marzyć:ue
volar:latać:ue
sonar:dzwonić, brzmieć:ue
colgar:wieszać, rozłączać się:ue
almorzar:jeść obiad:ue
aprobar:zdawać (egzamin), zatwierdzać:ue
apostar:zakładać się:ue
jugar:grać, bawić się:u
pensar:myśleć:ie
cerrar:zamykać:ie
empezar:zaczynać:ie
comenzar:zaczynać:ie
despertar:budzić:ie
calentar:podgrzewać:ie
recomendar:polecać:ie
nevar:padać (o śniegu):ie
negar:zaprzeczać, odmawiać:ie
fregar:zmywać (naczynia):ie
apretar:ściskać, naciskać:ie
sentar:sadzać:ie
enviar:wysyłać:í
confiar:ufać:í
esquiar:jeździć na nartach:í
continuar:kontynuować:ú
actuar:działać, grać (rolę):ú
comer:jeść
beber:pić
leer:czytać
aprender:uczyć się (czegoś)
comprender:rozumieć
correr:biegać
vender:sprzedawać
deber:musieć, być winnym
creer:wierzyć, sądzić
responder:odpowiadać
romper:łamać, psuć
meter:wkładać
temer:bać się
toser:kaszleć
barrer:zamiatać
poseer:posiadać
coger:brać, łapać
escoger:wybierać
recoger:zbierać, odbierać
proteger:chronić
conocer:znać, poznawać:zc
ofrecer:oferować:zc
parecer:wydawać się:zc
merecer:zasługiwać:zc
crecer:rosnąć:zc
nacer:rodzić się:zc
aparecer:pojawiać się:zc
desaparecer:znikać:zc
obedecer:słuchać się:zc
pertenecer:należeć:zc
reconocer:rozpoznawać, przyznawać:zc
establecer:ustanawiać:zc
agradecer:dziękować:zc
vencer:zwyciężać:z
convencer:przekonywać:z
entender:rozumieć:ie
perder:gubić, przegrywać:ie
encender:włączać, zapalać:ie
defender:bronić:ie
atender:obsługiwać, zajmować się:ie
volver:wracać:ue
devolver:oddawać, zwracać:ue
resolver:rozwiązywać:ue
mover:ruszać, przesuwać:ue
llover:padać (o deszczu):ue
doler:boleć:ue
soler:mieć zwyczaj:ue
morder:gryźć:ue
vivir:mieszkać, żyć
escribir:pisać
describir:opisywać
abrir:otwierać
cubrir:przykrywać
descubrir:odkrywać
recibir:otrzymywać
decidir:decydować
subir:wchodzić, wsiadać, podnosić
compartir:dzielić się
existir:istnieć
permitir:pozwalać
ocurrir:zdarzać się
sufrir:cierpieć
cumplir:spełniać, kończyć (lat)
discutir:kłócić się, dyskutować
imprimir:drukować
insistir:nalegać
asistir:uczestniczyć
dividir:dzielić
unir:łączyć
añadir:dodawać
partir:dzielić, wyruszać
admitir:przyznawać, przyjmować
dirigir:kierować:
exigir:wymagać
fingir:udawać
elegir:wybierać:i
corregir:poprawiać:i
construir:budować
destruir:niszczyć
incluir:zawierać, włączać
concluir:kończyć, wnioskować
contribuir:przyczyniać się
huir:uciekać
distribuir:rozdzielać
sentir:czuć, żałować:ie
preferir:woleć:ie
mentir:kłamać:ie
divertir:bawić:ie
convertir:zamieniać:ie
sugerir:sugerować:ie
advertir:ostrzegać:ie
hervir:gotować się (wrzeć):ie
pedir:prosić, zamawiać:i
repetir:powtarzać:i
servir:służyć, podawać:i
seguir:iść za, kontynuować:i
conseguir:zdobywać, udawać się:i
medir:mierzyć:i
despedir:żegnać, zwalniać:i
impedir:uniemożliwiać:i
competir:rywalizować:i
vestir:ubierać:i
dormir:spać:ue
morir:umierać:ue
prohibir:zakazywać:í
reunir:zbierać, łączyć:ú
distinguir:rozróżniać
levantarse:wstawać
llamarse:nazywać się
ducharse:brać prysznic
bañarse:kąpać się
lavarse:myć się
peinarse:czesać się
afeitarse:golić się
maquillarse:malować się
casarse:brać ślub
quedarse:zostawać
preocuparse:martwić się
enfadarse:złościć się
enamorarse:zakochiwać się
cansarse:męczyć się
quejarse:narzekać
relajarse:relaksować się
equivocarse:mylić się
acordarse:pamiętać (o czymś):ue
acostarse:kłaść się spać:ue
probarse:przymierzać:ue
despertarse:budzić się:ie
sentarse:siadać:ie
vestirse:ubierać się:i
divertirse:bawić się:ie
sentirse:czuć się:ie
dormirse:zasypiać:ue
ponerse:zakładać, stawać się:=poner
irse:odchodzić, wyjeżdżać:=ir
reírse:śmiać się (z czegoś):=reír
`.trim().split('\n').map(l => { const [inf, pl, f = ''] = l.split(':'); return { inf, pl, f }; });

  // --- nieregularne bazy ---
  const s = t => t.split(' ');
  const IRR = {
    ser:   { pres: s('soy eres es somos sois son'), indef: s('fui fuiste fue fuimos fuisteis fueron'), imperf: s('era eras era éramos erais eran'), subj: s('sea seas sea seamos seáis sean') },
    ir:    { pres: s('voy vas va vamos vais van'), indef: s('fui fuiste fue fuimos fuisteis fueron'), imperf: s('iba ibas iba íbamos ibais iban'), subj: s('vaya vayas vaya vayamos vayáis vayan'), ger: 'yendo' },
    estar: { pres: s('estoy estás está estamos estáis están'), pret: 'estuv', subj: s('esté estés esté estemos estéis estén') },
    dar:   { pres: s('doy das da damos dais dan'), indef: s('di diste dio dimos disteis dieron'), subj: s('dé des dé demos deis den') },
    ver:   { pres: s('veo ves ve vemos veis ven'), indef: s('vi viste vio vimos visteis vieron'), imperf: s('veía veías veía veíamos veíais veían'), part: 'visto' },
    haber: { pres: s('he has ha hemos habéis han'), pret: 'hub', fut: 'habr', subj: s('haya hayas haya hayamos hayáis hayan') },
    saber: { yo: 'sé', pret: 'sup', fut: 'sabr', subjTemat: 'sep' },
    caber: { yo: 'quepo', pret: 'cup', fut: 'cabr' },
    tener: { yo: 'tengo', f: 'ie', pret: 'tuv', fut: 'tendr' },
    venir: { yo: 'vengo', f: 'ie', pret: 'vin', fut: 'vendr' },
    poner: { yo: 'pongo', pret: 'pus', fut: 'pondr', part: 'puesto' },
    salir: { yo: 'salgo', fut: 'saldr' },
    valer: { yo: 'valgo', fut: 'valdr' },
    hacer: { yo: 'hago', pret: 'hic', fut: 'har', part: 'hecho' },
    decir: { yo: 'digo', f: 'i', pret: 'dij', fut: 'dir', part: 'dicho' },
    traer: { yo: 'traigo', pret: 'traj' },
    caer:  { yo: 'caigo' },
    'oír': { pres: s('oigo oyes oye oímos oís oyen') },
    querer:{ f: 'ie', pret: 'quis', fut: 'querr' },
    poder: { f: 'ue', pret: 'pud', fut: 'podr', ger: 'pudiendo' },
    andar: { pret: 'anduv' },
    ducir: { f: 'zc', pret: 'duj' },
    'reír':{ pres: s('río ríes ríe reímos reís ríen'), indef: s('reí reíste rio reímos reísteis rieron'), subj: s('ría rías ría riamos riais rían'), ger: 'riendo' },
    oler:  { pres: s('huelo hueles huele olemos oléis huelen'), subj: s('huela huelas huela olamos oláis huelan') },
  };

  const KONC = {
    pres: { ar: s('o as a amos áis an'), er: s('o es e emos éis en'), ir: s('o es e imos ís en') },
    indef: { ar: s('é aste ó amos asteis aron'), er: s('í iste ió imos isteis ieron'), ir: s('í iste ió imos isteis ieron') },
    imperf: { ar: s('aba abas aba ábamos abais aban'), er: s('ía ías ía íamos íais ían'), ir: s('ía ías ía íamos íais ían') },
    fut: s('é ás á emos éis án'),
    cond: s('ía ías ía íamos íais ían'),
    subj: { ar: s('e es e emos éis en'), er: s('a as a amos áis an'), ir: s('a as a amos áis an') },
  };
  const ZAIMKI = s('me te se nos os se');
  const SAMO = 'aeiouáéíóú';
  const PART_KONC = [['olver', 'uelto'], ['scribir', 'scrito'], ['brir', 'bierto'], ['romper', 'roto'], ['morir', 'muerto'], ['imprimir', 'impreso']];

  // zmiana ostatniej samogłoski tematu (z → na)
  const zmien = (temat, z, na) => { const i = temat.lastIndexOf(z); return i < 0 ? temat : temat.slice(0, i) + na + temat.slice(i + 1); };
  function zmianaTematu(temat, f) {
    if (f === 'ie') return zmien(temat, 'e', 'ie');
    if (f === 'ue') return zmien(temat, 'o', 'ue');
    if (f === 'i') return zmien(temat, 'e', 'i');
    if (f === 'u') return zmien(temat, 'u', 'ue');
    if (f === 'í') return zmien(temat, 'i', 'í');
    if (f === 'ú') return zmien(temat, 'u', 'ú');
    return temat;
  }
  // -ir ze zmianą tematu: w 3. osobie czasu przeszłego, gerundio i 1./2. os. l.mn. subjuntivo e → i, o → u
  const slabaZmiana = (temat, f) => f === 'ue' ? zmien(temat, 'o', 'u') : (f === 'ie' || f === 'i') ? zmien(temat, 'e', 'i') : temat;
  // pisownia przed e w -ar: c → qu, g → gu, z → c
  const przedE = t => t.replace(/c$/, 'qu').replace(/g$/, 'gu').replace(/z$/, 'c');

  function odmiana(inf, znaczniki) {
    let zwrotny = false, rdzen = inf;
    if (/se$/.test(inf) && inf !== 'ser') { zwrotny = true; rdzen = inf.slice(0, -2); }
    let baza = rdzen, przed = '', irr = null, f = znaczniki || '';
    if (f.startsWith('=')) { baza = f.slice(1); przed = rdzen.slice(0, rdzen.length - baza.length); irr = IRR[baza]; f = irr.f || ''; }
    const norm = baza.replace('í', 'i');
    const typ = norm.slice(-2), temat = norm.slice(0, -2);
    const k = przedE;
    const ostatnia = temat.slice(-1);
    const uir = typ === 'ir' && ostatnia === 'u' && !/[gq]u$/.test(temat);
    const samo = typ !== 'ar' && !!ostatnia && SAMO.includes(ostatnia) && !/[gq]u$/.test(temat);   // leer, caer, oír, construir
    const silnaZmiana = [0, 1, 2, 5];

    // presente
    let pres;
    if (irr && irr.pres) pres = irr.pres.slice();
    else {
      pres = KONC.pres[typ].map((e, i) => {
        let t = temat;
        if (silnaZmiana.includes(i)) t = zmianaTematu(t, f);
        if (uir && silnaZmiana.includes(i)) t += 'y';
        if (uir && i === 4) return t + 'is';   // construis, huis (RAE 2010: bez akcentu)
        return t + e;
      });
      // 1. osoba
      let yo = pres[0];
      if (irr && irr.yo) yo = irr.yo;
      else if (f === 'zc') yo = temat.slice(0, -1) + 'zco';
      else if (f === 'z') yo = temat.slice(0, -1) + 'zo';
      else if (typ !== 'ar' && /g$/.test(temat)) yo = zmianaTematu(temat, f).slice(0, -1) + 'jo';
      else if (/gu$/.test(temat) && typ === 'ir') yo = zmianaTematu(temat, f).slice(0, -2) + 'go';
      pres[0] = yo;
    }

    // pretérito indefinido
    let indef;
    if (irr && irr.indef) indef = irr.indef.slice();
    else if (irr && irr.pret) {
      const p = irr.pret, j = /j$/.test(p);
      indef = ['e', 'iste', 'o', 'imos', 'isteis', j ? 'eron' : 'ieron'].map(e => p + e);
      if (baza === 'hacer') indef[2] = 'hizo';
    } else {
      indef = KONC.indef[typ].map((e, i) => {
        let t = temat;
        if (i === 0 && typ === 'ar') t = k(t);
        if (typ === 'ir' && (i === 2 || i === 5)) t = slabaZmiana(t, f);
        if (samo && (i === 2 || i === 5)) return t + (i === 2 ? 'yó' : 'yeron');
        if (samo && !uir && (i === 1 || i === 3 || i === 4)) return t + e.replace('i', 'í');
        if (uir && i === 0 && /^[^aeiouáéíóú]*u$/.test(t)) return t + 'i';   // hui (jednosylabowe, bez akcentu)
        return t + e;
      });
    }

    if (baza === 'reír' && przed) indef[2] = 'rió';   // rio (1 sylaba), ale sonrió

    // imperfecto
    const imperf = irr && irr.imperf ? irr.imperf.slice() : KONC.imperf[typ].map(e => temat + e);
    // futuro i condicional
    const pf = irr && irr.fut ? irr.fut : norm;
    const fut = KONC.fut.map(e => pf + e), cond = KONC.cond.map(e => pf + e);

    // subjuntivo presente
    let subj;
    if (irr && irr.subj) subj = irr.subj.slice();
    else {
      const yoT = irr && irr.subjTemat ? irr.subjTemat : pres[0].slice(0, -1);
      const zmiennaNos = ['ie', 'ue', 'u', 'í', 'ú'].includes(f) && !(irr && irr.yo);
      const nosT = zmiennaNos ? (typ === 'ir' ? slabaZmiana(temat, f) : temat) : yoT;
      subj = KONC.subj[typ].map((e, i) => {
        let t = (i === 3 || i === 4) ? nosT : yoT;
        if (typ === 'ar') t = k(t);
        return t + e;
      });
    }

    // imiesłów i gerundio
    let part = irr && irr.part ? irr.part : null;
    if (!part) { const p = PART_KONC.find(([e]) => norm.endsWith(e)); if (p) part = norm.slice(0, -p[0].length) + p[1]; }
    if (!part) part = temat + (typ === 'ar' ? 'ado' : (samo && !uir ? 'ído' : 'ido'));
    let ger = irr && irr.ger ? irr.ger : null;
    if (!ger) {
      if (typ === 'ar') ger = temat + 'ando';
      else if (samo) ger = temat + 'yendo';
      else ger = (typ === 'ir' ? slabaZmiana(temat, f) : temat) + 'iendo';
    }

    const haber = IRR.haber.pres;
    const perf = haber.map(h => h + ' ' + przed + part);
    const P = a => a.map(x => przed + x);
    let wynik = { presente: P(pres), perfecto: perf, indefinido: P(indef), imperfecto: P(imperf), futuro: P(fut), condicional: P(cond), subjuntivo: P(subj), part: przed + part, ger: przed + ger };
    if (zwrotny) {
      for (const c of ['presente', 'perfecto', 'indefinido', 'imperfecto', 'futuro', 'condicional', 'subjuntivo']) wynik[c] = wynik[c].map((x, i) => ZAIMKI[i] + ' ' + x);
      wynik.ger = wynik.ger.replace(/ando$/, 'ándose').replace(/endo$/, 'éndose');
    }
    return wynik;
  }

  window.CZASOWNIKI = LISTA;
  window.odmiana = odmiana;
  window.CZASY = [
    { k: 'presente', n: 'Presente', pl: 'czas teraźniejszy', o: 'Co robię teraz albo zwykle: hablo español.' },
    { k: 'perfecto', n: 'Pretérito perfecto', pl: 'przeszły z „haber”', o: 'Co zrobiłem dziś, w tym tygodniu, w życiu: he comido.' },
    { k: 'indefinido', n: 'Pretérito indefinido', pl: 'przeszły zakończony', o: 'Co zrobiłem wczoraj, w zeszłym roku: comí.' },
    { k: 'imperfecto', n: 'Pretérito imperfecto', pl: 'przeszły ciągły', o: 'Jak było, co robiłem zwykle: comía.' },
    { k: 'futuro', n: 'Futuro', pl: 'czas przyszły', o: 'Co zrobię: comeré.' },
    { k: 'condicional', n: 'Condicional', pl: 'tryb przypuszczający', o: 'Co bym zrobił: comería.' },
    { k: 'subjuntivo', n: 'Presente de subjuntivo', pl: 'tryb łączący', o: 'Po „quiero que”, „ojalá”, „para que”: quiero que comas.' },
  ];
  window.OSOBY = [['yo', 'ja'], ['tú', 'ty'], ['él / ella / usted', 'on / ona / Pan(i)'], ['nosotros', 'my'], ['vosotros', 'wy'], ['ellos / ustedes', 'oni / Państwo']];
})();
