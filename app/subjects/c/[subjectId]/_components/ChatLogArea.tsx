"use client";
import { useRef, useEffect } from "react";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { Message } from "@/lib/types";

import ReactMarkdown, { Components } from "react-markdown";
const markdownComponents: Components = {
  // ④ Markdown内のコードブロックが横幅を超えた場合のみ内部で横スクロールさせる
  pre: ({ children, ...props }) => (
    <pre
      className="my-2 overflow-x-auto rounded border border-slate-700/50 bg-slate-900/80 p-3 text-xs text-slate-100"
      {...props}
    >
      {children}
    </pre>
  ),
  code: ({ node, className, children, ...props }) => {
    // ReactMarkdown v9 では `inline` プロパティが廃止され、
    // 「親タグが pre ではない ＝ インラインコード」で判定するのが標準的・型安全です
    const isInline = !node?.position || node.tagName !== "code"; // あるいは className の有無で判定

    if (isInline) {
      return (
        <code
          className="rounded border border-slate-700/40 bg-slate-900/60 px-1.5 py-0.5 text-xs text-amber-300"
          {...props}
        >
          {children}
        </code>
      );
    }

    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
};

export default function ChatLogs({ logs: studyChatlogs }: { logs: Message[] }) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [studyChatlogs]);
  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-slate-950 text-slate-100">
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        <h1 className="text-xl font-bold text-slate-200">
          チャット＆学習エリア
        </h1>

        {/* チャットログの表示 */}
        {studyChatlogs && studyChatlogs.length > 0 ? (
          studyChatlogs.map((msg) => (
            <div
              key={msg.id}
              className={`max-w-[80%] rounded-lg p-3 text-sm ${
                msg.role === "user"
                  ? "ml-auto bg-slate-600 text-white"
                  : "mr-auto bg-slate-800 text-slate-200 border border-slate-700"
              }`}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={markdownComponents}
              >
                {msg.content}
              </ReactMarkdown>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500">まだ対話ログがありません。</p>
        )}

        {/* スクロール終点 */}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
