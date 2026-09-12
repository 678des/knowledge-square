export function LoginButton() {
  const isLoggedIn = true;
  return isLoggedIn ? (
    <button className="flex items-center rounded-lg p-1.5 text-[#98A0AC] transition-colors bg-[#1C1F25] hover:bg-[#1C1F25] hover:text-[#E7E8EA]">
      マイページへ
    </button>
  ) : (
    <button className="flex items-center rounded-lg p-1.5 text-[#98A0AC] transition-colors bg-[#1C1F25] hover:bg-[#1C1F25] hover:text-[#E7E8EA]">
      ログイン
    </button>
  );
}
