"use client";

import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * ProgressSteps
 * @description Horizontal progress indicator component for multi-step processes.
 * Displays steps with numbers, labels, descriptions, and connecting lines.
 * Shows completed steps with checkmarks and highlights the current step.
 * @param {ProgressStepsProps} props - Component properties
 * @param {ProgressStep[]} props.steps - Array of step objects with id, label, and description
 * @param {string} props.currentStepId - ID of the current active step
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} ProgressSteps component
 * @example
 * <ProgressSteps
 *   steps={[
 *     { id: "collector", label: "Collector", description: "Configure data sources" },
 *     { id: "transform", label: "Transform", description: "Map fields to schema" },
 *     { id: "emitter", label: "Emitter", description: "Configure destinations" },
 *   ]}
 *   currentStepId="transform"
 * />
 */
export interface ProgressStep {
  id: string;
  label: string;
  description?: string;
}

export interface ProgressStepsProps {
  steps: ProgressStep[];
  currentStepId: string;
  onStepClick?: (stepId: string) => void;
  className?: string;
}

export function ProgressSteps({
  steps,
  currentStepId,
  onStepClick,
  className,
}: ProgressStepsProps) {
  const currentStepIndex = steps.findIndex((s) => s.id === currentStepId);

  return (
    <div className={cn("flex items-center gap-2 sm:gap-3", className)}>
      {steps.map((step, index) => (
        <Tooltip key={step.id}>
          <TooltipTrigger asChild>
            <div
              className="flex flex-col items-center gap-0.5 sm:gap-1 cursor-pointer"
              onClick={() => onStepClick?.(step.id)}
            >
              <div
                className={cn(
                  "flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full border-2 transition-all duration-300",
                  index < currentStepIndex
                    ? "border-primary bg-primary text-primary-foreground"
                    : index === currentStepIndex
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-muted bg-background text-muted-foreground",
                )}
              >
                {index < currentStepIndex ? (
                  <CheckCircle2 className="h-2 w-2 sm:h-2.5 sm:w-2.5" />
                ) : (
                  <span className="text-xs font-semibold">{index + 1}</span>
                )}
              </div>
              <p
                className={cn(
                  "text-xs font-medium truncate",
                  index === currentStepIndex
                    ? "text-foreground"
                    : "text-muted-foreground",
                )}
              >
                {step.label}
              </p>
            </div>
          </TooltipTrigger>
          {step.description && (
            <TooltipContent>
              <p className="text-xs">{step.description}</p>
            </TooltipContent>
          )}
        </Tooltip>
      ))}
    </div>
  );
}
