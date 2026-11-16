import { describe, it, expect } from "vitest";
import {
  getFileExtension,
  getMediaType,
  isVideoUrl,
  isGifUrl,
  isImageUrl,
} from "./media";

describe("getFileExtension", () => {
  it("returns empty string for null, undefined, or empty values", () => {
    expect(getFileExtension(null)).toBe("");
    expect(getFileExtension(undefined)).toBe("");
    expect(getFileExtension("")).toBe("");
  });

  it("extracts extension from simple URL", () => {
    expect(getFileExtension("https://example.com/asset.mp4")).toBe("mp4");
    expect(getFileExtension("/assets/demo.GIF")).toBe("gif");
  });

  it("strips query parameters and hashes", () => {
    expect(
      getFileExtension(
        "https://s3.amazonaws.com/demos/test.webm?token=123&exp=456",
      ),
    ).toBe("webm");
    expect(getFileExtension("https://example.com/preview.png#t=10")).toBe(
      "png",
    );
    expect(
      getFileExtension("https://example.com/preview.gif?param=foo#hash=bar"),
    ).toBe("gif");
  });

  it("handles paths without extensions or trailing dots", () => {
    expect(getFileExtension("https://example.com/path/without/ext")).toBe("");
    expect(getFileExtension("https://example.com/path/trailing.")).toBe("");
  });
});

describe("getMediaType", () => {
  it("classifies video formats", () => {
    expect(getMediaType("https://cdn.example.com/video.mp4")).toBe("video");
    expect(getMediaType("https://cdn.example.com/video.webm")).toBe("video");
    expect(getMediaType("https://cdn.example.com/video.ogg")).toBe("video");
    expect(getMediaType("https://cdn.example.com/video.mov")).toBe("video");
  });

  it("classifies gif format", () => {
    expect(getMediaType("https://cdn.example.com/animation.gif")).toBe("gif");
    expect(getMediaType("https://cdn.example.com/animation.GIF?sig=test")).toBe(
      "gif",
    );
  });

  it("classifies static image formats", () => {
    expect(getMediaType("https://cdn.example.com/photo.jpg")).toBe("image");
    expect(getMediaType("https://cdn.example.com/photo.jpeg")).toBe("image");
    expect(getMediaType("https://cdn.example.com/photo.png")).toBe("image");
    expect(getMediaType("https://cdn.example.com/photo.webp")).toBe("image");
    expect(getMediaType("https://cdn.example.com/photo.svg")).toBe("image");
    expect(getMediaType("https://cdn.example.com/photo.avif")).toBe("image");
  });

  it("returns unknown for unhandled or missing types", () => {
    expect(getMediaType("https://cdn.example.com/doc.pdf")).toBe("unknown");
    expect(getMediaType(null)).toBe("unknown");
    expect(getMediaType(undefined)).toBe("unknown");
  });
});

describe("type helper predicates", () => {
  it("isVideoUrl", () => {
    expect(isVideoUrl("https://example.com/clip.mp4")).toBe(true);
    expect(isVideoUrl("https://example.com/clip.png")).toBe(false);
  });

  it("isGifUrl", () => {
    expect(isGifUrl("https://example.com/anim.gif")).toBe(true);
    expect(isGifUrl("https://example.com/anim.mp4")).toBe(false);
  });

  it("isImageUrl", () => {
    expect(isImageUrl("https://example.com/pic.webp")).toBe(true);
    expect(isImageUrl("https://example.com/anim.gif")).toBe(true);
    expect(isImageUrl("https://example.com/clip.mp4")).toBe(false);
  });
});
