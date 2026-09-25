import React, { useState } from "react";
import { X, Book, Film, Bookmark, Sparkles, CheckCircle2 } from "lucide-react";
import { ITALIAN_BOOKS, JAPANESE_BOOKS, ITALIAN_MOVIES } from "../data/knowledge";

interface KnowledgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrompt: (prompt: string) => void;
}

export const KnowledgeModal: React.FC<KnowledgeModalProps> = ({
  isOpen,
  onClose,
  onSelectPrompt,
}) => {
  const [activeTab, setActiveTab] = useState<"italiano" | "japones" | "cine" | "metodos">("italiano");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden"
        id="knowledge-modal"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-sky-100 bg-sky-50/70">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-sky-600" />
              Recursos y Fichas de los Archivos
            </h2>
            <p className="text-xs text-slate-500">
              Datos catalogados directamente del corpus de 56 páginas adjunto
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-sky-100 transition-colors"
            id="close-modal-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-sky-100 px-6 gap-2 bg-sky-50/40 overflow-x-auto py-2">
          <button
            onClick={() => setActiveTab("italiano")}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === "italiano"
                ? "bg-sky-100 text-sky-900 border border-sky-300"
                : "text-slate-600 hover:bg-sky-50 hover:text-sky-900"
            }`}
          >
            🇮🇹 Libros & PDFs de Italiano
          </button>
          <button
            onClick={() => setActiveTab("japones")}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === "japones"
                ? "bg-sky-100 text-sky-900 border border-sky-300"
                : "text-slate-600 hover:bg-sky-50 hover:text-sky-900"
            }`}
          >
            🇯🇵 Libros & Kanji de Japonés
          </button>
          <button
            onClick={() => setActiveTab("cine")}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === "cine"
                ? "bg-sky-100 text-sky-900 border border-sky-300"
                : "text-slate-600 hover:bg-sky-50 hover:text-sky-900"
            }`}
          >
            🎬 Cine en Versión Original
          </button>
          <button
            onClick={() => setActiveTab("metodos")}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === "metodos"
                ? "bg-sky-100 text-sky-900 border border-sky-300"
                : "text-slate-600 hover:bg-sky-50 hover:text-sky-900"
            }`}
          >
            🧠 Hábitos, OKR & Estancamiento
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === "italiano" && (
            <div className="space-y-4">
              <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-xl text-xs text-cyan-950 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Recomendación clave de los documentos:</strong> El castellano y el italiano comparten más del 80% de vocabulario (ej: <em>abbandonare</em>, <em>bottone</em>, <em>elicottero</em>). Para principiantes se aconseja iniciar leyendo periódicos deportivos (<em>La Gazzetta Dello Sport</em>, <em>Tuttosport</em>) antes de novelas.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {ITALIAN_BOOKS.map((book, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-sky-100 bg-white hover:border-sky-300 transition-shadow hover:shadow-xs">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-sm text-slate-900">{book.title}</h4>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 border border-sky-200 shrink-0">
                        {book.level}
                      </span>
                    </div>
                    <span className="inline-block my-1 text-[11px] font-medium text-sky-800 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-100">
                      {book.type}
                    </span>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{book.description}</p>
                    <button
                      onClick={() => {
                        onSelectPrompt(`Cuéntame más sobre el libro "${book.title}" para aprender italiano y cómo usarlo en mi rutina.`);
                        onClose();
                      }}
                      className="mt-2.5 text-xs text-sky-600 hover:text-sky-800 font-medium inline-flex items-center gap-1"
                    >
                      Preguntar a la IA sobre este libro →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "japones" && (
            <div className="space-y-4">
              <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-xs text-sky-950 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Secuencia obligatoria de los archivos:</strong> 1) Hiragana y Katakana de memoria con tablas de trazos (Fundación Japón / Yoshida). 2) Gramática con libro de texto. 3) Preparación para el Noken (JLPT N5-N1). Con N3 ya es posible viajar y comunicarse con tranquilidad.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {JAPANESE_BOOKS.map((book, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-sky-100 bg-white hover:border-sky-300 transition-shadow hover:shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-sm text-slate-900">{book.title}</h4>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 border border-sky-200 shrink-0">
                          {book.level}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{book.description}</p>
                      
                      {book.pros && (
                        <div className="mt-2 text-[11px] text-emerald-800 bg-emerald-50/70 p-1.5 rounded-md">
                          <strong>Pros:</strong> {book.pros}
                        </div>
                      )}
                      {book.cons && (
                        <div className="mt-1 text-[11px] text-rose-800 bg-rose-50/70 p-1.5 rounded-md">
                          <strong>Contras:</strong> {book.cons}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        onSelectPrompt(`¿Cómo debo utilizar "${book.title}" para estudiar japonés según las guías?`);
                        onClose();
                      }}
                      className="mt-3 text-xs text-sky-600 hover:text-sky-800 font-medium inline-flex items-center gap-1"
                    >
                      Consultar recomendaciones sobre este método →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "cine" && (
            <div className="space-y-4">
              <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-xs text-sky-950">
                El cine en versión original es un auténtico curso de idioma y cultura. Los documentos destacan que ver las películas sin subtítulos (o con subtítulos en italiano) acelera la comprensión auditiva real.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {ITALIAN_MOVIES.map((film, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-sky-100 bg-white hover:border-sky-300 transition-shadow hover:shadow-xs">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-sm text-slate-900">{film.title}</h4>
                      {film.year && (
                        <span className="text-[10px] text-sky-700 font-mono px-1.5 py-0.5 bg-sky-50 rounded border border-sky-100">
                          {film.year}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-sky-700 font-medium italic mt-0.5">{film.originalTitle}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Dir: {film.director}</p>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">{film.summary}</p>
                    <button
                      onClick={() => {
                        onSelectPrompt(`¿Por qué la película "${film.title}" es ideal para practicar italiano y qué vocabulario o contexto aporta?`);
                        onClose();
                      }}
                      className="mt-2.5 text-xs text-sky-600 hover:text-sky-800 font-medium inline-flex items-center gap-1"
                    >
                      Preguntar por qué ver esta película →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "metodos" && (
            <div className="space-y-4 text-xs text-slate-700">
              <div className="p-4 rounded-xl border border-sky-100 bg-sky-50/50 space-y-2">
                <h3 className="text-sm font-bold text-slate-900">1. Sistema OKR (Objectives and Key Results)</h3>
                <p>Nacido en los años 50 y usado por Google, Spotify y Amazon. Se estructura en:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Objetivo:</strong> Resultado final ambicioso (ej. Mudarse a otro país, mantener conversaciones de trabajo).</li>
                  <li><strong>Resultados Clave (KR):</strong> Hasta 3 acciones concretas y medibles por semana (ej. leer 5 páginas, escuchar 30 min de podcast, practicar 15 min de auto-dictado).</li>
                  <li><strong>Límite de 5 días:</strong> Máximo 5 días de estudio semanal; 2 días de descanso necesarios para la consolidación sin saturación.</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl border border-sky-100 bg-sky-50/50 space-y-2">
                <h3 className="text-sm font-bold text-slate-900">2. Superar la Meseta B1-B2 (Ericsson & Pool)</h3>
                <p>A las ~50 horas de práctica en cualquier disciplina, el cerebro entra en «piloto automático» y se estanca en la zona de confort.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  <div className="p-2.5 bg-white rounded-lg border border-sky-100">
                    <strong>1. Revisar el «por qué»</strong>: Conectar con un motivo tangible y emocional, no superficial.
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-sky-100">
                    <strong>2. Regla de los 5 minutos</strong>: Obligarse a empezar solo 5 minutos para vencer la pereza.
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-sky-100">
                    <strong>3. Variar actividades</strong>: Videojuegos, canciones, cómics y audios propios.
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-sky-100">
                    <strong>4. Tutor nativo (Preply)</strong>: Romper el hábito de usar siempre las mismas palabras.
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-sky-100">
                    <strong>5. Inmersión total en casa</strong>: Cambiar idioma de teléfono y búsquedas online.
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-sky-100">
                    <strong>6. Mentalidad de reto</strong>: «El obstáculo es el camino» (Ryan Holiday).
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-sky-100 bg-sky-50/70 flex items-center justify-between text-xs text-slate-500">
          <span>Haz clic en cualquier recurso para consultarlo directamente en el chat</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-sky-100 hover:bg-sky-200 text-sky-900 font-medium rounded-lg transition-colors border border-sky-200"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
