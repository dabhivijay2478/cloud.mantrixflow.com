"use client";

import {
  Building2,
  Check,
  Loader2,
  Mail,
  Palette,
  Save,
  Shield,
} from "lucide-react";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared";
import { ThemeCustomizer } from "@/components/theme/theme-customizer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/utils/toast";

export default function SettingsPage() {
  const { currentOrganization, updateOrganization } = useWorkspaceStore();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("organization");

  // Organization settings
  const [orgName, setOrgName] = useState(currentOrganization?.name || "");
  const [orgSlug, setOrgSlug] = useState(currentOrganization?.slug || "");
  const [orgDescription, setOrgDescription] = useState("");

  // Appearance
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");

  useEffect(() => {
    if (currentOrganization) {
      setOrgName(currentOrganization.name);
      setOrgSlug(currentOrganization.slug);
    }
  }, [currentOrganization]);

  const handleSaveOrganization = async () => {
    if (!currentOrganization) return;

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      updateOrganization(currentOrganization.id, {
        name: orgName,
        slug: orgSlug,
      });
      toast.success(
        "Organization settings saved successfully",
        "Your organization settings have been updated.",
      );
    } catch {
      toast.error(
        "Failed to save settings",
        "Unable to save organization settings. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const _handleSaveAppearance = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      toast.success(
        "Appearance settings saved successfully",
        "Your appearance settings have been updated.",
      );
    } catch {
      toast.error(
        "Failed to save appearance settings",
        "Unable to save appearance settings. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 max-w-7xl">
      <PageHeader
        title="Settings"
        description="Manage your workspace, preferences, and account settings"
      />

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        {/* Improved TabsList */}
        <div className="border-b">
          <TabsList className="inline-flex h-auto w-full sm:w-auto bg-transparent p-0 space-x-1 sm:space-x-2">
            <TabsTrigger
              value="organization"
              className="flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-t-lg data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-b-0 border-transparent"
            >
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Organization</span>
            </TabsTrigger>
            <TabsTrigger
              value="appearance"
              className="flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-t-lg data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-b-0 border-transparent"
            >
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Appearance</span>
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-t-lg data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-b-0 border-transparent"
            >
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Organization Settings */}
        <TabsContent value="organization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Organization Details</CardTitle>
              <CardDescription>
                Update your organization information and settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label
                  htmlFor="org-name"
                  className="text-sm font-medium flex items-center gap-2"
                >
                  Organization Name
                  <span className="text-destructive text-xs">*</span>
                </Label>
                <Input
                  id="org-name"
                  value={orgName}
                  onChange={(e) => {
                    setOrgName(e.target.value);
                    if (
                      !orgSlug ||
                      orgSlug === generateSlug(currentOrganization?.name || "")
                    ) {
                      setOrgSlug(generateSlug(e.target.value));
                    }
                  }}
                  placeholder="Acme Corporation"
                  className="h-10"
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  This is your organization's display name
                </p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="org-slug" className="text-sm font-medium">
                  Organization Slug
                </Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    workspace.com/
                  </span>
                  <Input
                    id="org-slug"
                    value={orgSlug}
                    onChange={(e) => setOrgSlug(e.target.value)}
                    placeholder="acme-corp"
                    className="h-10 flex-1"
                    disabled={loading}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Used in URLs and must be unique. Only lowercase letters,
                  numbers, and hyphens.
                </p>
              </div>

              <div className="space-y-3">
                <Label
                  htmlFor="org-description"
                  className="text-sm font-medium"
                >
                  Description
                  <span className="text-muted-foreground font-normal ml-2 text-xs">
                    (Optional)
                  </span>
                </Label>
                <Textarea
                  id="org-description"
                  value={orgDescription}
                  onChange={(e) => setOrgDescription(e.target.value)}
                  placeholder="A brief description of your organization..."
                  className="min-h-[100px] resize-none"
                  disabled={loading}
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setOrgName(currentOrganization?.name || "");
                    setOrgSlug(currentOrganization?.slug || "");
                  }}
                  disabled={loading}
                  className="w-full sm:w-auto"
                >
                  Reset
                </Button>
                <Button
                  onClick={handleSaveOrganization}
                  disabled={loading || !orgName.trim()}
                  className="w-full sm:w-auto shadow-sm hover:shadow-md transition-shadow"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance */}
        <TabsContent value="appearance" className="space-y-6">
          {/* Theme Mode Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Theme Mode</CardTitle>
              <CardDescription>
                Choose your preferred color scheme
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label className="text-sm font-medium">Theme Preference</Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {(["light", "dark", "system"] as const).map((themeOption) => (
                    <button
                      key={themeOption}
                      type="button"
                      onClick={() => setTheme(themeOption)}
                      className={cn(
                        "group relative p-5 rounded-xl border-2 text-left transition-all duration-300 hover:shadow-md",
                        theme === themeOption
                          ? "border-primary bg-primary/5 shadow-md ring-2 ring-primary/20"
                          : "border-border hover:border-primary/50 hover:bg-accent/50",
                      )}
                      aria-pressed={theme === themeOption}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold capitalize text-base">
                          {themeOption}
                        </div>
                        {theme === themeOption && (
                          <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                            <Check className="h-3 w-3 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {themeOption === "system" && "Follow system preference"}
                        {themeOption === "light" && "Always use light mode"}
                        {themeOption === "dark" && "Always use dark mode"}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Theme Customization */}
          <ThemeCustomizer />
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="space-y-6">
          {/* Account Security Section */}
          {user && (
            <Card>
              <CardHeader>
                <CardTitle>Account Security</CardTitle>
                <CardDescription>
                  Manage your account credentials and security settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border-2 rounded-xl hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Email Address</p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-green-500/10 text-green-700 border-green-500/20"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                </div>
                <Button variant="outline" className="w-full sm:w-auto">
                  Change Password
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
