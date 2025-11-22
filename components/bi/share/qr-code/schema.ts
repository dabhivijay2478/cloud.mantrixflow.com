/**
 * QrCode Schema
 * Property definitions for the QrCode component
 */

import type { ComponentSchema } from "@/components/bi/schema-types";

export const qrCodeSchema: ComponentSchema = {
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
};
