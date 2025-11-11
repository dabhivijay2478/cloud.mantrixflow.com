"use client";

import { useRouter } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { Search, ExternalLink } from "lucide-react";

export function WorkspaceTopbar() {
  const router = useRouter();
  const { currentDashboard } = useWorkspaceStore();

  const handleOpenInNewTab = () => {
    if (currentDashboard) {
      const url = `/workspace/dashboards/${currentDashboard.id}/view`;
      window.open(url, "_blank");
    } else {
      // If no dashboard is selected, open the main workspace
      window.open("/workspace", "_blank");
    }
  };

  return (
    <header className="flex h-14 items-center gap-4 border-b px-4">
      <SidebarTrigger />
      <div className="flex-1 flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search dashboards, data sources..."
            className="pl-9"
          />
        </div>
        {currentDashboard && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleOpenInNewTab}
            title="Open in new tab"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        )}
      </div>
    </header>
  );
}

