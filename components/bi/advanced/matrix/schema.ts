/**
 * Matrix Schema
 * Property definitions for the Matrix component
 */

import type { ComponentSchema } from "../../schema-types";

export const matrixSchema: ComponentSchema = {
        componentType: "matrix",
        displayName: "Matrix",
        icon: "Table",
        category: "Advanced",
        description: "Grid-based data matrix",
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
                key: "rowKey",
                type: "string",
                label: "Row Field",
                defaultValue: "row",
                controlType: "input",
            },
            {
                key: "colKey",
                type: "string",
                label: "Column Field",
                defaultValue: "col",
                controlType: "input",
            },
            {
                key: "valueKey",
                type: "string",
                label: "Value Field",
                defaultValue: "value",
                controlType: "input",
            },
        ],
    };
