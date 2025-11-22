/**
 * MultiSelect Schema
 * Property definitions for the MultiSelect component
 */

import type { ComponentSchema } from "../../schema-types";

export const multiSelectSchema: ComponentSchema = {
        componentType: "multi-select",
        displayName: "Multi-Select",
        icon: "ListFilter",
        category: "Filters",
        description: "Multi-select dropdown filter",
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
                defaultValue: "",
                controlType: "input",
                validation: { required: true },
            },
            {
                key: "placeholder",
                type: "string",
                label: "Placeholder",
                defaultValue: "Select options...",
                controlType: "input",
            },
            {
                key: "searchable",
                type: "boolean",
                label: "Searchable",
                description: "Enable search within options",
                defaultValue: true,
                controlType: "toggle",
            },
        ],
    };
