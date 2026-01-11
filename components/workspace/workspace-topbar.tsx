"use client";

import { LogOut, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/shared";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useCurrentOrganization } from "@/lib/api/hooks/use-organizations";
import { roleConfig, type TeamMemberRole } from "@/lib/constants/roles";
import { useAuthStore } from "@/lib/stores/auth-store";
import { cn } from "@/lib/utils";
import { toast as toastUtil } from "@/lib/utils/toast";
import { GlobalSearch } from "./global-search";

export function WorkspaceTopbar() {
  const router = useRouter();
  const { user, signOut } = useAuthStore();
  const { data: currentOrg } = useCurrentOrganization();

  // Get current user's role in the organization
  const currentUserRole = currentOrg?.role as
    | "OWNER"
    | "ADMIN"
    | "EDITOR"
    | "VIEWER"
    | undefined;

  const handleSignOut = async () => {
    const { error } = await signOut();

    if (error) {
      toastUtil.error(
        "Sign out failed",
        error.message || "Failed to sign out. Please try again.",
      );
      return;
    }

    toastUtil.success(
      "Signed out successfully",
      "You have been successfully logged out.",
    );
    router.push("/auth/login");
  };

  // Default header
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-colors">
      <div className="flex h-14 items-center gap-4 px-4 sm:px-6">
        <SidebarTrigger className="cursor-pointer" />
        <div className="flex-1 flex items-center justify-center max-w-md mx-auto">
          <GlobalSearch />
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-8 w-8 rounded-full cursor-pointer"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback>
                    {user?.email?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.user_metadata?.full_name || "User"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                  {currentUserRole && (
                    <div className="pt-1">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs font-normal",
                          currentUserRole === "OWNER" &&
                            "border-purple-500/50 text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950",
                          currentUserRole === "ADMIN" &&
                            "border-blue-500/50 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950",
                          currentUserRole === "EDITOR" &&
                            "border-green-500/50 text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-950",
                          currentUserRole === "VIEWER" &&
                            "border-gray-500/50 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-950",
                        )}
                      >
                        {roleConfig[currentUserRole as TeamMemberRole].label}
                      </Badge>
                    </div>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => router.push("/workspace/settings")}
                className="cursor-pointer"
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
