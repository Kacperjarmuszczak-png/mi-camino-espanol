// Rodziny wyrazów: [słowo, znaczenie, część mowy]. Część mowy: cz (czasownik), rz (rzeczownik), os (osoba), pz (przymiotnik), ps (przysłówek).
export const RODZINY = [
  [['trabajar', 'pracować', 'cz'], ['el trabajo', 'praca', 'rz'], ['el trabajador', 'pracownik', 'os'], ['trabajador', 'pracowity', 'pz']],
  [['enseñar', 'uczyć (kogoś)', 'cz'], ['la enseñanza', 'nauczanie', 'rz'], ['el enseñante', 'nauczyciel (ogólnie)', 'os']],
  [['estudiar', 'uczyć się, studiować', 'cz'], ['el estudio', 'nauka, badanie', 'rz'], ['el estudiante', 'student', 'os'], ['estudioso', 'pilny', 'pz']],
  [['vender', 'sprzedawać', 'cz'], ['la venta', 'sprzedaż', 'rz'], ['el vendedor', 'sprzedawca', 'os']],
  [['comprar', 'kupować', 'cz'], ['la compra', 'zakup, zakupy', 'rz'], ['el comprador', 'kupujący', 'os']],
  [['cocinar', 'gotować', 'cz'], ['la cocina', 'kuchnia', 'rz'], ['el cocinero', 'kucharz', 'os']],
  [['pintar', 'malować', 'cz'], ['la pintura', 'malarstwo, farba', 'rz'], ['el pintor', 'malarz', 'os']],
  [['escribir', 'pisać', 'cz'], ['la escritura', 'pismo', 'rz'], ['el escritor', 'pisarz', 'os'], ['escrito', 'pisemny', 'pz']],
  [['leer', 'czytać', 'cz'], ['la lectura', 'lektura, czytanie', 'rz'], ['el lector', 'czytelnik', 'os']],
  [['nadar', 'pływać', 'cz'], ['la natación', 'pływanie', 'rz'], ['el nadador', 'pływak', 'os']],
  [['viajar', 'podróżować', 'cz'], ['el viaje', 'podróż', 'rz'], ['el viajero', 'podróżnik', 'os']],
  [['jugar', 'grać, bawić się', 'cz'], ['el juego', 'gra', 'rz'], ['el jugador', 'gracz', 'os']],
  [['cantar', 'śpiewać', 'cz'], ['la canción', 'piosenka', 'rz'], ['el cantante', 'piosenkarz', 'os']],
  [['bailar', 'tańczyć', 'cz'], ['el baile', 'taniec', 'rz'], ['el bailarín', 'tancerz', 'os']],
  [['conducir', 'prowadzić (auto)', 'cz'], ['la conducción', 'prowadzenie (pojazdu)', 'rz'], ['el conductor', 'kierowca', 'os']],
  [['dormir', 'spać', 'cz'], ['el sueño', 'sen', 'rz'], ['el dormitorio', 'sypialnia', 'rz2'], ['dormido', 'śpiący (uśpiony)', 'pz']],
  [['amar', 'kochać', 'cz'], ['el amor', 'miłość', 'rz'], ['amable', 'uprzejmy', 'pz'], ['amablemente', 'uprzejmie', 'ps']],
  [['vivir', 'żyć, mieszkać', 'cz'], ['la vida', 'życie', 'rz'], ['la vivienda', 'mieszkanie (lokal)', 'rz2'], ['vivo', 'żywy', 'pz']],
  [['crear', 'tworzyć', 'cz'], ['la creación', 'tworzenie, dzieło', 'rz'], ['el creador', 'twórca', 'os'], ['creativo', 'kreatywny', 'pz']],
  [['decidir', 'decydować', 'cz'], ['la decisión', 'decyzja', 'rz'], ['decidido', 'zdecydowany', 'pz']],
  [['organizar', 'organizować', 'cz'], ['la organización', 'organizacja', 'rz'], ['el organizador', 'organizator', 'os']],
  [['preparar', 'przygotowywać', 'cz'], ['la preparación', 'przygotowanie', 'rz'], ['preparado', 'przygotowany', 'pz']],
  [['feliz', 'szczęśliwy', 'pz'], ['la felicidad', 'szczęście', 'rz'], ['felizmente', 'szczęśliwie', 'ps'], ['felicitar', 'gratulować', 'cz']],
  [['fácil', 'łatwy', 'pz'], ['la facilidad', 'łatwość', 'rz'], ['fácilmente', 'łatwo', 'ps'], ['facilitar', 'ułatwiać', 'cz']],
  [['rápido', 'szybki', 'pz'], ['la rapidez', 'szybkość', 'rz'], ['rápidamente', 'szybko', 'ps']],
  [['limpio', 'czysty', 'pz'], ['la limpieza', 'sprzątanie, czystość', 'rz'], ['limpiar', 'sprzątać, czyścić', 'cz']],
  [['triste', 'smutny', 'pz'], ['la tristeza', 'smutek', 'rz'], ['entristecer', 'zasmucać', 'cz']],
  [['libre', 'wolny', 'pz'], ['la libertad', 'wolność', 'rz'], ['liberar', 'uwalniać', 'cz'], ['libremente', 'swobodnie', 'ps']],
];
export const CZESCI = { cz: 'czasownik', rz: 'rzeczownik', rz2: 'rzeczownik', os: 'osoba (kto?)', pz: 'przymiotnik', ps: 'przysłówek' };

