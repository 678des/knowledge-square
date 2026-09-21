"use client";

import { useState, useEffect } from "react";
import ChatFrom from "./ChatForm";

import { SendMessage } from "../actions/chat";
import { Inter, Lora } from "next/font/google";
import Sidebar from "./Sidebar";
import Header from "./Header";
import ChatLogs from "./ChatLogArea";
import { Subject } from "@/lib/types";
import AIReplyButton from "./AIReplyButton";
//import StudyNoteArea from "./StudyNoteArea";
//import AISummary from "./AISummaryArea";
export type ModeType = "study" | "review";
import { PracticeExam } from "../actions/practice";
import ExamProblemSidebar from "./ExamProblemList";
import ExamProblemDetail from "./ExamChat";
import { Exam } from "../actions/exam";
import { User } from "@supabase/supabase-js";

import type { Message, ExamProblem } from "../../../../../lib/types";

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
  problems,
  user,
  aiSummary,
}: {
  subjects: Subject[];
  subjectName: string;
  subjectId: string;
  studyChatlogs: Message[];
  problems: ExamProblem[];
  user: User;
  aiSummary: string;
}) {
  const [activeMode, setActiveMode] = useState<ModeType>("study");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [normalChatLogs, setNormalChatLogs] = useState<Message[]>(
    studyChatlogs || [],
  );
  //const [examProblems, setExamProblems] = useState<ExamProblem[]>(problems);
  const examProblems = problems;
  const [selectedProblemId, setSelectedProblemId] = useState<string | null>(
    problems[1]?.id || "",
  );

  //const [summary, setSummary] = useState<string>(aiSummary);

  console.log(aiSummary);

  const selectedProblem =
    problems.find((p: { id: string | null }) => p.id === selectedProblemId) ||
    null;

  useEffect(() => {}, [subjectId]);

  async function execPractice() {
    setActiveMode("review");
    await PracticeExam(subjectId);
  }
  async function handleSend(message: string) {
    setNormalChatLogs((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "user",
        content: message,
        created_at: "",
      },
    ]);
    const res = await SendMessage(subjectId, message, activeMode);
    setNormalChatLogs((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content: res?.aiResponceObj.content || "",
        created_at: "",
      },
    ]);
  }

  async function handleAnswer(message: string) {
    if (selectedProblemId) {
      await Exam(message, subjectId, selectedProblemId);
    }
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

        {examProblems && activeMode == "review" && (
          <aside className="hidden lg:flex w-80 flex-col gap-6 p-6 border-l border-slate-800 bg-slate-900/40 overflow-y-auto">
            <ExamProblemSidebar
              problems={examProblems}
              selectedProblemId={""}
              onSelectProblem={setSelectedProblemId}
            />
          </aside>
        )}
        {/* {activeMode == "study" &&  (
          <aside className="hidden lg:flex w-80 flex-col gap-6 p-6 border-l border-slate-800 bg-slate-900/40 overflow-y-auto">
            <AISummary initialAISummary={summary || ""} />
          </aside>
        )} */}

        <main className="flex flex-1 flex-col overflow-hidden p-4 md:p-6">
          {/* ② チャットログエリア：overflow-y-auto でここだけスクロールさせる */}
          <div className="flex-1 overflow-y-auto min-h-0 mb-4">
            {normalChatLogs && activeMode == "study" && (
              <div>
                <ChatLogs logs={normalChatLogs} />
                <AIReplyButton setReviewMode={execPractice} />
              </div>
            )}

            {/* 右側：メインエリア（問題の詳細・やり取り・フォーム） */}
            {activeMode == "review" && (
              <ExamProblemDetail problem={selectedProblem} />
            )}
          </div>
          <div className="shrink-0">
            {activeMode == "study" && <ChatFrom handleSend={handleSend} />}
            {activeMode == "review" && <ChatFrom handleSend={handleAnswer} />}
          </div>
        </main>

        {/* 右側：学習メモ ＆ AI要約パネル（復活させる場合） */}
      </div>
    </div>
  );
}
