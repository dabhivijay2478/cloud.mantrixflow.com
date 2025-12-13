"use client";

import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
  className?: string;
}

export function ProgressSteps({
  steps,
  currentStepId,
  className,
}: ProgressStepsProps) {
  const currentStepIndex = steps.findIndex((s) => s.id === currentStepId);

  return (
    <div
      className={cn(
        "border-b bg-muted/30 px-4 sm:px-6 py-3 sm:py-4",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex flex-1 items-center min-w-0">
            <div className="flex flex-col items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
              <div
                className={cn(
                  "flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full border-2 transition-all duration-300",
                  index < currentStepIndex
                    ? "border-primary bg-primary text-primary-foreground shadow-md scale-105"
                    : index === currentStepIndex
                      ? "border-primary bg-primary/10 text-primary shadow-sm scale-105"
                      : "border-muted bg-background text-muted-foreground",
                )}
              >
                {index < currentStepIndex ? (
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
                ) : (
                  <span className="text-xs sm:text-sm font-semibold">
                    {index + 1}
                  </span>
                )}
              </div>
              <div className="text-center min-w-0 w-full">
                <p
                  className={cn(
                    "text-xs sm:text-sm font-medium truncate",
                    index === currentStepIndex
                      ? "text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {step.label}
                </p>
                {step.description && (
                  <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block truncate">
                    {step.description}
                  </p>
                )}
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "mx-2 sm:mx-4 h-0.5 flex-1 transition-colors duration-300 hidden sm:block",
                  index < currentStepIndex ? "bg-primary" : "bg-muted",
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
