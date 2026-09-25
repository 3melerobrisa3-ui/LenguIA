import { KnowledgeTopic, BookRecommendation, MovieRecommendation } from "../types";

export const KNOWLEDGE_TOPICS: KnowledgeTopic[] = [
  {
    id: "frances",
    name: "Francés Autodidacta",
    iconName: "BookOpen",
    badge: ">80% afinidad léxica",
    description: "5 estrategias clave, lecciones de YouTube, lectura adaptada, auto-dictados y método de 15-20 min diarios.",
    keyResources: ["Le Petit Prince", "Parole de France (Ohlalafrancés)", "YouTube 100 mots (A1/A2)", "Tandem", "Anki"],
    sampleQuestions: [
      "¿Cuáles son las 5 estrategias clave para aprender francés?",
      "¿Cómo mejorar la expresión oral en francés si no tengo profesor?",
      "¿Cómo funciona el método de transcripción y auto-dictados en francés?",
      "¿Por qué el francés resulta tan accesible para los hispanohablantes?"
    ]
  },
  {
    id: "italiano",
    name: "Italiano y Cultura",
    iconName: "Sparkles",
    badge: "Hermana Romance",
    description: "Prensa deportiva, grandes clásicos del cine en V.O., los 10 mejores libros, 5 PDFs gratis y fonética.",
    keyResources: ["La Gazzetta Dello Sport", "Bar Italia", "Nuova grammatica pratica (Susanna Nocchi)", "La vita è bella", "Nuovo Espresso"],
    sampleQuestions: [
      "¿Por qué se aconseja leer prensa deportiva como La Gazzetta Dello Sport para empezar?",
      "¿Cuáles son los 10 mejores libros seleccionados por Europass para estudiar italiano?",
      "Que 5 libros en PDF gratuitos para aprender italiano se recomiendan?",
      "¿Cuáles son las 10 mejores películas italianas en versión original recomendadas?",
      "Cuéntame más sobre el libro 'Bar Italia' y la 'Nuova grammatica' de Susanna Nocchi.",
      "¿Por qué la película 'La vita è bella' es ideal para practicar italiano en V.O.?"
    ]
  },
  {
    id: "ingles",
    name: "Inglés Autodidacta",
    iconName: "Globe2",
    badge: "Lengua Franca",
    description: "Fonética prioritaria, vocabulario nuclear de 1000-1500 palabras, plan intensivo de 3 meses vs plan a 1 año.",
    keyResources: ["BBC 6 Minute English", "Talking Method", "Preply", "Duolingo/Babbel"],
    sampleQuestions: [
      "¿En qué orden exacto se debe estudiar el inglés?",
      "¿Cómo funciona el plan intensivo de 3 meses para inglés básico funcional?",
      "¿Se puede alcanzar un nivel B1-B2 en 1 año como autodidacta y cómo organizarlo?",
      "¿Cuál es la mayor barrera al aprender inglés y cómo superarla?"
    ]
  },
  {
    id: "japones",
    name: "Japonés y Kanji",
    iconName: "Languages",
    badge: "Noken & Kanji",
    description: "Paso 1: Hiragana y Katakana obligatorios, preparación JLPT/Noken N5-N1, Minna no Nihongo, Heisig y JapanesePod101.",
    keyResources: ["Minna no Nihongo", "Basic Kanji Book", "A Dictionary of Basic Japanese Grammar", "Obenkyo", "JapanesePod101"],
    sampleQuestions: [
      "¿Por qué es obligatorio memorizar Hiragana y Katakana antes de tocar los kanji?",
      "¿Qué pros y contras tiene el método JapanesePod101.com y cómo suplir la falta de expresión oral?",
      "¿Qué libros de kanji se recomiendan?",
      "¿Cuál es la joya indispensable para dudas de gramática japonesa?"
    ]
  },
  {
    id: "metodos",
    name: "Métodos, OKR y Hábitos",
    iconName: "Calendar",
    badge: "Productividad",
    description: "Sistema OKR semanal, descanso de 2 días a la semana (evitar burnout), rotación de 4 habilidades y diario de idiomas.",
    keyResources: ["Sistema OKR", "Regla de los 5 minutos", "Curva de olvido de Ebbinghaus", "Diario de aprendizaje"],
    sampleQuestions: [
      "¿Cómo aplicar el sistema OKR con Objetivos y Resultados Clave al estudio de idiomas?",
      "¿Por qué se recomienda no estudiar más de 5 días a la semana?",
      "¿Cómo ayuda un diario de aprendizaje de idiomas y qué escribir en él?",
      "¿Qué dice la curva de olvido de Ebbinghaus sobre la retención a las 24 horas y al mes?"
    ]
  },
  {
    id: "estancamiento",
    name: "Superar el Estancamiento",
    iconName: "Flame",
    badge: "Meseta B1-B2",
    description: "Curva de las 50 horas (Anders Ericsson), zona de confort en piloto automático y 6 estrategias de políglotas.",
    keyResources: ["Peak de Ericsson & Pool", "El obstáculo es el camino", "Tutores en Preply", "Inmersión en el hogar"],
    sampleQuestions: [
      "¿Por qué ocurre el estancamiento lingüístico a las ~50 horas de práctica?",
      "¿Cuáles son las 6 estrategias principales para romper la meseta B1/B2?"
    ]
  }
];

