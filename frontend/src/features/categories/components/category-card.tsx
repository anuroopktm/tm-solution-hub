import { useId } from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CategoryIcon } from "@/constants/category-icons";
import type { Category } from "@/types/category.types";

export interface CategoryCardProps {
  category: Category;
  onClick: () => void;
}

// Minimal, clean circuit lines converging to the center category icon
const MINIMAL_CIRCUIT_TRACKS = [
  // Top pair
  {
    id: "tl",
    d: "M 40 25 H 185 Q 195 25 195 40 V 65",
    nodeX: 40,
    nodeY: 25,
    dur: "2.0s",
    delay: "0.1s",
  },
  {
    id: "tr",
    d: "M 360 25 H 215 Q 205 25 205 40 V 65",
    nodeX: 360,
    nodeY: 25,
    dur: "2.0s",
    delay: "0.5s",
  },
  // Middle straight bus pair
  {
    id: "ml",
    d: "M 30 65 H 200",
    nodeX: 30,
    nodeY: 65,
    dur: "1.8s",
    delay: "0s",
  },
  {
    id: "mr",
    d: "M 370 65 H 200",
    nodeX: 370,
    nodeY: 65,
    dur: "1.8s",
    delay: "0.4s",
  },
  // Bottom pair
  {
    id: "bl",
    d: "M 40 105 H 185 Q 195 105 195 90 V 65",
    nodeX: 40,
    nodeY: 105,
    dur: "2.2s",
    delay: "0.3s",
  },
  {
    id: "br",
    d: "M 360 105 H 215 Q 205 105 205 90 V 65",
    nodeX: 360,
    nodeY: 105,
    dur: "2.2s",
    delay: "0.7s",
  },
];

export function CategoryCard({ category, onClick }: CategoryCardProps) {
  const containerId = useId();
  const gradientId = `circuit-grad-${containerId.replace(/:/g, "")}`;

  return (
    <Card
      onClick={onClick}
      className="shine-card relative group/card cursor-pointer"
    >
      {/* Minimal Circuit Banner Header */}
      <div className="relative h-28 sm:h-32 w-full overflow-hidden bg-muted/15 border-b border-border/50">
        {/* Subtle Matrix Dots */}
        <div
          className="absolute inset-0 opacity-15 dark:opacity-20 transition-opacity duration-300 group-hover/card:opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle, var(--color-foreground) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />

        {/* Soft Vignette Overlay */}
        <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-background/20 via-transparent to-background/70" />

        {/* SVG Circuit Tracks */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 400 130"
          preserveAspectRatio="xMidYMid meet"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop
                offset="0%"
                stopColor="var(--color-primary)"
                stopOpacity="0.2"
              />
              <stop
                offset="60%"
                stopColor="var(--color-primary)"
                stopOpacity="1"
              />
              <stop
                offset="100%"
                stopColor="var(--color-primary)"
                stopOpacity="0.8"
              />
            </linearGradient>
          </defs>

          {/* 6 Minimal Circuit Tracks & Solder Vias */}
          {MINIMAL_CIRCUIT_TRACKS.map((track) => (
            <g key={track.id}>
              {/* Static subtle circuit trace */}
              <path
                d={track.d}
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                className="text-border/60 transition-colors duration-300 group-hover/card:text-border/90"
              />

              {/* Animated Light Beam flowing to center icon on hover */}
              <path
                d={track.d}
                pathLength={100}
                stroke={`url(#${gradientId})`}
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
                className="circuit-beam-flow"
                style={{
                  animationDuration: track.dur,
                  animationDelay: track.delay,
                }}
              />

              {/* Minimal solder via pads */}
              <circle
                cx={track.nodeX}
                cy={track.nodeY}
                r="4"
                className="fill-none stroke-border/60 transition-colors duration-300 group-hover/card:stroke-primary/50"
                strokeWidth="1"
              />
              <circle
                cx={track.nodeX}
                cy={track.nodeY}
                r="1.75"
                className="fill-muted-foreground/30 transition-colors duration-300 group-hover/card:fill-primary"
              />
            </g>
          ))}
        </svg>

        {/* Central Core: Category Icon */}
        <div className="absolute top-1/2 left-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center">
          <div className="flex size-8 sm:size-9 items-center justify-center rounded-md border border-border/80 bg-background p-2 shadow-xs transition-all duration-300 group-hover/card:border-primary/60 group-hover/card:shadow-md group-hover/card:shadow-primary/10">
            <CategoryIcon
              name={category.icon}
              className="size-4 sm:size-5 text-primary transition-transform duration-300 group-hover/card:scale-105"
            />
          </div>
        </div>

        {/* Badge: Solutions count positioned at bottom right */}
        <Badge variant="secondary" className="absolute top-0 right-3 z-10">
          {category.solutions_count ?? 0}{" "}
          {category.solutions_count === 1 ? "solution" : "solutions"}
        </Badge>
      </div>

      {/* Primary Card Content: Title, Description */}
      <CardHeader>
        <CardTitle className="transition-colors group-hover/card:text-primary">
          {category.name}
        </CardTitle>
        <CardDescription className="line-clamp-3">
          {category.description || "No description provided."}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

export default CategoryCard;
