"use server";

import { GoogleGenAI } from "@google/genai";
import { Message } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
//import { after } from "next/server";
import * as z from "zod";

export type SendMessageResult = {
  success: true;
  data: string;
  buttons: boolean;
};

export async function SendMessage(
  subjectId: string,
  userMessage: string,
  mode: string,
): Promise<SendMessageResult | undefined> {
  if (
    !userMessage.trim() ||
    !subjectId.trim() ||
    !(mode == "review" || mode == "study")
  )
    return;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("認証されていないユーザーです");
  }

  const { data: subject } = await supabase
    .from("subjects_new")
    .select("name")
    .eq("id", subjectId)
    .single();

  const { data: room } = await supabase
    .from("chat_rooms_new")
    .select("id")
    .eq("subject_id", subjectId)
    .eq("user_id", user.id)
    .filter("mode", "eq", mode)
    .single();

  const { data: study_note } = await supabase
    .from("study_notes")
    .select("ai_summary")
    .eq("subject_id", subjectId)
    .single();

  //科目名を取得
  let subject_name = (subject as { name: string } | null)?.name || "";

  //現在のルームを取得
  const room_id = (room as { id: string } | null)?.id || "";

  //現在の要約を取得
  const ai_summary =
    (study_note as { ai_summary: string } | null)?.ai_summary || "";
  const { data: recentMessages } = await supabase
    .from("messages_new")
    .select("role, content")
    .eq("room_id", room_id)
    .order("created_at", { ascending: false })
    .limit(10);

  const instrction =
    `あなたは一流のパーソナル・ラーニング・コーチです。学習者が単なる暗記を超え、実務やプロの現場で通用する「本質的な理解」に到達できるよう導いてください。
    【現在の学習コンテキスト】・科目名/ノートタイトル: "${subject_name}"※タイトルが「無題」や抽象的な場合は、ユーザーの質問内容（本文）の文脈を最優先してください。
  
    【これまでの学習内容の要約】${ai_summary ? ai_summary : "まだ要約はありません。"}
    【役割と指導方針】
    1. 本質的な問いの提示
    - 表面的な知識の確認にとどまらず、なぜそれが成り立つのか（原理・原則）、トレードオフは何か、別の文脈に応用できるかを問うハイレベルな思考問題やケーススタディを出題してください。
    2. わかりやすさと深さの両立
    - 質問に対する回答は、直感的なわかりやすさを担保しつつも、必ず学問的・実務的な本質（根本原理）に接続させて説明してください。
    3. 思考を促す対話（答えを直接教えすぎない）
    - すべてを一度に解説せず、学習者が自力でたどり着けるようなヒントや、次のステップへ進むための問いかけを交えてください。
    - ユーザーが「答えだけ教えて」「代わりにコードを書いて」と求めてきても、簡単に答えを渡さず、自力で思考を深められる導きを行ってください。

  【出力形式】
  - ユーザーがあなたの問いや確認問題に対して【正確に答えられた】と判断した直後の返答では、"模擬問題に移りますか？"とだけ最後に付け足してください
  `.trim();
  //現在のユーザーの書いているキーワードは、以下の項目です。{study_noteの変数「アーキテクチャ、○○の原則、○○定理、セキュリティ」}
  //必要に応じてこれらの項目とユーザーの発言から、現在何をユーザーに教えるべきかを判断してください。

  const userMsgObj: Message = {
    id: crypto.randomUUID(),
    role: "user",
    content: userMessage,
  };

  const geminiContents = [...(recentMessages ?? []).reverse(), userMsgObj].map(
    (msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }),
  );

  console.log("Geminiに渡すもの", geminiContents);

  let ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  // const responseJsonSchema = {
  //   type: "object",
  //   properties: {
  //     message: { type: "string" },
  //     buttons: {
  //       type: "array",
  //       items: {
  //         type: "object",
  //         properties: {
  //           message: { type: "string" },
  //           id: { type: "string" },
  //           label: { type: "string" }, // ボタンに表示する文字
  //         },
  //         required: ["id", "label"],
  //       },
  //     },
  //   },
  //   required: ["message"],
  // };

  //const employeeSchema = z.fromJSONSchema(employeeJsonSchema);
  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash-lite",
    contents: geminiContents,
    config: {
      systemInstruction: instrction,
      temperature: 0.7,
      //responseMimeType: "application/json",
      //responseSchema: responseJsonSchema,
    },
  });
  const { data, error } = await supabase.from("messages_new").insert({
    room_id: room_id,
    role: "user",
    content: userMessage,
  } as never);

  console.log(room_id);

  const { data: roomCheck } = await supabase
    .from("chat_rooms_new")
    .select("id, user_id, subject_id, mode")
    .eq("id", room_id)
    .single();

  console.log("roomCheck:", roomCheck);
  console.log("挿入成功", data);
  console.log("挿入error", error);
  console.log("room_id", room_id, "subjectId", subjectId);

  await supabase.from("messages_new").insert({
    room_id: room_id,
    role: "assistant",
    content: response.text || "",
  } as never);

  //console.log("trueか？", response.text?.includes("問題"));
  console.log("AIの返答", response.text);
  return {
    success: true,
    data: "persedRes.message",
    buttons: response.text?.includes("問題") || false,
  };
}
