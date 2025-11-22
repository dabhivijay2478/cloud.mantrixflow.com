/**
 * FeedbackThumbs Schema
 * Property definitions for the FeedbackThumbs component
 */

import type { ComponentSchema } from "@/components/bi/schema-types";

export const feedbackThumbsSchema: ComponentSchema = {
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
    };
