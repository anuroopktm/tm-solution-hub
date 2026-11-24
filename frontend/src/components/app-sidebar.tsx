import type { ComponentProps } from "react";
import { Link } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ConforgeIcon } from "./conforge-logo";
import { BRAND_CONFIG } from "@/config/brand.config";
import { NavMain } from "./navigation/nav-main";
import { NavCategories } from "./navigation/nav-categories";
import { NavUser } from "./navigation/nav-user";

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link to="/dashboard" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <ConforgeIcon />
              </div>

              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {BRAND_CONFIG.name}
                </span>
                <span className="truncate text-xs">
                  {BRAND_CONFIG.subtitle}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="flex flex-col min-h-0 overflow-hidden">
        <NavMain />
        <NavCategories />
      </SidebarContent>

      <NavUser />
      <SidebarRail />
    </Sidebar>
  );
}
