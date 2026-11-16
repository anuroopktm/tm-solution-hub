import { useNavigate } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { PageHeader } from "@/components/common/page-header";
import { useCategories } from "@/hooks/use-categories";
import { CategoryGrid } from "@/features/categories/components/category-grid";

export default function CategoriesPage() {
  const navigate = useNavigate();
  const {
    data: categories,
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useCategories();

  return (
    <>
      <PageHeader>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Categories</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </PageHeader>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Solution Categories
          </h1>
          <p className="text-sm text-muted-foreground">
            Browse and select a category to view its associated technical
            solutions.
          </p>
        </div>

        <CategoryGrid
          categories={categories}
          isLoading={categoriesLoading}
          isError={categoriesError}
          onSelectCategory={(id) => navigate(`/categories/${id}`)}
        />
      </div>
    </>
  );
}
