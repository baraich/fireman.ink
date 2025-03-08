"use client";

import { useState } from "react";
import { MessagePartProps } from "./MessagePart";
import hljs from "highlight.js";
import "highlight.js/styles/vs2015.css";

export function DiffBlock({
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

  const fileName = path.split("/").pop() || "";

  // Highlight the diff using highlight.js
  const highlightedDiff = hljs.highlight(content, { language: "diff" }).value;

  return (
    <div
      className={`bg-[#1E1E1E] rounded-lg my-4 overflow-hidden ${className}`}
    >
      <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-stone-700">
        <div className="flex items-center">
          <span className="text-gray-300 text-sm font-medium">
            Changes to {fileName}
          </span>
          <span className="text-gray-500 text-xs ml-2">{path}</span>
        </div>
        <button
          onClick={handleCopy}
          className="text-gray-400 hover:text-white transition-colors text-sm"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <div className="p-4 bg-[#1E1E1E] overflow-x-auto">
        <pre className="text-sm">
          <code
            className="language-diff"
            dangerouslySetInnerHTML={{ __html: highlightedDiff }}
          />
        </pre>
      </div>
    </div>
  );
}
