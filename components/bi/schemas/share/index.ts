/**
 * Share Component Schemas
 * Property definitions for sharing and export components
 */

import type { ComponentSchema } from "../types";

export const shareSchemas: ComponentSchema[] = [
    {
        componentType: "embed-code",
        displayName: "Embed Code",
        icon: "Code2",
        category: "Share",
        description: "Embeddable iframe code generator",
        properties: [
            {
                key: "title",
                type: "string",
                label: "Title",
                defaultValue: "Embed",
                controlType: "input",
            },
            {
                key: "width",
                type: "string",
                label: "Width",
                defaultValue: "100%",
                controlType: "input",
            },
            {
                key: "height",
                type: "string",
                label: "Height",
                defaultValue: "600px",
                controlType: "input",
            },
            {
                key: "showCode",
                type: "boolean",
                label: "Show Code",
                description: "Display embed code by default",
                defaultValue: false,
                controlType: "toggle",
            },
        ],
    },

    {
        componentType: "share-button",
        displayName: "Share Button",
        icon: "Share2",
        category: "Share",
        description: "Share dashboard button",
        properties: [
            {
                key: "label",
                type: "string",
                label: "Label",
                defaultValue: "Share",
                controlType: "input",
            },
            {
                key: "variant",
                type: "enum",
                label: "Variant",
                defaultValue: "default",
                controlType: "select",
                options: [
                    { value: "default", label: "Default" },
                    { value: "outline", label: "Outline" },
                    { value: "ghost", label: "Ghost" },
                ],
            },
            {
                key: "showIcon",
                type: "boolean",
                label: "Show Icon",
                defaultValue: true,
                controlType: "toggle",
            },
            {
                key: "platforms",
                type: "array",
                label: "Platforms",
                description: "Share platforms to include",
                defaultValue: ["link", "email"],
                controlType: "array-builder",
            },
        ],
    },

    {
        componentType: "qr-code",
        displayName: "QR Code",
        icon: "QrCode",
        category: "Share",
        description: "QR code for dashboard sharing",
        properties: [
            {
                key: "size",
                type: "number",
                label: "Size",
                description: "QR code size in pixels",
                defaultValue: 200,
                controlType: "number",
                validation: { min: 100, max: 500 },
            },
            {
                key: "includeLabel",
                type: "boolean",
                label: "Include Label",
                description: "Show label below QR code",
                defaultValue: true,
                controlType: "toggle",
            },
            {
                key: "downloadable",
                type: "boolean",
                label: "Downloadable",
                description: "Allow QR code download",
                defaultValue: true,
                controlType: "toggle",
            },
        ],
    },

    {
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
    },
];
