"use client";

import React from "react";

export default function ChatForm({ subjectId }: { subjectId: string }) {
  function handleMessageSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const message = formData.get("message") as string;
    console.log("送信されたメッセージ:", message, "subjectId:", subjectId);
    // ここで Server Action や API 経由で Supabase 保存処理を呼び出す
  }

  return (
    <form
      onSubmit={handleMessageSubmit}
      className="mt-4 border-t border-slate-800 pt-4 flex gap-2"
    >
      <input
        name="message"
        type="text"
        placeholder="メッセージを入力..."
        className="w-full rounded-md bg-slate-900 border border-slate-700 p-3 text-sm text-slate-200 focus:outline-none"
      />
      <button
        type="submit"
        className="rounded-md bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 focus:outline-none shrink-0"
      >
        送信
      </button>
    </form>
  );
}
