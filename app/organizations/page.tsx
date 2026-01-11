"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowLeft, Building2, Check, Crown, Edit, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";
import { DataTable } from "@/components/shared";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  useCanCreateOrganization,
  useCurrentOrganization,
  useOrganizations,
  useSetCurrentOrganization,
} from "@/lib/api/hooks/use-organizations";
import type { Organization } from "@/lib/api/types/organizations";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toast";

export default function OrganizationsPage() {
  const router = useRouter();
  const { data: apiOrganizations, isLoading: orgsLoading } = useOrganizations();
  const { data: currentOrg } = useCurrentOrganization();
  const { data: canCreateData } = useCanCreateOrganization();
  const canCreateOrganization = canCreateData?.canCreate ?? true;

  const setCurrentOrganization = useSetCurrentOrganization();

  // Only use API organizations (which are filtered by membership)
  const displayOrganizations = apiOrganizations || [];
  const isLoading = orgsLoading;

  const handleSwitchOrganization = useCallback(
    async (orgId: string) => {
      try {
        // Find the organization in the list
        const orgToSwitch = displayOrganizations.find(
          (org) => org.id === orgId,
        );
        if (!orgToSwitch) {
          showErrorToast("notFound", "Organization");
          return;
        }

        // Set current organization via API
        await setCurrentOrganization.mutateAsync(orgId);

        // Update workspace store
        const { setCurrentOrganization: setStoreCurrentOrg } =
          useWorkspaceStore.getState();
        setStoreCurrentOrg({
          id: orgToSwitch.id,
          name: orgToSwitch.name,
          slug: orgToSwitch.slug,
          createdAt:
            typeof orgToSwitch.createdAt === "string"
              ? orgToSwitch.createdAt
              : orgToSwitch.createdAt.toISOString(),
        });

        showSuccessToast("switched", "Organization");
        // Redirect to workspace to see updated data
        router.push("/workspace");
      } catch (error) {
        showErrorToast(
          "switchFailed",
          "Organization",
          error instanceof Error ? error.message : undefined,
        );
      }
    },
    [displayOrganizations, setCurrentOrganization, router],
  );

  const handleEditOrganization = useCallback(
    (orgId: string) => {
      router.push(`/organizations/${orgId}/edit`);
    },
    [router],
  );

  // Column definitions for DataTable
  const columns: ColumnDef<Organization>[] = useMemo(
    () => {
      const baseColumns: ColumnDef<Organization>[] = [
        {
          accessorKey: "name",
          header: "Organization",
          cell: ({ row }) => {
            const org = row.original;
            return (
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    <Building2 className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{org.name}</div>
                  {org.description && (
                    <div className="text-sm text-muted-foreground truncate md:hidden">
                      {org.description}
                    </div>
                  )}
                </div>
              </div>
            );
          },
        },
        {
          accessorKey: "slug",
          header: "Slug",
          cell: ({ row }) => (
            <code className="text-xs bg-muted px-2 py-1 rounded">
              {row.original.slug}
            </code>
          ),
        },
        {
          accessorKey: "description",
          header: "Description",
          cell: ({ row }) => {
            const description = row.original.description;
            return (
              <div className="text-sm text-muted-foreground max-w-md truncate">
                {description || <span className="italic">No description</span>}
              </div>
            );
          },
        },
        {
          accessorKey: "createdAt",
          header: "Created",
          cell: ({ row }) => {
            const createdAt = new Date(
              typeof row.original.createdAt === "string"
                ? row.original.createdAt
                : row.original.createdAt,
            );
            return (
              <div className="text-sm text-muted-foreground">
                {createdAt.toLocaleDateString()}
              </div>
            );
          },
        },
        {
          accessorKey: "status",
          header: "Status",
          cell: ({ row }) => {
            const org = row.original;
            const isCurrent = currentOrg?.id === org.id;
            return isCurrent ? (
              <Badge variant="default" className="gap-1">
                <Check className="h-3 w-3" />
                Current
              </Badge>
            ) : (
              <Badge variant="outline">Inactive</Badge>
            );
          },
        },
      ];

      // Only add actions column if user can create organizations (not an invited user)
      if (canCreateOrganization) {
        baseColumns.push({
          id: "actions",
          header: () => <div className="text-right">Actions</div>,
          cell: ({ row }) => {
            const org = row.original;
            const isCurrent = currentOrg?.id === org.id;
            return (
              <div className="flex items-center justify-end gap-2">
                {!isCurrent && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSwitchOrganization(org.id)}
                  >
                    Switch
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEditOrganization(org.id)}
                  title="Edit organization"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            );
          },
          enableHiding: false,
        });
      }

      return baseColumns;
    },
    [currentOrg, handleSwitchOrganization, handleEditOrganization, canCreateOrganization],
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Simple header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/workspace">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-semibold">Organizations</h1>
                <p className="text-sm text-muted-foreground">
                  Manage your organizations
                </p>
              </div>
            </div>
            {canCreateOrganization && (
              <Button onClick={() => router.push("/organizations/new")}>
                <Plus className="mr-2 h-4 w-4" />
                Create Organization
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 max-w-7xl">
        <DataTable
          tableId="organizations-table"
          columns={columns}
          data={displayOrganizations}
          isLoading={isLoading}
          enableSorting
          defaultVisibleColumns={
            canCreateOrganization
              ? ["name", "slug", "description", "createdAt", "status", "actions"]
              : ["name", "slug", "description", "createdAt", "status"]
          }
          fixedColumns={canCreateOrganization ? ["name", "actions"] : ["name"]}
          emptyMessage="No organizations"
          emptyDescription={
            canCreateOrganization
              ? "Get started by creating your first organization."
              : "You haven't been added to any organizations yet."
          }
        />

        {!canCreateOrganization && (
          <Card className="mt-6 border-muted">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Crown className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold mb-1">Invited User</h4>
                  <p className="text-sm text-muted-foreground">
                    As an invited user, you can view and work within
                    organizations you've been added to, but you cannot create
                    new organizations.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
