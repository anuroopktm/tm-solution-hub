import { PageHeader } from "@/components/common/page-header";
import {
  CreateSolutionBreadcrumb,
  SolutionCreateForm,
} from "@/features/solutions";

export default function CreateSolutionPage() {
  return (
    <>
      <PageHeader>
        <CreateSolutionBreadcrumb />
      </PageHeader>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <SolutionCreateForm />
      </div>
    </>
  );
}
