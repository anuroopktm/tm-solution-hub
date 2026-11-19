import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface MessageProps extends ComponentProps<"div"> {
  role: "user" | "assistant" | "system";
  avatar?: ReactNode;
}

export function Message({
  role,
  avatar,
  className,
  children,
  ...props
}: MessageProps) {
  return (
    <div
      data-slot="ai-message"
      data-role={role}
      className={cn(
        "flex w-full py-2.5",
        role === "user" ? "justify-end" : "justify-start",
        className,
      )}
      {...props}
    >
      {avatar && role === "assistant" && (
        <div className="mr-3 flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
          {avatar}
        </div>
      )}

      <div
        className={cn("min-w-0 flex-1", role === "user" && "flex justify-end")}
      >
        {children}
      </div>

      {avatar && role === "user" && (
        <div className="ml-3 flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
          {avatar}
        </div>
      )}
    </div>
  );
}
