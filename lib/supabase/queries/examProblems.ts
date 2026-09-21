import { createClient } from "../server"; // プロジェクトのSupabaseクライアントのパスに合わせて調整してください

// データの型定義（先ほど作ったコンポーネントで使える形に合わせます）
import type { ExamProblem } from "@/lib/types";

/**
 * 指定したチャットルーム（科目）に紐づく試験問題と、その回答履歴をすべて取得する
 * @param roomId チャットルームのID
 */
export async function getExamProblems(
  subjectId: string,
): Promise<ExamProblem[]> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    console.error("ユーザー情報の取得に失敗しました:", userError);
    return [];
  }
  const { data: room } = await supabase
    .from("chat_rooms_new")
    .select("id")
    .eq("user_id", user.id)
    .eq("subject_id", subjectId)
    .filter("mode", "eq", "review")
    .maybeSingle();

  const room_id = (room as { id: string } | null)?.id;
  console.log("あああ", room_id, room);

  if (!room_id) {
    console.error("roomが見つかりません");
    return [];
  }

  // exam_problems を取得しつつ、外部キーで紐づく exam_attempts を時系列順（古い順）でネストして取得
  const { data, error } = await supabase
    .from("exam_problems")
    .select(
      `
      id,
      room_id,
      question_content,
      created_at,
      exam_attempts (
        id,
        role,
        content,
        created_at
      )
    `,
    )
    .eq("room_id", room_id)
    .order("created_at", { ascending: true }); // 問題自体も古い順に並べる

  if (error) {
    console.error("試験問題の取得に失敗しました:", error.message);
    throw new Error("試験問題の取得に失敗しました。");
  }
  return data;
}
