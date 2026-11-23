import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import {
  SolutionAssetItem,
  SolutionAssetList,
  SolutionAssetsCard,
  SolutionAssetPreviewDialog,
  AssetPreview,
} from "./index";
import type { SolutionAsset } from "@/types/solution-asset.types";

afterEach(cleanup);

const mockAssets: SolutionAsset[] = [
  {
    id: "asset-1",
    name: "System Architecture.png",
    type: "image",
    format: "PNG",
    file_url: "https://example.com/arch.png",
    file_size_bytes: 820000,
  },
  {
    id: "asset-2",
    name: "Platform Whitepaper.pdf",
    type: "document",
    format: "PDF",
    file_url: "https://example.com/paper.pdf",
    file_size_bytes: 2500000,
  },
  {
    id: "asset-3",
    name: "Demo Walkthrough.mp4",
    type: "video",
    format: "MP4",
    file_url: "https://example.com/demo.mp4",
    duration_seconds: 125,
  },
];

describe("Centralized Solution Assets Components", () => {
  it("renders SolutionAssetItem with title, format badge, and size", () => {
    const handlePreview = vi.fn();
    render(
      <SolutionAssetItem asset={mockAssets[0]} onPreview={handlePreview} />,
    );

    expect(screen.getByText("System Architecture.png")).toBeInTheDocument();
    expect(screen.getByText(/801 KB/i)).toBeInTheDocument();

    const trigger = screen.getByRole("button", {
      name: "Preview System Architecture.png",
    });
    fireEvent.click(trigger);
    expect(handlePreview).toHaveBeenCalledWith(mockAssets[0]);
  });

  it("renders SolutionAssetList with hybrid layout (media at top, documents below)", () => {
    render(<SolutionAssetList assets={mockAssets} />);

    // All items should be present on page at once without needing tabs
    expect(screen.getByText("System Architecture.png")).toBeInTheDocument();
    expect(screen.getByText("Platform Whitepaper.pdf")).toBeInTheDocument();
    expect(screen.getByText("Demo Walkthrough.mp4")).toBeInTheDocument();

    // Section headers should identify the groups
    expect(
      screen.getByText(/Media, Architecture & Demos/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Documents & Files/i)).toBeInTheDocument();
  });

  it("renders pure grid layout when layout='grid'", () => {
    const { container } = render(
      <SolutionAssetList assets={mockAssets} layout="grid" />,
    );

    expect(screen.getByText("System Architecture.png")).toBeInTheDocument();
    expect(screen.getByText("Platform Whitepaper.pdf")).toBeInTheDocument();
    expect(screen.getByText("Demo Walkthrough.mp4")).toBeInTheDocument();

    const group = container.querySelector('[data-slot="attachment-group"]');
    expect(group).toBeInTheDocument();
  });

  it("renders SolutionAssetsCard with card header and item count", () => {
    render(<SolutionAssetsCard assets={mockAssets} />);

    expect(screen.getByText("Solution Assets & Media")).toBeInTheDocument();
    expect(screen.getByText("3 items")).toBeInTheDocument();
  });

  it("routes to appropriate viewer in AssetPreview", () => {
    // Image
    const { rerender } = render(<AssetPreview asset={mockAssets[0]} />);
    expect(
      screen.getByRole("img", { name: "System Architecture.png" }),
    ).toBeInTheDocument();

    // Document (PDF)
    rerender(<AssetPreview asset={mockAssets[1]} />);
    expect(
      screen.getByRole("button", { name: /Download PDF/i }),
    ).toBeInTheDocument();

    // Video
    rerender(<AssetPreview asset={mockAssets[2]} />);
    expect(screen.getByText(/Duration/i)).toBeInTheDocument();
    expect(screen.getByText("2:05")).toBeInTheDocument();
  });

  it("opens SolutionAssetPreviewDialog with asset title and metadata", () => {
    render(
      <SolutionAssetPreviewDialog
        open={true}
        onOpenChange={vi.fn()}
        asset={mockAssets[0]}
      />,
    );

    expect(screen.getByText("System Architecture.png")).toBeInTheDocument();
    expect(screen.getByText(/801 KB/i)).toBeInTheDocument();
  });
});
