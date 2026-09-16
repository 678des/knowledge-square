//import { getNote } from "@/lib/supabase/queries/notes";

import { createClient } from "@/lib/supabase/server";
import { getSubjects, getSubjectName } from "@/lib/supabase/queries/subjects";
import { getChat } from "@/lib/supabase/queries/chat";
import { SubjectDetailClient } from "./_components/SubjectDetailClient";
export default async function ChatPage({
  params,
}: {
  params: Promise<{ subjectId: string }>;
}) {
  const { subjectId } = await params;
  const subjectName = await getSubjectName(subjectId);
  const subjects = await getSubjects();
  const studyChatLogs = await getChat(subjectId, 1000, "study");
  const interViewChatLogs = await getChat(subjectId, 1000, "review");

  console.log("科目", subjectName);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return (
    <SubjectDetailClient
      user={user}
      subjectId={subjectId}
      subjects={subjects}
      subjectName={subjectName}
      studyChatlogs={studyChatLogs}
      interviewChatLogs={interViewChatLogs}
    />
  );
}
