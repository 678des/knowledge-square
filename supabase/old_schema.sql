-- =====================================================================
-- ナレッジ蓄積アプリ MVP - Supabase DB スキーマ
-- =====================================================================
-- 前提: auth.users は Supabase Auth が自動管理するテーブルなので、
--       別途 users テーブルは作らず、必要な場合は 1:1 の profiles テーブルで拡張する。
--       (将来 表示名・アバター等を持たせたくなった時のための布石)
-- =====================================================================

-- 拡張機能: 将来のベクトル検索(pgvector)用に先に有効化しておく
create extension if not exists vector;
create extension if not exists pgcrypto; -- gen_random_uuid() 用

-- ---------------------------------------------------------------------
-- 1. profiles テーブル (auth.usersの拡張。MVPでは最小限)
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- auth.users にユーザーが作成されたら自動で profiles にも行を作るトリガー
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------
-- 2. knowledge_cards テーブル (メインの知識データ)
-- ---------------------------------------------------------------------
create table if not exists public.knowledge_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  content text not null default '',       -- Markdown本文
  tags text[] not null default '{}',      -- タグ(配列)。MVPはこれで十分、将来正規化も可
  -- ---- 将来のAI機能拡張用カラム(MVP時点ではNULL許容で追加のみ) ----
  embedding vector(1536),                 -- pgvectorによる意味検索用 (例: text-embedding-3-small)
  ai_summary text,                        -- AIによる自動要約・レビュー結果
  -- ---------------------------------------------------------------
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists knowledge_cards_user_id_idx on public.knowledge_cards (user_id);
create index if not exists knowledge_cards_tags_idx on public.knowledge_cards using gin (tags);
create index if not exists knowledge_cards_created_at_idx on public.knowledge_cards (created_at desc);
-- キーワード検索(タイトル・本文)高速化用の全文検索インデックス
create index if not exists knowledge_cards_fts_idx on public.knowledge_cards
  using gin (to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(content, '')));
-- 将来のベクトル検索用インデックス(データが増えてから作成でも可。ivfflatはデータ件数依存のため一旦コメントアウト)
-- create index knowledge_cards_embedding_idx on public.knowledge_cards
--   using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- updated_at 自動更新トリガー
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_knowledge_cards_updated_at on public.knowledge_cards;
create trigger set_knowledge_cards_updated_at
  before update on public.knowledge_cards
  for each row execute procedure public.set_updated_at();

-- ---------------------------------------------------------------------
-- 3. (将来拡張用) 外部通知設定テーブルの雛形
--    今回は作成のみでMVPロジックからは未使用。ロードマップの3番用。
-- ---------------------------------------------------------------------
create table if not exists public.notification_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  line_user_id text,
  discord_webhook_url text,
  reminder_enabled boolean not null default false,
  reminder_cron text default '0 9 * * *', -- 例: 毎朝9時
  created_at timestamptz not null default now()
);

-- =====================================================================
-- Row Level Security (RLS) 設定
-- =====================================================================
alter table public.profiles enable row level security;
alter table public.knowledge_cards enable row level security;
alter table public.notification_settings enable row level security;

-- --- profiles ---
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- --- knowledge_cards: 本人のデータのみ CRUD 可能 ---
create policy "knowledge_cards_select_own"
  on public.knowledge_cards for select
  using (auth.uid() = user_id);

create policy "knowledge_cards_insert_own"
  on public.knowledge_cards for insert
  with check (auth.uid() = user_id);

create policy "knowledge_cards_update_own"
  on public.knowledge_cards for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "knowledge_cards_delete_own"
  on public.knowledge_cards for delete
  using (auth.uid() = user_id);

-- --- notification_settings: 本人のみ ---
create policy "notification_settings_all_own"
  on public.notification_settings for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
