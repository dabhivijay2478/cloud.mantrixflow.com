/**
 * SqlEditor Schema
 * Property definitions for the SqlEditor component
 */

import type { ComponentSchema } from "../../schema-types";

export const sqlEditorSchema: ComponentSchema = {
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
    };
