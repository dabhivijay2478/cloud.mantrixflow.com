/**
 * PaginatedReport Schema
 * Property definitions for the PaginatedReport component
 */

import type { ComponentSchema } from "@/components/bi/schema-types";

export const paginatedReportSchema: ComponentSchema = {
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
    };
