"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * PromptInput
 * @description Text prompt interface for AI dashboard generation.
 * Allows users to describe desired visualizations in natural language.
 * @param {PromptInputProps} props - Component properties
 * @param {string} [props.value] - Prompt text value
 * @param {(value: string) => void} [props.onChange] - Value change handler
 * @param {(prompt: string) => void | Promise<void>} [props.onSubmit] - Submit handler
 * @param {string} [props.placeholder] - Placeholder text
 * @param {boolean} [props.loading] - Loading/processing state
 * @param {boolean} [props.disabled] - Disabled state
 * @param {string[]} [props.suggestions] - Example prompt suggestions
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} PromptInput component
 * @example
 * <PromptInput
 *   placeholder="Describe the dashboard you want to create..."
 *   onSubmit={async (prompt) => {
 *     await generateDashboard(prompt);
 *   }}
 *   suggestions={[
 *     "Show me sales trends for the last 6 months",
 *     "Create a customer demographics breakdown"
 *   ]}
 * />
 */

export interface PromptInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (prompt: string) => void | Promise<void>;
  placeholder?: string;
  loading?: boolean;
  disabled?: boolean;
  suggestions?: string[];
  className?: string;
}

export function PromptInput({
  value: controlledValue,
  onChange,
  onSubmit,
  placeholder = "Describe the dashboard you want to create...",
  loading = false,
  disabled = false,
  suggestions = [],
  className,
}: PromptInputProps) {
  const [internalValue, setInternalValue] = React.useState("");
  const value = controlledValue !== undefined ? controlledValue : internalValue;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  };

  const handleSubmit = async () => {
    if (!value.trim() || loading) return;
    await onSubmit?.(value);
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (controlledValue === undefined) {
      setInternalValue(suggestion);
    }
    onChange?.(suggestion);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Card className={className}>
      <CardContent className="pt-6 space-y-4">
        <div className="relative">
          <Textarea
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || loading}
            className="min-h-[120px] pr-12 resize-none"
            aria-label="AI prompt input"
          />
          <Sparkles className="absolute top-3 right-3 h-5 w-5 text-muted-foreground" />
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="text-xs text-muted-foreground">
            {loading ? "Generating..." : "Press Cmd/Ctrl + Enter to submit"}
          </div>
          <Button
            onClick={handleSubmit}
            disabled={!value.trim() || loading || disabled}
            size="sm"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Generating..." : "Generate"}
          </Button>
        </div>

        {suggestions.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Try these examples:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuggestionClick(suggestion)}
                  disabled={loading || disabled}
                  className="text-xs h-auto py-1.5 px-3"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
