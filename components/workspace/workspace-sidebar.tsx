"use client";

import {
  Building2,
  ChevronsUpDown,
  Database,
  GitBranch,
  LayoutDashboard,
  List,
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
  useCanCreateOrganization,
  useCurrentOrganization,
  useOrganizations,
  useSetCurrentOrganization,
} from "@/lib/api/hooks/use-organizations";
import {
  type Organization,
  useWorkspaceStore,
} from "@/lib/stores/workspace-store";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toast";

function OrganizationSwitcher({
  organizations,
  currentOrganization,
  onOrganizationChange,
  onCreateOrganization,
  canCreateOrganization,
}: {
  organizations: Organization[];
  currentOrganization: Organization | null;
  onOrganizationChange: (org: Organization | null) => void;
  onCreateOrganization: () => void;
  canCreateOrganization: boolean;
}) {
  const { isMobile } = useSidebar();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
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
                  className="gap-2 p-2 cursor-pointer"
                >
                  <div className="flex size-6 items-center justify-center ">
                    <Building2 className="size-3.5 shrink-0" />
                  </div>
                  {org.name}
                  <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem disabled className="gap-2 p-2 cursor-pointer">
                <div className="flex size-6 items-center justify-center ">
                  <Building2 className="size-3.5 shrink-0" />
                </div>
                No organizations
              </DropdownMenuItem>
            )}
            {/* Only show "Add organization" option if user can create organizations */}
            {canCreateOrganization && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="gap-2 p-2 cursor-pointer"
                  onClick={onCreateOrganization}
                >
                  <div className="flex size-6 items-center justify-center ">
                    <Plus className="size-4" />
                  </div>
                  <div className="text-muted-foreground font-medium">
                    Add organization
                  </div>
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                href="/organizations"
                className="gap-2 p-2 flex items-center cursor-pointer"
              >
                <div className="flex size-6 items-center justify-center ">
                  <List className="size-4" />
                </div>
                <div className="text-muted-foreground font-medium">
                  View all organizations
                </div>
              </Link>
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
    setCurrentOrganization: setStoreCurrentOrganization,
  } = useWorkspaceStore();

  // Sync organizations from API to workspace store
  const { data: apiOrganizations, isLoading: orgsLoading } = useOrganizations();
  const { data: apiCurrentOrg, isLoading: currentOrgLoading } =
    useCurrentOrganization();
  const { data: canCreateData } = useCanCreateOrganization();
  const canCreateOrganization = canCreateData?.canCreate ?? true; // Default to true for backwards compatibility
  const setCurrentOrganizationAPI = useSetCurrentOrganization();

  // Handle organization change from sidebar switcher
  const handleOrganizationChange = async (org: Organization | null) => {
    if (!org) {
      setStoreCurrentOrganization(null);
      return;
    }

    try {
      // Update API first
      await setCurrentOrganizationAPI.mutateAsync(org.id);

      // Update store
      const createdAtString =
        typeof org.createdAt === "string"
          ? org.createdAt
          : org.createdAt instanceof Date
            ? org.createdAt.toISOString()
            : new Date().toISOString();

      setStoreCurrentOrganization({
        id: org.id,
        name: org.name,
        slug: org.slug,
        createdAt: createdAtString,
      });

      showSuccessToast("switched", "Organization");
      // Refresh to update all data across the app
      router.refresh();
    } catch (error) {
      showErrorToast(
        "switchFailed",
        "Organization",
        error instanceof Error ? error.message : undefined,
      );
    }
  };

  useEffect(() => {
    // Only sync if API data is loaded
    if (orgsLoading || currentOrgLoading) return;

    const {
      currentOrganization: storeCurrentOrg,
      setOrganizations,
      setCurrentOrganization: setStoreCurrentOrg,
    } = useWorkspaceStore.getState();

    // Sync organizations list from API to store
    // Set all organizations at once to ensure we have the complete list
    if (apiOrganizations && apiOrganizations.length > 0) {
      const orgsData = apiOrganizations.map((apiOrg) => ({
        id: apiOrg.id,
        name: apiOrg.name,
        slug: apiOrg.slug,
        createdAt:
          typeof apiOrg.createdAt === "string"
            ? apiOrg.createdAt
            : apiOrg.createdAt.toISOString(),
      }));

      // Set all organizations at once
      setOrganizations(orgsData);

      // If current org is not in the list, or if we don't have a current org, set it
      const currentOrgId = storeCurrentOrg?.id;
      const hasCurrentOrgInList = orgsData.some(
        (org) => org.id === currentOrgId,
      );

      if (!hasCurrentOrgInList) {
        // Current org is not in the list, switch to API current org or first available
        if (apiCurrentOrg) {
          setStoreCurrentOrg({
            id: apiCurrentOrg.id,
            name: apiCurrentOrg.name,
            slug: apiCurrentOrg.slug,
            createdAt:
              typeof apiCurrentOrg.createdAt === "string"
                ? apiCurrentOrg.createdAt
                : apiCurrentOrg.createdAt.toISOString(),
          });
        } else if (orgsData.length > 0) {
          // Set first organization as current if no current org from API
          setStoreCurrentOrg(orgsData[0]);
        } else {
          setStoreCurrentOrg(null);
        }
      }
    } else if (apiOrganizations && apiOrganizations.length === 0) {
      // No organizations from API, clear the store
      setOrganizations([]);
      if (storeCurrentOrg) {
        setStoreCurrentOrg(null);
      }
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

      // Update current org if it's different (using store state to avoid loop)
      const currentStoreOrg = useWorkspaceStore.getState().currentOrganization;
      if (!currentStoreOrg || currentStoreOrg.id !== apiCurrentOrg.id) {
        setStoreCurrentOrg(currentOrgData);
      }
    } else if (apiOrganizations && apiOrganizations.length > 0) {
      // No current org from API, but we have organizations - set first one if no current org
      const currentStoreOrg = useWorkspaceStore.getState().currentOrganization;
      if (!currentStoreOrg) {
        const firstOrg = apiOrganizations[0];
        setStoreCurrentOrg({
          id: firstOrg.id,
          name: firstOrg.name,
          slug: firstOrg.slug,
          createdAt:
            typeof firstOrg.createdAt === "string"
              ? firstOrg.createdAt
              : firstOrg.createdAt.toISOString(),
        });
      }
    }
  }, [apiOrganizations, apiCurrentOrg, orgsLoading, currentOrgLoading]);

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
          onOrganizationChange={handleOrganizationChange}
          onCreateOrganization={() => router.push("/organizations/new")}
          canCreateOrganization={canCreateOrganization}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
