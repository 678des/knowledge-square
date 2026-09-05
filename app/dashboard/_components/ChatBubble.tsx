"use client";
import { lora } from "../_lib/fonts";
import type { ChatMessage, Category } from "../_lib/mock-data";

// `...` で囲まれた部分をインライン数式風(モノスペース)として描画する
function renderInline(text: string, keyPrefix: string) {
  const parts = text.split(/(`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={`${keyPrefix}-${i}`}
          className="rounded bg-black/25 px-1.5 py-0.5 font-mono text-[0.85em] text-[#9FD8CE]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return <span key={`${keyPrefix}-${i}`}>{part}</span>;
  });
}

// 改行区切りの本文を、箇条書き行とそれ以外の段落に分けて描画する
function renderContent(content: string) {
  const lines = content.split("\n");
  const blocks: { type: "p" | "ul"; lines: string[] }[] = [];

  for (const line of lines) {
    const isBullet = line.trimStart().startsWith("- ");
    const last = blocks[blocks.length - 1];
    if (isBullet) {
      if (last?.type === "ul") last.lines.push(line.trimStart().slice(2));
      else blocks.push({ type: "ul", lines: [line.trimStart().slice(2)] });
    } else if (line.trim() === "") {
      // 空行はブロックの区切りとして扱う
      if (last) blocks.push({ type: "p", lines: [] });
    } else {
      if (last?.type === "p") last.lines.push(line);
      else blocks.push({ type: "p", lines: [line] });
    }
  }

  return blocks
    .filter((b) => b.lines.length > 0)
    .map((block, bi) =>
      block.type === "ul" ? (
        <ul
          key={bi}
          className="my-2 list-disc space-y-1 pl-5 marker:text-[#6B7280]"
        >
          {block.lines.map((l, li) => (
            <li key={li}>{renderInline(l, `${bi}-${li}`)}</li>
          ))}
        </ul>
      ) : (
        <p key={bi} className="leading-relaxed">
          {block.lines.map((l, li) => (
            <span key={li}>
              {renderInline(l, `${bi}-${li}`)}
              {li < block.lines.length - 1 && <br />}
            </span>
          ))}
        </p>
      ),
    );
}

export default function ChatBubble({
  message,
  category,
}: {
  message: ChatMessage;
  category?: Category;
}) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-[#262A31] px-4 py-2.5 text-[15px] text-[#E7E8EA]">
          {renderContent(message.content)}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <span
        className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: category?.color ?? "#3FB6A8" }}
      />
      <div
        className={`${lora.className} max-w-[85%] space-y-1 text-[15.5px] text-[#DADCE0]`}
      >
        {renderContent(message.content)}
      </div>
    </div>
  );
}
