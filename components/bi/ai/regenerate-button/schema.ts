/**
 * RegenerateButton Schema
 * Property definitions for the RegenerateButton component
 */

import type { ComponentSchema } from "../../schema-types";

export const regenerateButtonSchema: ComponentSchema = {
        componentType: "regenerate-button",
        displayName: "Regenerate Button",
        icon: "RefreshCw",
        category: "AI",
        description: "Regenerate AI response button",
        properties: [
            {
                key: "label",
                type: "string",
                label: "Label",
                defaultValue: "Regenerate",
                controlType: "input",
            },
            {
                key: "variant",
                type: "enum",
                label: "Variant",
                defaultValue: "outline",
                controlType: "select",
                options: [
                    { value: "default", label: "Default" },
                    { value: "outline", label: "Outline" },
                    { value: "ghost", label: "Ghost" },
                ],
            },
            {
                key: "showIcon",
                type: "boolean",
                label: "Show Icon",
                defaultValue: true,
                controlType: "toggle",
            },
        ],
    };
