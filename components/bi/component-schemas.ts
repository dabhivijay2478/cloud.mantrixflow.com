/**
 * Component Schema Registry and Helper Functions
 * Central access point for all component schemas
 */

// ============================================================================
//  CHART SCHEMAS - Import from component folders
// ============================================================================
import { linechartSchema } from "./charts/line-chart/schema";
import { barchartSchema } from "./charts/bar-chart/schema";
import { areachartSchema } from "./charts/area-chart/schema";
import { piechartSchema } from "./charts/pie-chart/schema";
import { donutchartSchema } from "./charts/donut-chart/schema";
import { scatterchartSchema } from "./charts/scatter-chart/schema";
import { stackedbarchartSchema } from "./charts/stacked-bar-chart/schema";
import { stackedcolumnchartSchema } from "./charts/stacked-column-chart/schema";
import { stackedareachartSchema } from "./charts/stacked-area-chart/schema";
import { clusteredbarchartSchema } from "./charts/clustered-bar-chart/schema";
import { clusteredcolumnchartSchema } from "./charts/clustered-column-chart/schema";
import { linestackedcolumnchartSchema } from "./charts/line-stacked-column-chart/schema";
import { ribbonchartSchema } from "./charts/ribbon-chart/schema";

// ============================================================================
//  METRIC SCHEMAS - Import from component folders
// ============================================================================
import { kpicardSchema } from "./metrics/kpi-card/schema";
import { progressbarSchema } from "./metrics/progress-bar/schema";
import { sparklineSchema } from "./metrics/sparkline/schema";
import { metriccardSchema } from "./metrics/metric-card/schema";

// ============================================================================
//  ADVANCED SCHEMAS - Import from component folders
// ============================================================================
import { heatmapSchema } from "./advanced/heatmap/schema";
import { treemapSchema } from "./advanced/treemap/schema";
import { funnelchartSchema } from "./advanced/funnel-chart/schema";
import { bulletchartSchema } from "./advanced/bullet-chart/schema";
import { sankeydiagramSchema } from "./advanced/sankey-diagram/schema";
import { matrixSchema } from "./advanced/matrix/schema";
import { forecastlineSchema } from "./advanced/forecast-line/schema";
import { anomalybadgeSchema } from "./advanced/anomaly-badge/schema";
import { mapSchema } from "./advanced/map/schema";
import { filledmapSchema } from "./advanced/filled-map/schema";
import { gaugeSchema } from "./metrics/gauge/schema";
import { radarchartSchema } from "./advanced/radar-chart/schema";
import { leafletmapSchema } from "./advanced/leaflet-map/schema";

// ============================================================================
//  FILTER SCHEMAS - Import from component folders
// ============================================================================
import { slicerSchema } from "./filters/slicer/schema";
import { daterangepickerSchema } from "./filters/date-range-picker/schema";
import { multiselectSchema } from "./filters/multi-select/schema";
import { searchinputSchema } from "./filters/search-input/schema";

// ============================================================================
//  INSIGHT SCHEMAS - Import from component folders
// ============================================================================
import { trendlabelSchema } from "./insights/trend-label/schema";
import { insighttextSchema } from "./insights/insight-text/schema";
import { aicommentarySchema } from "./insights/ai-commentary/schema";
import { statchangeSchema } from "./insights/stat-change/schema";

// ============================================================================
//  AI SCHEMAS - Import from component folders
// ============================================================================
import { promptinputSchema } from "./ai/prompt-input/schema";
import { regeneratebuttonSchema } from "./ai/regenerate-button/schema";
import { feedbackthumbsSchema } from "./ai/feedback-thumbs/schema";
import { editpromptSchema } from "./ai/edit-prompt/schema";
import { qaSchema } from "./ai/qa/schema";
import { paginatedreportSchema } from "./ai/paginated-report/schema";

// ============================================================================
//  SHARE SCHEMAS - Import from component folders
// ============================================================================
import { embedcodeSchema } from "./share/embed-code/schema";
import { sharebuttonSchema } from "./share/share-button/schema";
import { qrcodeSchema } from "./share/qr-code/schema";
import { exportpdfSchema } from "./share/export-pdf/schema";

