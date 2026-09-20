"use client";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import { useState } from "react";

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
  onSubmitAnswer, // 回答を送信する関数（Server Action等）を親から受け取る想定
}: {
  problem: Problem | null;
  onSubmitAnswer?: (problemId: string, answerText: string) => Promise<void>;
}) {
  const [inputAnswer, setInputAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!problem) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
        左側のリストから問題を選択してください。
      </div>
    );
  }

  const attempts = problem.exam_attempts || [];
  const lastAssistantAttempt = [...attempts]
    .reverse()
    .find((a) => a.role === "assistant");
  const isPassed = lastAssistantAttempt?.content?.includes("合格") || false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputAnswer.trim() || !onSubmitAnswer) return;

    try {
      setIsSubmitting(true);
      await onSubmitAnswer(problem.id, inputAnswer);
      setInputAnswer(""); // フォームをクリア
    } catch (error) {
      console.error("送信エラー:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-6 space-y-6">
      {/* ヘッダー・ステータス表示 */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 shrink-0">
        <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-3">
          <span>問題の詳細とやり取り</span>
        </h2>
        <div>
          {isPassed ? (
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              🎉 この問題は合格済みです
            </span>
          ) : (
            <span className="text-xs font-medium px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
              🔄 挑戦中（採点待ち・または要再考）
            </span>
          )}
        </div>
      </div>

      {/* スクロール可能なメインコンテンツエリア */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-2">
        {/* 試験問題の本体 */}
        <div className="rounded-xl bg-slate-900/80 p-5 border border-slate-800 shadow-md">
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
        </div>
      </div>

      {/* 合格していなければ、一番下に回答入力フォームを固定配置 */}
      {!isPassed && (
        <form
          onSubmit={handleSubmit}
          className="border-t border-slate-800 pt-4 shrink-0 space-y-2"
        >
          <textarea
            value={inputAnswer}
            onChange={(e) => setInputAnswer(e.target.value)}
            placeholder="あなたの回答や設計の理由を記述してください（Markdownやコードも書けます）..."
            rows={3}
            className="w-full rounded-lg bg-slate-900 border border-slate-700 p-3 text-sm text-slate-100 focus:outline-none focus:border-blue-500 resize-none"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !inputAnswer.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-sm font-semibold rounded-lg transition-colors shadow-md"
            >
              {isSubmitting ? "採点中..." : "答案を提出して採点する"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
