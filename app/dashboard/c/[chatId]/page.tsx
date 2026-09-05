import ChatView from "../../_components/ChatView";
import { getCategory, getChat, getMessages } from "../../_lib/mock-data";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ chatId: string }>;
}) {
  const { chatId } = await params;
  const chat = getChat(chatId);
  const category = getCategory(chat?.categoryId);
  const messages = getMessages(chatId);

  return (
    <div className="flex h-full flex-col">
      <h1>ここはチャット＄学習エリアです</h1>
      <ChatView initialMessages={messages} category={category} />
    </div>
  );
}
