"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LoadingState } from "@/components/shared";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { WorkspaceSidebar } from "@/components/workspace/workspace-sidebar";
import { WorkspaceTopbar } from "@/components/workspace/workspace-topbar";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { useOnboardingStatus } from "@/lib/api";

export default function WorkspaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuthStore();
  const { onboarding, sidebarOpen, setSidebarOpen, updateOnboarding } = useWorkspaceStore();
  const { data: onboardingStatus, isLoading: onboardingLoading } = useOnboardingStatus();

  // Sync store with API response
  useEffect(() => {
    if (onboardingStatus) {
      updateOnboarding({
        completed: onboardingStatus.completed,
        currentStep: onboardingStatus.step || "welcome",
      });
    }
  }, [onboardingStatus, updateOnboarding]);

  useEffect(() => {
    // Wait for both auth and onboarding status to load
    if (authLoading || onboardingLoading) {
      return;
    }

    if (!user) {
      router.push("/auth/login");
      return;
    }

    // Use API status as source of truth, fallback to store
    const isCompleted = onboardingStatus?.completed ?? onboarding.completed;
    
    if (!isCompleted) {
      router.push("/onboarding/welcome");
    }
  }, [user, authLoading, onboardingLoading, onboardingStatus?.completed, onboarding.completed, router]);

  // Show loading while checking auth or onboarding status
  if (authLoading || onboardingLoading) {
    return <LoadingState fullScreen message="Loading..." />;
  }

  if (!user) {
    return null;
  }

  // Don't render workspace if onboarding is not completed
  const isCompleted = onboardingStatus?.completed ?? onboarding.completed;
  if (!isCompleted) {
    return <LoadingState fullScreen message="Redirecting to onboarding..." />;
  }

  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <div className="flex h-screen w-full">
        <WorkspaceSidebar />
        <SidebarInset className="flex flex-col flex-1">
          <WorkspaceTopbar />
          <main
            id="main-content"
            className="h-full overflow-auto p-3 md:p-6"
            tabIndex={-1}
          >
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
