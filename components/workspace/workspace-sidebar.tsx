"use client";

import {
  Building2,
  ChevronsUpDown,
  Database,
  GitBranch,
  LayoutDashboard,
  Plus,
  Settings,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
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
import {
  useCurrentOrganization,
  useOrganizations,
} from "@/lib/api/hooks/use-organizations";
import {
  type Organization,
  useWorkspaceStore,
} from "@/lib/stores/workspace-store";

function OrganizationSwitcher({
  organizations,
  currentOrganization,
  onOrganizationChange,
  onCreateOrganization,
}: {
  organizations: Organization[];
  currentOrganization: Organization | null;
  onOrganizationChange: (org: Organization | null) => void;
  onCreateOrganization: () => void;
}) {
  const { isMobile } = useSidebar();

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
                  {currentOrganization?.name || "Select Organization"}
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
            {organizations.length > 0 ? (
              organizations.map((org, index) => (
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
              ))
            ) : (
              <DropdownMenuItem disabled className="gap-2 p-2">
                <div className="flex size-6 items-center justify-center rounded-md border">
                  <Building2 className="size-3.5 shrink-0" />
                </div>
                No organizations
              </DropdownMenuItem>
            )}
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
    dataSources,
    setCurrentOrganization,
  } = useWorkspaceStore();

  // Sync organizations from API to workspace store
  const { data: apiOrganizations, isLoading: orgsLoading } = useOrganizations();
  const { data: apiCurrentOrg, isLoading: currentOrgLoading } =
    useCurrentOrganization();

  useEffect(() => {
    // Only sync if API data is loaded
    if (orgsLoading || currentOrgLoading) return;

    // Sync organizations list from API to store
    if (apiOrganizations && apiOrganizations.length > 0) {
      const { addOrganization, updateOrganization } = useWorkspaceStore.getState();
      
      // Convert API organizations to store format and sync
      const apiOrgMap = new Map(
        apiOrganizations.map((org) => [
          org.id,
          {
            id: org.id,
            name: org.name,
            slug: org.slug,
            createdAt:
              typeof org.createdAt === "string"
                ? org.createdAt
                : org.createdAt.toISOString(),
          },
        ])
      );

      // Update or add organizations from API
      apiOrganizations.forEach((apiOrg) => {
        const storeOrg = organizations.find((o) => o.id === apiOrg.id);
        const orgData = {
          id: apiOrg.id,
          name: apiOrg.name,
          slug: apiOrg.slug,
          createdAt:
            typeof apiOrg.createdAt === "string"
              ? apiOrg.createdAt
              : apiOrg.createdAt.toISOString(),
        };

        if (storeOrg) {
          // Update existing organization if data changed
          if (
            storeOrg.name !== orgData.name ||
            storeOrg.slug !== orgData.slug
          ) {
            updateOrganization(apiOrg.id, orgData);
          }
        } else {
          // Add new organization
          addOrganization(orgData);
        }
      });

      // Remove organizations from store that don't exist in API
      const apiOrgIds = new Set(apiOrganizations.map((org) => org.id));
      organizations.forEach((storeOrg) => {
        if (!apiOrgIds.has(storeOrg.id)) {
          // Organization was removed, update current org if needed
          if (currentOrganization?.id === storeOrg.id) {
            // Switch to API current org or first available org
            if (apiCurrentOrg) {
              setCurrentOrganization({
                id: apiCurrentOrg.id,
                name: apiCurrentOrg.name,
                slug: apiCurrentOrg.slug,
                createdAt:
                  typeof apiCurrentOrg.createdAt === "string"
                    ? apiCurrentOrg.createdAt
                    : apiCurrentOrg.createdAt.toISOString(),
              });
            } else if (apiOrganizations.length > 0) {
              const firstOrg = apiOrganizations[0];
              setCurrentOrganization({
                id: firstOrg.id,
                name: firstOrg.name,
                slug: firstOrg.slug,
                createdAt:
                  typeof firstOrg.createdAt === "string"
                    ? firstOrg.createdAt
                    : firstOrg.createdAt.toISOString(),
              });
            } else {
              setCurrentOrganization(null);
            }
          }
        }
      });
    }

    // Sync current organization from API
    if (apiCurrentOrg) {
      const currentOrgData = {
        id: apiCurrentOrg.id,
        name: apiCurrentOrg.name,
        slug: apiCurrentOrg.slug,
        createdAt:
          typeof apiCurrentOrg.createdAt === "string"
            ? apiCurrentOrg.createdAt
            : apiCurrentOrg.createdAt.toISOString(),
      };

      // Update current org if it's different
      if (
        !currentOrganization ||
        currentOrganization.id !== apiCurrentOrg.id
      ) {
        setCurrentOrganization(currentOrgData);
      }
    } else if (apiOrganizations && apiOrganizations.length > 0 && !currentOrganization) {
      // No current org from API, but we have organizations - set first one
      const firstOrg = apiOrganizations[0];
      setCurrentOrganization({
        id: firstOrg.id,
        name: firstOrg.name,
        slug: firstOrg.slug,
        createdAt:
          typeof firstOrg.createdAt === "string"
            ? firstOrg.createdAt
            : firstOrg.createdAt.toISOString(),
      });
    }
  }, [
    apiOrganizations,
    apiCurrentOrg,
    currentOrganization,
    organizations,
    orgsLoading,
    currentOrgLoading,
    setCurrentOrganization,
  ]);

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
                  <Link href="/workspace">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname?.startsWith("/workspace/data-sources")}
                  tooltip="Data Sources"
                >
                  <Link href="/workspace/data-sources">
                    <Database className="h-4 w-4" />
                    <span>Data Sources</span>
                    {filteredDataSources.length > 0 && (
                      <span className="ml-auto text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
                        {filteredDataSources.length}
                      </span>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname?.startsWith("/workspace/data-pipelines")}
                  tooltip="Data Pipelines"
                >
                  <Link href="/workspace/data-pipelines">
                    <GitBranch className="h-4 w-4" />
                    <span>Data Pipelines</span>
                  </Link>
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
                  <Link href="/workspace/settings">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname?.startsWith("/workspace/team")}
                  tooltip="Team"
                >
                  <Link href="/workspace/team">
                    <Users className="h-4 w-4" />
                    <span>Team</span>
                  </Link>
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
