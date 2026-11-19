import { describe, it, expect } from "vitest";
import {
  groupConversationsByDate,
  parseMarkdownBlocks,
} from "./chat-formatters";
import type { Conversation } from "../types/chat.types";

describe("groupConversationsByDate", () => {
  it("groups conversations into Today, Yesterday, and Older correctly", () => {
    const now = new Date();
    const todayIso = new Date(now.getTime() - 1000 * 60 * 30).toISOString(); // 30 mins ago
    const yesterdayIso = new Date(
      now.getTime() - 1000 * 60 * 60 * 26,
    ).toISOString(); // 26 hrs ago
    const olderIso = new Date(
      now.getTime() - 1000 * 60 * 60 * 24 * 14,
    ).toISOString(); // 14 days ago

    const convs: Conversation[] = [
      { id: "1", title: "Conv 1", createdAt: todayIso, updatedAt: todayIso },
      {
        id: "2",
        title: "Conv 2",
        createdAt: yesterdayIso,
        updatedAt: yesterdayIso,
      },
      { id: "3", title: "Conv 3", createdAt: olderIso, updatedAt: olderIso },
    ];

    const grouped = groupConversationsByDate(convs);
    expect(grouped.length).toBeGreaterThanOrEqual(2);

    const todayGroup = grouped.find((g) => g.group === "Today");
    expect(todayGroup?.items[0].id).toBe("1");

    const olderGroup = grouped.find((g) => g.group === "Older");
    expect(olderGroup?.items[0].id).toBe("3");
  });
});

describe("parseMarkdownBlocks", () => {
  it("parses headings, paragraphs, lists, and code blocks", () => {
    const text = `
### Overview
This is a test paragraph.

- Item 1
- Item 2

\`\`\`typescript
const x: number = 42;
\`\`\`
`;
    const blocks = parseMarkdownBlocks(text);
    expect(blocks.length).toBe(4);
    expect(blocks[0].type).toBe("heading");
    expect(blocks[0].content).toBe("Overview");
    expect(blocks[1].type).toBe("paragraph");
    expect(blocks[2].type).toBe("list");
    expect(blocks[2].items).toEqual(["Item 1", "Item 2"]);
    expect(blocks[3].type).toBe("code");
    expect(blocks[3].language).toBe("typescript");
    expect(blocks[3].content).toBe("const x: number = 42;");
  });
});
