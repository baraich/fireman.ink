"use client";
import { Message } from "@/db/schema/messages";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import Prism from "prismjs";
import Markdown from "react-markdown";

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

  /*
   * Sends a message to the server
   * @param msg - Message content to send
   */
  /*
   * Sends a message to the server
   * @param msg - Message content to send
   */
  const sendMessage = async (msg: string) => {
    if (!msg.trim()) return;

    setTextAreaValue("");
    setLoading(true);

    try {
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
          new: initialMessages.length <= 1,
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
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        assistantMessage += chunk;

        setHistory((prev) => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage?.role === "assistant") {
            return [
              ...prev.slice(0, -1),
              { role: "assistant", content: assistantMessage },
            ];
          }
          return initialMessages.length <= 1
            ? [...prev, { role: "assistant", content: chunk }]
            : [
                ...prev,
                { role: "user", content: msg },
                { role: "assistant", content: chunk },
              ];
        });
      }

      /*
       * Ensure final message is complete
       */
      setHistory((prev) => {
        const lastMessage = prev[prev.length - 1];
        if (
          lastMessage?.role === "assistant" &&
          lastMessage.content !== assistantMessage
        ) {
          return [
            ...prev.slice(0, -1),
            { role: "assistant", content: assistantMessage },
          ];
        }
        return prev;
      });
    } catch (error) {
      console.error("Error sending message:", error);
      setHistory((prev) => [...prev, { role: "user", content: msg }]);
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
    if (newConversation && q) {
      sendMessage(q);
    }
    // eslint-disable-next-line
  }, [initialMessages, newConversation, q]);

  useEffect(
    function () {
      try {
        const preTags = document.getElementsByTagName("pre");
        const codeBlocks = document.getElementsByTagName("code");
        [...codeBlocks].forEach((codeBlock) => {
          const hasClass = codeBlock.getAttribute("class");
          codeBlock.parentElement?.setAttribute(
            "class",
            hasClass ? hasClass : ""
          );
        });

        [...preTags].forEach((preTag) => {
          preTag.style.marginLeft = "30px";
        });

        Prism.highlightAll();
      } catch (error) {
        console.log(error);
      }
    },
    [initialMessages, history]
  );

  return (
    <div className="bg-[#111111] min-w-xl w-full rounded-lg border border-stone-800 shadow-lg flex flex-col h-full">
      {/* Messages Container */}
      <div className="flex-1 p-5 overflow-auto w-full">
        <div className="space-y-6 w-full">
          {history.map((message, index) => (
            <div key={index} className="w-full">
              {message.role === "user" ? (
                <UserMessage initials={initials} msg={message.content} />
              ) : (
                <AssistantMessage msg={message.content} />
              )}
            </div>
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

/*
 * UserMessage component for displaying user messages
 * @param initials - User's initials for avatar
 * @param msg - Message content
 */
function UserMessage({ initials, msg }: { initials: string; msg: string }) {
  return (
    <div className="bg-[#0d0d0d] rounded-lg p-4 border border-stone-800">
      <div className="flex items-center p-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 via-green-500 to-purple-500 flex items-center justify-center mr-3">
          <span className="text-white font-bold">{initials}</span>
        </div>
        <p className="text-gray-300 font-medium leading-7">{msg}</p>
      </div>
    </div>
  );
}

/*
 * AssistantMessage component for displaying assistant responses
 * @param msg - Message content
 */
function AssistantMessage({ msg }: { msg: string }) {
  return (
    <div className="bg-[#161616] w-full rounded-lg p-6 border border-stone-800">
      <div className="flex items-center p-3 -mb-4">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 via-pink-500 to-blue-500 flex items-center justify-center mr-4">
          <span className="text-white font-bold">A</span>
        </div>
        <p className="text-gray-300 font-medium">Fireman</p>
      </div>
      <div className="px-4 py-3 w-full text-white leading-8 prose prose-invert max-w-none prose-pre:my-6 prose-pre:mx-0 prose-pre:bg-[#1a1a1a] prose-pre:rounded-md prose-pre:p-5 prose-code:text-blue-300 prose-p:my-5 prose-headings:mb-6 prose-headings:mt-8 prose-li:my-3 prose-ul:pl-8 prose-ol:pl-8 prose-blockquote:border-l-4 prose-blockquote:pl-5 prose-blockquote:my-6">
        <Markdown>{msg}</Markdown>
      </div>
    </div>
  );
}

/*
 * ToolMessage component for displaying tool execution steps
 */
// function ToolMessage() {
//   return (
//     <div className="bg-stone-950 rounded-lg border border-stone-800 overflow-x-hidden">
//       {/* Tool Header */}
//       <div className="w-full border-b h-auto flex justify-between border-stone-800">
//         <p className="font-medium p-8 text-lg">Create Todo Application</p>
//         <div className="h-auto w-24 flex items-center hover:bg-stone-900 justify-center border-l-2 cursor-pointer border-stone-800">
//           <ChevronDown className="size-7" />
//         </div>
//       </div>

//       {/* Tool Content */}
//       <div className="p-8">
//         <ul className="space-y-4">
//           <li>
//             <div className="flex gap-2">
//               <Check className="text-teal-600 w-5 h-5" />
//               <span>Create Initial Files</span>
//             </div>
//           </li>
//           <li>
//             <div className="flex gap-2">
//               <Check className="text-teal-600 w-5 h-5" />
//               <span>Install Dependencies</span>
//             </div>
//           </li>
//           <li>
//             <div className="flex gap-2 flex-col">
//               <div className="flex gap-2">
//                 <ChevronsLeftRightEllipsisIcon className="text-blue-300 w-5 h-5" />
//                 <p>Starting Server</p>
//               </div>
//               <div>
//                 <CodeBlock language="properties" code="php artisan serve" />
//               </div>
//             </div>
//           </li>
//         </ul>
//       </div>
//     </div>
//   );
// }
