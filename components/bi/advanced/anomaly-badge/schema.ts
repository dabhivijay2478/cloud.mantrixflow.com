/**
 * AnomalyBadge Schema
 * Property definitions for the AnomalyBadge component
 */

import type { ComponentSchema } from "@/components/bi/schema-types";

export const anomalyBadgeSchema: ComponentSchema = {
        componentType: "anomaly-badge",
        displayName: "Anomaly Badge",
        icon: "AlertTriangle",
        category: "Advanced",
        description: "Highlight anomalies with severity indicator",
        properties: [
            {
                key: "label",
                type: "string",
                label: "Label",
                defaultValue: "Anomaly Detected",
                controlType: "input",
            },
            {
                key: "severity",
                type: "enum",
                label: "Severity",
                defaultValue: "medium",
                controlType: "select",
                options: [
                    { value: "low", label: "Low" },
                    { value: "medium", label: "Medium" },
                    { value: "high", label: "High" },
                ],
            },
        ],
    };
