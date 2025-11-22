/**
 * DataTable Schema
 * Property definitions for the DataTable component
 */

import type { ComponentSchema } from "@/components/bi/schema-types";

export const dataTableSchema: ComponentSchema = {
  componentType: "data-table",
  displayName: "Data Table",
  icon: "Table",
  category: "Tables",
  description: "Interactive data table with sorting and filtering",
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
      key: "sortable",
      type: "boolean",
      label: "Sortable",
      description: "Enable column sorting",
      defaultValue: true,
      controlType: "toggle",
    },
    {
      key: "filterable",
      type: "boolean",
      label: "Filterable",
      description: "Enable filtering",
      defaultValue: true,
      controlType: "toggle",
    },
    {
      key: "pagination",
      type: "boolean",
      label: "Pagination",
      description: "Enable pagination",
      defaultValue: true,
      controlType: "toggle",
    },
    {
      key: "pageSize",
      type: "number",
      label: "Page Size",
      description: "Rows per page",
      defaultValue: 10,
      controlType: "number",
      validation: { min: 5, max: 100 },
    },
    {
      key: "rowSelection",
      type: "boolean",
      label: "Row Selection",
      description: "Enable row selection",
      defaultValue: false,
      controlType: "toggle",
    },
    {
      key: "enableExport",
      type: "boolean",
      label: "Enable Export",
      description: "Allow data export",
      defaultValue: true,
      controlType: "toggle",
    },
  ],
};
