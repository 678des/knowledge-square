import Link from 'next/link'
import type { KnowledgeCard } from '@/types/database.types'
import { deleteCard } from './actions'

function DeleteButton({ cardId }: { cardId: string }) {
  const deleteWithId = deleteCard.bind(null, cardId)
  return (
    <form action={deleteWithId}>
      <button
        type="submit"
        className="text-xs text-slate-400 hover:text-red-600"
        aria-label="削除"
      >
        削除
      </button>
    </form>
  )
}

export default function CardList({ cards }: { cards: KnowledgeCard[] }) {
  if (cards.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
        まだナレッジが登録されていません。右上の「新規作成」から追加してみましょう。
      </div>
    )
  }

  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <li
          key={card.id}
          className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
        >
          <div>
            <Link href={`/cards/${card.id}`} className="line-clamp-2 font-semibold text-slate-900 hover:underline">
              {card.title}
            </Link>
            <p className="mt-2 line-clamp-3 text-sm text-slate-500">{card.content}</p>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex flex-wrap gap-1">
              {card.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                >
                  #{tag}
                </span>
              ))}
            </div>
            <DeleteButton cardId={card.id} />
          </div>
        </li>
      ))}
    </ul>
  )
}
