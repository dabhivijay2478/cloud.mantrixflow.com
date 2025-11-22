/**
 * Treemap Schema
 * Property definitions for the Treemap component
 */

import type { ComponentSchema } from "../../schema-types";

export const treemapSchema: ComponentSchema = {
        componentType: "treemap",
        displayName: "TreeMap",
        icon: "LayoutGrid",
        category: "Advanced",
        description: "Hierarchical data visualization with nested rectangles",
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
                key: "nameKey",
                type: "string",
                label: "Name Field",
                defaultValue: "name",
                controlType: "input",
            },
            {
                key: "valueKey",
                type: "string",
                label: "Value Field",
                defaultValue: "value",
                controlType: "input",
            },
            {
                key: "showLabels",
                type: "boolean",
                label: "Show Labels",
                defaultValue: true,
                controlType: "toggle",
            },
        ],
    };
