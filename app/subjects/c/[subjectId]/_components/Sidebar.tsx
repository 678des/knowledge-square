"use client";

import Link from "next/link";
import NewSubjectModal from "../../../_components/NewSubjectModal";
import type { Subject } from "@/lib/types";

type Props = {
  open: boolean;
  onClose: () => void; // ① より安全な関数型に修正
  subjects: Subject[];
};

export default function Sidebar({ open, onClose, subjects }: Props) {
  return (
    <>
      {/* 背景オーバーレイ */}
      <div
        onClick={onClose} // ② シンプルかつ安全な呼び出しに修正
        aria-hidden={!open}
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* サイドバー本体 */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-[300px] flex-col border-r border-slate-800 bg-[#1C1F25] transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="学習履歴サイドバー"
      >
        {/* 新規作成エリア */}
        <div className="p-4">
          <NewSubjectModal />
        </div>

        <hr className="my-2 border-slate-800" />

        {/* 科目リストナビゲーション */}
        <nav className="flex-1 space-y-2 overflow-y-auto p-3">
          {subjects.map((subject) => (
            <Link
              key={subject.id}
              href={`/subjects/c/${subject.id}`} // ③ テンプレートリテラルで記述
              onClick={onClose}
              // ④ 一覧リストとして自然な左寄せのカードデザインに変更
              className="flex w-full items-center justify-between rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-3 text-sm font-medium text-slate-200 transition-all hover:border-[#3FB6A8]/50 hover:bg-[#3FB6A8]/10 hover:text-[#7ED6C9]"
            >
              <span className="truncate">{subject.name}</span>
              <span className="text-xs text-slate-500">→</span>
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}
