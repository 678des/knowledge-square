import { createClient } from "@/lib/supabase/server"; // または環境に応じた Client 作成処理
import { Subject } from "@/lib/types";

export async function getSubjects(): Promise<Subject[]> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("ユーザー情報の取得に失敗しました:", userError);
    return [];
  }
  const { data, error } = await supabase
    .from("subjects_new")
    .select("id, name, color")
    .eq(`user_id`, user.id);
  // .order("created_at", { ascending: true });

  if (error) {
    console.error("カテゴリの取得に失敗しました:", error.message);
    return [];
  }
  console.log("取得したカテゴリ:", data, "ユーザー", user.id);
  return data as Subject[];
}
export async function getSubjectName(subjectId: string): Promise<string> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("ユーザー情報の取得に失敗しました:", userError);
    return "None";
  }
  const { data, error } = await supabase
    .from("subjects_new")
    .select("name")
    .eq("user_id", user.id)
    .eq("id", subjectId)
    .maybeSingle();

  if (error) {
    console.error("カテゴリの取得に失敗しました:", error.message);
  }
  const subject = data as { name: string } | null;
  return subject?.name ?? "";
}
