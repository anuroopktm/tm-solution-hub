import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import {
  Attachment,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentContent,
  AttachmentTitle,
  AttachmentDescription,
  AttachmentActions,
  AttachmentAction,
  AttachmentTrigger,
} from "./attachment";

describe("Attachment Components", () => {
  it("renders attachment with media, content, title, and description", () => {
    render(
      <Attachment>
        <AttachmentMedia>
          <span data-testid="media-icon">ICON</span>
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>system-architecture.png</AttachmentTitle>
          <AttachmentDescription>PNG · 2.4 MB</AttachmentDescription>
        </AttachmentContent>
        <AttachmentActions>
          <AttachmentAction aria-label="Remove item">Remove</AttachmentAction>
        </AttachmentActions>
      </Attachment>,
    );

    expect(screen.getByText("system-architecture.png")).toBeInTheDocument();
    expect(screen.getByText("PNG · 2.4 MB")).toBeInTheDocument();
    expect(screen.getByTestId("media-icon")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Remove item" }),
    ).toBeInTheDocument();
  });

  it("applies variant classes correctly", () => {
    const { container } = render(
      <Attachment orientation="vertical">
        <AttachmentMedia variant="thumbnail" />
      </Attachment>,
    );

    const attachmentRoot = container.querySelector('[data-slot="attachment"]');
    const attachmentMedia = container.querySelector(
      '[data-slot="attachment-media"]',
    );

    expect(attachmentRoot).toHaveClass("flex-col");
    expect(attachmentMedia).toHaveClass("size-14");
  });

  it("renders exact shadcn structure with AttachmentGroup and AttachmentTrigger render prop", () => {
    render(
      <AttachmentGroup>
        <Attachment orientation="vertical">
          <AttachmentMedia variant="image">
            <img src="https://example.com/workspace.png" alt="Workspace" />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>workspace.png</AttachmentTitle>
            <AttachmentDescription>PNG · 820 KB</AttachmentDescription>
          </AttachmentContent>
          <AttachmentActions>
            <AttachmentAction aria-label="Remove workspace.png">
              <span>X</span>
            </AttachmentAction>
          </AttachmentActions>
          <AttachmentTrigger
            render={
              <a
                href="https://example.com/workspace.png"
                target="_blank"
                rel="noreferrer"
                aria-label="Open workspace.png"
              />
            }
          />
        </Attachment>
      </AttachmentGroup>,
    );

    expect(screen.getByText("workspace.png")).toBeInTheDocument();
    expect(screen.getByText("PNG · 820 KB")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Workspace" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Remove workspace.png" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Open workspace.png" }),
    ).toBeInTheDocument();
  });
});
