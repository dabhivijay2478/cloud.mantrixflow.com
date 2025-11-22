/**
 * SqlResultViewer Schema
 * Property definitions for the SqlResultViewer component
 */

import type { ComponentSchema } from "../../schema-types";

export const sqlResultViewerSchema: ComponentSchema = {
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
    };
