"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Building2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { showSuccessToast, showErrorToast } from "@/lib/utils/toast";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateOrganization,
  useSetCurrentOrganization,
} from "@/lib/api/hooks/use-organizations";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";

const organizationSchema = z.object({
  name: z
    .string()
    .min(1, "Organization name is required")
    .min(3, "Name must be at least 3 characters"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must contain only lowercase letters, numbers, and hyphens",
    ),
  description: z.string().optional(),
});

type OrganizationFormValues = z.infer<typeof organizationSchema>;

export default function NewOrganizationPage() {
  const router = useRouter();
  const { addOrganization } = useWorkspaceStore();
  const createOrganization = useCreateOrganization();
  const setCurrentOrganization = useSetCurrentOrganization();
  const [loading, setLoading] = useState(false);

  const form = useForm<OrganizationFormValues>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
    },
  });

  // Auto-generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleNameChange = (value: string) => {
    form.setValue("name", value);
    form.setValue("slug", generateSlug(value));
  };

  const onSubmit = async (data: OrganizationFormValues) => {
    setLoading(true);
    try {
      // Create organization via API
      const newOrganization = await createOrganization.mutateAsync({
        name: data.name,
        slug: data.slug,
        description: data.description,
      });

      // Set the created organization as current via API
      await setCurrentOrganization.mutateAsync(newOrganization.id);

      // Update workspace store - this ensures the user is treated as owner
      addOrganization({
        id: newOrganization.id,
        name: newOrganization.name,
        slug: newOrganization.slug,
        createdAt:
          typeof newOrganization.createdAt === "string"
            ? newOrganization.createdAt
            : newOrganization.createdAt.toISOString(),
      });

      showSuccessToast("created", "Organization");
      // Refresh to update all context
      router.refresh();
      router.push("/organizations");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : undefined;

      // Check if it's a 403 Forbidden error
      if (error instanceof Error && errorMessage?.includes("Invited users")) {
        showErrorToast(
          "unauthorized",
          undefined,
          "Invited users are not allowed to create organizations.",
        );
        router.push("/organizations");
        return;
      }

      showErrorToast("createFailed", "Organization", errorMessage);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Simple header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4 sm:px-6 lg:px-8 max-w-2xl">
          <div className="flex items-center gap-4">
            <Link href="/organizations">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-semibold">Create Organization</h1>
              <p className="text-sm text-muted-foreground">
                Create a new organization to manage your workspace and team
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 max-w-2xl">
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>New Organization</CardTitle>
                <CardDescription>
                  Set up your organization details
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          onChange={(e) => handleNameChange(e.target.value)}
                          placeholder="Acme Inc."
                          disabled={loading}
                        />
                      </FormControl>
                      <FormDescription>
                        This will be the name of your workspace
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization Slug</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="acme-inc"
                          readOnly
                          className="bg-muted"
                          disabled={loading}
                        />
                      </FormControl>
                      <FormDescription>
                        This will be used in your workspace URL
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="A brief description of your organization"
                          rows={4}
                          disabled={loading}
                        />
                      </FormControl>
                      <FormDescription>
                        Add a description to help identify this organization
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex items-center justify-between pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/organizations")}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Create Organization
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
