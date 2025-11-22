/**
 * Map Schema
 * Property definitions for the Map component
 */

import type { ComponentSchema } from "@/components/bi/schema-types";

export const mapSchema: ComponentSchema = {
        componentType: "map",
        displayName: "Map",
        icon: "Map",
        category: "Maps",
        description: "Basic map with markers",
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
                key: "zoom",
                type: "number",
                label: "Zoom Level",
                defaultValue: 10,
                controlType: "number",
                validation: { min: 1, max: 20 },
            },
        ],
    };