// Synonimy i antonimy: [słowo, synonim/antonim, znaczenie słowa]
export const SYNONIMY = [
  ['empezar', 'comenzar', 'zaczynać'], ['acabar', 'terminar', 'kończyć'], ['rápido', 'veloz', 'szybki'], ['bonito', 'lindo', 'ładny'], ['contento', 'alegre', 'zadowolony'],
  ['enfadado', 'enojado', 'zły (rozgniewany)'], ['el coche', 'el auto', 'samochód'], ['hablar', 'conversar', 'rozmawiać'], ['querer', 'desear', 'chcieć'], ['antiguo', 'viejo', 'stary'],
  ['el trabajo', 'el empleo', 'praca'], ['delgado', 'flaco', 'szczupły'], ['enorme', 'gigantesco', 'ogromny'], ['volver', 'regresar', 'wracać'], ['mirar', 'observar', 'patrzeć'],
  ['cansado', 'agotado', 'zmęczony'], ['el miedo', 'el temor', 'strach'], ['tirar', 'lanzar', 'rzucać'], ['ayudar', 'auxiliar', 'pomagać'], ['el error', 'la equivocación', 'błąd'],
  ['listo', 'inteligente', 'bystry'], ['caro', 'costoso', 'drogi'], ['la cara', 'el rostro', 'twarz'], ['charlar', 'platicar', 'gawędzić'], ['el sitio', 'el lugar', 'miejsce'],
  ['entender', 'comprender', 'rozumieć'], ['solo', 'solamente', 'tylko'], ['quizás', 'tal vez', 'może'], ['bastante', 'suficiente', 'wystarczająco'], ['estupendo', 'genial', 'świetny'],
];
export const ANTONIMY = [
  ['rápido', 'lento', 'szybki'], ['grande', 'pequeño', 'duży'], ['caro', 'barato', 'drogi'], ['abrir', 'cerrar', 'otwierać'], ['entrar', 'salir', 'wchodzić'],
  ['subir', 'bajar', 'wchodzić w górę'], ['fácil', 'difícil', 'łatwy'], ['alegre', 'triste', 'wesoły'], ['empezar', 'terminar', 'zaczynać'], ['ganar', 'perder', 'wygrywać'],
  ['comprar', 'vender', 'kupować'], ['nuevo', 'viejo', 'nowy'], ['joven', 'mayor', 'młody'], ['alto', 'bajo', 'wysoki'], ['limpio', 'sucio', 'czysty'],
  ['lleno', 'vacío', 'pełny'], ['cerca', 'lejos', 'blisko'], ['antes', 'después', 'przed'], ['siempre', 'nunca', 'zawsze'], ['mucho', 'poco', 'dużo'],
  ['encender', 'apagar', 'włączać'], ['recordar', 'olvidar', 'pamiętać'], ['aceptar', 'rechazar', 'akceptować'], ['la verdad', 'la mentira', 'prawda'], ['el éxito', 'el fracaso', 'sukces'],
  ['ruidoso', 'silencioso', 'hałaśliwy'], ['generoso', 'tacaño', 'hojny'], ['valiente', 'cobarde', 'odważny'], ['mojado', 'seco', 'mokry'], ['amar', 'odiar', 'kochać'],
];
