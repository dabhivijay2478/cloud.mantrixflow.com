/**
 * PromptInput Schema
 * Property definitions for the PromptInput component
 */

import type { ComponentSchema } from "@/components/bi/schema-types";

export const promptInputSchema: ComponentSchema = {
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
};
