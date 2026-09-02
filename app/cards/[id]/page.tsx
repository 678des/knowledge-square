import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function CardDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: card } = await supabase
    .from('knowledge_cards')
    .select('*')
    .eq('id', id)
    .single()

  if (!card) {
    notFound()
  }

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 py-8">
      <Link href="/cards" className="text-sm text-slate-500 hover:text-slate-700">
        ← 一覧に戻る
      </Link>

      <article className="mt-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h1 className="text-2xl font-semibold text-slate-900">{card.title}</h1>
        <div className="mt-2 flex flex-wrap gap-1">
          {card.tags.map((tag: string) => (
            <span key={tag} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
              #{tag}
            </span>
          ))}
        </div>
        {/* MVPでは素のテキスト表示。Markdownレンダリングは react-markdown 導入後に置き換え推奨 */}
        <pre className="mt-6 whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-700">
          {card.content}
        </pre>
      </article>
    </main>
  )
}
