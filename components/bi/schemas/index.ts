/**
 * Component Schema Registry and Helper Functions
 * Central access point for all component schemas
 */

import { chartSchemas } from "./charts";
import { metricSchemas } from "./metrics";
import { filterSchemas } from "./filters";
import { insightSchemas } from "./insights";
import { tableSchemas } from "./tables";
import { aiSchemas } from "./ai";
import { shareSchemas } from "./share";
import { advancedSchemas } from "./advanced";
import { mapSchemas } from "./maps";
import type {
    ComponentSchema,
    PropertyDefinition,
    ValidationResult,
    ValidationError,
    ComponentCategory,
} from "./types";

// Combine all schemas
export const allComponentSchemas: ComponentSchema[] = [
    ...chartSchemas,
    ...metricSchemas,
    ...filterSchemas,
    ...insightSchemas,
    ...tableSchemas,
    ...aiSchemas,
    ...shareSchemas,
    ...advancedSchemas,
    ...mapSchemas,
    // Add more categories as they're implemented
];

/**
 * Common properties shared across all components
 * These can be added to any component schema
 */
export function getCommonProperties(): PropertyDefinition[] {
    return [
        // Layout Properties
        {
            key: "width",
            type: "string",
            label: "Width",
            description: "Component width (e.g., 100%, 400px, auto)",
            defaultValue: "100%",
            controlType: "input",
            category: "Layout",
        },
        {
            key: "height",
            type: "string",
            label: "Height",
            description: "Component height (e.g., 400px, auto)",
            defaultValue: "auto",
            controlType: "input",
            category: "Layout",
        },
        {
            key: "padding",
            type: "string",
            label: "Padding",
            description: "Internal spacing (e.g., 16px, 1rem)",
            defaultValue: "16px",
            controlType: "input",
            category: "Layout",
        },
        {
            key: "margin",
            type: "string",
            label: "Margin",
            description: "External spacing (e.g., 8px, 0.5rem)",
            defaultValue: "0",
            controlType: "input",
            category: "Layout",
        },

        // Styling Properties
        {
            key: "backgroundColor",
            type: "color",
            label: "Background Color",
            description: "Component background color",
            defaultValue: "transparent",
            controlType: "color-picker",
            category: "Styling",
        },
        {
            key: "borderRadius",
            type: "string",
            label: "Border Radius",
            description: "Corner rounding (e.g., 8px, 0.5rem)",
            defaultValue: "8px",
            controlType: "input",
            category: "Styling",
        },
        {
            key: "shadow",
            type: "enum",
            label: "Shadow",
            description: "Drop shadow effect",
            defaultValue: "none",
            controlType: "select",
            category: "Styling",
            options: [
                { value: "none", label: "None" },
                { value: "sm", label: "Small" },
                { value: "md", label: "Medium" },
                { value: "lg", label: "Large" },
                { value: "xl", label: "Extra Large" },
            ],
        },

        // Metadata Properties
        {
            key: "className",
            type: "string",
            label: "CSS Class",
            description: "Additional CSS classes",
            defaultValue: "",
            controlType: "input",
            category: "Advanced",
        },
        {
            key: "visible",
            type: "boolean",
            label: "Visible",
            description: "Show/hide component",
            defaultValue: true,
            controlType: "toggle",
            category: "Advanced",
        },
    ];
}

/**
 * Get all component properties including common ones
 */
export function getComponentPropertiesWithCommon(
    componentType: string,
): PropertyDefinition[] {
    const schema = getComponentSchema(componentType);
    if (!schema) return [];

    return [...schema.properties, ...getCommonProperties()];
}

/**
 * Get component schema by type
 */
export function getComponentSchema(
    componentType: string,
): ComponentSchema | undefined {
    return allComponentSchemas.find(
        (schema) => schema.componentType === componentType,
    );
}

/**
 * Get all component schemas
 */
