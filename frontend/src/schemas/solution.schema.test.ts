import { describe, it, expect } from "vitest";
import { solutionCreateSchema } from "./solution.schema";

describe("solution.schema", () => {
  it("validates valid solution data", () => {
    const result = solutionCreateSchema.safeParse({
      title: "AI RAG Platform",
      description: "Enterprise search",
      category_ids: ["cat-1"],
      lead_id: "user-1",
      repository_url: "https://github.com/org/repo",
      preview_url: "https://demo.example.com",
      thumbnail_url: "https://example.com/banner.png",
      tech_stack: ["React", "Python"],
      key_capabilities: [{ name: "Fast Search", description: "< 50ms" }],
      service_urls: [
        {
          service_name: "API",
          service_type: "REST API",
          environment: "Production",
          target_url: "https://api.example.com",
        },
      ],
      documents: [
        {
          name: "Architecture Spec",
          format: "PDF",
          file_url: "https://docs.example.com/spec.pdf",
          description: "Full blueprint",
        },
      ],
      videos: [
        {
          title: "Demo Walkthrough",
          video_url: "https://youtube.com/watch?v=123",
          description: "Video tutorial",
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("fails when title is missing", () => {
    const result = solutionCreateSchema.safeParse({
      title: "",
      description: "Valid description here",
      category_ids: ["cat-1"],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Title is missing (minimum 2 words required)",
      );
    }
  });

  it("fails when title has less than 2 words", () => {
    const result = solutionCreateSchema.safeParse({
      title: "Solitary",
      description: "Valid description here",
      category_ids: ["cat-1"],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Title is too short (minimum 2 words required, e.g. 'Enterprise Search')",
      );
    }
  });

  it("fails when description is missing", () => {
    const result = solutionCreateSchema.safeParse({
      title: "Valid Title",
      description: "",
      category_ids: ["cat-1"],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Description is missing (minimum 10 characters required)",
      );
    }
  });

  it("fails when description is too short", () => {
    const result = solutionCreateSchema.safeParse({
      title: "Valid Title",
      description: "Short",
      category_ids: ["cat-1"],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Description is too short (minimum 10 characters required)",
      );
    }
  });

  it("fails when category_ids is empty", () => {
    const result = solutionCreateSchema.safeParse({
      title: "Valid Title",
      description: "Valid description here",
      category_ids: [],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Please select at least 1 domain category",
      );
    }
  });

  it("fails when tech_stack is empty", () => {
    const result = solutionCreateSchema.safeParse({
      title: "Valid Title",
      description: "Valid description here",
      category_ids: ["cat-1"],
      tech_stack: [],
      key_capabilities: [{ name: "Search", description: "Fast search" }],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Please select or add at least 1 technology or framework",
      );
    }
  });

  it("fails when key_capabilities is empty", () => {
    const result = solutionCreateSchema.safeParse({
      title: "Valid Title",
      description: "Valid description here",
      category_ids: ["cat-1"],
      tech_stack: ["React"],
      key_capabilities: [],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Please add at least 1 key capability",
      );
    }
  });

  it("fails when key capability title or description is missing", () => {
    const result = solutionCreateSchema.safeParse({
      title: "Valid Title",
      description: "Valid description here",
      category_ids: ["cat-1"],
      tech_stack: ["React"],
      key_capabilities: [{ name: "", description: "" }],
    });
    expect(result.success).toBe(false);
  });

  it("fails when repository_url is an invalid URL format", () => {
    const result = solutionCreateSchema.safeParse({
      title: "Valid Title",
      description: "Valid description here",
      category_ids: ["cat-1"],
      tech_stack: ["React"],
      key_capabilities: [{ name: "Search", description: "Fast search" }],
      repository_url: "not-a-valid-url",
    });
    expect(result.success).toBe(false);
  });

  it("accepts empty optional URLs", () => {
    const result = solutionCreateSchema.safeParse({
      title: "Valid Title",
      description: "Valid description here",
      category_ids: ["cat-1"],
      tech_stack: ["React"],
      key_capabilities: [{ name: "Search", description: "Fast search" }],
      repository_url: "",
      preview_url: "",
      thumbnail_url: "",
    });
    expect(result.success).toBe(true);
  });
});
