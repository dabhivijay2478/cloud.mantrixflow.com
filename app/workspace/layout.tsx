"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { LoadingState } from "@/components/shared";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AgentPanel } from "@/components/workspace/agent-panel";
import { WorkspaceSidebar } from "@/components/workspace/workspace-sidebar";
import { WorkspaceTopbar } from "@/components/workspace/workspace-topbar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";

export default function WorkspaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuthStore();
  const isMobile = useIsMobile();
  const {
    onboarding,
    sidebarOpen,
    setSidebarOpen,
    agentPanelOpen,
    setAgentPanelOpen,
  } = useWorkspaceStore();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    } else if (!loading && user && !onboarding.completed) {
      router.push("/onboarding/welcome");
    }
  }, [user, loading, onboarding.completed, router]);

  if (loading) {
    return <LoadingState fullScreen message="Loading..." />;
  }

  if (!user) {
    return null;
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
