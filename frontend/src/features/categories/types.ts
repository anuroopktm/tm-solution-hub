import type { Category } from "@/types/category.types";

export type CategoryIconKey =
  | "Brain"
  | "Cloud"
  | "ShieldCheck"
  | "Database"
  | "Cpu"
  | "Workflow"
  | "Network"
  | "Layers"
  | "Boxes"
  | "Sparkles"
  | "BarChart3"
  | "Orbit";

export interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryToEdit?: Category | null;
  [key: string]: unknown;
}
