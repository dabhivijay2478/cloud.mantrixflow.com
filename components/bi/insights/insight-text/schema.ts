/**
 * InsightText Schema
 * Property definitions for the InsightText component
 */

import type { ComponentSchema } from "@/components/bi/schema-types";

export const insightTextSchema: ComponentSchema = {
  componentType: "insight-text",
  displayName: "Insight Text",
  icon: "Lightbulb",
  category: "Insights",
  description: "AI-generated insight display",
  properties: [
    {
      key: "title",
      type: "string",
      label: "Title",
      defaultValue: "",
      controlType: "input",
    },
    {
      key: "content",
      type: "string",
      label: "Content",
      description: "Insight text content",
      defaultValue: "",
      controlType: "textarea",
      validation: { required: true },
    },
    {
      key: "type",
      type: "enum",
      label: "Insight Type",
      defaultValue: "info",
      controlType: "select",
      options: [
        { value: "info", label: "Information" },
        { value: "success", label: "Success" },
        { value: "warning", label: "Warning" },
        { value: "error", label: "Error" },
      ],
    },
    {
      key: "showIcon",
      type: "boolean",
      label: "Show Icon",
      defaultValue: true,
      controlType: "toggle",
    },
  ],
};
