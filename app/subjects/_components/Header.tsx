"use client";

import { Menu } from "lucide-react";
// import { LoginButton } from "../../_components/LoginButton";
// import Avator from "@/app/_components/Avator";
// import type { User } from "@supabase/supabase-js";

type HeaderProps = {
  onMenuClick: () => void;
};

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-[#2E323B] bg-[#15171B]/95 px-4 backdrop-blur">
      <button
        onClick={onMenuClick}
        aria-label="メニューを開く"
        className="flex items-center rounded-lg p-1.5 text-[#98A0AC] transition-colors hover:bg-[#1C1F25] hover:text-[#E7E8EA]"
      >
        <Menu size={20} />
      </button>{" "}
      {/* {!!user ? <Avator /> : <LoginButton />} */}
    </header>
  );
}
