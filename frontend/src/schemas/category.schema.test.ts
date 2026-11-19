import { describe, it, expect } from "vitest";
import { categorySchema } from "./category.schema";

describe("category.schema", () => {
  it("validates valid category data with all mandatory fields", () => {
    const result = categorySchema.safeParse({
      name: "Machine Learning",
      description: "AI & ML models",
      icon: "Brain",
    });
    expect(result.success).toBe(true);
  });

  it("requires a category name", () => {
    const result = categorySchema.safeParse({
      name: "",
      description: "Description",
      icon: "Brain",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Category name is required");
    }
  });

  it("requires a description", () => {
    const result = categorySchema.safeParse({
      name: "Category",
      description: "",
      icon: "Brain",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Description is required");
    }
  });

  it("requires an icon", () => {
    const result = categorySchema.safeParse({
      name: "Category",
      description: "Description",
      icon: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Icon is required");
    }
  });
});
