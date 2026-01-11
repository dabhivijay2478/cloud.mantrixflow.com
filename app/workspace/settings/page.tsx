"use client";

import {
  Building2,
  Check,
  Loader2,
  Lock,
  Mail,
  Save,
  Shield,
  User,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ChangePasswordModal } from "@/components/auth/change-password-modal";
import { PageHeader, SettingsSkeleton } from "@/components/shared";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useCurrentUser, useUpdateUser } from "@/lib/api";
import { useCurrentOrganization } from "@/lib/api/hooks/use-organizations";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { toast } from "@/lib/utils/toast";
import { refreshSupabaseUser } from "@/lib/utils/sync-user";

export default function SettingsPage() {
  const { currentOrganization, updateOrganization } = useWorkspaceStore();
  const { user: authUser } = useAuthStore();
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const { data: currentOrg } = useCurrentOrganization();
  const updateUser = useUpdateUser();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  // Get current user's role in the organization
  const currentUserRole = currentOrg?.role as
    | "OWNER"
    | "ADMIN"
    | "EDITOR"
    | "VIEWER"
    | undefined;
  const isOwner = currentUserRole === "OWNER";

  // Profile form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  // Organization settings
  const [orgName, setOrgName] = useState(currentOrganization?.name || "");
  const [orgSlug, setOrgSlug] = useState(currentOrganization?.slug || "");
  const [orgDescription, setOrgDescription] = useState("");

  // Appearance
  const [_theme, _setTheme] = useState<"light" | "dark" | "system">("system");

  // Initialize profile form with user data
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setFullName(user.fullName || "");
      setAvatarUrl(user.avatarUrl || "");
    }
  }, [user]);

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

  const handleSaveProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      await updateUser.mutateAsync({
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        fullName: fullName.trim() || undefined,
        avatarUrl: avatarUrl.trim() || undefined,
      });
      
      // Refresh Supabase user to get updated metadata (including avatar_url)
      await refreshSupabaseUser();
      
      toast.success(
        "Profile updated successfully",
        "Your profile information has been updated.",
      );
    } catch (error) {
      toast.error(
        "Failed to update profile",
        error instanceof Error
          ? error.message
          : "Unable to update profile. Please try again.",
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

  // Show skeleton on initial load
  if (userLoading && !user) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Settings"
          description="Manage your workspace, preferences, and account settings"
        />
        <SettingsSkeleton sectionCount={3} fieldCountPerSection={3} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
        <div className="">
          <TabsList className="inline-flex h-auto w-full sm:w-auto bg-transparent p-0 space-x-1 sm:space-x-2">
            <TabsTrigger
              value="profile"
              className="flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-t-lg  border-transparent"
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger
              value="organization"
              className="flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-t-lg  border-transparent"
            >
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Organization</span>
            </TabsTrigger>
            {/* <TabsTrigger
              value="appearance"
              className="flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-t-lg  border-transparent"
            >
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Appearance</span>
            </TabsTrigger> */}
            <TabsTrigger
              value="security"
              className="flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-t-lg  border-transparent"
            >
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Profile Settings */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and profile details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {userLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : user ? (
                <>
                  {/* Read-only fields */}
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Lock className="h-3 w-3 text-muted-foreground" />
                        Email Address
                      </Label>
                      <Input
                        value={user.email}
                        disabled
                        className="h-10 bg-muted/50 cursor-not-allowed"
                      />
                      <p className="text-xs text-muted-foreground">
                        Email address cannot be changed
                      </p>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Lock className="h-3 w-3 text-muted-foreground" />
                        User ID
                      </Label>
                      <Input
                        value={user.id}
                        disabled
                        className="h-10 bg-muted/50 cursor-not-allowed font-mono text-xs"
                      />
                      <p className="text-xs text-muted-foreground">
                        Your unique user identifier
                      </p>
                    </div>
                  </div>

                  <div className="border-t pt-6 space-y-4">
                    <h3 className="text-sm font-semibold">
                      Editable Information
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <Label
                          htmlFor="first-name"
                          className="text-sm font-medium"
                        >
                          First Name
                          <span className="text-muted-foreground font-normal ml-2 text-xs">
                            (Optional)
                          </span>
                        </Label>
                        <Input
                          id="first-name"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="John"
                          className="h-10"
                          disabled={loading}
                        />
                      </div>

                      <div className="space-y-3">
                        <Label
                          htmlFor="last-name"
                          className="text-sm font-medium"
                        >
                          Last Name
                          <span className="text-muted-foreground font-normal ml-2 text-xs">
                            (Optional)
                          </span>
                        </Label>
                        <Input
                          id="last-name"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Doe"
                          className="h-10"
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label
                        htmlFor="full-name"
                        className="text-sm font-medium"
                      >
                        Full Name
                        <span className="text-muted-foreground font-normal ml-2 text-xs">
                          (Optional)
                        </span>
                      </Label>
                      <Input
                        id="full-name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="John Doe"
                        className="h-10"
                        disabled={loading}
                      />
                      <p className="text-xs text-muted-foreground">
                        Your display name (will be used if first/last name are
                        not provided)
                      </p>
                    </div>

                    <div className="space-y-3">
                      <Label
                        htmlFor="avatar-url"
                        className="text-sm font-medium"
                      >
                        Avatar URL
                        <span className="text-muted-foreground font-normal ml-2 text-xs">
                          (Optional)
                        </span>
                      </Label>
                      <Input
                        id="avatar-url"
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        placeholder="https://example.com/avatar.jpg"
                        className="h-10"
                        disabled={loading}
                      />
                      <p className="text-xs text-muted-foreground">
                        URL to your profile picture
                      </p>
                      {avatarUrl && (
                        <div className="mt-2">
                          <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-border">
                            <Image
                              src={avatarUrl}
                              alt="Avatar preview"
                              width={80}
                              height={80}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display =
                                  "none";
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setFirstName(user.firstName || "");
                        setLastName(user.lastName || "");
                        setFullName(user.fullName || "");
                        setAvatarUrl(user.avatarUrl || "");
                      }}
                      disabled={loading}
                      className="w-full sm:w-auto cursor-pointer"
                    >
                      Reset
                    </Button>
                    <Button
                      onClick={handleSaveProfile}
                      disabled={loading}
                      className="w-full sm:w-auto shadow-sm hover:shadow-md transition-shadow cursor-pointer"
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
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Unable to load user information
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Organization Settings */}
        <TabsContent value="organization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Organization Details</CardTitle>
              <CardDescription>
                {isOwner
                  ? "Update your organization information and settings"
                  : "View your organization information (read-only)"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!isOwner && (
                <div className="mb-4 p-3 bg-muted/50 border border-muted rounded-lg">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Only organization owners can edit organization details. You
                    have view-only access.
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <Label
                  htmlFor="org-name"
                  className="text-sm font-medium flex items-center gap-2"
                >
                  Organization Name
                  {isOwner && (
                    <span className="text-destructive text-xs">*</span>
                  )}
                </Label>
                <Input
                  id="org-name"
                  value={orgName}
                  onChange={(e) => {
                    if (!isOwner) return;
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
                  disabled={loading || !isOwner}
                  readOnly={!isOwner}
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
                    onChange={(e) => {
                      if (!isOwner) return;
                      setOrgSlug(e.target.value);
                    }}
                    placeholder="acme-corp"
                    className="h-10 flex-1"
                    disabled={loading || !isOwner}
                    readOnly={!isOwner}
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
                  onChange={(e) => {
                    if (!isOwner) return;
                    setOrgDescription(e.target.value);
                  }}
                  placeholder="A brief description of your organization..."
                  className="min-h-[100px] resize-none"
                  disabled={loading || !isOwner}
                  readOnly={!isOwner}
                />
              </div>

              {isOwner && (
                <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setOrgName(currentOrganization?.name || "");
                      setOrgSlug(currentOrganization?.slug || "");
                    }}
                    disabled={loading}
                    className="w-full sm:w-auto cursor-pointer"
                  >
                    Reset
                  </Button>
                  <Button
                    onClick={handleSaveOrganization}
                    disabled={loading || !orgName.trim()}
                    className="w-full sm:w-auto shadow-sm hover:shadow-md transition-shadow cursor-pointer"
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
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* <TabsContent value="appearance" className="space-y-6">
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
          <ThemeCustomizer />
        </TabsContent> */}

        {/* Security */}
        <TabsContent value="security" className="space-y-6">
          {/* Account Security Section */}
          {authUser && (
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
                        {authUser.email}
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
                <Button
                  variant="outline"
                  className="w-full sm:w-auto cursor-pointer"
                  onClick={() => setChangePasswordOpen(true)}
                >
                  Change Password
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <ChangePasswordModal
        open={changePasswordOpen}
        onOpenChange={setChangePasswordOpen}
      />
    </div>
  );
}
