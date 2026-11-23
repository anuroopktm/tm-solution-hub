import { useState } from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

import { useCategories } from "@/hooks/use-categories";
import { useDebounce } from "@/hooks/use-debounce";
import type { Category } from "@/types/category.types";
import { CategoryIcon } from "@/constants/category-icons";

import { CategoryFormDialog } from "./category-form-dialog";
import { CategoryDeleteDialog } from "./category-delete-dialog";

import { Plus, Pencil, Trash2, ExternalLink, FolderTree } from "lucide-react";

export function CategoryManageView() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const { data: categories = [], isLoading } = useCategories(debouncedSearch);

  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null,
  );

  const handleOpenCreate = () => {
    setCategoryToEdit(null);
    setFormDialogOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setCategoryToEdit(category);
    setFormDialogOpen(true);
  };

  const handleOpenDelete = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">Category Management</h1>
        <p className="text-muted-foreground">
          Create and organize technical domain categories across the Solutions
          Hub.
        </p>
      </div>

      {/* Filter and Actions */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder="Filter categories by name or description..."
          className="max-w-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Button onClick={handleOpenCreate}>
          <Plus />
          Add Category
        </Button>
      </div>

      {/* Categories Table */}
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader className="bg-secondary">
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Solutions</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="size-8 rounded-md" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-48" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-24 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-48 text-center">
                  <Empty className="border-none">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <FolderTree />
                      </EmptyMedia>
                      <EmptyTitle>No categories found</EmptyTitle>
                      <EmptyDescription>
                        {search.trim()
                          ? "No categories found matching your search."
                          : "No categories have been created yet."}
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                </TableCell>
              </TableRow>
            ) : (
              categories.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-muted/40 text-primary">
                        <CategoryIcon name={cat.icon} className="size-4" />
                      </div>
                      <Link
                        to={`/categories/${cat.id}`}
                        className="hover:underline hover:text-primary font-medium"
                      >
                        {cat.name}
                      </Link>
                    </div>
                  </TableCell>

                  <TableCell className="max-w-xs md:max-w-md truncate text-muted-foreground">
                    {cat.description || "—"}
                  </TableCell>

                  <TableCell>
                    <Badge variant="secondary">
                      {cat.solutions_count ?? 0} solution(s)
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        nativeButton={false}
                        variant="ghost"
                        size="icon"
                        render={<Link to={`/categories/${cat.id}`} />}
                        title="View category solutions"
                      >
                        <ExternalLink />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenEdit(cat)}
                        title="Edit category"
                      >
                        <Pencil />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDelete(cat)}
                        title="Delete category"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer */}
      {!isLoading && (
        <p className="text-sm text-muted-foreground">
          Showing {categories.length}{" "}
          {categories.length === 1 ? "category" : "categories"}
        </p>
      )}

      {/* Dialogs */}
      <CategoryFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        categoryToEdit={categoryToEdit}
      />

      <CategoryDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        category={categoryToDelete}
      />
    </div>
  );
}
