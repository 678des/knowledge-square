// 本来は `supabase gen types typescript --linked` で自動生成するのが望ましい。
// MVPではまず手書きし、CLIを導入したら置き換える運用でOK。

export type KnowledgeCard = {
  id: string
  user_id: string
  title: string
  content: string
  tags: string[]
  embedding: number[] | null
  ai_summary: string | null
  created_at: string
  updated_at: string
}

export type Profile = {
  id: string
  display_name: string | null
  avatar_url: string | null
  created_at: string
}

export type Database = {
  public: {
    Tables: {
      knowledge_cards: {
        Row: KnowledgeCard
        Insert: Partial<KnowledgeCard> & {
          user_id: string
          title: string
        }
        Update: Partial<KnowledgeCard>
      }
      profiles: {
        Row: Profile
        Insert: Partial<Profile> & { id: string }
        Update: Partial<Profile>
      }
    }
  }
}
