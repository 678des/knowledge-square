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
    .select("all_chat_log,subject_name,ai_summary")
    .eq("user_id", user.id)
    .eq("subject_id", subjectId)
    .single();

  //これまでのすべてのログ
  let beforelogs: Message[] = [];
  const allChatLog = (note as unknown as { all_chat_log?: unknown } | null)
    ?.all_chat_log;

  beforelogs = allChatLog as Message[];

  const subject_name = (note as unknown as { subject_name?: unknown } | null)
    ?.subject_name;
  let ai_summary = (note as unknown as { ai_summary?: string } | null)
    ?.ai_summary;

  const userMsgObj: Message = {
    id: crypto.randomUUID(),
    role: "user",
    content: userMessage,
  };

  //今までのすべてのログ+現時点でユーザーが入力したコンテクスト
  const currentUserAlllogs = [...beforelogs, userMsgObj];

  const geminiContents = currentUserAlllogs.map((msg) => ({
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

  const currentAiAnswer = response.text || "";

  // 新しいAIのメッセージを追加
  let allLogs: Message[] = [
    ...currentUserAlllogs,
    { id: crypto.randomUUID(), role: "assistant", content: currentAiAnswer },
  ];

  //--AIの要約を作る--
  //もし5往復を超えたら自動で要約
  if (Object.keys(allLogs).length % 10 == 0) {
    //会話がAIで終わるのを防ぐため
    console.log("dosummary");
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const tempAiSummary = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `${ai_summary}\n\n今までの内容を要約してください\n\n${allLogs
                .map((msg) => `${msg.role}: ${msg.content}`)
                .join("\n")}`,
            },
          ],
        },
      ],
      config: {
        systemInstruction:
          "今までの内容を要約し、新しいチャットで続けられるプロンプトを生成してください。ただし、ユーザーの目標を到達するために、関係のあるものだけを要約の対象に入れてください。",
        temperature: 0.7,
      },
    });

    ai_summary = tempAiSummary.text;
  }

  // 2. DB に保存 (UPDATE)
  const upsertData: Record<string, unknown> = {
    user_id: user.id,
    subject_id: subjectId,
    all_chat_log: allLogs,
    ai_summary: ai_summary,
  };

  const { error } = await supabase
    .from("study_notes")
    .upsert(upsertData as never, {
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
