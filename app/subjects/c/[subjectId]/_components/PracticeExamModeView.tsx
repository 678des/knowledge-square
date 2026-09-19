"use client";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import { useRef, useEffect } from "react";
export default function PracticeExamView({
  logs: PracticeExamlogs,
}: {
  logs: any;
}) {
  //const [chatLog, setChatLog] = useState<Message[]>(note?.all_chat_log || []);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [PracticeExamlogs]);
  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-slate-950 text-slate-100">
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        <h1 className="text-xl font-bold text-slate-200">
          チャット＆学習エリア
        </h1>

        {/* チャットログの表示 */}
        {PracticeExamlogs && PracticeExamlogs.length > 0 ? (
          PracticeExamlogs.map(
            (
              msg: {
                id: any;
                role: string;
                content: string | null | undefined;
              },
              index: any,
            ) => (
              <div
                key={msg.id || index}
                className={`max-w-[80%] rounded-lg p-3 text-sm ${
                  msg.role === "user"
                    ? "ml-auto bg-blue-600 text-white"
                    : "mr-auto bg-slate-800 text-slate-200 border border-slate-700"
                }`}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                  components={{
                    // ④ Markdown内のコードブロックが横幅を超えた場合のみ内部で横スクロールさせる
                    pre: ({ children }) => (
                      <pre className="overflow-x-auto rounded bg-slate-900/80 p-3 text-xs text-slate-100 border border-slate-700/50 my-2">
                        {children}
                      </pre>
                    ),
                    code: ({
                      node,
                      inline,
                      className,
                      children,
                      ...props
                    }: any) => {
                      return inline ? (
                        <code
                          className="rounded bg-slate-900/60 px-1.5 py-0.5 text-xs text-amber-300 border border-slate-700/40"
                          {...props}
                        >
                          {children}
                        </code>
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              </div>
            ),
          )
        ) : (
          <p className="text-sm text-slate-500">まだ対話ログがありません。</p>
        )}

        {/* スクロール終点 */}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
