/**
 * AI Component Schemas
 * Property definitions for AI-powered components
 */

import type { ComponentSchema } from "../types";

export const aiSchemas: ComponentSchema[] = [
    {
        componentType: "prompt-input",
        displayName: "Prompt Input",
        icon: "MessageSquare",
        category: "AI",
        description: "AI prompt input field",
        properties: [
            {
                key: "placeholder",
                type: "string",
                label: "Placeholder",
                defaultValue: "Ask me anything about your data...",
                controlType: "input",
            },
            {
                key: "showSuggestions",
                type: "boolean",
                label: "Show Suggestions",
                description: "Display suggested prompts",
                defaultValue: true,
                controlType: "toggle",
            },
            {
                key: "maxLength",
                type: "number",
                label: "Max Length",
                description: "Maximum character limit",
                defaultValue: 500,
                controlType: "number",
                validation: { min: 100, max: 2000 },
            },
        ],
    },

    {
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
    },

    {
        componentType: "feedback-thumbs",
        displayName: "Feedback Thumbs",
        icon: "ThumbsUp",
        category: "AI",
        description: "Thumbs up/down feedback",
        properties: [
            {
                key: "showLabels",
                type: "boolean",
                label: "Show Labels",
                description: "Display 'Helpful' and 'Not Helpful' labels",
                defaultValue: false,
                controlType: "toggle",
            },
            {
                key: "collectComments",
                type: "boolean",
                label: "Collect Comments",
                description: "Show comment box after feedback",
                defaultValue: true,
                controlType: "toggle",
            },
        ],
    },

    {
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
    },

    {
        componentType: "qa",
        displayName: "Q&A",
        icon: "HelpCircle",
        category: "AI",
        description: "Question and answer display",
        properties: [
            {
                key: "title",
                type: "string",
                label: "Title",
                defaultValue: "Q&A",
                controlType: "input",
            },
            {
                key: "showTimestamp",
                type: "boolean",
                label: "Show Timestamp",
                defaultValue: true,
                controlType: "toggle",
            },
            {
                key: "collapsible",
                type: "boolean",
                label: "Collapsible",
                description: "Allow collapse/expand",
                defaultValue: false,
                controlType: "toggle",
            },
        ],
    },

    {
        componentType: "paginated-report",
        displayName: "Paginated Report",
        icon: "FileText",
        category: "AI",
        description: "Multi-page AI report",
        properties: [
            {
                key: "title",
                type: "string",
                label: "Title",
                defaultValue: "",
                controlType: "input",
            },
            {
                key: "showNavigation",
                type: "boolean",
                label: "Show Navigation",
                description: "Display page navigation",
                defaultValue: true,
                controlType: "toggle",
            },
            {
                key: "showProgress",
                type: "boolean",
                label: "Show Progress",
                description: "Display progress indicator",
                defaultValue: true,
                controlType: "toggle",
            },
        ],
    },
];
