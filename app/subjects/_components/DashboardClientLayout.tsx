"use client";

import { Inter, Lora } from "next/font/google";
import { useState, type ReactNode } from "react";
import Sidebar from "./Sidebar";
import type { Subject } from "@/lib/types";
import Header from "./Header";
//import type { User } from "@supabase/supabase-js"; // 型のインポート

export const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});
export const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export default function DashboardClientLayout({
  children,
  subjects,
  //user,
}: {
  children: ReactNode;
  subjects: Subject[];
  //user: User;
}) {
  // const supabase = await createClient();
  //   const { data: { user }, error } = await supabase.auth.getUser();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div
      className={`${inter.className} flex h-screen flex-col overflow-hidden bg-[#15171B] text-[#E7E8EA]`}
    >
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        subjects={subjects}
      />

      <Header onMenuClick={() => setSidebarOpen((v) => !v)} />

      <main className="min-h-0 flex-1">{children}</main>
    </div>
  );
}
