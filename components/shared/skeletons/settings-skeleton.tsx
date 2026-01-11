"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * SettingsSkeleton
 * @description Skeleton loader for settings pages with sections, form fields, and save buttons.
 * @param {SettingsSkeletonProps} props - Component properties
 * @param {number} [props.sectionCount] - Number of sections (default: 3)
 * @param {number} [props.fieldCountPerSection] - Number of form fields per section (default: 3)
 * @param {boolean} [props.showSaveButton] - Show save button placeholder (default: true)
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} SettingsSkeleton component
 * @example
 * <SettingsSkeleton />
 * <SettingsSkeleton sectionCount={2} fieldCountPerSection={4} />
 */
export interface SettingsSkeletonProps {
  sectionCount?: number;
  fieldCountPerSection?: number;
  showSaveButton?: boolean;
  className?: string;
}

export function SettingsSkeleton({
  sectionCount = 3,
  fieldCountPerSection = 3,
  showSaveButton = true,
  className,
}: SettingsSkeletonProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {Array.from({ length: sectionCount }, (_, sectionIndex) => {
        const sectionKey = `section-skeleton-${sectionCount}-${sectionIndex}`;
        return (
          <Card
            key={sectionKey}
            className="overflow-hidden border"
            style={{
              animationDelay: `${sectionIndex * 100}ms`,
            }}
          >
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="mt-2 h-4 w-96" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: fieldCountPerSection }, (_, fieldIndex) => {
                const fieldKey = `field-skeleton-${sectionCount}-${sectionIndex}-${fieldCountPerSection}-${fieldIndex}`;
                return (
                  <div key={fieldKey} className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-10 w-full" />
                    {fieldIndex === fieldCountPerSection - 1 && (
                      <Skeleton className="h-3 w-64" />
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        );
      })}

      {/* Save Button */}
      {showSaveButton && (
        <div className="flex items-center justify-end gap-2">
          <Skeleton className="h-10 w-24" />
        </div>
      )}
    </div>
  );
}