export const ITALIAN_BOOKS: BookRecommendation[] = [
  {
    title: "Bar Italia",
    language: "Italiano",
    type: "Texto",
    level: "A1 a C1",
    description: "Artículos de prensa real sobre hábitos, costumbres y sociedad italiana organizados por nivel de dificultad, con ejercicios y soluciones."
  },
  {
    title: "Una parola tira l'altra (Vol. 1)",
    language: "Italiano",
    type: "Vocabulario",
    level: "Principiantes (A1)",
    description: "22 unidades temáticas cotidianas (familia, restaurante, tiempo, casa) con imágenes lúdicas e irónicas y soluciones."
  },
  {
    title: "Una parola tira l'altra 2",
    language: "Italiano",
    type: "Vocabulario",
    level: "Intermedio (A2-B1)",
    description: "18 unidades de vocabulario profundo, artículos periodísticos, extractos literarios, juegos de rol y crucigramas."
  },
  {
    title: "Nuova grammatica pratica della lingua italiana",
    language: "Italiano",
    type: "Gramática",
    level: "A2 a B2",
    description: "La prestigiosa gramática de Susanna Nocchi. Normas claras, paneles útiles de formas lingüísticas, ejercicios y autoevaluaciones."
  },
  {
    title: "Grammatica avanzata della lingua italiana",
    language: "Italiano",
    type: "Gramática",
    level: "B1 a C1",
    description: "Normas gramaticales y matices avanzados no habituales en libros estándar para extranjeros, con temas culturales de Italia."
  },
  {
    title: "I verbi italiani",
    language: "Italiano",
    type: "Gramática",
    level: "A1 a C1",
    description: "Monografía completa de tiempos y modos verbales, verbos regulares/irregulares, uso de auxiliares (essere/avere) y subjuntivo."
  },
  {
    title: "Ricette per parlare (ALMA Edizioni)",
    language: "Italiano",
    type: "Oral / Comics",
    level: "A1 a C1",
    description: "Enfoque dinámico para expresión oral con cuestionarios, juegos de mesa, debates y entrevistas estructuradas."
  },
  {
    title: "L'italiano con i fumetti (5 volúmenes)",
    language: "Italiano",
    type: "Oral / Comics",
    level: "A1 a B2",
    description: "Colección de cómics con historias ilustradas: 'Roma 2050 d.C.', 'Una storia italiana', 'Il mistero di Casanova', 'Rigoletto' y 'Habemus Papam'."
  },
  {
    title: "Le parole italiane",
    language: "Italiano",
    type: "Vocabulario",
    level: "A1 a C1",
    description: "Dos partes: sección léxica con expresiones auténticas y sección gramatical sobre formación de palabras, prefijos, sufijos y palabras compuestas."
  },
  {
    title: "Nuovo Espresso (6 volúmenes)",
    language: "Italiano",
    type: "Texto",
    level: "A1 a C2",
    description: "Método integral con libros de estudiante y ejercicios, audios y episodios de video de la vida cotidiana de cuatro amigos."
  },
  {
    title: "5 PDFs Gratuitos de Italiano",
    language: "Italiano",
    type: "PDF Gratuito",
    level: "Todos los niveles",
    description: "1) Gramática italiana (25 p.), 2) Curso de gramática (32 p.), 3) Pronunciación y entonación (18 p.), 4) Diccionario básico (2 p.), 5) Curso en 40 lecciones (160+ p.)."
  }
];

