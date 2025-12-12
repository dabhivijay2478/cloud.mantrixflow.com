/**
 * Dynamic Property Renderer
 * Renders form controls based on PropertyDefinition schema
 */

"use client";

import { X } from "lucide-react";
import { useState } from "react";
import type { PropertyDefinition } from "@/components/bi/component-schemas";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export interface DatasetColumn {
  name: string;
  type: string;
  selected?: boolean;
  order?: number;
}

interface PropertyControlProps {
  property: PropertyDefinition;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
  availableColumns?: DatasetColumn[];
}

export function PropertyControl({
  property,
  value,
  onChange,
  error,
  availableColumns = [],
}: PropertyControlProps) {
  const [isSelectOpen, setIsSelectOpen] = useState(false);

  // Check if this property should use dataset columns
  const isDataFieldProperty =
    property.isDataField !== undefined
      ? property.isDataField
      : property.key.toLowerCase().includes("key") ||
        property.key.toLowerCase().includes("field") ||
        property.key.toLowerCase().includes("column") ||
        property.key.toLowerCase().includes("axis");
  
  // Filter available columns by allowed types if specified
  const getFilteredColumns = () => {
    if (!isDataFieldProperty || !property.allowedColumnTypes || property.allowedColumnTypes.length === 0) {
      return availableColumns;
    }
    return availableColumns.filter((col) => 
      property.allowedColumnTypes?.includes(col.type as "string" | "number" | "date" | "boolean")
    );
  };
  
  const filteredColumns = getFilteredColumns();

  const renderControl = () => {
    // Multi-select for array data field properties (e.g., yKeys)
    if (
      property.type === "array" &&
      isDataFieldProperty &&
      filteredColumns.length > 0
    ) {
      const selectedValues = (value as string[]) || [];

      const handleToggleColumn = (columnName: string) => {
        const newValues = selectedValues.includes(columnName)
          ? selectedValues.filter((v) => v !== columnName)
          : [...selectedValues, columnName];
        onChange(newValues);
      };

      const handleRemoveColumn = (columnName: string) => {
        onChange(selectedValues.filter((v) => v !== columnName));
      };

      return (
        <div className="space-y-2">
          {/* Selected columns as badges */}
          {selectedValues.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {selectedValues.map((colName) => (
                <Badge key={colName} variant="secondary" className="gap-1">
                  {colName}
                  <button
                    type="button"
                    onClick={() => handleRemoveColumn(colName)}
                    className="ml-1 hover:bg-muted rounded-sm"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* Dropdown to add more columns */}
          <Select
            open={isSelectOpen}
            onOpenChange={setIsSelectOpen}
            value=""
            onValueChange={(colName) => {
              handleToggleColumn(colName);
              setIsSelectOpen(false);
            }}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  selectedValues.length > 0
                    ? `${selectedValues.length} column(s) selected`
                    : property.placeholder || "Select columns"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {filteredColumns.map((col) => {
                const isSelected = selectedValues.includes(col.name);
                return (
                  <SelectItem key={col.name} value={col.name}>
                    <div className="flex items-center justify-between w-full gap-2">
                      <span>
                        {col.name}{" "}
                        <span className="text-xs text-muted-foreground">
                          ({col.type})
                        </span>
                      </span>
                      {isSelected && <span className="text-primary">✓</span>}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      );
    }

    // Single-select for string data field properties (e.g., xKey)
    if (
      isDataFieldProperty &&
      filteredColumns.length > 0 &&
      property.type === "string"
    ) {
      return (
        <Select
          value={(value as string) || ""}
          onValueChange={onChange}
          disabled={property.disabled}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={property.placeholder || "Select a column"}
            />
          </SelectTrigger>
          <SelectContent>
            {filteredColumns.map((col) => (
              <SelectItem key={col.name} value={col.name}>
                {col.name}{" "}
                <span className="text-xs text-muted-foreground">
                  ({col.type})
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    switch (property.controlType) {
      case "input":
        return (
          <Input
            type="text"
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={property.placeholder}
            disabled={property.disabled}
          />
        );

      case "textarea":
        return (
          <Textarea
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={property.placeholder}
            disabled={property.disabled}
            rows={3}
          />
        );

      case "number":
        return (
          <Input
            type="number"
            value={(value as number) || 0}
            onChange={(e) => onChange(Number(e.target.value))}
            min={property.validation?.min}
            max={property.validation?.max}
            disabled={property.disabled}
          />
        );

      case "toggle":
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={(value as boolean) || false}
              onCheckedChange={onChange}
              disabled={property.disabled}
            />
            <Label className="text-sm font-normal">
              {(value as boolean) ? "Enabled" : "Disabled"}
            </Label>
          </div>
        );

      case "select":
        return (
          <Select
            value={(value as string) || ""}
            onValueChange={onChange}
            disabled={property.disabled}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={property.placeholder || "Select an option"}
              />
            </SelectTrigger>
            <SelectContent>
              {property.options?.map((option) => (
                <SelectItem
                  key={option.value.toString()}
                  value={option.value.toString()}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "slider":
        return (
          <div className="space-y-2">
            <Slider
              value={[(value as number) || 0]}
              onValueChange={(values) => onChange(values[0])}
              min={property.validation?.min || 0}
              max={property.validation?.max || 100}
              step={1}
              disabled={property.disabled}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{property.validation?.min || 0}</span>
              <span className="font-medium">{value as number}</span>
              <span>{property.validation?.max || 100}</span>
            </div>
          </div>
        );

      case "color-picker":
        return (
          <div className="flex gap-2">
            <Input
              type="color"
              value={(value as string) || "#000000"}
              onChange={(e) => onChange(e.target.value)}
              className="w-16 h-10 p-1 cursor-pointer"
              disabled={property.disabled}
            />
            <Input
              type="text"
              value={(value as string) || ""}
              onChange={(e) => onChange(e.target.value)}
              placeholder="#000000"
              className="flex-1"
              disabled={property.disabled}
            />
          </div>
        );

      case "array-builder":
        return (
          <div className="text-sm text-muted-foreground">
            Array builder not yet implemented
          </div>
        );

      default:
        return (
          <div className="text-sm text-muted-foreground">
            Control type "{property.controlType}" not implemented
          </div>
        );
    }
  };

  if (property.hidden) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={property.key} className="text-sm font-medium">
          {property.label}
          {property.validation?.required && (
            <span className="text-destructive ml-1">*</span>
          )}
        </Label>
      </div>
      {renderControl()}
      {property.description && (
        <p className="text-xs text-muted-foreground">{property.description}</p>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
