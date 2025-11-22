/**
 * Component Properties Schema System
 * 
 * Defines TypeScript interfaces and Zod schemas for all BI components.
 * Provides runtime validation, default values, and type-safe property access.
 * 
 * @module components/bi/schemas/component-properties
 */

import { z } from "zod";
import type { LucideIcon } from "lucide-react";

// ============================================================================
// Core Type Definitions
// ============================================================================

/**
 * Supported property types
 */
export type PropertyType =
    | "string"
    | "number"
    | "boolean"
    | "array"
    | "object"
    | "color"
    | "data-source"
    | "enum"
    | "icon"
    | "function";

/**
 * UI control types for rendering property inputs
 */
export type ControlType =
    | "input"
    | "textarea"
    | "number"
    | "select"
    | "slider"
    | "color-picker"
    | "toggle"
    | "date-picker"
    | "multi-select"
    | "array-builder"
    | "object-editor"
    | "icon-picker";

/**
 * Component categories for organization
 */
export type ComponentCategory =
    | "Charts"
    | "Metrics"
    | "Tables"
    | "Maps"
    | "Insights"
    | "Filters"
    | "AI"
    | "Share"
    | "Advanced"
    | "Layout";

/**
 * Validation constraints for properties
 */
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
    custom?: (value: unknown) => boolean | string;
}

/**
 * Individual property definition
 */
export interface PropertyDefinition {
    key: string;
    type: PropertyType;
    label: string;
    description?: string;
    defaultValue?: unknown;
    validation?: ValidationRule;
    controlType: ControlType;
    group?: string; // For nested properties
    nested?: PropertyDefinition[]; // For object properties
    options?: Array<{ value: string | number; label: string }>; // For select/enum
    placeholder?: string;
    helpText?: string;
    hidden?: boolean;
    disabled?: boolean;
}

/**
 * Complete component schema
 */
export interface ComponentSchema {
    componentType: string;
    displayName: string;
    icon: string; // Lucide icon name
    category: ComponentCategory;
    description: string;
    properties: PropertyDefinition[];
    examples?: string[];
}

/**
 * Property value type
 */
export type PropertyValue = string | number | boolean | object | unknown[] | null;

/**
 * Validation error
 */
export interface ValidationError {
    property: string;
    message: string;
    value?: unknown;
}

/**
 * Validation result
 */
export interface ValidationResult {
    success: boolean;
    errors?: ValidationError[];
    data?: Record<string, PropertyValue>;
}

// ============================================================================
// Zod Schemas
// ============================================================================

const PropertyTypeSchema = z.enum([
    "string",
    "number",
    "boolean",
    "array",
    "object",
    "color",
    "data-source",
    "enum",
    "icon",
    "function",
]);

const ControlTypeSchema = z.enum([
    "input",
    "textarea",
    "number",
    "select",
    "slider",
    "color-picker",
    "toggle",
    "date-picker",
    "multi-select",
    "array-builder",
    "object-editor",
    "icon-picker",
]);

const ComponentCategorySchema = z.enum([
    "Charts",
    "Metrics",
    "Tables",
    "Maps",
    "Insights",
    "Filters",
    "AI",
    "Share",
    "Advanced",
    "Layout",
]);

const ValidationRuleSchema = z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    minLength: z.number().optional(),
    maxLength: z.number().optional(),
    minItems: z.number().optional(),
    maxItems: z.number().optional(),
    pattern: z.string().optional(),
    enum: z.array(z.union([z.string(), z.number()])).optional(),
    required: z.boolean().optional(),
});

const PropertyDefinitionSchema: z.ZodType<PropertyDefinition> = z.lazy(() =>
    z.object({
        key: z.string(),
        type: PropertyTypeSchema,
        label: z.string(),
        description: z.string().optional(),
        defaultValue: z.unknown().optional(),
        validation: ValidationRuleSchema.optional(),
        controlType: ControlTypeSchema,
        group: z.string().optional(),
        nested: z.array(PropertyDefinitionSchema).optional(),
        options: z.array(z.object({ value: z.union([z.string(), z.number()]), label: z.string() })).optional(),
        placeholder: z.string().optional(),
        helpText: z.string().optional(),
        hidden: z.boolean().optional(),
        disabled: z.boolean().optional(),
    }),
);

