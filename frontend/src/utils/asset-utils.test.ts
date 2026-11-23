import { describe, it, expect } from "vitest";
import {
  detectAssetType,
  formatDuration,
  normalizeDocumentToAsset,
  normalizeVideoToAsset,
  normalizeSolutionAssets,
} from "./asset-utils";
import type { SolutionDocument, SolutionVideo } from "@/types/solution.types";

describe("asset-utils", () => {
  describe("detectAssetType", () => {
    it("detects image formats correctly", () => {
      expect(detectAssetType("PNG")).toBe("image");
      expect(detectAssetType("jpg")).toBe("image");
      expect(detectAssetType("SVG")).toBe("image");
      expect(detectAssetType("webp")).toBe("image");
    });

    it("detects video formats correctly", () => {
      expect(detectAssetType("mp4")).toBe("video");
      expect(detectAssetType("webm")).toBe("video");
      expect(detectAssetType("mov")).toBe("video");
      expect(
        detectAssetType("", "https://www.youtube.com/watch?v=dQw4w9WgXcQ"),
      ).toBe("video");
    });

    it("detects document and spreadsheet formats correctly", () => {
      expect(detectAssetType("pdf")).toBe("document");
      expect(detectAssetType("docx")).toBe("document");
      expect(detectAssetType("xlsx")).toBe("document");
    });

    it("falls back to other for unknown types", () => {
      expect(detectAssetType("zip")).toBe("other");
      expect(detectAssetType("bin")).toBe("other");
    });
  });

  describe("formatDuration", () => {
    it("formats seconds to MM:SS and HH:MM:SS", () => {
      expect(formatDuration(65)).toBe("1:05");
      expect(formatDuration(3665)).toBe("1:01:05");
      expect(formatDuration(0)).toBe("0:00");
      expect(formatDuration(null)).toBe("");
    });
  });

  describe("normalizeSolutionAssets", () => {
    const mockDoc: SolutionDocument = {
      id: "doc-1",
      name: "Architecture Diagram.png",
      description: null,
      format: "PNG",
      file_url: "https://example.com/arch.png",
      file_size_bytes: 1048576,
      uploaded_at: new Date().toISOString(),
    };

    const mockVideo: SolutionVideo = {
      id: "vid-1",
      title: "Product Walkthrough",
      description: null,
      thumbnail_url: null,
      video_url: "https://example.com/demo.mp4",
      duration_seconds: 180,
      created_at: new Date().toISOString(),
    };

    it("normalizes a document into SolutionAsset", () => {
      const asset = normalizeDocumentToAsset(mockDoc);
      expect(asset.id).toBe("doc-1");
      expect(asset.name).toBe("Architecture Diagram.png");
      expect(asset.type).toBe("image");
      expect(asset.format).toBe("PNG");
      expect(asset.file_size_bytes).toBe(1048576);
      expect(asset.thumbnail_url).toBe("https://example.com/arch.png");
    });

    it("normalizes a video into SolutionAsset", () => {
      const asset = normalizeVideoToAsset(mockVideo);
      expect(asset.id).toBe("vid-1");
      expect(asset.name).toBe("Product Walkthrough");
      expect(asset.type).toBe("video");
      expect(asset.format).toBe("MP4");
      expect(asset.duration_seconds).toBe(180);
    });

    it("combines both documents and videos into a single normalized array", () => {
      const assets = normalizeSolutionAssets([mockDoc], [mockVideo]);
      expect(assets).toHaveLength(2);
      expect(assets[0].name).toBe("Architecture Diagram.png");
      expect(assets[1].name).toBe("Product Walkthrough");
    });
  });
});
