/**
 * DateRangePicker Schema
 * Property definitions for the DateRangePicker component
 */

import type { ComponentSchema } from "@/components/bi/schema-types";

export const dateRangePickerSchema: ComponentSchema = {
  componentType: "date-range-picker",
  displayName: "Date Range Picker",
  icon: "Calendar",
  category: "Filters",
  description: "Date range selection filter",
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
      label: "Date Field",
      description: "Date field to filter",
      defaultValue: "",
      controlType: "input",
      validation: { required: true },
    },
    {
      key: "defaultRange",
      type: "enum",
      label: "Default Range",
      defaultValue: "last7days",
      controlType: "select",
      options: [
        { value: "today", label: "Today" },
        { value: "yesterday", label: "Yesterday" },
        { value: "last7days", label: "Last 7 Days" },
        { value: "last30days", label: "Last 30 Days" },
        { value: "thisMonth", label: "This Month" },
        { value: "lastMonth", label: "Last Month" },
        { value: "custom", label: "Custom" },
      ],
    },
  ],
};
