"use client";

export default function AISummary({
  initialAISummary,
}: {
  initialAISummary: string;
}) {
  return (
    <div>
      <div className="overflow-y-auto flex justify-between items-center mb-2">
        <h2 className="text-sm font-semibold text-slate-400">🤖 要約</h2>
      </div>
      <textarea
        defaultValue={initialAISummary || ""}
        className="w-full h-44 rounded-md bg-slate-950 border border-slate-800 p-3 text-sm text-slate-200 resize-none focus:outline-none"
      ></textarea>
    </div>
  );
}