// ============================================================================
//  DATA DISPLAY SCHEMAS - Import from component folders
// ============================================================================
import { datatableSchema } from "./data-display/data-table/schema";
import { sqleditorSchema } from "./data-display/sql-editor/schema";
import { sqlresultviewerSchema } from "./data-display/sql-result-viewer/schema";
import { tablenavigationSchema } from "./data-display/table-navigation/schema";

import type {
    ComponentSchema,
    PropertyDefinition,
    ValidationResult,
    ValidationError,
    ComponentCategory,
} from "./schema-types";

// ============================================================================
//  COLLECT ALL SCHEMAS BY CATEGORY
// ============================================================================

const chartSchemas = [
    linechartSchema,
    barchartSchema,
    areachartSchema,
    piechartSchema,
    donutchartSchema,
    scatterchartSchema,
    stackedbarchartSchema,
    stackedcolumnchartSchema,
    stackedareachartSchema,
    clusteredbarchartSchema,
    clusteredcolumnchartSchema,
    linestackedcolumnchartSchema,
    ribbonchartSchema,
];

const metricSchemas = [
    kpicardSchema,
    progressbarSchema,
    sparklineSchema,
    metriccardSchema,
];

const advancedSchemas = [
    heatmapSchema,
    treemapSchema,
    funnelchartSchema,
    bulletchartSchema,
    sankeydiagramSchema,
    matrixSchema,
    forecastlineSchema,
    anomalybadgeSchema,
    mapSchema,
    filledmapSchema,
    gaugeSchema,
    radarchartSchema,
    leafletmapSchema,
];

const filterSchemas = [
    slicerSchema,
    daterangepickerSchema,
    multiselectSchema,
    searchinputSchema,
];

const insightSchemas = [
    trendlabelSchema,
    insighttextSchema,
    aicommentarySchema,
    statchangeSchema,
];

const aiSchemas = [
    promptinputSchema,
    regeneratebuttonSchema,
    feedbackthumbsSchema,
    editpromptSchema,
    qaSchema,
    paginatedreportSchema,
];

const shareSchemas = [
    embedcodeSchema,
    sharebuttonSchema,
    qrcodeSchema,
    exportpdfSchema,
];

const tableSchemas = [
    datatableSchema,
    sqleditorSchema,
    sqlresultviewerSchema,
    tablenavigationSchema,
];

// Combine all schemas
export const allComponentSchemas: ComponentSchema[] = [
    ...chartSchemas,
    ...metricSchemas,
    ...advancedSchemas,
    ...filterSchemas,
    ...insightSchemas,
    ...aiSchemas,
    ...shareSchemas,
    ...tableSchemas,
];

/**
 * Common properties shared across all components
 * These can be added to any component schema
 */
