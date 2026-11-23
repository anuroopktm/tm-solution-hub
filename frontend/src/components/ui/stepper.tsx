import * as React from "react";
import { cn } from "@/lib/utils";

export interface StepItem {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

export interface StepperProps extends React.HTMLAttributes<HTMLDivElement> {
  steps: StepItem[];
  activeStep: number;
  onStepClick?: (stepIndex: number) => void;
  isStepCompleted?: (stepIndex: number) => boolean;
}

export function Stepper({
  steps,
  activeStep,
  onStepClick,
  isStepCompleted,
  className,
  ...props
}: StepperProps) {
  return (
    <div className={cn("w-full", className)} {...props}>
      {/* Segmented Progress Bar */}
      <div className="flex items-center gap-3">
        <div
          className="flex flex-1 gap-1.5"
          role="progressbar"
          aria-label="Progress"
          aria-valuemin={0}
          aria-valuemax={steps.length}
          aria-valuenow={Math.min(activeStep + 1, steps.length)}
        >
          {steps.map((step, index) => {
            const isCompleted =
              isStepCompleted !== undefined
                ? isStepCompleted(index)
                : index < activeStep;
            const isCurrent = index === activeStep;
            const isClickable =
              Boolean(onStepClick) && (isCompleted || index <= activeStep);

            return (
              <span
                key={step.id || index}
                title={step.title}
                onClick={() => isClickable && onStepClick?.(index)}
                className={cn(
                  "h-1.5 flex-1 overflow-hidden rounded-full bg-muted transition-all",
                  isClickable && "cursor-pointer hover:opacity-80",
                )}
              >
                <span
                  className={cn(
                    "block h-full rounded-full transition-all duration-300 motion-reduce:transition-none",
                    isCurrent
                      ? "w-full bg-primary"
                      : isCompleted
                        ? "w-full bg-primary/75"
                        : "w-0",
                  )}
                />
              </span>
            );
          })}
        </div>

        <span className="w-10 text-right text-xs text-muted-foreground tabular-nums">
          {Math.min(activeStep + 1, steps.length)}/{steps.length}
        </span>
      </div>
    </div>
  );
}
