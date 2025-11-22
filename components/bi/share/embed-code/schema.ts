/**
 * EmbedCode Schema
 * Property definitions for the EmbedCode component
 */

import type { ComponentSchema } from "@/components/bi/schema-types";

export const embedCodeSchema: ComponentSchema = {
        componentType: "embed-code",
        displayName: "Embed Code",
        icon: "Code2",
        category: "Share",
        description: "Embeddable iframe code generator",
        properties: [
            {
                key: "title",
                type: "string",
                label: "Title",
                defaultValue: "Embed",
                controlType: "input",
            },
            {
                key: "width",
                type: "string",
                label: "Width",
                defaultValue: "100%",
                controlType: "input",
            },
            {
                key: "height",
                type: "string",
                label: "Height",
                defaultValue: "600px",
                controlType: "input",
            },
            {
                key: "showCode",
                type: "boolean",
                label: "Show Code",
                description: "Display embed code by default",
                defaultValue: false,
                controlType: "toggle",
            },
        ],
    };
