"use server";

import { GoogleGenAI } from "@google/genai";
import { createClient } from "@/lib/supabase/server";
import { sub } from "framer-motion/client";

export async function Exam(
  userAnswer: string,
  subjectId: string,
  probremId: string,
) {
  console.log("返答評価", userAnswer, probremId);
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("認証されていないユーザーです");
  }

  console.log("subid", subjectId, "せす");
  const { data: room } = await supabase
    .from("chat_rooms_new")
    .select("id")
    .eq("subject_id", subjectId)
    .eq("user_id", user.id)
    .filter("mode", "eq", "review")
    .single();
  //現在のルームを取得
  const room_id = (room as { id: string } | null)?.id || "";
  //const room_id = "8b7a5e8a-54a7-49b5-87da-7b5af850d8cf";
  console.log("roomid", room_id);

  const { data: exam_problem, error: er } = await supabase
    .from("exam_problems")
    .select("question_content")
    .eq("id", probremId)
    .eq("room_id", room_id);

  const { data: exam_attempt } = await supabase
    .from("exam_attempts")
    .select("role, content")
    .eq("problem_id", probremId)
    .order("created_at", { ascending: true })
    .limit(50);

  const problem = (
    exam_problem as Array<{ question_content: string }> | null
  )?.[0]?.question_content;
  const allAns = (exam_attempt as Array<{ content: string }> | null)
    ?.map((attempt) => attempt.content)
    .join("\n");

  console.log("問題文", problem);
  const examSystemInstruction = `
あなたは一流のシニアエンジニアです。
これまでの問題とそれに対するユーザーの回答を踏まえ、受講者が実務やプロの現場で通用する「本質的な理解力・応用力」に到達しているかを判定してください。


【問題文】
${problem}

【これまでの返答】
    ${allAns ? allAns : "過去の回答はありません。"}

【あなたの役割と進行ルール】
厳密な採点と本質的フィードバック
- ユーザーから回答が提出されたら、単なる正解・不正解の判定だけでなく、以下を盛り込んでフィードバックを行ってください。
  - **評価**: 正解か、部分点か、再考が必要か
  - **原理原則の解説**: なぜその答えになるのか（背景にある構造、トレードオフ、根本原理）
  - **改善点・不足している視点**: 実務の現場視点で足りていないポイントの指摘

3. 合格判定とセッションの終了
- ユーザーの回答や対話を通じて、以下の合格条件を完全に満たしていると判断した場合のみ、フィードバックの最後に「合格」である旨を伝え、本セッションがクリアしたことを宣言してください。
  - **合格条件**:
    - 核心を論理的かつ正しく説明できている
    - 誤解や致命的な勘違いがない
    - 原理・理由・構造の本質を理解している
- 合格に達していない場合は、追加の思考を促す問いかけやヒントを与え、納得がいくまで対話（再考）を続けてください。

【トーン＆マナー】
- 安易に答えを教えず、受講者自身に気付かせる姿勢を崩さないでください。
`.trim();

  const geminiContents = [
    {
      role: "user",
      parts: [{ text: userAnswer }],
    },
  ];

  console.log("Geminiに渡すもの", geminiContents);

  let ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash-lite",
    contents: geminiContents,
    config: {
      systemInstruction: examSystemInstruction,
      temperature: 0.7,
    },
  });

  console.log("AIの解説", response.text);

  const { error } = await supabase.from("exam_attempts").insert({
    problem_id: probremId,
    content: userAnswer,
    role: "user",
  } as never);
  console.log("インサート", error);

  await supabase.from("exam_attempts").insert({
    problem_id: probremId,
    content: response.text,
    role: "assistant",
  } as never);

  return {
    success: true,
    aiResponceObj: {
      id: crypto.randomUUID(),
      role: "assistant",
      content: response.text || "",
      created_at: "",
    },
  };
}
