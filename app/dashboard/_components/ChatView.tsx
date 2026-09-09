// "use client";

// import { useEffect, useRef, useState, type KeyboardEvent } from "react";
// import { Send } from "lucide-react";
// import ChatBubble from "./ChatBubble";

// export default function ChatView({
//   initialMessages,
//   category,
// }: {
//   initialMessages: ChatMessage[];
//   category?: Category;
// }) {
//   const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
//   const [input, setInput] = useState("");
//   const [isThinking, setIsThinking] = useState(false);
//   const scrollRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     scrollRef.current?.scrollTo({
//       top: scrollRef.current.scrollHeight,
//       behavior: "smooth",
//     });
//   }, [messages, isThinking]);

//   function handleSend() {
//     const text = input.trim();
//     if (!text || isThinking) return;

//     const userMessage: ChatMessage = {
//       id: `u-${Date.now()}`,
//       role: "user",
//       content: text,
//     };
//     setMessages((prev) => [...prev, userMessage]);
//     setInput("");
//     setIsThinking(true);

//     // MVPデモ用の擬似応答。実際にはここでAI APIを呼び出す想定。
//     window.setTimeout(() => {
//       setMessages((prev) => [
//         ...prev,
//         {
//           id: `a-${Date.now()}`,
//           role: "assistant",
//           content:
//             "なるほど、その点について整理しますね。\n" +
//             "- まず前提となる考え方を確認しましょう\n" +
//             "- 具体例を1つ解いてみると理解が定着しやすいです\n\n" +
//             "どこまで理解できているか、まず教えてください。",
//         },
//       ]);
//       setIsThinking(false);
//     }, 900);
//   }

//   function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       handleSend();
//     }
//   }

//   return (
//     <div className="flex h-full flex-col">
//       <div ref={scrollRef} className="flex-1 overflow-y-auto">
//         <div className="mx-auto max-w-2xl space-y-5 px-4 py-6">
//           {messages.map((message) => (
//             <ChatBubble
//               key={message.id}
//               message={message}
//               category={category}
//             />
//           ))}

//           {isThinking && (
//             <div className="flex gap-3">
//               <span
//                 className="mt-1.5 h-2 w-2 shrink-0 rounded-full opacity-60"
//                 style={{ backgroundColor: category?.color ?? "#3FB6A8" }}
//               />
//               <div className="flex items-center gap-1 py-1">
//                 {[0, 1, 2].map((i) => (
//                   <span
//                     key={i}
//                     className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#6B7280]"
//                     style={{ animationDelay: `${i * 120}ms` }}
//                   />
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       <div className="shrink-0 border-t border-[#2E323B] bg-[#15171B] px-4 py-3">
//         <div className="mx-auto flex max-w-2xl items-end gap-2 rounded-2xl border border-[#2E323B] bg-[#1C1F25] px-3 py-2">
//           <textarea
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//             onKeyDown={handleKeyDown}
//             rows={1}
//             placeholder="質問を入力(Shift+Enterで改行)"
//             className="max-h-40 flex-1 resize-none bg-transparent py-1.5 text-[15px] text-[#E7E8EA] placeholder:text-[#6B7280] focus:outline-none"
//           />
//           <button
//             onClick={handleSend}
//             disabled={!input.trim() || isThinking}
//             aria-label="送信"
//             className="mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#3FB6A8] text-[#0F1113] transition-opacity hover:bg-[#34A093] disabled:opacity-30"
//           >
//             <Send size={15} />
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
