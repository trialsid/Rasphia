// src/components/ChatSidebar.tsx
"use client";
import React, { useState, useEffect } from "react";
import { Pencil, Trash2 } from "lucide-react";

type ChatItem = {
  _id: string;
  title?: string;
  messages?: { text?: string }[];
  updatedAt?: string;
};

export default function ChatSidebar({
  userEmail,
  onSelect,
  activeId,
  onNew,
  onDelete,
}: {
  userEmail: string;
  activeId?: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}) {
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const load = async (q = "") => {
    const url = q
      ? `/api/chats/search?email=${encodeURIComponent(
          userEmail
        )}&q=${encodeURIComponent(q)}`
      : `/api/chats/list?email=${encodeURIComponent(userEmail)}`;

    const res = await fetch(url);
    const data = await res.json();
    setChats(data || []);
  };

  useEffect(() => {
    if (!userEmail) return;
    load();
  }, [userEmail]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await load(query);
  };

  // ➤ Start editing a title
  const startEditing = (chat: ChatItem) => {
    setEditingId(chat._id);
    setEditValue(chat.title || "Untitled");
  };

  // ➤ Save title to DB
  const saveTitle = async (chatId: string) => {
    if (!editValue.trim()) return;
    setEditingId(null);

    await fetch("/api/chats/update-title", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatId, title: editValue }),
    });

    load(); // refresh list
  };

  return (
    <aside className="w-72 bg-white/80 border-r border-stone-200 p-4 hidden md:flex flex-col backdrop-blur-sm">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-stone-800">Chats</h3>
        <button
          onClick={onNew}
          className="rounded-full bg-stone-900 text-white px-3 py-1 text-sm shadow hover:bg-stone-800 transition"
        >
          + New
        </button>
      </div>

      {/* SEARCH */}
      <form onSubmit={handleSearch} className="mb-4">
        <input
          placeholder="Search chats"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-xl border border-stone-300 bg-white/70 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-stone-400"
        />
      </form>

      {/* CHAT LIST */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {chats.map((chat) => (
          <div
            key={chat._id}
            onClick={() => onSelect(chat._id)}
            className={`group relative p-3 rounded-xl cursor-pointer transition border
              ${
                chat._id === activeId
                  ? "bg-stone-900 text-white border-stone-700"
                  : "bg-white/90 hover:bg-white border-stone-200"
              }`}
          >
            {/* TITLE OR INPUT */}
            {editingId === chat._id ? (
              <input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={() => saveTitle(chat._id)}
                onKeyDown={(e) => e.key === "Enter" && saveTitle(chat._id)}
                autoFocus
                className="w-full bg-transparent border-b border-stone-300 text-sm p-1 outline-none"
              />
            ) : (
              <p className="text-sm font-medium truncate">
                {chat.title || "Conversation"}
              </p>
            )}

            {/* LAST MESSAGE PREVIEW */}
            <p className="text-xs opacity-70 truncate">
              {(chat.messages?.at(-1)?.text || "").slice(0, 50)}
            </p>

            {/* ACTION BUTTONS ON HOVER */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  startEditing(chat);
                }}
                className="text-stone-500 hover:text-stone-700"
              >
                <Pencil className="h-4 w-4" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(chat._id);
                }}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
