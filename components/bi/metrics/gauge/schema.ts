/**
 * Gauge Schema
 * Property definitions for the Gauge component
 */

import type { ComponentSchema } from "@/components/bi/schema-types";

export const gaugeSchema: ComponentSchema = {
  componentType: "gauge",
  displayName: "Gauge",
  icon: "Gauge",
  category: "Metrics",
  description: "Semi-circular gauge chart",
  properties: [
    {
      key: "title",
      type: "string",
      label: "Title",
      defaultValue: "",
      controlType: "input",
    },
    {
      key: "value",
      type: "number",
      label: "Value",
      defaultValue: 0,
      controlType: "number",
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
  ],
};
