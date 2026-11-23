import type { SolutionDocument } from "@/types/solution.types";
import { SolutionAssetsCard } from "../assets";

interface SolutionDocumentsCardProps {
  documents: SolutionDocument[];
}

export function SolutionDocumentsCard({
  documents,
}: SolutionDocumentsCardProps) {
  if (!documents || documents.length === 0) return null;

  return (
    <SolutionAssetsCard
      documents={documents}
      title="Documents & Specifications"
      description="Technical whitepapers, deployment guides, and architecture diagrams."
    />
  );
}
