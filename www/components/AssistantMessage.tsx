"use client";
import { ReactNode, useEffect, useState } from "react";
import ShellAction from "./ShellAction";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";

/**
 * AssistantMessage component for displaying assistant responses with custom action blocks
 * @param msg - Message content that may contain markdown and FiremanAction tags
 */
export function AssistantMessage({ msg }: { msg: string }) {
  const [content, setContent] = useState<ReactNode[]>([]);

  // Regular expression to match FiremanAction tags
  const FIREMAN_ACTION_REGEX =
    /<FiremanAction(\b[^>]*)>([\s\S]*?)<\/FiremanAction>/g;

  // Parse attributes from the FiremanAction tag
  const parseActionAttributes = (
    attributesString: string
  ): Record<string, string> => {
    if (!attributesString.trim()) return {};

    return attributesString
      .trim()
      .split(/\s+/)
      .reduce((acc: Record<string, string>, attr: string) => {
        // Handle attributes in format name="value"
        const match = attr.match(/([^=]+)="([^"]*)"/);
        if (match) {
          acc[match[1]] = match[2];
        }
        return acc;
      }, {});
  };

  // Convert markdown string to HTML
  const markdownToHtml = async (markdown: string): Promise<string> => {
    const result = await unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(rehypeStringify)
      .process(markdown);

    return result.toString();
  };

  // Process the message content
  const processContent = async () => {
    const result: ReactNode[] = [];
    let lastIndex = 0;
    let match;

    // Reset regex lastIndex to ensure we start from the beginning
    FIREMAN_ACTION_REGEX.lastIndex = 0;

    // Find all FiremanAction tags
    while ((match = FIREMAN_ACTION_REGEX.exec(msg)) !== null) {
      // Add text before the matched tag as markdown
      if (match.index > lastIndex) {
        const textBefore = msg.substring(lastIndex, match.index);
        if (textBefore.trim()) {
          const htmlContent = await markdownToHtml(textBefore);
          result.push(
            <div
              key={`md-${lastIndex}`}
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          );
        }
      }

      // Extract and process the FiremanAction
      const [fullMatch, attributesString, actionContent] = match;
      const attributes = parseActionAttributes(attributesString);

      // Render the appropriate action component based on type
      if (attributes.type === "shell") {
        result.push(
          <ShellAction key={`action-${match.index}`}>
            {actionContent.replace(/^(\s+|\\n)/g, "")}
          </ShellAction>
        );
      }

      // Update lastIndex to the end of this match
      lastIndex = match.index + fullMatch.length;
    }

    // Add any remaining content after the last match
    if (lastIndex < msg.length) {
      const remainingText = msg.substring(lastIndex);
      if (remainingText.trim()) {
        const htmlContent = await markdownToHtml(remainingText);
        result.push(
          <div
            key={`md-end`}
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        );
      }
    }

    setContent(result);
  };

  useEffect(() => {
    processContent();
  }, [msg]);

  return (
    <div className="bg-[#161616] w-full rounded-lg p-6 border border-stone-800">
      <div className="flex items-center p-3 -mb-4">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 via-pink-500 to-blue-500 flex items-center justify-center mr-4">
          <span className="text-white font-bold">A</span>
        </div>
        <p className="text-gray-300 font-medium">Fireman</p>
      </div>
      <div className="px-4 py-3 w-full text-white leading-8 prose prose-invert max-w-none prose-pre:m-0 prose-p:my-5 prose-headings:mb-6 prose-headings:mt-8 prose-li:my-3 prose-ul:pl-8 prose-ol:pl-8 prose-blockquote:border-l-4 prose-blockquote:pl-5 prose-blockquote:my-6">
        {content}
      </div>
    </div>
  );
}
