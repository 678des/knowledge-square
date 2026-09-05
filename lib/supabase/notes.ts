import { createClient } from "@/lib/supabase/server"; // サーバーコンポーネント用の場合は @/lib/supabase/server に変更をお勧めします
import { Note } from "@/lib/types";
export async function getNote(subjectId: string): Promise<Note | null> {
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
    .from("study_notes")
    .select("*")
    .eq("user_id", user.id)
    .eq("subject_id", subjectId)
    .maybeSingle();

  if (error) {
    console.error("ノートの取得に失敗しました:", error.message);
    return null;
  }

  console.log("取得したノート:", data, "ユーザー:", user.id);
  return data as Note | null;
}
