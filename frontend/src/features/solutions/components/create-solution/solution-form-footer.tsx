import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface SolutionFormFooterProps {
  currentStep: number;
  totalSteps: number;
  isPending: boolean;
  canPublish: boolean;
  onPrev: () => void;
  onNext: () => void;
  onPublish: () => void;
}

export function SolutionFormFooter({
  currentStep,
  totalSteps,
  isPending,
  canPublish,
  onPrev,
  onNext,
  onPublish,
}: SolutionFormFooterProps) {
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div className="flex items-center justify-between pt-2">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onPrev}
          disabled={isFirstStep || isPending}
        >
          <ArrowLeft className="size-4" />
          Previous
        </Button>
        <Button
          type="button"
          variant="ghost"
          render={<Link to="/dashboard" />}
          nativeButton={false}
          disabled={isPending}
        >
          Cancel
        </Button>
      </div>

      {!isLastStep ? (
        <Button
          key="footer-btn-continue"
          type="button"
          onClick={onNext}
          disabled={isPending}
        >
          Continue
          <ArrowRight className="size-4" />
        </Button>
      ) : (
        <Button
          key="footer-btn-publish"
          type="button"
          onClick={onPublish}
          disabled={isPending || !canPublish}
        >
          {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
          Publish Solution
        </Button>
      )}
    </div>
  );
}
