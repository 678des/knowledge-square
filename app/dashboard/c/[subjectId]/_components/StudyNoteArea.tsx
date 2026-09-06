// app/dashboard/c/[subjectId]/_components/StudyNoteArea.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useDebounce } from "use-debounce";

//import { updateStudyNote } from "@/lib/supabase/queries/notes";
import { updateStudyNote } from "@/app/dashboard/c/[subjectId]/actions/note";
export default function StudyNoteArea({
  subjectId,
  initialNote,
}: {
  subjectId: string;
  initialNote: string;
}) {
  const [text, setText] = useState(initialNote);
  const [debouncedText] = useDebounce(text, 5000);
  const [isSaving, setIsSaving] = useState(false);

  // 初回表示時かどうかを判定するフラグ
  const isFirstRender = useRef(true);

  useEffect(() => {
    // 初回レンダリング時はスキップ
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    async function save() {
      setIsSaving(true);
      console.log("メモを自動保存中:", debouncedText);
      await updateStudyNote(subjectId, debouncedText);
      setIsSaving(false);
    }

    save();
  }, [debouncedText, subjectId]);

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-sm font-semibold text-slate-400">✍️ 学習メモ</h2>
        <span className="text-xs text-slate-500">
          {isSaving ? "保存中..." : "自動保存"}
        </span>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="ここに復習メモを入力..."
        className="w-full h-44 rounded-md bg-slate-950 border border-slate-800 p-3 text-sm text-slate-200 resize-none focus:outline-none"
      />
    </div>
  );
}
