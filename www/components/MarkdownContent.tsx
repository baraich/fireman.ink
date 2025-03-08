"use client";
import { useEffect, useState } from "react";
import { MessagePartProps } from "./MessagePart";
import { markdownToHtml } from "@/utils/markdown";

export function MarkdownContent({ content, className = "" }: MessagePartProps) {
  const [htmlContent, setHtmlContent] = useState("");

  useEffect(() => {
    const processContent = async () => {
      const html = await markdownToHtml(content);
      setHtmlContent(html);
    };

    processContent();
  }, [content]);

  return (
    <div
      className={`prose prose-invert max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}
