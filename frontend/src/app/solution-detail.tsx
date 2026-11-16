import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { PageHeader } from "@/components/common/page-header";
import { useSolution } from "@/hooks/use-solutions";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ExternalLink, GitBranch } from "lucide-react";
import { SolutionOverviewCard } from "@/features/solutions/components/detail/solution-overview-card";
import { SolutionCapabilitiesCard } from "@/features/solutions/components/detail/solution-capabilities-card";
import { SolutionDocumentsCard } from "@/features/solutions/components/detail/solution-documents-card";
import { SolutionVideosCard } from "@/features/solutions/components/detail/solution-videos-card";
import { SolutionEnvironmentsCard } from "@/features/solutions/components/detail/solution-environments-card";
import { SolutionMetadataCard } from "@/features/solutions/components/detail/solution-metadata-card";

export default function SolutionDetailPage() {
  const { solutionId } = useParams<{ solutionId: string }>();
  const navigate = useNavigate();

  const {
    data: solution,
    isLoading: solutionLoading,
    isError: solutionError,
  } = useSolution(solutionId);

  const primaryCategory = solution?.categories?.[0];

  return (
    <>
      <PageHeader>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link to="/categories" />}>
                Categories
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            {primaryCategory && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink
                    render={<Link to={`/categories/${primaryCategory.id}`} />}
                  >
                    {primaryCategory.name}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            <BreadcrumbItem>
              <BreadcrumbPage>
                {solution?.title || "Solution Details"}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </PageHeader>

      <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
        {/* Back button & Action Toolbar */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (primaryCategory) {
                navigate(`/categories/${primaryCategory.id}`);
              } else {
                navigate(-1);
              }
            }}
            className="gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            <span>
              {primaryCategory ? `Back to ${primaryCategory.name}` : "Back"}
            </span>
          </Button>

          {solution?.repository_url && (
            <Button
              variant="outline"
              size="sm"
              render={
                <a
                  href={solution.repository_url}
                  target="_blank"
                  rel="noreferrer"
                />
              }
              className="gap-1.5"
            >
              <GitBranch className="size-3.5" />
              <span>Repository</span>
              <ExternalLink className="size-3 opacity-70" />
            </Button>
          )}
        </div>

        {/* Loading State */}
        {solutionLoading && (
          <div className="space-y-6">
            <div className="space-y-3">
              <Skeleton className="h-6 w-32 rounded-md" />
              <Skeleton className="h-10 w-3/4 rounded-md" />
              <Skeleton className="h-5 w-1/2 rounded-md" />
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="space-y-4 lg:col-span-2">
                <Skeleton className="h-48 w-full rounded-xl" />
                <Skeleton className="h-48 w-full rounded-xl" />
              </div>
              <div className="space-y-4">
                <Skeleton className="h-64 w-full rounded-xl" />
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {solutionError && (
          <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-6 text-center">
            <h2 className="text-lg font-semibold text-destructive">
              Failed to load solution
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              The requested solution could not be found or failed to load.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/categories")}
              className="mt-4"
            >
              Return to Categories
            </Button>
          </div>
        )}

        {/* Solution Detail Content */}
        {!solutionLoading && !solutionError && solution && (
          <div className="space-y-6">
            {/* Header Info */}
            <div className="border-b border-border/60 pb-6">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                {solution.title}
              </h1>
            </div>

            {/* 2-Column Content Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Left/Main Column */}
              <div className="space-y-6 lg:col-span-2">
                <SolutionOverviewCard description={solution.description} />
                <SolutionCapabilitiesCard
                  capabilities={solution.key_capabilities ?? []}
                />
                <SolutionDocumentsCard documents={solution.documents ?? []} />
                <SolutionVideosCard videos={solution.videos ?? []} />
              </div>

              {/* Right / Sidebar Column */}
              <div className="space-y-6">
                <SolutionEnvironmentsCard
                  serviceUrls={solution.service_urls ?? []}
                />
                <SolutionMetadataCard solution={solution} />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
