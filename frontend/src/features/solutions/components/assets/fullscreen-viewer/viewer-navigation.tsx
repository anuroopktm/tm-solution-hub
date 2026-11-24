import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface ViewerNavigationProps {
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}

export function ViewerNavigation({
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: ViewerNavigationProps) {
  return (
    <>
      {hasPrev && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-40">
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={onPrev}
                  className="rounded-full bg-background/80 backdrop-blur-md border-border/50 text-foreground shadow-sm"
                  aria-label="Previous Asset"
                >
                  <ChevronLeft />
                </Button>
              }
            />
            <TooltipContent side="right">
              Previous asset (Left Arrow)
            </TooltipContent>
          </Tooltip>
        </div>
      )}

      {hasNext && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 z-40">
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={onNext}
                  className="rounded-full bg-background/80 backdrop-blur-md border-border/50 text-foreground shadow-sm"
                  aria-label="Next Asset"
                >
                  <ChevronRight />
                </Button>
              }
            />
            <TooltipContent side="left">
              Next asset (Right Arrow)
            </TooltipContent>
          </Tooltip>
        </div>
      )}
    </>
  );
}
