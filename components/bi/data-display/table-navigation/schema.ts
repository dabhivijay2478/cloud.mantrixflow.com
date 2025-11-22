/**
 * TableNavigation Schema
 * Property definitions for the TableNavigation component
 */

import type { ComponentSchema } from "@/components/bi/schema-types";

export const tableNavigationSchema: ComponentSchema = {
        componentType: "table-navigation",
        displayName: "Table Navigation",
        icon: "Navigation",
        category: "Tables",
        description: "Table pagination controls",
        properties: [
            {
                key: "pageSize",
                type: "number",
                label: "Page Size",
                defaultValue: 10,
                controlType: "number",
                validation: { min: 5, max: 100 },
            },
            {
                key: "showPageSizeSelector",
                type: "boolean",
                label: "Show Page Size Selector",
                defaultValue: true,
                controlType: "toggle",
            },
            {
                key: "showPageNumbers",
                type: "boolean",
                label: "Show Page Numbers",
                defaultValue: true,
                controlType: "toggle",
            },
        ],
    };
