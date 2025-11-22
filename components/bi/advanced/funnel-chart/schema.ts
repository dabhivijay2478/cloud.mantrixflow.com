/**
 * FunnelChart Schema
 * Property definitions for the FunnelChart component
 */

import type { ComponentSchema } from "@/components/bi/schema-types";

export const funnelChartSchema: ComponentSchema = {
  componentType: "funnel-chart",
  displayName: "Funnel Chart",
  icon: "Filter",
  category: "Advanced",
  description: "Visualize stages in a process with decreasing values",
  properties: [
    {
      key: "title",
      type: "string",
      label: "Title",
      defaultValue: "",
      controlType: "input",
    },
    {
      key: "description",
      type: "string",
      label: "Description",
      defaultValue: "",
      controlType: "textarea",
    },
    {
      key: "nameKey",
      type: "string",
      label: "Stage Name Field",
      defaultValue: "name",
      controlType: "input",
    },
    {
      key: "valueKey",
      type: "string",
      label: "Value Field",
      defaultValue: "value",
      controlType: "input",
    },
    {
      key: "showPercentages",
      type: "boolean",
      label: "Show Percentages",
      defaultValue: true,
      controlType: "toggle",
    },
  ],
};
