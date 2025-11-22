/**
 * AiCommentary Schema
 * Property definitions for the AiCommentary component
 */

import type { ComponentSchema } from "@/components/bi/schema-types";

export const aiCommentarySchema: ComponentSchema = {
        componentType: "ai-commentary",
        displayName: "AI Commentary",
        icon: "MessageSquare",
        category: "Insights",
        description: "AI-generated data commentary",
        properties: [
            {
                key: "title",
                type: "string",
                label: "Title",
                defaultValue: "AI Insights",
                controlType: "input",
            },
            {
                key: "content",
                type: "string",
                label: "Commentary",
                defaultValue: "",
                controlType: "textarea",
                validation: { required: true },
            },
            {
                key: "showTimestamp",
                type: "boolean",
                label: "Show Timestamp",
                defaultValue: true,
                controlType: "toggle",
            },
        ],
    };
