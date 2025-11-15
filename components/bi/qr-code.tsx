"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * QRCode
 * @description Scan-to-view QR code generator for dashboards.
 * Generates a QR code for easy mobile access to dashboard URLs.
 * Note: This is a basic implementation. For production, use a QR code library like 'qrcode.react'
 * @param {QRCodeProps} props - Component properties
 * @param {string} props.url - URL to encode in QR code
 * @param {number} [props.size] - QR code size in pixels (default: 200)
 * @param {string} [props.title] - Component title
 * @param {string} [props.description] - Component description
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} QRCode component
 * @example
 * <QRCode
 *   url="https://example.com/dashboard/123"
 *   size={250}
 *   title="Scan to View"
 *   description="Use your mobile device to scan"
 * />
 */

export interface QRCodeProps {
  url: string;
  size?: number;
  title?: string;
  description?: string;
  className?: string;
}

export function QRCode({
  url,
  size = 200,
  title,
  description,
  className,
}: QRCodeProps) {
  // Using Google Charts API for QR code generation (simple but requires internet)
  // For production, consider using a client-side library like 'qrcode.react'
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}`;

  return (
    <Card className={className}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </CardHeader>
      )}
      <CardContent className="flex flex-col items-center justify-center">
        <div
          className={cn(
            "bg-white p-4 rounded-lg border-2 border-border",
            "flex items-center justify-center",
          )}
        >
          <img
            src={qrCodeUrl}
            alt="QR Code"
            width={size}
            height={size}
            className="max-w-full h-auto"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-4 text-center max-w-xs">
          Scan with your mobile device to view this dashboard
        </p>
      </CardContent>
    </Card>
  );
}
