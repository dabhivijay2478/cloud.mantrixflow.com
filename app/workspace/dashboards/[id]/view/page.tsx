"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { ComponentRenderer } from "@/components/workspace/component-renderer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getBoundingBox } from "@/lib/utils/dashboard-layout";
import { cn } from "@/lib/utils";

const GRID_SIZE = 20; // Grid cell size in pixels
const BASE_CANVAS_WIDTH = 1920; // Base/reference width for responsive scaling

export default function DashboardViewPage() {
  const params = useParams();
  const dashboardId = params.id as string;
  const { dashboards } = useWorkspaceStore();
  const [dashboard, setDashboard] = useState(
    dashboards.find((d) => d.id === dashboardId)
  );
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [scale, setScale] = useState(1);
  const canvasRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const found = dashboards.find((d) => d.id === dashboardId);
    if (found) {
      setDashboard(found);
    }
  }, [dashboardId, dashboards]);

  // Calculate responsive scale and canvas size based on component positions
  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current && canvasRef.current && dashboard) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const containerWidth = Math.max(containerRect.width, 320); // Minimum 320px for mobile
        const containerHeight = containerRect.height;
        
        // Calculate scale factor based on container width vs base width
        // This ensures the dashboard scales proportionally in iframes
        // Clamp scale between 0.3 (for very small screens) and 1.5 (for large screens)
        const calculatedScale = Math.max(
          0.3,
          Math.min(
            containerWidth / BASE_CANVAS_WIDTH,
            1.5 // Max scale to prevent components from becoming too large
          )
        );
        
        // Use the base canvas width for internal calculations
        const baseWidth = BASE_CANVAS_WIDTH;
        const boundingBox = getBoundingBox(dashboard.components, GRID_SIZE);
        const padding = 40;
        
        if (boundingBox && dashboard.components.length > 0) {
          // Calculate content height based on base width
          const contentHeight = boundingBox.y + boundingBox.height + padding;
          setCanvasSize({ 
            width: baseWidth,
            height: Math.max(containerHeight / calculatedScale, contentHeight)
          });
        } else {
          setCanvasSize({ 
            width: baseWidth, 
            height: Math.max(containerHeight / calculatedScale, 600) // Minimum height
          });
        }
        
        setScale(calculatedScale);
      }
    };

    // Initial update
    updateCanvasSize();
    
    // Use ResizeObserver for better performance and iframe support
    const resizeObserver = new ResizeObserver(() => {
      // Use requestAnimationFrame to batch updates
      requestAnimationFrame(updateCanvasSize);
    });
    
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    // Fallback for older browsers
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

      {/* Canvas Container - Responsive wrapper for iframe embedding */}
      <div 
        ref={containerRef}
        className="flex-1 min-h-0 overflow-hidden w-full"
      >
        <ScrollArea className="w-full h-full">
          <div
            className="relative bg-background mx-auto"
            style={{
              width: `${canvasSize.width || BASE_CANVAS_WIDTH}px`,
              height: `${canvasSize.height || '100%'}px`,
              minHeight: '100%',
              padding: '20px',
              transform: `scale(${scale})`,
              transformOrigin: 'top center',
              // Adjust margin to account for scaled content height
              marginBottom: scale < 1 && canvasSize.height > 0 
                ? `${canvasSize.height * (1 - scale)}px` 
                : '0',
              backgroundImage: `
                linear-gradient(to right, hsl(var(--border) / 0.05) 1px, transparent 1px),
                linear-gradient(to bottom, hsl(var(--border) / 0.05) 1px, transparent 1px)
              `,
              backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
            }}
          >
            <div
              ref={canvasRef}
              className="relative w-full h-full"
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
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

