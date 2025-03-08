"use client";
import { useState } from "react";
import { MessagePartProps } from "./MessagePart";
import { Clipboard, ClipboardCheck } from "lucide-react";
import hljs from "highlight.js";
import "highlight.js/styles/vs2015.css";

export function ShellCommandBlock({
  content,
  className = "",
}: MessagePartProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Highlight the code using highlight.js
  const highlightedCode = hljs.highlight(content, {
    language: "properties",
  }).value;

  return (
    <div
      className={`bg-stone-800 border-stone-800 border rounded-lg my-4 overflow-hidden ${className}`}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-stone-800">
        <span className="text-gray-300 text-sm">Shell Command</span>
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
      <pre className="p-4 overflow-x-auto text-gray-300 text-sm whitespace-pre-wrap bg-stone-900">
        <code dangerouslySetInnerHTML={{ __html: highlightedCode }}></code>
      </pre>
    </div>
  );
}
