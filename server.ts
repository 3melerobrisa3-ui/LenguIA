import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Complete Knowledge Base extracted from the documents
const SYSTEM_KNOWLEDGE_PROMPT = `
Eres un asistente de inteligencia artificial que responde ÚNICAMENTE utilizando la información presente en los documentos proporcionados sobre el aprendizaje de idiomas de forma autodidacta.

REGLAS FUNDAMENTALES Y ESTRICTAS DE RESPUESTA (MÁXIMA PRIORIDAD):
1. PREGUNTAS NO RELACIONADAS CON LAS FUENTES O LOS IDIOMAS:
   - Si se te pregunta algo no relacionado con las fuentes o los idiomas (por ejemplo: cocina, ciencia, tecnología, matemáticas, deportes no tratados, política, historia general, geografía, cultura general, programación, el clima, entretenimiento ajeno, etc.):
     Tu respuesta DEBE ser única, exacta y textualmente:
     "No tengo esa informacion disponible."
   - No agregues explicaciones, justificaciones, disculpas ni ningún texto adicional: responde únicamente esa frase exacta.

2. PREGUNTAS DE TRADUCCIÓN O CÓMO SE DICE UNA PALABRA/FRASE ("CÓMO SE DICE X EN Y IDIOMA"):
   - Si se te pregunta cómo se dice, traduce o escribe una palabra o frase en cualquier idioma (por ejemplo: "¿cómo se dice ... en ...?", "¿cómo se traduce ...?", etc.):
     Tu respuesta DEBE ser única, exacta y textualmente:
     "No puedo responderte, ya que no soy un traductor, estoy aqui para ayudarte con tecnicas especìficas para cada idioma"
   - No agregues explicaciones, justificaciones, disculpas ni ningún texto adicional: responde únicamente esa frase exacta.

3. BASE DE CONOCIMIENTO ESTRICTA Y EXCLUSIVA PARA PREGUNTAS SOBRE IDIOMAS O FUENTES:
   - Responde únicamente utilizando la información presente en los documentos subidos.
   - Si la respuesta a una pregunta relacionada con los idiomas o las fuentes no se encuentra en el documento (por ejemplo dudas sobre otros idiomas como alemán, ruso, o temas no tratados en los textos), responde exactamente:
     "Lo siento, pero no dispongo de esa información en la base de datos proporcionada."
   - No utilices conocimientos externos, ni hagas suposiciones fuera del texto brindado.
   - No agregues explicaciones adicionales, disculpas ampliadas ni sugerencias cuando la información no se encuentre en el documento: responde únicamente la frase indicada.

3. PROHIBICIÓN ESTRICTA DE CITAR FUENTES O PROCEDENCIA:
   - NUNCA digas de dónde proviene la información. Está terminantemente prohibido usar frases como "según los archivos", "según tal documento", "según la guía", "los documentos señalan", "en la base documental", o similares.
   - Responde de forma directa, autoritativa y clara lo que se te pregunta sin citar fuentes ni procedencia.

4. Tu rol:
   - Actúas con amabilidad, rigor pedagógico y claridad absoluta, explicando siempre los métodos, libros, películas, aplicaciones y estrategias exactas presentes en el texto.
   - Respondes en español (o en el idioma que te hable el usuario si solicita practicar).
   - Cuando recomiendes recursos, menciona los pros, contras, niveles (A1 a C2 o N5 a N1 en japonés) y autores de forma directa.

CONOCIMIENTO INTEGRAL DE LOS ARCHIVOS:

1. FILOSOFÍA GENERAL Y HÁBITOS DE APRENDIZAJE:
- Regla de Oro de la Constancia: Es preferible estudiar 15 a 30 minutos diarios durante un año que 4 horas una vez por semana. El cerebro consolida lo que revisa con frecuencia a intervalos cercanos.
- Curva del Olvido de Ebbinghaus: A las 24 horas solo se retiene el 33% de la información aprendida; a los 2 días el 28%, y a los 31 días solo el 20%. La repetición espaciada es indispensable.
- Tipos de Motivación:
  * Motivación instrumental: Busca un objetivo financiero o social concreto (negocios, trabajo en el extranjero). Suele generar una gramática y uso más prolijos.
  * Motivación integradora: Nace del deseo de integrarse a una nueva cultura, hablar con amigos o familiares extranjeros. Fomenta mejor fluidez y éxito a largo plazo, tolerando más errores al inicio. Se debe buscar un equilibrio saludable entre ambas.
- Objetivos Cuantificables y SMART: «Dominar un idioma» es abstracto. La meta debe responder a un «sí» o «no» categórico con fecha límite (ejemplo: "mantener una conversación básica de 5 minutos sobre mis hobbies en 2 meses" o "aprender 100 palabras nuevas en un mes").
- Inmersión en Casa: Cambiar el idioma de los teléfonos y dispositivos, búsquedas en Google y YouTube en la lengua meta, escuchar música y leer noticias.
- Aprender varios idiomas a la vez: Se aconseja concentrarse en uno. Si se aprenden dos, deben ser radicalmente distintos (ejemplo: español y japonés) para evitar interferencias.
- Mitos desmentidos: "Aprender mientras duermes" es una pérdida de tiempo. Los resultados provienen de un estudio concentrado. Quitar subtítulos en la TV o películas, ya que con subtítulos en tu lengua materna solo estás leyendo en lugar de escuchar.
- Tolerancia a la ambigüedad: Imprescindible aceptar que no se entenderá todo al inicio. No obsesionarse con buscar cada palabra desconocida; centrarse en el contexto general.

2. PLANIFICACIÓN CON SISTEMA OKR Y HORARIO SEMANAL:
- Origen: Técnica de fijación de metas nacida en los años 50 y usada por empresas como Google, Spotify y Amazon.
- Componentes:
  * Objetivo (O): El resultado final ambicioso (ej. Mudarse a otro país, aprobar nivel B2, mantener conversaciones laborales).
  * Resultados Clave (KR): Acciones concretas y medibles de productividad (hasta 3 por objetivo, ej. leer 5 páginas, escuchar 30 min de podcast, hablar con intercambio).
- Agenda Semanal: Planificar semana a semana (no por mes ni por año).
- Límite de 5 días a la semana: Estudiar máximo 5 días a la semana; descansar 2 días para permitir la consolidación neuronal y evitar el agotamiento (burnout).
- Rotación de las 4 competencias: Alternar comprensión auditiva (listening), comprensión lectora (reading), expresión escrita (writing) y expresión oral (speaking).
- Registro de horas: Medir horas planificadas vs. horas realmente estudiadas.
- Controles rutinarios mensuales: Preguntarse en un diario qué se logró, qué fue lo más y menos comprendido, y reajustar actividades.

3. CÓMO SUPERAR EL ESTANCAMIENTO / MESETA LINGÜÍSTICA (B1 - B2):
- La Meseta de las 50 Horas (Anders Ericsson y Robert Pool en "Peak"): A las ~50 horas de práctica en cualquier habilidad, el cerebro entra en "piloto automático", se refugia en la zona de confort y se frena la mejora.
- 6 Estrategias para superarlo:
  1. Revisar los motivos ("por qué" tangible y emocional, no superficial como "parecer guay").
  2. Fomentar la disciplina: Usar la "Regla de los 5 minutos" (obligarse a hacer solo 5 minutos; arrancar es lo más difícil y luego fluye).
  3. Cambiar de actividades: Variar inputs (escuchar/leer) y outputs (escribir/hablar). Probar videojuegos, audios creativos, diarios.
  4. Clases particulares con nativo (ej. en Preply): Esencial para romper la repetición de las mismas palabras y recibir feedback objetivo sobre matices y naturalidad.
  5. Inmersión ambiental estricta en el hogar.
  6. Psicología y mentalidad: El obstáculo es el camino (Ryan Holiday); ver la meseta como un reto de crecimiento, no como una tragedia. Celebrar cada pequeña victoria.

4. EL DIARIO DE APRENDIZAJE DE IDIOMAS:
- Beneficios: Seguimiento espontáneo sin juzgarse, reducción del estrés, registro de hábitos productivos.
- Uso dual: Espacio creativo libre para escribir pensamientos y emociones en la lengua meta (ejercita la expresión al igual que hablar) + herramienta de análisis para llevar dudas gramaticales al tutor ("¿Qué pasado uso aquí?", "¿Por qué se dice X en vez de Y?").

5. GUÍA ESPECÍFICA PARA INGLÉS:
- Estado: Lengua franca global, indispensable en todas las áreas de desarrollo, oficial o con estatus especial en 75 territorios.
- Secuencia de aprendizaje recomendada:
  1. Fonética básica: Crucial aprenderla primero porque es casi imposible corregir malos hábitos fosilizados más tarde (ej. diferencia entre sheep y ship, la "th" de think).
  2. Gramática básica: Presente simple, artículos (a, an, the), pronombres personales.
  3. Vocabulario nuclear (core): 1000 - 1500 palabras más frecuentes, que cubren el ~80% de las conversaciones cotidianas.
  4. Estructuras avanzadas: Pasado simple -> futuro (going to / will) -> tiempos perfectos -> condicionales -> voz pasiva.
- Metas temporales:
  * Plan intensivo de 3 meses: Nivel básico funcional. 500 palabras clave, estructuras básicas, mínimo 2 horas diarias en bloques de 30-40 min, inmersión y plataformas como Talking Method.
  * Plan a 1 año: Nivel intermedio B1-B2 desde cero dedicando 1 a 2 horas diarias (60% estudio formal, 40% contenido auténtico). Hitos: Mes 1-2 (A1 básico), Mes 3-4 (A1 consolidado), Mes 5-7 (A2), Mes 8-10 (B1), Mes 11-12 (B1 consolidado y aproximación a B2).
- Recursos de audio: Podcast "Inglés de 6 minutos" de la BBC.

6. GUÍA ESPECÍFICA PARA FRANCÉS:
- Origen: Lengua romance derivada del latín vulgar durante ~800 años. Oficial en 29 países + Francia, Mónaco, partes de Suiza, Bélgica, Quebec (Canadá) y la ONU.
- Ventaja para hispanohablantes: Más del 80% de las palabras francesas están emparentadas con el español, lo que facilita enormemente el vocabulario.
- Las 5 Estrategias Clave para autodidactas:
  1. Objetivos tangibles y realistas (aprender 100 palabras nuevas en un mes, leer 1 artículo por semana).
  2. Lecciones gratuitas en YouTube de vocabulario: Videos "100 mots niveau A1" y "100 mots niveau A2".
  3. Comprensión escrita con textos adaptados: Clásicos accesibles como "Le Petit Prince" y el e-book "Parole de France" (con audios para pronunciación, 12,95€ de Ohlalafrancés).
  4. Expresión oral sin profesor: Hablar consigo mismo en voz alta (describir objetos, rutinas, contar el día), técnica de imitación/shadowing de nativos (películas y videos), e intercambios online en Tandem.
  5. Ortografía y gramática mediante transcripción y copia a mano: Elegir un texto de tu nivel, entenderlo, copiar frase por frase a mano para asimilar la estructura, y hacer "auto-dictados" grabándose con el móvil.
- Organización: 15 a 20 minutos diarios bastan si hay regularidad.

7. GUÍA ESPECÍFICA PARA ITALIANO:
- Características: Es el idioma más parecido al castellano entre las grandes lenguas (más que el francés o inglés). Ambas son romances de raíz latina. Ejemplos de palabras similares: abbandonare (abandonar), acrobazia (acrobacias), bottone (botón), casseruola (cacerola), elicottero (helicóptero), emozione (emoción).
- Estatus: Oficial en Italia y San Marino; cooficial en Ticino y Grigioni (Suiza); segundo idioma en el Vaticano; presencia en Istria (Eslovenia/Croacia). Es la 5ª lengua más hablada de forma no nativa en el mundo y el 5º idioma más estudiado mundialmente (en EE.UU. y Reino Unido es el 4º, en Japón el 3º, en Canadá el 2º después del francés).
- Métodos de lectura:
  * Empezar con periódicos deportivos (vocabulario y gramática sencillos): La Gazzetta Dello Sport, Corriere Dello Sport, Tuttosport, Il Secolo.
  * Prensa gratuita: Metro, City, DNews, Leggo.
  * Prensa formal y rica: Corriere della Sera, La Repubblica, La Stampa, Sole 24 ORE.
  * Evitar comenzar por novelas para no ponerse el listón demasiado alto; más adelante clásicos como "La Divina Comedia" de Dante Alighieri adaptada o libros bilingües.
- Cine italiano y películas recomendadas en V.O.:
  * Directores y figuras: Sergio Leone, Roberto Benigni, Federico Fellini, Ettore Scola, Bernardo Bertolucci, Dino Risi, Luchino Visconti, Martin Scorsese.
  * Actores: Marcello Mastroianni, Mario Girotti (Terence Hill), Sophia Loren, Monica Bellucci, Claudia Cardinale, Ornella Muti, Monica Vitti, Robert De Niro.
  * Top 10 películas/series:
    1. Érase una vez en América (Once Upon a Time in America, Sergio Leone, Robert De Niro).
    2. El bueno, el malo y el feo (Il buono, il brutto, il cattivo, Sergio Leone, Clint Eastwood, BSO Ennio Morricone).
    3. La vida es bella (La vita è bella, Roberto Benigni).
    4. Otto e mezzo (8½, Federico Fellini, Marcello Mastroianni).
    5. La Dolce Vita (Federico Fellini, Marcello Mastroianni, Palma de Oro en Cannes).
    6. Una mujer y tres hombres y nos habíamos querido tanto (C'eravamo tanto amati, Ettore Scola).
    7. La escapada (Il sorpasso, Dino Risi, Vittorio Gassman).
    8. El gatopardo (Il Gattopardo, Luchino Visconti, Burt Lancaster, Alain Delon, Claudia Cardinale).
    9. Gomorra (serie de televisión de 2014 sobre la Camorra napolitana, novela de Roberto Saviano).
    10. Roma Criminal (Romanzo Criminale, serie de 12 episodios en 2 temporadas).
- Música italiana: Ópera clásica con Luciano Pavarotti; música popular con Eros Ramazzotti y Laura Pausini.
- Podcasts en italiano: "Italiano piano piano", "News in slow Italian".
- Aplicaciones y webs: Busuu, Duolingo, Babbel, Talk Italian (BBC), Italki, plataforma "Global General" de GlobalExam (para niveles debutante e intermedio), onlineitalianclub.com, edutinacademy.com.
- Los 10 mejores libros para aprender italiano:
  1. "Bar Italia" (artículos culturales por niveles A1 a C1 extraídos de prensa con ejercicios y soluciones).
  2. "Una parola tira l'altra" (principiantes, 22 unidades temáticas cotidianas con ilustraciones y soluciones).
  3. "Una parola tira l'altra 2" (intermedio, 18 unidades, artículos y pasajes literarios, crucigramas y juegos de rol).
  4. "Nuova grammatica pratica della lingua italiana" de Susanna Nocchi (de las más prestigiosas, niveles A2 a B2).
  5. "Grammatica avanzata della lingua italiana" (niveles B1 a C1).
  6. "I verbi italiani" (dedicado enteramente a tiempos y modos verbales, auxiliares, subjuntivo, niveles A1 a C1).
  7. "Ricette per parlare" de ALMA edizioni (expresión oral divertida, juegos de mesa, entrevistas, A1 a C1).
  8. "L'italiano con i fumetti" (cómics de 5 volúmenes: Roma 2050 d.C., Una storia italiana, Il mistero di Casanova, Rigoletto, Habemus Papam).
  9. "Le parole italiane" (léxico y formación de palabras, prefijos, sufijos, sinónimos, antónimos, A1 a C1).
  10. "Nuovo Espresso" (colección de 6 niveles A1 a C2 con audios, videos y autoevaluaciones).
- 5 libros gratuitos en PDF para descargar:
  1. Gramática italiana en PDF (25 páginas, fundamentos básicos).
  2. Curso de gramática italiana en PDF (32 páginas, explicaciones intuitivas y ejercicios).
  3. Pronunciación y entonación del italiano en PDF (18 páginas, fonética y sonidos).
  4. Diccionario de palabras básicas español-italiano en PDF (2 páginas, ideal para viajes).
  5. Curso de italiano en 40 lecciones en PDF (160+ páginas, desde lo básico hasta nivel avanzado).

8. GUÍA ESPECÍFICA PARA JAPONÉS:
- Características y contraste con el español:
  * Es radicalmente distinto en filosofía, gramática y sistema de escritura.
  * Sin embargo, el español es una lengua gramaticalmente tan potente y versátil que es capaz de asimilar casi por completo la estructura japonesa si se estudia ordenadamente.
- Primer paso obligatorio: Aprender de memoria los silabarios Hiragana y Katakana. ¡No empezar directamente por Kanji! Tablas de Yoshida y de Fundación Japón con orden de trazos.
- Gramática y ruta: Seguir un libro de texto estructurado y prepararse para el Noken (JLPT: Nihongo Noryoku Shiken), que va del N5 (más bajo) al N1 (más alto). Con nivel N3 se puede comprender y viajar con soltura por Japón. Para kanji también existe el examen Kanken (Kanji Kentei Shiken).
- Libros de texto de japonés:
  * "Minna no Nihongo": Muy completo e intenso, con audios reales, pero requiere el libro de traducción de gramática y explicaciones para autodidactas. Flojo en kanji.
  * "Marugoto: Lengua y cultura japonesa": Estándar de la Fundación Japón, 6 niveles (A1 a B1-2). Contra: exceso de romaji.
  * "Shin Nihongo no Kiso": Método rápido muy usado en intercambios universitarios en Japón. Totalmente en japonés pero con cuadernillo de respuestas.
  * "Japanese for Busy People": Orientado al ámbito laboral y negocios. Escrito en kana/romaji, no profundiza en kanji. Sólo en inglés.
  * "Japonés desde cero": Traducido al español, muy ameno y gradual, pero no incluye katakana ni kanji.
- Libros de Kanji:
  * "Basic Kanji Book" (Vol 1 y 2): 500 kanji elementales y 1000 intermedios con orden de trazos, lecturas y cuadrículas. En inglés.
  * "Kanji in Context": Cubre los 2136 joyo kanji y 10.000 palabras asociadas. Para nivel intermedio-avanzado.
  * "Recordando los kanji" (Remembering the Kanji) de James Heisig: Método mnemotécnico basado en historias e imaginación para recordar formas y significados. Contra: no incluye las lecturas On y Kun (el autor sugiere buscarlas por separado).
  * "Kanji para recordar", "Japonés en viñetas" (manga y gramática), "Japonés para viajar".
- Libros de Gramática y Diccionarios:
  * "A Dictionary of Basic Japanese Grammar" (Makino & Tsutsui): La auténtica biblia/joya imprescindible para cualquier estudiante. También ediciones de intermedio y avanzado (en inglés).
  * "Nihongo: Japonés para hispanohablantes": Excelente gramática explicada en español enfocada en las dudas comunes de hispanohablantes.
  * "Koi: Manual básico de japonés": En español, libro de consulta con muchos ejemplos.
  * "Diccionario japonés-español de Hakusuisha": Diccionario en papel clásico de gran calidad.
  * "All About Particles": Dedicado a 69 partículas japonesas y sus matices (en inglés).
  * "Japanese Verbs at a Glance": Tablas de conjugación y uso de verbos.
  * "Kodansha's Effective Japanese Usage Dictionary": Para distinguir matices de palabras sinónimas.
  * "Love, Hate and Everything in Between": Expresión de emociones y sentimientos.
- Recursos online y plataformas:
  * Diccionarios: Jisho.org (el más completo en inglés/japonés) y Japonesonline.com (más de 32.000 entradas en español).
  * NHK "Hablemos en japonés" (lecciones gratuitas en audio de 10 min con diálogos estructurados).
  * Fundación Japón: "El reto de Erin" (lecciones lúdicas culturales), "Minato" (cursos interactivos y comunidad), "Anime Manga no Nihongo" (expresiones cotidianas del anime).
  * "Proyecto Cóndor" (de la Universidad de Estudios Extranjeros de Tokio, materiales didácticos gratuitos de kanji diseñados para niños hispanohablantes en Japón).
  * Clases en línea: Wabasi (cursos 100% online en diferido con profesores).
  * Corrección de redacciones: Lang-8.com.
- Aplicaciones móviles para japonés:
  * Obenkyo (¡en español! hiragana, katakana, kanji, partículas, tarjetas y reconocimiento de escritura).
  * Duolingo (seleccionar inglés como idioma de la app para ver el curso de japonés).
  * WaniKani (memorización de kanji joyo y 6.000 palabras).
  * Genki Vocab, Basic Kanji Plus, Tae Kim's Guide to Learning Japanese (gramática pura).
  * Kanji Study (excelente para lectura y trazos), Kanji Recognizer (para buscar dibujando a mano el kanji desconocido), Anki, Google Translate.
- Análisis crítico y uso de JapanesePod101.com:
  * Pros: Miles de lecciones en audio/video/PDF, diálogos con actores profesionales con historias entretenidas como dramas, cursos de preparación para JLPT N5, N4 y N3, notas descargables.
  * Contras: Demasiada charla intrascendente en inglés al inicio, bombardeo de correos promocionales, no incluye preparación JLPT N1-N2, y lo más importante: NO enseña a hablar con fluidez oral.
  * Estrategias para suplir la falta de expresión oral:
    1. Foros de Skype para intercambios de conversación gratuitos (enseñar español/inglés a cambio de japonés).
    2. Si vives en Japón, buscar trabajo a tiempo parcial o ser profesor particular de idiomas (senseinavi, my-sensei, hello-sensei, enjoy-lesson, getstudents, teacher7; cobrar máx. 3000 yenes/hora y explicar gramática en japonés para practicar).

COMPORTAMIENTO COMO CHAT ESPECIALIZADO:
- Responde únicamente utilizando la información presente en los documentos subidos.
- Si la respuesta a una pregunta no se encuentra en el documento, responde exactamente: "Lo siento, pero no dispongo de esa información en la base de datos proporcionada."
- No utilices conocimientos externos, ni hagas suposiciones fuera del texto brindado.
- NUNCA digas "según los archivos" o "según tal documento"; responde directa y claramente a lo que se pregunta.
- Cuando el usuario pregunte por un idioma (francés, italiano, inglés o japonés), ofrece las recomendaciones exactas de libros, métodos, aplicaciones y consejos prácticos del documento correspondiente.
- Si preguntan sobre cómo organizar su tiempo, explica la técnica OKR semanal y el descanso de 2 días.
- Si preguntan sobre el estancamiento, cita la teoría de las 50 horas de Ericsson, la curva de Ebbinghaus y las 6 soluciones de políglotas.
- Estructura las respuestas con viñetas claras, títulos destacados y un tono directo y pedagógico.
`;

