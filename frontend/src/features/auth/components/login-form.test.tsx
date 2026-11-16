import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import type { FieldErrors, UseFormRegister } from "react-hook-form";

import { LoginForm } from "./login-form";
import { SocialAuthButtons } from "./social-auth-buttons";
import type { LoginFormValues } from "@/schemas/auth.schema";

describe("SocialAuthButtons", () => {
  afterEach(cleanup);

  it("renders Google and Microsoft buttons and triggers respective callbacks", () => {
    const handleGoogle = vi.fn();
    const handleMicrosoft = vi.fn();

    render(
      <SocialAuthButtons
        onGoogleLogin={handleGoogle}
        onMicrosoftLogin={handleMicrosoft}
      />,
    );

    const googleBtn = screen.getByRole("button", { name: /google/i });
    const microsoftBtn = screen.getByRole("button", { name: /microsoft/i });

    expect(googleBtn).toBeInTheDocument();
    expect(microsoftBtn).toBeInTheDocument();

    fireEvent.click(googleBtn);
    expect(handleGoogle).toHaveBeenCalledTimes(1);

    fireEvent.click(microsoftBtn);
    expect(handleMicrosoft).toHaveBeenCalledTimes(1);
  });

  it("disables both buttons when disabled prop is true", () => {
    render(<SocialAuthButtons disabled />);

    expect(screen.getByRole("button", { name: /google/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /microsoft/i })).toBeDisabled();
  });
});

describe("LoginForm (Pure Presentation)", () => {
  afterEach(cleanup);

  const dummyRegister: UseFormRegister<LoginFormValues> = vi.fn(() => ({
    name: "email",
    onChange: vi.fn(),
    onBlur: vi.fn(),
    ref: vi.fn(),
  })) as unknown as UseFormRegister<LoginFormValues>;

  const defaultProps = {
    register: dummyRegister,
    handleSubmit: vi.fn((e) => {
      e?.preventDefault?.();
      return Promise.resolve();
    }),
    errors: {} as FieldErrors<LoginFormValues>,
    isPending: false,
    isError: false,
  };

  it("renders form fields, labels, title, and submit button", () => {
    render(<LoginForm {...defaultProps} />);

    expect(
      screen.getByRole("heading", { name: /welcome back/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^login$/i }),
    ).toBeInTheDocument();
  });

  it("renders custom title and description when provided", () => {
    render(
      <LoginForm
        {...defaultProps}
        title="Custom Sign In"
        description="Access your workspace"
      />,
    );

    expect(
      screen.getByRole("heading", { name: /custom sign in/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/access your workspace/i)).toBeInTheDocument();
  });

  it("displays validation error messages for email and password", () => {
    const errors: FieldErrors<LoginFormValues> = {
      email: { type: "required", message: "Email is required" },
      password: { type: "required", message: "Password is required" },
    };

    render(<LoginForm {...defaultProps} errors={errors} />);

    expect(screen.getByText("Email is required")).toBeInTheDocument();
    expect(screen.getByText("Password is required")).toBeInTheDocument();
  });

  it("displays error alert when isError is true", () => {
    render(
      <LoginForm
        {...defaultProps}
        isError={true}
        errorMessage="Invalid credentials provided."
      />,
    );

    expect(screen.getByText(/authentication failed/i)).toBeInTheDocument();
    expect(
      screen.getByText("Invalid credentials provided."),
    ).toBeInTheDocument();
  });

  it("disables inputs and submit button with loading text when isPending is true", () => {
    render(<LoginForm {...defaultProps} isPending={true} />);

    const submitBtn = screen.getByRole("button", { name: /signing in\.\.\./i });
    expect(submitBtn).toBeDisabled();

    expect(screen.getByLabelText(/email/i)).toBeDisabled();
    expect(screen.getByLabelText(/password/i)).toBeDisabled();
  });
});
