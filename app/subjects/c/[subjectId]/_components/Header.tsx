"use client";

import { Menu } from "lucide-react";
import Avator from "@/app/_components/Avator";
import { LoginButton } from "@/app/_components/LoginButton";
import { User } from "@supabase/supabase-js";
import { useState } from "react";
import type { ModeType } from "./SubjectDetailClient";

type HeaderProps = {
  user: User;
  subjectName: string;
  chatMode: ModeType;
  onChangeMode: (mode: ModeType) => void;
  onToggleSidebar: () => void;
};

export default function Header({
  user,
  subjectName,
  chatMode,
  onChangeMode,
  onToggleSidebar,
}: HeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-[#2E323B] bg-[#15171B]/95 px-4 backdrop-blur">
      {/* 左エリア: メニュー ＆ 科目名 */}
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
      </div>
      {/* 中央/右寄りエリア: モード切替スイッチ */}
      <div className="flex items-center gap-4">
        <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-800">
          <button
            onClick={() => onChangeMode("chat")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all
            ${
              chatMode === "chat"
                ? "bg-blue-600 text-white shadow"
                : "text-slate-400 hover:text-slate-200"
            }
             `}
          >
            通常学習
          </button>
          <button
            onClick={() => onChangeMode("interview")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all 
              ${
                chatMode === "interview"
                  ? "bg-amber-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }
                `}
          >
            面接モード 🎯
          </button>
        </div>

        {/* 右エリア: アバター */}
        {/* <Avatar /> */}
        {user ? <Avator /> : <LoginButton />}
      </div>
    </header>
  );
}
