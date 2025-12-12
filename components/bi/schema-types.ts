/**
 * Core Type Definitions for Component Schemas
 */

export type PropertyType =
  | "string"
  | "number"
  | "boolean"
  | "array"
  | "object"
  | "color"
  | "data-source"
  | "enum";

export type ControlType =
  | "input"
  | "textarea"
  | "number"
  | "select"
  | "slider"
  | "color-picker"
  | "toggle"
  | "array-builder"
  | "object-editor";

export type ComponentCategory =
  | "Charts"
  | "Metrics"
  | "Tables"
  | "Maps"
  | "Insights"
  | "Filters"
  | "AI"
  | "Share"
  | "Advanced";

export interface ValidationRule {
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  minItems?: number;
  maxItems?: number;
  pattern?: string;
  enum?: (string | number)[];
  required?: boolean;
}

export interface PropertyDefinition {
  key: string;
  type: PropertyType;
  label: string;
  description?: string;
  defaultValue?: unknown;
  validation?: ValidationRule;
  controlType: ControlType;
  nested?: PropertyDefinition[];
  options?: Array<{ value: string | number; label: string }>;
  category?: string; // For grouping properties in UI (Data, Appearance, Layout, Advanced, etc.)
  placeholder?: string;
  helpText?: string;
  hidden?: boolean;
  disabled?: boolean;
  // Data field configuration
  isDataField?: boolean; // Explicitly mark as data field
  dataFieldType?: "x-axis" | "y-axis" | "name" | "value" | "grouping" | "color"; // Type of data field
  allowedColumnTypes?: Array<"string" | "number" | "date" | "boolean">; // Filter columns by type
}

export interface ComponentSchema {
  componentType: string;
  displayName: string;
  icon: string;
  category: ComponentCategory;
  description: string;
  properties: PropertyDefinition[];
}

export interface ValidationError {
  property: string;
  message: string;
  value?: unknown;
}

export interface ValidationResult {
  success: boolean;
  errors?: ValidationError[];
  data?: Record<string, unknown>;
}

// Common properties applied to all components
export const commonProperties: PropertyDefinition[] = [
  {
    key: "title",
    type: "string",
    label: "Title",
    description: "Component title",
    defaultValue: "",
    controlType: "input",
    placeholder: "Enter component title",
  },
  {
    key: "description",
    type: "string",
    label: "Description",
    description: "Component description",
    defaultValue: "",
    controlType: "textarea",
    placeholder: "Enter description",
  },
];
