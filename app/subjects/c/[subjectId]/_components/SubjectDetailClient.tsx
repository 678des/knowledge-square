// app/subjects/c/[subjectId]/_components/SubjectDetailClient.tsx
"use client";

import { useState, useEffect } from "react";
import ChatFrom from "./ChatForm";

import { SendMessage } from "../actions/chat";
import { Inter, Lora } from "next/font/google";
import Sidebar from "./Sidebar";
import Header from "./Header";
import ChatLogs from "./ChatLogArea";
import PracticeExamView from "./PracticeExamModeView";
import { Subject } from "@/lib/types";
import AIReplyButton from "./AIReplyButton";
import StudyNoteArea from "./StudyNoteArea";
import AISummary from "./AISummaryArea";
export type ModeType = "study" | "review";
import { SendMessageResult } from "../actions/chat";
import { PracticeExam, SendExamMessage } from "../actions/practice";
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
  aiSummary,
}: {
  subjects: Subject[];
  subjectName: string;
  subjectId: string;
  studyChatlogs: any;
  interviewChatLogs: any;
  user: any;
  aiSummary: string;
}) {
  const [activeMode, setActiveMode] = useState<ModeType>("study");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [normalChatLogs, setNormalChatLogs] = useState<any>();
  const [practiceChatLogs, setPracticeChatLogs] = useState<any>();
  const [buttonsbool, setButtonsbool] = useState<boolean>(true);
  const [summary, setSummary] = useState<string>();

  useEffect(() => {
    setNormalChatLogs(studyChatlogs);
    setPracticeChatLogs(interviewChatLogs);
    setSummary(aiSummary);
  }, [subjectId]);

  async function execPractice() {
    setActiveMode("review");
    const res = await PracticeExam(subjectId);
    setPracticeChatLogs((prev: any) => [...prev, res.aiResponceObj]);
  }
  console.log(activeMode);

  async function handleSend(message: string) {
    if (activeMode == "study") {
      setNormalChatLogs((prev: any) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "user",
          content: message,
          created_at: "",
        },
      ]);
      const res = await SendMessage(subjectId, message, activeMode);
      setNormalChatLogs((prev: any) => [...prev, res?.aiResponceObj]);
      if (res?.buttons) {
        setButtonsbool(res.buttons); // ← ここで保存
      }
      setButtonsbool(true);
    } else if (activeMode == "review") {
      setPracticeChatLogs((prev: any) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "user",
          content: message,
          created_at: "",
        },
      ]);
      const res = await SendExamMessage(subjectId, message);
      setPracticeChatLogs((prev: any) => [...prev, res?.aiResponceObj]);
    }
  }
  //console.log("現在の buttonsbool の値:", buttonsbool);
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
            {normalChatLogs && activeMode == "study" && (
              <ChatLogs logs={normalChatLogs} />
            )}
            {practiceChatLogs && activeMode == "review" && (
              <PracticeExamView logs={practiceChatLogs} />
            )}

            {activeMode == "study" && buttonsbool && (
              <AIReplyButton setReviewMode={execPractice} />
            )}
          </div>
          <div className="shrink-0">
            <ChatFrom handleSend={handleSend} />
          </div>
        </main>

        {/* 右側：学習メモ ＆ AI要約パネル（復活させる場合） */}
        <aside className="hidden lg:flex w-80 flex-col gap-6 p-6 border-l border-slate-800 bg-slate-900/40 overflow-y-auto">
          {/* <StudyNoteArea subjectId={subjectId} initialNote={""} /> */}
          <AISummary initialAISummary={summary || ""} />
        </aside>
      </div>
    </div>
  );
}
