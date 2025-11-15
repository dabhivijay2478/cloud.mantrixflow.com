"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Edit } from "lucide-react";

/**
 * EditPrompt
 * @description Modify existing AI query/prompt.
 * Opens a dialog to edit and resubmit a prompt for regeneration.
 * @param {EditPromptProps} props - Component properties
 * @param {string} props.originalPrompt - Original prompt text
 * @param {(newPrompt: string) => void | Promise<void>} props.onSubmit - Submit handler
 * @param {boolean} [props.loading] - Loading state
 * @param {boolean} [props.disabled] - Disabled state
 * @param {boolean} [props.showLabel] - Show "Edit" label (default: true)
 * @param {EditPromptVariant} [props.variant] - Button variant
 * @param {EditPromptSize} [props.size] - Button size
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} EditPrompt component
 * @example
 * <EditPrompt
 *   originalPrompt="Show me sales data"
 *   onSubmit={async (newPrompt) => {
 *     await regenerateWithPrompt(newPrompt);
 *   }}
 * />
 */

export type EditPromptVariant = "default" | "outline" | "ghost" | "secondary";
export type EditPromptSize = "sm" | "default" | "lg";

export interface EditPromptProps {
  originalPrompt: string;
  onSubmit: (newPrompt: string) => void | Promise<void>;
  loading?: boolean;
  disabled?: boolean;
  showLabel?: boolean;
  variant?: EditPromptVariant;
  size?: EditPromptSize;
  className?: string;
}

export function EditPrompt({
  originalPrompt,
  onSubmit,
  loading = false,
  disabled = false,
  showLabel = true,
  variant = "ghost",
  size = "default",
  className,
}: EditPromptProps) {
  const [open, setOpen] = React.useState(false);
  const [editedPrompt, setEditedPrompt] = React.useState(originalPrompt);

  React.useEffect(() => {
    if (open) {
      setEditedPrompt(originalPrompt);
    }
  }, [open, originalPrompt]);

  const handleSubmit = async () => {
    if (!editedPrompt.trim()) return;

    try {
      await onSubmit(editedPrompt);
      setOpen(false);
    } catch (error) {
      console.error("Submit failed:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          disabled={disabled}
          className={className}
        >
          <Edit className="h-4 w-4" />
          {showLabel && <span className="ml-2">Edit Prompt</span>}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Edit Prompt</DialogTitle>
          <DialogDescription>
            Modify your prompt to regenerate the dashboard with new parameters.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Textarea
            value={editedPrompt}
            onChange={(e) => setEditedPrompt(e.target.value)}
            placeholder="Describe the dashboard you want to create..."
            className="min-h-[150px] resize-none"
            disabled={loading}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!editedPrompt.trim() || loading}
          >
            {loading ? "Regenerating..." : "Regenerate"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
