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

export type Attempt = {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};
export type ExamProblem = {
  id: string;
  room_id: string;
  question_content: string;
  created_at: string;
  exam_attempts: Attempt[];
};
