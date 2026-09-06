"use server";

import { GoogleGenAI } from "@google/genai";
import { Message } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function SendMessage(subjectId: string, userMessage: string) {
  if (!userMessage.trim()) return;

  // 1. Supabase サーバークライアントの作成
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("認証されていないユーザーです");
  }

  // 2. Gemini API の初期化
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  // 3. AI 応答の生成
  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: userMessage,
    config: {
      systemInstruction: "事実ベースで論理的に回答してください",
      temperature: 0.7,
    },
  });

  const aiAnswer = response.text || "";

  // 4. 既存のノートとログを取得
  const { data: note } = await supabase
    .from("study_notes")
    .select("all_chat_log")
    .eq("user_id", user.id)
    .eq("subject_id", subjectId)
    .single();

  // JSON文字列の場合はパースして配列化
  let currentLogs: Message[] = [];
  // if (note?.all_chat_log) {
  //   currentLogs = typeof note.all_chat_log === "string"
  //     ? JSON.parse(note.all_chat_log)
  //     : note.all_chat_log;
  // }

  // 新しいメッセージ（ユーザー & AI）を追加
  const updatedLogs = [
    ...currentLogs,
    { id: crypto.randomUUID(), role: "user", content: userMessage },
    { id: crypto.randomUUID(), role: "assistant", content: aiAnswer },
  ];

  // 2. DB に保存 (UPDATE)
  const { error } = await supabase
    .from("study_notes")
    .upsert(
      {
        user_id: user.id,
        subject_id: subjectId,
        all_chat_log: updatedLogs, // カラム名: 保存する値
        //all_chat_log: "test",
      } as never,
      {
        onConflict: "user_id,subject_id",
      },
    )
    .eq("user_id", user.id)
    .eq("subject_id", subjectId);

  if (error) {
    console.error("DB更新エラー:", error.message);
    throw new Error(`チャットログの保存に失敗しました${error.message}`);
  }

  // 6. 画面（Server Component）の表示を最新化
  revalidatePath(`/dashboard/c/${subjectId}`);
  return aiAnswer;
}
