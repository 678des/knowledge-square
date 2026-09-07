"use client";

import React from "react";

export default function AISummary({
  initialAISummary,
}: {
  initialAISummary: string;
}) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-slate-400 mb-2">🤖 AI要約</h2>
      <div className="rounded-md bg-slate-950 border border-slate-800 p-3 text-sm text-slate-300 min-h-[100px]">
        {initialAISummary || (
          <span className="text-slate-500 italic">要約はまだありません</span>
        )}
      </div>
    </div>
  );
}
