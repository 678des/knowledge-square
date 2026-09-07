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

  const { data: note } = await supabase
    .from("study_notes")
    .select("all_chat_log")
    .eq("user_id", user.id)
    .eq("subject_id", subjectId)
    .single();

  let currentLogs: Message[] = [];
  const allChatLog = (note as unknown as { all_chat_log?: unknown } | null)
    ?.all_chat_log;
  if (allChatLog) {
    currentLogs =
      typeof allChatLog === "string"
        ? JSON.parse(allChatLog)
        : (allChatLog as Message[]);
  }

  const userMsgObj: Message = {
    id: crypto.randomUUID(),
    role: "user",
    content: userMessage,
  };
  const logsWithUser = [...currentLogs, userMsgObj];

  const geminiContents = logsWithUser.map((msg) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));

  // 2. Gemini API の初期化
  let ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  // 3. AI 応答の生成
  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: geminiContents,
    config: {
      systemInstruction: "事実ベースで論理的に回答してください",
      temperature: 0.7,
    },
  });

  const aiAnswer = response.text || "";

  // 新しいメッセージ（ユーザー & AI）を追加
  const finalLogs: Message[] = [
    ...logsWithUser,
    { id: crypto.randomUUID(), role: "assistant", content: aiAnswer },
  ];

  // 2. DB に保存 (UPDATE)
  let { error } = await supabase
    .from("study_notes")
    .upsert(
      {
        user_id: user.id,
        subject_id: subjectId,
        all_chat_log: finalLogs, // カラム名: 保存する値
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

  //--AIの要約を作る--
  //もし10回を超えたら自動で要約(今は毎回)
  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const aisummary = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: geminiContents,
    config: {
      systemInstruction:
        "今までの内容を要約し、新しいチャットで続けられるプロンプトを生成してください。ただし、ユーザーの目標を到達するために、関係のあるものだけを要約の対象に入れてください。",
      temperature: 0.7,
    },
  });
  await supabase
    .from("study_notes")
    .upsert(
      {
        user_id: user.id,
        subject_id: subjectId,
        ai_summary: aisummary.text,
      } as never,
      {
        onConflict: "user_id,subject_id",
      },
    )
    .eq("user_id", user.id)
    .eq("subject_id", subjectId);

  // 6. 画面（Server Component）の表示を最新化
  revalidatePath(`/dashboard/c/${subjectId}`);
  return response.text;
}
