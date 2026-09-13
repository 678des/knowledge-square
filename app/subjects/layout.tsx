// app/dashboard/layout.tsx
import { getSubjects } from "@/lib/supabase/queries/subjects";
import DashboardClientLayout from "./_components/DashboardClientLayout";
import { createClient } from "@/lib/supabase/server";
//import type { User } from "@supabase/supabase-js"; // 型のインポート

export default async function DashboardLayout({
  children,
  //user,
}: {
  children: React.ReactNode;
  //user: User;
}) {
  const supabase = await createClient();

  // UI表示用（アバターなど）にユーザー情報を取得
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 1. サーバー側で DB データを取得
  const subjects = (await getSubjects()) ?? [];

  // 2. Client 用のレイアウトに丸ごと渡す
  return (
    <DashboardClientLayout
      subjects={subjects}
      currentSubject="あああ"
      user={user!}
    >
      {children}
    </DashboardClientLayout>
  );
}
