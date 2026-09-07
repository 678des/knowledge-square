"use client";

import Link from "next/link";
import { useState, type MouseEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
import NewSubjectModal from "./NewSubjectModal";

import type { Subject } from "@/lib/types";

type Props = {
  open: boolean;
  onClose: () => void;
  subjects: Subject[]; // ⭕️ 親から渡されたデータを受け取る
};
import { getSubjects } from "@/lib/supabase/queries/subjects";
import { div, h1, sub } from "framer-motion/client";
export default function Sidebar({ open, onClose, subjects }: Props) {
  function handleDelete(e: MouseEvent, chatId: string) {
    e.preventDefault();
    e.stopPropagation();
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
        <div className="mt-4 px-4">
          <NewSubjectModal />
        </div>
        <hr className="mb-6 border-slate-700" />
        <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-4">
          {subjects.map((subject) => (
            <Link
              key={subject.id}
              href={"/dashboard/c/" + subject.id}
              onClick={onClose}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#3FB6A8]/40 bg-[#3FB6A8]/10 px-4 py-2.5 text-sm font-medium text-[#7ED6C9] transition-colors hover:bg-[#3FB6A8]/20"
            >
              {subject.name}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}
