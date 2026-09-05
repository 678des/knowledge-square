export type Subject = {
  id: string;
  name: string;
  color: string;
  user_id?: string | null;
};

export type Message = {
  id?: string;
  role: "user" | "assistant"; // または 'model'
  content: string;
  created_at?: string;
};

export type Note = {
  id: string;
  subject_id: string;
  user_id?: string | null;
  ai_summary?: string | null;
  study_note?: string | null;
  all_chat_log?: Message[] | null;
};
