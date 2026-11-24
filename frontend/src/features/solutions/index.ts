export { SolutionCard } from "./components/solution-card";
export { SolutionCardFallback } from "./components/solution-card-fallback";
export { SolutionGrid } from "./components/solution-grid";
export {
  SolutionDetailView,
  type SolutionDetailViewProps,
} from "./components/detail/solution-detail-view";
export {
  SolutionAssetsCard,
  SolutionAssetList,
  SolutionAssetItem,
  SolutionAssetPreviewDialog,
  SolutionFullscreenViewer,
  AssetPreview,
} from "./components/assets";
export {
  useSolutions,
  useRecentSolutions,
  useSolution,
  useCreateSolution,
  useUpdateSolution,
  useDeleteSolution,
  SOLUTION_QUERY_KEYS,
} from "@/hooks/use-solutions";
export {
  SolutionCreateForm,
  SolutionCreateFormView,
  FORM_STEPS,
  type SolutionCreateFormViewProps,
  CreateSolutionBreadcrumb,
  SolutionFormHeader,
  SolutionFormValidationAlert,
  StepGeneralInfo,
  StepTechCapabilities,
  StepDeploymentsLinks,
  StepAssetsMedia,
  SolutionFormFooter,
} from "./components/create-solution";
export { useSolutionForm } from "./hooks/use-solution-form";
export type { UseSolutionFormReturn } from "./hooks/use-solution-form";
