import * as React from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

const bubbleVariants = cva(
  "group/bubble relative flex w-fit max-w-[85%] min-w-0 flex-col gap-1 text-sm transition-all sm:max-w-[75%]",
  {
    variants: {
      variant: {
        default:
          "*:data-[slot=bubble-content]:bg-primary *:data-[slot=bubble-content]:text-primary-foreground",
        secondary:
          "*:data-[slot=bubble-content]:bg-secondary *:data-[slot=bubble-content]:text-secondary-foreground",
        muted:
          "*:data-[slot=bubble-content]:bg-muted *:data-[slot=bubble-content]:text-muted-foreground",
        tinted:
          "*:data-[slot=bubble-content]:bg-accent *:data-[slot=bubble-content]:text-accent-foreground",
        outline:
          "*:data-[slot=bubble-content]:border *:data-[slot=bubble-content]:border-border *:data-[slot=bubble-content]:bg-background",
        destructive:
          "*:data-[slot=bubble-content]:bg-destructive *:data-[slot=bubble-content]:text-destructive-foreground",
        ghost:
          "*:data-[slot=bubble-content]:bg-transparent *:data-[slot=bubble-content]:p-0",
      },
      align: {
        start: "self-start data-[slot=bubble]:self-start",
        end: "self-end data-[slot=bubble]:self-end",
      },
    },
    defaultVariants: {
      variant: "default",
      align: "start",
    },
  },
);

function BubbleGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="bubble-group"
      className={cn("flex min-w-0 flex-col gap-1.5", className)}
      {...props}
    />
  );
}

function Bubble({
  className,
  variant = "default",
  align = "start",
  render,
  ...props
}: useRender.ComponentProps<"div"> & VariantProps<typeof bubbleVariants>) {
  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        className: cn(bubbleVariants({ variant, align }), className),
      },
      props,
    ),
    render,
    state: {
      slot: "bubble",
      variant,
      align,
    },
  });
}

function BubbleContent({
  className,
  render,
  ...props
}: useRender.ComponentProps<"div">) {
  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        className: cn(
          "min-w-0 wrap-break-word rounded-xl px-4 py-2.5 leading-relaxed shadow-xs",
          className,
        ),
      },
      props,
    ),
    render,
    state: {
      slot: "bubble-content",
    },
  });
}

function BubbleReactions({
  className,
  render,
  ...props
}: useRender.ComponentProps<"div">) {
  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        className: cn(
          "flex items-center gap-1 text-xs text-muted-foreground",
          className,
        ),
      },
      props,
    ),
    render,
    state: {
      slot: "bubble-reactions",
    },
  });
}

export { Bubble, BubbleContent, BubbleGroup, BubbleReactions, bubbleVariants };
