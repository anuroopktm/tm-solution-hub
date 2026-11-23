import type { ReactNode } from "react";
import { Link, useMatches, type Params } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useCategories } from "@/hooks/use-categories";
import { useSolution } from "@/hooks/use-solutions";

export interface BreadcrumbCrumb {
  label: ReactNode;
  to?: string;
}

export type BreadcrumbHandleValue =
  | ReactNode
  | BreadcrumbCrumb[]
  | ((params: Params<string>) => ReactNode | BreadcrumbCrumb[]);

export interface AppRouteHandle {
  breadcrumb?: BreadcrumbHandleValue;
  hideHeader?: boolean;
}

export function CategorySolutionsBreadcrumb({
  categoryId,
}: {
  categoryId?: string;
}) {
  const { data: categories } = useCategories();
  const activeCategory = categories?.find((c) => c.id === categoryId);

  return (
    <BreadcrumbList>
      <BreadcrumbItem>
        <BreadcrumbLink render={<Link to="/categories" />}>
          Categories
        </BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <BreadcrumbPage>{activeCategory?.name || "Solutions"}</BreadcrumbPage>
      </BreadcrumbItem>
    </BreadcrumbList>
  );
}

export function SolutionDetailBreadcrumb({
  solutionId,
}: {
  solutionId?: string;
}) {
  const { data: solution } = useSolution(solutionId);
  const primaryCategory = solution?.categories?.[0];

  return (
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
        <BreadcrumbPage>{solution?.title || "Solution Details"}</BreadcrumbPage>
      </BreadcrumbItem>
    </BreadcrumbList>
  );
}

export function GlobalBreadcrumbs() {
  const matches = useMatches();
  const currentMatch = matches[matches.length - 1];

  if (!currentMatch) return null;

  const handle = currentMatch.handle as AppRouteHandle | undefined;
  if (!handle?.breadcrumb) return null;

  const resolved =
    typeof handle.breadcrumb === "function"
      ? handle.breadcrumb(currentMatch.params)
      : handle.breadcrumb;

  // If the resolved value is already a full BreadcrumbList or React element
  if (
    resolved &&
    typeof resolved === "object" &&
    !Array.isArray(resolved) &&
    "props" in resolved
  ) {
    return <Breadcrumb>{resolved as ReactNode}</Breadcrumb>;
  }

  // If string, render single-item breadcrumb page
  if (typeof resolved === "string") {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>{resolved}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  // If array of crumb specs: [{ label: "Dashboard", to: "/dashboard" }, { label: "Create Solution" }]
  if (Array.isArray(resolved)) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          {resolved.map((item, index) => {
            const isLast = index === resolved.length - 1;
            return (
              <span key={index} className="inline-flex items-center gap-1.5">
                <BreadcrumbItem>
                  {isLast || !item.to ? (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink render={<Link to={item.to} />}>
                      {item.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator />}
              </span>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  return null;
}
