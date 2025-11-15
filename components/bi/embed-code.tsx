"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * EmbedCode
 * @description Copyable iframe embed code generator.
 * Provides embeddable code snippet for sharing dashboards.
 * @param {EmbedCodeProps} props - Component properties
 * @param {string} props.url - URL to embed
 * @param {number} [props.width] - Embed width (default: 800)
 * @param {number} [props.height] - Embed height (default: 600)
 * @param {string} [props.title] - Component title
 * @param {string} [props.description] - Component description
 * @param {boolean} [props.showPreview] - Show preview of embed (default: false)
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} EmbedCode component
 * @example
 * <EmbedCode
 *   url="https://example.com/dashboard/123"
 *   width={1200}
 *   height={800}
 *   title="Embed Dashboard"
 * />
 */

export interface EmbedCodeProps {
  url: string;
  width?: number;
  height?: number;
  title?: string;
  description?: string;
  showPreview?: boolean;
  className?: string;
}

export function EmbedCode({
  url,
  width = 800,
  height = 600,
  title,
  description,
  showPreview = false,
  className,
}: EmbedCodeProps) {
  const [copied, setCopied] = useState(false);

  const embedCode = `<iframe src="${url}" width="${width}" height="${height}" frameborder="0" allowfullscreen></iframe>`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

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
      <CardContent className="space-y-4">
        <div className="relative">
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
            <code>{embedCode}</code>
          </pre>
          <Button
            size="sm"
            variant="ghost"
            className="absolute top-2 right-2"
            onClick={handleCopy}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </>
            )}
          </Button>
        </div>

        {showPreview && (
          <div className="border rounded-lg overflow-hidden">
            <iframe
              src={url}
              width="100%"
              height={height}
              className="w-full"
              title="Embed Preview"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
