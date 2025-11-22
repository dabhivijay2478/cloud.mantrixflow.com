/**
 * Filter Component Schemas
 * Property definitions for all filter/slicer components
 */

import type { ComponentSchema } from "../types";

export const filterSchemas: ComponentSchema[] = [
    {
        componentType: "slicer",
        displayName: "Slicer",
        icon: "Filter",
        category: "Filters",
        description: "Multi-select filter for data slicing",
        properties: [
            {
                key: "title",
                type: "string",
                label: "Title",
                defaultValue: "",
                controlType: "input",
            },
            {
                key: "field",
                type: "string",
                label: "Filter Field",
                description: "Field to filter on",
                defaultValue: "",
                controlType: "input",
                validation: { required: true },
            },
            {
                key: "type",
                type: "enum",
                label: "Filter Type",
                defaultValue: "checkbox",
                controlType: "select",
                options: [
                    { value: "checkbox", label: "Checkbox List" },
                    { value: "dropdown", label: "Dropdown" },
                    { value: "button", label: "Button Group" },
                ],
            },
            {
                key: "multiSelect",
                type: "boolean",
                label: "Multi-Select",
                description: "Allow multiple selections",
                defaultValue: true,
                controlType: "toggle",
            },
        ],
    },

    {
        componentType: "date-range-picker",
        displayName: "Date Range Picker",
        icon: "Calendar",
        category: "Filters",
        description: "Date range selection filter",
        properties: [
            {
                key: "title",
                type: "string",
                label: "Title",
                defaultValue: "",
                controlType: "input",
            },
            {
                key: "field",
                type: "string",
                label: "Date Field",
                description: "Date field to filter",
                defaultValue: "",
                controlType: "input",
                validation: { required: true },
            },
            {
                key: "defaultRange",
                type: "enum",
                label: "Default Range",
                defaultValue: "last7days",
                controlType: "select",
                options: [
                    { value: "today", label: "Today" },
                    { value: "yesterday", label: "Yesterday" },
                    { value: "last7days", label: "Last 7 Days" },
                    { value: "last30days", label: "Last 30 Days" },
                    { value: "thisMonth", label: "This Month" },
                    { value: "lastMonth", label: "Last Month" },
                    { value: "custom", label: "Custom" },
                ],
            },
        ],
    },

    {
        componentType: "multi-select",
        displayName: "Multi-Select",
        icon: "ListFilter",
        category: "Filters",
        description: "Multi-select dropdown filter",
        properties: [
            {
                key: "title",
                type: "string",
                label: "Title",
                defaultValue: "",
                controlType: "input",
            },
            {
                key: "field",
                type: "string",
                label: "Filter Field",
                defaultValue: "",
                controlType: "input",
                validation: { required: true },
            },
            {
                key: "placeholder",
                type: "string",
                label: "Placeholder",
                defaultValue: "Select options...",
                controlType: "input",
            },
            {
                key: "searchable",
                type: "boolean",
                label: "Searchable",
                description: "Enable search within options",
                defaultValue: true,
                controlType: "toggle",
            },
        ],
    },

    {
        componentType: "search-input",
        displayName: "Search Input",
        icon: "Search",
        category: "Filters",
        description: "Text search filter",
        properties: [
            {
                key: "placeholder",
                type: "string",
                label: "Placeholder",
                defaultValue: "Search...",
                controlType: "input",
            },
            {
                key: "field",
                type: "string",
                label: "Search Field",
                description: "Field to search in",
                defaultValue: "",
                controlType: "input",
            },
            {
                key: "debounceMs",
                type: "number",
                label: "Debounce (ms)",
                description: "Delay before search triggers",
                defaultValue: 300,
                controlType: "number",
                validation: { min: 0, max: 2000 },
            },
        ],
    },
];
