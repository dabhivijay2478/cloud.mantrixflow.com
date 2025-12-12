/**
 * Stacked Column Chart Schema
 * Property definitions for the Stacked Column Chart component
 */

import type { ComponentSchema } from "@/components/bi/schema-types";

export const stackedcolumnchartSchema: ComponentSchema = {
  componentType: "stacked-column-chart",
  displayName: "Stacked Column Chart",
  icon: "BarChart2",
  category: "Charts",
  description: "Stacked vertical columns",
  properties: [
    {
      key: "title",
      type: "string",
      label: "Title",
      defaultValue: "",
      controlType: "input",
      placeholder: "Chart title",
      category: "General",
    },
    {
      key: "description",
      type: "string",
      label: "Description",
      defaultValue: "",
      controlType: "textarea",
      placeholder: "Chart description",
      category: "General",
    },
    {
      key: "data",
      hidden: true,
      type: "array",
      label: "Data",
      defaultValue: [],
      controlType: "array-builder",
      category: "Data",
    },
    {
      key: "xKey",
      type: "string",
      label: "X-Axis Field",
      description: "Field name for X-axis values (string or date columns)",
      defaultValue: "",
      controlType: "input",
      placeholder: "Select X-axis column",
      category: "Data",
      isDataField: true,
      dataFieldType: "x-axis",
      allowedColumnTypes: ["string", "date"],
      validation: { required: true },
    },
    {
      key: "yKeys",
      type: "array",
      label: "Y-Axis Fields",
      description: "Field names for Y-axis values (numeric columns)",
      defaultValue: [],
      controlType: "array-builder",
      validation: { minItems: 1, required: true },
      category: "Data",
      isDataField: true,
      dataFieldType: "y-axis",
      allowedColumnTypes: ["number"],
    },
    {
      key: "showGrid",
      type: "boolean",
      label: "Show Grid",
      description: "Display grid lines",
      defaultValue: true,
      controlType: "toggle",
      category: "Appearance",
    },
    {
      key: "showLegend",
      type: "boolean",
      label: "Show Legend",
      description: "Display chart legend",
      defaultValue: true,
      controlType: "toggle",
      category: "Appearance",
    },
  ],
};
