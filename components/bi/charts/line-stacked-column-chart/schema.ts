/**
 * Line Stacked Column Chart Schema
 * Property definitions for the Line Stacked Column Chart component
 */

import type { ComponentSchema } from "@/components/bi/schema-types";

export const linestackedcolumnchartSchema: ComponentSchema = {
  componentType: "line-stacked-column-chart",
  displayName: "Line & Stacked Column",
  icon: "TrendingUp",
  category: "Charts",
  description: "Combo chart with line and stacked columns",
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
      label: "Column Fields",
      description: "Fields for stacked columns",
      defaultValue: [],
      controlType: "array-builder",
    },
    {
      key: "lineKeys",
      type: "array",
      label: "Line Fields",
      description: "Fields for line series",
      defaultValue: [],
      controlType: "array-builder",
    },
  ],
};
