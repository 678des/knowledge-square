import { Message } from "@/lib/types";
import { createClient } from "../server";

export async function getChat(
  subjectId: string,
  count: number,
  mode: string,
): Promise<Message[]> {
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
    .eq("user_id", user?.id)
    .eq("subject_id", subjectId)
    .filter("mode", "eq", mode)
    .maybeSingle();

  const room_id = (room as { id: string } | null)?.id;
  console.log("あああ", room_id, room);

  if (!room_id) {
    console.error("roomが見つかりません");
    return [];
  }

  const { data, error } = await supabase
    .from("messages_new")
    .select("id, role, content, created_at")
    .eq("room_id", room_id)
    .order("created_at", { ascending: false })
    .limit(count);

  if (error) {
    console.error("メッセージ取得に失敗:", error.message);

    return [];
  }

  return data.reverse() ?? [];
}
