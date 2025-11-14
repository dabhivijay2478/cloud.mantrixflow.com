"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarFooter, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { WorkspaceSidebar } from "@/components/workspace/workspace-sidebar";
import { WorkspaceTopbar } from "@/components/workspace/workspace-topbar";
import { ComponentsPanel } from "@/components/workspace/components-panel";
import { AgentPanel } from "@/components/workspace/agent-panel";
import { LoadingState } from "@/components/shared";
import * as ResizablePrimitive from "react-resizable-panels";

export default function WorkspaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuthStore();
  const { onboarding, sidebarOpen, setSidebarOpen, componentsPanelOpen, agentPanelOpen, setComponentsPanelOpen, setAgentPanelOpen } = useWorkspaceStore();
  const componentsPanelRef = useRef<ResizablePrimitive.ImperativePanelHandle>(null);
  const agentPanelRef = useRef<ResizablePrimitive.ImperativePanelHandle>(null);

  // Check if we're on a view-only page (dashboard view)
  const isViewMode = pathname?.includes("/view");
  
  // Check if we're in dashboard edit mode (dashboard/[id] but not /view)
  const isDashboardEditMode = pathname?.match(/^\/workspace\/dashboards\/[^/]+$/) !== null;

  // Close panels when leaving dashboard edit mode
  useEffect(() => {
    if (!isDashboardEditMode && !isViewMode) {
      if (componentsPanelOpen) {
        setComponentsPanelOpen(false);
      }
      if (agentPanelOpen) {
        setAgentPanelOpen(false);
      }
    }
  }, [isDashboardEditMode, isViewMode, componentsPanelOpen, agentPanelOpen, setComponentsPanelOpen, setAgentPanelOpen]);

  // Only resize when collapsing (to preserve user's manual resizing)
  useEffect(() => {
    if (!componentsPanelOpen && componentsPanelRef.current) {
      componentsPanelRef.current.resize(3);
    }
  }, [componentsPanelOpen]);

  useEffect(() => {
    if (!agentPanelOpen && agentPanelRef.current) {
      agentPanelRef.current.resize(3);
    }
  }, [agentPanelOpen]);

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

  // View mode: No sidebar, no topbar, no panels - just content for iframe embedding
  if (isViewMode) {
    return (
      <div className="h-screen w-full overflow-auto">
        {children}
      </div>
    );
  }

  // Edit mode: Full workspace layout with sidebar, topbar, and panels (only in dashboard edit mode)
  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <div className="flex h-screen w-full">
        <WorkspaceSidebar />
        <SidebarInset className="flex flex-col flex-1">
          <WorkspaceTopbar />
          {isDashboardEditMode ? (
            // Dashboard edit mode: Show panels
            <ResizablePanelGroup direction="horizontal" className="flex-1">
              <ResizablePanel 
                ref={componentsPanelRef}
                id="components-panel"
                defaultSize={componentsPanelOpen ? 18 : 3} 
                minSize={3} 
                maxSize={componentsPanelOpen ? 40 : 3}
                collapsible={true}
                collapsedSize={3}
                key={`components-${componentsPanelOpen}`}
              >
                <ComponentsPanel />
              </ResizablePanel>
              <ResizableHandle 
                withHandle={componentsPanelOpen}
                className={`data-[resize-handle-state=hover]:bg-accent transition-colors ${!componentsPanelOpen ? 'pointer-events-none opacity-0' : ''}`}
              />
              <ResizablePanel 
                id="main-panel"
                defaultSize={componentsPanelOpen && agentPanelOpen ? 64 : componentsPanelOpen ? 79 : agentPanelOpen ? 79 : 94}
                minSize={40}
              >
                <main className="h-full overflow-auto p-6">
                  {children}
                </main>
              </ResizablePanel>
              <ResizableHandle 
                withHandle={agentPanelOpen}
                className={`data-[resize-handle-state=hover]:bg-accent transition-colors ${!agentPanelOpen ? 'pointer-events-none opacity-0' : ''}`}
              />
              <ResizablePanel 
                ref={agentPanelRef}
                id="agent-panel"
                defaultSize={agentPanelOpen ? 18 : 3} 
                minSize={3} 
                maxSize={agentPanelOpen ? 40 : 3}
                collapsible={true}
                collapsedSize={3}
                key={`agent-${agentPanelOpen}`}
              >
                <AgentPanel />
              </ResizablePanel>
            </ResizablePanelGroup>
          ) : (
            // Other pages: No panels, just main content
            <main className="h-full overflow-auto p-6">
              {children}
            </main>
          )}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
