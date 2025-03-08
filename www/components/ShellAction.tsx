"use client";
import { ReactNode, useState } from "react";
import { Clipboard, CheckCircle, Terminal } from "lucide-react";
import hljs from "highlight.js/lib/core";

export default function ShellAction({ children }: { children: ReactNode }) {
  const [copied, setCopied] = useState(false);

  // Handle copy to clipboard functionality
  const copyToClipboard = async () => {
    if (typeof children === "string") {
      await navigator.clipboard.writeText(children.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="my-4 rounded-md overflow-hidden border-stone-700 border-2">
      {/* Header with type indicator */}
      <div className="bg-stone-800 p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal size={16} className="text-blue-400" />
          <span className="text-sm font-medium text-gray-200">
            Shell Command
          </span>
        </div>
        <button
          onClick={copyToClipboard}
          className="flex items-center text-gray-400 hover:text-white transition-colors"
          aria-label="Copy to clipboard"
        >
          {copied ? (
            <CheckCircle size={16} className="text-blue-400" />
          ) : (
            <Clipboard size={16} />
          )}
        </button>
      </div>

      {/* Command content with syntax highlighting */}
      <div className="overflow-x-auto">
        <div
          dangerouslySetInnerHTML={{
            __html: hljs.highlight(children!.toString(), {
              language: "properties",
            }).value,
          }}
          className="code p-4"
        ></div>
      </div>
    </div>
  );
}
