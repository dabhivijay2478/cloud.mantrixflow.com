/**
 * EditPrompt Schema
 * Property definitions for the EditPrompt component
 */

import type { ComponentSchema } from "@/components/bi/schema-types";

export const editPromptSchema: ComponentSchema = {
        componentType: "edit-prompt",
        displayName: "Edit Prompt",
        icon: "Edit",
        category: "AI",
        description: "Edit and refine prompt button",
        properties: [
            {
                key: "label",
                type: "string",
                label: "Label",
                defaultValue: "Edit",
                controlType: "input",
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
