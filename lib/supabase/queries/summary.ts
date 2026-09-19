import { createClient } from "../server";
export async function getSummary(subjectId: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("ユーザー情報の取得に失敗しました:", userError);
    return [];
  }

  const { data: study_note } = await supabase
    .from("study_notes_new")
    .select("ai_summary")
    .eq("subject_id", subjectId)
    .single();

  const ai_summary =
    (study_note as { ai_summary: string } | null)?.ai_summary || "";
  console.log("取得したSummary", ai_summary);
  return ai_summary;
}
