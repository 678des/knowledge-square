"use client";

import { useState } from "react";
export default function ChatForm({
  handleSend,
}: {
  handleSend: (message: string) => void;
}) {
  const [userInputMsg, setUserInputMsg] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false); // ← 送信中フラグ

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInputMsg.trim() || isSubmitting) return; // 送信中なら処理しない

    try {
      setIsSubmitting(true); // 送信開始

      // 非同期処理（API通信など）がある場合は await handleSend(...) になります
      handleSend(userInputMsg);
      setUserInputMsg(""); // 入力をクリア
    } finally {
      setIsSubmitting(false); // 送信終了（必要に応じてfinallyや非同期の完了後に解除）
    }
  };
  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 border-t border-slate-800 pt-4 flex gap-2"
    >
      <input
        name="message"
        type="text"
        value={userInputMsg}
        placeholder="メッセージを入力..."
        className="w-full rounded-md bg-slate-900 border border-slate-700 p-3 text-sm text-slate-200 focus:outline-none"
        onChange={(e) => setUserInputMsg(e.target.value)}
      />
      <button
        type="submit"
        className="rounded-md bg-blue-800 hover:bg-blue-700 text-white py-2 px-4 focus:outline-none shrink-0"
      >
        送信
      </button>
    </form>
  );
}
