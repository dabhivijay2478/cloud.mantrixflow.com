/**
 * ProgressBar Schema
 * Property definitions for the ProgressBar component
 */

import type { ComponentSchema } from "@/components/bi/schema-types";

export const progressBarSchema: ComponentSchema = {
  componentType: "progress-bar",
  displayName: "Progress Bar",
  icon: "Activity",
  category: "Metrics",
  description: "Progress toward a goal",
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
      description: "Current progress value",
      defaultValue: 0,
      controlType: "number",
      validation: { required: true, min: 0 },
    },
    {
      key: "max",
      type: "number",
      label: "Maximum Value",
      description: "Target/max value",
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
      key: "showValue",
      type: "boolean",
      label: "Show Value",
      defaultValue: true,
      controlType: "toggle",
    },
    {
      key: "showPercentage",
      type: "boolean",
      label: "Show Percentage",
      defaultValue: true,
      controlType: "toggle",
    },
    {
      key: "variant",
      type: "enum",
      label: "Color Variant",
      defaultValue: "default",
      controlType: "select",
      options: [
        { value: "default", label: "Default" },
        { value: "success", label: "Success" },
        { value: "warning", label: "Warning" },
        { value: "danger", label: "Danger" },
      ],
    },
  ],
};
