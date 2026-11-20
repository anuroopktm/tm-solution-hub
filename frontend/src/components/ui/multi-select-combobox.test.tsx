import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { useState } from "react";
import { MultiSelectCombobox } from "./multi-select-combobox";

describe("MultiSelectCombobox Component", () => {
  afterEach(cleanup);

  function MultiSelectComboboxWrapper({
    initialOptions = ["REST API", "GraphQL", "WebSocket"],
    initialValues = [] as string[],
    onCreate,
    onChange,
  }: {
    initialOptions?: string[];
    initialValues?: string[];
    onCreate?: (val: string) => void;
    onChange?: (vals: string[]) => void;
  }) {
    const [options, setOptions] = useState(initialOptions);
    const [values, setValues] = useState(initialValues);

    const handleCreate = (newVal: string) => {
      setOptions((prev) => [...prev, newVal]);
      onCreate?.(newVal);
    };

    const handleChange = (newVals: string[]) => {
      setValues(newVals);
      onChange?.(newVals);
    };

    return (
      <MultiSelectCombobox
        options={options}
        value={values}
        onChange={handleChange}
        onCreate={handleCreate}
        placeholder="Select services..."
        aria-label="Services selector"
      />
    );
  }

  it("renders with placeholder and empty selected state", () => {
    render(<MultiSelectComboboxWrapper />);

    expect(
      screen.getByPlaceholderText("Select services..."),
    ).toBeInTheDocument();
  });

  it("renders selected values as chips", () => {
    render(
      <MultiSelectComboboxWrapper initialValues={["REST API", "GraphQL"]} />,
    );

    expect(screen.getByText("REST API")).toBeInTheDocument();
    expect(screen.getByText("GraphQL")).toBeInTheDocument();
  });

  it("removes an item when its chip remove button is clicked", () => {
    const handleChange = vi.fn();
    render(
      <MultiSelectComboboxWrapper
        initialValues={["REST API", "GraphQL"]}
        onChange={handleChange}
      />,
    );

    const removeButtons = screen.getAllByRole("button", {
      name: /remove item/i,
    });
    expect(removeButtons.length).toBe(2);

    fireEvent.click(removeButtons[0]);
    expect(handleChange).toHaveBeenCalledWith(["GraphQL"]);
  });

  it("calls onCreate when a custom option is typed and Enter is pressed", () => {
    const handleCreate = vi.fn();
    const handleChange = vi.fn();

    render(
      <MultiSelectComboboxWrapper
        onCreate={handleCreate}
        onChange={handleChange}
      />,
    );

    const input = screen.getByPlaceholderText("Select services...");
    fireEvent.change(input, { target: { value: "gRPC Service" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    expect(handleCreate).toHaveBeenCalledWith("gRPC Service");
    expect(handleChange).toHaveBeenCalledWith(["gRPC Service"]);
  });
});
