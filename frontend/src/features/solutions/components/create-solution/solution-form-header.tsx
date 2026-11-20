import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface SolutionFormHeaderProps {
  isPending: boolean;
}

export function SolutionFormHeader({ isPending }: SolutionFormHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create Solution</h1>
        <p className="text-sm text-muted-foreground">
          Publish a technical solution, architecture blueprint, or reusable
          codebase.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          render={<Link to="/dashboard" />}
          nativeButton={false}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
          Publish Solution
        </Button>
      </div>
    </div>
  );
}
