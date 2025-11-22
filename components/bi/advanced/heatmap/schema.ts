/**
 * Heatmap Schema
 * Property definitions for the Heatmap component
 */

import type { ComponentSchema } from "@/components/bi/schema-types";

export const heatmapSchema: ComponentSchema = {
  componentType: "heatmap",
  displayName: "Heatmap",
  icon: "Grid3x3",
  category: "Advanced",
  description: "Display data density with color intensity",
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
      key: "xKey",
      type: "string",
      label: "X-Axis Field",
      defaultValue: "x",
      controlType: "input",
    },
    {
      key: "yKey",
      type: "string",
      label: "Y-Axis Field",
      defaultValue: "y",
      controlType: "input",
    },
    {
      key: "valueKey",
      type: "string",
      label: "Value Field",
      description: "Field for heat intensity",
      defaultValue: "value",
      controlType: "input",
    },
    {
      key: "colorScale",
      type: "enum",
      label: "Color Scale",
      defaultValue: "blues",
      controlType: "select",
      options: [
        { value: "blues", label: "Blues" },
        { value: "greens", label: "Greens" },
        { value: "reds", label: "Reds" },
        { value: "oranges", label: "Oranges" },
        { value: "purples", label: "Purples" },
      ],
    },
  ],
};
