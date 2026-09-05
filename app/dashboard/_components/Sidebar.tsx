"use client";

import Link from "next/link";
import { useState, type MouseEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  categories,
  chats as initialChats,
  type ChatItem,
} from "../_lib/mock-data";

export default function Sidebar({
  open,
  onClose,
  activeChatId,
}: {
  open: boolean;
  onClose: () => void;
  activeChatId?: string;
}) {
  const [chatList, setChatList] = useState<ChatItem[]>(initialChats);

  function handleDelete(e: MouseEvent, chatId: string) {
    e.preventDefault();
    e.stopPropagation();
    setChatList((prev) => prev.filter((c) => c.id !== chatId));
  }

  return (
    <>
      {/* オーバーレイ: サイドバーが開いている間だけ表示し、クリックで閉じる */}
      <div
        onClick={onClose}
        aria-hidden={!open}
        className={`fixed inset-0 z-40 bg-black/60 transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-[300px] flex-col border-r border-[#2E323B] bg-[#1C1F25] transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="学習履歴サイドバー"
      >
        <div className="p-4">
          <Link
            href="/dashboard/c/new"
            onClick={onClose}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#3FB6A8]/40 bg-[#3FB6A8]/10 px-4 py-2.5 text-sm font-medium text-[#7ED6C9] transition-colors hover:bg-[#3FB6A8]/20"
          >
            <Plus size={16} />
            新しい学習をはじめる
          </Link>
        </div>

        <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-4">
          {categories.map((category) => {
            const categoryChats = chatList.filter(
              (c) => c.categoryId === category.id,
            );
            if (categoryChats.length === 0) return null;
            //const Icon = category.icon

            return (
              <div key={category.id}>
                <div className="mb-1.5 flex items-center gap-2 px-2">
                  {/* <Icon size={14} style={{ color: category.color }} /> */}
                  <span className="text-xs font-medium text-[#98A0AC]">
                    {category.name}
                  </span>
                </div>
                <ul className="space-y-0.5">
                  {categoryChats.map((chat) => {
                    const isActive = chat.id === activeChatId;
                    return (
                      <li key={chat.id}>
                        <Link
                          href={`/dashboard/c/${chat.id}`}
                          onClick={onClose}
                          className={`group flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition-colors ${
                            isActive
                              ? "bg-[#262A31] text-[#E7E8EA]"
                              : "text-[#B4BAC4] hover:bg-[#262A31]/70"
                          }`}
                        >
                          <span
                            className="h-1.5 w-1.5 shrink-0 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          <span className="min-w-0 flex-1 truncate">
                            {chat.title}
                          </span>
                          {chat.status && (
                            <span className="shrink-0 rounded-full bg-[#D9A857]/15 px-1.5 py-0.5 text-[10px] font-medium text-[#D9A857]">
                              {chat.status}
                            </span>
                          )}
                          <button
                            onClick={(e) => handleDelete(e, chat.id)}
                            aria-label="このチャットを削除"
                            className="shrink-0 rounded p-1 text-[#6B7280] opacity-0 transition-opacity hover:bg-black/20 hover:text-red-400 group-hover:opacity-100"
                          >
                            <Trash2 size={13} />
                          </button>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
