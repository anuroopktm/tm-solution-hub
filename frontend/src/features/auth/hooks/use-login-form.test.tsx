import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { useLoginForm, getSafeRedirectUrl } from "./use-login-form";
import { authService } from "@/services/auth.service";
import { ROUTES } from "@/routes/paths";

// Mock authService
vi.mock("@/services/auth.service", () => ({
  authService: {
    login: vi.fn(),
  },
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function createWrapper(
  initialEntries = ["/login"],
  initialLocationState?: unknown,
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter
          initialEntries={[
            {
              pathname: initialEntries[0],
              state: initialLocationState,
            },
          ]}
        >
          {children}
        </MemoryRouter>
      </QueryClientProvider>
    );
  };
}

describe("getSafeRedirectUrl", () => {
  it("returns the path when a valid relative path is provided", () => {
    expect(getSafeRedirectUrl("/categories")).toBe("/categories");
    expect(getSafeRedirectUrl("/solutions/123")).toBe("/solutions/123");
  });

  it("extracts pathname when given a Location object", () => {
    expect(getSafeRedirectUrl({ pathname: "/chat" })).toBe("/chat");
  });

  it("falls back to ROUTES.DASHBOARD on missing, null, or undefined target", () => {
    expect(getSafeRedirectUrl(undefined)).toBe(ROUTES.DASHBOARD);
    expect(getSafeRedirectUrl(null)).toBe(ROUTES.DASHBOARD);
    expect(getSafeRedirectUrl("")).toBe(ROUTES.DASHBOARD);
  });

  it("blocks protocol-relative open redirect attacks (e.g. //evil.com)", () => {
    expect(getSafeRedirectUrl("//evil.com")).toBe(ROUTES.DASHBOARD);
  });

  it("blocks external absolute URLs (e.g. https://evil.com)", () => {
    expect(getSafeRedirectUrl("https://evil.com")).toBe(ROUTES.DASHBOARD);
  });
});

describe("useLoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initializes with default empty values", () => {
    const { result } = renderHook(() => useLoginForm(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isPending).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.errorMessage).toBeUndefined();
    expect(result.current.errors).toEqual({});
  });

  it("accepts custom default values", () => {
    const { result } = renderHook(
      () =>
        useLoginForm({
          defaultValues: { email: "test@example.com" },
        }),
      { wrapper: createWrapper() },
    );

    expect(result.current.errors).toEqual({});
  });

  it("fails validation and does not call API when fields are empty", async () => {
    const { result } = renderHook(() => useLoginForm(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(authService.login).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("successfully logs in, calls API with credentials, and redirects to dashboard by default", async () => {
    const mockUser = {
      id: "u1",
      email: "user@example.com",
      username: "testuser",
      full_name: "Test User",
      role: "admin",
      is_active: true,
      is_deleted: false,
      created_at: "2026-01-01T00:00:00Z",
    };
    vi.mocked(authService.login).mockResolvedValueOnce(mockUser);

    const { result } = renderHook(
      () =>
        useLoginForm({
          defaultValues: {
            email: "user@example.com",
            password: "password123",
          },
        }),
      { wrapper: createWrapper() },
    );

    await act(async () => {
      await result.current.handleSubmit();
    });

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        email: "user@example.com",
        password: "password123",
      });
      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.DASHBOARD, {
        replace: true,
      });
    });
  });

  it("redirects to origin route if location.state.from is present", async () => {
    const mockUser = {
      id: "u1",
      email: "user@example.com",
      username: "testuser",
      full_name: "Test User",
      role: "admin",
      is_active: true,
      is_deleted: false,
      created_at: "2026-01-01T00:00:00Z",
    };
    vi.mocked(authService.login).mockResolvedValueOnce(mockUser);

    const { result } = renderHook(
      () =>
        useLoginForm({
          defaultValues: {
            email: "user@example.com",
            password: "password123",
          },
        }),
      {
        wrapper: createWrapper(["/login"], {
          from: "/categories/arch",
        }),
      },
    );

    await act(async () => {
      await result.current.handleSubmit();
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/categories/arch", {
        replace: true,
      });
    });
  });

  it("captures and exposes login mutation error message on failure", async () => {
    const errorMsg = "Invalid email or password";
    vi.mocked(authService.login).mockRejectedValueOnce(new Error(errorMsg));

    const { result } = renderHook(
      () =>
        useLoginForm({
          defaultValues: {
            email: "user@example.com",
            password: "wrong-password",
          },
        }),
      { wrapper: createWrapper() },
    );

    await act(async () => {
      await result.current.handleSubmit();
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
      expect(result.current.errorMessage).toBe(errorMsg);
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
