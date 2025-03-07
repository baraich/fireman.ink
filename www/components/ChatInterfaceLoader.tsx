"use client";
import { Message } from "@/db/schema/messages";
import dynamic from "next/dynamic";

const ChatInterface = dynamic(
  async () => import("@/components/ChatInterface"),
  { ssr: false }
);

interface ChatInterfaceProps {
  messages: Message[];
  initials: string;
  userId: string;
  projectId: string;
  q: string;
  newConversation: boolean;
}

export default function ChatIntefaceLoader(props: ChatInterfaceProps) {
  return <ChatInterface {...props} />;
}
