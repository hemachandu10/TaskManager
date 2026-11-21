import { describe, it, expect } from "vitest";
import { validateTaskInput } from "@/lib/task-utils";
import { extractHostname, isValidHttpUrl } from "@/lib/utils";

describe("URL and Task Input Validation", () => {
  describe("isValidHttpUrl", () => {
    it("should accept valid http and https URLs", () => {
      expect(isValidHttpUrl("https://leetcode.com/problems/two-sum/")).toBe(true);
      expect(isValidHttpUrl("http://example.com")).toBe(true);
      expect(isValidHttpUrl("https://nextjs.org/docs/app")).toBe(true);
      expect(extractHostname("https://leetcode.com/problems/two-sum/")).toBe("leetcode.com");
    });

    it("should reject dangerous or non-http protocols", () => {
      expect(isValidHttpUrl("javascript:alert(1)")).toBe(false);
      expect(isValidHttpUrl("data:text/html,<h1>Hello</h1>")).toBe(false);
      expect(isValidHttpUrl("file:///etc/passwd")).toBe(false);
      expect(isValidHttpUrl("ftp://example.com/file.zip")).toBe(false);
      expect(isValidHttpUrl("not-a-valid-url")).toBe(false);
    });
  });

  describe("validateTaskInput", () => {
    it("should succeed with a valid title", () => {
      const res = validateTaskInput({ title: "Solve Binary Search" });
      expect(res.valid).toBe(true);
      expect(res.errors).toEqual({});
    });

    it("should fail when title is missing or empty", () => {
      const res1 = validateTaskInput({ title: "" });
      expect(res1.valid).toBe(false);
      expect(res1.errors.title).toBeDefined();

      const res2 = validateTaskInput({ title: "   " });
      expect(res2.valid).toBe(false);
    });

    it("should fail when title exceeds 300 characters", () => {
      const longTitle = "A".repeat(301);
      const res = validateTaskInput({ title: longTitle });
      expect(res.valid).toBe(false);
      expect(res.errors.title).toContain("cannot exceed 300 characters");
    });

    it("should reject invalid URL schemes inside task payload", () => {
      const res = validateTaskInput({
        title: "Malicious Task",
        url: "javascript:evil()",
      });
      expect(res.valid).toBe(false);
      expect(res.errors.url).toBeDefined();
    });

    it("should validate priority and status values", () => {
      const invalidPriority = validateTaskInput({
        title: "Valid",
        priority: "super-urgent" as any,
      });
      expect(invalidPriority.valid).toBe(false);

      const invalidStatus = validateTaskInput({
        title: "Valid",
        status: "in-review" as any,
      });
      expect(invalidStatus.valid).toBe(false);
    });
  });
});