export function getCommonProperties(): PropertyDefinition[] {
    return [
        // Layout Properties
        {
            key: "width",
            type: "string",
            label: "Width",
            description: "Component width (e.g., 100%, 400px, auto)",
            defaultValue: "100%",
            controlType: "input",
            category: "Layout",
        },
        {
            key: "height",
            type: "string",
            label: "Height",
            description: "Component height (e.g., 400px, auto)",
            defaultValue: "auto",
            controlType: "input",
            category: "Layout",
        },
        {
            key: "padding",
            type: "string",
            label: "Padding",
            description: "Internal spacing (e.g., 16px, 1rem)",
            defaultValue: "16px",
            controlType: "input",
            category: "Layout",
        },
        {
            key: "margin",
            type: "string",
            label: "Margin",
            description: "External spacing (e.g., 8px, 0.5rem)",
            defaultValue: "0",
            controlType: "input",
            category: "Layout",
        },

        // Styling Properties
        {
            key: "backgroundColor",
            type: "color",
            label: "Background Color",
            description: "Component background color",
            defaultValue: "transparent",
            controlType: "color-picker",
            category: "Styling",
        },
        {
            key: "borderRadius",
            type: "string",
            label: "Border Radius",
            description: "Corner rounding (e.g., 8px, 0.5rem)",
            defaultValue: "8px",
            controlType: "input",
            category: "Styling",
        },
        {
            key: "shadow",
            type: "enum",
            label: "Shadow",
            description: "Drop shadow effect",
            defaultValue: "none",
            controlType: "select",
            category: "Styling",
            options: [
                { value: "none", label: "None" },
                { value: "sm", label: "Small" },
                { value: "md", label: "Medium" },
                { value: "lg", label: "Large" },
                { value: "xl", label: "Extra Large" },
            ],
        },

        // Metadata Properties
        {
            key: "className",
            type: "string",
            label: "CSS Class",
            description: "Additional CSS classes",
            defaultValue: "",
            controlType: "input",
            category: "Advanced",
        },
        {
            key: "visible",
            type: "boolean",
            label: "Visible",
            description: "Show/hide component",
            defaultValue: true,
            controlType: "toggle",
            category: "Advanced",
        },
    ];
}

/**
 * Get all component properties including common ones
 */
export function getComponentPropertiesWithCommon(
    componentType: string,
): PropertyDefinition[] {
    const schema = getComponentSchema(componentType);
    if (!schema) return [];

    return [...schema.properties, ...getCommonProperties()];
}

/**
 * Get component schema by type
 */
export function getComponentSchema(
    componentType: string,
): ComponentSchema | undefined {
    return allComponentSchemas.find(
        (schema) => schema.componentType === componentType,
    );
}

/**
 * Get all component schemas
 */
export function getAllComponentSchemas(): ComponentSchema[] {
    return allComponentSchemas;
}

/**
 * Get component schemas by category
 */
export function getComponentsByCategory(
    category: ComponentCategory,
): ComponentSchema[] {
    return allComponentSchemas.filter((schema) => schema.category === category);
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
): Record<string, unknown> {
    const properties = getComponentProperties(componentType);
    const defaults: Record<string, unknown> = {};

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
        if (
            validation.required &&
            (value === undefined || value === null || value === "")
        ) {
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
            if (
                validation.minLength !== undefined &&
                value.length < validation.minLength
            ) {
                errors.push({
                    property: prop.key,
                    message: `${prop.label} must be at least ${validation.minLength} characters`,
                    value,
                });
            }
            if (
                validation.maxLength !== undefined &&
                value.length > validation.maxLength
            ) {
                errors.push({
                    property: prop.key,
                    message: `${prop.label} must be at most ${validation.maxLength} characters`,
                    value,
                });
            }
        }

        if (Array.isArray(value)) {
            if (
                validation.minItems !== undefined &&
                value.length < validation.minItems
            ) {
                errors.push({
                    property: prop.key,
                    message: `${prop.label} must have at least ${validation.minItems} items`,
                    value,
                });
            }
            if (
                validation.maxItems !== undefined &&
                value.length > validation.maxItems
            ) {
                errors.push({
                    property: prop.key,
                    message: `${prop.label} must have at most ${validation.maxItems} items`,
                    value,
                });
            }
        }

        // Enum validation
        if (
            validation.enum &&
            !validation.enum.includes(value as string | number)
        ) {
            errors.push({
                property: prop.key,
                message: `${prop.label} must be one of: ${validation.enum.join(", ")}`,
                value,
            });
        }
    }

    return {
        success: errors.length === 0,
        errors: errors.length > 0 ? errors : undefined,
        data: errors.length === 0 ? props : undefined,
    };
}

/**
 * Get all available categories
 */
export function getAllCategories(): ComponentCategory[] {
    return Array.from(
        new Set(allComponentSchemas.map((schema) => schema.category)),
    );
}

// Re-export types
export type {
    ComponentSchema,
    PropertyDefinition,
    ValidationResult,
    ValidationError,
    ComponentCategory,
    PropertyType,
    ControlType,
} from "./schema-types";
