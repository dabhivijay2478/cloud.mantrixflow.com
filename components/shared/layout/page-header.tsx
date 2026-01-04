"use client";

import { ArrowLeft } from "lucide-react";
import type * as React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { ProgressStep } from "../navigation/progress-steps";
import { ProgressSteps } from "../navigation/progress-steps";

/**
 * PageHeader
 * @description Standardized page header component with title, description, and optional action button.
 * Used across workspace pages, onboarding pages, and other page-level components.
 * @param {PageHeaderProps} props - Component properties
 * @param {string} props.title - Page title
 * @param {string} [props.description] - Page description/subtitle
 * @param {React.ReactNode} [props.action] - Action element (e.g., button) displayed on the right
 * @param {React.ReactNode} [props.breadcrumbs] - Breadcrumb navigation component
 * @param {React.ReactNode} [props.backButton] - Back navigation button
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} PageHeader component
 * @example
 * <PageHeader
 *   title="Dashboard"
 *   description="Manage your dashboards"
 *   action={<Button>New Dashboard</Button>}
 * />
 */
export interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  breadcrumbs?: React.ReactNode;
  backButton?: React.ReactNode;
  showBackIcon?: boolean;
  onBack?: () => void;
  progressSteps?: ProgressStep[];
  currentStepId?: string;
  onStepClick?: (stepId: string) => void;
  className?: string;
}

export function PageHeader({
  title,
  description,
  action,
  breadcrumbs,
  backButton,
  showBackIcon = false,
  onBack,
  progressSteps,
  currentStepId,
  onStepClick,
  className,
}: PageHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <div className={cn("space-y-2 pb-3", className)}>
      {breadcrumbs && <div className="flex items-center">{breadcrumbs}</div>}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="min-w-0 flex-1">
            <h1 className="text-base font-semibold tracking-tight sm:text-lg">
              {title}
            </h1>
            {description && (
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                {description}
              </p>
            )}
          </div>
          {progressSteps && currentStepId && (
            <div className="shrink-0 hidden sm:block">
              <ProgressSteps
                steps={progressSteps}
                currentStepId={currentStepId}
                onStepClick={onStepClick}
              />
            </div>
          )}
          {showBackIcon && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={handleBack}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {action && <div className="flex items-center">{action}</div>}
        </div>
      </div>
      {progressSteps && currentStepId && (
        <div className="sm:hidden">
          <ProgressSteps
            steps={progressSteps}
            currentStepId={currentStepId}
            onStepClick={onStepClick}
          />
        </div>
      )}
    </div>
  );
}
