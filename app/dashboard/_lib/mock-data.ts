import {
  Sigma,
  Landmark,
  FlaskConical,
  Languages,
  type LucideIcon,
} from "lucide-react";

export type CategoryId = "math" | "social" | "science" | "english";

export type Category = {
  id: CategoryId;
  name: string;
  color: string; // 教科カラー(hex)
  //icon: LucideIcon
};

export type ChatStatus = "復習中" | "進行中" | null;

export type ChatItem = {
  id: string;
  categoryId: CategoryId;
  title: string;
  status: ChatStatus;
  updatedLabel: string;
};

export type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
};

export const categories: Category[] = [
  { id: "math", name: "数学", color: "#5B8DEF" },
  { id: "social", name: "社会", color: "#F2975A" },
  { id: "science", name: "理科", color: "#4FAE79" },
  { id: "english", name: "英語", color: "#B481E3" },
];

export function getCategory(id: CategoryId | undefined) {
  return categories.find((c) => c.id === id);
}

export const chats: ChatItem[] = [
  {
    id: "calculus-basics",
    categoryId: "math",
    title: "微分積分の基礎",
    status: "復習中",
    updatedLabel: "2時間前",
  },
  {
    id: "linear-algebra-matrix",
    categoryId: "math",
    title: "線形代数 - 行列の演算",
    status: null,
    updatedLabel: "昨日",
  },
  {
    id: "meiji-restoration",
    categoryId: "social",
    title: "日本史 - 明治維新",
    status: null,
    updatedLabel: "3日前",
  },
  {
    id: "supply-demand",
    categoryId: "social",
    title: "政治経済 - 需要と供給",
    status: "復習中",
    updatedLabel: "1週間前",
  },
  {
    id: "kinematics",
    categoryId: "science",
    title: "物理 - 運動方程式",
    status: "進行中",
    updatedLabel: "5時間前",
  },
  {
    id: "mole-calculation",
    categoryId: "science",
    title: "化学 - モル計算",
    status: null,
    updatedLabel: "4日前",
  },
  {
    id: "reading-comprehension",
    categoryId: "english",
    title: "長文読解 - 要旨把握",
    status: "復習中",
    updatedLabel: "6時間前",
  },
  {
    id: "subjunctive-mood",
    categoryId: "english",
    title: "文法 - 仮定法過去",
    status: null,
    updatedLabel: "2週間前",
  },
];

export function getChat(chatId: string) {
  return chats.find((c) => c.id === chatId);
}

export function getChatsByCategory(categoryId: CategoryId) {
  return chats.filter((c) => c.categoryId === categoryId);
}

// チャットIDごとの初期メッセージ(モック)
const messageStore: Record<string, ChatMessage[]> = {
  "calculus-basics": [
    {
      id: "m1",
      role: "user",
      content:
        "微分の基本的な公式がよくわからないので、整理して教えてください。",
    },
    {
      id: "m2",
      role: "assistant",
      content:
        "まずは基本の3つのルールを押さえましょう。\n" +
        "- べき乗の微分: `d/dx(x^n) = n * x^(n-1)`\n" +
        "- 定数倍: `d/dx(c * f(x)) = c * f'(x)`\n" +
        "- 和の微分: `d/dx(f(x) + g(x)) = f'(x) + g'(x)`\n\n" +
        "例えば `f(x) = 3x^2 + 2x` の場合、べき乗の微分と和の微分を組み合わせて `f'(x) = 6x + 2` になります。\n" +
        "まずはこの3つを使って、簡単な多項式を自分で微分してみましょうか。",
    },
  ],
  kinematics: [
    {
      id: "m1",
      role: "assistant",
      content:
        "運動方程式の学習を再開しましょう。前回は等加速度運動の途中でした。\n" +
        "確認したい式はこちらです。\n" +
        "- 速度: `v = v0 + a*t`\n" +
        "- 変位: `x = v0*t + (1/2)*a*t^2`\n\n" +
        "この2つの式を使う場面の違いを説明できますか？",
    },
  ],
  "reading-comprehension": [
    {
      id: "m1",
      role: "user",
      content: "長文の要旨をつかむコツがあれば教えてください。",
    },
    {
      id: "m2",
      role: "assistant",
      content:
        "要旨把握では、以下の順番で読むのがおすすめです。\n" +
        "- 第一段落と最終段落を先に読み、主張の骨格をつかむ\n" +
        "- 各段落の先頭文(トピックセンテンス)だけを拾う\n" +
        "- 逆接の接続語(however / but など)の後ろに主張が来ることが多いので印をつける\n\n" +
        "このやり方で、次の練習問題を一緒に読んでみましょう。",
    },
  ],
};

export function getMessages(chatId: string): ChatMessage[] {
  return (
    messageStore[chatId] ?? [
      {
        id: "m0",
        role: "assistant",
        content:
          "こんにちは。今日はどんなことを学びたいですか？気になっているところから聞かせてください。",
      },
    ]
  );
}
