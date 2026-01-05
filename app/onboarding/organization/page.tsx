"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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
import { useCreateOrganization, useUpdateOnboardingStep } from "@/lib/api";
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
});

type OrganizationFormValues = z.infer<typeof organizationSchema>;

export default function OrganizationPage() {
  const router = useRouter();
  const { setOnboardingStep, completeOnboarding } = useWorkspaceStore();
  const createOrganization = useCreateOrganization();
  const updateOnboardingStep = useUpdateOnboardingStep();
  const [loading, setLoading] = useState(false);

  const handleSkip = () => {
    completeOnboarding();
    router.push("/workspace");
  };

  const form = useForm<OrganizationFormValues>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: "",
      slug: "",
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
      await createOrganization.mutateAsync({
        name: data.name,
        slug: data.slug,
      });

      // Update onboarding step
      await updateOnboardingStep.mutateAsync("data-source");

      setOnboardingStep("data-source");
      toast.success("Organization created successfully");
      router.push("/onboarding/data-source");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Please try again";
      toast.error("Failed to create organization", {
        description: errorMessage,
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>Create Your Organization</CardTitle>
                <CardDescription>Step 1 of 3</CardDescription>
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
                        />
                      </FormControl>
                      <FormDescription>
                        This will be used in your workspace URL
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex items-center justify-between pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/onboarding/welcome")}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleSkip}
                      disabled={loading}
                    >
                      Skip for now
                    </Button>
                    <Button type="submit" disabled={loading}>
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
