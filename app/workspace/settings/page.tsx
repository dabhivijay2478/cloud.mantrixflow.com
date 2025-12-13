"use client";

import {
  Bell,
  Building2,
  Check,
  Copy,
  Key,
  Loader2,
  Mail,
  Palette,
  Plus,
  Save,
  Shield,
  Trash2,
  User,
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

  // User preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [dashboardUpdates, setDashboardUpdates] = useState(true);
  const [dataSourceAlerts, setDataSourceAlerts] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(false);

  // Appearance
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const [compactMode, setCompactMode] = useState(false);
  const [showTooltips, setShowTooltips] = useState(true);

  // API Keys (mock)
  const [apiKeys, setApiKeys] = useState([
    {
      id: "1",
      name: "Production API Key",
      key: "sk_live_...",
      created: "2024-01-15",
      lastUsed: "2024-04-20",
    },
    {
      id: "2",
      name: "Development API Key",
      key: "sk_test_...",
      created: "2024-02-10",
      lastUsed: "2024-04-18",
    },
  ]);

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

  const handleSavePreferences = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      toast.success(
        "Preferences saved successfully",
        "Your notification preferences have been updated.",
      );
    } catch {
      toast.error(
        "Failed to save preferences",
        "Unable to save preferences. Please try again.",
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

  const handleCopyApiKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success(
      "API key copied to clipboard",
      "The API key has been copied to your clipboard.",
    );
  };

  const handleDeleteApiKey = (id: string) => {
    if (
      confirm(
        "Are you sure you want to delete this API key? This action cannot be undone.",
      )
    ) {
      setApiKeys(apiKeys.filter((k) => k.id !== id));
      toast.success(
        "API key deleted",
        "The API key has been successfully deleted.",
      );
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
              value="preferences"
              className="flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-t-lg data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-b-0 border-transparent"
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Preferences</span>
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-t-lg data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-b-0 border-transparent"
            >
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
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

        {/* Preferences */}
        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Preferences</CardTitle>
              <CardDescription>
                Customize your workspace experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start sm:items-center justify-between gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                  <div className="space-y-1 flex-1">
                    <Label
                      htmlFor="compact-mode"
                      className="text-sm font-medium cursor-pointer"
                    >
                      Compact Mode
                    </Label>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Reduce spacing and padding for a more compact interface
                    </p>
                  </div>
                  <Switch
                    id="compact-mode"
                    checked={compactMode}
                    onCheckedChange={setCompactMode}
                    disabled={loading}
                  />
                </div>

                <div className="flex items-start sm:items-center justify-between gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                  <div className="space-y-1 flex-1">
                    <Label
                      htmlFor="show-tooltips"
                      className="text-sm font-medium cursor-pointer"
                    >
                      Show Tooltips
                    </Label>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Display helpful tooltips on hover
                    </p>
                  </div>
                  <Switch
                    id="show-tooltips"
                    checked={showTooltips}
                    onCheckedChange={setShowTooltips}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCompactMode(false);
                    setShowTooltips(true);
                  }}
                  disabled={loading}
                  className="w-full sm:w-auto"
                >
                  Reset to Defaults
                </Button>
                <Button
                  onClick={handleSavePreferences}
                  disabled={loading}
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
                      Save Preferences
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose how you want to be notified about updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start sm:items-center justify-between gap-4 p-4 rounded-lg border-2 bg-card hover:bg-accent/50 transition-colors">
                  <div className="space-y-1 flex-1">
                    <Label
                      htmlFor="email-notifications"
                      className="text-sm font-medium cursor-pointer flex items-center gap-2"
                    >
                      <Mail className="h-4 w-4 text-primary" />
                      Email Notifications
                    </Label>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                    disabled={loading}
                  />
                </div>

                <div className="flex items-start sm:items-center justify-between gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                  <div className="space-y-1 flex-1">
                    <Label
                      htmlFor="dashboard-updates"
                      className="text-sm font-medium cursor-pointer"
                    >
                      Dashboard Updates
                    </Label>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Get notified when dashboards are updated
                    </p>
                  </div>
                  <Switch
                    id="dashboard-updates"
                    checked={dashboardUpdates}
                    onCheckedChange={setDashboardUpdates}
                    disabled={loading || !emailNotifications}
                  />
                </div>

                <div className="flex items-start sm:items-center justify-between gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                  <div className="space-y-1 flex-1">
                    <Label
                      htmlFor="data-source-alerts"
                      className="text-sm font-medium cursor-pointer"
                    >
                      Data Source Alerts
                    </Label>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Receive alerts about data source issues
                    </p>
                  </div>
                  <Switch
                    id="data-source-alerts"
                    checked={dataSourceAlerts}
                    onCheckedChange={setDataSourceAlerts}
                    disabled={loading || !emailNotifications}
                  />
                </div>

                <div className="flex items-start sm:items-center justify-between gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                  <div className="space-y-1 flex-1">
                    <Label
                      htmlFor="weekly-reports"
                      className="text-sm font-medium cursor-pointer"
                    >
                      Weekly Reports
                    </Label>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Receive weekly summary reports
                    </p>
                  </div>
                  <Switch
                    id="weekly-reports"
                    checked={weeklyReports}
                    onCheckedChange={setWeeklyReports}
                    disabled={loading || !emailNotifications}
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEmailNotifications(true);
                    setDashboardUpdates(true);
                    setDataSourceAlerts(true);
                    setWeeklyReports(false);
                  }}
                  disabled={loading}
                  className="w-full sm:w-auto"
                >
                  Reset to Defaults
                </Button>
                <Button
                  onClick={handleSavePreferences}
                  disabled={loading}
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
                      Save Preferences
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
          {/* API Keys Section */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>API Keys</CardTitle>
                  <CardDescription className="mt-1">
                    Manage your API keys for programmatic access
                  </CardDescription>
                </div>
                <Button size="sm" className="w-full sm:w-auto shadow-sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Create API Key
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {apiKeys.map((apiKey) => (
                <div
                  key={apiKey.id}
                  className="group border-2 rounded-xl p-4 sm:p-5 hover:border-primary/50 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    <div className="flex-1 space-y-3 w-full">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                        <span className="font-semibold text-base">
                          {apiKey.name}
                        </span>
                        <Badge
                          variant={
                            apiKey.key.includes("live")
                              ? "default"
                              : "secondary"
                          }
                          className="text-xs w-fit"
                        >
                          {apiKey.key.includes("live")
                            ? "Production"
                            : "Development"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border">
                        <code className="flex-1 text-sm font-mono truncate">
                          {apiKey.key}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyApiKey(apiKey.key)}
                          className="h-8 px-3 shrink-0 hover:bg-background"
                        >
                          <Copy className="h-3.5 w-3.5 mr-1.5" />
                          Copy
                        </Button>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-muted-foreground">
                        <span>
                          Created:{" "}
                          {new Date(apiKey.created).toLocaleDateString()}
                        </span>
                        <span>
                          Last used:{" "}
                          {new Date(apiKey.lastUsed).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteApiKey(apiKey.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 w-full lg:w-auto"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}

              {apiKeys.length === 0 && (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                    <Key className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-lg font-medium mb-2">
                    No API keys created yet
                  </p>
                  <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                    Create an API key to get started with programmatic access to
                    your workspace
                  </p>
                  <Button className="shadow-sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First API Key
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

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
