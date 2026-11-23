import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

const messageVariants = cva(
  "group/message relative flex w-full min-w-0 gap-2 text-sm data-[align=end]:flex-row-reverse data-[align=end]:justify-end",
  {
    variants: {
      align: {
        start: "justify-start",
        end: "justify-end",
      },
    },
    defaultVariants: {
      align: "start",
    },
  },
);

interface MessageProps
  extends React.ComponentProps<"div">, VariantProps<typeof messageVariants> {
  align?: "start" | "end";
}

function Message({ className, align = "start", ...props }: MessageProps) {
  return (
    <div
      data-slot="message"
      data-align={align}
      className={cn(messageVariants({ align }), className)}
      {...props}
    />
  );
}

function MessageAvatar({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="message-avatar"
      className={cn(
        "flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

function MessageContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="message-content"
      className={cn(
        "flex w-full min-w-0 flex-col gap-2 group-data-[align=end]/message:items-end",
        className,
      )}
      {...props}
    />
  );
}

export { Message, MessageAvatar, MessageContent, messageVariants };
