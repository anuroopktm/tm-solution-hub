import { createElement } from "react";
import * as LucideIcons from "lucide-react";
import {
  Orbit,
  Shapes,
  Component,
  Hexagon,
  CircleDot,
  Layers,
  Boxes,
  Grid2X2,
  Workflow,
  Network,
  Blocks,
  Diamond,
  Pentagon,
  Aperture,
  Command,
  Asterisk,
  Sparkles,
  Puzzle,
  Box,
  CircleDashed,
  Brain,
  Cloud,
  ShieldCheck,
  Landmark,
  Users,
  BarChart3,
  Cpu,
  Database,
  type LucideIcon,
} from "lucide-react";

export const categoryIcons: LucideIcon[] = [
  Orbit,
  Shapes,
  Component,
  Hexagon,
  CircleDot,
  Layers,
  Boxes,
  Grid2X2,
  Workflow,
  Network,
  Blocks,
  Diamond,
  Pentagon,
  Aperture,
  Command,
  Asterisk,
  Sparkles,
  Puzzle,
  Box,
  CircleDashed,
  Brain,
  Cloud,
  ShieldCheck,
  Landmark,
  Users,
  BarChart3,
  Cpu,
  Database,
];

export const categoryIconMap: Record<string, LucideIcon> = {
  Orbit,
  Shapes,
  Component,
  Hexagon,
  CircleDot,
  Layers,
  Boxes,
  Grid2X2,
  Workflow,
  Network,
  Blocks,
  Diamond,
  Pentagon,
  Aperture,
  Command,
  Asterisk,
  Sparkles,
  Puzzle,
  Box,
  CircleDashed,
  Brain,
  Cloud,
  ShieldCheck,
  Landmark,
  Users,
  BarChart3,
  Cpu,
  Database,
};

export const DEFAULT_CATEGORY_ICON = Orbit;

/**
 * Returns the Lucide icon associated with the given key, falling back to Orbit
 * or a deterministic icon based on the category name when no key is explicitly set.
 */
export function getCategoryIcon(
  iconKey?: string | null,
  categoryIdentifier?: string,
): LucideIcon {
  if (iconKey) {
    if (categoryIconMap[iconKey]) {
      return categoryIconMap[iconKey];
    }
    // Dynamic lookup by name from LucideIcons
    const dynamicIcon = (LucideIcons as Record<string, unknown>)[iconKey];
    if (dynamicIcon && typeof dynamicIcon === "function") {
      return dynamicIcon as LucideIcon;
    }
  }

  if (categoryIdentifier) {
    // Deterministic hash so each category reliably gets the same icon without random re-renders
    let hash = 0;
    for (let i = 0; i < categoryIdentifier.length; i++) {
      hash = (hash << 5) - hash + categoryIdentifier.charCodeAt(i);
      hash |= 0;
    }
    const index = Math.abs(hash) % categoryIcons.length;
    return categoryIcons[index];
  }

  return DEFAULT_CATEGORY_ICON;
}

export function CategoryIcon({
  iconKey,
  categoryIdentifier,
  className,
}: {
  iconKey?: string | null;
  categoryIdentifier?: string;
  className?: string;
}) {
  const IconComponent = getCategoryIcon(iconKey, categoryIdentifier);
  return createElement(IconComponent, { className });
}
