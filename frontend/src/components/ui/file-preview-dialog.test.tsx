import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { FilePreviewDialog } from "./file-preview-dialog";

describe("FilePreviewDialog", () => {
  it("renders nothing when closed or file is null", () => {
    const { container } = render(
      <FilePreviewDialog open={false} onOpenChange={() => {}} file={null} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders image preview dialog with header and zoom controls", () => {
    const onOpenChange = vi.fn();
    render(
      <FilePreviewDialog
        open={true}
        onOpenChange={onOpenChange}
        file={{
          name: "Architecture Diagram",
          url: "https://example.com/arch.png",
          format: "PNG",
          sizeBytes: 1048576,
          description: "System topology",
          isImage: true,
        }}
      />,
    );

    expect(screen.getByText("Architecture Diagram")).toBeInTheDocument();
    expect(screen.getByText("PNG")).toBeInTheDocument();
    expect(screen.getByText(/1\.0 MB/)).toBeInTheDocument();
    expect(screen.getByAltText("Architecture Diagram")).toBeInTheDocument();

    // Check zoom controls
    expect(screen.getByLabelText("Zoom in")).toBeInTheDocument();
    expect(screen.getByLabelText("Zoom out")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /fit/i })).toBeInTheDocument();
    expect(screen.getByLabelText("Rotate")).toBeInTheDocument();

    // Test zoom in / zoom out interactions
    const zoomInBtn = screen.getByLabelText("Zoom in");
    fireEvent.click(zoomInBtn);
    expect(screen.getByText("125%")).toBeInTheDocument();

    const zoomOutBtn = screen.getByLabelText("Zoom out");
    fireEvent.click(zoomOutBtn);
    expect(screen.getByText("100%")).toBeInTheDocument();

    // Download & Open in Tab buttons
    expect(screen.getByRole("link", { name: /download/i })).toHaveAttribute(
      "href",
      "https://example.com/arch.png",
    );
    expect(screen.getByRole("link", { name: /open in tab/i })).toHaveAttribute(
      "href",
      "https://example.com/arch.png",
    );
  });

  it("renders non-image fallback when viewing document files", () => {
    render(
      <FilePreviewDialog
        open={true}
        onOpenChange={() => {}}
        file={{
          name: "Security Audit.pdf",
          url: "https://example.com/audit.pdf",
          format: "PDF",
          sizeBytes: 2097152,
          isImage: false,
        }}
      />,
    );

    expect(screen.getByText("Security Audit.pdf")).toBeInTheDocument();
    expect(
      screen.getByText(/Document preview not available inline/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /download/i })).toBeInTheDocument();
  });
});
