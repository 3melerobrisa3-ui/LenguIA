import React from "react";
import { BookOpen, History } from "lucide-react";

interface HeaderProps {
  onOpenLibrary?: () => void;
  onOpenConversations: () => void;
  conversationsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenConversations,
  conversationsCount = 0,
}) => {
  return (
    <header className="border-b border-sky-100 bg-white/90 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 py-3.5 shadow-xs">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-100/80 border border-sky-200 flex items-center justify-center text-sky-700 shrink-0 shadow-2xs">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight">
                Chat Experto en Aprendizaje de Idiomas
              </h1>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenConversations}
            id="reset-chat-btn"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-xl text-sky-800 hover:text-sky-950 bg-sky-50 hover:bg-sky-100/90 transition-colors border border-sky-200 shadow-2xs cursor-pointer"
            title="Ver conversaciones antiguas y crear otras"
          >
            <History className="w-4 h-4 text-sky-600" />
            <span className="hidden sm:inline">Conversaciones</span>
            <span className="sm:hidden">Chats</span>
            {conversationsCount > 1 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-sky-200 text-sky-900 font-semibold">
                {conversationsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

