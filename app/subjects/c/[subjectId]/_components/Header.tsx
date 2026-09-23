"use client";

import { Menu, BookOpen } from "lucide-react";
import Avator from "@/app/_components/Avator";
import { LoginButton } from "@/app/_components/LoginButton";
import { User } from "@supabase/supabase-js";
import type { ModeType } from "./SubjectDetailClient";

type HeaderProps = {
  user: User;
  subjectName: string;
  chatMode: ModeType;
  onChangeMode: (mode: ModeType) => void;
  onToggleSidebar: () => void;
  onToggleStudyMemo: () => void;
};

export default function Header({
  user,
  subjectName,
  chatMode,
  onChangeMode,
  onToggleSidebar,
  onToggleStudyMemo,
}: HeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-[#2E323B] bg-[#15171B]/95 px-4 backdrop-blur">
      {/* ── 1. 左エリア: 全体ナビゲーション ── */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          aria-label="メニューを開く"
          className="flex items-center rounded-lg p-1.5 text-[#98A0AC] transition-colors hover:bg-[#1C1F25] hover:text-[#E7E8EA]"
        >
          <Menu size={20} />
        </button>
        <h1 className="truncate text-sm font-semibold text-slate-200 sm:text-base">
          {subjectName}
        </h1>
        <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-800">
          <button
            onClick={() => onChangeMode("study")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
              chatMode === "study"
                ? "bg-slate-600 text-white shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            チャット学習
          </button>
          <button
            onClick={() => onChangeMode("review")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
              chatMode === "review"
                ? "bg-slate-600 text-white shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            問題
          </button>
        </div>
      </div>

      {/* ── 2. 中央エリア: モード切替スイッチ ── */}
      <div className="flex items-center"></div>

      {/* ── 3. 右エリア: アクション ＆ アカウント ── */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleStudyMemo}
          aria-label="要約と学習メモを開く"
          title="要約と学習メモ"
          className="flex items-center rounded-lg p-2 text-[#98A0AC] transition-colors hover:bg-[#1C1F25] hover:text-[#E7E8EA]"
        >
          <BookOpen size={18} />
        </button>
        <div className="h-4 w-[1px] bg-slate-800 mx-1" />{" "}
        {/* 軽く区切り線を入れるとさらに綺麗 */}
        {user ? <Avator /> : <LoginButton />}
      </div>
    </header>
  );
}
