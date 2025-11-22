/**
 * Component Schema Registry and Helper Functions
 * Central access point for all component schemas
 */

import { anomalyBadgeSchema } from "@/components/bi/advanced/anomaly-badge/schema";
import { bulletChartSchema } from "@/components/bi/advanced/bullet-chart/schema";
import { filledMapSchema } from "@/components/bi/advanced/filled-map/schema";
import { forecastLineSchema } from "@/components/bi/advanced/forecast-line/schema";
import { funnelChartSchema } from "@/components/bi/advanced/funnel-chart/schema";
// ============================================================================
//  ADVANCED SCHEMAS - Import from component folders
// ============================================================================
import { heatmapSchema } from "@/components/bi/advanced/heatmap/schema";
import { mapSchema } from "@/components/bi/advanced/map/schema";
import { matrixSchema } from "@/components/bi/advanced/matrix/schema";
import { sankeyDiagramSchema } from "@/components/bi/advanced/sankey-diagram/schema";
import { treemapSchema } from "@/components/bi/advanced/treemap/schema";
import { areachartSchema } from "@/components/bi/charts/area-chart/schema";
import { barchartSchema } from "@/components/bi/charts/bar-chart/schema";
import { clusteredbarchartSchema } from "@/components/bi/charts/clustered-bar-chart/schema";
import { clusteredcolumnchartSchema } from "@/components/bi/charts/clustered-column-chart/schema";
import { donutchartSchema } from "@/components/bi/charts/donut-chart/schema";
// ============================================================================
//  CHART SCHEMAS - Import from component folders
// ============================================================================
import { linechartSchema } from "@/components/bi/charts/line-chart/schema";
import { linestackedcolumnchartSchema } from "@/components/bi/charts/line-stacked-column-chart/schema";
import { piechartSchema } from "@/components/bi/charts/pie-chart/schema";
import { ribbonchartSchema } from "@/components/bi/charts/ribbon-chart/schema";
import { scatterchartSchema } from "@/components/bi/charts/scatter-chart/schema";
import { stackedareachartSchema } from "@/components/bi/charts/stacked-area-chart/schema";
import { stackedbarchartSchema } from "@/components/bi/charts/stacked-bar-chart/schema";
import { stackedcolumnchartSchema } from "@/components/bi/charts/stacked-column-chart/schema";
import { gaugeSchema } from "@/components/bi/metrics/gauge/schema";
// ============================================================================
//  METRIC SCHEMAS - Import from component folders
// ============================================================================
import { kpiCardSchema } from "@/components/bi/metrics/kpi-card/schema";
import { metricCardSchema } from "@/components/bi/metrics/metric-card/schema";
import { progressBarSchema } from "@/components/bi/metrics/progress-bar/schema";
import { sparklineSchema } from "@/components/bi/metrics/sparkline/schema";

// TODO: Add these when schema files are created:
// import { radarchartSchema } from "@/components/bi/advanced/radar-chart/schema";
// import { leafletmapSchema } from "@/components/bi/advanced/leaflet-map/schema";

import { editPromptSchema } from "@/components/bi/ai/edit-prompt/schema";
import { feedbackThumbsSchema } from "@/components/bi/ai/feedback-thumbs/schema";
import { paginatedReportSchema } from "@/components/bi/ai/paginated-report/schema";
// ============================================================================
//  AI SCHEMAS - Import from component folders
// ============================================================================
import { promptInputSchema } from "@/components/bi/ai/prompt-input/schema";
import { qaSchema } from "@/components/bi/ai/qa/schema";
import { regenerateButtonSchema } from "@/components/bi/ai/regenerate-button/schema";
// ============================================================================
//  DATA DISPLAY SCHEMAS - Import from component folders
// ============================================================================
import { dataTableSchema } from "@/components/bi/data-display/data-table/schema";
import { sqlEditorSchema } from "@/components/bi/data-display/sql-editor/schema";
import { sqlResultViewerSchema } from "@/components/bi/data-display/sql-result-viewer/schema";
import { tableNavigationSchema } from "@/components/bi/data-display/table-navigation/schema";
import { dateRangePickerSchema } from "@/components/bi/filters/date-range-picker/schema";
import { multiSelectSchema } from "@/components/bi/filters/multi-select/schema";
import { searchInputSchema } from "@/components/bi/filters/search-input/schema";
// ============================================================================
//  FILTER SCHEMAS - Import from component folders
// ============================================================================
import { slicerSchema } from "@/components/bi/filters/slicer/schema";
import { aiCommentarySchema } from "@/components/bi/insights/ai-commentary/schema";
import { insightTextSchema } from "@/components/bi/insights/insight-text/schema";
import { statChangeSchema } from "@/components/bi/insights/stat-change/schema";
// ============================================================================
//  INSIGHT SCHEMAS - Import from component folders
// ============================================================================
import { trendLabelSchema } from "@/components/bi/insights/trend-label/schema";
import type {
  ComponentCategory,
  ComponentSchema,
  PropertyDefinition,
  ValidationError,
  ValidationResult,
} from "@/components/bi/schema-types";
// ============================================================================
//  SHARE SCHEMAS - Import from component folders
// ============================================================================
import { embedCodeSchema } from "@/components/bi/share/embed-code/schema";
import { exportPdfSchema } from "@/components/bi/share/export-pdf/schema";
import { qrCodeSchema } from "@/components/bi/share/qr-code/schema";
import { shareButtonSchema } from "@/components/bi/share/share-button/schema";

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
  kpiCardSchema,
  progressBarSchema,
  sparklineSchema,
  metricCardSchema,
];

const advancedSchemas = [
  heatmapSchema,
  treemapSchema,
  funnelChartSchema,
  bulletChartSchema,
  sankeyDiagramSchema,
  matrixSchema,
  forecastLineSchema,
  anomalyBadgeSchema,
  mapSchema,
  filledMapSchema,
  gaugeSchema,
  // TODO: Add when schema files are created:
  // radarchartSchema,
  // leafletmapSchema,
];

const filterSchemas = [
  slicerSchema,
  dateRangePickerSchema,
  multiSelectSchema,
  searchInputSchema,
];

const insightSchemas = [
  trendLabelSchema,
  insightTextSchema,
  aiCommentarySchema,
  statChangeSchema,
];

const aiSchemas = [
  promptInputSchema,
  regenerateButtonSchema,
  feedbackThumbsSchema,
  editPromptSchema,
  qaSchema,
  paginatedReportSchema,
];

const shareSchemas = [
  embedCodeSchema,
  shareButtonSchema,
  qrCodeSchema,
  exportPdfSchema,
];

const tableSchemas = [
  dataTableSchema,
  sqlEditorSchema,
  sqlResultViewerSchema,
  tableNavigationSchema,
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
  ComponentCategory,
  ComponentSchema,
  ControlType,
  PropertyDefinition,
  PropertyType,
  ValidationError,
  ValidationResult,
} from "@/components/bi/schema-types";
