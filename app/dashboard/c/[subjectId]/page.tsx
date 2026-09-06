import { getNote } from "@/lib/supabase/queries/notes";
import ChatFrom from "./_components/ChatForm";
import StudyNoteArea from "./_components/StudyNoteArea";
export default async function ChatPage({
  params,
}: {
  params: Promise<{ subjectId: string }>;
}) {
  const { subjectId } = await params;
  console.log("ChatPage: subjectId =", subjectId);
  const note = await getNote(subjectId);
  console.log("ChatPage: note =", note);
  return (
    <div className="flex h-full w-full overflow-hidden bg-slate-950 text-slate-100">
      {/* メイン：チャットエリア */}
      <main className="flex flex-1 flex-col justify-between border-r border-slate-800 p-6">
        <div className="flex-1 overflow-y-auto space-y-4">
          <h1 className="text-xl font-bold text-slate-200">
            チャット＆学習エリア
          </h1>

          {/* チャットログの表示 */}
          {note?.all_chat_log && note.all_chat_log.length > 0 ? (
            note.all_chat_log.map((msg, index) => (
              <div
                key={msg.id || index}
                className={`max-w-[80%] rounded-lg p-3 text-sm ${
                  msg.role === "user"
                    ? "ml-auto bg-blue-600 text-white"
                    : "mr-auto bg-slate-800 text-slate-200 border border-slate-700"
                }`}
              >
                {msg.content}
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">まだ対話ログがありません。</p>
          )}
        </div>

        <ChatFrom subjectId={subjectId} />
      </main>

      {/* 右側：学習メモ ＆ AI要約パネル */}
      <aside className="w-80 flex flex-col gap-6 p-6 bg-slate-900/40">
        {/* <div>
          <h2 className="text-sm font-semibold text-slate-400 mb-2">
            ✍️ 学習メモ
          </h2>
          <textarea
            defaultValue={note?.study_note || ""}
            placeholder="ここに復習メモを入力..."
            className="w-full h-44 rounded-md bg-slate-950 border border-slate-800 p-3 text-sm text-slate-200 resize-none focus:outline-none"
          />
        </div> */}
        <StudyNoteArea
          subjectId={subjectId}
          initialNote={note?.study_note || ""}
        />

        <div>
          <h2 className="text-sm font-semibold text-slate-400 mb-2">
            🤖 AI要約
          </h2>
          <div className="rounded-md bg-slate-950 border border-slate-800 p-3 text-sm text-slate-300 min-h-[100px]">
            {note?.ai_summary || (
              <span className="text-slate-500 italic">
                要約はまだありません
              </span>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
