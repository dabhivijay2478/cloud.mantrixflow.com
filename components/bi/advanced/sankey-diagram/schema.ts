/**
 * SankeyDiagram Schema
 * Property definitions for the SankeyDiagram component
 */

import type { ComponentSchema } from "../../schema-types";

export const sankeyDiagramSchema: ComponentSchema = {
        componentType: "sankey-diagram",
        displayName: "Sankey Diagram",
        icon: "GitBranch",
        category: "Advanced",
        description: "Flow diagram showing quantity distribution",
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
                key: "showValues",
                type: "boolean",
                label: "Show Flow Values",
                defaultValue: true,
                controlType: "toggle",
            },
        ],
    };
