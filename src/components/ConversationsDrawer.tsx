import React, { useState } from "react";
import { Plus, MessageSquare, Trash2, X, Clock, Check, Pencil } from "lucide-react";
import { Conversation } from "../types";

interface ConversationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  activeConversationId: string;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string, e: React.MouseEvent) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
}

export const ConversationsDrawer: React.FC<ConversationsDrawerProps> = ({
  isOpen,
  onClose,
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onRenameConversation,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  if (!isOpen) return null;

  const handleStartRename = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title || "Nueva consulta");
  };

  const handleSaveRename = (id: string, e?: React.MouseEvent | React.FormEvent) => {
    if (e) e.stopPropagation();
    const trimmed = editTitle.trim();
    if (trimmed) {
      onRenameConversation(id, trimmed);
    }
    setEditingId(null);
  };

  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    const timeStr = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (isToday) {
      return `Hoy, ${timeStr}`;
    }
    return `${date.toLocaleDateString([], { day: "numeric", month: "short" })}, ${timeStr}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <aside className="w-screen max-w-sm sm:max-w-md bg-white shadow-2xl border-l border-sky-100 flex flex-col h-full z-10 animate-in slide-in-from-right duration-250">
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 border-b border-sky-100 flex items-center justify-between bg-gradient-to-r from-sky-50/70 to-cyan-50/40">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-sky-600 text-white flex items-center justify-center shadow-xs">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900 tracking-tight">
                  Conversaciones
                </h2>
                <p className="text-xs text-slate-500">
                  Historial guardado y nuevas consultas
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Cerrar barra"
              id="close-conversations-drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Action: Create New Conversation */}
          <div className="p-4 border-b border-sky-100/80 bg-white">
            <button
              onClick={() => {
                onNewConversation();
                onClose();
              }}
              id="new-chat-action-btn"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium transition-all shadow-xs active:scale-[0.99] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva conversación</span>
            </button>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5 scrollbar-thin">
            <div className="flex items-center justify-between px-1 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Historial de chats ({conversations.length})
              </span>
              <span className="text-[11px] text-slate-400">
                Guardado en este navegador
              </span>
            </div>

            {conversations.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                No hay conversaciones archivadas aún.
              </div>
            ) : (
              conversations.map((conv) => {
                const isActive = conv.id === activeConversationId;
                const isEditing = editingId === conv.id;
                const userMsgsCount = conv.messages.filter((m) => m.role === "user").length;
                const lastMessage = conv.messages[conv.messages.length - 1];

                return (
                  <div
                    key={conv.id}
                    onClick={() => {
                      onSelectConversation(conv.id);
                      onClose();
                    }}
                    className={`group relative p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                      isActive
                        ? "bg-sky-50/90 border-sky-300 ring-1 ring-sky-300 shadow-2xs"
                        : "bg-white hover:bg-slate-50/90 border-slate-200/90 hover:border-sky-200"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      {isEditing ? (
                        <div
                          className="flex items-center gap-1.5 w-full"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveRename(conv.id);
                              if (e.key === "Escape") setEditingId(null);
                            }}
                            autoFocus
                            placeholder="Nombre del chat..."
                            className="flex-1 text-xs font-medium px-2 py-1 bg-white border border-sky-400 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 text-slate-800"
                          />
                          <button
                            onClick={(e) => handleSaveRename(conv.id, e)}
                            className="p-1 rounded-md bg-sky-600 hover:bg-sky-700 text-white transition-colors cursor-pointer"
                            title="Guardar nombre"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={handleCancelRename}
                            className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                            title="Cancelar"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            {isActive ? (
                              <span className="w-2 h-2 rounded-full bg-sky-600 shrink-0" />
                            ) : (
                              <MessageSquare className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600 shrink-0 transition-colors" />
                            )}
                            <h3 className="text-sm font-semibold text-slate-800 truncate" title={conv.title || "Nueva consulta"}>
                              {conv.title || "Nueva consulta"}
                            </h3>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {isActive && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-sky-100 text-sky-800 border border-sky-200/60">
                                <Check className="w-3 h-3 text-sky-700" />
                                Activa
                              </span>
                            )}
                            <button
                              onClick={(e) => handleStartRename(conv, e)}
                              className="p-1 rounded text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors opacity-80 hover:opacity-100 cursor-pointer"
                              title="Cambiar nombre del chat"
                              id={`rename-btn-${conv.id}`}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => onDeleteConversation(conv.id, e)}
                              className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors opacity-80 hover:opacity-100 cursor-pointer"
                              title="Eliminar conversación"
                              id={`delete-btn-${conv.id}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>

                    {lastMessage && (
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {lastMessage.text.replace(/[#*`_]/g, "").slice(0, 100)}...
                      </p>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(conv.updatedAt || conv.createdAt)}
                      </span>
                      <span>
                        {userMsgsCount} {userMsgsCount === 1 ? "pregunta" : "preguntas"}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Drawer Footer info */}
          <div className="p-3 border-t border-sky-100 bg-sky-50/50 text-[11px] text-slate-500 text-center">
            Las conversaciones se guardan localmente para que puedas retomarlas cuando quieras.
          </div>
        </aside>
      </div>
    </div>
  );
};
