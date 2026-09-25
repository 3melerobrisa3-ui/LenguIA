import React, { useState } from "react";
import Markdown from "react-markdown";
import { Copy, Check, Bot, User, Sparkles } from "lucide-react";
import { ChatMessage, cleanChatMessageText } from "../types";

interface ChatMessageBubbleProps {
  message: ChatMessage;
  onSelectPrompt?: (prompt: string) => void;
}

export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({
  message,
  onSelectPrompt,
}) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";
  const processedText = isUser ? message.text : cleanChatMessageText(message.text);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(processedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback if clipboard API unavailable
    }
  };

  return (
    <div
      className={`flex items-start gap-3 w-full max-w-4xl mx-auto ${
        isUser ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
          isUser
            ? "bg-sky-600 text-white"
            : "bg-white text-sky-600 border border-sky-200"
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Bubble Container */}
      <div
        className={`relative group max-w-[88%] sm:max-w-[80%] rounded-2xl p-4 transition-shadow ${
          isUser
            ? "bg-sky-600 text-white rounded-tr-xs shadow-xs"
            : "bg-white text-slate-900 border border-sky-100/90 rounded-tl-xs shadow-xs"
        }`}
      >
        {/* Header Meta */}
        <div className="flex items-center justify-between gap-3 mb-1.5 pb-1 border-b border-stone-100/15">
          <div className="flex items-center gap-1.5">
            <span
              className={`text-xs font-semibold ${
                isUser ? "text-sky-100" : "text-slate-800"
              }`}
            >
              {isUser ? "Tú" : "IA Experta en Idiomas"}
            </span>

            {!isUser && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200">
                <Sparkles className="w-2.5 h-2.5 text-sky-600" />
                Especialista
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-[11px] opacity-70">
            <span>{message.timestamp}</span>
            <button
              onClick={handleCopy}
              className={`p-1 rounded hover:bg-stone-500/15 transition-colors ${
                isUser ? "text-sky-100" : "text-slate-400 hover:text-sky-700"
              }`}
              title="Copiar texto"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Message Body */}
        {isUser ? (
          <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
            {message.text}
          </p>
        ) : (
          <div className="text-sm sm:text-base text-slate-800 leading-relaxed space-y-2">
            <Markdown
              components={{
                h1: ({ children }) => (
                  <h1 className="text-lg font-bold text-slate-900 mt-2 mb-1 border-b border-sky-100 pb-1">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-base font-bold text-slate-900 mt-2 mb-1">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-sm font-bold text-sky-950 mt-2 mb-0.5">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc pl-5 my-2 space-y-1">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal pl-5 my-2 space-y-1">{children}</ol>
                ),
                li: ({ children }) => (
                  <li className="leading-relaxed">{children}</li>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-slate-900">{children}</strong>
                ),
                em: ({ children }) => (
                  <em className="italic text-slate-700">{children}</em>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-3 border-sky-500 bg-sky-50/60 pl-3 py-1.5 my-2 text-xs italic text-slate-700 rounded-r">
                    {children}
                  </blockquote>
                ),
                code: ({ children }) => (
                  <code className="bg-sky-50 text-sky-800 border border-sky-100 px-1.5 py-0.5 rounded text-xs font-mono">
                    {children}
                  </code>
                ),
              }}
            >
              {processedText}
            </Markdown>
          </div>
        )}
      </div>
    </div>
  );
};
