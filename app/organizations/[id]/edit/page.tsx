"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Building2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
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
  useOrganization,
  useUpdateOrganization,
} from "@/lib/api/hooks/use-organizations";

const organizationEditSchema = z.object({
  description: z.string().optional(),
});

type OrganizationEditFormValues = z.infer<typeof organizationEditSchema>;

export default function EditOrganizationPage() {
  const router = useRouter();
  const params = useParams();
  const organizationId = params.id as string;
  const { data: organization, isLoading: orgLoading } =
    useOrganization(organizationId);
  const updateOrganization = useUpdateOrganization();
  const [loading, setLoading] = useState(false);

  const form = useForm<OrganizationEditFormValues>({
    resolver: zodResolver(organizationEditSchema),
    defaultValues: {
      description: "",
    },
  });

  // Initialize form with organization data
  useEffect(() => {
    if (organization) {
      form.reset({
        description: organization.description || "",
      });
    }
  }, [organization, form]);

  const onSubmit = async (data: OrganizationEditFormValues) => {
    setLoading(true);
    try {
      await updateOrganization.mutateAsync({
        id: organizationId,
        data: {
          description: data.description,
        },
      });

      showSuccessToast("updated", "Organization");
      router.push("/organizations");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : undefined;

      showErrorToast("updateFailed", "Organization", errorMessage);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (orgLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b">
          <div className="container mx-auto px-4 py-4 sm:px-6 lg:px-8 max-w-2xl">
            <div className="flex items-center gap-4">
              <Link href="/organizations">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-semibold">
                  Organization not found
                </h1>
              </div>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 max-w-2xl">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Organization not found
              </h3>
              <p className="text-sm text-muted-foreground text-center mb-4">
                The organization you're looking for doesn't exist or you don't
                have access to it.
              </p>
              <Button onClick={() => router.push("/organizations")}>
                Back to Organizations
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
              <h1 className="text-2xl font-semibold">Edit Organization</h1>
              <p className="text-sm text-muted-foreground">
                {organization.name}
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
                <CardTitle>{organization.name}</CardTitle>
                <CardDescription>
                  Update organization description
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 mb-6">
              {/* Read-only fields */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Organization Name
                  </label>
                  <Input
                    value={organization.name}
                    disabled
                    className="bg-muted cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground">
                    Organization name cannot be changed
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Organization Slug
                  </label>
                  <Input
                    value={organization.slug}
                    disabled
                    className="bg-muted cursor-not-allowed font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    Organization slug cannot be changed
                  </p>
                </div>
              </div>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="A brief description of your organization"
                          rows={4}
                          disabled={loading}
                        />
                      </FormControl>
                      <FormDescription>
                        Update the description for this organization
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
                    Save Changes
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
