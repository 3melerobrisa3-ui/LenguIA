export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: string;
  source?: "gemini" | "local-knowledge-base" | "fallback-error" | "direct-rule";
}

export interface KnowledgeTopic {
  id: string;
  name: string;
  description: string;
  iconName: string;
  badge: string;
  keyResources: string[];
  sampleQuestions: string[];
}

export interface BookRecommendation {
  title: string;
  language: "Italiano" | "Japonés" | "Francés" | "Inglés" | "General";
  type: "Texto" | "Gramática" | "Kanji" | "Vocabulario" | "Oral / Comics" | "PDF Gratuito";
  level: string;
  description: string;
  pros?: string;
  cons?: string;
}

export interface MovieRecommendation {
  title: string;
  originalTitle: string;
  director: string;
  year?: string;
  actors?: string;
  summary: string;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
}

export const TRANSLATION_REFUSAL_MESSAGE =
  "No puedo responderte, ya que no soy un traductor, estoy aqui para ayudarte con tecnicas especìficas para cada idioma";

export function isTranslationOrHowToSayQuery(text: string): boolean {
  if (!text) return false;
  const q = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['"«»“”¿?¡!.,;:()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Specifically checks for translation and "cómo se dice / traduce / escribe" queries
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

export function cleanChatMessageText(text: string): string {
  if (!text) return text;
  const trimmed = text.trim();
  const normalizedLower = trimmed
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['"«»“”\.]/g, "")
    .trim();

  if (
    normalizedLower.includes("no puedo responderte ya que no soy un traductor") ||
    normalizedLower.includes("no soy un traductor") && normalizedLower.includes("tecnicas especificas")
  ) {
    return TRANSLATION_REFUSAL_MESSAGE;
  }

  if (
    normalizedLower === "no tengo esa informacion disponible" ||
    normalizedLower === "no tengo esa informacion disponible."
  ) {
    return "No tengo esa informacion disponible.";
  }

  if (
    trimmed === "Lo siento, pero no dispongo de esa información en la base de datos proporcionada." ||
    trimmed === "'Lo siento, pero no dispongo de esa información en la base de datos proporcionada.'" ||
    trimmed === '"Lo siento, pero no dispongo de esa información en la base de datos proporcionada."' ||
    normalizedLower === "lo siento pero no dispongo de esa informacion en la base de datos proporcionada"
  ) {
    return "Lo siento, pero no dispongo de esa información en la base de datos proporcionada.";
  }
  return text
    // Remove parenthetical years like (2024)
    .replace(/\s*\(2024\)/gi, "")
    // Remove "según los documentos / archivos / guías / etc." at start of lines or sentences
    .replace(
      /(?:Según\s+(?:los\s+archivos|los\s+documentos|el\s+archivo|el\s+documento|las\s+guías|las\s+guias|la\s+guía|la\s+guia|las\s+fuentes|los\s+textos|tal\s+documento|la\s+base\s+documental[^,:\n]*),?\s*)/gi,
      ""
    )
    .replace(
      /(?:De\s+acuerdo\s+con\s+(?:los\s+archivos|los\s+documentos|el\s+archivo|el\s+documento|las\s+guías|las\s+guias|la\s+guía|la\s+guia|las\s+fuentes|los\s+textos),?\s*)/gi,
      ""
    )
    // Remove "según la guía de los documentos, esta célebre obra..."
    .replace(
      /Según la guía de los documentos,\s+(esta célebre obra de \*\*Roberto Benigni\*\*[\s\S]*?fundamentales:|la película de Roberto Benigni[\s\S]*?didácticos:)\s*/gi,
      ""
    )
    .replace(
      /Según documentan \*\*Anders Ericsson y Robert Pool\*\* en su libro \*«Peak: Secrets from the New Science of Expertise»\*:\s*/gi,
      ""
    )
    .replace(
      /Según documentan \*\*Anders Ericsson y Robert Pool\*[\s\S]*?Expertise»\*:\s*/gi,
      ""
    )
    // Remove specific intro preambles
    .replace(
      /Ambos textos forman parte de la prestigiosa selección de \*\*los 10 mejores libros recomendados por Europass\*\* para estudiantes de italiano:\s*/gi,
      ""
    )
    .replace(
      /Ambos libros figuran en el top 10 recomendado por Europass:\s*/gi,
      ""
    )
    .replace(
      /Los documentos señalan la prensa deportiva como el punto de partida ideal para la lectura en italiano por las siguientes razones clave:\s*/gi,
      ""
    )
    .replace(
      /Los archivos recomiendan comenzar por la prensa deportiva porque:\s*/gi,
      ""
    )
    .replace(
      /Los documentos destacan 5 obras descargables sin coste ideales para el estudio autodidacta:\s*/gi,
      ""
    )
    .replace(
      /Los documentos destacan de forma unánime:\s*/gi,
      ""
    )
    .replace(
      /Los archivos clasifican la motivación para aprender idiomas en dos vertientes principales:\s*/gi,
      "La motivación para aprender idiomas se divide en dos vertientes principales:\n\n"
    )
    .replace(
      /Los documentos subrayan que el francés es sumamente accesible/gi,
      "El francés es sumamente accesible"
    )
    .replace(
      /La guía de inglés establece una hoja de ruta jerárquica que debe respetarse para no fosilizar errores:\s*/gi,
      "El orden lógico recomendado para no fosilizar errores es:\n\n"
    )
    .replace(
      /La guía de francés ofrece tres técnicas comprobadas para desarrollar soltura oral de manera autodidacta:\s*/gi,
      "Existen tres técnicas comprobadas para desarrollar soltura oral de manera autodidacta:\n\n"
    )
    .replace(
      /La guía de japonés califica este paso de \*\*«innegociable e imperativo»\*\* por tres motivos didácticos:\s*/gi,
      "Este paso es indispensable e imperativo por tres motivos didácticos:\n\n"
    )
    .replace(
      /Este método está diseñado específicamente en las guías para resolver/gi,
      "Este método está diseñado específicamente para resolver"
    )
    .replace(
      /La guía advierte expresamente sobre el error común de/gi,
      "Es un error común"
    )
    .replace(
      /La guía propone una progresión en tres fases:/gi,
      "Se recomienda una progresión en tres fases:"
    )
    .replace(
      /La guía profundiza en la psicología de la meseta y las soluciones comprobadas:\s*/gi,
      ""
    )
    .replace(
      /Según la base documental de 56 páginas:\s*/gi,
      ""
    )
    .replace(
      /Formulada experimentalmente por el psicólogo alemán \*\*Hermann Ebbinghaus\*\*[\s\S]*?repasada:\s*/gi,
      ""
    )
    .replace(
      /Formulada por el psicólogo Hermann Ebbinghaus:\s*/gi,
      ""
    )
    .replace(
      /La guía insiste firmemente en estudiar un \*\*máximo de 5 días a la semana y descansar obligatoriamente 2 días\*\* debido a tres factores biológicos y psicológicos:\s*/gi,
      ""
    )
    .replace(
      /El sistema \*\*OKR\*\* \(\*Objectives and Key Results\*\), originado en los años 50 y utilizado por gigantes como Google, Spotify y Amazon, se adapta al aprendizaje de idiomas de la siguiente forma:\s*/gi,
      ""
    )
    .replace(
      /Utilizado por empresas como Google y Spotify desde los años 50:\s*/gi,
      ""
    )
    .replace(
      /El diario de aprendizaje es una de las herramientas más potentes recomendadas en las guías, cumpliendo una \*\*doble función clave\*\*:\s*/gi,
      ""
    )
    .replace(
      /Según la guía de (francés|inglés|italiano|japonés)[^,:\n]*,?\s*/gi,
      ""
    )
    .replace(
      /Ruta metodológica paso a paso según la guía documental de japonés:\s*/gi,
      "Ruta metodológica paso a paso para el estudio de japonés:\n\n"
    )
    // Clean inline parentheticals
    .replace(/\s*\(Basic\s+Kanji\s+Book,\s*Heisig,\s*Kanji\s+in\s+Context\)/gi, "")
    .replace(/\s*\((?:según|segun)\s+(?:la\s+guía|la\s+guia|los\s+documentos|los\s+archivos|los\s+textos|las\s+fuentes|el\s+documento)\)/gi, "")
    // Clean labels with guide/documents
    .replace(/\*Consejo de la guía\*:/gi, "*Consejo*:")
    .replace(/\*Conclusión de los documentos\*:/gi, "*Conclusión*:")
    .replace(/#### Conclusión práctica de la guía:/gi, "#### Conclusión práctica:")
    .replace(/\*Desventaja señalada en la guía\*:/gi, "*Limitación didáctica*:")
    .replace(/mencionada en los textos/gi, "comprobada")
    .replace(/mencionado en los textos/gi, "comprobado")
    .replace(/según los archivos/gi, "")
    .replace(/según tal documento/gi, "")
    .replace(/según los documentos/gi, "")
    .replace(/según la guía/gi, "")
    .replace(/según el archivo/gi, "")
    .replace(/según el documento/gi, "")
    .replace(/en la base de archivos/gi, "")
    .replace(/según las guías adjuntas/gi, "")
    .replace(/según los documentos y métodos adjuntos/gi, "")
    .replace(/según los documentos adjuntos/gi, "");
}

