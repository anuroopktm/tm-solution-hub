import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

const markerVariants = cva(
  "group/marker relative flex w-full items-center gap-2 text-xs text-muted-foreground",
  {
    variants: {
      variant: {
        default: "justify-center py-2",
        border:
          "my-2 justify-center border-y border-border/40 py-2.5 bg-muted/20",
        separator:
          "my-3 justify-center before:h-px before:flex-1 before:bg-border/60 after:h-px after:flex-1 after:bg-border/60",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Marker({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"div"> & VariantProps<typeof markerVariants>) {
  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        className: cn(markerVariants({ variant }), className),
      },
      props,
    ),
    render,
    state: {
      slot: "marker",
      variant,
    },
  });
}

function MarkerIcon({
  className,
  render,
  ...props
}: useRender.ComponentProps<"span">) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        "aria-hidden": "true",
        className: cn(
          "flex size-3.5 shrink-0 items-center justify-center [&>svg]:size-3.5",
          className,
        ),
      },
      props,
    ),
    render,
    state: {
      slot: "marker-icon",
    },
  });
}

function MarkerContent({
  className,
  render,
  ...props
}: useRender.ComponentProps<"span">) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn("min-w-0 truncate px-2 font-medium", className),
      },
      props,
    ),
    render,
    state: {
      slot: "marker-content",
    },
  });
}

export { Marker, MarkerIcon, MarkerContent, markerVariants };
