import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, AlertCircle, Loader2, ArrowDown } from "lucide-react";
import { Header } from "./components/Header";
import { ChatMessageBubble } from "./components/ChatMessageBubble";
import { TopicPills } from "./components/TopicPills";
import { KnowledgeModal } from "./components/KnowledgeModal";
import { ConversationsDrawer } from "./components/ConversationsDrawer";
import { KNOWLEDGE_TOPICS } from "./data/knowledge";
import { ChatMessage, Conversation, cleanChatMessageText, isTranslationOrHowToSayQuery, TRANSLATION_REFUSAL_MESSAGE } from "./types";

const INITIAL_GREETING: ChatMessage = {
  id: "welcome-msg",
  role: "assistant",
  text: `¡Hola! Soy tu **asistente especializado** en métodos prácticos y recursos de autoaprendizaje de idiomas.

¿Qué idioma deseas aprender o qué estrategia quieres consultar hoy?`,
  timestamp: "Ahora",
  source: "local-knowledge-base",
};

export default function App() {
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const saved = localStorage.getItem("language_assistant_conversations");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((c: Conversation) => ({
            ...c,
            messages: c.messages.map((m) =>
              m.id === "welcome-msg"
                ? { ...m, text: INITIAL_GREETING.text }
                : { ...m, text: cleanChatMessageText(m.text) }
            ),
          }));
        }
      }
    } catch (e) {
      console.error("Error loading conversations", e);
    }
    const defaultConv: Conversation = {
      id: `conv-${Date.now()}`,
      title: "Nueva consulta de idiomas",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [INITIAL_GREETING],
    };
    return [defaultConv];
  });

  const [activeConversationId, setActiveConversationId] = useState<string>(() => {
    return conversations[0]?.id || `conv-${Date.now()}`;
  });

  const [isConversationsDrawerOpen, setIsConversationsDrawerOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const activeConversation =
    conversations.find((c) => c.id === activeConversationId) || conversations[0] || {
      id: "fallback",
      title: "Nueva consulta",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [INITIAL_GREETING],
    };

  const messages = activeConversation.messages;

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Sync conversations to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("language_assistant_conversations", JSON.stringify(conversations));
    } catch (e) {
      console.error("Error saving conversations", e);
    }
  }, [conversations]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollBottom(!isNearBottom);
  };

  const updateActiveConversationMessages = (updater: (prev: ChatMessage[]) => ChatMessage[]) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConversation.id) {
          const nextMsgs = updater(c.messages);
          let title = c.title;
          if (title === "Nueva consulta de idiomas" || !title) {
            const firstUser = nextMsgs.find((m) => m.role === "user");
            if (firstUser) {
              title =
                firstUser.text.slice(0, 36).trim() +
                (firstUser.text.length > 36 ? "..." : "");
            }
          }
          return {
            ...c,
            title,
            updatedAt: Date.now(),
            messages: nextMsgs,
          };
        }
        return c;
      })
    );
  };

  const handleNewConversation = () => {
    const newConv: Conversation = {
      id: `conv-${Date.now()}`,
      title: "Nueva consulta de idiomas",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [INITIAL_GREETING],
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newConv.id);
    setSelectedTopicId(null);
  };

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
  };

  const handleDeleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (conversations.length <= 1) {
      handleNewConversation();
      return;
    }
    const remaining = conversations.filter((c) => c.id !== id);
    setConversations(remaining);
    if (activeConversationId === id) {
      setActiveConversationId(remaining[0].id);
    }
  };

  const handleRenameConversation = (id: string, newTitle: string) => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: trimmed, updatedAt: Date.now() } : c))
    );
  };

  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend || inputValue).trim();
    if (!messageContent || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: messageContent,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const newMessages = [...messages, userMessage];
    updateActiveConversationMessages(() => newMessages);
    setInputValue("");
    setIsLoading(true);

    // Immediate direct evaluation for translation / "cómo se dice x en x idioma" queries
    if (isTranslationOrHowToSayQuery(messageContent)) {
      setTimeout(() => {
        const assistantMessage: ChatMessage = {
          id: `ai-${Date.now()}`,
          role: "assistant",
          text: TRANSLATION_REFUSAL_MESSAGE,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          source: "direct-rule",
        };
        updateActiveConversationMessages((prev) => [...prev, assistantMessage]);
        setIsLoading(false);
      }, 150);
      return;
    }

    // Immediate direct evaluation for queries completely unrelated to languages or sources
    if (!isQueryRelatedToLanguagesOrSources(messageContent)) {
      setTimeout(() => {
        const assistantMessage: ChatMessage = {
          id: `ai-${Date.now()}`,
          role: "assistant",
          text: "No tengo esa informacion disponible.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          source: "direct-rule",
        };
        updateActiveConversationMessages((prev) => [...prev, assistantMessage]);
        setIsLoading(false);
      }, 150);
      return;
    }

    try {
      // Send chat request to backend
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageContent,
          topicId: selectedTopicId,
          history: newMessages.map((m) => ({ role: m.role, text: m.text })),
        }),
      });

      if (!res.ok) {
        throw new Error(`Error en el servidor: ${res.status}`);
      }

      const data = await res.json();
      const assistantMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        source: data.source,
      };

      updateActiveConversationMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error("Error sending message:", err);
      // Fallback message so user always gets an expert answer
      const assistantMessage: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        role: "assistant",
        text: getQuickTopicSummary(messageContent),
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        source: "fallback-error",
      };
      updateActiveConversationMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const isQueryRelatedToLanguagesOrSources = (query: string): boolean => {
    const q = query.toLowerCase();
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
  };

  const getQuickTopicSummary = (query: string): string => {
    // If the question is asking "cómo se dice x en x idioma" or translation:
    if (isTranslationOrHowToSayQuery(query)) {
      return TRANSLATION_REFUSAL_MESSAGE;
    }

    // If the question is not related to the sources or languages:
    if (!isQueryRelatedToLanguagesOrSources(query)) {
      return "No tengo esa informacion disponible.";
    }

    const q = query.toLowerCase();

    // Specific predetermined question: La vita è bella
    if (q.includes("vita è bella") || q.includes("vita e bella") || q.includes("vida es bella") || (q.includes("benigni") && q.includes("película"))) {
      return `### ¿Por qué «La vida es bella» es ideal para practicar italiano en V.O.?

1. **Léxico cotidiano y toscano**: La primera mitad en Arezzo muestra diálogos fluidos, saludos cotidianos y expresiones afectuosas en un italiano vivo y accesible.
2. **El «concurso de los 1000 puntos» para Giosué**: Para ocultar la realidad del campo de concentración a su hijo, Guido inventa que es un juego con reglas sencillas. Esto lo obliga a hablar con frases breves, vocabulario elemental, repeticiones deliberadas y una pronunciación teatral pausada y articulada, idónea para estudiantes.
3. **Apoyo visual y gestual**: La expresividad física de Benigni permite inferir significados por contexto sin recurrir a subtítulos en español.`;
    }

    // Specific predetermined question: Bar Italia y Susanna Nocchi
    if (q.includes("bar italia") || q.includes("susanna nocchi") || q.includes("nuova grammatica")) {
      return `### Análisis: «Bar Italia» y «Nuova grammatica» (Susanna Nocchi)

* **«Bar Italia» (A1-C1)**: Recopila artículos periodísticos y reportajes reales sobre sociedad, gastronomía, hábitos y cine italiano. Incluye actividades de comprensión, análisis de léxico contextualizado y clave de soluciones.
* **«Nuova grammatica pratica della lingua italiana» (Susanna Nocchi, A2-B2)**: Obra de referencia de Alma Edizioni. Destaca por explicaciones claras con esquemas visuales, cuadros de síntesis y ejercicios progresivos con soluciones que resuelven dudas complejas (preposiciones, pronombres combinados y tiempos pasados).`;
    }

    // Specific predetermined question: Prensa deportiva / La Gazzetta Dello Sport
    if (q.includes("gazzetta") || q.includes("prensa deportiva") || q.includes("tuttosport")) {
      return `### ¿Por qué se aconseja leer prensa deportiva como «La Gazzetta Dello Sport»?

1. **Sintaxis sencilla y frases cortas**: Crónicas redactadas con estructura directa y ágil.
2. **Vocabulario muy repetitivo y predecible**: Términos de marcadores, tácticas, fichajes y jugadas se repiten a diario, permitiendo asimilar léxico sin recurrir constantemente al diccionario.
3. **Evita la frustración temprana**: No es aconsejable empezar por literatura clásica o novelas densas (como Dante), pues la barrera inicial provoca abandono.`;
    }

    // Specific predetermined question: Curva de olvido de Ebbinghaus
    if (q.includes("ebbinghaus") || q.includes("curva de olvido") || q.includes("curva del olvido")) {
      return `### La Curva del Olvido de Ebbinghaus

* **A las 24 horas**: Se olvida dos tercios de lo aprendido; la retención cae al **33%**.
* **A las 48 horas**: La retención baja al **28%**.
* **A los 31 días (1 mes)**: Sin repaso periódico, la retención residual es de apenas el **20%**.

*Conclusión didáctica*: 4 horas seguidas una vez por semana es ineficaz porque la curva borra la mayor parte antes de la siguiente sesión. En contraste, 15 a 30 minutos diarios aplican repetición espaciada y mantienen la retención por encima del 80-90%.`;
    }

    // Specific predetermined question: No estudiar más de 5 días / 2 días de descanso
    if (q.includes("5 días") || q.includes("5 dias") || q.includes("descansar 2") || q.includes("no estudiar más")) {
      return `### ¿Por qué descansar 2 días a la semana y estudiar máximo 5?

1. **Consolidación neuronal**: El cerebro afianza las conexiones de la memoria a largo plazo durante los periodos de descanso y sueño, no durante el esfuerzo ininterrumpido.
2. **Prevención del burnout**: Estudiar 7 días seguidos produce agotamiento cognitivo y causa abandono a medio plazo.
3. **Sostenibilidad del hábito**: Disponer de 2 días de descanso mantiene la motivación y hace sostenible la rutina durante meses o años.`;
    }

    // Specific predetermined question: Sistema OKR
    if (q.includes("okr") || q.includes("objetivos y resultados clave")) {
      return `### El Sistema OKR Aplicado a Idiomas

1. **Objetivo (O)**: Meta inspiradora y cualitativa (ej. «Alcanzar soltura para viajar y comunicarme sin bloqueos»).
2. **Resultados Clave (KR)**: Hasta 3 acciones semanales cuantificables (ej. leer 10 páginas, escuchar 3 podcasts de 15 min, mantener 1 sesión de conversación).
3. **Planificación semanal**: Permite evaluar horas reales vs planificadas y ajustar la carga con flexibilidad.`;
    }

    // General fallbacks by language
    if (q.includes("frances") || q.includes("francés")) {
      return "Para francés, destacan 5 estrategias clave: 1) Fijar metas tangibles (100 palabras/mes), 2) Videos de YouTube '100 mots niveau A1/A2', 3) Lecturas adaptadas como Le Petit Prince y el e-book 'Parole de France' (12,95€ con audios), 4) Expresión oral hablándose a uno mismo y shadowing, 5) Transcripción y auto-dictados para fijar ortografía.";
    }
    if (q.includes("italiano")) {
      return "Para italiano, se recomienda comenzar leyendo prensa deportiva (La Gazzetta Dello Sport, Tuttosport) por su léxico accesible, ver cine clásico en V.O. (Sergio Leone, Fellini, Benigni en 'La vida es bella'), y libros de referencia como 'Bar Italia', 'Nuova grammatica pratica' de Susanna Nocchi y 'Una parola tira l'altra'.";
    }
    if (q.includes("japonés") || q.includes("japones")) {
      return "Para japonés, la regla número 1 es aprender de memoria Hiragana y Katakana antes de los kanji. Como libros de texto destacan 'Minna no Nihongo' y 'Marugoto'. Para kanji: 'Basic Kanji Book' y 'Recordando los kanji' de Heisig. Para gramática: 'A Dictionary of Basic Japanese Grammar'.";
    }
    if (q.includes("inglés") || q.includes("ingles")) {
      return "Para inglés, el orden estricto es: 1) Fonética básica (pares mínimos como sheep/ship, sonido th), 2) Gramática básica, 3) 1000-1500 palabras nucleares (cubren 80% de conversaciones), 4) Progresión de tiempos verbales. Planes de 3 meses (funcional) o 1 año (B1-B2).";
    }
    return "Lo siento, pero no dispongo de esa información en la base de datos proporcionada.";
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-sky-50/80 via-cyan-50/40 to-sky-100/60 text-slate-900 font-sans">
      {/* Top Navigation */}
      <Header
        onOpenLibrary={() => setIsLibraryOpen(true)}
        onOpenConversations={() => setIsConversationsDrawerOpen(true)}
        conversationsCount={conversations.length}
      />


      {/* Main Container */}
      <main className="flex-1 flex flex-col max-w-5xl w-full mx-auto p-2 sm:p-4 overflow-hidden">
        {/* Topic Quick Access Pills */}
        <div className="mb-2 shrink-0">
          <TopicPills
            topics={KNOWLEDGE_TOPICS}
            selectedTopicId={selectedTopicId}
            onSelectTopic={(id) => setSelectedTopicId(id === selectedTopicId ? null : id)}
            onSelectQuestion={(q) => handleSendMessage(q)}
          />
        </div>

        {/* Chat Message Scroll Area */}
        <div
          ref={chatContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto space-y-4 p-3 sm:p-4 rounded-2xl bg-white/85 backdrop-blur-xs border border-sky-200/80 shadow-xs relative"
          id="chat-messages-container"
        >
          {messages.map((msg) => (
            <ChatMessageBubble
              key={msg.id}
              message={msg}
              onSelectPrompt={(prompt) => handleSendMessage(prompt)}
            />
          ))}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex items-start gap-3 w-full max-w-4xl mx-auto">
              <div className="w-8 h-8 rounded-xl bg-white text-sky-600 border border-sky-200 flex items-center justify-center shrink-0 shadow-2xs">
                <Sparkles className="w-4 h-4 animate-pulse text-sky-600" />
              </div>
              <div className="bg-white border border-sky-200 rounded-2xl rounded-tl-xs p-4 shadow-xs flex items-center gap-2 text-xs text-sky-800">
                <Loader2 className="w-4 h-4 animate-spin text-sky-600" />
                <span>Generando respuesta especializada...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Scroll To Bottom Button */}
        {showScrollBottom && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-28 right-6 sm:right-12 z-20 p-2.5 rounded-full bg-sky-700 text-white shadow-lg hover:bg-sky-800 transition-transform active:scale-95"
            title="Ir al final"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
        )}

        {/* Prompt Input Section */}
        <div className="mt-3 shrink-0">
          <div className="relative rounded-2xl bg-white border border-sky-200 shadow-sm focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-400/20 transition-all p-1.5">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Haz cualquier pregunta sobre francés, italiano, inglés y japonés..."
              rows={2}
              className="w-full resize-none border-0 bg-transparent px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
              id="chat-input-textarea"
            />

            <div className="flex items-center justify-end px-2 pt-1 border-t border-sky-100">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 hidden sm:inline">
                  Presiona Enter para enviar
                </span>
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim() || isLoading}
                  id="send-message-btn"
                  className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-40 disabled:hover:bg-sky-600 text-white font-medium text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  {isLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>Enviar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Library Reference Modal */}
      <KnowledgeModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onSelectPrompt={(p) => handleSendMessage(p)}
      />

      {/* Conversations Drawer (Historial y Nuevos Chats) */}
      <ConversationsDrawer
        isOpen={isConversationsDrawerOpen}
        onClose={() => setIsConversationsDrawerOpen(false)}
        conversations={conversations}
        activeConversationId={activeConversation.id}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
        onDeleteConversation={handleDeleteConversation}
        onRenameConversation={handleRenameConversation}
      />
    </div>
  );
}

