"use client";

import { Search, X } from "lucide-react";
import type * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * SearchInput
 * @description Search query input component with clear functionality.
 * Provides a text input with search icon and optional clear button.
 * @param {SearchInputProps} props - Component properties
 * @param {string} [props.value] - Input value
 * @param {(value: string) => void} [props.onChange] - Callback when value changes
 * @param {() => void} [props.onClear] - Callback when clear button is clicked
 * @param {string} [props.placeholder] - Placeholder text
 * @param {boolean} [props.disabled] - Disable the input
 * @param {boolean} [props.showClear] - Show clear button when there's value (default: true)
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} SearchInput component
 * @example
 * const [search, setSearch] = useState("");
 *
 * <SearchInput
 *   value={search}
 *   onChange={setSearch}
 *   placeholder="Search products..."
 * />
 */

export interface SearchInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  disabled?: boolean;
  showClear?: boolean;
  className?: string;
}

export function SearchInput({
  value = "",
  onChange,
  onClear,
  placeholder = "Search...",
  disabled = false,
  showClear = true,
  className,
}: SearchInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  };

  const handleClear = () => {
    onChange?.("");
    onClear?.();
  };

  return (
    <div className={cn("relative w-full", className)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className={cn("pl-9", showClear && value && "pr-9")}
      />
      {showClear && value && !disabled && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0 hover:bg-transparent"
          onClick={handleClear}
        >
          <X className="h-4 w-4 text-muted-foreground" />
          <span className="sr-only">Clear search</span>
        </Button>
      )}
    </div>
  );
}
