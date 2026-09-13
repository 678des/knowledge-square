// app/subjects/c/[subjectId]/_components/SubjectDetailClient.tsx
"use client";

import { useState } from "react";
import ChatFrom from "./ChatForm";

import { Inter, Lora } from "next/font/google";
import Sidebar from "./Sidebar";
import Header from "./Header";
import ChatLogs from "./ChatLogArea";
import { Subject } from "@/lib/types";

export type ModeType = "chat" | "interview";

export const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});
export const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export function SubjectDetailClient({
  subjects,
  subjectName,
  subjectId,
  initialNote,
  user,
}: {
  subjects: Subject[];
  subjectName: string;
  subjectId: string;
  initialNote: any;
  user: any;
}) {
  const [activeMode, setActiveMode] = useState<ModeType>("chat");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    // ① h-screen で画面全体を固定し、スクロールをアプリ内部に閉じる
    <div
      className={`flex h-screen w-full flex-col overflow-hidden bg-slate-950 text-slate-100 ${inter.className}`}
    >
      {/* ヘッダーエリア */}
      {user && (
        <Header
          user={user}
          chatMode={activeMode}
          onChangeMode={setActiveMode}
          subjectName={subjectName}
          onToggleSidebar={() => setSidebarOpen(true)} // 必要に応じてハンバーガー開閉用関数を渡す
        />
      )}

      <div className="relative flex flex-1 overflow-hidden">
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          subjects={subjects}
        />

        <main className="flex flex-1 flex-col overflow-hidden p-4 md:p-6">
          {/* ② チャットログエリア：overflow-y-auto でここだけスクロールさせる */}
          <div className="flex-1 overflow-y-auto min-h-0 mb-4">
            {initialNote && <ChatLogs logs={initialNote} />}
          </div>

          <div className="shrink-0">
            <ChatFrom subjectId={subjectId} />
          </div>
        </main>

        {/* 右側：学習メモ ＆ AI要約パネル（復活させる場合） */}
        {/* <aside className="hidden lg:flex w-80 flex-col gap-6 p-6 border-l border-slate-800 bg-slate-900/40 overflow-y-auto">
          <StudyNoteArea
            subjectId={subjectId}
            initialNote={initialNote?.study_note || ""}
          />
          <AISummary initialAISummary={initialNote?.ai_summary || ""} />
        </aside> */}
      </div>
    </div>
  );
}
