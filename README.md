# 知識を増幅させるためのアプリ(MVP)

Next.js (App Router) + Supabase (Auth / Postgres) + Tailwind CSS で構築する
個人学習アプリのMVPです。

## 1. ディレクトリ構造

```
.
├── app/
│   ├── login/
│   │   ├── page.tsx          # ログイン/新規登録画面 (Client Component)
│   │   └── actions.ts        # signIn / signUp / signInWithGitHub / signOut (Server Actions)
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts      # GitHub OAuthコールバック (Route Handler)
│   ├── cards/
│   │   ├── page.tsx          # 一覧・検索・タグ絞込み (Server Component)
│   │   ├── actions.ts        # createCard / deleteCard (Server Actions)
│   │   ├── CardList.tsx      # 一覧表示コンポーネント
│   │   ├── [id]/
│   │   │   └── page.tsx      # 詳細表示 (Server Component)
│   │   └── new/
│   │       └── page.tsx      # 新規作成フォーム (Client Component)
│   ├── layout.tsx            # ルートレイアウト (要追加: Tailwind読込等)
│   └── page.tsx              # トップ ("/cards" へリダイレクト等、要追加)
├── lib/
│   └── supabase/
│       ├── client.ts         # ブラウザ用Supabaseクライアント
│       ├── server.ts         # Server Component/Action用Supabaseクライアント
│       └── middleware.ts     # セッションリフレッシュ + ルート保護ロジック
├── types/
│   └── database.types.ts     # DBの型定義 (将来 `supabase gen types` で自動生成に置換)
├── supabase/
│   └── schema.sql            # テーブル定義 + RLSポリシー
├── middleware.ts              # Next.js Middlewareエントリポイント
└── .env.local.example
```

将来の拡張(AIアシスタント / ベクトル検索 / 外部通知)は、それぞれ
`app/api/ai/`, `app/api/search/`, `app/api/notifications/` のような
Route Handler群として追加していく想定で、`knowledge_cards` テーブルには
`embedding` / `ai_summary` カラムを、DBには `notification_settings`
テーブルを今回のスキーマに先行して用意してあります。

## 2. セットアップ手順

### 2-1. プロジェクト作成 & 依存パッケージ

```bash
npx create-next-app@latest knowledge-app --typescript --tailwind --app
cd knowledge-app
npm install @supabase/ssr @supabase/supabase-js
```

<!-- その後、本回答で出力したファイル群を同名のパスに配置してください
(`app/`, `lib/`, `types/`, `supabase/`, `middleware.ts`, `.env.local.example`)。 -->

### 2-2. Supabaseプロジェクトの準備

1. https://supabase.com でプロジェクトを新規作成
2. Project Settings > API から `Project URL` と `anon public key` を取得
3. SQL Editor を開き、`supabase/schema.sql` の内容を貼り付けて実行
   - `knowledge_cards`, `profiles`, `notification_settings` テーブルとRLSポリシーが作成されます
4. (GitHubログインを使う場合) Authentication > Providers > GitHub を有効化し、
   GitHub側でOAuth Appを作成してClient ID/Secretを設定
   - Callback URLには `https://<your-project>.supabase.co/auth/v1/callback` を設定

### 2-3. 環境変数

`.env.local.example` を `.env.local` にコピーし、値を埋めてください。

```bash
cp .env.local.example .env.local
```

### 2-4. ローカル起動

```bash
npm run dev
```

`http://localhost:3000/login` からユーザー登録 → `/cards` でCRUD確認

## 3. Vercelへのデプロイ

1. GitHubリポジトリにpush
2. https://vercel.com で「Add New Project」→ 対象リポジトリをImport
3. Environment Variablesに `.env.local` と同じ内容 (`NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` など) を登録
4. GitHubログインを使う場合、SupabaseのRedirect URLsに本番URL
   (`https://<your-app>.vercel.app/auth/callback`) を追加登録
5. Deployを実行

## 4. 今後の拡張ロードマップとの接続ポイント

| 機能                                 | 接続ポイント                                                                                                         |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| AIによる自動レビュー・補足アドバイス | `knowledge_cards.ai_summary` に生成結果を保存。`createCard` 実行後に非同期でAI APIを呼ぶ Route Handler を追加        |
| ベクトル検索・RAG                    | `knowledge_cards.embedding` (pgvector) に保存し、`supabase/schema.sql` 内のivfflatインデックスをデータ投入後に有効化 |
| LINE/Discord通知                     | 既に用意済みの `notification_settings` テーブルを使い、Vercel Cron等で定期実行するRoute Handlerを追加                |

## 5. 未実装・要検討事項 (MVPのスコープ外)

- `app/layout.tsx` / `app/page.tsx` はプロジェクト作成時の初期ファイルをベースに、
  Tailwindのグローバルスタイル読込とトップページのリダイレクトを追加してください
- Markdownの本文表示は現状プレーンテキスト表示です。`react-markdown` 等の導入を推奨します
- メール確認(Email confirmation)の有効/無効はSupabaseダッシュボードの設定に依存します