// Topic focus mapping to specialize responses when a button is selected
const TOPIC_FOCUS_MAP: Record<string, { name: string; focusPrompt: string }> = {
  frances: {
    name: "Francés Autodidacta",
    focusPrompt: `El usuario ha seleccionado el filtro temático de FRANCÉS. Debes centrar tu respuesta obligatoria y prioritariamente en el aprendizaje de FRANCÉS según la base de archivos:
- Resaltar la afinidad léxica (>80% de palabras emparentadas con el español).
- Las 5 estrategias clave: 1) Metas tangibles (100 palabras/mes), 2) Lecciones gratuitas de YouTube (100 mots A1 y A2), 3) Lecturas adaptadas (Le Petit Prince, e-book Parole de France con audios a 12,95€), 4) Expresión oral hablándose a uno mismo y shadowing, 5) Transcripción a mano y auto-dictados con el móvil.
- Rutina recomendada de 15 a 20 minutos diarios.
Cualquier duda que plantee el usuario (incluso si parece general) debes responderla y contextualizarla específicamente para el FRANCÉS.`
  },
  italiano: {
    name: "Italiano y Cultura",
    focusPrompt: `El usuario ha seleccionado el filtro temático de ITALIANO. Debes centrar tu respuesta obligatoria y prioritariamente en el aprendizaje de ITALIANO según la base de archivos:
- Explicar la cercanía con el castellano (la lengua más similar de las grandes lenguas).
- Métodos de lectura progresiva: comenzar con periódicos deportivos (La Gazzetta Dello Sport, Tuttosport) por su léxico sencillo; luego prensa gratuita y finalmente prensa general.
- Cine en versión original: Fellini (8½, La Dolce Vita), Benigni (La vida es bella), Sergio Leone, El Gatopardo, etc.
- Los 10 mejores libros de texto (Bar Italia, Nuova grammatica pratica de Susanna Nocchi, Una parola tira l'altra, Nuovo Espresso).
- Los 5 libros gratuitos en PDF para descargar.
Cualquier duda que plantee el usuario debes responderla y contextualizarla específicamente para el ITALIANO.`
  },
  ingles: {
    name: "Inglés Autodidacta",
    focusPrompt: `El usuario ha seleccionado el filtro temático de INGLÉS. Debes centrar tu respuesta obligatoria y prioritariamente en el aprendizaje de INGLÉS según la base de archivos:
- Secuencia obligatoria: 1) Fonética básica primero (diferenciar sheep/ship, sonido th interdental), 2) Gramática básica, 3) Vocabulario nuclear (1000-1500 palabras clave para el 80% de las conversaciones), 4) Tiempos verbales progresivos.
- Planes estructurados: Sprint de 3 meses (nivel funcional básico, 2h diarias en bloques de 30-40 min, Talking Method) vs Plan a 1 año (de cero a B1/B2 con 1-2h diarias).
- Podcasts: BBC 6 Minute English.
Cualquier duda que plantee el usuario debes responderla y contextualizarla específicamente para el INGLÉS.`
  },
  japones: {
    name: "Japonés y Kanji",
    focusPrompt: `El usuario ha seleccionado el filtro temático de JAPONÉS. Debes centrar tu respuesta obligatoria y prioritariamente en el aprendizaje de JAPONÉS según la base de archivos:
- Paso 1 obligatorio e innegociable: Aprender de memoria los silabarios Hiragana y Katakana con tablas de trazos ANTES de tocar los kanji.
- Preparación para el examen Noken (JLPT N5 a N1).
- Libros de texto recomendados: Minna no Nihongo (con notas gramaticales traducidas), Marugoto.
- Libros de kanji: Basic Kanji Book (Vol 1 y 2), Recordando los kanji de Heisig (mnemotecnia).
- Libros de gramática: 'A Dictionary of Basic Japanese Grammar' (la joya obligatoria).
- Análisis de JapanesePod101.com (pros, contras y cómo compensar la falta de expresión oral).
Cualquier duda que plantee el usuario debes responderla y contextualizarla específicamente para el JAPONÉS.`
  },
  metodos: {
    name: "Métodos, OKR y Hábitos",
    focusPrompt: `El usuario ha seleccionado el filtro temático de MÉTODOS, OKR Y HÁBITOS DE ESTUDIO. Debes centrar tu respuesta en:
- Metodología OKR semanal: Un Objetivo ambicioso (O) y hasta 3 Resultados Clave medibles (KR).
- La Regla de los 5 Días a la Semana: ¡Estudiar máximo 5 días a la semana y descansar 2 días! El descanso es indispensable para la consolidación neuronal de la memoria y evita el burnout.
- Curva del Olvido de Ebbinghaus: Retención del 33% a las 24 horas y solo 20% al mes; la constancia diaria (15-30 min) supera a maratones de 4 horas.
- El Diario de Aprendizaje de Idiomas: Herramienta sin juicios para redactar de forma espontánea y preparar dudas concretas para llevar al tutor.`
  },
  estancamiento: {
    name: "Superar el Estancamiento (Meseta Lingüística)",
    focusPrompt: `El usuario ha seleccionado el filtro temático de SUPERAR EL ESTANCAMIENTO / MESETA B1-B2. Debes centrar tu respuesta en:
- La meseta de las 50 horas documentada por Anders Ericsson y Robert Pool en 'Peak' (modo piloto automático y zona de confort).
- Las 6 Estrategias de Políglotas: 1) Revisar el 'por qué' con motivos emocionales tangibles, 2) Regla de los 5 minutos para vencer la pereza de inicio, 3) Cambiar radicalmente de actividades (videojuegos, podcasts, cómics), 4) Clases particulares con nativo en Preply para romper la repetición de palabras, 5) Inmersión total en casa, 6) Filosofía estoica de 'El obstáculo es el camino'.
- Diferencia entre motivación instrumental e integradora.`
  }
};

