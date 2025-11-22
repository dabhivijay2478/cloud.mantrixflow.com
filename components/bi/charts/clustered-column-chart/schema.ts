/**
 * Clustered Column Chart Schema
 * Property definitions for the Clustered Column Chart component
 */

import type { ComponentSchema } from "@/components/bi/schema-types";

export const clusteredcolumnchartSchema: ComponentSchema = {
  componentType: "clustered-column-chart",
  displayName: "Clustered Column Chart",
  icon: "BarChart3",
  category: "Charts",
  description: "Grouped columns for comparison",
  properties: [
    {
      key: "title",
      type: "string",
      label: "Title",
      defaultValue: "",
      controlType: "input",
    },
    {
      key: "data",
      hidden: true,
      type: "array",
      label: "Data",
      defaultValue: [],
      controlType: "array-builder",
    },
    {
      key: "xKey",
      type: "string",
      label: "X-Axis Field",
      defaultValue: "",
      controlType: "input",
    },
    {
      key: "yKeys",
      type: "array",
      label: "Y-Axis Fields",
      defaultValue: [],
      controlType: "array-builder",
    },
    {
      key: "showGrid",
      type: "boolean",
      label: "Show Grid",
      defaultValue: true,
      controlType: "toggle",
    },
  ],
};
