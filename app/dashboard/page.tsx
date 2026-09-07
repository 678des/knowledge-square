"use server";
import Link from "next/link";
import { Plus } from "lucide-react";
//import { categories, getChatsByCategory } from "./_lib/mock-data";
import NewSubjectModal from "./_components/NewSubjectModal";
import { getSubjects } from "@/lib/supabase/queries/subjects";
export default async function DashboardHomePage() {
  const subjects = await getSubjects();

  return (
    <div className="mx-auto h-full max-w-3xl overflow-y-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-[#E7E8EA]">
          今日は何を学びますか？
        </h1>
        <p className="mt-1.5 text-sm text-[#98A0AC]">
          教科を選んで続きから始めるか、新しい学習をはじめましょう。
        </p>
      </div>

      <NewSubjectModal></NewSubjectModal>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {subjects.map((sub) => {
          return (
            <div
              key={sub.id}
              className="rounded-xl border border-[#2E323B] bg-[#1C1F25] p-4"
              style={{ borderTopColor: sub.color, borderTopWidth: 2 }}
            >
              <div className="mb-3 flex items-center gap-2">
                <Link
                  key={sub.id}
                  href={"dashboard/c/" + sub.id}
                  className="flex items-center gap-2"
                >
                  <span className="text-sm font-medium text-[#E7E8EA]">
                    {sub.name}
                  </span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
