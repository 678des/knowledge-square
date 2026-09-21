"use client";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import { useRef, useEffect, useMemo, useState } from "react";

// メッセージの型定義
type Message = {
  id: string;
  role: string;
  content: string | null;
  created_at?: string;
};

// 1つの問題とそれに紐づくやり取り（スレッド）の型
type ExamProblemThread = {
  id: string;
  questionMessage: Message;
  replies: Message[];
  isPassed: boolean;
};

export default function PracticeExamView({
  logs: PracticeExamlogs,
}: {
  logs: Message[];
}) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // 各アコーディオンの開閉状態を管理 (問題IDをキーにする)
  const [openStates, setOpenStates] = useState<Record<string, boolean>>({});

  // ログを「問題ごと（スレッドごと）」にグループ化する処理
  const threads = useMemo(() => {
    if (!PracticeExamlogs || PracticeExamlogs.length === 0) return [];

    const result: ExamProblemThread[] = [];
    let currentThread: ExamProblemThread | null = null;

    PracticeExamlogs.forEach((msg) => {
      // AIのメッセージで、かつ「問題」っぽい書き始めの場合、新しい問題のブロック（スレッド）を開始する
      // ※ もし全メッセージが最初から問題形式なら、最初のAIメッセージを起点にするなど調整可能です
      if (
        msg.role === "assistant" &&
        (!currentThread || msg.content?.includes("問題"))
      ) {
        if (currentThread) {
          result.push(currentThread);
        }
        currentThread = {
          id: msg.id,
          questionMessage: msg,
          replies: [],
          isPassed: msg.content?.includes("合格") || false,
        };
      } else {
        // それ以外のメッセージ（ユーザーの回答や、AIのフィードバック）は現在のスレッドのやり取りに追加
        if (currentThread) {
          currentThread.replies.push(msg);
          // フィードバック内に「合格」の文字があれば合格フラグを立てる
          if (msg.role === "assistant" && msg.content?.includes("合格")) {
            currentThread.isPassed = true;
          }
        } else {
          // 万が一最初のメッセージがAIの問題でなかった場合のフォールバック
          currentThread = {
            id: msg.id,
            questionMessage: msg,
            replies: [],
            isPassed: false,
          };
        }
      }
    });

    if (currentThread) {
      result.push(currentThread);
    }

    return result;
  }, [PracticeExamlogs]);

  // 新しいログが来たら最下部にスクロール
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [PracticeExamlogs]);

  const toggleAccordion = (id: string) => {
    setOpenStates((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-slate-950 text-slate-100">
      <div className="flex-1 overflow-y-auto space-y-4 p-4 pr-2">
        <h1 className="text-xl font-bold text-slate-200">模擬試験セッション</h1>

        {threads && threads.length > 0 ? (
          threads.map((thread, index) => {
            // デフォルトは「最新の問題」だけ開き、過去の問題は閉じておくなどの制御も可能
            const isOpen =
              openStates[thread.id] ?? index === threads.length - 1;

            return (
              <div
                key={thread.id}
                className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-md"
              >
                {/* ── アコーディオンのヘッダー（常に表示） ── */}
                <button
                  onClick={() => toggleAccordion(thread.id)}
                  className="w-full flex items-center justify-between p-4 bg-slate-900/90 hover:bg-slate-800/80 transition-colors text-left"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      第 {index + 1} 問
                    </span>
                    <span className="text-sm font-medium text-slate-200 truncate max-w-md">
                      {/* 問題文の最初の1行などをタイトル風に抜粋 */}
                      {thread.questionMessage.content?.slice(0, 35)}...
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    {/* ステータスバッジ */}
                    {thread.isPassed ? (
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        🎉 合格
                      </span>
                    ) : (
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        🔄 挑戦中 / 要再考
                      </span>
                    )}
                    <span className="text-slate-400 text-sm">
                      {isOpen ? "▼ 閉じる" : "▶ 詳細を見る"}
                    </span>
                  </div>
                </button>

                {/* ── アコーディオンの中身（開いたときだけ展開） ── */}
                {isOpen && (
                  <div className="p-4 space-y-4 border-t border-slate-800 bg-slate-950/40">
                    {/* 問題文の本体 */}
                    <div className="rounded-lg bg-slate-900 p-4 border border-slate-800 text-sm">
                      <p className="text-xs font-semibold text-slate-400 mb-2">
                        【試験問題】
                      </p>
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeHighlight]}
                      >
                        {thread.questionMessage.content}
                      </ReactMarkdown>
                    </div>

                    {/* スレッド内のやり取り（ユーザーの回答 ＆ AIのフィードバック） */}
                    <div className="space-y-3 pl-2 border-l-2 border-slate-800 ml-2">
                      {thread.replies.map((reply, rIdx) => (
                        <div
                          key={reply.id || rIdx}
                          className={`rounded-lg p-3 text-sm ${
                            reply.role === "user"
                              ? "bg-blue-950/40 border border-blue-800/40 text-blue-100 ml-4"
                              : "bg-slate-900 border border-slate-800 text-slate-200 mr-4"
                          }`}
                        >
                          <div className="text-xs font-semibold mb-1 text-slate-400">
                            {reply.role === "user"
                              ? "👤 あなたの回答"
                              : "🤖 試験官AIのフィードバック"}
                          </div>
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeHighlight]}
                          >
                            {reply.content}
                          </ReactMarkdown>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <p className="text-sm text-slate-500">まだ対話ログがありません。</p>
        )}

        {/* スクロール終点 */}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