export function getAllComponentSchemas(): ComponentSchema[] {
    return allComponentSchemas;
}

/**
 * Get component schemas by category
 */
export function getComponentsByCategory(
    category: ComponentCategory,
): ComponentSchema[] {
    return allComponentSchemas.filter((schema) => schema.category === category);
}

/**
 * Get property definitions for a component
 */
export function getComponentProperties(
    componentType: string,
): PropertyDefinition[] {
    const schema = getComponentSchema(componentType);
    return schema?.properties || [];
}

/**
 * Get default props for a component
 */
export function getDefaultProps(
    componentType: string,
): Record<string, unknown> {
    const properties = getComponentProperties(componentType);
    const defaults: Record<string, unknown> = {};

    for (const prop of properties) {
        if (prop.defaultValue !== undefined) {
            defaults[prop.key] =
                typeof prop.defaultValue === "function"
                    ? prop.defaultValue()
                    : prop.defaultValue;
        }
    }

    return defaults;
}

/**
 * Validate component props against schema
 */
export function validateComponentProps(
    componentType: string,
    props: Record<string, unknown>,
): ValidationResult {
    const properties = getComponentProperties(componentType);
    const errors: ValidationError[] = [];

    for (const prop of properties) {
        const value = props[prop.key];
        const validation = prop.validation;

        if (!validation) continue;

        // Required validation
        if (
            validation.required &&
            (value === undefined || value === null || value === "")
        ) {
            errors.push({
                property: prop.key,
                message: `${prop.label} is required`,
                value,
            });
            continue;
        }

        // Skip further validation if value is empty and not required
        if (value === undefined || value === null) continue;

        // Type-specific validation
        if (typeof value === "number") {
            if (validation.min !== undefined && value < validation.min) {
                errors.push({
                    property: prop.key,
                    message: `${prop.label} must be at least ${validation.min}`,
                    value,
                });
            }
            if (validation.max !== undefined && value > validation.max) {
                errors.push({
                    property: prop.key,
                    message: `${prop.label} must be at most ${validation.max}`,
                    value,
                });
            }
        }

        if (typeof value === "string") {
            if (
                validation.minLength !== undefined &&
                value.length < validation.minLength
            ) {
                errors.push({
                    property: prop.key,
                    message: `${prop.label} must be at least ${validation.minLength} characters`,
                    value,
                });
            }
            if (
                validation.maxLength !== undefined &&
                value.length > validation.maxLength
            ) {
                errors.push({
                    property: prop.key,
                    message: `${prop.label} must be at most ${validation.maxLength} characters`,
                    value,
                });
            }
        }

        if (Array.isArray(value)) {
            if (
                validation.minItems !== undefined &&
                value.length < validation.minItems
            ) {
                errors.push({
                    property: prop.key,
                    message: `${prop.label} must have at least ${validation.minItems} items`,
                    value,
                });
            }
            if (
                validation.maxItems !== undefined &&
                value.length > validation.maxItems
            ) {
                errors.push({
                    property: prop.key,
                    message: `${prop.label} must have at most ${validation.maxItems} items`,
                    value,
                });
            }
        }

        // Enum validation
        if (
            validation.enum &&
            !validation.enum.includes(value as string | number)
        ) {
            errors.push({
                property: prop.key,
                message: `${prop.label} must be one of: ${validation.enum.join(", ")}`,
                value,
            });
        }
    }

    return {
        success: errors.length === 0,
        errors: errors.length > 0 ? errors : undefined,
        data: errors.length === 0 ? props : undefined,
    };
}

/**
 * Get all available categories
 */
export function getAllCategories(): ComponentCategory[] {
    return Array.from(
        new Set(allComponentSchemas.map((schema) => schema.category)),
    );
}

// Re-export types
export type {
    ComponentSchema,
    PropertyDefinition,
    ValidationResult,
    ValidationError,
    ComponentCategory,
    PropertyType,
    ControlType,
} from "./types";
