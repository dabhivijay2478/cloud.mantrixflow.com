"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { PromptInput } from "@/components/bi/prompt-input";
import { X, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function AgentPanel() {
  const { agentPanelOpen, setAgentPanelOpen, currentDashboard, addComponentToDashboard } = useWorkspaceStore();
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState("");

  const suggestions = [
    "Add a revenue chart",
    "Show user growth trends",
    "Create a sales breakdown",
    "Display top products",
  ];

  const handleGenerate = async (promptText: string) => {
    if (!promptText.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    if (!currentDashboard) {
      toast.error("Please select a dashboard first");
      return;
    }

    setLoading(true);
    try {
      // Simulate AI component generation
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // In a real app, this would call an API to generate the component
      const component = {
        id: `comp_${Date.now()}`,
        type: "line-chart",
        position: { x: 0, y: 0, w: 6, h: 4 },
        config: {
          title: promptText,
          data: [],
        },
      };

      addComponentToDashboard(currentDashboard.id, component);
      toast.success("Component generated successfully!");
      setPrompt("");
    } catch (error) {
      toast.error("Failed to generate component");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!agentPanelOpen) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="fixed right-0 top-1/2 -translate-y-1/2 z-10 rounded-l-lg rounded-r-none"
        onClick={() => setAgentPanelOpen(true)}
      >
        <Sparkles className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <div className="w-80 border-l bg-muted/30 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          <h2 className="font-semibold text-sm">AI Agent</h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => setAgentPanelOpen(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Generate Components</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Describe what you want to add to your dashboard. Our AI will create the component for you.
            </p>
            <PromptInput
              value={prompt}
              onChange={setPrompt}
              onSubmit={handleGenerate}
              loading={loading}
              suggestions={suggestions}
              placeholder="e.g., Add a revenue chart for the last 6 months"
            />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Recent Generations</h3>
            <div className="text-xs text-muted-foreground">
              No recent generations yet. Start by generating a component above.
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

