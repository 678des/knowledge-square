'use client'

import { useMemo, useState, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import Header from './_components/Header'
import Sidebar from './_components/Sidebar'
import { getCategory, getChat } from './_lib/mock-data'
import { inter } from './_lib/fonts'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false) // 【重要】初期状態は閉じておく(フォーカスモード)
  const pathname = usePathname()

  const activeChatId = useMemo(() => {
    const match = pathname.match(/^\/dashboard\/c\/([^/]+)/)
    return match?.[1]
  }, [pathname])

  const activeChat = activeChatId ? getChat(activeChatId) : undefined
  const activeCategory = getCategory(activeChat?.categoryId)

  return (
    <div className={`${inter.className} flex h-screen flex-col overflow-hidden bg-[#15171B] text-[#E7E8EA]`}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} activeChatId={activeChatId} />

      <Header
        onMenuClick={() => setSidebarOpen((v) => !v)}
        category={activeCategory}
        chatTitle={activeChat?.title}
      />

      <main className="min-h-0 flex-1">{children}</main>
    </div>
  )
}
