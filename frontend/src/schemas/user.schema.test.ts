import { describe, it, expect } from "vitest";
import { createUserSchema, updateUserSchema } from "./user.schema";

describe("user.schema", () => {
  describe("createUserSchema", () => {
    it("validates valid new user data", () => {
      const result = createUserSchema.safeParse({
        username: "testuser",
        email: "test@example.com",
        password: "password123",
        confirmPassword: "password123",
      });
      expect(result.success).toBe(true);
    });

    it("rejects mismatched passwords", () => {
      const result = createUserSchema.safeParse({
        username: "testuser",
        email: "test@example.com",
        password: "password123",
        confirmPassword: "password999",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Passwords do not match");
      }
    });

    it("rejects short password", () => {
      const result = createUserSchema.safeParse({
        username: "testuser",
        email: "test@example.com",
        password: "123",
        confirmPassword: "123",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Password must be at least 6 characters",
        );
      }
    });
  });

  describe("updateUserSchema", () => {
    it("validates update without changing password", () => {
      const result = updateUserSchema.safeParse({
        username: "updateduser",
        email: "updated@example.com",
        password: "",
        confirmPassword: "",
      });
      expect(result.success).toBe(true);
    });

    it("validates update with new password matching confirm", () => {
      const result = updateUserSchema.safeParse({
        username: "updateduser",
        email: "updated@example.com",
        password: "newsecretpassword",
        confirmPassword: "newsecretpassword",
      });
      expect(result.success).toBe(true);
    });

    it("rejects update when new password does not match confirm", () => {
      const result = updateUserSchema.safeParse({
        username: "updateduser",
        email: "updated@example.com",
        password: "newsecretpassword",
        confirmPassword: "differentpassword",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Passwords do not match");
      }
    });
  });
});
