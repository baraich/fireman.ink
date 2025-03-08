"use client";
import { useEffect, useState } from "react";
import { MessagePartProps } from "./MessagePart";
import { markdownToHtml } from "@/utils/markdown";

export function ThinkingBlock({ content, className = "" }: MessagePartProps) {
  const [htmlContent, setHtmlContent] = useState("");

  useEffect(() => {
    const processContent = async () => {
      const html = await markdownToHtml(content);
      setHtmlContent(html);
    };

    processContent();
  }, [content]);

  return (
    <div className={`bg-stone-800 rounded-lg p-4 my-4 ${className}`}>
      <div className="flex items-center mb-2">
        {/* <div className="w-5 h-5 rounded-full bg-blue-500 mr-2 flex items-center justify-center">
          <span className="text-white text-xs">💭</span>
        </div> */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 via-pink-500 to-blue-500 flex items-center justify-center mr-4">
          <span className="text-white font-bold">A</span>
        </div>
        <span className="text-gray-300 text-sm font-medium">Fireman</span>
      </div>
      <div
        className="text-gray-300 prose prose-invert prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </div>
  );
}
