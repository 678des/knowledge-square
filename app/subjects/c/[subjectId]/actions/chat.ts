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

  const subject_name = (note as unknown as { subject_name?: string } | null)
    ?.subject_name;
  let ai_summary = (note as unknown as { ai_summary?: string } | null)
    ?.ai_summary;

  const instrction =
    `あなたは一流のパーソナル・ラーニング・コーチです。学習者が単なる暗記を超え、実務やプロの現場で通用する「本質的な理解」に到達できるよう導いてください。
【役割と指導方針】
1. 本質的な問いの提示
   - 表面的な知識の確認にとどまらず、なぜそれが成り立つのか（原理・原則）、トレードオフは何か、別の文脈に応用できるかを問うハイレベルな思考問題やケーススタディを積極的に出題してください。
2. わかりやすさと深さの両立
   - 質問に対する回答は、直感的なわかりやすさを担保しつつも、必ず学問的・実務的な本質（根本原理）に接続させて説明してください。
3. 思考を促す対話（答えを直接教えすぎない）
   - すべてを一度に解説せず、学習者が自力でたどり着けるようなヒントや、次のステップへ進むための問いかけを交えてください。

【現在の学習コンテキスト】
・科目名/ノートタイトル: "${subject_name}"
※タイトルが「無題」や抽象的な場合は、ユーザーの質問内容（本文）の文脈を最優先してください。`.trim();

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
      systemInstruction: instrction,
      temperature: 0.7,
    },
  });

  const currentAiAnswer = response.text || "";

  // 新しいAIのメッセージを追加
  const allLogs: Message[] = [
    ...currentUserAlllogs,
    { id: crypto.randomUUID(), role: "assistant", content: currentAiAnswer },
  ];

  //--AIの要約を作る--
  //もし5往復を超えたら自動で要約
  if (Object.keys(allLogs).length % 10 == 0) {
    //会話がAIで終わるのを防ぐため
    console.log("dosummary");
    const summarySystemInstruction =
      `あなたは優秀な学習ドキュメントの要約AIです。これまでの対話ログから、ユーザーが獲得した知識や本質的な理解を、後から見返しやすいように構造化してまとめてください。`.trim();
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const tempAiSummary = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `前回の要約:\n${ai_summary || "なし"}\n\n【追加・更新する対話ログ】\n${allLogs
                .slice(-10)
                .map((msg) => `${msg.role}: ${msg.content}`)
                .join(
                  "\n",
                )}\n\n上記を踏まえ、これまでの学習内容全体が網羅された最新の要約を、以下の形式で作成してください。\n- **学習の到達点**: \n- **重要概念・本質**: \n- **残された課題・次のステップ**:`.trim(),
            },
          ],
        },
      ],
      config: {
        systemInstruction: summarySystemInstruction,
        temperature: 0.2,
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
