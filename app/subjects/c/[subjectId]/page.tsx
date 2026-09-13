import { getNote } from "@/lib/supabase/queries/notes";

import { createClient } from "@/lib/supabase/server";
import { getSubjects, getSubjectName } from "@/lib/supabase/queries/subjects";
import { SubjectDetailClient } from "./_components/SubjectDetailClient";
export default async function ChatPage({
  params,
}: {
  params: Promise<{ subjectId: string }>;
}) {
  const { subjectId } = await params;
  const note = await getNote(subjectId);
  const subjectName = await getSubjectName(subjectId);
  const subjects = await getSubjects();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return (
    <SubjectDetailClient
      user={user}
      subjectId={subjectId}
      initialNote={note}
      subjects={subjects}
      subjectName={subjectName}
    />
  );
}
