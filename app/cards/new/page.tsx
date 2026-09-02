'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { createCard, type CardFormState } from '../actions'

const initialState: CardFormState = { error: null }

export default function NewCardPage() {
  const [state, formAction, pending] = useActionState(createCard, initialState)

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">新規ナレッジ作成</h1>
        <Link href="/cards" className="text-sm text-slate-500 hover:text-slate-700">
          一覧に戻る
        </Link>
      </div>

      <form action={formAction} className="space-y-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div>
          <label htmlFor="title" className="mb-1 block text-sm font-medium text-slate-700">
            タイトル
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="content" className="mb-1 block text-sm font-medium text-slate-700">
            本文 (Markdown対応)
          </label>
          <textarea
            id="content"
            name="content"
            rows={10}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm focus:border-slate-500 focus:outline-none"
            placeholder="## 見出し&#10;本文をMarkdownで記述できます"
          />
        </div>

        <div>
          <label htmlFor="tags" className="mb-1 block text-sm font-medium text-slate-700">
            タグ (カンマ区切り)
          </label>
          <input
            id="tags"
            name="tags"
            type="text"
            placeholder="React, Next.js, Supabase"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>

        {state.error && <p className="text-sm text-red-600">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50"
        >
          {pending ? '保存中...' : '保存する'}
        </button>
      </form>
    </main>
  )
}
