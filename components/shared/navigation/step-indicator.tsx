"use client";

import { Check } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * StepIndicator
 * @description Multi-step process indicator component.
 * Displays steps with numbers, titles, and descriptions.
 * @param {StepIndicatorProps} props - Component properties
 * @param {Step[]} props.steps - Array of step objects
 * @param {number} props.currentStep - Current active step (1-indexed)
 * @param {"horizontal" | "vertical"} [props.orientation] - Layout orientation (default: "vertical")
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} StepIndicator component
 * @example
 * <StepIndicator
 *   steps={[
 *     { number: 1, title: "Create Organization", description: "Set up workspace" },
 *     { number: 2, title: "Connect Data", description: "Link your data source" },
 *   ]}
 *   currentStep={1}
 * />
 */
export interface Step {
  number: number;
  title: string;
  description?: string;
}

export interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  orientation?: "horizontal" | "vertical";
  className?: string;
}

export function StepIndicator({
  steps,
  currentStep,
  orientation = "vertical",
  className,
}: StepIndicatorProps) {
  return (
    <div
      className={cn(
        "space-y-4",
        orientation === "horizontal" && "flex flex-row space-y-0 space-x-4",
        className,
      )}
    >
      {steps.map((step) => {
        const isCompleted = step.number < currentStep;
        const isCurrent = step.number === currentStep;
        const isUpcoming = step.number > currentStep;

        return (
          <div
            key={step.number}
            className={cn(
              "flex items-start gap-4",
              orientation === "horizontal" &&
                "flex-col items-center text-center",
            )}
          >
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                isCompleted && "bg-primary text-primary-foreground",
                isCurrent && "bg-primary/10 text-primary",
                isUpcoming && "bg-muted text-muted-foreground",
                orientation === "horizontal" && "mt-0.5",
              )}
            >
              {isCompleted ? (
                <Check className="h-4 w-4" />
              ) : (
                <span className="text-sm font-semibold">{step.number}</span>
              )}
            </div>
            <div className={cn(orientation === "horizontal" && "text-center")}>
              <h3
                className={cn(
                  "font-semibold mb-1",
                  isCurrent && "text-foreground",
                  isUpcoming && "text-muted-foreground",
                )}
              >
                {step.title}
              </h3>
              {step.description && (
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
