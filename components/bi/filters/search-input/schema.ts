/**
 * SearchInput Schema
 * Property definitions for the SearchInput component
 */

import type { ComponentSchema } from "@/components/bi/schema-types";

export const searchInputSchema: ComponentSchema = {
  componentType: "search-input",
  displayName: "Search Input",
  icon: "Search",
  category: "Filters",
  description: "Text search filter",
  properties: [
    {
      key: "placeholder",
      type: "string",
      label: "Placeholder",
      defaultValue: "Search...",
      controlType: "input",
    },
    {
      key: "field",
      type: "string",
      label: "Search Field",
      description: "Field to search in",
      defaultValue: "",
      controlType: "input",
    },
    {
      key: "debounceMs",
      type: "number",
      label: "Debounce (ms)",
      description: "Delay before search triggers",
      defaultValue: 300,
      controlType: "number",
      validation: { min: 0, max: 2000 },
    },
  ],
};
