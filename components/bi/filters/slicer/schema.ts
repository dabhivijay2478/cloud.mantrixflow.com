/**
 * Slicer Schema
 * Property definitions for the Slicer component
 */

import type { ComponentSchema } from "@/components/bi/schema-types";

export const slicerSchema: ComponentSchema = {
  componentType: "slicer",
  displayName: "Slicer",
  icon: "Filter",
  category: "Filters",
  description: "Multi-select filter for data slicing",
  properties: [
    {
      key: "title",
      type: "string",
      label: "Title",
      defaultValue: "",
      controlType: "input",
    },
    {
      key: "field",
      type: "string",
      label: "Filter Field",
      description: "Field to filter on",
      defaultValue: "",
      controlType: "input",
      validation: { required: true },
    },
    {
      key: "type",
      type: "enum",
      label: "Filter Type",
      defaultValue: "checkbox",
      controlType: "select",
      options: [
        { value: "checkbox", label: "Checkbox List" },
        { value: "dropdown", label: "Dropdown" },
        { value: "button", label: "Button Group" },
      ],
    },
    {
      key: "multiSelect",
      type: "boolean",
      label: "Multi-Select",
      description: "Allow multiple selections",
      defaultValue: true,
      controlType: "toggle",
    },
  ],
};
