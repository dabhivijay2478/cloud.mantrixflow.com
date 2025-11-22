/**
 * Stacked Area Chart Schema
 * Property definitions for the Stacked Area Chart component
 */

import type { ComponentSchema } from "@/components/bi/schema-types";

export const stackedareachartSchema: ComponentSchema = {
  componentType: "stacked-area-chart",
  displayName: "Stacked Area Chart",
  icon: "AreaChart",
  category: "Charts",
  description: "Stacked area visualization",
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
      key: "showLegend",
      type: "boolean",
      label: "Show Legend",
      defaultValue: true,
      controlType: "toggle",
    },
  ],
};
