"use client";

import { useState } from "react";
import { MessagePartProps } from "./MessagePart";
import hljs from "highlight.js";
import "highlight.js/styles/vs2015.css";
import { Clipboard, ClipboardCheck } from "lucide-react";

export function FileBlock({
  content,
  path = "",
  className = "",
}: MessagePartProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simple language detection based on file extension
  const language = path.endsWith(".blade.php")
    ? "blade"
    : path.endsWith(".php")
    ? "php"
    : "plaintext";

  const fileName = path.split("/").pop() || "";

  // Highlight the code using highlight.js
  const highlightedCode = hljs.highlight(content, { language }).value;

  return (
    <div
      className={`bg-[#1E1E1E] rounded-lg my-4 overflow-hidden ${className}`}
    >
      <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-stone-700">
        <div className="flex items-center file-details w-full justify-evenly gap-4">
          <p className="text-gray-300 truncate w-full text-sm font-medium">
            {fileName}
          </p>
          <p className="text-gray-500 flex truncate text-xs mr-2">{path}</p>
        </div>
        <button
          onClick={handleCopy}
          className="text-gray-400 hover:text-white transition-colors text-sm"
        >
          {copied ? (
            <ClipboardCheck className="size-4" />
          ) : (
            <Clipboard className="size-4" />
          )}
        </button>
      </div>
      <div className="p-4 bg-[#1E1E1E] overflow-x-auto no-scrollbar">
        <pre className="text-sm">
          <code
            className={`language-${language}`}
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
          />
        </pre>
      </div>
    </div>
  );
}
