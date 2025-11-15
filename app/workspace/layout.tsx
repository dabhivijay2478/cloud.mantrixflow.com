"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { WorkspaceSidebar } from "@/components/workspace/workspace-sidebar";
import { WorkspaceTopbar } from "@/components/workspace/workspace-topbar";
import { ComponentsPanel } from "@/components/workspace/components-panel";
import { AgentPanel } from "@/components/workspace/agent-panel";
import { LoadingState } from "@/components/shared";
import { DashboardDndProvider } from "@/components/workspace/dashboard-dnd-provider";
import { useIsMobile } from "@/hooks/use-mobile";
import * as ResizablePrimitive from "react-resizable-panels";

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
    componentsPanelOpen,
    agentPanelOpen,
    setComponentsPanelOpen,
    setAgentPanelOpen,
  } = useWorkspaceStore();
  const componentsPanelRef =
    useRef<ResizablePrimitive.ImperativePanelHandle>(null);
  const agentPanelRef = useRef<ResizablePrimitive.ImperativePanelHandle>(null);
  const [mainPanelSize, setMainPanelSize] = useState(64);

  // Check if we're on a view-only page (dashboard view)
  const isViewMode = pathname?.includes("/view");

  // Check if we're in dashboard edit mode (dashboard/[id] but not /view)
  const isDashboardEditMode =
    pathname?.match(/^\/workspace\/dashboards\/[^/]+$/) !== null;

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
  }, [
    isDashboardEditMode,
    isViewMode,
    componentsPanelOpen,
    agentPanelOpen,
    setComponentsPanelOpen,
    setAgentPanelOpen,
  ]);

  // Calculate responsive panel sizes based on screen size and panel states
  useEffect(() => {
    if (isMobile) {
      // On mobile, panels should be smaller or hidden
      if (!componentsPanelOpen && componentsPanelRef.current) {
        componentsPanelRef.current.resize(0);
      }
      if (!agentPanelOpen && agentPanelRef.current) {
        agentPanelRef.current.resize(0);
      }
    } else {
      // On desktop, use normal sizes
      if (!componentsPanelOpen && componentsPanelRef.current) {
        componentsPanelRef.current.resize(3);
      }
      if (!agentPanelOpen && agentPanelRef.current) {
        agentPanelRef.current.resize(3);
      }
    }
  }, [componentsPanelOpen, agentPanelOpen, isMobile]);

  // Calculate main panel size based on open panels
  useEffect(() => {
    if (isMobile) {
      // On mobile, main panel takes full width when panels are closed
      if (componentsPanelOpen && agentPanelOpen) {
        setMainPanelSize(50);
      } else if (componentsPanelOpen || agentPanelOpen) {
        setMainPanelSize(70);
      } else {
        setMainPanelSize(100);
      }
    } else {
      // On desktop, calculate based on open panels
      if (componentsPanelOpen && agentPanelOpen) {
        setMainPanelSize(64);
      } else if (componentsPanelOpen) {
        setMainPanelSize(79);
      } else if (agentPanelOpen) {
        setMainPanelSize(79);
      } else {
        setMainPanelSize(94);
      }
    }
  }, [componentsPanelOpen, agentPanelOpen, isMobile]);

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
      <div className="h-screen w-full overflow-auto bg-background">{children}</div>
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
            // Dashboard edit mode: Show panels with shared DndContext
            <DashboardDndProvider>
              <ResizablePanelGroup 
                direction="horizontal" 
                className="flex-1"
                onLayout={(sizes) => {
                  // Update main panel size when layout changes
                  if (sizes.length >= 3) {
                    setMainPanelSize(sizes[1] || 64);
                  }
                }}
              >
                <ResizablePanel
                  ref={componentsPanelRef}
                  id="components-panel"
                  defaultSize={isMobile ? (componentsPanelOpen ? 50 : 0) : (componentsPanelOpen ? 18 : 3)}
                  minSize={isMobile ? 0 : 3}
                  maxSize={isMobile ? (componentsPanelOpen ? 80 : 0) : (componentsPanelOpen ? 40 : 3)}
                  collapsible={true}
                  collapsedSize={isMobile ? 0 : 3}
                  key={`components-${componentsPanelOpen}-${isMobile}`}
                >
                  {(!isMobile || componentsPanelOpen) && <ComponentsPanel />}
                </ResizablePanel>
                <ResizableHandle
                  withHandle={componentsPanelOpen && !isMobile}
                  className={`data-[resize-handle-state=hover]:bg-accent transition-colors ${!componentsPanelOpen || isMobile ? "pointer-events-none opacity-0" : ""}`}
                />
                <ResizablePanel
                  id="main-panel"
                  defaultSize={mainPanelSize}
                  minSize={isMobile ? 20 : 40}
                  key={`main-${componentsPanelOpen}-${agentPanelOpen}-${isMobile}`}
                >
                  <main
                    className="h-full overflow-visible p-3 md:p-6"
                    style={{ overflow: "visible" }}
                  >
                    {children}
                  </main>
                </ResizablePanel>
                <ResizableHandle
                  withHandle={agentPanelOpen && !isMobile}
                  className={`data-[resize-handle-state=hover]:bg-accent transition-colors ${!agentPanelOpen || isMobile ? "pointer-events-none opacity-0" : ""}`}
                />
                <ResizablePanel
                  ref={agentPanelRef}
                  id="agent-panel"
                  defaultSize={isMobile ? (agentPanelOpen ? 50 : 0) : (agentPanelOpen ? 18 : 3)}
                  minSize={isMobile ? 0 : 3}
                  maxSize={isMobile ? (agentPanelOpen ? 80 : 0) : (agentPanelOpen ? 40 : 3)}
                  collapsible={true}
                  collapsedSize={isMobile ? 0 : 3}
                  key={`agent-${agentPanelOpen}-${isMobile}`}
                >
                  {(!isMobile || agentPanelOpen) && <AgentPanel />}
                </ResizablePanel>
              </ResizablePanelGroup>
            </DashboardDndProvider>
          ) : (
            // Other pages: No panels, just main content
            <main className="h-full overflow-auto p-3 md:p-6">{children}</main>
          )}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
