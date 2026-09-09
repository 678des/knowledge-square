import { getNote } from "@/lib/supabase/queries/notes";
import ChatFrom from "./_components/ChatForm";
import StudyNoteArea from "./_components/StudyNoteArea";
import AISummary from "./_components/AISummaryArea";
import ChatLogs from "./_components/ChatLogArea";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ subjectId: string }>;
}) {
  const { subjectId } = await params;
  const note = await getNote(subjectId);
  return (
    <div className="flex h-full w-full overflow-hidden bg-slate-950 text-slate-100">
      {/* メイン：チャットエリア */}
      <main className="flex flex-1 flex-col justify-between border-r border-slate-800 p-6">
        {note && <ChatLogs logs={note} />}
        <ChatFrom subjectId={subjectId} />
      </main>

      {/* 右側：学習メモ ＆ AI要約パネル */}
      <aside className="w-80 flex flex-col gap-6 p-6 bg-slate-900/40">
        <StudyNoteArea
          subjectId={subjectId}
          initialNote={note?.study_note || ""}
        />
        <AISummary initialAISummary={note?.ai_summary || ""} />
      </aside>
    </div>
  );
}
