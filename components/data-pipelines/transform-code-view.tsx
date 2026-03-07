"use client";

import { AlertTriangle, Copy, Code2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/utils/toast";

const TRANSFORM_HEADER = `def transform(record):
    """Transform incoming record. Return dict for output, None to skip."""
`;

interface TransformCodeViewProps {
  script: string;
  hasUnsavedChanges?: boolean;
  hasSyntaxError?: boolean;
  onEditClick?: () => void;
}

export function TransformCodeView({
  script,
  hasUnsavedChanges = false,
  hasSyntaxError = false,
  onEditClick,
}: TransformCodeViewProps) {
  const [copied, setCopied] = useState(false);

  const fullScript = script.trim().startsWith("def transform")
    ? script
    : `${TRANSFORM_HEADER}\n${script}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullScript);
      setCopied(true);
      toast.success("Copied", "Transform script copied to clipboard.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Copy failed", "Could not copy to clipboard.");
    }
  };

  const showWarning = hasUnsavedChanges || hasSyntaxError;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Code2 className="h-3 w-3 text-muted-foreground" />
          <span className="text-sm font-medium">Transform Code</span>
          <span className="text-xs text-muted-foreground">
            Code for User Defined Transform
          </span>
          {showWarning && (
            <span
              className="flex items-center gap-1 text-amber-600"
              title="Unsaved changes or syntax error"
            >
              <AlertTriangle className="h-3 w-3" />
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-8 text-xs"
          aria-label="Copy transform script"
        >
          <Copy className="h-3 w-3 mr-1" />
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <div className="border rounded-lg bg-zinc-950 overflow-hidden">
        <pre className="font-mono text-sm text-zinc-100 p-4 overflow-auto max-h-[400px] whitespace-pre-wrap">
          {fullScript}
        </pre>
      </div>
      {onEditClick && (
        <p className="text-xs text-muted-foreground">
          Edit this script from the{" "}
          <Button
            variant="link"
            className="h-auto p-0 text-xs"
            onClick={onEditClick}
            type="button"
          >
            pipeline editor
          </Button>
          .
        </p>
      )}
    </div>
  );
}
