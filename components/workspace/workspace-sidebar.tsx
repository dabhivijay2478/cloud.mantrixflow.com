"use client";

import {
  Building2,
  ChevronsUpDown,
  Database,
  FileText,
  GitBranch,
  LayoutDashboard,
  Plus,
  Settings,
  Users,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";

function OrganizationSwitcher({
  organizations,
  currentOrganization,
  onOrganizationChange,
  onCreateOrganization,
}: {
  organizations: Array<{ id: string; name: string; slug: string }>;
  currentOrganization: { id: string; name: string; slug: string } | null;
  onOrganizationChange: (org: {
    id: string;
    name: string;
    slug: string;
  }) => void;
  onCreateOrganization: () => void;
}) {
  const { isMobile } = useSidebar();

  if (!currentOrganization) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <Building2 className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {currentOrganization.name}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  Organization
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Organizations
            </DropdownMenuLabel>
            {organizations.map((org, index) => (
              <DropdownMenuItem
                key={org.id}
                onClick={() => onOrganizationChange(org)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-md border">
                  <Building2 className="size-3.5 shrink-0" />
                </div>
                {org.name}
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 p-2"
              onClick={onCreateOrganization}
            >
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <Plus className="size-4" />
              </div>
              <div className="text-muted-foreground font-medium">
                Add organization
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

export function WorkspaceSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const {
    currentOrganization,
    organizations,
    dashboards,
    dataSources,
    setCurrentOrganization,
  } = useWorkspaceStore();

  // Filter dashboards by current organization
  const filteredDashboards = currentOrganization
    ? dashboards.filter(
        (dashboard) => dashboard.organizationId === currentOrganization.id,
      )
    : [];

  // Filter data sources by current organization
  const filteredDataSources = currentOrganization
    ? dataSources.filter(
        (ds) =>
          !ds.organizationId || ds.organizationId === currentOrganization.id,
      )
    : dataSources.filter((ds) => !ds.organizationId);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-2">
        <div className="flex items-center gap-2 px-2">
          <Logo className="h-6 w-6 shrink-0" />
          <span className="font-semibold text-lg group-data-[collapsible=icon]:hidden">
            MantrixFlow
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/workspace"}
                  tooltip="Dashboard"
                >
                  <a href="/workspace">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname?.startsWith("/workspace/dashboards")}
                  tooltip="Dashboards"
                >
                  <a href="/workspace/dashboards">
                    <FileText className="h-4 w-4" />
                    <span>Dashboards</span>
                    {filteredDashboards.length > 0 && (
                      <span className="ml-auto text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
                        {filteredDashboards.length}
                      </span>
                    )}
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname?.startsWith("/workspace/data-sources")}
                  tooltip="Data Sources"
                >
                  <a href="/workspace/data-sources">
                    <Database className="h-4 w-4" />
                    <span>Data Sources</span>
                    {filteredDataSources.length > 0 && (
                      <span className="ml-auto text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
                        {filteredDataSources.length}
                      </span>
                    )}
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname?.startsWith("/workspace/data-pipelines")}
                  tooltip="Data Pipelines"
                >
                  <a href="/workspace/data-pipelines">
                    <GitBranch className="h-4 w-4" />
                    <span>Data Pipelines</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname?.startsWith("/workspace/settings")}
                  tooltip="Settings"
                >
                  <a href="/workspace/settings">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname?.startsWith("/workspace/team")}
                  tooltip="Team"
                >
                  <a href="/workspace/team">
                    <Users className="h-4 w-4" />
                    <span>Team</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <OrganizationSwitcher
          organizations={organizations}
          currentOrganization={currentOrganization}
          onOrganizationChange={setCurrentOrganization}
          onCreateOrganization={() => router.push("/onboarding/organization")}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
