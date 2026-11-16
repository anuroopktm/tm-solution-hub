import { describe, it, expect } from "vitest";
import { formatFileSize, formatDuration } from "./formatters";

describe("formatFileSize", () => {
  it("returns empty string for null, undefined, or 0", () => {
    expect(formatFileSize(null)).toBe("");
    expect(formatFileSize(undefined)).toBe("");
    expect(formatFileSize(0)).toBe("");
  });

  it("formats bytes correctly", () => {
    expect(formatFileSize(500)).toBe("500 B");
    expect(formatFileSize(1023)).toBe("1023 B");
  });

  it("formats kilobytes correctly", () => {
    expect(formatFileSize(1024)).toBe("1.0 KB");
    expect(formatFileSize(15360)).toBe("15 KB");
  });

  it("formats megabytes correctly", () => {
    expect(formatFileSize(1024 * 1024)).toBe("1.0 MB");
    expect(formatFileSize(25 * 1024 * 1024)).toBe("25 MB");
  });

  it("formats gigabytes correctly", () => {
    expect(formatFileSize(2 * 1024 * 1024 * 1024)).toBe("2.0 GB");
  });
});

describe("formatDuration", () => {
  it("returns empty string for null, undefined, or 0", () => {
    expect(formatDuration(null)).toBe("");
    expect(formatDuration(undefined)).toBe("");
    expect(formatDuration(0)).toBe("");
  });

  it("formats seconds with zero-padding", () => {
    expect(formatDuration(5)).toBe("0:05");
    expect(formatDuration(45)).toBe("0:45");
  });

  it("formats minutes and seconds correctly", () => {
    expect(formatDuration(60)).toBe("1:00");
    expect(formatDuration(75)).toBe("1:15");
    expect(formatDuration(630)).toBe("10:30");
  });
});
