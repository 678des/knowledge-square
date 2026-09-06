// app/dashboard/layout.tsx
import { getSubjects } from "@/lib/supabase/queries/subjects";
import DashboardClientLayout from "./_components/DashboardClientLayout";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. サーバー側で DB データを取得
  const subjects = (await getSubjects()) ?? [];

  // 2. Client 用のレイアウトに丸ごと渡す
  return (
    <DashboardClientLayout subjects={subjects}>
      {children}
    </DashboardClientLayout>
  );
}
