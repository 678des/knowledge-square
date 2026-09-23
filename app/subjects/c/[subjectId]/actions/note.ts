"use server";
import { createClient } from "@/lib/supabase/server";

export async function updateStudyNote(subjectId: string, noteText: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("study_notes_new")
    .update({ study_memo: noteText } as never)
    .eq("subject_id", subjectId);
  if (error) throw error;
}
