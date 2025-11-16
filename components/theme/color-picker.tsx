/**
 * Color Picker Component
 * Custom color picker for theme customization
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { isValidHexColor } from "@/lib/utils/theme";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  description?: string;
  className?: string;
}

export function ColorPicker({
  label,
  value,
  onChange,
  description,
  className,
}: ColorPickerProps) {
  const [inputValue, setInputValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);

  const handleColorChange = (newColor: string) => {
    if (isValidHexColor(newColor)) {
      setInputValue(newColor);
      onChange(newColor);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    if (isValidHexColor(newValue)) {
      onChange(newValue);
    }
  };

  // Preset colors for quick selection
  const presetColors = [
    "#00a859", // Green
    "#007fff", // Blue
    "#8a2be2", // Purple
    "#ef4444", // Red
    "#f59e0b", // Orange
    "#22c55e", // Success Green
    "#06b6d4", // Cyan
    "#ec4899", // Pink
    "#6366f1", // Indigo
    "#f97316", // Orange
    "#84cc16", // Lime
    "#14b8a6", // Teal
  ];

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <Label htmlFor={`color-${label}`} className="text-sm font-medium">
          {label}
        </Label>
        {description && (
          <span className="text-xs text-muted-foreground">{description}</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="h-10 w-20 p-1"
              style={{ backgroundColor: value }}
            >
              <div
                className="h-full w-full rounded border-2 border-background"
                style={{ backgroundColor: value }}
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64" align="start">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Color Value</Label>
                <Input
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  placeholder="#000000"
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label>Preset Colors</Label>
                <div className="grid grid-cols-6 gap-2">
                  {presetColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => {
                        handleColorChange(color);
                        setIsOpen(false);
                      }}
                      className={cn(
                        "h-8 w-8 rounded border-2 transition-all hover:scale-110",
                        value === color
                          ? "border-primary ring-2 ring-ring"
                          : "border-border",
                      )}
                      style={{ backgroundColor: color }}
                      aria-label={`Select color ${color}`}
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Custom Color</Label>
                <Input
                  type="color"
                  value={value}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="h-10 w-full cursor-pointer"
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
        <Input
          id={`color-${label}`}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="#000000"
          className="flex-1 font-mono"
        />
      </div>
    </div>
  );
}

