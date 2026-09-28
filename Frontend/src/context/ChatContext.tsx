import { createContext, useContext, type ReactNode } from "react";
import { useChatController, type ChatModel } from "../hooks/useChatController";

const ChatContext = createContext<ChatModel | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const chat = useChatController();
  return <ChatContext.Provider value={chat}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const chat = useContext(ChatContext);
  if (!chat) throw new Error("useChat must be used inside ChatProvider");
  return chat;
}
