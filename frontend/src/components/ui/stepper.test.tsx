import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { Stepper, type StepItem } from "./stepper";

const mockSteps: StepItem[] = [
  { id: "step-1", title: "General", description: "Basic Info" },
  { id: "step-2", title: "Details", description: "More Info" },
  { id: "step-3", title: "Review", description: "Confirm" },
];

describe("Stepper Component", () => {
  afterEach(cleanup);

  it("renders progress bar and current step indicator", () => {
    render(<Stepper steps={mockSteps} activeStep={1} />);

    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toBeInTheDocument();
    expect(progressbar).toHaveAttribute("aria-valuenow", "2");
    expect(progressbar).toHaveAttribute("aria-valuemax", "3");

    // Renders step count fraction
    expect(screen.getByText("2/3")).toBeInTheDocument();
  });

  it("triggers onStepClick when a completed or visited step segment is clicked", () => {
    const handleStepClick = vi.fn();
    render(
      <Stepper
        steps={mockSteps}
        activeStep={1}
        onStepClick={handleStepClick}
      />,
    );

    // Clicking step 0 (already completed/visited) should trigger onStepClick
    const step0Segment = screen.getByTitle("General");
    fireEvent.click(step0Segment);

    expect(handleStepClick).toHaveBeenCalledWith(0);
  });
});
