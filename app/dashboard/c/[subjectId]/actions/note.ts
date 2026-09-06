"use server";
import { createClient } from "@/lib/supabase/server";

export async function updateStudyNote(subjectId: string, noteText: string) {
  console.log("学習ノートメモを保存します");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const noteToUpsert = {
    user_id: user.id,
    subject_id: subjectId,
    study_note: noteText,
  } as any;

  const { error } = await supabase
    .from("study_notes")
    .upsert(noteToUpsert, { onConflict: "user_id,subject_id" });

  if (error) throw error;
}
