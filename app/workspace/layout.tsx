"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type * as ResizablePrimitive from "react-resizable-panels";
import { LoadingState } from "@/components/shared";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AgentPanel } from "@/components/workspace/agent-panel";
import { ComponentsPanel } from "@/components/workspace/components-panel";
import { DashboardDndProvider } from "@/components/workspace/dashboard-dnd-provider";
import { DataPanel } from "@/components/workspace/data-panel";
import { PropertiesPanel } from "@/components/workspace/properties-panel";
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
    componentsPanelOpen,
    agentPanelOpen,
    propertiesPanelOpen,
    dataPanelOpen,
    setPropertiesPanelOpen,
    setComponentsPanelOpen,
    setAgentPanelOpen,
    setDataPanelOpen,
    selectedComponentId,
    selectedDatasetId,
    currentDashboard,
    datasets,
    updateDashboardComponent,
  } = useWorkspaceStore();
  const dataPanelRef = useRef<ResizablePrimitive.ImperativePanelHandle>(null);
  const componentsPanelRef =
    useRef<ResizablePrimitive.ImperativePanelHandle>(null);
  const propertiesPanelRef =
    useRef<ResizablePrimitive.ImperativePanelHandle>(null);
  const agentPanelRef = useRef<ResizablePrimitive.ImperativePanelHandle>(null);
  const [mainPanelSize, setMainPanelSize] = useState(64);

  // Get selected component and dataset for Properties Panel
  const selectedComponent =
    currentDashboard?.components.find((c) => c.id === selectedComponentId) ||
    null;
  const selectedDataset =
    datasets.find((d) => d.id === selectedDatasetId) || null;

  // Check if we're on a view-only page (dashboard view)
  const isViewMode = pathname?.includes("/view");

  // Check if we're in dashboard edit mode (dashboard/[id] but not /view)
  const isDashboardEditMode =
    pathname?.match(/^\/workspace\/dashboards\/[^/]+$/) !== null;

  // Open properties panel when component is first selected in dashboard edit mode
  // Close it when no component is selected
  // Use a ref to track previous selectedComponentId to only open on change
  const prevSelectedComponentIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (isDashboardEditMode) {
      if (selectedComponentId) {
        // Open panel when component is selected (only if it wasn't already open for this component)
        if (
          !propertiesPanelOpen &&
          prevSelectedComponentIdRef.current !== selectedComponentId
        ) {
          setPropertiesPanelOpen(true);
        }
      } else {
        // Close panel when no component is selected
        if (propertiesPanelOpen) {
          setPropertiesPanelOpen(false);
        }
      }
    }
    prevSelectedComponentIdRef.current = selectedComponentId;
  }, [
    isDashboardEditMode,
    selectedComponentId,
    propertiesPanelOpen,
    setPropertiesPanelOpen,
  ]);

  // Close panels when leaving dashboard edit mode
  useEffect(() => {
    if (!isDashboardEditMode && !isViewMode) {
      if (componentsPanelOpen) {
        setComponentsPanelOpen(false);
      }
      if (agentPanelOpen) {
        setAgentPanelOpen(false);
      }
      if (propertiesPanelOpen) {
        setPropertiesPanelOpen(false);
      }
      if (dataPanelOpen) {
        setDataPanelOpen(false);
      }
    }
  }, [
    isDashboardEditMode,
    isViewMode,
    componentsPanelOpen,
    agentPanelOpen,
    propertiesPanelOpen,
    dataPanelOpen,
    setComponentsPanelOpen,
    setAgentPanelOpen,
    setPropertiesPanelOpen,
    setDataPanelOpen,
  ]);

  // Calculate responsive panel sizes based on screen size and panel states
  useEffect(() => {
    if (isMobile) {
      // On mobile, panels should be smaller or hidden
      if (!dataPanelOpen && dataPanelRef.current) {
        dataPanelRef.current.resize(0);
      }
      if (!componentsPanelOpen && componentsPanelRef.current) {
        componentsPanelRef.current.resize(0);
      }
      if (!agentPanelOpen && agentPanelRef.current) {
        agentPanelRef.current.resize(0);
      }
    } else {
      // On desktop, use normal sizes
      if (!dataPanelOpen && dataPanelRef.current) {
        dataPanelRef.current.resize(3);
      }
      if (!componentsPanelOpen && componentsPanelRef.current) {
        componentsPanelRef.current.resize(3);
      }
      if (!agentPanelOpen && agentPanelRef.current) {
        agentPanelRef.current.resize(3);
      }
    }
  }, [dataPanelOpen, componentsPanelOpen, agentPanelOpen, isMobile]);

  // Calculate main panel size based on open panels
  useEffect(() => {
    if (isMobile) {
      // On mobile, main panel takes full width when panels are closed
      const openPanels = [
        dataPanelOpen,
        componentsPanelOpen,
        agentPanelOpen,
      ].filter(Boolean).length;
      if (openPanels === 3) {
        setMainPanelSize(40);
      } else if (openPanels === 2) {
        setMainPanelSize(50);
      } else if (openPanels === 1) {
        setMainPanelSize(70);
      } else {
        setMainPanelSize(100);
      }
    } else {
      // On desktop, calculate based on open panels
      const openPanels = [
        dataPanelOpen,
        componentsPanelOpen,
        agentPanelOpen,
      ].filter(Boolean).length;
      if (openPanels === 3) {
        setMainPanelSize(55);
      } else if (openPanels === 2) {
        setMainPanelSize(64);
      } else if (openPanels === 1) {
        setMainPanelSize(79);
      } else {
        setMainPanelSize(94);
      }
    }
  }, [dataPanelOpen, componentsPanelOpen, agentPanelOpen, isMobile]);

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
      <div className="h-screen w-full overflow-auto bg-background">
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
            // Dashboard edit mode: Show panels with shared DndContext
            <DashboardDndProvider>
              <ResizablePanelGroup
                direction="horizontal"
                className="flex-1"
                onLayout={(sizes) => {
                  // Update main panel size when layout changes
                  if (sizes.length >= 5) {
                    setMainPanelSize(sizes[3] || 50);
                  } else if (sizes.length >= 4) {
                    setMainPanelSize(sizes[2] || 50);
                  } else if (sizes.length >= 3) {
                    setMainPanelSize(sizes[1] || 64);
                  }
                }}
              >
                <ResizablePanel
                  ref={dataPanelRef}
                  id="data-panel"
                  defaultSize={
                    isMobile ? (dataPanelOpen ? 20 : 0) : dataPanelOpen ? 15 : 3
                  }
                  minSize={isMobile ? 0 : 3}
                  maxSize={
                    isMobile ? (dataPanelOpen ? 35 : 0) : dataPanelOpen ? 25 : 3
                  }
                  collapsible={true}
                  collapsedSize={isMobile ? 0 : 3}
                  key={`data-${dataPanelOpen}-${isMobile}`}
                >
                  {(!isMobile || dataPanelOpen) && <DataPanel />}
                </ResizablePanel>
                <ResizableHandle
                  withHandle={dataPanelOpen && !isMobile}
                  className={`data-[resize-handle-state=hover]:bg-accent transition-colors ${!dataPanelOpen || isMobile ? "pointer-events-none opacity-0" : ""}`}
                />
                <ResizablePanel
                  ref={componentsPanelRef}
                  id="components-panel"
                  defaultSize={
                    isMobile
                      ? componentsPanelOpen
                        ? 25
                        : 0
                      : componentsPanelOpen
                        ? 15
                        : 3
                  }
                  minSize={isMobile ? 0 : 3}
                  maxSize={
                    isMobile
                      ? componentsPanelOpen
                        ? 40
                        : 0
                      : componentsPanelOpen
                        ? 25
                        : 3
                  }
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
                  ref={propertiesPanelRef}
                  id="properties-panel"
                  defaultSize={
                    isMobile
                      ? propertiesPanelOpen
                        ? 25
                        : 0
                      : propertiesPanelOpen
                        ? 20
                        : 3
                  }
                  minSize={isMobile ? 0 : 3}
                  maxSize={
                    isMobile
                      ? propertiesPanelOpen
                        ? 40
                        : 0
                      : propertiesPanelOpen
                        ? 30
                        : 3
                  }
                  collapsible={true}
                  collapsedSize={isMobile ? 0 : 3}
                  key={`properties-${propertiesPanelOpen}-${isMobile}`}
                >
                  {(!isMobile || propertiesPanelOpen) && (
                    <PropertiesPanel
                      component={selectedComponent}
                      dataset={selectedDataset}
                      onUpdate={(updates) => {
                        if (selectedComponentId && currentDashboard) {
                          updateDashboardComponent(
                            currentDashboard.id,
                            selectedComponentId,
                            updates,
                          );
                        }
                      }}
                      onClose={() => {
                        // Clear selection when closing
                        if (selectedComponentId) {
                          // This will be handled by the store
                        }
                      }}
                    />
                  )}
                </ResizablePanel>
                <ResizableHandle
                  withHandle={propertiesPanelOpen && !isMobile}
                  className={`data-[resize-handle-state=hover]:bg-accent transition-colors ${!propertiesPanelOpen || isMobile ? "pointer-events-none opacity-0" : ""}`}
                />
                <ResizablePanel
                  id="main-panel"
                  defaultSize={mainPanelSize}
                  minSize={isMobile ? 20 : 30}
                  key={`main-${componentsPanelOpen}-${propertiesPanelOpen}-${agentPanelOpen}-${isMobile}`}
                >
                  <main
                    id="main-content"
                    className="h-full overflow-visible p-3 md:p-6"
                    style={{ overflow: "visible" }}
                    tabIndex={-1}
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
                  defaultSize={
                    isMobile
                      ? agentPanelOpen
                        ? 25
                        : 0
                      : agentPanelOpen
                        ? 15
                        : 3
                  }
                  minSize={isMobile ? 0 : 3}
                  maxSize={
                    isMobile
                      ? agentPanelOpen
                        ? 40
                        : 0
                      : agentPanelOpen
                        ? 25
                        : 3
                  }
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
            <main
              id="main-content"
              className="h-full overflow-auto p-3 md:p-6"
              tabIndex={-1}
            >
              {children}
            </main>
          )}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
