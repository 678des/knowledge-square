//import { getNote } from "@/lib/supabase/queries/notes";

import { createClient } from "@/lib/supabase/server";
import { getSubjects, getSubjectName } from "@/lib/supabase/queries/subjects";
import { getChat } from "@/lib/supabase/queries/chat";
import { getSummary } from "@/lib/supabase/queries/summary";
import { SubjectDetailClient } from "./_components/SubjectDetailClient";
export default async function ChatPage({
  params,
}: {
  params: { subjectId: string };
}) {
  const { subjectId } = await params;
  const subjectName = await getSubjectName(subjectId);
  const subjects = await getSubjects();
  const studyChatLogs = await getChat(subjectId, 10, "study");
  const interViewChatLogs = await getChat(subjectId, 10, "review");
  const aiSummary = await getSummary(subjectId);

  console.log("科目", subjectName);
  console.log(
    "interViewChatLogs",
    interViewChatLogs,
    "studyChatLogs",
    studyChatLogs,
  );

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
      aiSummary={typeof aiSummary === "string" ? aiSummary : ""}
    />
  );
}