const TRANSLATION_REFUSAL_MESSAGE =
  "No puedo responderte, ya que no soy un traductor, estoy aqui para ayudarte con tecnicas especìficas para cada idioma";

// Helper to check if a query is asking for translations or "cómo se dice x en x idioma"
function isTranslationOrHowToSayQuery(text: string): boolean {
  if (!text) return false;
  const q = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['"«»“”¿?¡!.,;:()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (
    q.includes("como se dice") ||
    q.includes("como se dise") ||
    q.includes("como se diria") ||
    q.includes("como se traduce") ||
    q.includes("como se escribe") ||
    q.includes("como decir ") ||
    q.includes("como decir") ||
    q.includes("como traducir ") ||
    q.includes("como traducir") ||
    q.includes("how do you say") ||
    q.includes("how to say") ||
    q.includes("traduccion de ") ||
    q.includes("traduce ") ||
    q.includes("traducir ") ||
    q.startsWith("traduce") ||
    q.startsWith("traducir") ||
    q.startsWith("traduccion") ||
    q.includes("que significa ") ||
    q.includes("significado de ")
  ) {
    return true;
  }

  return false;
}

// Helper to check if a query is related to languages or sources/documents
function isQueryRelatedToLanguagesOrSources(text: string): boolean {
  const q = text.toLowerCase();
  const keywords = [
    "idioma", "idiomas", "lengua", "lenguas", "lenguaje", "vocabulario", "gramática", "gramatica",
    "pronunciación", "pronunciacion", "hablar", "escucha", "escuchar", "leer", "lectura", "escribir", "escritura",
    "traducción", "traduccion", "traducir", "aprender", "aprendizaje", "estudiar", "estudio", "políglota", "poliglota",
    "bilingüe", "bilingue", "fluidez", "método", "metodo", "técnica", "tecnica", "curso", "lección", "leccion",
    "francés", "frances", "italiano", "italiana", "inglés", "ingles", "japonés", "japones", "kanji",
    "hiragana", "katakana", "noken", "jlpt", "mcer", "a1", "a2", "b1", "b2", "c1", "c2",
    "ebbinghaus", "okr", "heisig", "benigni", "nocchi", "bar italia", "gazzetta", "minna no nihongo",
    "europass", "shadowing", "anki", "duolingo", "babbel", "preply", "podcast", "fuente", "fuentes",
    "documento", "documentos", "archivo", "archivos", "base de datos", "guía", "guia", "texto", "textos",
    "libro", "libros", "película", "pelicula", "subtítulos", "subtitulos", "meseta", "estancamiento",
    "intercambio", "tandem", "alemán", "aleman", "ruso", "chino", "portugués", "portugues", "árabe", "arabe",
    "autodidacta", "hábito", "habito", "fonética", "fonetica", "diccionario", "vocablos", "palabra", "palabras",
    "listening", "reading", "writing", "speaking", "oración", "oraciones", "verbo", "verbos"
  ];
  return keywords.some((k) => q.includes(k));
}

