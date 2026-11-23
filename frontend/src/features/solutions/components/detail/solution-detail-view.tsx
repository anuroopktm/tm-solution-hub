import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  AlertCircle,
  Calendar,
  ExternalLink,
  GitBranch,
  Globe,
  Layers,
} from "lucide-react";
import type { Solution } from "@/types/solution.types";
import { SolutionMediaHero } from "./solution-media-hero";
import { SolutionOverviewCard } from "./solution-overview-card";
import { SolutionCapabilitiesCard } from "./solution-capabilities-card";
import { SolutionAssetsCard } from "../assets";
import { SolutionEnvironmentsCard } from "./solution-environments-card";
import { SolutionTechStackCard } from "./solution-metadata-card";

export interface SolutionDetailViewProps {
  solution?: Solution | null;
  isLoading?: boolean;
  isError?: boolean;
}

export function SolutionDetailView({
  solution,
  isLoading = false,
  isError = false,
}: SolutionDetailViewProps) {
  const navigate = useNavigate();

  // Loading State
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2.5">
          <Skeleton className="h-8 w-3/4 rounded-md sm:h-10" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-1/3 rounded-md" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-24 rounded-md" />
              <Skeleton className="h-8 w-20 rounded-md" />
            </div>
          </div>
        </div>
        <Skeleton className="aspect-[2.4/1] w-full rounded-xl" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Skeleton className="h-44 w-full rounded-xl" />
            <Skeleton className="h-44 w-full rounded-xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-44 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (isError || !solution) {
    return (
      <Empty className="my-8">
        <EmptyMedia className="bg-destructive">
          <AlertCircle className="size-6 text-destructive" />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>Failed to load solution</EmptyTitle>
          <EmptyDescription>
            The requested solution could not be found or failed to load.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/categories")}
          >
            Return to Categories
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Hero Title & Metadata */}
      <div className="space-y-3">
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {solution.title}
        </h1>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            {solution.lead && (
              <div className="flex items-center gap-2">
                <Avatar className="size-5.5">
                  <AvatarFallback className="text-[9px]">
                    {solution.lead.username?.slice(0, 2).toUpperCase() || "TM"}
                  </AvatarFallback>
                </Avatar>
                <span>
                  Lead:{" "}
                  <span className="font-medium text-foreground">
                    {solution.lead.username}
                  </span>
                </span>
              </div>
            )}

            <div className="flex items-center gap-1.5">
              <Calendar className="size-3.5" />
              <span>
                Published{" "}
                {new Date(solution.created_at).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>

            {solution.tech_stack && solution.tech_stack.length > 0 && (
              <div className="flex items-center gap-1.5">
                <Layers className="size-3.5" />
                <span>{solution.tech_stack.length} technologies</span>
              </div>
            )}
          </div>

          {/* External Action Links (Live Preview & Repo) */}
          {(solution.preview_url || solution.repository_url) && (
            <div className="flex flex-wrap items-center gap-2">
              {solution.preview_url && (
                <Button
                  variant="default"
                  size="sm"
                  render={
                    <a
                      href={solution.preview_url}
                      target="_blank"
                      rel="noreferrer"
                    />
                  }
                  className="gap-1.5"
                >
                  <Globe className="size-3.5" />
                  <span>Live Preview</span>
                  <ExternalLink className="size-3 opacity-80" />
                </Button>
              )}

              {solution.repository_url && (
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
                  <span>Repo</span>
                  <ExternalLink className="size-3 opacity-70" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Visual Media Showcase */}
      <SolutionMediaHero solution={solution} />

      {/* 2-Column Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left/Main Column */}
        <div className="space-y-6 lg:col-span-2">
          <SolutionOverviewCard description={solution.description} />
          <SolutionCapabilitiesCard
            capabilities={solution.key_capabilities ?? []}
          />
          <SolutionAssetsCard
            documents={solution.documents ?? []}
            videos={solution.videos ?? []}
          />
        </div>

        {/* Right / Sidebar Column */}
        <div className="space-y-6">
          <SolutionEnvironmentsCard serviceUrls={solution.service_urls ?? []} />
          <SolutionTechStackCard techStack={solution.tech_stack} />
        </div>
      </div>
    </div>
  );
}
