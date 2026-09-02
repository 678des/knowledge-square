'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type CardFormState = {
  error: string | null
}

function parseTags(raw: string): string[] {
  return raw
    .split(',')
    .map((t) => t.trim())
    .filter((t) => t.length > 0)
}

export async function createCard(
  _prevState: CardFormState,
  formData: FormData
): Promise<CardFormState> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const title = String(formData.get('title') ?? '').trim()
  const content = String(formData.get('content') ?? '')
  const tags = parseTags(String(formData.get('tags') ?? ''))

  if (!title) {
    return { error: 'タイトルは必須です。' }
  }

  const { error } = await supabase.from('knowledge_cards').insert({
    user_id: user.id,
    title,
    content,
    tags,
  })

  if (error) {
    return { error: '保存に失敗しました。時間をおいて再度お試しください。' }
  }

  revalidatePath('/cards')
  redirect('/cards')
}

export async function deleteCard(cardId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // RLSでも本人のみ削除可能だが、念のためuser_idも条件に含める
  await supabase.from('knowledge_cards').delete().eq('id', cardId).eq('user_id', user.id)

  revalidatePath('/cards')
}
