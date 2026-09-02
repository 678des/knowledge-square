'use client'

import { useActionState, useState } from 'react'
import { signIn, signUp, signInWithGitHub, type AuthState } from './actions'

const initialState: AuthState = { error: null }

export default function LoginPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const action = mode === 'signin' ? signIn : signUp
  const [state, formAction, pending] = useActionState(action, initialState)

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <h1 className="mb-1 text-xl font-semibold text-slate-900">
          {mode === 'signin' ? 'ログイン' : '新規登録'}
        </h1>
        <p className="mb-6 text-sm text-slate-500">ナレッジベースへようこそ</p>

        <form action={formAction} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
              メールアドレス
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
              パスワード
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </div>

          {state.error && <p className="text-sm text-red-600">{state.error}</p>}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50"
          >
            {pending ? '処理中...' : mode === 'signin' ? 'ログイン' : '登録する'}
          </button>
        </form>

        <form action={signInWithGitHub} className="mt-3">
          <button
            type="submit"
            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            GitHubでログイン
          </button>
        </form>

        <button
          type="button"
          onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
          className="mt-6 w-full text-center text-sm text-slate-500 hover:text-slate-700"
        >
          {mode === 'signin' ? 'アカウントをお持ちでない方はこちら' : '既にアカウントをお持ちの方はこちら'}
        </button>
      </div>
    </main>
  )
}