// Helper: fallback response generator in case GEMINI_API_KEY is not configured, busy, or offline
function generateFallbackResponse(userMessage: string, topicId?: string): string {
  const lower = userMessage.toLowerCase();

  // If asking "cómo se dice x en x idioma" or translation query:
  if (isTranslationOrHowToSayQuery(userMessage)) {
    return TRANSLATION_REFUSAL_MESSAGE;
  }

  // If the query is not related to the sources or languages, strictly return the required phrase
  if (!isQueryRelatedToLanguagesOrSources(userMessage)) {
    return "No tengo esa informacion disponible.";
  }

  // --- RESPUESTAS ESPECÍFICAS A PREGUNTAS PREDETERMINADAS Y PUNTUALES ---

  // 1. Pregunta: ¿Por qué la película 'La vita è bella' es ideal para practicar italiano en V.O.?
  if (
    lower.includes("vita è bella") ||
    lower.includes("vita e bella") ||
    lower.includes("vida es bella") ||
    (lower.includes("benigni") && (lower.includes("ideal") || lower.includes("película") || lower.includes("pelicula")))
  ) {
    return `### ¿Por qué «La vida es bella» (La vita è bella) es ideal para practicar italiano en V.O.?

1. **Léxico cotidiano, vivo y toscano**:
   - Toda la primera mitad del filme transcurre en la campiña de Arezzo (Toscana). El lenguaje que utiliza Guido Orefice está colmado de expresiones afectuosas, saludos populares, modismos cotidianos y humor espontáneo en un italiano auténtico y accesible.

2. **El recurso del «concurso de los 1000 puntos» para Giosué**:
   - Para proteger psicológicamente a su pequeño hijo de la tragedia del campo de concentración, Guido inventa que todo es un juego con normas estrictas cuyo ganador obtendrá un tanque militar real.
   - **Ventaja pedagógica**: Para sostener esta fantasía ante un niño de pocos años, Guido se ve forzado a utilizar **oraciones muy breves, vocabulario directo, instrucciones sencillas, constantes repeticiones y una dicción teatral sumamente pausada y articulada**. Esto convierte sus diálogos en el material de escucha más nítido y comprensible para un estudiante de nivel inicial e intermedio.

3. **Inferencia por contexto visual y gestual**:
   - La enorme expresividad física de Roberto Benigni y la intensidad dramática de cada escena facilitan inferir el significado de cualquier palabra desconocida por puro contexto visual.

*Consejo*: Se recomienda ver la película en audio original en italiano **sin subtítulos en español** (o con subtítulos en italiano), para educar el oído a la cadencia natural de la lengua y no caer en la trampa de limitarse a leer.`;
  }

  // 2. Pregunta: Cuéntame más sobre el libro 'Bar Italia' y la 'Nuova grammatica' de Susanna Nocchi
  if (
    lower.includes("bar italia") ||
    lower.includes("susanna nocchi") ||
    lower.includes("nuova grammatica")
  ) {
    return `### Análisis detallado: «Bar Italia» y «Nuova grammatica pratica della lingua italiana» (Susanna Nocchi)

#### 1. «Bar Italia» (de Annamaria Di Francesco y Ciro Massimo Naddeo)
* **Nivel**: A1 hasta C1.
* **Enfoque pedagógico**:
  - Es un libro de lectura y comprensión cultural basado en **artículos periodísticos y reportajes reales** extraídos de la prensa italiana sobre la sociedad, gastronomía, hábitos, arte y costumbres del país.
  - Los artículos están cuidadosamente clasificados por nivel de dificultad progresiva.
  - Cada lectura incluye actividades de comprensión lectora, ampliación de vocabulario contextualizado, ejercicios de producción escrita y su correspondiente **clave de soluciones**.
* **Por qué destaca**: Permite al estudiante sumergirse en la Italia contemporánea viva y real, conectando el aprendizaje del idioma con su cultura sin necesidad de recurrir a textos artificiales de academia.

---

#### 2. «Nuova grammatica pratica della lingua italiana» (de Susanna Nocchi)
* **Nivel**: A2 a B2 (nivel elemental a intermedio-avanzado).
* **Editorial**: Alma Edizioni.
* **Enfoque pedagógico**:
  - Es considerada por profesores y centros de idiomas como una de las obras de referencia indiscutibles para autodidactas.
  - Presenta las normas gramaticales de manera clara, visual e intuitiva, huyendo de explicaciones farragosas y utilizando **paneles de resumen, cuadros comparativos y ejemplos de la lengua hablada actual**.
  - Afronta con maestría las mayores dudas de los estudiantes (como el uso contrastado de *essere* vs *avere*, las preposiciones articuladas, los pronombres directos e indirectos combinados y los tiempos del pasado).
  - Cuenta con ejercicios de consolidación graduales, test de autoevaluación y solucionario al final del libro.

*Recomendación*: Ambos libros se complementan perfectamente: la obra de Susanna Nocchi proporciona el andamio gramatical riguroso, mientras que «Bar Italia» aporta la fluidez lectora y el baño cultural necesario.`;
  }

  // 3. Pregunta: ¿Por qué se aconseja leer prensa deportiva como La Gazzetta Dello Sport para empezar?
  if (
    lower.includes("gazzetta") ||
    lower.includes("prensa deportiva") ||
    lower.includes("tuttosport")
  ) {
    return `### ¿Por qué se aconseja leer prensa deportiva (como «La Gazzetta Dello Sport») para empezar?

1. **Sintaxis sencilla y párrafos directos**:
   - Las crónicas deportivas se redactan con frases breves, estructura sujeto-verbo-objeto muy clara y un estilo ágil sin subordinaciones complejas.

2. **Vocabulario altamente repetitivo y predecible**:
   - En periódicos como *La Gazzetta Dello Sport*, *Corriere Dello Sport* o *Tuttosport*, los términos sobre resultados, fichajes, jugadas, tácticas y emociones de los partidos se reiteran de una página a otra. Esta recurrencia permite asimilar léxico fundamental casi sin esfuerzo y sin tener que acudir continuamente al diccionario.

3. **Evitar la frustración temprana**:
   - Es un error común querer empezar leyendo literatura clásica o novelas complejas (como *La Divina Comedia* de Dante Alighieri). Ponerse un listón lingüístico inalcanzable al inicio solo genera agotamiento y abandono prematuro.

4. **Escalón intermedio en el itinerario de lectura**:
   - Se recomienda una progresión en tres fases:
     * **Paso 1**: Diarios deportivos (*La Gazzetta Dello Sport*, *Tuttosport*).
     * **Paso 2**: Prensa gratuita de distribución rápida (*Metro*, *City*, *Leggo*).
     * **Paso 3**: Prensa generalista y formal de gran tirada (*Corriere della Sera*, *La Repubblica*, *La Stampa*).`;
  }

  // 4. Pregunta: ¿Cuáles son los 10 mejores libros seleccionados por Europass para estudiar italiano?
  if (
    (lower.includes("10 mejores libros") || lower.includes("mejores libros") || lower.includes("libros de texto")) &&
    (lower.includes("italiano") || lower.includes("europass"))
  ) {
    return `### Los 10 Mejores Libros para Aprender Italiano (Selección Europass)

1. **«Bar Italia»**: Artículos culturales de prensa graduados de A1 a C1 sobre sociedad, costumbres y gastronomía italiana, con ejercicios y soluciones.
2. **«Una parola tira l'altra (Vol. 1)»**: Para principiantes (A1). 22 unidades temáticas cotidianas (familia, restaurante, compras, casa) con ilustraciones irónicas y lúdicas.
3. **«Una parola tira l'altra 2»**: Nivel intermedio (A2-B1). 18 unidades con ampliación de léxico, extractos literarios, crucigramas y juegos de rol.
4. **«Nuova grammatica pratica della lingua italiana» (Susanna Nocchi)**: Para niveles A2 a B2. La gramática de referencia más aclamada, con paneles visuales claros y ejercicios prácticos.
5. **«Grammatica avanzata della lingua italiana»**: Dirigida a niveles B1 a C1 para dominar matices complejos, estilo formal y usos sofisticados.
6. **«I verbi italiani»**: Monográfico dedicado exclusivamente a todos los tiempos, modos verbales, verbos auxiliares y el subjuntivo (A1 a C1).
7. **«Ricette per parlare» (Alma Edizioni)**: Colección de juegos, dinámicas comunicativas y entrevistas para desarrollar la soltura oral en grupo o con profesor.
8. **«L'italiano con i fumetti»**: Serie de 5 cómics temáticos (*Roma 2050 d.C.*, *Una storia italiana*, *Il mistero di Casanova*, etc.) con actividades integradas.
9. **«Le parole italiane»**: Dedicado a la formación del léxico, prefijos, sufijos, familias de palabras, sinónimos y antónimos (A1 a C1).
10. **«Nuovo Espresso»**: Itinerario pedagógico de 6 niveles (A1 a C2) con libros de texto, cuadernos, audios y episodios en vídeo de la vida cotidiana.`;
  }

  // 5. Pregunta: ¿Qué 5 libros en PDF gratuitos para aprender italiano se mencionan?
  if (
    (lower.includes("5 libros") || lower.includes("pdf") || lower.includes("gratis") || lower.includes("gratuitos") || lower.includes("descargar")) &&
    (lower.includes("italiano") || lower.includes("pdf"))
  ) {
    return `### Los 5 Libros Gratuitos en PDF para Aprender Italiano

1. **Gramática italiana en PDF (25 páginas)**:
   - Resumen directo y práctico con los fundamentos gramaticales básicos, reglas indispensables y definiciones claras para asentar la base del idioma.
2. **Curso de gramática italiana en PDF (32 páginas)**:
   - Explicaciones intuitivas y didácticas acompañadas de ejercicios prácticos para afianzar estructuras conversacionales.
3. **Pronunciación y entonación del italiano en PDF (18 páginas)**:
   - Guía centrada en la fonética, entonaciones de preguntas y sonidos de consonantes dobles para lograr una buena dicción y evitar malentendidos.
4. **Diccionario de palabras básicas español-italiano en PDF (2 páginas)**:
   - Formato ultracompacto de referencia rápida con el vocabulario esencial para viajes, compras y situaciones cotidianas.
5. **Curso de italiano en 40 lecciones en PDF (160+ páginas)**:
   - Manual completo y progresivo que abarca desde los primeros pasos elementales hasta nociones avanzadas, con ejercicios y contexto cultural.`;
  }

  // 6. Pregunta: ¿Cuáles son las 10 mejores películas italianas en versión original recomendadas?
  if (
    (lower.includes("10 mejores películas") || lower.includes("10 peliculas") || lower.includes("películas italianas") || lower.includes("peliculas italianas") || lower.includes("cine italiano")) ||
    (lower.includes("película") && lower.includes("italiano") && !lower.includes("vita è bella") && !lower.includes("vida es bella"))
  ) {
    return `### Las 10 Mejores Películas y Series para Aprender Italiano en V.O.

1. **Érase una vez en América** (*Sergio Leone*, con Robert De Niro, 1984) – Clásico colosal que ayuda a contrastar inglés e italiano.
2. **El bueno, el malo y el feo** (*Sergio Leone*, con Clint Eastwood, BSO Ennio Morricone, 1966) – Obra maestra del western cinematográfico.
3. **La vida es bella** (*Roberto Benigni*, 1997) – Imprescindible para el italiano conversacional, emotivo y accesible.
4. **Otto e mezzo (8½)** (*Federico Fellini*, con Marcello Mastroianni, 1963) – La cima del cine de autor sobre la crisis de un creador.
5. **La Dolce Vita** (*Federico Fellini*, Palma de Oro en Cannes, 1960) – Retrato emblemático de la Roma de los años sesenta.
6. **Una mujer y tres hombres y nos habíamos querido tanto** (*Ettore Scola*, 1974) – Retrato generacional de tres resistentes partisanos.
7. **La escapada** (*Il sorpasso*, *Dino Risi*, con Vittorio Gassman, 1962) – Comedia agridulce sobre el milagro económico italiano.
8. **El gatopardo** (*Luchino Visconti*, con Burt Lancaster, Alain Delon y Claudia Cardinale, 1963) – Belleza visual e historia del Risorgimento en Sicilia.
9. **Gomorra (Serie de TV, 2014)** – Basada en la novela de Roberto Saviano, retrato crudo de la Camorra napolitana.
10. **Roma Criminal** (*Romanzo Criminale*, serie de 12 episodios en 2 temporadas) – Ambientada en los bajos fondos de la Roma de finales de los 70.

*Consejo*: Mirarlas en versión original sin subtítulos en español para acostumbrar al oído a la fonética real.`;
  }

  // 7. Pregunta: ¿Qué dice la curva de olvido de Ebbinghaus sobre la retención a las 24 horas y al mes?
  if (
    lower.includes("ebbinghaus") ||
    lower.includes("curva de olvido") ||
    lower.includes("curva del olvido") ||
    lower.includes("retención a las 24 horas") ||
    lower.includes("retencion a las 24 horas")
  ) {
    return `### La Curva del Olvido de Ebbinghaus: Retención a las 24 Horas y al Mes

* **A las 24 horas**: El cerebro ya ha olvidado aproximadamente **dos tercios** de lo estudiado el día anterior; solo se retiene cerca del **33%**.
* **A las 48 horas (2 días)**: La retención cae al **28%**.
* **A los 31 días (1 mes)**: Si no ha existido repaso periódico, la retención residual desciende hasta apenas el **20%**.

---

#### Conclusión práctica:
1. **La ineficacia de las sesiones maratonianas**:
   - Estudiar 4 horas seguidas un solo día del fin de semana es sumamente ineficiente. La curva de Ebbinghaus borrará más del 70% del contenido mucho antes de la siguiente sesión.
2. **El poder de los 15 a 30 minutos diarios**:
   - Sesiones breves y diarias de 15 a 30 minutos reactivan la memoria justo antes de que caiga el precipicio del olvido, aplanando la curva mediante la **repetición espaciada**. De esta forma, la retención a largo plazo se consolida por encima del **80-90%**.`;
  }

  // 8. Pregunta: ¿Por qué se recomienda no estudiar más de 5 días a la semana?
  if (
    lower.includes("5 días a la semana") ||
    lower.includes("5 dias a la semana") ||
    lower.includes("no estudiar más de 5") ||
    lower.includes("no estudiar mas de 5") ||
    (lower.includes("descansar") && lower.includes("2 días")) ||
    (lower.includes("descansar") && lower.includes("2 dias"))
  ) {
    return `### ¿Por qué se recomienda no estudiar más de 5 días a la semana? (Regla del Descanso)

1. **Consolidación neuronal de la memoria**:
   - El cerebro humano no fija los conocimientos en la memoria a largo plazo durante el momento exacto de la sesión de estudio, sino durante los periodos de **desconexión, descanso y sueño** (proceso de consolidación sináptica). El descanso permite que las redes neuronales reorganizen e integren las nuevas estructuras lingüísticas.

2. **Prevención del agotamiento mental (*burnout*)**:
   - Intentar estudiar los 7 días de la semana de manera ininterrumpida genera fatiga cognitiva acumulada, estrés y una pérdida progresiva del entusiasmo, siendo la principal causa de deserción entre estudiantes autodidactas a los pocos meses.

3. **Sostenibilidad del hábito a largo plazo**:
   - Contar con 2 días libres por semana da margen para la vida social, el ocio y la recuperación mental. Permite retomar cada nueva semana con la mente fresca, alta concentración y motivación intacta.`;
  }

  // 9. Pregunta: ¿Cómo aplicar el sistema OKR con Objetivos y Resultados Clave al estudio de idiomas?
  if (
    lower.includes("okr") ||
    lower.includes("objetivos y resultados clave")
  ) {
    return `### Cómo Aplicar el Sistema OKR al Aprendizaje de Idiomas

1. **Objetivo (O) – El «Qué» cualitativo e inspirador**:
   - Debe ser una meta ambiciosa con un horizonte claro.
   - *Ejemplo*: «Alcanzar fluidez conversacional para desenvolverme con soltura en mi próximo viaje» o «Aprobar el examen oficial nivel B2».

2. **Resultados Clave (KR) – El «Cómo» cuantitativo y medible**:
   - Se establecen hasta **3 resultados clave semanales** que se puedan medir objetivamente sin ambigüedades.
   - *Ejemplos*:
     * **KR1**: Leer 10 páginas de un libro adaptado en el idioma meta.
     * **KR2**: Escuchar 3 episodios de 15 minutos de un podcast en versión original.
     * **KR3**: Mantener 1 sesión de 30 minutos de conversación con un tutor o compañero de intercambio.

3. **Planificación semanal y registro de horas**:
   - Planificar por semanas (no por meses ni años) para absorber imprevistos sin frustración.
   - Comparar al final de la semana las horas planificadas frente a las horas reales estudiadas y ajustar la carga para la siguiente semana.`;
  }

  // 10. Pregunta: ¿Cómo ayuda un diario de aprendizaje de idiomas y qué escribir en él?
  if (
    lower.includes("diario de aprendizaje") ||
    lower.includes("diario de idiomas") ||
    lower.includes("diario") && lower.includes("escribir")
  ) {
    return `### El Diario de Aprendizaje de Idiomas: Utilidad y Contenido

1. **Espacio libre de expresión sin juicios**:
   - Escribir unos minutos al día sobre tus pensamientos, rutina, emociones o planes futuros en el idioma meta.
   - Al no tener a nadie corrigiendo cada línea en tiempo real, se pierde el miedo al error y se entrena la formulación mental de frases espontáneas, de forma muy parecida a como se hace al hablar.

2. **Recopilador de dudas concretas para el tutor o profesor**:
   - Sirve para anotar con exactitud los bloqueos gramaticales que te surgen al redactar: *«¿Por qué aquí suena raro este tiempo verbal?», «¿Qué diferencia hay entre estas dos palabras sinónimas?»*.
   - Al llegar a tu sesión de conversación o tutoría, llevas dudas de valor real basadas en tus propias necesidades de expresión, optimizando al máximo el tiempo de clase.`;
  }

  // 11. Pregunta: ¿Por qué ocurre el estancamiento lingüístico a las ~50 horas de práctica?
  if (
    lower.includes("50 horas") ||
    (lower.includes("estancamiento") && (lower.includes("por qué") || lower.includes("porque") || lower.includes("meseta"))) ||
    lower.includes("ericsson")
  ) {
    return `### ¿Por qué ocurre el estancamiento lingüístico a las ~50 horas de práctica? (La Meseta B1-B2)

* **El «Piloto Automático»**:
  - Alrededor de las 50 horas de práctica deliberada en cualquier habilidad (como tocar un instrumento, conducir o aprender una lengua), el cerebro adquiere una competencia básica funcional (**Anders Ericsson y Robert Pool**, *«Peak»*).
  - Una vez que podemos comunicarnos a nivel elemental, **el cerebro entra en modo piloto automático**: se refugia en su zona de confort para ahorrar energía y deja de esforzarse por mejorar.

* **La trampa de la comodidad**:
  - El estudiante sigue usando siempre las mismas 500 palabras y las mismas estructuras gramaticales conocidas. Como el interlocutor le entiende, no siente una necesidad biológica inmediata de buscar matices más complejos.

* **La solución**: Para romper la meseta de las 50 horas es indispensable salir conscientemente de la rutina, incorporar retroalimentación de un hablante nativo que señale las muletillas y abordar actividades que fuercen a resolver nuevas dificultades cognitivas.`;
  }

  // 12. Pregunta: ¿Cuáles son las 6 estrategias principales para romper la meseta B1/B2?
  if (
    lower.includes("6 estrategias") ||
    (lower.includes("estrategias") && lower.includes("meseta")) ||
    (lower.includes("romper") && lower.includes("estancamiento"))
  ) {
    return `### Las 6 Estrategias de Políglotas para Romper la Meseta Lingüística (B1 - B2)

1. **Reconectar con el «por qué» profundo**:
   - Volver a definir motivos emocionales y tangibles de peso (mudanza, conectar con personas queridas, pasión cultural), desestimando razones superficiales que no sostienen la constancia.
2. **La Regla de los 5 Minutos**:
   - En días de pereza o desgana, comprometerse a estudiar únicamente 5 minutos. Superar la inercia del inicio es el 90% de la batalla; una vez sentado, el cerebro suele continuar la sesión.
3. **Cambiar radicalmente de actividades**:
   - Romper la monotonía de los libros de texto jugando a videojuegos narrativos en el idioma meta, leyendo cómics o novelas gráficas, o escuchando podcasts temáticos de temas que te apasionen.
4. **Clases particulares con nativo (Preply)**:
   - Fundamental para que un profesor nativo te señale de forma directa cuando estés abusando de las mismas expresiones básicas y te obligue a utilizar giros más naturales.
5. **Inmersión total en el hogar**:
   - Configurar teléfonos, ordenadores, perfiles de streaming y búsquedas de internet 100% en la lengua meta.
6. **Filosofía estoica: «El obstáculo es el camino» (Ryan Holiday)**:
   - Aceptar la meseta no como un fracaso, sino como la prueba evidente de que estás en el umbral de un salto cualitativo hacia la maestría.`;
  }

  // 13. Pregunta: Motivación instrumental vs integradora
  if (
    lower.includes("instrumental") && lower.includes("integradora")
  ) {
    return `### Motivación Instrumental vs. Motivación Integradora

La motivación para aprender idiomas se divide en dos vertientes principales:

* **Motivación Instrumental**:
  - **Definición**: Nace del deseo de alcanzar un fin práctico, económico o profesional concreto (conseguir un ascenso, aprobar un examen oficial, trasladarse por trabajo).
  - **Impacto en el aprendizaje**: Suele derivar en un estudio más riguroso de la gramática formal, la ortografía y el léxico técnico, aunque puede volverse árida si se percibe solo como una obligación laboral.

* **Motivación Integradora**:
  - **Definición**: Surge del anhelo genuino de integrarse a una comunidad, comprender su arte, literatura y estilo de vida, o comunicarse con amigos y seres queridos en su propia lengua.
  - **Impacto en el aprendizaje**: Proporciona mayor resistencia frente a las dificultades a largo plazo, tolerando más errores iniciales y generando una soltura comunicativa más natural y espontánea.

*Conclusión*: El estudiante de mayor éxito combina ambas: una base integradora que mantenga viva la pasión con metas instrumentales concretas (fechas de exámenes o hitos profesionales) para estructurar el progreso.`;
  }

  // 14. Pregunta: Regla de los 5 minutos
  if (
    lower.includes("regla de los 5 minutos") ||
    (lower.includes("5 minutos") && (lower.includes("pereza") || lower.includes("inercia") || lower.includes("hábito") || lower.includes("habito")))
  ) {
    return `### La Regla de los 5 Minutos: Vencer la Pereza al Estudiar

La **Regla de los 5 Minutos** es una técnica psicológica para erradicar la procrastinación en el aprendizaje autodidacta:

* **Principio**: La parte más costosa energéticamente para el cerebro humano es **iniciar la tarea** (romper el rozamiento de la inercia y el estado de reposo).
* **Cómo se aplica**:
  1. En los días en que sientas apatía, cansancio o pereza extrema, haz un pacto contigo mismo: *«Solo voy a estudiar 5 minutos de reloj. Si tras esos 5 minutos sigo sin querer continuar, lo dejo con total tranquilidad»*.
  2. Al rebajar la barrera cognitiva de entrada a solo 5 minutos, la resistencia mental desaparece casi por completo.
  3. En la inmensa mayoría de las ocasiones, una vez que has abierto el libro o encendido el audio y el cerebro se enfoca en el estímulo, el flujo de concentración se activa y terminas completando la sesión normal de 20 o 30 minutos sin esfuerzo.`;
  }

  // 15. Pregunta: ¿Cuáles son las 5 estrategias clave para aprender francés?
  if (lower.includes("5 estrategias") && lower.includes("franc")) {
    return `### Las 5 Estrategias Clave para Aprender Francés por tu Cuenta

1. **Fijar objetivos tangibles y medibles**:
   - Proponte metas claras con fecha límite (como aprender 100 palabras nuevas al mes o leer 1 artículo adaptado por semana), en lugar de ambigüedades como «dominar el francés».
2. **Lecciones gratuitas de vocabulario en YouTube**:
   - Utilizar vídeos estructurados de pronunciación como *«100 mots niveau A1»* y *«100 mots niveau A2»* para consolidar el léxico base con su fonética correcta.
3. **Comprensión escrita con textos graduados**:
   - Iniciar con lecturas accesibles como *Le Petit Prince* y manuales con audio como el e-book *«Parole de France»* (12,95€ con audios de Ohlalafrancés) para coordinar vista y oído.
4. **Expresión oral autónoma (sin profesor)**:
   - Narrarse la rutina diaria en voz alta y practicar la técnica de imitación o *shadowing* imitando la entonación de vídeos de nativos.
5. **Ortografía mediante transcripción y auto-dictados**:
   - Copiar a mano textos leídos y grabarse con el móvil leyendo frases para luego transcribirlas y corregir los errores ortográficos propios.

*Rutina óptima*: 15 a 20 minutos al día bastan gracias a que más del 80% del vocabulario francés está emparentado con el castellano por su origen en el latín vulgar.`;
  }

  // 16. Pregunta: Expresión oral en francés sin profesor / Shadowing
  if (
    (lower.includes("expresión oral") || lower.includes("expresion oral") || lower.includes("shadowing") || lower.includes("sin profesor")) &&
    lower.includes("franc")
  ) {
    return `### Cómo Mejorar la Expresión Oral en Francés sin Profesor

Existen tres técnicas comprobadas para desarrollar soltura oral de manera autodidacta:

1. **Hablar consigo mismo en voz alta**:
   - Describe objetos que ves a tu alrededor, narra lo que estás cocinando o lo que vas a hacer durante el día. Aunque cometas errores gramaticales, este ejercicio entrena los músculos articulatorios de la boca y la velocidad de procesamiento mental sin presión externa.

2. **La técnica de imitación (*Shadowing*)**:
   - Escucha un fragmento breve de un podcast o vídeo grabado por un nativo francófono y repítelo en voz alta intentando calcar exactamente su ritmo, entonación, pausas y sonidos vocálicos nasales.

3. **Auto-dictados grabados con el teléfono móvil**:
   - Lee un párrafo en voz alta grabándote con la grabadora de voz del móvil. Luego escucha tu propia voz y escribe lo que oyes: notarás de inmediato qué sonidos pronuncias con dudas y cómo afinar tu entonación.`;
  }

  // 17. Pregunta: Método de transcripción y auto-dictados
  if (
    lower.includes("transcripción") ||
    lower.includes("transcripcion") ||
    lower.includes("auto-dictado") ||
    lower.includes("autodictado")
  ) {
    return `### El Método de Transcripción y Auto-Dictados en 4 Fases

Este método está diseñado específicamente para resolver la gran disparidad entre la grafía y la pronunciación francesa:

1. **Fase 1 – Selección del texto**:
   - Elige un párrafo breve adaptado a tu nivel actual (unas 5 a 10 líneas).
2. **Fase 2 – Comprensión global**:
   - Lee el texto con calma para asegurarte de que comprendes el significado global de la historia y el contexto de las oraciones.
3. **Fase 3 – Copia y transcripción a mano**:
   - Copia el texto frase por frase a mano en un cuaderno. El acto físico de escribir activa la memoria motora y fija las terminaciones mudas (como *-ent*, *-es*, consonantes finales) que no se oyen al hablar.
4. **Fase 4 – El auto-dictado**:
   - Grábate en el teléfono leyendo el texto en voz alta. Al día siguiente, escucha tu propia grabación y escríbela al dictado. Compara el resultado con el texto original para identificar tus puntos débiles ortográficos y corregirlos.`;
  }

  // 18. Pregunta: Afinidad léxica francés-español (>80%)
  if (
    lower.includes("afinidad") ||
    lower.includes("80%") ||
    (lower.includes("accesible") && lower.includes("franc"))
  ) {
    return `### La Afinidad Léxica del Francés con el Español (>80%)

El francés es sumamente accesible para un hispanohablante debido a su herencia lingüística común:

* **Origen común**: Ambas son lenguas romances derivadas de la evolución del latín vulgar a lo largo de más de 800 años.
* **Más del 80% de vocabulario emparentado**: Más de 8 de cada 10 palabras francesas comparten raíz directa con el español. Esto permite que un estudiante hispanohablante comprenda casi de inmediato una gran cantidad de términos escritos (ejemplos: *abandonner / abandonar, problème / problema, liberté / libertad, facile / fácil*).
* **Ventaja en comprensión lectora**: Al no tener que memorizar listas interminables de vocabulario desde cero, el estudiante hispanohablante puede concentrar casi toda su energía en la fonética y en afinar la comprensión auditiva.`;
  }

  // 19. Pregunta: ¿En qué orden exacto se debe estudiar el inglés?
  if (
    (lower.includes("orden") || lower.includes("secuencia") || lower.includes("por dónde empezar") || lower.includes("por donde empezar")) &&
    (lower.includes("inglés") || lower.includes("ingles"))
  ) {
    return `### Orden Lógico y Secuencia Estricta para Estudiar Inglés

El orden lógico recomendado para no fosilizar errores es:

1. **Paso 1 – Fonética básica primero**:
   - Es el pilar innegociable. Se debe corregir la pronunciación desde el primer día porque los malos hábitos fonéticos son casi imposibles de erradicar más tarde (ej. pares mínimos como *sheep* /i:/ vs *ship* /ɪ/, o el sonido interdental de la *th* en *think* /θ/).
2. **Paso 2 – Gramática nuclear**:
   - Estudiar el presente simple, los artículos (*a, an, the*) y los pronombres personales para poder armar oraciones elementales completas.
3. **Paso 3 – Vocabulario nuclear (1000 a 1500 palabras)**:
   - Dominar el bloque de las 1000 a 1500 palabras más frecuentes, que cubren aproximadamente el 80% de todas las conversaciones de la vida cotidiana.
4. **Paso 4 – Progresión de tiempos verbales**:
   - Presente continuo → Pasado simple → Futuro (*going to* y *will*) → Tiempos perfectos (*present perfect*) → Condicionales → Voz pasiva.`;
  }

  // 20. Pregunta: Plan intensivo de 3 meses para inglés básico funcional
  if (
    (lower.includes("3 meses") || lower.includes("tres meses") || lower.includes("intensivo")) &&
    (lower.includes("inglés") || lower.includes("ingles"))
  ) {
    return `### Plan Intensivo de 3 Meses para Inglés Básico Funcional

Diseñado para personas que necesitan adquirir solvencia comunicativa rápida:

* **Objetivo de vocabulario**: Dominar las **500 palabras clave esenciales**.
* **Dedicación diaria**: **2 horas diarias**, divididas en bloques de concentración de 30 a 40 minutos para mantener la frescura mental.
* **Metodología y práctica oral**:
  - Inmersión ambiental completa en dispositivos y hogar.
  - Práctica oral interactiva diaria apoyada en metodologías activas (como *Talking Method*).
* **Habilidades funcionales al término de los 3 meses**:
  - Capacidad para presentarse y hablar de su entorno laboral y personal.
  - Formular preguntas directas, pedir y dar direcciones.
  - Desenvolverse en tiendas, restaurantes, aeropuertos y situaciones cotidianas básicas.`;
  }

  // 21. Pregunta: ¿Se puede alcanzar un nivel B1-B2 en 1 año como autodidacta y cómo organizarlo?
  if (
    (lower.includes("1 año") || lower.includes("un año") || lower.includes("b1-b2") || lower.includes("b1 a b2")) &&
    (lower.includes("inglés") || lower.includes("ingles"))
  ) {
    return `### Plan a 1 Año para Alcanzar Nivel B1-B2 en Inglés desde Cero

Sí, es plenamente viable alcanzar un nivel B1-B2 en 1 año con una dedicación autodidacta estructurada:

* **Régimen diario**: De **1 a 2 horas al día**, repartidas en una proporción de **60% estudio formal** (gramática, pronunciación y léxico) y **40% consumo de contenido auténtico** (podcasts, vídeos, lecturas).
* **Itinerario bimestral**:
  - **Mes 1 y 2**: Nivel A1 elemental (fonética, 500 palabras, presente y frases básicas).
  - **Mes 3 y 4**: Consolidación A1 (pasado simple, 800 palabras, lecturas cortas graduadas).
  - **Mes 5 a 7**: Nivel A2 (futuro, tiempos continuos, podcast *BBC 6 Minute English*).
  - **Mes 8 a 10**: Nivel B1 (tiempos perfectos, expresión de opiniones y conversaciones con nativos).
  - **Mes 11 y 12**: Consolidación B1 y aproximación a B2 (argumentación, condicionales, fluidez auditiva).`;
  }

  // 22. Pregunta: Mayor barrera al aprender inglés y cómo superarla
  if (
    (lower.includes("barrera") || lower.includes("dificultad") || lower.includes("obstáculo")) &&
    (lower.includes("inglés") || lower.includes("ingles"))
  ) {
    return `### La Mayor Barrera al Aprender Inglés Autodidacta y su Solución

La mayor barrera no es la gramática, sino la **falta de retroalimentación inmediata (*feedback*) y la curva del olvido**:

* **La barrera**: Al estudiar en solitario, el alumno no sabe si está pronunciando adecuadamente ni si sus frases suenan naturales, lo que genera inseguridad para hablar.
* **Cómo superarla**:
  1. Utilizar recursos auditivos con transcripción simultánea como el podcast **«6 Minute English»** de la BBC.
  2. Implementar sistemas de rendición de cuentas (*accountability*) y contratar sesiones puntuales con nativos en plataformas como Preply para recibir correcciones directas.
  3. Practicar la técnica de las 1000-1500 palabras nucleares para asegurar que el 80% del discurso diario esté automatizado.`;
  }

  // 23. Pregunta: ¿Por qué es obligatorio memorizar Hiragana y Katakana antes de los kanji?
  if (
    (lower.includes("hiragana") || lower.includes("katakana")) &&
    (lower.includes("kanji") || lower.includes("obligatorio") || lower.includes("antes"))
  ) {
    return `### ¿Por qué es obligatorio memorizar Hiragana y Katakana antes de los kanji?

Este paso se considera indispensable e imperativo por tres motivos didácticos:

1. **Son los cimientos fonéticos del idioma**:
   - El Hiragana y el Katakana representan todos los sonidos vocálicos y consonánticos del japonés. Si no dominas ambos silabarios, dependerás del *romaji* (alfabeto latino), lo que destruye la pronunciación correcta y ralentiza el aprendizaje.

2. **Evitar la sobrecarga cognitiva inmediata**:
   - Intentar aprender kanji (ideogramas de múltiples trazos con lecturas chinas *On'yomi* y japonesas *Kun'yomi*) sin saber escribir los silabarios básicos satura al cerebro y lleva al abandono en pocas semanas.

3. **Lectura de la gramática y el furigana**:
   - Las partículas gramaticales (*wa, ga, o, ni, de*) y las terminaciones verbales (*okurigana*) se escriben exclusivamente en Hiragana. Además, las lecturas de los kanji en diccionarios y textos didácticos (*furigana*) vienen impresas en Hiragana o Katakana encima del ideograma.

*Recomendación*: Utilizar las tablas de trazos de Yoshida o de la Fundación Japón para aprenderlos de memoria antes de abrir cualquier libro de texto.`;
  }

  // 24. Pregunta: Pros y contras de JapanesePod101.com
  if (lower.includes("japanesepod101")) {
    return `### Análisis Crítico de JapanesePod101.com: Pros, Contras y Solución

* **Puntos Fuertes (Pros)**:
  - Enorme catálogo de lecciones en audio y vídeo organizadas por niveles.
  - Diálogos dramatizados por actores de voz profesionales con pronunciación impecable y notas culturales interesantes.
  - Material estructurado y alineado con los exámenes oficiales Noken (JLPT N5 a N3).

* **Puntos Débiles (Contras)**:
  - **Exceso de charla en inglés** en las explicaciones de los niveles iniciales, lo que reduce el tiempo efectivo de exposición al japonés.
  - Insistente publicidad por correo electrónico para adquirir planes superiores.
  - **Carencia de práctica oral**: Es una plataforma de consumo pasivo que no evalúa la expresión oral en vivo.

* **Cómo compensar la falta de expresión oral**:
  - Buscar compañeros de intercambio de idiomas en línea (en comunidades de Skype o Tandem).
  - Una estrategia muy efectiva es postularse para dar clases particulares de español a japoneses (en páginas como *senseinavi* o *getstudents*, cobrando un máximo de 3.000 yenes/hora): esto te obliga a explicar conceptos gramaticales en japonés básico y te proporciona práctica conversacional real remunerada.`;
  }

  // 25. Pregunta: Libros de kanji recomendados
  if (
    lower.includes("libros de kanji") ||
    lower.includes("basic kanji book") ||
    (lower.includes("heisig") && lower.includes("kanji")) ||
    lower.includes("kanji in context")
  ) {
    return `### Libros de Kanji Recomendados

1. **«Basic Kanji Book» (Volúmenes 1 y 2)**:
   - Considerado el mejor manual práctico para principiantes. Enseña 500 kanji elementales en el volumen 1 y otros 500 en el volumen 2, detallando orden de trazos, cuadrículas de caligrafía, lecturas On y Kun, y palabras compuestas comunes.
2. **«Recordando los kanji» (*Remembering the Kanji*) de James W. Heisig**:
   - Utiliza mnemotecnia visual e historias imaginativas para memorizar la forma y significado de los más de 2000 *joyo kanji*.
   - *Limitación didáctica*: No enseña las lecturas fonéticas On y Kun (el autor sugiere aprenderlas luego en contexto).
3. **«Kanji in Context»**:
   - Orientado a niveles intermedio y avanzado. Cubre los 2136 kanji oficiales organizados por frecuencia con más de 10.000 palabras de vocabulario contextualizado.`;
  }

  // 26. Pregunta: Joya indispensable de gramática japonesa
  if (
    (lower.includes("joya") || lower.includes("gramática") || lower.includes("gramatica")) &&
    (lower.includes("japonés") || lower.includes("japones"))
  ) {
    return `### La Joya Indispensable para Dudas de Gramática Japonesa

Obras de gramática japonesa indispensables:

* **«A Dictionary of Basic Japanese Grammar» (de Seiichi Makino y Michio Tsutsui)**:
  - Es descrita como la auténtica biblia de consulta imprescindible para cualquier estudiante de japonés.
  - Ordenada alfabéticamente, analiza cada partícula, conjugación y estructura gramatical con explicaciones exhaustivas en inglés, matices sutiles, ejemplos reales y comparaciones de errores típicos.
  - Existen también los tomos de nivel intermedio (*Intermediate*) y avanzado (*Advanced*).

* **Alternativa en español**:
  - **«Nihongo: Japonés para hispanohablantes»**: Excelente tratado gramatical escrito enteramente en español y enfocado de forma específica en las dificultades y dudas recurrentes de los estudiantes hispanohablantes.`;
  }

  // --- FILTROS GENERALES POR IDIOMA SI NO COINCIDIÓ UNA PREGUNTA CONCRETA ---

  if (topicId === "frances" || lower.includes("francés") || lower.includes("frances")) {
    return `### Enfoque Especializado: Francés Autodidacta

Estas son las 5 estrategias maestras adaptadas a tu consulta:

1. **Afinidad Léxica con el Español**:
   - Más del 80% del vocabulario francés está emparentado con el español por su origen en el latín vulgar. Esto permite avanzar muy rápido en comprensión lectora sin memorización forzada.
2. **Fijar Objetivos Tangibles**:
   - Proponte aprender 100 palabras nuevas al mes o leer 1 artículo adaptado por semana en vez de metas abstractas como «dominar el francés».
3. **Lecciones Gratuitas de YouTube**:
   - Trabaja con videos estructurados como *"100 mots niveau A1"* y *"100 mots niveau A2"* para afianzar léxico con pronunciación correcta.
4. **Lecturas Adaptadas**:
   - Empieza por clásicos accesibles como *Le Petit Prince* y el e-book *"Parole de France"* (12,95€ con audios de Ohlalafrancés) para sincronizar la vista con el sonido.
5. **Expresión Oral sin Profesor y Transcripción**:
   - **Hablarse a uno mismo**: Narra tu rutina diaria en voz alta.
   - **Shadowing**: Imita la entonación de nativos en series y audios.
   - **Auto-dictados**: Grábate leyendo un texto con el teléfono y luego transcríbelo para identificar errores ortográficos.
* **Rutina**: 15 a 20 minutos diarios son más que suficientes si mantienes la constancia.`;
  }

  if (topicId === "italiano" || lower.includes("italiano") || lower.includes("italia")) {
    return `### Enfoque Especializado: Italiano y Cultura

El italiano es la lengua más cercana y accesible para un hispanohablante:
* **Lectura Progresiva**:
  - Comienza leyendo diarios deportivos (*La Gazzetta Dello Sport*, *Tuttosport*) por su vocabulario directo y accesible.
  - Continúa con prensa gratuita (*Metro*, *City*, *Leggo*) antes de dar el salto a prensa general (*Corriere della Sera*, *La Repubblica*).
* **Los 10 Mejores Libros de Texto (Selección Europass)**:
  1. *Bar Italia* (artículos culturales de prensa A1 a C1).
  2. *Una parola tira l’altra 1 y 2* (léxico contextualizado con ilustraciones y juegos).
  3. *Nuova grammatica pratica della lingua italiana* (de Susanna Nocchi, niveles A2-B2).
  4. *Grammatica avanzata della lingua italiana* (B1 a C1).
  5. *I verbi italiani* (monográfico de conjugaciones y tiempos verbales).
  6. *Ricette per parlare* (ALMA Edizioni, actividades dinámicas de conversación).
  7. *L’italiano con i fumetti* (cómics temáticos con ejercicios).
  8. *Nuovo Espresso* (colección completa de 6 niveles A1 a C2 con vídeos).
* **Cine en V.O.**: Sergio Leone (*El bueno, el malo y el feo*), Roberto Benigni (*La vida es bella*), Federico Fellini (*La Dolce Vita*, *8½*).
* **Música y Podcasts**: Luciano Pavarotti, Eros Ramazzotti, Laura Pausini; podcasts como *Italiano piano piano* y *News in slow Italian*.`;
  }

  if (topicId === "ingles" || lower.includes("inglés") || lower.includes("ingles")) {
    return `### Enfoque Especializado: Inglés Autodidacta

Estos son los pilares fundamentales para tu aprendizaje:

1. **Fonética Básica Primero**:
   - Es el primer paso obligatorio. Corregir la pronunciación desde el principio evita fosilizar vicios muy difíciles de erradicar más tarde (ejemplo: pares mínimos como *sheep* vs. *ship*, o la consonante interdental *th* en *think*).
2. **Vocabulario Nuclear (Core Words)**:
   - Aprende las 1000 a 1500 palabras más frecuentes en inglés; estas cubren aproximadamente el 80% de todas las conversaciones de la vida cotidiana.
3. **Planes de Estudio según tu Objetivo**:
   - **Plan Sprint de 3 Meses (Nivel Funcional Básico)**:
     - 500 palabras clave esenciales.
     - 2 horas al día divididas en bloques de 30-40 minutos.
     - Práctica oral con plataformas como *Talking Method*.
   - **Plan a 1 Año (Nivel Intermedio B1-B2)**:
     - 1 a 2 horas diarias (60% estudio formal de gramática y 40% consumo de contenido auténtico).
     - Hitos progresivos: Mes 1-4 (A1 consolidado), Mes 5-7 (A2), Mes 8-10 (B1), Mes 11-12 (B2).
4. **Recursos Recomendados**:
   - Podcast *"BBC 6 Minute English"* para entrenar comprensión auditiva en cápsulas diarias.`;
  }

  if (topicId === "japones" || lower.includes("japonés") || lower.includes("japones")) {
    return `### Enfoque Especializado: Japonés y Kanji

Ruta metodológica paso a paso para el estudio de japonés:

1. **Paso 1 Obligatorio – Hiragana y Katakana**:
   - ¡Nunca comiences por los kanji ni dependas del romaji! Memoriza ambos silabarios con las tablas de trazos de Yoshida o de la Fundación Japón.
2. **Libros de Texto Estructurados**:
   - *Minna no Nihongo*: El estándar más riguroso con audios de pronunciación real (imprescindible conseguir el libro complementario de notas gramaticales traducidas).
   - *Marugoto: Lengua y cultura japonesa*: Método oficial de la Fundación Japón (A1 a B1-2).
   - *Japonés desde cero*: Muy didáctico en español (no aborda kanji).
3. **El Aprendizaje de los Kanji**:
   - *Basic Kanji Book (Vol. 1 y 2)*: 500 kanji básicos y 1000 intermedios con orden de trazos, cuadrículas y lecturas On/Kun.
   - *Recordando los kanji* (Heisig): Mnemotecnia visual para memorizar formas y significados (no enseña lecturas On/Kun).
4. **Gramática y Diccionarios**:
   - *A Dictionary of Basic Japanese Grammar* (Makino & Tsutsui): La joya imprescindible para cualquier duda.
   - *Nihongo: Japonés para hispanohablantes*: Explicaciones gramaticales diseñadas pensando en las dudas específicas de hispanohablantes.
   - *Jisho.org* y la aplicación móvil *Obenkyo* (con explicaciones en español).
5. **Sobre JapanesePod101.com**:
   - Es muy útil por sus dramatizaciones y cobertura para el Noken (JLPT N5-N3), pero debes complementar la falta de expresión oral buscando compañeros de intercambio en línea.`;
  }

  if (topicId === "metodos" || lower.includes("metodos") || lower.includes("métodos") || lower.includes("hábito")) {
    return `### Enfoque Especializado: Métodos, Planificación OKR y Hábitos

Sistema comprobado desde los años 50 (usado por Amazon, Google y Spotify) aplicado al aprendizaje de idiomas:

1. **Estructura del Sistema OKR**:
   - **Objetivo (O)**: Resultado final inspirador (ej. «Poder mantener conversaciones fluidas de 10 minutos en 3 meses»).
   - **Resultados Clave (KR)**: Hasta 3 acciones semanales medibles (ej. leer 5 páginas, escuchar 30 min de podcast, completar 2 lecciones de gramática).
2. **Planificación Semanal (no mensual)**:
   - Planifica semana a semana para ajustar cargas y evitar frustraciones ante imprevistos.
3. **La Regla de Oro: Máximo 5 Días de Estudio a la Semana**:
   - ¡Descansa obligatoriamente 2 días a la semana! El descanso permite que las redes neuronales consoliden lo aprendido y previene el agotamiento mental (*burnout*).
4. **Curva del Olvido de Ebbinghaus**:
   - A las 24 horas solo retienes el 33% de lo estudiado y al mes apenas el 20%. Por eso 15-20 minutos diarios son inmensamente superiores a un atracón de 4 horas una vez por semana.
5. **El Diario de Aprendizaje**:
   - Escribe pensamientos libres en el idioma sin miedo a equivocarte y utilízalo para anotar dudas específicas que consultarás a tu tutor.`;
  }

  if (topicId === "estancamiento" || lower.includes("estancamiento") || lower.includes("meseta")) {
    return `### Enfoque Especializado: Superar el Estancamiento (Meseta B1 - B2)

Aspectos clave sobre la psicología de la meseta y sus soluciones comprobadas:

1. **La Meseta de las 50 Horas** (*Peak*, Anders Ericsson & Robert Pool):
   - Alrededor de las 50 horas de práctica en cualquier habilidad, alcanzamos un nivel funcional y el cerebro entra en «piloto automático». Nos acomodamos en la zona de confort y el progreso se detiene.
2. **Las 6 Estrategias de Políglotas**:
   - **1. Reconectar con el «por qué»**: Busca motivos emocionales genuinos y tangibles, no razones superficiales.
   - **2. La Regla de los 5 Minutos**: Cuando sientas pereza, oblígate a estudiar solo 5 minutos. Vencer la inercia inicial es el 90% del éxito.
   - **3. Diversificar actividades**: Sustituye libros repetitivos por videojuegos en el idioma, cómics, podcasts temáticos o un diario reflexivo.
   - **4. Clases particulares con nativo (Preply)**: Vital para que un tutor te señale cuando estás repitiendo siempre las mismas palabras y te impulse a usar giros más naturales.
   - **5. Inmersión ambiental total**: Dispositivos, búsquedas de Google y entretenimiento 100% en la lengua meta.
   - **6. Mentalidad estoica**: «El obstáculo es el camino» (*Ryan Holiday*). Acepta la meseta como la señal de que estás a punto de dar un salto cualitativo.`;
  }

  const isGreetingOrGeneral =
    lower.includes("hola") ||
    lower.includes("buenos días") ||
    lower.includes("buenas tardes") ||
    lower.includes("buenas") ||
    lower.includes("qué puedes hacer") ||
    lower.includes("que puedes hacer") ||
    lower.includes("quién eres") ||
    lower.includes("quien eres") ||
    lower.includes("ayuda") ||
    lower.includes("guía") ||
    lower.includes("guia") ||
    lower.includes("idioma") ||
    lower.includes("idiomas") ||
    lower.includes("aprender") ||
    lower.includes("estudiar") ||
    lower.includes("método") ||
    lower.includes("metodo") ||
    lower.includes("consejo") ||
    lower.includes("recurso") ||
    lower.includes("libro");

  if (isGreetingOrGeneral) {
    return `### Asistente Especializado en Aprendizaje de Idiomas

Pilares clave para el estudio de idiomas:
* **Principio de Constancia**: 15 a 30 minutos al día superan a 4 horas en un fin de semana.
* **Método OKR**: Fija un Objetivo ambicioso y hasta 3 Resultados Clave semanales.
* **Descanso saludable**: Estudia como máximo 5 días a la semana para consolidar la memoria sin saturarte.
* **Idiomas analizados en profundidad**:
  - **Francés**: 5 estrategias clave, lecciones de YouTube, transcripciones y auto-dictados.
  - **Italiano**: Prensa deportiva, los 10 mejores libros de Europass, 5 PDFs gratis y 10 películas en V.O.
  - **Inglés**: Fonética prioritaria, 1000-1500 palabras nucleares, planes de 3 meses y 1 año.
  - **Japonés**: Hiragana y Katakana obligatorios, JLPT N5-N1, Minna no Nihongo, Heisig y JapanesePod101.
* **Superación de la Meseta**: La regla de las 50 horas de Ericsson y las 6 soluciones de políglotas.

Puedes preguntarme cualquier detalle específico sobre métodos, libros, gramáticas, películas o técnicas de estudio.`;
  }

  // Strictly return the exact out-of-scope response requested by the user
  return "Lo siento, pero no dispongo de esa información en la base de datos proporcionada.";
}


