import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GitHubログイン等のOAuthフロー完了後にSupabaseから呼び戻されるエンドポイント
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/cards'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=oauth_callback_failed`)
}
