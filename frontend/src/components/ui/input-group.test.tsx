import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { describe, it, expect } from "vitest";
import { PasswordInput } from "./input-group";

describe("PasswordInput component", () => {
  it("renders with type password by default and toggles on eye click", () => {
    render(
      <PasswordInput placeholder="Enter password" defaultValue="secret123" />,
    );

    const input = screen.getByPlaceholderText(
      "Enter password",
    ) as HTMLInputElement;
    expect(input.type).toBe("password");

    const toggleButton = screen.getByTitle("Show password");
    expect(toggleButton).toBeInTheDocument();

    fireEvent.click(toggleButton);

    expect(input.type).toBe("text");
    expect(screen.getByTitle("Hide password")).toBeInTheDocument();

    fireEvent.click(screen.getByTitle("Hide password"));
    expect(input.type).toBe("password");
  });
});
