import type { ComponentSchema } from "@/components/bi/schema-types";

export const waterfallChartSchema: ComponentSchema = {
  componentType: "waterfall-chart",
  displayName: "Waterfall Chart",
  description:
    "Show cumulative effect of sequential positive and negative values",
  category: "Charts",
  icon: "BarChart",
  properties: [
    {
      key: "title",
      type: "string",
      label: "Title",
      description: "Chart title",
      defaultValue: "Waterfall Chart",
      controlType: "input",
      category: "General",
    },
  ],
};
