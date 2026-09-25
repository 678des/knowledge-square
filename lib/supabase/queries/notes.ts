import { createClient } from "@/lib/supabase/server"; // サーバーコンポーネント用の場合は @/lib/supabase/server に変更をお勧めします
//import { Chatlogs } from "@/lib/types";

export async function getNote(subjectId: string) {
  const supabase = await createClient();

  console.log("Fetching note for subjectId:", subjectId);

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("ユーザー情報の取得に失敗しました:", userError);
    return null;
  }

  const { data, error } = await supabase
    .from("study_notes_new")
    .select("study_memo")
    .eq("subject_id", subjectId)
    .single();

  if (error) {
    console.error("ノートの取得に失敗しました:", error.message);
    return null;
  }

  const note = data as { study_memo: string | null } | null;
  console.log("取得したノート:", note?.study_memo, "ユーザー:", user.id);
  return note?.study_memo;
}
