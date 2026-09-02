import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import CardList from './CardList'
import { signOut } from '@/app/login/actions'

type SearchParams = {
  q?: string
  tag?: string
}

export default async function CardsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const { q, tag } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('knowledge_cards')
    .select('*')
    .order('created_at', { ascending: false })

  if (q) {
    // タイトル・本文の部分一致検索(簡易版。将来はto_tsvectorのFTSやRAGに置き換え)
    query = query.or(`title.ilike.%${q}%,content.ilike.%${q}%`)
  }
  if (tag) {
    query = query.contains('tags', [tag])
  }

  const { data: cards, error } = await query

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-8">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">マイナレッジ</h1>
        <div className="flex items-center gap-3">
          <Link
            href="/cards/new"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            + 新規作成
          </Link>
          <form action={signOut}>
            <button type="submit" className="text-sm text-slate-500 hover:text-slate-700">
              ログアウト
            </button>
          </form>
        </div>
      </header>

      <form className="mb-6 flex gap-2" action="/cards" method="get">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="キーワードで検索..."
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        />
        {tag && <input type="hidden" name="tag" value={tag} />}
        <button
          type="submit"
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          検索
        </button>
      </form>

      {tag && (
        <div className="mb-4 text-sm text-slate-500">
          タグ「{tag}」で絞り込み中 ·{' '}
          <Link href="/cards" className="underline">
            解除
          </Link>
        </div>
      )}

      {error ? (
        <p className="text-sm text-red-600">読み込みに失敗しました: {error.message}</p>
      ) : (
        <CardList cards={cards ?? []} />
      )}
    </main>
  )
}