// Server-side Gemini API client
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) return null;
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAIClient;
}

// API Routes
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", hasApiKey: Boolean(process.env.GEMINI_API_KEY) });
});

// Topics and quick access reference
app.get("/api/knowledge-summary", (_req, res) => {
  res.json({
    languages: [
      {
        id: "frances",
        name: "Francés",
        description: "5 estrategias clave, similitud léxica >80%, lectura graduada, auto-dictados y expresión oral.",
        keyResources: ["Le Petit Prince", "Parole de France", "Canal YouTube 100 mots", "Tandem", "Anki"],
        sampleQuestions: [
          "¿Cuáles son las 5 estrategias clave para aprender francés?",
          "¿Cómo practicar la expresión oral en francés si no tengo profesor?",
          "¿Por qué se dice que el francés es fácil para un hispanohablante?"
        ]
      },
      {
        id: "italiano",
        name: "Italiano",
        description: "El idioma más afín al castellano, prensa deportiva, cine clásico en V.O., 10 mejores libros y 5 PDFs gratuitos.",
        keyResources: ["La Gazzetta Dello Sport", "Bar Italia", "Nuova grammatica pratica (Susanna Nocchi)", "La vita è bella", "Nuovo Espresso"],
        sampleQuestions: [
          "¿Cuáles son los mejores periódicos y películas para aprender italiano?",
          "¿Qué libros recomienda la guía para aprender italiano desde cero?",
          "Que 5 libros en PDF gratuitos para aprender italiano se recomiendan?"
        ]
      },
      {
        id: "ingles",
        name: "Inglés",
        description: "Las 4 competencias, fonética previa obligatoria, vocabulario nuclear (1000-1500 palabras), plan de 3 meses vs 1 año.",
        keyResources: ["BBC 6 Minute English", "Talking Method", "Duolingo / Babbel", "Tests de nivel MCER"],
        sampleQuestions: [
          "¿En qué orden debo aprender inglés según el documento?",
          "¿Cómo organizar un plan de 3 meses intensivo vs 1 año para inglés?",
          "¿Cuál es la mayor dificultad para aprender inglés por cuenta propia?"
        ]
      },
      {
        id: "japones",
        name: "Japonés",
        description: "Paso 1 vital (Hiragana y Katakana), preparación para el Noken (JLPT), libros Minna no Nihongo, Heisig, Obenkyo y JapanesePod101.",
        keyResources: ["Minna no Nihongo", "Basic Kanji Book", "A Dictionary of Basic Japanese Grammar", "Obenkyo", "Jisho.org", "JapanesePod101"],
        sampleQuestions: [
          "¿Por dónde debo empezar a estudiar japonés según la guía?",
          "¿Cuáles son los pros y contras de JapanesePod101.com?",
          "¿Qué libros de gramática y kanji se recomiendan para el examen Noken?"
        ]
      },
      {
        id: "metodos",
        name: "Métodos, Hábitos y OKR",
        description: "Planificación semanal OKR, 5 días de estudio a la semana, curva de Ebbinghaus y diario de aprendizaje.",
        keyResources: ["Sistema OKR", "Regla de los 5 minutos", "Diario de idiomas", "Curva de Ebbinghaus"],
        sampleQuestions: [
          "¿Cómo aplicar el sistema OKR al estudio de un nuevo idioma?",
          "¿Por qué se recomienda estudiar 5 días a la semana como máximo?",
          "¿Cómo llevar un diario de aprendizaje de idiomas eficaz?"
        ]
      },
      {
        id: "estancamiento",
        name: "Superar el Estancamiento (Meseta)",
        description: "La trampa de las 50 horas (Anders Ericsson), meseta B1/B2 y las 6 estrategias de políglotas.",
        keyResources: ["Peak de Anders Ericsson", "El obstáculo es el camino (Ryan Holiday)", "Preply", "Inmersión total"],
        sampleQuestions: [
          "¿Qué es la meseta de las 50 horas y por qué ocurre entre B1 y B2?",
          "¿Cuáles son las 6 estrategias para superar el estancamiento lingüístico?"
        ]
      }
    ]
  });
});

