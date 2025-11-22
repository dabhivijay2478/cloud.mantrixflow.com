import type { ComponentSchema } from "@/components/bi/schema-types";

export const multiRowCardSchema: ComponentSchema = {
  componentType: "multi-row-card",
  displayName: "Multi-Row Card",
  description: "Display multiple metrics in a row layout",
  category: "Metrics",
  icon: "LayoutList",
  properties: [
    {
      key: "title",
      type: "string",
      label: "Title",
      description: "Card title",
      defaultValue: "Multi-Row Card",
      controlType: "input",
      category: "General",
    },
  ],
};
