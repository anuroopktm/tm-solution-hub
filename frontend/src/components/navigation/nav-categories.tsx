import { Link, useLocation } from "react-router-dom";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
} from "@/components/ui/sidebar";
import { Grid2X2 } from "lucide-react";
import { CategoryIcon } from "@/constants/category-icons";
import { useCategories } from "@/hooks/use-categories";

export function NavCategories() {
  const location = useLocation();
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  return (
    <SidebarGroup className="flex-1 min-h-0 overflow-y-auto">
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
          <div className="flex flex-col gap-1">
            {Array.from({ length: 4 }).map((_, index) => (
              <SidebarMenuItem key={index}>
                <SidebarMenuSkeleton showIcon />
              </SidebarMenuItem>
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
  );
}
