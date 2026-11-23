import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ChatProvider } from "../../context/chat-context";
import { ChatWidget } from "./chat-widget";

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

describe("ChatWidget", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders the floating launcher button when closed", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/dashboard"]}>
          <ChatProvider>
            <ChatWidget />
          </ChatProvider>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const fabButton = screen.getByLabelText("Open chat assistant");
    expect(fabButton).toBeInTheDocument();
  });

  it("opens the mini chat window when FAB is clicked", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/dashboard"]}>
          <ChatProvider>
            <ChatWidget />
          </ChatProvider>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const fabButton = screen.getByLabelText("Open chat assistant");
    fireEvent.click(fabButton);

    expect(
      screen.getByRole("dialog", { name: "Chat assistant widget" }),
    ).toBeInTheDocument();
    expect(screen.getByText("What can I help you with?")).toBeInTheDocument();
  });

  it("suppresses the floating widget when on the dedicated /chat page", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/chat"]}>
          <ChatProvider>
            <ChatWidget />
          </ChatProvider>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      screen.queryByLabelText("Open chat assistant"),
    ).not.toBeInTheDocument();
  });
});
