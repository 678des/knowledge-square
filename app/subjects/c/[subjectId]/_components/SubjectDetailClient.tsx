// app/subjects/c/[subjectId]/_components/SubjectDetailClient.tsx
"use client";

import { useState } from "react";
import ChatFrom from "./ChatForm";

import { SendMessage } from "../actions/chat";
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
  studyChatlogs,
  interviewChatLogs,
  user,
}: {
  subjects: Subject[];
  subjectName: string;
  subjectId: string;
  studyChatlogs: any;
  interviewChatLogs: any;
  user: any;
}) {
  const [activeMode, setActiveMode] = useState<ModeType>("chat");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [buttons, setButtons] = useState<any[]>([]);

  async function handleSend(message: string) {
    const res = await SendMessage(subjectId, message, "study");

    if (res?.buttons) {
      setButtons(res.buttons); // ← ここで保存
    }

    // setMessages((prev) => [
    //   ...prev,
    //   { role: "user", content: message },
    //   { role: "assistant", content: res.data, buttons: res.buttons }
    // ]);
  }

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
            {studyChatlogs && <ChatLogs logs={studyChatlogs} />}
          </div>

          {buttons.length > 0 && (
            <div className="flex gap-2 mb-4">
              {buttons.map((btn) => (
                <button
                  key={btn.value}
                  onClick={() => handleSend(btn.value)}
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  {btn.label}
                </button>
              ))}
            </div>
          )}

          <div className="shrink-0">
            <ChatFrom handleSend={handleSend} />
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
