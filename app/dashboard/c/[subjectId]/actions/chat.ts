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
    .select("all_chat_log,subject_name")
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
  const subject_name = (note as unknown as { subject_name?: unknown } | null)
    ?.subject_name;

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
      systemInstruction:
        `あなたは学習アシスタントです。ユーザーの質問にわかりやすく答えてください。
        【現在の学習コンテキスト】
        ・科目名/ノートタイトル: "${subject_name}" 
        ※タイトルが「無題」や抽象的な場合は、ユーザーの質問内容（本文）の文脈を最優先してください。`.trim(),
      temperature: 0.7,
    },
  });

  const aiAnswer = response.text || "";

  // 新しいメッセージ（ユーザー & AI）を追加
  const finalLogs: Message[] = [
    ...logsWithUser,
    { id: crypto.randomUUID(), role: "assistant", content: aiAnswer },
  ];

  //--AIの要約を作る--
  //もし10回を超えたら自動で要約(今は毎回)
  let aisummary;
  if (finalLogs.length > 10) {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    aisummary = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: finalLogs.map((msg) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      })),
      config: {
        systemInstruction:
          "今までの内容を要約し、新しいチャットで続けられるプロンプトを生成してください。ただし、ユーザーの目標を到達するために、関係のあるものだけを要約の対象に入れてください。",
        temperature: 0.7,
      },
    });
  }

  // 2. DB に保存 (UPDATE)
  const updateData: Record<string, unknown> = {
    user_id: user.id,
    subject_id: subjectId,
    all_chat_log: finalLogs,
  };
  if (aisummary?.text) {
    updateData.ai_summary = aisummary.text;
  }

  let { error } = await supabase
    .from("study_notes")
    .upsert(updateData as never, {
      onConflict: "user_id,subject_id",
    });

  if (error) {
    console.error("DB更新エラー:", error.message);
    throw new Error(`チャットログの保存に失敗しました${error.message}`);
  }

  // 6. 画面（Server Component）の表示を最新化
  revalidatePath(`/dashboard/c/${subjectId}`);
  return response.text;
}