export const JAPANESE_BOOKS: BookRecommendation[] = [
  {
    title: "Minna no Nihongo",
    language: "Japonés",
    type: "Texto",
    level: "Inicial a Intermedio",
    description: "El método clásico por excelencia con audios reales y ejercicios intensos.",
    pros: "Muy completo, estructurado e intenso",
    cons: "Completamente en japonés; autodidactas necesitan libro de notas y traducción. Flojo en kanji."
  },
  {
    title: "Marugoto: Lengua y cultura japonesa",
    language: "Japonés",
    type: "Texto",
    level: "A1 hasta B1-2 (6 niveles)",
    description: "Creado por la Fundación Japón. Enfoque comunicativo con libro de texto y ejercicios por cada nivel.",
    pros: "Alineado con estándares oficiales de Fundación Japón",
    cons: "Demasiado romaji en las primeras etapas."
  },
  {
    title: "Shin Nihongo no Kiso",
    language: "Japonés",
    type: "Texto",
    level: "Principiante a Intermedio",
    description: "Popular en programas de intercambio en Japón para acelerar el aprendizaje.",
    pros: "Muy completo, rápido avance y muchos ejercicios prácticos",
    cons: "En japonés; imprescindible comprar audio y notas gramaticales."
  },
  {
    title: "Basic Kanji Book (Vol. 1 y 2)",
    language: "Japonés",
    type: "Kanji",
    level: "N5 a N3 (500 + 1000 kanji)",
    description: "Cuadrículas de escritura, orden de trazos, lecturas On y Kun, vocabulario compuesto y ejercicios de lectura y redacción.",
    pros: "Excelente metodología pedagógica paso a paso",
    cons: "Explicaciones en inglés."
  },
  {
    title: "Recordando los kanji (Remembering the Kanji - Heisig)",
    language: "Japonés",
    type: "Kanji",
    level: "N5 a N1 (2000+ kanji)",
    description: "Método mnemotécnico basado en la descomposición de radicales e historias imaginativas para recordar el significado de cada kanji.",
    pros: "Ahorra tiempo y elimina el bloqueo mental con los ideogramas",
    cons: "No enseña lecturas On/Kun; se deben buscar por separado."
  },
  {
    title: "A Dictionary of Basic Japanese Grammar",
    language: "Japonés",
    type: "Gramática",
    level: "Básico (ampliable a intermedio y avanzado)",
    description: "Obra de Seiichi Makino y Michio Tsutsui. Considerada la joya obligatoria de referencia para cualquier duda gramatical.",
    pros: "Exhaustivo, ejemplos abundantes y distinciones sutiles",
    cons: "En inglés."
  },
  {
    title: "Nihongo: Japonés para hispanohablantes",
    language: "Japonés",
    type: "Gramática",
    level: "Principiante",
    description: "Gramática redactada en español enfocada en las dificultades específicas y contrastes del hablante de español.",
    pros: "Completamente en español y muy didáctico",
    cons: "Se queda corto para niveles intermedios y avanzados."
  }
];

export const ITALIAN_MOVIES: MovieRecommendation[] = [
  {
    title: "La vida es bella",
    originalTitle: "La vita è bella",
    director: "Roberto Benigni",
    year: "1997",
    actors: "Roberto Benigni, Nicoletta Braschi",
    summary: "Guido Orefice y su hijo Giosuè son deportados a un campo de concentración; Guido finge que todo es un juego para proteger la inocencia de su hijo. Un placer para escuchar el italiano vivo y emotivo."
  },
  {
    title: "El bueno, el malo y el feo",
    originalTitle: "Il buono, il brutto, il cattivo",
    director: "Sergio Leone",
    year: "1966",
    actors: "Clint Eastwood, Lee Van Cleef, Eli Wallach",
    summary: "La cumbre del 'spaghetti western' con la inolvidable música de Ennio Morricone. Tres pistoleros buscan un cargamento de oro durante la Guerra de Secesión."
  },
  {
    title: "Érase una vez en América",
    originalTitle: "Once Upon a Time in America",
    director: "Sergio Leone",
    year: "1984",
    actors: "Robert De Niro, James Woods",
    summary: "Magna obra italoamericana de Sergio Leone sobre la vida del mafioso Noodles desde el gueto judío neoyorquino en la Prohibición hasta los años 60."
  },
  {
    title: "Otto e mezzo (8½)",
    originalTitle: "8½",
    director: "Federico Fellini",
    year: "1963",
    actors: "Marcello Mastroianni, Anouk Aimée",
    summary: "Obra maestra de Fellini sobre el director Guido Anselmi en crisis creativa y sentimental mientras prepara su próxima película."
  },
  {
    title: "La Dolce Vita",
    originalTitle: "La Dolce Vita",
    director: "Federico Fellini",
    year: "1960",
    actors: "Marcello Mastroianni, Anita Ekberg",
    summary: "Palma de Oro en Cannes. Una semana en la vida mundana del periodista Marcello Rubini en la Roma de los años 60 en busca de felicidad."
  },
  {
    title: "La escapada",
    originalTitle: "Il sorpasso",
    director: "Dino Risi",
    year: "1962",
    actors: "Vittorio Gassman, Jean-Louis Trintignant",
    summary: "Retrato magistral del milagro económico italiano de los 60: un vividor y un tímido estudiante de derecho recorren Italia en un Lancia Aurelia."
  },
  {
    title: "El gatopardo",
    originalTitle: "Il Gattopardo",
    director: "Luchino Visconti",
    year: "1963",
    actors: "Burt Lancaster, Alain Delon, Claudia Cardinale",
    summary: "Palma de Oro en Cannes. Ambientada en el desembarco de Garibaldi en Sicilia en 1860, retrata la caída de la aristocracia italiana."
  },
  {
    title: "Gomorra (Serie)",
    originalTitle: "Gomorra - La serie",
    director: "Basada en la obra de Roberto Saviano",
    year: "2014",
    summary: "Serie de televisión sobre la lucha implacable entre clanes de la Camorra en Nápoles. Ideal para familiarizarse con dialectos y acentos."
  }
];
