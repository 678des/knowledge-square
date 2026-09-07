// app/dashboard/_components/DashboardClientLayout.tsx
"use client";
import { Inter, Lora } from "next/font/google";
import { useMemo, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import Header from "./Header";
import Sidebar from "./Sidebar";
import type { Subject } from "@/lib/types";

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
}: {
  children: ReactNode;
  subjects: Subject[];
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const activeChatId = useMemo(() => {
    const match = pathname.match(/^\/dashboard\/c\/([^/]+)/);
    return match?.[1];
  }, [pathname]);

  return (
    <div
      className={`${inter.className} flex h-screen flex-col overflow-hidden bg-[#15171B] text-[#E7E8EA]`}
    >
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        subjects={subjects}
      />

      <Header
        onMenuClick={() => setSidebarOpen((v) => !v)}
        // category={activeCategory}
        // chatTitle={activeChat?.title}
      />

      <main className="min-h-0 flex-1">{children}</main>
    </div>
  );
}
