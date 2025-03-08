export interface ParsedMessagePart {
  type: "markdown" | "thinking" | "shell" | "file" | "diff";
  content: string;
  path?: string; // Added for file and diff types
}

export const parseMessageContent = (message: string): ParsedMessagePart[] => {
  const result: ParsedMessagePart[] = [];
  let lastIndex = 0;

  // Regular expression for FiremanAction blocks with optional path attribute
  const ACTION_REGEX =
    /<FiremanAction\s+type="(thinking|shell|file|diff)"(?:\s+path="([^"]*)")?\s*>([\s\S]*?)<\/FiremanAction>/g;

  let match;

  while ((match = ACTION_REGEX.exec(message)) !== null) {
    // Add text before the matched tag as markdown
    if (match.index > lastIndex) {
      const textBefore = message.substring(lastIndex, match.index);
      if (textBefore.trim()) {
        result.push({
          type: "markdown",
          content: textBefore,
        });
      }
    }

    // Add the matched action block
    const [_, actionType, path, actionContent] = match;
    result.push({
      type: actionType as "thinking" | "shell" | "file" | "diff",
      content: actionContent.trim(),
      path: path || undefined, // Include path for file and diff types
    });

    // Update lastIndex to the end of this match
    lastIndex = match.index + match[0].length;
  }

  // Add any remaining content after the last match
  if (lastIndex < message.length) {
    const remainingText = message.substring(lastIndex);
    if (remainingText.trim()) {
      result.push({
        type: "markdown",
        content: remainingText,
      });
    }
  }

  return result;
};
