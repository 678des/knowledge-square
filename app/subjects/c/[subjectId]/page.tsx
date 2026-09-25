//import { getNote } from "@/lib/supabase/queries/notes";

import { createClient } from "@/lib/supabase/server";
import { getSubjects, getSubjectName } from "@/lib/supabase/queries/subjects";
import { getChat } from "@/lib/supabase/queries/chat";
import { getSummary } from "@/lib/supabase/queries/summary";
import { SubjectDetailClient } from "./_components/SubjectDetailClient";
import { getExamProblems } from "@/lib/supabase/queries/examProblems";
import { redirect } from "next/navigation";
import { getNote } from "@/lib/supabase/queries/notes";
export default async function ChatPage({
  params,
}: {
  params: { subjectId: string };
}) {
  const { subjectId } = await params;
  const subjectName = await getSubjectName(subjectId);
  const subjects = await getSubjects();
  const studyChatLogs = await getChat(subjectId, 10, "study");
  const aiSummary = await getSummary(subjectId);
  const studyNote = await getNote(subjectId);
  const examProblems = await getExamProblems(subjectId);

  console.log("科目", subjectName);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <SubjectDetailClient
      user={user}
      subjectId={subjectId}
      subjects={subjects}
      subjectName={subjectName}
      studyChatlogs={studyChatLogs}
      aiSummary={typeof aiSummary === "string" ? aiSummary : ""}
      problems={examProblems}
      studyNote={studyNote || ""}
    />
  );
}
