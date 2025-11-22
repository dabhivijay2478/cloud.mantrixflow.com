/**
 * Table/Data Display Component Schemas
 * Property definitions for table and SQL components
 */

import type { ComponentSchema } from "../types";

export const tableSchemas: ComponentSchema[] = [
    {
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
    },

    {
        componentType: "sql-editor",
        displayName: "SQL Editor",
        icon: "Code",
        category: "Tables",
        description: "SQL query editor",
        properties: [
            {
                key: "title",
                type: "string",
                label: "Title",
                defaultValue: "SQL Editor",
                controlType: "input",
            },
            {
                key: "defaultQuery",
                type: "string",
                label: "Default Query",
                description: "Pre-populated SQL query",
                defaultValue: "",
                controlType: "textarea",
                placeholder: "SELECT * FROM table",
            },
            {
                key: "readOnly",
                type: "boolean",
                label: "Read Only",
                description: "Disable editing",
                defaultValue: false,
                controlType: "toggle",
            },
            {
                key: "showLineNumbers",
                type: "boolean",
                label: "Show Line Numbers",
                defaultValue: true,
                controlType: "toggle",
            },
        ],
    },

    {
        componentType: "sql-result-viewer",
        displayName: "SQL Result Viewer",
        icon: "TableProperties",
        category: "Tables",
        description: "Display SQL query results",
        properties: [
            {
                key: "title",
                type: "string",
                label: "Title",
                defaultValue: "Query Results",
                controlType: "input",
            },
            {
                key: "maxRows",
                type: "number",
                label: "Max Rows",
                description: "Maximum rows to display",
                defaultValue: 100,
                controlType: "number",
                validation: { min: 10, max: 1000 },
            },
            {
                key: "showStats",
                type: "boolean",
                label: "Show Statistics",
                description: "Display row count and query time",
                defaultValue: true,
                controlType: "toggle",
            },
        ],
    },

    {
        componentType: "table-navigation",
        displayName: "Table Navigation",
        icon: "Navigation",
        category: "Tables",
        description: "Table pagination controls",
        properties: [
            {
                key: "pageSize",
                type: "number",
                label: "Page Size",
                defaultValue: 10,
                controlType: "number",
                validation: { min: 5, max: 100 },
            },
            {
                key: "showPageSizeSelector",
                type: "boolean",
                label: "Show Page Size Selector",
                defaultValue: true,
                controlType: "toggle",
            },
            {
                key: "showPageNumbers",
                type: "boolean",
                label: "Show Page Numbers",
                defaultValue: true,
                controlType: "toggle",
            },
        ],
    },
];
