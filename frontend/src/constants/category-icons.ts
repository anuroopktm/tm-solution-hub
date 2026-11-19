import { createElement } from "react";
import * as LucideIcons from "lucide-react";
import { Orbit, type LucideIcon } from "lucide-react";

export const DEFAULT_CATEGORY_ICON: LucideIcon = Orbit;

/**
 * Returns the Lucide icon associated with the given icon name,
 * falling back to DEFAULT_CATEGORY_ICON when not found or not specified.
 */
export function getCategoryIcon(iconName?: string | null): LucideIcon {
  if (iconName) {
    const dynamicIcon = (LucideIcons as Record<string, unknown>)[iconName];
    if (
      dynamicIcon &&
      (typeof dynamicIcon === "function" || typeof dynamicIcon === "object")
    ) {
      return dynamicIcon as LucideIcon;
    }
  }

  return DEFAULT_CATEGORY_ICON;
}

export interface CategoryIconProps {
  name?: string | null;
  className?: string;
}

export function CategoryIcon({ name, className }: CategoryIconProps) {
  const IconComponent = getCategoryIcon(name);
  return createElement(IconComponent, { className });
}
