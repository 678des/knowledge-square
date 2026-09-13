"use client";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { Note } from "@/lib/types";
import { Message } from "@/lib/types";
export default function ChatLogs({ logs: note }: { logs: Note }) {
  const [chatLog, setChatLog] = useState<Message[]>(note?.all_chat_log || []);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-slate-950 text-slate-100">
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        <h1 className="text-xl font-bold text-slate-200">
          チャット＆学習エリア
        </h1>

        {/* チャットログの表示 */}
        {chatLog && chatLog.length > 0 ? (
          chatLog.map((msg, index) => (
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
              >
                {msg.content}
              </ReactMarkdown>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500">まだ対話ログがありません。</p>
        )}
      </div>
    </div>
  );
}
