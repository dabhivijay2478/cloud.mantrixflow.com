"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { useAuthStore } from "@/lib/stores/auth-store";
import {
  Save,
  Settings,
  Building2,
  User,
  Bell,
  Palette,
  Shield,
  Key,
  Mail,
  Globe,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Trash2,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { currentOrganization, updateOrganization, organizations } = useWorkspaceStore();
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
    { id: "1", name: "Production API Key", key: "sk_live_...", created: "2024-01-15", lastUsed: "2024-04-20" },
    { id: "2", name: "Development API Key", key: "sk_test_...", created: "2024-02-10", lastUsed: "2024-04-18" },
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
      toast.success("Organization settings saved successfully");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      toast.success("Preferences saved successfully");
    } catch (error) {
      toast.error("Failed to save preferences");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAppearance = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      toast.success("Appearance settings saved successfully");
    } catch (error) {
      toast.error("Failed to save appearance settings");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyApiKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success("API key copied to clipboard");
  };

  const handleDeleteApiKey = (id: string) => {
    if (confirm("Are you sure you want to delete this API key? This action cannot be undone.")) {
      setApiKeys(apiKeys.filter((k) => k.id !== id));
      toast.success("API key deleted");
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Settings className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">Settings</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Manage your workspace, preferences, and account settings
              </p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 h-auto p-1 bg-muted/50">
            <TabsTrigger value="organization" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Organization</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Preferences</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Appearance</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
          </TabsList>

          {/* Organization Settings */}
          <TabsContent value="organization" className="space-y-6">
            <Card className="border-2 shadow-lg">
              <CardHeader className="pb-4 border-b bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
      <div>
                    <CardTitle className="text-xl">Organization Settings</CardTitle>
                    <CardDescription className="mt-1">
                      Manage your organization details and information
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="org-name" className="text-base font-semibold flex items-center gap-2">
                    Organization Name
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="org-name"
                    value={orgName}
                    onChange={(e) => {
                      setOrgName(e.target.value);
                      if (!orgSlug || orgSlug === generateSlug(currentOrganization?.name || "")) {
                        setOrgSlug(generateSlug(e.target.value));
                      }
                    }}
                    placeholder="Acme Corporation"
                    className="h-11 text-base"
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground">
                    This is your organization's display name
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="org-slug" className="text-base font-semibold">
                    Organization Slug
                  </Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">workspace.com/</span>
                    <Input
                      id="org-slug"
                      value={orgSlug}
                      onChange={(e) => setOrgSlug(e.target.value)}
                      placeholder="acme-corp"
                      className="h-11 text-base flex-1"
                      disabled={loading}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Used in URLs and must be unique. Only lowercase letters, numbers, and hyphens.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="org-description" className="text-base font-semibold">
                    Description
                    <span className="text-muted-foreground font-normal ml-2">(Optional)</span>
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

                <Separator />

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
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
                    className="w-full sm:w-auto min-w-[140px]"
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

            {/* Organization Info Card */}
            {currentOrganization && (
              <Card className="bg-muted/50">
        <CardHeader>
                  <CardTitle className="text-lg">Organization Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Organization ID</p>
                      <p className="text-sm font-mono">{currentOrganization.id}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Created</p>
                      <p className="text-sm">
                        {new Date(currentOrganization.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Preferences */}
          <TabsContent value="preferences" className="space-y-6">
            <Card className="border-2 shadow-lg">
              <CardHeader className="pb-4 border-b bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">User Preferences</CardTitle>
                    <CardDescription className="mt-1">
                      Customize your workspace experience
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="compact-mode" className="text-base font-semibold">
                        Compact Mode
                      </Label>
                      <p className="text-sm text-muted-foreground">
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

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="show-tooltips" className="text-base font-semibold">
                        Show Tooltips
                      </Label>
                      <p className="text-sm text-muted-foreground">
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

                <Separator />

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
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
                    className="w-full sm:w-auto min-w-[140px]"
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
            <Card className="border-2 shadow-lg">
              <CardHeader className="pb-4 border-b bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Bell className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Notification Preferences</CardTitle>
                    <CardDescription className="mt-1">
                      Control how and when you receive notifications
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-notifications" className="text-base font-semibold">
                        Email Notifications
                      </Label>
                      <p className="text-sm text-muted-foreground">
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

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="dashboard-updates" className="text-base font-semibold">
                        Dashboard Updates
                      </Label>
                      <p className="text-sm text-muted-foreground">
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

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="data-source-alerts" className="text-base font-semibold">
                        Data Source Alerts
                      </Label>
                      <p className="text-sm text-muted-foreground">
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

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="weekly-reports" className="text-base font-semibold">
                        Weekly Reports
                      </Label>
                      <p className="text-sm text-muted-foreground">
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

                <Separator />

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
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
                    className="w-full sm:w-auto min-w-[140px]"
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
            <Card className="border-2 shadow-lg">
              <CardHeader className="pb-4 border-b bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Palette className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Appearance Settings</CardTitle>
                    <CardDescription className="mt-1">
                      Customize the look and feel of your workspace
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Theme</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {(["light", "dark", "system"] as const).map((themeOption) => (
                        <button
                          key={themeOption}
                          type="button"
                          onClick={() => setTheme(themeOption)}
                          className={cn(
                            "p-4 rounded-lg border-2 text-left transition-all",
                            theme === themeOption
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          )}
                        >
                          <div className="font-medium capitalize mb-1">{themeOption}</div>
                          <div className="text-xs text-muted-foreground">
                            {themeOption === "system" && "Follow system preference"}
                            {themeOption === "light" && "Light mode"}
                            {themeOption === "dark" && "Dark mode"}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setTheme("system")}
                    disabled={loading}
                    className="w-full sm:w-auto"
                  >
                    Reset
                  </Button>
                  <Button
                    onClick={handleSaveAppearance}
                    disabled={loading}
                    className="w-full sm:w-auto min-w-[140px]"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
            <Save className="mr-2 h-4 w-4" />
                        Save Appearance
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security */}
          <TabsContent value="security" className="space-y-6">
            <Card className="border-2 shadow-lg">
              <CardHeader className="pb-4 border-b bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Key className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">API Keys</CardTitle>
                    <CardDescription className="mt-1">
                      Manage your API keys for programmatic access
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      API keys allow you to access the API programmatically
                    </p>
                  </div>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Create API Key
                  </Button>
                </div>

                <div className="space-y-4">
                  {apiKeys.map((apiKey) => (
                    <Card key={apiKey.id} className="border">
                      <CardContent className="pt-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{apiKey.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {apiKey.key.includes("live") ? "Production" : "Development"}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="font-mono">{apiKey.key}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopyApiKey(apiKey.key)}
                                className="h-6 px-2"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                              <span>Created: {new Date(apiKey.created).toLocaleDateString()}</span>
                              <span>Last used: {new Date(apiKey.lastUsed).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteApiKey(apiKey.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {apiKeys.length === 0 && (
                  <div className="text-center py-12">
                    <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-2">No API keys created yet</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Create an API key to get started with programmatic access
                    </p>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First API Key
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Account Security */}
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Account Security</CardTitle>
                    <CardDescription className="mt-1">
                      Manage your account security settings
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {user && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          <Mail className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">Email Address</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <Badge variant="outline">Verified</Badge>
                    </div>
                    <Button variant="outline" className="w-full sm:w-auto">
                      Change Password
          </Button>
                  </div>
                )}
        </CardContent>
      </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