const ComponentSchemaDefinition = z.object({
    componentType: z.string(),
    displayName: z.string(),
    icon: z.string(),
    category: ComponentCategorySchema,
    description: z.string(),
    properties: z.array(PropertyDefinitionSchema),
    examples: z.array(z.string()).optional(),
});

// ============================================================================
// Common Properties (Applied to all components)
// ============================================================================

const commonProperties: PropertyDefinition[] = [
    {
        key: "id",
        type: "string",
        label: "Component ID",
        description: "Unique identifier for the component",
        defaultValue: () => `component-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        controlType: "input",
        disabled: true,
        hidden: true,
    },
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
        description: "Component description or subtitle",
        defaultValue: "",
        controlType: "textarea",
        placeholder: "Enter component description",
    },
    {
        key: "width",
        type: "string",
        label: "Width",
        description: "Component width (100%, 500px, etc.)",
        defaultValue: "100%",
        controlType: "input",
        placeholder: "100%",
    },
    {
        key: "height",
        type: "number",
        label: "Height",
        description: "Component height in pixels",
        defaultValue: 400,
        controlType: "number",
        validation: { min: 100, max: 2000 },
    },
    {
        key: "padding",
        type: "object",
        label: "Padding",
        description: "Component padding",
        defaultValue: { top: 16, right: 16, bottom: 16, left: 16 },
        controlType: "object-editor",
        nested: [
            { key: "top", type: "number", label: "Top", defaultValue: 16, controlType: "number", validation: { min: 0, max: 100 } },
            { key: "right", type: "number", label: "Right", defaultValue: 16, controlType: "number", validation: { min: 0, max: 100 } },
            { key: "bottom", type: "number", label: "Bottom", defaultValue: 16, controlType: "number", validation: { min: 0, max: 100 } },
            { key: "left", type: "number", label: "Left", defaultValue: 16, controlType: "number", validation: { min: 0, max: 100 } },
        ],
    },
    {
        key: "margin",
        type: "object",
        label: "Margin",
        description: "Component margin",
        defaultValue: { top: 0, right: 0, bottom: 0, left: 0 },
        controlType: "object-editor",
        nested: [
            { key: "top", type: "number", label: "Top", defaultValue: 0, controlType: "number", validation: { min: 0, max: 100 } },
            { key: "right", type: "number", label: "Right", defaultValue: 0, controlType: "number", validation: { min: 0, max: 100 } },
            { key: "bottom", type: "number", label: "Bottom", defaultValue: 0, controlType: "number", validation: { min: 0, max: 100 } },
            { key: "left", type: "number", label: "Left", defaultValue: 0, controlType: "number", validation: { min: 0, max: 100 } },
        ],
    },
    {
        key: "backgroundColor",
        type: "color",
        label: "Background Color",
        description: "Component background color",
        defaultValue: "transparent",
        controlType: "color-picker",
    },
    {
        key: "borderRadius",
        type: "number",
        label: "Border Radius",
        description: "Corner radius in pixels",
        defaultValue: 8,
        controlType: "slider",
        validation: { min: 0, max: 50 },
    },
    {
        key: "shadow",
        type: "boolean",
        label: "Drop Shadow",
        description: "Enable drop shadow effect",
        defaultValue: false,
        controlType: "toggle",
    },
    {
        key: "visible",
        type: "boolean",
        label: "Visible",
        description: "Component visibility",
        defaultValue: true,
        controlType: "toggle",
    },
    {
        key: "dataSource",
        type: "data-source",
        label: "Data Source",
        description: "Connected data source",
        defaultValue: null,
        controlType: "select",
        placeholder: "Select a data source",
    },
    {
        key: "className",
        type: "string",
        label: "Custom CSS Classes",
        description: "Additional CSS classes",
        defaultValue: "",
        controlType: "input",
        placeholder: "custom-class another-class",
    },
];

// ============================================================================
// Component Schemas Registry
// ============================================================================

export const componentSchemas: ComponentSchema[] = [
    // ========================================
    // CHARTS CATEGORY (16 components)
    // ========================================
    {
        componentType: "line-chart",
        displayName: "Line Chart",
        icon: "LineChart",
        category: "Charts",
        description: "Time series visualization for displaying trends over time",
        properties: [
            ...commonProperties,
            {
                key: "data",
        hidden: true,
                type: "array",
                label: "Data",
                description: "Array of data points",
                defaultValue: [],
                controlType: "array-builder",
                validation: { required: true, minItems: 1 },
            },
            {
                key: "xKey",
                type: "string",
                label: "X-Axis Field",
                description: "Field name for X-axis values",
                defaultValue: "",
                controlType: "input",
                validation: { required: true },
                placeholder: "e.g., month, date, category",
            },
            {
                key: "yKeys",
                type: "array",
                label: "Y-Axis Fields",
                description: "Field names for Y-axis values (supports multiple lines)",
                defaultValue: [],
                controlType: "array-builder",
                validation: { required: true, minItems: 1 },
            },
            {
                key: "color",
                type: "color",
                label: "Line Color",
                description: "Primary line color",
                defaultValue: "#8884d8",
                controlType: "color-picker",
            },
            {
                key: "showGrid",
                type: "boolean",
                label: "Show Grid",
                description: "Display grid lines",
                defaultValue: true,
                controlType: "toggle",
            },
            {
                key: "showLegend",
                type: "boolean",
                label: "Show Legend",
                description: "Display chart legend",
                defaultValue: true,
                controlType: "toggle",
            },
            {
                key: "curve",
                type: "enum",
                label: "Line Curve",
                description: "Line interpolation style",
                defaultValue: "monotone",
                controlType: "select",
                options: [
                    { value: "monotone", label: "Smooth (Monotone)" },
                    { value: "linear", label: "Linear" },
                    { value: "step", label: "Step" },
                    { value: "basis", label: "Basis" },
                ],
            },
        ],
    },

    {
        componentType: "bar-chart",
        displayName: "Bar Chart",
        icon: "BarChart3",
        category: "Charts",
        description: "Comparison view for categorical data",
        properties: [
            ...commonProperties,
            {
                key: "data",
        hidden: true,
                type: "array",
                label: "Data",
                defaultValue: [],
                controlType: "array-builder",
                validation: { required: true, minItems: 1 },
            },
            {
                key: "xKey",
                type: "string",
                label: "X-Axis Field",
                defaultValue: "",
                controlType: "input",
                validation: { required: true },
            },
            {
                key: "yKeys",
                type: "array",
                label: "Y-Axis Fields",
                defaultValue: [],
                controlType: "array-builder",
                validation: { required: true, minItems: 1 },
            },
            {
                key: "stacked",
                type: "boolean",
                label: "Stacked Bars",
                description: "Stack bars on top of each other",
                defaultValue: false,
                controlType: "toggle",
            },
            {
                key: "horizontal",
                type: "boolean",
                label: "Horizontal Orientation",
                description: "Display bars horizontally",
                defaultValue: false,
                controlType: "toggle",
            },
            {
                key: "showGrid",
                type: "boolean",
                label: "Show Grid",
                defaultValue: true,
                controlType: "toggle",
            },
            {
                key: "showLegend",
                type: "boolean",
                label: "Show Legend",
                defaultValue: true,
                controlType: "toggle",
            },
        ],
    },

    {
        componentType: "area-chart",
        displayName: "Area Chart",
        icon: "AreaChart",
        category: "Charts",
        description: "Cumulative trends with filled areas",
        properties: [
            ...commonProperties,
            {
                key: "data",
        hidden: true,
                type: "array",
                label: "Data",
                defaultValue: [],
                controlType: "array-builder",
                validation: { required: true },
            },
            {
                key: "xKey",
                type: "string",
                label: "X-Axis Field",
                defaultValue: "",
                controlType: "input",
                validation: { required: true },
            },
            {
                key: "yKeys",
                type: "array",
                label: "Y-Axis Fields",
                defaultValue: [],
                controlType: "array-builder",
                validation: { required: true },
            },
            {
                key: "stacked",
                type: "boolean",
                label: "Stacked Areas",
                defaultValue: false,
                controlType: "toggle",
            },
            {
                key: "gradient",
                type: "boolean",
                label: "Use Gradient",
                description: "Apply gradient fill",
                defaultValue: true,
                controlType: "toggle",
            },
            {
                key: "fillOpacity",
                type: "number",
                label: "Fill Opacity",
                description: "Area fill opacity (0-1)",
                defaultValue: 0.3,
                controlType: "slider",
                validation: { min: 0, max: 1 },
            },
        ],
    },

    {
        componentType: "pie-chart",
        displayName: "Pie Chart",
        icon: "PieChart",
        category: "Charts",
        description: "Part-to-whole visualization",
        properties: [
            ...commonProperties,
            {
                key: "data",
        hidden: true,
                type: "array",
                label: "Data",
                defaultValue: [],
                controlType: "array-builder",
                validation: { required: true },
            },
            {
                key: "nameKey",
                type: "string",
                label: "Name Field",
                description: "Field for segment labels",
                defaultValue: "name",
                controlType: "input",
                validation: { required: true },
            },
            {
                key: "valueKey",
                type: "string",
                label: "Value Field",
                description: "Field for segment values",
                defaultValue: "value",
                controlType: "input",
                validation: { required: true },
            },
            {
                key: "innerRadius",
                type: "number",
                label: "Inner Radius",
                description: "Inner radius for donut effect (0-100)",
                defaultValue: 0,
                controlType: "slider",
                validation: { min: 0, max: 100 },
            },
            {
                key: "showLegend",
                type: "boolean",
                label: "Show Legend",
                defaultValue: true,
                controlType: "toggle",
            },
            {
                key: "colors",
                type: "array",
                label: "Color Palette",
                description: "Custom colors for segments",
                defaultValue: [],
                controlType: "array-builder",
            },
        ],
    },

    {
        componentType: "donut-chart",
        displayName: "Donut Chart",
        icon: "CircleDot",
        category: "Charts",
        description: "Donut-style pie chart",
        properties: [
            ...commonProperties,
            {
                key: "data",
        hidden: true,
                type: "array",
                label: "Data",
                defaultValue: [],
                controlType: "array-builder",
                validation: { required: true },
            },
            {
                key: "nameKey",
                type: "string",
                label: "Name Field",
                defaultValue: "name",
                controlType: "input",
                validation: { required: true },
            },
            {
                key: "valueKey",
                type: "string",
                label: "Value Field",
                defaultValue: "value",
                controlType: "input",
                validation: { required: true },
            },
            {
                key: "innerRadius",
                type: "number",
                label: "Inner Radius",
                defaultValue: 60,
                controlType: "slider",
                validation: { min: 30, max: 90 },
            },
            {
                key: "showLegend",
                type: "boolean",
                label: "Show Legend",
                defaultValue: true,
                controlType: "toggle",
            },
        ],
    },

    // ========================================
    // METRICS CATEGORY (5 components)
    // ========================================
    {
        componentType: "kpi-card",
        displayName: "KPI Card",
        icon: "TrendingUp",
        category: "Metrics",
        description: "Key performance indicator with trend",
        properties: [
            ...commonProperties,
            {
                key: "value",
                type: "string",
                label: "Value",
                description: "Primary metric value",
                defaultValue: "",
                controlType: "input",
                validation: { required: true },
            },
            {
                key: "label",
                type: "string",
                label: "Label",
                description: "Metric label/description",
                defaultValue: "",
                controlType: "input",
                validation: { required: true },
            },
            {
                key: "change",
                type: "number",
                label: "Change (%)",
                description: "Percentage change",
                defaultValue: 0,
                controlType: "number",
            },
            {
                key: "changeLabel",
                type: "string",
                label: "Change Label",
                description: "Label for change period",
                defaultValue: "vs last period",
                controlType: "input",
            },
            {
                key: "prefix",
                type: "string",
                label: "Value Prefix",
                description: "Prefix (e.g., $, €)",
                defaultValue: "",
                controlType: "input",
                placeholder: "$",
            },
            {
                key: "suffix",
                type: "string",
                label: "Value Suffix",
                description: "Suffix (e.g., %, K, M)",
                defaultValue: "",
                controlType: "input",
                placeholder: "%",
            },
            {
                key: "trend",
                type: "enum",
                label: "Trend Direction",
                description: "Manual trend override",
                defaultValue: "neutral",
                controlType: "select",
                options: [
                    { value: "up", label: "Up" },
                    { value: "down", label: "Down" },
                    { value: "neutral", label: "Neutral" },
                ],
            },
            {
                key: "color",
                type: "color",
                label: "Accent Color",
                defaultValue: "#3b82f6",
                controlType: "color-picker",
            },
        ],
    },

    {
        componentType: "progress-bar",
        displayName: "Progress Bar",
        icon: "Activity",
        category: "Metrics",
        description: "Progress toward a goal",
        properties: [
            ...commonProperties,
            {
                key: "value",
                type: "number",
                label: "Value",
                description: "Current progress value",
                defaultValue: 0,
                controlType: "number",
                validation: { required: true, min: 0 },
            },
            {
                key: "max",
                type: "number",
                label: "Maximum Value",
                description: "Target/max value",
                defaultValue: 100,
                controlType: "number",
                validation: { min: 1 },
            },
            {
                key: "label",
                type: "string",
                label: "Label",
                defaultValue: "",
                controlType: "input",
            },
            {
                key: "showValue",
                type: "boolean",
                label: "Show Value",
                defaultValue: true,
                controlType: "toggle",
            },
            {
                key: "showPercentage",
                type: "boolean",
                label: "Show Percentage",
                defaultValue: true,
                controlType: "toggle",
            },
            {
                key: "variant",
                type: "enum",
                label: "Color Variant",
                defaultValue: "default",
                controlType: "select",
                options: [
                    { value: "default", label: "Default" },
                    { value: "success", label: "Success" },
                    { value: "warning", label: "Warning" },
                    { value: "danger", label: "Danger" },
                ],
            },
        ],
    },

    {
        componentType: "sparkline",
        displayName: "Sparkline",
        icon: "LineChart",
        category: "Metrics",
        description: "Inline mini-chart for trends",
        properties: [
            ...commonProperties,
            {
                key: "data",
        hidden: true,
                type: "array",
                label: "Data",
                description: "Array of numbers or objects",
                defaultValue: [],
                controlType: "array-builder",
                validation: { required: true, minItems: 2 },
            },
            {
                key: "dataKey",
                type: "string",
                label: "Data Key",
                description: "Key for values (if data is objects)",
                defaultValue: "value",
                controlType: "input",
            },
            {
                key: "type",
                type: "enum",
                label: "Chart Type",
                defaultValue: "line",
                controlType: "select",
                options: [
                    { value: "line", label: "Line" },
                    { value: "area", label: "Area" },
                ],
            },
            {
                key: "color",
                type: "color",
                label: "Color",
                defaultValue: "#8884d8",
                controlType: "color-picker",
            },
            {
                key: "height",
                type: "number",
                label: "Height",
                defaultValue: 40,
                controlType: "number",
                validation: { min: 20, max: 200 },
            },
            {
                key: "width",
                type: "number",
                label: "Width",
                defaultValue: 100,
                controlType: "number",
                validation: { min: 50, max: 500 },
            },
        ],
    },

    {
        componentType: "gauge",
        displayName: "Gauge",
        icon: "Gauge",
        category: "Metrics",
        description: "Semi-circular gauge chart",
        properties: [
            ...commonProperties,
            {
                key: "value",
                type: "number",
                label: "Value",
                defaultValue: 0,
                controlType: "number",
                validation: { required: true },
            },
            {
                key: "max",
                type: "number",
                label: "Maximum Value",
                defaultValue: 100,
                controlType: "number",
                validation: { min: 1 },
            },
            {
                key: "label",
                type: "string",
                label: "Label",
                defaultValue: "",
                controlType: "input",
            },
            {
                key: "unit",
                type: "string",
                label: "Unit",
                description: "Unit suffix (%, pts, etc.)",
                defaultValue: "",
                controlType: "input",
                placeholder: "%",
            },
            {
                key: "thresholds",
                type: "array",
                label: "Thresholds",
                description: "Color thresholds [{max, color}]",
                defaultValue: [
                    { max: 33, color: "#ef4444" },
                    { max: 66, color: "#f59e0b" },
                    { max: 100, color: "#10b981" },
                ],
                controlType: "array-builder",
            },
        ],
    },

    {
        componentType: "metric-card",
        displayName: "Metric Card",
        icon: "Activity",
        category: "Metrics",
        description: "Big number display card",
        properties: [
            ...commonProperties,
            {
                key: "value",
                type: "string",
                label: "Value",
                defaultValue: "",
                controlType: "input",
                validation: { required: true },
            },
            {
                key: "label",
                type: "string",
                label: "Label",
                defaultValue: "",
                controlType: "input",
            },
            {
                key: "format",
                type: "enum",
                label: "Format",
                defaultValue: "number",
                controlType: "select",
                options: [
                    { value: "number", label: "Number" },
                    { value: "currency", label: "Currency" },
                    { value: "percentage", label: "Percentage" },
                ],
            },
        ],
    },

    // ========================================
    // DATA DISPLAY CATEGORY (4 components)
    // ========================================
    {
        componentType: "data-table",
        displayName: "Data Table",
        icon: "Table",
        category: "Tables",
        description: "Sortable, filterable data grid",
        properties: [
            ...commonProperties,
            {
                key: "data",
        hidden: true,
                type: "array",
                label: "Data",
                defaultValue: [],
                controlType: "array-builder",
                validation: { required: true },
            },
            {
                key: "columns",
                type: "array",
                label: "Columns",
                description: "Column definitions",
                defaultValue: [],
                controlType: "array-builder",
                validation: { required: true },
            },
            {
                key: "sortable",
                type: "boolean",
                label: "Enable Sorting",
                defaultValue: true,
                controlType: "toggle",
            },
            {
                key: "filterable",
                type: "boolean",
                label: "Enable Filtering",
                defaultValue: true,
                controlType: "toggle",
            },
            {
                key: "pagination",
                type: "boolean",
                label: "Enable Pagination",
                defaultValue: true,
                controlType: "toggle",
            },
            {
                key: "pageSize",
                type: "number",
                label: "Page Size",
                description: "Rows per page",
                defaultValue: 10,
                controlType: "select",
                options: [
                    { value: 10, label: "10" },
                    { value: 20, label: "20" },
                    { value: 30, label: "30" },
                    { value: 50, label: "50" },
                    { value: 100, label: "100" },
                ],
            },
            {
                key: "columnVisibility",
                type: "boolean",
                label: "Column Visibility Toggle",
                defaultValue: false,
                controlType: "toggle",
            },
            {
                key: "rowSelection",
                type: "boolean",
                label: "Row Selection",
                defaultValue: false,
                controlType: "toggle",
            },
            {
                key: "enableExport",
                type: "boolean",
                label: "Enable Export",
                defaultValue: false,
                controlType: "toggle",
            },
        ],
    },

    // ========================================
    // FILTERS CATEGORY (4 components)
    // ========================================
    {
        componentType: "slicer",
        displayName: "Slicer",
        icon: "SlidersHorizontal",
        category: "Filters",
        description: "Interactive data filter",
        properties: [
            ...commonProperties,
            {
                key: "options",
                type: "array",
                label: "Options",
                description: "Filter options [{value, label, count}]",
                defaultValue: [],
                controlType: "array-builder",
                validation: { required: true },
            },
            {
                key: "type",
                type: "enum",
                label: "Slicer Type",
                defaultValue: "checkbox",
                controlType: "select",
                options: [
                    { value: "checkbox", label: "Checkbox" },
                    { value: "dropdown", label: "Dropdown" },
                    { value: "button", label: "Button" },
                ],
            },
            {
                key: "multiSelect",
                type: "boolean",
                label: "Allow Multiple Selections",
                defaultValue: true,
                controlType: "toggle",
            },
        ],
    },

    // ========================================
    // INSIGHTS CATEGORY (4 components)
    // ========================================
    {
        componentType: "trend-label",
        displayName: "Trend Label",
        icon: "TrendingUp",
        category: "Insights",
        description: "Trend indicator badge",
        properties: [
            ...commonProperties,
            {
                key: "trend",
                type: "enum",
                label: "Trend Direction",
                defaultValue: "up",
                controlType: "select",
                validation: { required: true },
                options: [
                    { value: "up", label: "Up" },
                    { value: "down", label: "Down" },
                    { value: "stable", label: "Stable" },
                ],
            },
            {
                key: "label",
                type: "string",
                label: "Custom Label",
                description: "Override default trend label",
                defaultValue: "",
                controlType: "input",
            },
            {
                key: "showIcon",
                type: "boolean",
                label: "Show Icon",
                defaultValue: true,
                controlType: "toggle",
            },
            {
                key: "variant",
                type: "enum",
                label: "Visual Variant",
                defaultValue: "default",
                controlType: "select",
                options: [
                    { value: "default", label: "Default" },
                    { value: "outline", label: "Outline" },
                    { value: "secondary", label: "Secondary" },
                ],
            },
        ],
    },

    // Add more component schemas here for remaining 40+ components...
    // This file will be extended with the remaining components
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get component schema by type
 */
export function getComponentSchema(
    componentType: string,
): ComponentSchema | undefined {
    return componentSchemas.find((schema) => schema.componentType === componentType);
}

/**
 * Get all component schemas
 */
export function getAllComponentSchemas(): ComponentSchema[] {
    return componentSchemas;
}

/**
 * Get component schemas by category
 */
export function getComponentsByCategory(
    category: ComponentCategory,
): ComponentSchema[] {
    return componentSchemas.filter((schema) => schema.category === category);
}

/**
 * Get property definitions for a component
 */
export function getComponentProperties(
    componentType: string,
): PropertyDefinition[] {
    const schema = getComponentSchema(componentType);
    return schema?.properties || [];
}

/**
 * Get default props for a component
 */
export function getDefaultProps(
    componentType: string,
): Record<string, PropertyValue> {
    const properties = getComponentProperties(componentType);
    const defaults: Record<string, PropertyValue> = {};

    for (const prop of properties) {
        if (prop.defaultValue !== undefined) {
            defaults[prop.key] =
                typeof prop.defaultValue === "function"
                    ? prop.defaultValue()
                    : prop.defaultValue;
        }
    }

    return defaults;
}

/**
 * Validate component props against schema
 */
export function validateComponentProps(
    componentType: string,
    props: Record<string, unknown>,
): ValidationResult {
    const properties = getComponentProperties(componentType);
    const errors: ValidationError[] = [];

    for (const prop of properties) {
        const value = props[prop.key];
        const validation = prop.validation;

        if (!validation) continue;

        // Required validation
        if (validation.required && (value === undefined || value === null || value === "")) {
            errors.push({
                property: prop.key,
                message: `${prop.label} is required`,
                value,
            });
            continue;
        }

        // Skip further validation if value is empty and not required
        if (value === undefined || value === null) continue;

        // Type-specific validation
        if (typeof value === "number") {
            if (validation.min !== undefined && value < validation.min) {
                errors.push({
                    property: prop.key,
                    message: `${prop.label} must be at least ${validation.min}`,
                    value,
                });
            }
            if (validation.max !== undefined && value > validation.max) {
                errors.push({
                    property: prop.key,
                    message: `${prop.label} must be at most ${validation.max}`,
                    value,
                });
            }
        }

        if (typeof value === "string") {
            if (validation.minLength !== undefined && value.length < validation.minLength) {
                errors.push({
                    property: prop.key,
                    message: `${prop.label} must be at least ${validation.minLength} characters`,
                    value,
                });
            }
            if (validation.maxLength !== undefined && value.length > validation.maxLength) {
                errors.push({
                    property: prop.key,
                    message: `${prop.label} must be at most ${validation.maxLength} characters`,
                    value,
                });
            }
            if (validation.pattern) {
                const regex = new RegExp(validation.pattern);
                if (!regex.test(value)) {
                    errors.push({
                        property: prop.key,
                        message: `${prop.label} has invalid format`,
                        value,
                    });
                }
            }
        }

        if (Array.isArray(value)) {
            if (validation.minItems !== undefined && value.length < validation.minItems) {
                errors.push({
                    property: prop.key,
                    message: `${prop.label} must have at least ${validation.minItems} items`,
                    value,
                });
            }
            if (validation.maxItems !== undefined && value.length > validation.maxItems) {
                errors.push({
                    property: prop.key,
                    message: `${prop.label} must have at most ${validation.maxItems} items`,
                    value,
                });
            }
        }

        // Enum validation
        if (validation.enum && !validation.enum.includes(value as string | number)) {
            errors.push({
                property: prop.key,
                message: `${prop.label} must be one of: ${validation.enum.join(", ")}`,
                value,
            });
        }

        // Custom validation
        if (validation.custom) {
            const result = validation.custom(value);
            if (result !== true) {
                errors.push({
                    property: prop.key,
                    message: typeof result === "string" ? result : `${prop.label} validation failed`,
                    value,
                });
            }
        }
    }

    return {
        success: errors.length === 0,
        errors: errors.length > 0 ? errors : undefined,
        data: errors.length === 0 ? props : undefined,
    };
}

/**
 * Get all categories
 */
export function getAllCategories(): ComponentCategory[] {
    return Array.from(new Set(componentSchemas.map((schema) => schema.category)));
}
