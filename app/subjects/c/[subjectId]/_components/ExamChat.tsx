"use client";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";

import { useRef, useEffect } from "react";
type Attempt = {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

type Problem = {
  id: string;
  question_content: string;
  created_at: string;
  exam_attempts?: Attempt[];
};

export default function ExamProblemDetail({
  problem,
}: {
  problem: Problem | null;
}) {
  if (!problem) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
        左側のリストから問題を選択してください。
      </div>
    );
  }
  const bottomRef = useRef<HTMLDivElement>(null);

  const attempts = problem.exam_attempts || [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [problem]);

  return (
    <div className="flex-1 flex flex-col h-full  p-6 space-y-6">
      {/* スクロール可能なメインコンテンツエリア */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-2">
        {/* 試験問題の本体 */}
        <div className="p-5 border shadow-md">
          <p className="text-xs font-semibold text-slate-400 mb-2">
            【試験問題】
          </p>
          <div className="text-sm text-slate-200">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
            >
              {problem.question_content}
            </ReactMarkdown>
          </div>
        </div>

        {/* これまでのやり取りタイムライン (exam_attempts) */}
        <div className="space-y-4">
          <p className="text-xs font-semibold text-slate-400 px-1">
            【解答・フィードバック履歴】
          </p>
          {attempts.length === 0 ? (
            <p className="text-xs text-slate-500 px-1">
              まだ解答が提出されていません。下のフォームから最初の回答を送信してください。
            </p>
          ) : (
            attempts.map((attempt) => (
              <div
                key={attempt.id}
                className={`rounded-xl p-4 text-sm ${
                  attempt.role === "user"
                    ? "bg-blue-950/40 border border-blue-800/40 text-blue-100 ml-6"
                    : "bg-slate-900 border border-slate-800 text-slate-200 mr-6"
                }`}
              >
                <div className="text-xs font-semibold mb-2 text-slate-400">
                  {attempt.role === "user"
                    ? "👤 あなたの回答"
                    : "🤖 試験官AIのフィードバック"}
                </div>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                >
                  {attempt.content}
                </ReactMarkdown>
              </div>
            ))
          )}
          {/* スクロール終点 */}
          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  );
}
