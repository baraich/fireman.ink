"use client";
import { Message } from "@/db/schema/messages";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { UserMessage } from "./UserMessage";
import { AssistantMessage } from "./AssistantMessage";
import Script from "next/script";

import hljs from "highlight.js/lib/core";
import php from "highlight.js/lib/languages/php";
import properties from "highlight.js/lib/languages/properties";
import "highlight.js/styles/vs2015.css";
import { ToolMessage } from "./ToolMessage";

/*
 * Constants from W3C SVG namespace specification
 */
const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

/*
 * Interface for ChatInterface component props
 */
interface ChatInterfaceProps {
  messages: Message[];
  initials: string;
  userId: string;
  projectId: string;
  q: string;
  newConversation: boolean;
}

/*
 * Interface for chat history entry
 */
interface ChatHistoryEntry {
  role: "user" | "assistant";
  content: string;
}

/*
 * ChatInterface component for displaying and managing project chat
 * @param props - Properties including messages and user data
 */
export default function ChatInterface({
  messages: initialMessages,
  initials,
  projectId,
  userId,
  newConversation,
  q,
}: ChatInterfaceProps) {
  /*
   * State management for chat input and loading status
   */
  const [textAreaValue, setTextAreaValue] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [history, setHistory] = useState<ChatHistoryEntry[]>([]);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isAutoScrollingRef = useRef<boolean>(true);

  useEffect(function () {
    hljs.registerLanguage("php", php);
    hljs.registerLanguage("properties", properties);
  }, []);

  /*
   * Sends a message to the server
   * @param msg - Message content to send
   */
  const sendMessage = async (msg: string) => {
    if (!msg.trim()) return;
    if (loading) return;

    setTextAreaValue("");
    setLoading(true);
    isAutoScrollingRef.current = true;

    try {
      /*
       * Update history immediately with user message
       */
      setHistory((prev) => [...prev, { role: "user", content: msg }]);

      /*
       * Send message to API endpoint with streaming response
       */
      const response = await fetch("/api/v1/sendMessage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId,
          new: history.length <= 1,
          userId,
          content: msg,
          history,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.statusText}`);
      }

      /*
       * Handle streamed response
       */
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Response body is not readable");
      }

      let assistantMessage = "";

      // Add initial empty assistant message
      setHistory((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        assistantMessage += chunk;

        // Update only the content of the last message (which is the assistant's)
        setHistory((prev) => {
          const newHistory = [...prev];
          if (
            newHistory.length > 0 &&
            newHistory[newHistory.length - 1].role === "assistant"
          ) {
            newHistory[newHistory.length - 1].content = assistantMessage;
          }
          return newHistory;
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  /*
   * Effect to initialize history and handle new conversations
   */
  useEffect(() => {
    /*
     * Populate initial history from messages
     */
    const newHistory = initialMessages.map((msg) => ({
      role: msg.type === "user" ? "user" : "assistant",
      content: msg.content,
    }));
    setHistory(newHistory as typeof history);
    /*
     * Start new conversation if applicable
     */
    if (newHistory.length <= 1 && q) {
      sendMessage(q);
    }
    // eslint-disable-next-line
  }, [initialMessages, newConversation, q]);

  // Smooth scrolling effect that runs when history changes
  useEffect(() => {
    if (!messagesContainerRef.current || !isAutoScrollingRef.current) return;

    const scrollContainer = messagesContainerRef.current;
    const scrollToBottom = () => {
      scrollContainer.scrollTo({
        top: scrollContainer.scrollHeight,
        behavior: "smooth",
      });
    };

    scrollToBottom();
  }, [history]);

  // Detect user scroll to disable auto-scrolling when user scrolls up
  useEffect(() => {
    const handleScroll = () => {
      if (!messagesContainerRef.current) return;

      const { scrollTop, scrollHeight, clientHeight } =
        messagesContainerRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100; // Within 100px of bottom

      isAutoScrollingRef.current = isAtBottom;
    };

    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, []);

  return (
    <div className="bg-[#111111] min-w-xl w-full rounded-lg border border-stone-800 shadow-lg flex flex-col h-full">
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/highlight.min.js"></Script>
      {/* Messages Container */}
      <div
        ref={messagesContainerRef}
        className="flex-1 p-5 overflow-auto w-full"
      >
        <div className="space-y-6 w-full">
          {history.map((message, index) => (
            <>
              {index === 2 ? (
                <div className="w-full">
                  <ToolMessage />
                </div>
              ) : null}
              {loading && index === history.length - 1 && (
                <div className="w-full bg-stone-800 rounded-lg">
                  <div className="w-full p-6 flex items-center justify-center gap-2 animate-pulse">
                    <div className="size-4 rounded-full bg-white animate-bounce duration-300"></div>
                    <div className="size-4 rounded-full bg-white animate-bounce animation-delay-75 duration-300"></div>
                    <div className="size-4 rounded-full bg-white animate-bounce animation-delay-150 duration-300"></div>
                  </div>
                </div>
              )}
              <div key={index} className="w-full">
                {message.role === "user" ? (
                  <UserMessage
                    key={index}
                    initials={initials}
                    msg={message.content}
                  />
                ) : (
                  <AssistantMessage key={index} msg={message.content} />
                )}
              </div>
            </>
          ))}
        </div>
      </div>

      {/* Message Input */}
      <div className="w-auto bg-[#0d0d0d] rounded-lg p-5 m-5 border border-stone-800 shadow-lg relative">
        <div className="flex items-center">
          <textarea
            value={textAreaValue}
            disabled={loading}
            onChange={(e) => setTextAreaValue(e.target.value)}
            placeholder="Ask Fireman ..."
            className="bg-transparent w-full outline-none text-gray-300 resize-none h-24 p-2 disabled:opacity-50"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage(textAreaValue);
              }
            }}
          />
          <button
            onClick={() => sendMessage(textAreaValue)}
            disabled={loading}
            className="absolute right-5 bottom-5 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-3 shadow-lg transition-colors disabled:bg-blue-400"
          >
            {loading ? (
              <Loader2 className="animate-spin w-5 h-5" />
            ) : (
              <svg
                xmlns={SVG_NAMESPACE}
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
