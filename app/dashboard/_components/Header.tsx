"use client";

import { Menu } from "lucide-react";
//import type { Category } from '../_lib/mock-data'

export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-[#2E323B] bg-[#15171B]/95 px-4 backdrop-blur">
      <button
        onClick={onMenuClick}
        aria-label="メニューを開く"
        className="rounded-lg p-1.5 text-[#98A0AC] transition-colors hover:bg-[#1C1F25] hover:text-[#E7E8EA]"
      >
        <Menu size={20} />
      </button>

      {/* {category ? (
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
            style={{ backgroundColor: `${category.color}22`, color: category.color }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: category.color }} />
            {category.name}
          </span>
          {chatTitle && (
            <span className="truncate text-sm text-[#98A0AC]">{chatTitle}</span>
          )}
        </div>
      ) : (
        <span className="text-sm font-medium text-[#E7E8EA]">学修アシスタント</span>
      )} */}
    </header>
  );
}
