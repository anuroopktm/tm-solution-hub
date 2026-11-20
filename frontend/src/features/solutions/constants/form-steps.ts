import type { StepItem } from "@/components/ui/stepper";

export const FORM_STEPS: StepItem[] = [
  {
    id: "general",
    title: "General Info",
    description: "Title, categories & lead",
  },
  {
    id: "architecture",
    title: "Tech & Capabilities",
    description: "Tech stack & features",
  },
  {
    id: "services",
    title: "Deployments & Links",
    description: "Service URLs & repositories",
  },
  {
    id: "review",
    title: "Assets & Review",
    description: "Media & confirmation",
  },
];
