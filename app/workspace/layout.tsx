"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarFooter, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { WorkspaceSidebar } from "@/components/workspace/workspace-sidebar";
import { WorkspaceTopbar } from "@/components/workspace/workspace-topbar";
import { ComponentsPanel } from "@/components/workspace/components-panel";
import { AgentPanel } from "@/components/workspace/agent-panel";

export default function WorkspaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const { user, loading } = useAuthStore();
  const { onboarding, sidebarOpen, setSidebarOpen } = useWorkspaceStore();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    } else if (!loading && user && !onboarding.completed) {
      router.push("/onboarding/welcome");
    }
  }, [user, loading, onboarding.completed, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
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
          <div className="flex flex-1 overflow-hidden">
            <ComponentsPanel />
            <main className="flex-1 overflow-auto p-6">
              {children}
            </main>
            <AgentPanel />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
