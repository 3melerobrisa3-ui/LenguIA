import React, { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { KnowledgeTopic } from "../types";

interface TopicPillsProps {
  topics: KnowledgeTopic[];
  selectedTopicId: string | null;
  onSelectTopic: (topicId: string) => void;
  onSelectQuestion?: (question: string) => void;
}

export const TopicPills: React.FC<TopicPillsProps> = ({
  topics,
  selectedTopicId,
  onSelectTopic,
  onSelectQuestion,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const selectedTopic = topics.find((t) => t.id === selectedTopicId);

  const checkScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
  };

  useEffect(() => {
    if (!isOpen) return;
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [topics, isOpen]);

  const handleScroll = (direction: "left" | "right") => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const scrollAmount = 240;
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
    setTimeout(checkScroll, 200);
  };

  if (!isOpen) {
    return (
      <div className="w-full flex items-center justify-end py-0.5">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          id="toggle-topics-tab-open-btn"
          className="shrink-0 p-1.5 rounded-full border border-sky-200 bg-white/95 text-sky-700 hover:text-sky-800 hover:bg-sky-50 shadow-2xs hover:border-sky-300 transition-all cursor-pointer active:scale-95 flex items-center justify-center"
          title="Mostrar pestaña de temas"
          aria-label="Abrir pestaña de temas"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="relative flex items-center gap-1.5">
        {/* Left Arrow Button */}
        <button
          type="button"
          onClick={() => handleScroll("left")}
          disabled={!canScrollLeft}
          id="scroll-topics-left-btn"
          aria-label="Moverse a la izquierda"
          title="Ver idiomas a la izquierda"
          className={`shrink-0 p-1.5 rounded-full border transition-all cursor-pointer ${
            canScrollLeft
              ? "bg-white text-sky-700 border-sky-200 shadow-2xs hover:bg-sky-50 hover:border-sky-300 active:scale-95"
              : "bg-slate-100/70 text-slate-300 border-slate-200/50 cursor-not-allowed opacity-40"
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Scrollable pill container with visible styled bar */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="flex items-center gap-2 overflow-x-auto pb-2 pt-0.5 px-0.5 topics-scrollbar scroll-smooth flex-1 select-none"
          id="language-topics-scroll-bar"
        >
          <span className="text-xs font-semibold text-sky-900/80 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            Idiomas y Temas:
          </span>
          {topics.map((topic) => {
            const isSelected = topic.id === selectedTopicId;
            return (
              <button
                key={topic.id}
                onClick={() => onSelectTopic(topic.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 border cursor-pointer ${
                  isSelected
                    ? "bg-sky-600 text-white border-sky-600 shadow-xs"
                    : "bg-white text-slate-700 hover:bg-sky-50 border-sky-200/80 hover:border-sky-300"
                }`}
              >
                <span>{topic.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected
                      ? "bg-sky-700/60 text-sky-100"
                      : "bg-sky-50 text-sky-700 border border-sky-100"
                  }`}
                >
                  {topic.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Arrow Button */}
        <button
          type="button"
          onClick={() => handleScroll("right")}
          disabled={!canScrollRight}
          id="scroll-topics-right-btn"
          aria-label="Moverse a la derecha"
          title="Ver más idiomas a la derecha"
          className={`shrink-0 p-1.5 rounded-full border transition-all cursor-pointer ${
            canScrollRight
              ? "bg-white text-sky-700 border-sky-200 shadow-2xs hover:bg-sky-50 hover:border-sky-300 active:scale-95"
              : "bg-slate-100/70 text-slate-300 border-slate-200/50 cursor-not-allowed opacity-40"
          }`}
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Toggle Collapse/Close Button */}
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          id="toggle-topics-tab-btn"
          title="Ocultar pestaña de temas"
          aria-label="Ocultar pestaña de temas"
          className="shrink-0 p-1.5 rounded-full border border-sky-200 bg-white text-sky-700 shadow-2xs hover:bg-sky-50 hover:border-sky-300 transition-all cursor-pointer flex items-center justify-center active:scale-95"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
      </div>

      {/* If a topic is selected, display quick-select question pills */}
      {selectedTopic && selectedTopic.sampleQuestions && selectedTopic.sampleQuestions.length > 0 && (
        <div className="mt-1.5 pt-1.5 border-t border-sky-200/50 flex items-center gap-1.5 overflow-x-auto pb-0.5 topics-scrollbar">
          <span className="text-[11px] font-semibold text-sky-900/90 shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-sky-600" />
            Preguntas de {selectedTopic.name}:
          </span>
          {selectedTopic.sampleQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => onSelectQuestion?.(q)}
              className="shrink-0 px-2.5 py-1 rounded-lg bg-sky-50/90 hover:bg-sky-100 text-sky-900 border border-sky-200 text-xs font-medium transition-all shadow-2xs hover:border-sky-300 cursor-pointer text-left"
              title={q}
            >
              {q}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

