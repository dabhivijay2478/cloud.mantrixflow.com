/**
 * ExportPdf Schema
 * Property definitions for the ExportPdf component
 */

import type { ComponentSchema } from "@/components/bi/schema-types";

export const exportPdfSchema: ComponentSchema = {
        componentType: "export-pdf",
        displayName: "Export PDF",
        icon: "FileDown",
        category: "Share",
        description: "Export dashboard to PDF",
        properties: [
            {
                key: "label",
                type: "string",
                label: "Button Label",
                defaultValue: "Export PDF",
                controlType: "input",
            },
            {
                key: "includeFilters",
                type: "boolean",
                label: "Include Filters",
                description: "Include current filter state",
                defaultValue: true,
                controlType: "toggle",
            },
            {
                key: "orientation",
                type: "enum",
                label: "Orientation",
                defaultValue: "landscape",
                controlType: "select",
                options: [
                    { value: "portrait", label: "Portrait" },
                    { value: "landscape", label: "Landscape" },
                ],
            },
        ],
    };
