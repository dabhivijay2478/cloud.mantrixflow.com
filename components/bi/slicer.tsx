"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

/**
 * Slicer
 * @description Filter/slicer component for interactive data filtering in BI dashboards.
 * @param {SlicerProps} props - Component properties
 * @param {SlicerOption[]} props.options - Array of filter options
 * @param {string} [props.title] - Slicer title
 * @param {string} [props.description] - Slicer description
 * @param {SlicerType} [props.type] - Slicer type: "checkbox" | "dropdown" | "button" (default: "checkbox")
 * @param {boolean} [props.multiSelect] - Allow multiple selections (default: true for checkbox, false for others)
 * @param {string[]} [props.defaultValues] - Default selected values
 * @param {Function} [props.onChange] - Callback when selection changes
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} Slicer component
 * @example
 * <Slicer
 *   title="Region Filter"
 *   type="checkbox"
 *   options={[
 *     { value: "north", label: "North" },
 *     { value: "south", label: "South" },
 *     { value: "east", label: "East" }
 *   ]}
 *   onChange={(values) => console.log(values)}
 * />
 */

export interface SlicerOption {
  value: string;
  label: string;
  count?: number;
}

export type SlicerType = "checkbox" | "dropdown" | "button";

export interface SlicerProps {
  options: SlicerOption[];
  title?: string;
  description?: string;
  type?: SlicerType;
  multiSelect?: boolean;
  defaultValues?: string[];
  onChange?: (values: string[]) => void;
  className?: string;
}

export function Slicer({
  options,
  title,
  description,
  type = "checkbox",
  multiSelect,
  defaultValues = [],
  onChange,
  className,
}: SlicerProps) {
  const isMultiSelectDefault = multiSelect ?? type === "checkbox";
  const [selectedValues, setSelectedValues] = useState<string[]>(defaultValues);

  const handleToggle = (value: string) => {
    let newValues: string[];
    if (isMultiSelectDefault) {
      newValues = selectedValues.includes(value)
        ? selectedValues.filter((v) => v !== value)
        : [...selectedValues, value];
    } else {
      newValues = selectedValues.includes(value) ? [] : [value];
    }
    setSelectedValues(newValues);
    onChange?.(newValues);
  };

  const handleSelectChange = (value: string) => {
    const newValues = value ? [value] : [];
    setSelectedValues(newValues);
    onChange?.(newValues);
  };

  return (
    <Card className={className}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </CardHeader>
      )}
      <CardContent>
        {type === "checkbox" && (
          <div className="space-y-3">
            {options.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={option.value}
                  checked={selectedValues.includes(option.value)}
                  onCheckedChange={() => handleToggle(option.value)}
                />
                <Label
                  htmlFor={option.value}
                  className="text-sm font-normal cursor-pointer flex-1 flex items-center justify-between"
                >
                  <span>{option.label}</span>
                  {option.count !== undefined && (
                    <span className="text-xs text-muted-foreground">
                      ({option.count})
                    </span>
                  )}
                </Label>
              </div>
            ))}
          </div>
        )}

        {type === "dropdown" && (
          <Select
            value={selectedValues[0] || ""}
            onValueChange={handleSelectChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                  {option.count !== undefined && ` (${option.count})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {type === "button" && (
          <div className="flex flex-wrap gap-2">
            {options.map((option) => (
              <Button
                key={option.value}
                variant={
                  selectedValues.includes(option.value) ? "default" : "outline"
                }
                size="sm"
                onClick={() => handleToggle(option.value)}
                className={cn(
                  selectedValues.includes(option.value) && "bg-primary",
                )}
              >
                {option.label}
                {option.count !== undefined && (
                  <span className="ml-1 text-xs opacity-70">
                    ({option.count})
                  </span>
                )}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
