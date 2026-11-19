import { Link, useLocation } from "react-router-dom";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Grid2X2 } from "lucide-react";
import { CategoryIcon } from "@/constants/category-icons";
import { useCategories } from "@/hooks/use-categories";

export function NavCategories() {
  const location = useLocation();
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  return (
    <ScrollArea className="flex-1 min-h-0">
      <SidebarGroup>
        <SidebarGroupLabel>Categories</SidebarGroupLabel>

        <SidebarMenu className="gap-1">
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="All Categories"
              isActive={location.pathname === "/categories"}
              render={
                <Link to="/categories">
                  <Grid2X2 className="size-4 shrink-0" />
                  <span>All Categories</span>
                </Link>
              }
            />
          </SidebarMenuItem>

          {categoriesLoading && (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 8 }).map((_, index) => (
                <Skeleton key={index} className="h-8 w-full rounded-md" />
              ))}
            </div>
          )}

          {!categoriesLoading &&
            categories?.map((category) => (
              <SidebarMenuItem key={category.id}>
                <SidebarMenuButton
                  tooltip={category.name}
                  isActive={location.pathname === `/categories/${category.id}`}
                  render={
                    <Link to={`/categories/${category.id}`}>
                      <CategoryIcon
                        name={category.icon}
                        className="size-4 shrink-0"
                      />
                      <span>{category.name}</span>
                    </Link>
                  }
                />
              </SidebarMenuItem>
            ))}
        </SidebarMenu>
      </SidebarGroup>
    </ScrollArea>
  );
}
