"use client";

import { useState } from "react";
export default function ChatForm({
  handleSend,
}: {
  handleSend: (message: string) => void;
}) {
  const [userInputMsg, setUserInputMsg] = useState<string>("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSend(userInputMsg);
      }}
      className="mt-4 border-t border-slate-800 pt-4 flex gap-2"
    >
      <input
        name="message"
        type="text"
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
