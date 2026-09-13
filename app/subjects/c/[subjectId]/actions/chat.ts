"use server";

import { GoogleGenAI } from "@google/genai";
import { Message } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { after } from "next/server";

export type SendMessageResult =
  | { success: true; data: string }
  | {
      success: false;
      errorType: "RATE_LIMIT";
      clipboardText: string;
      message: string;
    }
  | { success: false; errorType: "GENERAL"; message: string };

export async function SendMessage(
  subjectId: string,
  userMessage: string,
): Promise<SendMessageResult | undefined> {
  if (!userMessage.trim()) return;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("認証されていないユーザーです");
  }

  console.time("getNoteData");
  const { data: note } = await supabase
    .from("study_notes")
    .select("all_chat_log,subject_name,ai_summary")
    .eq("user_id", user.id)
    .eq("subject_id", subjectId)
    .single<{
      all_chat_log: Message[];
      subject_name: string;
      ai_summary: string;
    }>();

  const subject_name = note?.subject_name;
  let ai_summary = note?.ai_summary;

  const instrction =
    `あなたは一流のパーソナル・ラーニング・コーチです。学習者が単なる暗記を超え、実務やプロの現場で通用する「本質的な理解」に到達できるよう導いてください。
    【これまでの学習内容の要約】${ai_summary ? ai_summary : "まだ要約はありません。"}
    【役割と指導方針】
    1. 本質的な問いの提示
    - 表面的な知識の確認にとどまらず、なぜそれが成り立つのか（原理・原則）、トレードオフは何か、別の文脈に応用できるかを問うハイレベルな思考問題やケーススタディを出題してください。
    2. わかりやすさと深さの両立
    - 質問に対する回答は、直感的なわかりやすさを担保しつつも、必ず学問的・実務的な本質（根本原理）に接続させて説明してください。
    3. 思考を促す対話（答えを直接教えすぎない）
    - すべてを一度に解説せず、学習者が自力でたどり着けるようなヒントや、次のステップへ進むための問いかけを交えてください。
    - ユーザーが「答えだけ教えて」「代わりにコードを書いて」と求めてきても、簡単に答えを渡さず、自力で思考を深められる導きを行ってください。
    4. フェーズ移行ルール（面接官モードの発火）
    - 通常時は寄り添うコーチとして解説や議論を行ってください。
    - ユーザーがあなたの問いや確認問題に対して【正確に答えられた】と判断した直後の返答では、以下のように切り替えてください：
     ① なぜ正解だと判断したのかをユーザーに説明する
     ② 「では、ここから【質問フェーズ】に移ります」と明確に宣言する。
     ③ 今学んだ概念について、抽象度の高い本質的な質問（例：「〇〇の概念を自分の言葉で説明してください」「なぜ〇〇ではなく△△を使うべきかトレードオフを述べてください」）を1問だけ出題し、ユーザーの回答を促す。
     【現在の学習コンテキスト】・科目名/ノートタイトル: "${subject_name}"※タイトルが「無題」や抽象的な場合は、ユーザーの質問内容（本文）の文脈を最優先してください。`.trim();

  const userMsgObj: Message = {
    id: crypto.randomUUID(),
    role: "user",
    content: userMessage,
  };

  //今までのすべてのログ+現時点でユーザーが入力したコンテクスト
  // 初回データがない場合（null）を考慮して safeArray 化
  const previousLogs = note?.all_chat_log ?? [];
  const currentUserAlllogs = [...previousLogs, userMsgObj];

  const recentLogs = currentUserAlllogs.slice(-10);
  const geminiContents = recentLogs.map((msg) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));

  let currentAiAnswer = "";

  try {
    let ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: geminiContents,
      config: {
        systemInstruction: instrction,
        temperature: 0.7,
      },
    });
    currentAiAnswer = response.text || "";
  } catch {
    //現在は省略
    console.log("Geminiでエラー");
  }

  //--AIの要約を作る--
  after(async () => {
    const allLogs: Message[] = [
      ...currentUserAlllogs,
      { id: crypto.randomUUID(), role: "assistant", content: currentAiAnswer },
    ];

    if (allLogs.length % 10 == 0) {
      let ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const summarySystemInstruction =
        `あなたは優秀な学習ドキュメントの要約AIです。これまでの対話ログから、ユーザーが獲得した知識や本質的な理解を、後から見返しやすいように構造化してまとめてください。`.trim();

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
    await supabase.from("study_notes").upsert(
      {
        user_id: user.id,
        subject_id: subjectId,
        all_chat_log: allLogs,
        ai_summary: ai_summary,
      } as never,
      {
        onConflict: "user_id,subject_id",
      },
    );
    revalidatePath(`/subjects/c/${subjectId}`);
  });
  return { success: true, data: currentAiAnswer };
}
