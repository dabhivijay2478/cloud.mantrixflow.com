"use client";

import {
  Building2,
  Check,
  Crown,
  Edit,
  Loader2,
  Plus,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { showSuccessToast, showErrorToast } from "@/lib/utils/toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useCanCreateOrganization,
  useCurrentOrganization,
  useOrganizations,
  useSetCurrentOrganization,
} from "@/lib/api/hooks/use-organizations";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { cn } from "@/lib/utils";

export default function OrganizationsPage() {
  const router = useRouter();
  const { data: apiOrganizations, isLoading: orgsLoading } =
    useOrganizations();
  const { data: currentOrg } = useCurrentOrganization();
  const { data: canCreateData } = useCanCreateOrganization();
  const canCreateOrganization = canCreateData?.canCreate ?? true;

  const setCurrentOrganization = useSetCurrentOrganization();

  const handleSwitchOrganization = async (orgId: string) => {
    try {
      // Find the organization in the list
      const orgToSwitch = displayOrganizations.find((org) => org.id === orgId);
      if (!orgToSwitch) {
        showErrorToast("notFound", "Organization");
        return;
      }

      // Set current organization via API
      await setCurrentOrganization.mutateAsync(orgId);

      // Update workspace store
      const { setCurrentOrganization: setStoreCurrentOrg } = useWorkspaceStore.getState();
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
  };

  const handleEditOrganization = (orgId: string) => {
    router.push(`/organizations/${orgId}/edit`);
  };

  // Only use API organizations (which are filtered by membership)
  const displayOrganizations = apiOrganizations || [];
  const isLoading = orgsLoading;

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
        {isLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        ) : !displayOrganizations || displayOrganizations.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No organizations</h3>
              <p className="text-sm text-muted-foreground text-center mb-4">
                {canCreateOrganization
                  ? "Get started by creating your first organization."
                  : "You haven't been added to any organizations yet."}
              </p>
              {canCreateOrganization && (
                <Button onClick={() => router.push("/organizations/new")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Organization
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="mt-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Organizations</CardTitle>
                    <CardDescription>
                      {displayOrganizations.length}{" "}
                      {displayOrganizations.length === 1
                        ? "organization"
                        : "organizations"}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[300px]">Organization</TableHead>
                        <TableHead className="hidden md:table-cell">Slug</TableHead>
                        <TableHead className="hidden lg:table-cell">
                          Description
                        </TableHead>
                        <TableHead className="hidden lg:table-cell">Created</TableHead>
                        <TableHead className="w-[100px]">Status</TableHead>
                        <TableHead className="text-right w-[200px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {displayOrganizations.map((org) => {
                        const isCurrent = currentOrg?.id === org.id;
                        const createdAt = new Date(
                          typeof org.createdAt === "string"
                            ? org.createdAt
                            : org.createdAt,
                        );

                        return (
                          <TableRow
                            key={org.id}
                            className={cn(
                              "hover:bg-muted/50",
                              isCurrent && "bg-primary/5",
                            )}
                          >
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarFallback className="bg-primary/10 text-primary">
                                    <Building2 className="h-5 w-5" />
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium truncate">
                                    {org.name}
                                  </div>
                                  {org.description && (
                                    <div className="text-sm text-muted-foreground truncate md:hidden">
                                      {org.description}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <code className="text-xs bg-muted px-2 py-1 rounded">
                                {org.slug}
                              </code>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <div className="text-sm text-muted-foreground max-w-md truncate">
                                {org.description || (
                                  <span className="italic">No description</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <div className="text-sm text-muted-foreground">
                                {createdAt.toLocaleDateString()}
                              </div>
                            </TableCell>
                            <TableCell>
                              {isCurrent ? (
                                <Badge variant="default" className="gap-1">
                                  <Check className="h-3 w-3" />
                                  Current
                                </Badge>
                              ) : (
                                <Badge variant="outline">Inactive</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
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
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

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
          </>
        )}
      </div>
    </div>
  );
}
