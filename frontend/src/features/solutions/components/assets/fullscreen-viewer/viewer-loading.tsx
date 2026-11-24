import { Spinner } from "@/components/ui/spinner";

export function ViewerLoading({
  message = "Loading preview...",
}: {
  message?: string;
}) {
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/80 backdrop-blur-xs text-foreground">
      <Spinner className="size-8 text-primary" />
      <p className="mt-3 text-xs font-medium text-muted-foreground">
        {message}
      </p>
    </div>
  );
}
