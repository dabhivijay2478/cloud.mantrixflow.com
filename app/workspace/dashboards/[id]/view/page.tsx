"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { ComponentRenderer } from "@/components/workspace/component-renderer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getBoundingBox } from "@/lib/utils/dashboard-layout";
import { cn } from "@/lib/utils";

const GRID_SIZE = 20; // Grid cell size in pixels

export default function DashboardViewPage() {
  const params = useParams();
  const dashboardId = params.id as string;
  const { dashboards } = useWorkspaceStore();
  const [dashboard, setDashboard] = useState(
    dashboards.find((d) => d.id === dashboardId)
  );
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const found = dashboards.find((d) => d.id === dashboardId);
    if (found) {
      setDashboard(found);
    }
  }, [dashboardId, dashboards]);

  // Calculate canvas size based on component positions
  useEffect(() => {
    const updateCanvasSize = () => {
      if (canvasRef.current && dashboard) {
        const rect = canvasRef.current.getBoundingClientRect();
        const viewportWidth = rect.width;
        const viewportHeight = rect.height;
        
        const boundingBox = getBoundingBox(dashboard.components, GRID_SIZE);
        const padding = 40;
        
        if (boundingBox && dashboard.components.length > 0) {
          const contentHeight = boundingBox.y + boundingBox.height + padding;
          setCanvasSize({ 
            width: viewportWidth,
            height: Math.max(viewportHeight, contentHeight)
          });
        } else {
          setCanvasSize({ width: viewportWidth, height: viewportHeight });
        }
      }
    };

    updateCanvasSize();
    
    const resizeObserver = new ResizeObserver(updateCanvasSize);
    if (canvasRef.current) {
      resizeObserver.observe(canvasRef.current);
    }
    
    window.addEventListener('resize', updateCanvasSize);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, [dashboard]);

  if (!dashboard) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col bg-background">
      {/* Header */}
      <div className="shrink-0 p-4 md:p-6 border-b">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">{dashboard.name}</h1>
        {dashboard.description && (
          <p className="text-muted-foreground text-sm md:text-base">{dashboard.description}</p>
        )}
      </div>

      {/* Canvas */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="w-full h-full">
          <div
            ref={canvasRef}
            className="relative bg-background"
            style={{
              width: '100%',
              height: `${canvasSize.height || '100%'}px`,
              minHeight: '100%',
              padding: '20px',
              backgroundImage: `
                linear-gradient(to right, hsl(var(--border) / 0.05) 1px, transparent 1px),
                linear-gradient(to bottom, hsl(var(--border) / 0.05) 1px, transparent 1px)
              `,
              backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
            }}
          >
            {dashboard.components.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-4 p-8">
                  <div className="text-4xl mb-4">📊</div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Your dashboard is empty
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Add components to start visualizing your data
                  </p>
                </div>
              </div>
            ) : (
              dashboard.components.map((component) => {
                const width = component.position.w * GRID_SIZE;
                const height = component.position.h * GRID_SIZE;
                const left = component.position.x * GRID_SIZE;
                const top = component.position.y * GRID_SIZE;

                return (
                  <div
                    key={component.id}
                    className="absolute"
                    style={{
                      left: `${left}px`,
                      top: `${top}px`,
                      width: `${width}px`,
                      height: `${height}px`,
                      zIndex: component.zIndex || 1,
                    }}
                  >
                    <div className="w-full h-full">
                      <ComponentRenderer component={component} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

