/**
 * ShareButton Schema
 * Property definitions for the ShareButton component
 */

import type { ComponentSchema } from "@/components/bi/schema-types";

export const shareButtonSchema: ComponentSchema = {
        componentType: "share-button",
        displayName: "Share Button",
        icon: "Share2",
        category: "Share",
        description: "Share dashboard button",
        properties: [
            {
                key: "label",
                type: "string",
                label: "Label",
                defaultValue: "Share",
                controlType: "input",
            },
            {
                key: "variant",
                type: "enum",
                label: "Variant",
                defaultValue: "default",
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
            {
                key: "platforms",
                type: "array",
                label: "Platforms",
                description: "Share platforms to include",
                defaultValue: ["link", "email"],
                controlType: "array-builder",
            },
        ],
    };
