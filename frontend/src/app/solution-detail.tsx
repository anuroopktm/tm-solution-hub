import { useParams } from "react-router-dom";
import { useSolution, SolutionDetailView } from "@/features/solutions";

export default function SolutionDetailPage() {
  const { solutionId } = useParams<{ solutionId: string }>();

  const {
    data: solution,
    isLoading: solutionLoading,
    isError: solutionError,
  } = useSolution(solutionId);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
      <SolutionDetailView
        solution={solution}
        isLoading={solutionLoading}
        isError={solutionError}
      />
    </div>
  );
}
