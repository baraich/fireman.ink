"use client";
import { useEffect, useState } from "react";
import { MarkdownContent } from "./MarkdownContent";
import { ThinkingBlock } from "./ThinkingBlock";
import { parseMessageContent, ParsedMessagePart } from "../utils/messageParser";
import { ShellCommandBlock } from "./ShellCommand";
import { FileBlock } from "./FileBlock";
import { DiffBlock } from "./DiffBlock";

export function AssistantMessage({ msg }: { msg: string }) {
  const [parts, setParts] = useState<ParsedMessagePart[]>([]);

  useEffect(() => {
    // Parse the message into different parts
    const messageParts = parseMessageContent(msg);
    setParts(messageParts);
  }, [msg]);

  return (
    <div className="w-full text-white">
      {parts.map((part, index) => {
        switch (part.type) {
          case "markdown":
            return (
              <MarkdownContent key={`md-${index}`} content={part.content} />
            );
          case "thinking":
            return (
              <ThinkingBlock key={`thinking-${index}`} content={part.content} />
            );
          case "shell":
            return (
              <ShellCommandBlock
                key={`shell-${index}`}
                content={part.content}
              />
            );
          case "file":
            return (
              <FileBlock
                key={`file-${index}`}
                content={part.content}
                path={part.path}
              />
            );
          case "diff":
            return (
              <DiffBlock
                key={`diff-${index}`}
                content={part.content}
                path={part.path}
              />
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
