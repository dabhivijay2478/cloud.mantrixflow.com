/**
 * Font Selector Component
 * Component for selecting and customizing fonts
 */

"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface FontSelectorProps {
  label: string;
  value: string;
  onChange: (font: string) => void;
  description?: string;
  className?: string;
}

const presetFonts = {
  sans: [
    { label: "Poppins", value: "Poppins, sans-serif" },
    { label: "Inter", value: "Inter, sans-serif" },
    { label: "Roboto", value: "Roboto, sans-serif" },
    { label: "Open Sans", value: '"Open Sans", sans-serif' },
    { label: "Lato", value: "Lato, sans-serif" },
    { label: "Montserrat", value: "Montserrat, sans-serif" },
    { label: "Raleway", value: "Raleway, sans-serif" },
    { label: "Nunito", value: "Nunito, sans-serif" },
    { label: "System", value: "system-ui, -apple-system, sans-serif" },
  ],
  serif: [
    { label: "Georgia", value: "Georgia, serif" },
    { label: "Times New Roman", value: '"Times New Roman", serif' },
    { label: "Merriweather", value: "Merriweather, serif" },
    { label: "Playfair Display", value: '"Playfair Display", serif' },
    { label: "Lora", value: "Lora, serif" },
    { label: "System", value: "system-ui, serif" },
  ],
  mono: [
    { label: "JetBrains Mono", value: '"JetBrains Mono", monospace' },
    { label: "Fira Code", value: '"Fira Code", monospace' },
    { label: "Source Code Pro", value: '"Source Code Pro", monospace' },
    { label: "Courier New", value: '"Courier New", monospace' },
    { label: "Monaco", value: "Monaco, monospace" },
    { label: "System", value: "monospace" },
  ],
};

export function FontSelector({
  label,
  value,
  onChange,
  description,
  className,
}: FontSelectorProps) {
  const [isCustom, setIsCustom] = useState(
    !Object.values(presetFonts)
      .flat()
      .some((font) => font.value === value),
  );
  const [customFont, setCustomFont] = useState(
    isCustom ? value : "Poppins, sans-serif",
  );

  const fontType =
    label.toLowerCase().includes("sans") || label.toLowerCase().includes("body")
      ? "sans"
      : label.toLowerCase().includes("serif")
        ? "serif"
        : "mono";

  const fonts = presetFonts[fontType];

  const handlePresetChange = (newValue: string) => {
    onChange(newValue);
    setIsCustom(false);
  };

  const handleCustomChange = (newValue: string) => {
    setCustomFont(newValue);
    onChange(newValue);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("font/")) {
      // Handle font file upload
      // This would typically involve creating a @font-face rule
      const fontName = file.name.replace(/\.[^/.]+$/, "");
      const fontFamily = `"${fontName}", ${fontType === "mono" ? "monospace" : fontType === "serif" ? "serif" : "sans-serif"}`;
      handleCustomChange(fontFamily);
      setIsCustom(true);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        {description && (
          <span className="text-xs text-muted-foreground">{description}</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Select
          value={isCustom ? "custom" : value}
          onValueChange={(val) => {
            if (val === "custom") {
              setIsCustom(true);
            } else {
              handlePresetChange(val);
            }
          }}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Select font" />
          </SelectTrigger>
          <SelectContent>
            {fonts.map((font) => (
              <SelectItem key={font.value} value={font.value}>
                <span style={{ fontFamily: font.value }}>{font.label}</span>
              </SelectItem>
            ))}
            <SelectItem value="custom">Custom Font</SelectItem>
          </SelectContent>
        </Select>
        {isCustom && (
          <>
            <Input
              type="text"
              value={customFont}
              onChange={(e) => handleCustomChange(e.target.value)}
              placeholder="Font name, sans-serif"
              className="flex-1"
            />
            <div className="relative">
              <Input
                type="file"
                accept=".woff,.woff2,.ttf,.otf"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="pointer-events-none"
              >
                <Upload className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </div>
      {isCustom && (
        <p className="text-xs text-muted-foreground">
          Enter font family name (e.g., "Custom Font, sans-serif")
        </p>
      )}
    </div>
  );
}

