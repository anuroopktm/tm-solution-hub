import type {
  Conversation,
  GroupedConversations,
  HistoryDateGroup,
} from "../types/chat.types";

/**
 * Group conversations by date: Today, Yesterday, Previous 7 days, Older.
 */
export function groupConversationsByDate(
  conversations: Conversation[],
): GroupedConversations[] {
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  const oneDayMs = 24 * 60 * 60 * 1000;
  const startOfYesterday = startOfToday - oneDayMs;
  const startOfSevenDays = startOfToday - 7 * oneDayMs;

  const buckets: Record<HistoryDateGroup, Conversation[]> = {
    Today: [],
    Yesterday: [],
    "Previous 7 days": [],
    Older: [],
  };

  const sorted = [...conversations].sort(
    (a, b) =>
      new Date(b.updatedAt || b.createdAt).getTime() -
      new Date(a.updatedAt || a.createdAt).getTime(),
  );

  for (const conv of sorted) {
    const timestamp = new Date(conv.updatedAt || conv.createdAt).getTime();

    if (timestamp >= startOfToday) {
      buckets["Today"].push(conv);
    } else if (timestamp >= startOfYesterday) {
      buckets["Yesterday"].push(conv);
    } else if (timestamp >= startOfSevenDays) {
      buckets["Previous 7 days"].push(conv);
    } else {
      buckets["Older"].push(conv);
    }
  }

  const order: HistoryDateGroup[] = [
    "Today",
    "Yesterday",
    "Previous 7 days",
    "Older",
  ];

  return order
    .filter((group) => buckets[group].length > 0)
    .map((group) => ({
      group,
      items: buckets[group],
    }));
}

export interface MarkdownBlock {
  type: "code" | "paragraph" | "heading" | "list";
  language?: string;
  content: string;
  level?: number;
  items?: string[];
}

/**
 * Lightweight, robust parser that splits markdown content into structured blocks
 * for rendering (fenced code blocks, headings, lists, and text paragraphs).
 */
export function parseMarkdownBlocks(text: string): MarkdownBlock[] {
  if (!text) return [];

  const blocks: MarkdownBlock[] = [];
  const lines = text.split("\n");

  let inCodeBlock = false;
  let codeLanguage = "";
  let codeLines: string[] = [];
  let currentParagraphLines: string[] = [];
  let currentListItems: string[] = [];

  const flushParagraph = () => {
    if (currentParagraphLines.length > 0) {
      blocks.push({
        type: "paragraph",
        content: currentParagraphLines.join("\n").trim(),
      });
      currentParagraphLines = [];
    }
  };

  const flushList = () => {
    if (currentListItems.length > 0) {
      blocks.push({
        type: "list",
        items: [...currentListItems],
        content: currentListItems.join("\n"),
      });
      currentListItems = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check for fenced code block toggle ```language
    if (trimmed.startsWith("```")) {
      if (inCodeBlock) {
        // End code block
        blocks.push({
          type: "code",
          language: codeLanguage || "text",
          content: codeLines.join("\n"),
        });
        inCodeBlock = false;
        codeLanguage = "";
        codeLines = [];
      } else {
        // Start code block
        flushParagraph();
        flushList();
        inCodeBlock = true;
        codeLanguage = trimmed.slice(3).trim();
        codeLines = [];
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    // Heading lines (# Heading, ## Heading, ### Heading)
    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      flushParagraph();
      flushList();
      blocks.push({
        type: "heading",
        level: headingMatch[1].length,
        content: headingMatch[2].trim(),
      });
      continue;
    }

    // Bullet list items (* item, - item, or numbered 1. item)
    const listMatch = line.match(/^(\*|-|\d+\.)\s+(.*)$/);
    if (listMatch) {
      flushParagraph();
      currentListItems.push(listMatch[2].trim());
      continue;
    }

    // Empty line separates blocks
    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    // Otherwise, normal paragraph line
    flushList();
    currentParagraphLines.push(line);
  }

  // Handle unclosed code block (e.g. streaming halfway through a code block)
  if (inCodeBlock) {
    blocks.push({
      type: "code",
      language: codeLanguage || "text",
      content: codeLines.join("\n"),
    });
  }

  flushParagraph();
  flushList();

  return blocks;
}
