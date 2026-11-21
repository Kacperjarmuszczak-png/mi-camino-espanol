// Zadania w formacie egzaminu DELE (A2, B1, B2): comprensión de lectura, comprensión auditiva, expresión escrita.
// Pytanie: [treść, [poprawna, błędna, błędna], wyjaśnienie po polsku]. Odpowiedzi są tasowane w widoku.
// Pisanie: polecenie jak na egzaminie, limit słów i punkty, które trzeba poruszyć (wykrywane po słowach-kluczach).

export const DELE = {
  A2: {
    czas: { czytanie: 60, sluchanie: 40, pisanie: 45 },
    czytanie: [
      {
        t: 'Tarea 1 · Un correo de Lucía',
        tekst: `¡Hola, Marta! ¿Qué tal estás? Te escribo porque el sábado que viene celebro mi cumpleaños. Voy a hacer una cena en mi casa a las ocho y media. Van a venir mis compañeros de trabajo y mi hermano Pablo, que vive en Sevilla. No tienes que traer nada, pero si quieres, puedes traer música: ¡ya sabes que me encanta bailar! Mi casa está cerca de la estación de metro Ópera; al salir, gira a la derecha y es el número 14, tercer piso. Si no puedes venir, avísame antes del jueves, porque tengo que comprar la comida. ¡Un beso! Lucía`,
        q: [
          ['¿Para qué escribe Lucía?', ['Para invitar a Marta a su cumpleaños.', 'Para pedir ayuda con la mudanza.', 'Para hablar de su nuevo trabajo.'], 'Lucía pisze, bo „el sábado que viene celebro mi cumpleaños” – zaprasza na urodziny.'],
          ['¿A qué hora empieza la cena?', ['A las 20:30.', 'A las 18:30.', 'A las 14:00.'], '„A las ocho y media” = 20:30.'],
          ['¿Quién es Pablo?', ['El hermano de Lucía.', 'Un compañero de trabajo de Marta.', 'El novio de Lucía.'], '„mi hermano Pablo, que vive en Sevilla”.'],
          ['¿Qué puede traer Marta?', ['Música.', 'Comida.', 'Bebidas.'], '„No tienes que traer nada, pero si quieres, puedes traer música”.'],
          ['¿Hasta cuándo tiene que contestar Marta si no puede ir?', ['Hasta el jueves.', 'Hasta el sábado.', 'Hasta el domingo.'], '„avísame antes del jueves”. Avisar = dać znać.'],
        ],
      },
      {
        t: 'Tarea 2 · Anuncios',
        tekst: `A) BIBLIOTECA MUNICIPAL. Horario de verano (julio y agosto): de lunes a viernes, de 9:00 a 14:00. Sábados y domingos, cerrado. Préstamo de libros con el carné de la biblioteca.
B) SE ALQUILA piso en el centro: dos dormitorios, cocina equipada y terraza. 750 € al mes. No se admiten animales. Llamar por las tardes al 612 345 678.
C) CURSO DE COCINA MEXICANA. Aprende a preparar tacos, guacamole y enchiladas. Martes y jueves de 18:00 a 20:00. Precio: 60 € al mes, ingredientes incluidos.
D) PISCINA MUNICIPAL. Abierta del 15 de junio al 15 de septiembre. Niños menores de 6 años: gratis. Es obligatorio usar gorro de baño.`,
        q: [
          ['¿Qué anuncio es para una persona que busca casa?', ['B', 'A', 'D'], 'B: „Se alquila piso” – mieszkanie do wynajęcia.'],
          ['¿Cuándo está cerrada la biblioteca en verano?', ['Los fines de semana.', 'Por las mañanas.', 'Los lunes.'], '„Sábados y domingos, cerrado” – weekendy.'],
          ['En el curso de cocina…', ['el precio incluye los ingredientes.', 'hay clases todos los días.', 'se aprende cocina española.'], '„60 € al mes, ingredientes incluidos”.'],
          ['En la piscina, los niños de 4 años…', ['no pagan.', 'pagan la mitad.', 'no pueden entrar.'], '„Niños menores de 6 años: gratis”.'],
          ['En el piso de alquiler…', ['no se puede tener perro.', 'hay tres dormitorios.', 'hay que llamar por la mañana.'], '„No se admiten animales” – zwierzęta niedozwolone.'],
        ],
      },
    ],
    sluchanie: [
      {
        t: 'Tarea 1 · Mensaje en el contestador',
        tekst: 'Hola, Carlos, soy Elena. Te llamo porque mañana no puedo ir al gimnasio contigo a las siete; tengo que trabajar hasta tarde. ¿Podemos ir el viernes por la mañana, a las diez? Si te va bien, mándame un mensaje. Ah, y no olvides traer mi libro, el que te dejé la semana pasada. ¡Hasta luego!',
        q: [
          ['¿Por qué llama Elena?', ['Para cambiar el día del gimnasio.', 'Para invitar a Carlos a cenar.', 'Para pedir dinero.'], 'Elena nie może jutro iść na siłownię i proponuje piątek.'],
          ['¿Qué propone Elena?', ['Ir el viernes a las diez.', 'Ir mañana a las siete.', 'Ir el sábado por la tarde.'], '„¿Podemos ir el viernes por la mañana, a las diez?”'],
          ['¿Cómo tiene que contestar Carlos?', ['Con un mensaje.', 'Con un correo electrónico.', 'Llamando por la noche.'], '„Si te va bien, mándame un mensaje”.'],
          ['¿Qué tiene que llevar Carlos?', ['Un libro de Elena.', 'Ropa de deporte para Elena.', 'Las llaves del gimnasio.'], '„no olvides traer mi libro”.'],
        ],
      },
      {
        t: 'Tarea 2 · En la estación',
        tekst: 'Atención, por favor. El tren con destino a Valencia, que tenía su salida a las once y cuarto, saldrá con un retraso de veinte minutos. El tren saldrá de la vía número cuatro y no de la vía dos. Les recordamos que la cafetería de la estación está abierta hasta las doce de la noche. Disculpen las molestias.',
        q: [
          ['¿A qué hora sale ahora el tren a Valencia?', ['A las 11:35.', 'A las 11:15.', 'A las 11:20.'], '11:15 + 20 minut opóźnienia = 11:35.'],
          ['¿De qué vía sale el tren?', ['De la vía 4.', 'De la vía 2.', 'De la vía 20.'], '„saldrá de la vía número cuatro y no de la vía dos”.'],
          ['¿Hasta cuándo está abierta la cafetería?', ['Hasta medianoche.', 'Hasta las once.', 'Hasta la salida del tren.'], '„hasta las doce de la noche” = do północy.'],
          ['El anuncio informa de…', ['un retraso y un cambio de vía.', 'un tren cancelado.', 'una huelga de trenes.'], 'Retraso (opóźnienie) + zmiana toru.'],
        ],
      },
    ],
    pisanie: [
      {
        t: 'Tarea 1 · Correo a un amigo',
        polecenie: 'Ha pasado un fin de semana en una ciudad que no conocía. Escriba un correo a un amigo para contárselo. En él debe: saludar; decir dónde estuvo y con quién; explicar qué hizo; decir qué le gustó más; despedirse.',
        pl: 'Opisz weekend w nowym mieście: gdzie, z kim, co robiłeś, co się podobało. Używaj pretérito indefinido (fui, visité, comí).',
        min: 60, max: 80,
        punkty: [
          { opis: 'Powitanie', wzor: '\\b(hola|querid[oa]|qué tal|buenas)\\b' },
          { opis: 'Gdzie byłeś i z kim', wzor: '\\b(estuve|fui|fuimos|estuvimos|viajé|viajamos)\\b.*\\b(con|en)\\b' },
          { opis: 'Co robiłeś (czas przeszły)', wzor: '\\b(visit[éa]|visitamos|com[íi]|comimos|vi|vimos|pase[éa]|paseamos|hice|hicimos|compr[ée]|compramos)\\b' },
          { opis: 'Co ci się podobało', wzor: '\\b(me gust[óo]|me encant[óo]|lo mejor|me pareci[óo])\\b' },
          { opis: 'Pożegnanie', wzor: '\\b(un abrazo|besos|un beso|hasta pronto|nos vemos|saludos|chao|adiós)\\b' },
        ],
      },
      {
        t: 'Tarea 2 · Mi casa',
        polecenie: 'Escriba un texto sobre la casa o el piso donde vive. Hable de: dónde está; cómo es (habitaciones, tamaño); qué es lo que más le gusta; qué cambiaría.',
        pl: 'Opisz swoje mieszkanie: położenie, pokoje, co lubisz najbardziej, co byś zmienił (cambiaría / me gustaría tener).',
        min: 60, max: 80,
        punkty: [
          { opis: 'Gdzie jest', wzor: '\\b(está en|está cerca|vivo en|se encuentra)\\b' },
          { opis: 'Jakie jest (pokoje, wielkość)', wzor: '\\b(habitaci[oó]n|habitaciones|dormitorio|salón|cocina|baño|grande|pequeñ[oa]|metros)\\b' },
          { opis: 'Co lubisz najbardziej', wzor: '\\b(me gusta|me encanta|lo que más|favorit[oa])\\b' },
          { opis: 'Co byś zmienił', wzor: '\\b(cambiar[íi]a|me gustar[íi]a|quisiera|necesita)\\b' },
        ],
      },
    ],
  },
  B1: {
    czas: { czytanie: 70, sluchanie: 40, pisanie: 60 },
    czytanie: [
      {
        t: 'Tarea 1 · Teletrabajo: ventajas e inconvenientes',
        tekst: `Desde hace unos años, cada vez más empresas permiten a sus empleados trabajar desde casa algunos días a la semana. Según un estudio reciente, siete de cada diez trabajadores que teletrabajan dicen sentirse más satisfechos, sobre todo porque ahorran el tiempo que antes pasaban en el transporte. Sin embargo, no todo son ventajas. Muchos reconocen que les cuesta separar la vida laboral de la personal: contestan correos por la noche o durante el fin de semana. Además, algunos echan de menos el contacto con los compañeros y se sienten aislados. Los expertos recomiendan establecer un horario fijo, tener un espacio de trabajo separado del resto de la casa y, si es posible, combinar el trabajo en casa con algunos días en la oficina.`,
        q: [
          ['Según el texto, la mayoría de las personas que teletrabajan…', ['están más contentas.', 'quieren volver a la oficina.', 'trabajan menos horas.'], '„siete de cada diez … dicen sentirse más satisfechos”.'],
          ['La principal ventaja mencionada es…', ['no perder tiempo en el transporte.', 'ganar más dinero.', 'poder viajar más.'], '„ahorran el tiempo que antes pasaban en el transporte”.'],
          ['Un problema del teletrabajo es que…', ['es difícil desconectar del trabajo.', 'las empresas pagan menos.', 'los ordenadores fallan a menudo.'], '„les cuesta separar la vida laboral de la personal”.'],
          ['«Echan de menos» significa que…', ['les falta algo que tenían antes.', 'no les gusta algo.', 'tienen demasiado de algo.'], 'Echar de menos = tęsknić za czymś.'],
          ['Los expertos aconsejan…', ['trabajar unos días en casa y otros en la oficina.', 'no teletrabajar nunca.', 'trabajar por la noche.'], '„combinar el trabajo en casa con algunos días en la oficina”.'],
          ['El tono del texto es…', ['informativo y equilibrado.', 'muy crítico con el teletrabajo.', 'humorístico.'], 'Tekst przedstawia zalety i wady – jest informacyjny.'],
        ],
      },
      {
        t: 'Tarea 2 · Reseña de un restaurante',
        tekst: `El pasado viernes fuimos a cenar a «La Huerta», un restaurante que abrió hace solo dos meses en el barrio de Gracia. El local es pequeño pero acogedor, con plantas por todas partes y una música agradable. La carta no es muy larga, algo que en mi opinión es una buena señal: todos los platos se preparan con productos de temporada de pequeños productores de la zona. Pedimos una crema de calabaza, unas croquetas de setas y un arroz con verduras que estaba delicioso. Lo único negativo fue la espera: tardaron casi cuarenta minutos en servir el segundo plato, aunque el camarero se disculpó y nos invitó al postre. Los precios son razonables (unos 30 euros por persona). Es imprescindible reservar, sobre todo los fines de semana.`,
        q: [
          ['«La Huerta» es un restaurante…', ['nuevo.', 'muy antiguo.', 'que va a cerrar.'], '„abrió hace solo dos meses”.'],
          ['Al autor le parece positivo que la carta…', ['sea corta.', 'tenga muchos platos de carne.', 'esté en varios idiomas.'], '„La carta no es muy larga, algo que … es una buena señal”.'],
          ['¿Qué problema tuvieron?', ['Esperaron mucho el segundo plato.', 'La comida estaba fría.', 'El camarero fue maleducado.'], '„tardaron casi cuarenta minutos en servir el segundo plato”.'],
          ['Como compensación…', ['no pagaron el postre.', 'les devolvieron el dinero.', 'les regalaron una botella de vino.'], '„nos invitó al postre” – deser na koszt lokalu.'],
          ['Según el autor, para ir a «La Huerta»…', ['hay que reservar.', 'hay que ir pronto.', 'hay que pagar en efectivo.'], '„Es imprescindible reservar”.'],
        ],
      },
    ],
    sluchanie: [
      {
        t: 'Tarea 1 · Conversación entre amigos',
        tekst: '— Oye, Sara, ¿al final vas a hacer el curso de fotografía? — Pues no lo sé. Me interesa mucho, pero es los martes y jueves por la tarde y salgo de trabajar a las seis y media. — ¿Y no hay un horario de mañana? — Sí, los sábados, pero es más caro: casi el doble. — ¿Y por qué no lo haces en línea? Mi hermano hizo uno así y aprendió muchísimo. — Ya lo pensé, pero prefiero aprender con gente, salir a hacer fotos en grupo… Creo que al final me apuntaré al de los sábados. Me lo merezco.',
        q: [
          ['¿Qué problema tiene Sara con el curso de los martes y jueves?', ['El horario no le va bien.', 'Es muy caro.', 'Está lleno.'], 'Kończy pracę o 18:30, a kurs jest po południu.'],
          ['El curso de los sábados…', ['cuesta casi el doble.', 'es gratis.', 'es en línea.'], '„es más caro: casi el doble”.'],
          ['¿Por qué no quiere hacer el curso en línea?', ['Prefiere aprender con otras personas.', 'No tiene ordenador.', 'Su hermano no se lo recomienda.'], '„prefiero aprender con gente”.'],
          ['¿Qué decide Sara?', ['Hacer el curso de los sábados.', 'No hacer ningún curso.', 'Hacer el curso en línea.'], '„me apuntaré al de los sábados”.'],
        ],
      },
      {
        t: 'Tarea 2 · Noticia en la radio',
        tekst: 'El Ayuntamiento ha anunciado que a partir del próximo lunes el centro de la ciudad estará cerrado al tráfico privado los fines de semana. Solo podrán entrar los autobuses, los taxis y los vehículos de los vecinos que vivan en la zona. Para facilitar los desplazamientos, se aumentará la frecuencia de los autobuses y el aparcamiento de la estación norte será gratuito los sábados y domingos. Los comerciantes de la zona están divididos: algunos creen que la medida atraerá a más peatones y, por lo tanto, a más clientes; otros temen perder ventas.',
        q: [
          ['¿Qué ha decidido el Ayuntamiento?', ['Cerrar el centro a los coches privados los fines de semana.', 'Construir un nuevo aparcamiento.', 'Subir el precio del autobús.'], 'Centrum zamknięte dla prywatnych aut w weekendy.'],
          ['¿Quién podrá entrar en coche?', ['Los vecinos de la zona.', 'Los comerciantes.', 'Nadie.'], '„los vehículos de los vecinos que vivan en la zona” + autobusy i taksówki.'],
          ['¿Qué será gratis?', ['El aparcamiento de la estación norte el fin de semana.', 'El autobús.', 'Los taxis por la noche.'], '„el aparcamiento de la estación norte será gratuito los sábados y domingos”.'],
          ['¿Qué opinan los comerciantes?', ['No todos opinan lo mismo.', 'Todos están en contra.', 'Todos están a favor.'], '„Los comerciantes … están divididos”.'],
        ],
      },
    ],
    pisanie: [
      {
        t: 'Tarea 1 · Carta de reclamación',
        polecenie: 'Compró un aparato por internet y llegó roto. Escriba un correo a la tienda (100–120 palabras) en el que: explique qué compró y cuándo; describa el problema; diga cómo se siente; pida una solución (cambio o devolución del dinero).',
        pl: 'Formalny mail reklamacyjny: Estimados señores…, co i kiedy kupiłeś, jaki problem, prośba o rozwiązanie (Les ruego que…, Me gustaría que…), formalne pożegnanie.',
        min: 100, max: 120,
        punkty: [
          { opis: 'Formalne powitanie', wzor: '\\b(estimad[oa]s?|muy señor|a quien corresponda)\\b' },
          { opis: 'Co i kiedy kupiłeś', wzor: '\\b(compr[ée]|ped[íi]|adquir[íi])\\b' },
          { opis: 'Opis problemu', wzor: '\\b(roto|rota|no funciona|defectuos[oa]|dañad[oa]|estropead[oa])\\b' },
          { opis: 'Uczucia / ocena', wzor: '\\b(decepcionad[oa]|molest[oa]|enfadad[oa]|insatisfech[oa]|sorprendid[oa])\\b' },
          { opis: 'Prośba o rozwiązanie', wzor: '\\b(devoluci[oó]n|devuelvan|cambio|cambien|reembolso|les ruego|solicito|me gustar[íi]a que)\\b' },
          { opis: 'Formalne pożegnanie', wzor: '\\b(atentamente|un saludo|saludos cordiales|quedo a la espera)\\b' },
        ],
      },
      {
        t: 'Tarea 2 · Una experiencia',
        polecenie: 'Escriba un texto (130–150 palabras) sobre un viaje que no salió como esperaba. Cuente: adónde fue y cuándo; qué pasó; cómo lo solucionó; qué aprendió de esa experiencia.',
        pl: 'Opowiadanie w przeszłości: indefinido (pasó, perdí) + imperfecto (llovía, estaba), łączniki (de repente, al final, por eso).',
        min: 130, max: 150,
        punkty: [
          { opis: 'Gdzie i kiedy', wzor: '\\b(fui|viaj[ée]|fuimos|viajamos)\\b' },
          { opis: 'Co się stało (indefinido)', wzor: '\\b(pas[óo]|perd[íi]|perdimos|se cancel[óo]|olvid[ée]|tuve que|tuvimos que)\\b' },
          { opis: 'Tło (imperfecto)', wzor: '\\b(\\w+aba|\\w+ábamos|\\w+ían?|estaba|había|hacía)\\b' },
          { opis: 'Łączniki narracji', wzor: '\\b(de repente|al final|finalmente|entonces|por eso|luego|después)\\b' },
          { opis: 'Czego się nauczyłeś', wzor: '\\b(aprend[íi]|desde entonces|ahora siempre|la lecci[oó]n)\\b' },
        ],
      },
    ],
  },
  B2: {
    czas: { czytanie: 70, sluchanie: 40, pisanie: 80 },
    czytanie: [
      {
        t: 'Tarea 1 · El valor del aburrimiento',
        tekst: `Vivimos en una época en la que parece imposible aburrirse. Basta con sacar el móvil del bolsillo para llenar cualquier minuto libre: en la cola del supermercado, en el autobús o incluso mientras esperamos que hierva el agua. Sin embargo, cada vez son más los psicólogos que defienden que el aburrimiento, lejos de ser una pérdida de tiempo, cumple una función importante. Cuando la mente no recibe estímulos externos, empieza a divagar, y es precisamente en esos momentos cuando surgen muchas ideas creativas. Varios experimentos han mostrado que las personas que realizan una tarea monótona antes de un ejercicio de creatividad obtienen mejores resultados que quienes no la hacen. Esto no significa que debamos buscar el aburrimiento a toda costa, pero sí que convendría dejar de huir de él. Los expertos sugieren pequeños gestos: no llevar el teléfono a la mesa, dar un paseo sin auriculares o, simplemente, mirar por la ventana durante unos minutos.`,
        q: [
          ['Según el texto, hoy en día…', ['casi nunca nos aburrimos porque siempre tenemos el móvil.', 'la gente se aburre más que antes.', 'los psicólogos recomiendan usar más el móvil.'], '„parece imposible aburrirse. Basta con sacar el móvil…”.'],
          ['Para muchos psicólogos, el aburrimiento…', ['tiene una función útil.', 'es peligroso para la salud.', 'es una pérdida de tiempo.'], '„lejos de ser una pérdida de tiempo, cumple una función importante”.'],
          ['¿Qué ocurre cuando la mente no recibe estímulos?', ['Divaga y aparecen ideas creativas.', 'Se cansa rápidamente.', 'Se concentra mejor en el trabajo.'], '„la mente … empieza a divagar … surgen muchas ideas creativas”.'],
          ['Los experimentos citados muestran que una tarea monótona…', ['puede mejorar la creatividad posterior.', 'reduce la creatividad.', 'no tiene ningún efecto.'], 'Osoby po nudnym zadaniu „obtienen mejores resultados”.'],
          ['La expresión «a toda costa» significa…', ['a cualquier precio.', 'con poco esfuerzo.', 'de vez en cuando.'], 'A toda costa = za wszelką cenę.'],
          ['¿Qué recomiendan los expertos?', ['Pequeños cambios de hábitos, como pasear sin auriculares.', 'Dejar de usar el móvil para siempre.', 'Hacer tareas monótonas todos los días.'], '„pequeños gestos: no llevar el teléfono a la mesa, dar un paseo sin auriculares…”.'],
        ],
      },
      {
        t: 'Tarea 2 · Turismo masivo',
        tekst: `Las ciudades más visitadas de Europa buscan desde hace años la fórmula para convivir con el turismo masivo. El problema no es solo la cantidad de visitantes, sino su concentración: millones de personas se reúnen en unas pocas calles durante unas pocas horas al día. Esto provoca que muchos vecinos abandonen los barrios históricos, empujados por la subida de los alquileres y la desaparición de los comercios tradicionales, sustituidos por tiendas de recuerdos. Algunas ciudades han optado por limitar el número de pisos turísticos; otras han introducido tasas para los visitantes que solo pasan el día. Los críticos advierten, no obstante, de que estas medidas pueden resultar insuficientes si no van acompañadas de una estrategia para repartir a los turistas por otras zonas y épocas del año.`,
        q: [
          ['Según el texto, el principal problema es…', ['la concentración de turistas en pocos lugares.', 'que los turistas gastan poco.', 'la falta de hoteles.'], '„El problema no es solo la cantidad … sino su concentración”.'],
          ['Los vecinos se van de los barrios históricos porque…', ['los alquileres suben y desaparecen las tiendas de siempre.', 'hay demasiado tráfico.', 'el ayuntamiento los obliga.'], '„empujados por la subida de los alquileres y la desaparición de los comercios tradicionales”.'],
          ['¿Qué medida se menciona?', ['Cobrar una tasa a quienes solo pasan el día.', 'Prohibir la entrada de turistas.', 'Cerrar los museos.'], '„tasas para los visitantes que solo pasan el día”.'],
          ['«No obstante» se puede sustituir por…', ['sin embargo.', 'por lo tanto.', 'además.'], 'No obstante = jednak (= sin embargo).'],
          ['Los críticos creen que las medidas…', ['deben completarse con un reparto de turistas en el espacio y el tiempo.', 'son exageradas.', 'ya han resuelto el problema.'], '„si no van acompañadas de una estrategia para repartir a los turistas…”.'],
        ],
      },
    ],
    sluchanie: [
      {
        t: 'Tarea 1 · Entrevista a una emprendedora',
        tekst: '— Laura, hace cinco años dejaste un trabajo fijo en un banco para montar una empresa de reparación de ropa. ¿No te dio miedo? — Muchísimo. Tenía un buen sueldo y todo el mundo me decía que estaba loca. Pero me sentía vacía; no veía el sentido de lo que hacía. — ¿Y cómo empezó todo? — Con un pequeño taller en mi barrio. Al principio arreglaba pantalones y chaquetas de los vecinos, pero en seguida vi que mucha gente quería alargar la vida de su ropa en lugar de comprar otra nueva. Ahora tenemos tres talleres y doce empleados. — ¿Qué consejo darías a quien quiera emprender? — Que no espere a tenerlo todo claro. Si yo hubiera esperado al momento perfecto, todavía estaría en el banco.',
        q: [
          ['¿Por qué dejó Laura su trabajo en el banco?', ['No le encontraba sentido.', 'Ganaba poco dinero.', 'La despidieron.'], '„me sentía vacía; no veía el sentido de lo que hacía”.'],
          ['¿Cómo reaccionó la gente de su entorno?', ['Pensaba que era una locura.', 'La apoyó desde el principio.', 'Le prestó dinero.'], '„todo el mundo me decía que estaba loca”.'],
          ['¿Qué descubrió Laura al abrir el taller?', ['Que mucha gente prefería reparar la ropa que comprar nueva.', 'Que la ropa nueva era más barata.', 'Que los vecinos no tenían dinero.'], '„mucha gente quería alargar la vida de su ropa en lugar de comprar otra nueva”.'],
          ['Su consejo es…', ['no esperar a que todo sea perfecto.', 'ahorrar mucho antes de empezar.', 'no dejar nunca un trabajo fijo.'], '„Que no espere a tenerlo todo claro”.'],
        ],
      },
      {
        t: 'Tarea 2 · Conferencia sobre el sueño',
        tekst: 'Buenas tardes. Hoy quiero hablarles de algo que solemos subestimar: el sueño. Los adultos necesitamos entre siete y nueve horas, pero según las encuestas, uno de cada tres españoles duerme menos de seis. Las consecuencias no son solo el cansancio: dormir poco de forma habitual aumenta el riesgo de enfermedades cardiovasculares y afecta a la memoria. ¿Qué podemos hacer? En primer lugar, mantener horarios regulares, también los fines de semana. En segundo lugar, evitar las pantallas al menos una hora antes de acostarse, porque la luz azul retrasa la producción de melatonina. Y, por último, cuidado con la siesta: es beneficiosa, siempre que no dure más de veinte o treinta minutos.',
        q: [
          ['Según la conferenciante, un tercio de los españoles…', ['duerme menos de seis horas.', 'duerme más de nueve horas.', 'no duerme la siesta.'], '„uno de cada tres españoles duerme menos de seis”.'],
          ['Dormir poco habitualmente…', ['puede perjudicar al corazón y a la memoria.', 'solo produce cansancio.', 'mejora la concentración.'], '„aumenta el riesgo de enfermedades cardiovasculares y afecta a la memoria”.'],
          ['¿Por qué hay que evitar las pantallas antes de dormir?', ['Porque su luz retrasa la producción de melatonina.', 'Porque cansan la vista.', 'Porque producen dolor de cabeza.'], '„la luz azul retrasa la producción de melatonina”.'],
          ['Sobre la siesta, dice que…', ['es buena si es corta.', 'hay que evitarla siempre.', 'debe durar al menos una hora.'], '„es beneficiosa, siempre que no dure más de veinte o treinta minutos”.'],
        ],
      },
    ],
    pisanie: [
      {
        t: 'Tarea 1 · Carta al director',
        polecenie: 'Su ayuntamiento quiere convertir un parque del barrio en un aparcamiento. Escriba una carta a un periódico local (150–180 palabras) en la que: presente el problema; exprese su opinión con argumentos; proponga alternativas; anime a los vecinos a actuar.',
        pl: 'Tekst argumentacyjny: wstęp, opinia (considero que, en mi opinión), argumenty z łącznikami (en primer lugar, además, sin embargo), propozycje (sería conveniente que + subjuntivo), zakończenie.',
        min: 150, max: 180,
        punkty: [
          { opis: 'Przedstawienie problemu', wzor: '\\b(parque|aparcamiento|ayuntamiento|proyecto)\\b' },
          { opis: 'Wyrażenie opinii', wzor: '\\b(en mi opini[oó]n|considero que|creo que|a mi juicio|desde mi punto de vista|me parece)\\b' },
          { opis: 'Łączniki argumentacji', wzor: '\\b(en primer lugar|adem[aá]s|por otro lado|sin embargo|no obstante|por lo tanto|en conclusi[oó]n)\\b' },
          { opis: 'Propozycje (subjuntivo)', wzor: '\\b(ser[íi]a (conveniente|mejor|bueno) que|propongo que|ojal[áa]|es necesario que)\\b' },
          { opis: 'Wezwanie do działania', wzor: '\\b(vecinos|participar|firmar|unirnos|movilizarnos|actuar)\\b' },
        ],
      },
      {
        t: 'Tarea 2 · Artículo de opinión',
        polecenie: '¿Deberían prohibirse los móviles en los colegios? Escriba un artículo (150–180 palabras) para la revista de su escuela de idiomas: presente las dos posturas, dé su opinión razonada y una conclusión.',
        pl: 'Pokaż obie strony (por un lado… por otro lado…), własne zdanie z uzasadnieniem, wnioski. Użyj subjuntivo po „no creo que”, „es importante que”.',
        min: 150, max: 180,
        punkty: [
          { opis: 'Obie strony', wzor: '\\b(por un lado|por otro( lado)?|a favor|en contra|mientras que)\\b' },
          { opis: 'Własna opinia', wzor: '\\b(en mi opini[oó]n|considero que|creo que|opino que|desde mi punto de vista)\\b' },
          { opis: 'Subjuntivo', wzor: '\\b(no creo que|es importante que|es necesario que|para que|aunque)\\b' },
          { opis: 'Zakończenie', wzor: '\\b(en conclusi[oó]n|para terminar|en definitiva|en resumen|por todo ello)\\b' },
        ],
      },
    ],
  },
};