app.post("/api/chat", async (req, res) => {
  try {
    const { message, history, topicId } = req.body;
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "El mensaje es requerido." });
    }

    // 1. Direct check: If query asks "cómo se dice x en x idioma" or translation, return exact phrase
    if (isTranslationOrHowToSayQuery(message)) {
      return res.json({
        reply: TRANSLATION_REFUSAL_MESSAGE,
        source: "direct-rule",
      });
    }

    // 2. Direct check: If query is unrelated to languages or the sources, return exact phrase
    if (!isQueryRelatedToLanguagesOrSources(message)) {
      return res.json({
        reply: "No tengo esa informacion disponible.",
        source: "direct-rule",
      });
    }

    const topicConfig = topicId && TOPIC_FOCUS_MAP[topicId];

    const ai = getGenAI();
    if (!ai) {
      // Fallback response if GEMINI_API_KEY is not configured
      const fallback = generateFallbackResponse(message, topicId);
      return res.json({
        reply: fallback,
        source: "local-knowledge-base",
      });
    }

    // Build chat contents including history
    const contents: any[] = [];

    if (Array.isArray(history)) {
      for (const turn of history.slice(-8)) {
        if (turn.role === "user" || turn.role === "assistant") {
          contents.push({
            role: turn.role === "user" ? "user" : "model",
            parts: [{ text: turn.text }],
          });
        }
      }
    }

    const userPromptText = message;

    contents.push({
      role: "user",
      parts: [{ text: userPromptText }],
    });

    let effectiveSystemPrompt = SYSTEM_KNOWLEDGE_PROMPT;
    effectiveSystemPrompt += `\n\n[DIRECTRIZ FUNDAMENTAL Y OBLIGATORIA]:
1. PREGUNTAS NO RELACIONADAS CON LAS FUENTES O LOS IDIOMAS:
   - Si se te pregunta algo no relacionado con las fuentes o los idiomas (por ejemplo: cocina, ciencia, tecnología, matemáticas, política, historia no lingüística, geografía, cultura general, programación, el clima, entretenimiento ajeno, etc.):
     Responde ÚNICA, EXACTA Y TEXTUALMENTE:
     No tengo esa informacion disponible.
   - Sin ningún preámbulo, sin justificaciones ni añadidos.

2. PREGUNTAS DE TRADUCCIÓN O CÓMO SE DICE UNA PALABRA/FRASE ("CÓMO SE DICE X EN Y IDIOMA"):
   - Si se te pregunta cómo se dice, traduce o escribe una palabra o frase en cualquier idioma (por ejemplo: "¿cómo se dice ... en ...?", "¿cómo se traduce ...?", etc.):
     Responde ÚNICA, EXACTA Y TEXTUALMENTE:
     No puedo responderte, ya que no soy un traductor, estoy aqui para ayudarte con tecnicas especìficas para cada idioma
   - Sin ningún preámbulo, sin justificaciones ni añadidos.

3. PREGUNTAS DE IDIOMAS O FUENTES CUYA RESPUESTA NO SE ENCUENTRA EN LOS DOCUMENTOS:
   - Si la pregunta está vinculada a los idiomas o a las fuentes pero la información concreta NO se encuentra en los documentos provistos (por ejemplo: dudas sobre otros idiomas como alemán, ruso, o contenidos no tratados), responde ÚNICA Y EXACTAMENTE:
     Lo siento, pero no dispongo de esa información en la base de datos proporcionada.
   - NO utilices conocimientos externos, ni hagas suposiciones fuera del texto brindado.
   - No agregues preámbulos, despedidas ni sugerencias si la información no está en los documentos.

3. PROHIBICIÓN ESTRICTA DE CITAR FUENTES:
   - ESTÁ TOTALMENTE PROHIBIDO incluir frases como "según los archivos", "según los documentos", "según la guía", "según tal documento", "de acuerdo con los documentos" o cualquier referencia a la procedencia de la información.
   - Responde directa, clara y autoritativamente a lo que se pregunta, sin preámbulos ni justificaciones de origen.

4. Si el usuario hace una pregunta concreta sobre la información de los documentos (por ejemplo: por qué la película 'La vita è bella' es ideal en V.O., detalles sobre 'Bar Italia' y la 'Nuova grammatica' de Susanna Nocchi, por qué se aconseja prensa deportiva como La Gazzetta Dello Sport, qué dice la curva de olvido de Ebbinghaus sobre la retención a 24h y al mes, por qué no estudiar más de 5 días a la semana, cómo aplicar el sistema OKR, qué 5 libros en PDF gratuitos se recomiendan, etc.):
   - RESPONDE DIRECTA, PUNTUAL Y EXHAUSTIVAMENTE A ESA PREGUNTA EXACTA con la información del texto brindado.
   - NO incluyas frases ni párrafos introductorios de relleno o preámbulos. Comienza directamente con los puntos clave o la respuesta sustantiva.
   - NO sustituyas la respuesta por un resumen general ni por un listado temático no solicitado.
   - Detalla todos los argumentos pedagógicos, porcentajes, nombres de autores y fundamentos que contiene el texto sin mencionar de dónde provienen.
5. Si la consulta es una duda abierta o exploratoria sobre un idioma o método presente en los documentos, ofrece una síntesis estructurada con viñetas basada exclusivamente en el contenido provisto.`;

    if (topicConfig) {
      effectiveSystemPrompt += `\n\n[CONTEXTO TEMÁTICO DE REFERENCIA]:\nEl usuario tiene activo el contexto de "${topicConfig.name}". Toma en cuenta sus recomendaciones de estudio: ${topicConfig.focusPrompt}`;
    }

    // Attempt Gemini with a 15-second timeout race
    const generatePromise = ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents,
      config: {
        systemInstruction: effectiveSystemPrompt,
        temperature: 0.1,
      },
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout: usando base indexada rápida")), 15000)
    );

    const response: any = await Promise.race([generatePromise, timeoutPromise]);
    let reply = response.text || generateFallbackResponse(message, topicId);

    const normalizedReply = reply
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/['"«»“”\.]/g, "")
      .trim();

    if (
      normalizedReply.includes("no puedo responderte ya que no soy un traductor") ||
      (normalizedReply.includes("no soy un traductor") && normalizedReply.includes("tecnicas especificas"))
    ) {
      reply = TRANSLATION_REFUSAL_MESSAGE;
    } else if (normalizedReply === "no tengo esa informacion disponible") {
      reply = "No tengo esa informacion disponible.";
    } else if (
      normalizedReply === "lo siento pero no dispongo de esa informacion en la base de datos proporcionada"
    ) {
      reply = "Lo siento, pero no dispongo de esa información en la base de datos proporcionada.";
    }

    return res.json({ reply, source: "gemini" });
  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    // Graceful fallback to guarantee UI stability
    const fallback = generateFallbackResponse(req.body?.message || "", req.body?.topicId);
    return res.json({
      reply: fallback,
      source: "fallback-error",
      detail: error?.message,
    });
  }
});

// Vite middleware / production static server
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor iniciado en http://localhost:${PORT}`);
  });
}

start().catch(console.error);
