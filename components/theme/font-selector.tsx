/**
 * Font Selector Component
 * Component for selecting fonts with system font list, search, and infinite scroll
 */

"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useFonts } from "@/lib/hooks/use-fonts";

interface FontSelectorProps {
  label: string;
  value: string;
  onChange: (font: string) => void;
  description?: string;
  className?: string;
}

const ITEMS_PER_PAGE = 50;

export function FontSelector({
  label,
  value,
  onChange,
  description,
  className,
}: FontSelectorProps) {
  const { fonts, loading } = useFonts();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const fontType =
    label.toLowerCase().includes("sans") || label.toLowerCase().includes("body")
      ? "sans"
      : label.toLowerCase().includes("serif")
        ? "serif"
        : "mono";

  // Filter fonts based on type
  const filteredFonts = useMemo(() => {
    let filtered = fonts;

    // Filter by font type
    if (fontType === "mono") {
      // Filter monospace fonts - check the monospace property
      filtered = filtered.filter((font) => font.monospace === true);
    } else if (fontType === "serif") {
      // Filter serif fonts (heuristic: common serif font names)
      const serifKeywords = [
        "serif",
        "times",
        "georgia",
        "garamond",
        "baskerville",
        "caslon",
        "didot",
        "minion",
        "palatino",
        "bookman",
        "century",
        "courier",
      ];
      filtered = filtered.filter(
        (font) =>
          serifKeywords.some((keyword) =>
            font.name.toLowerCase().includes(keyword),
          ) || font.name.toLowerCase().includes("serif"),
      );
    } else {
      // Filter sans-serif (exclude serif and mono)
      const serifKeywords = [
        "serif",
        "times",
        "georgia",
        "garamond",
        "baskerville",
        "caslon",
        "didot",
        "minion",
        "palatino",
        "bookman",
        "century",
      ];
      filtered = filtered.filter(
        (font) =>
          font.monospace !== true &&
          !serifKeywords.some((keyword) =>
            font.name.toLowerCase().includes(keyword),
          ) &&
          !font.name.toLowerCase().includes("serif"),
      );
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (font) =>
          font.name.toLowerCase().includes(query) ||
          font.familyName.toLowerCase().includes(query) ||
          font.postScriptName.toLowerCase().includes(query),
      );
    }

    // Sort alphabetically and remove duplicates by name
    const uniqueFonts = Array.from(
      new Map(filtered.map((font) => [font.name.toLowerCase(), font])).values(),
    ).sort((a, b) => a.name.localeCompare(b.name));

    return uniqueFonts;
  }, [fonts, fontType, searchQuery]);

  // Reset visible count when search changes
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [searchQuery]);

  // Get visible fonts for rendering
  const visibleFonts = useMemo(
    () => filteredFonts.slice(0, visibleCount),
    [filteredFonts, visibleCount],
  );

  // Handle scroll for infinite loading
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      const scrollBottom =
        target.scrollHeight - target.scrollTop - target.clientHeight;

      // Load more when near bottom (within 100px)
      if (scrollBottom < 100 && visibleCount < filteredFonts.length) {
        setVisibleCount((prev) => Math.min(prev + ITEMS_PER_PAGE, filteredFonts.length));
      }
    },
    [visibleCount, filteredFonts.length],
  );

  // Get current font name from value
  const currentFontName = useMemo(() => {
    if (!value) return "";
    // Extract font name from value (e.g., "Poppins, sans-serif" -> "Poppins")
    const match = value.match(/^["']?([^,"']+)["']?/);
    return match ? match[1] : value.split(",")[0].trim();
  }, [value]);

  const handleFontSelect = useCallback(
    (fontName: string) => {
      const font = filteredFonts.find((f) => f.name === fontName);
      if (font) {
        const fontFamily = `"${font.name}", ${fontType === "mono" ? "monospace" : fontType === "serif" ? "serif" : "sans-serif"}`;
        onChange(fontFamily);
        setOpen(false);
        setSearchQuery("");
        setVisibleCount(ITEMS_PER_PAGE);
      }
    },
    [filteredFonts, fontType, onChange],
  );


  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        {description && (
          <span className="text-xs text-muted-foreground">{description}</span>
        )}
      </div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            <span className="truncate" style={{ fontFamily: value }}>
              {currentFontName || "Select font..."}
            </span>
            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command
            filter={(value, search) => {
              // Use our custom filtered fonts, so always return 1
              // The filtering is done in useMemo above
              return 1;
            }}
            shouldFilter={false}
          >
            <CommandInput
              placeholder="Search fonts..."
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList
              onScroll={handleScroll}
              className="max-h-[300px]"
            >
              {loading ? (
                <CommandEmpty>Loading fonts...</CommandEmpty>
              ) : filteredFonts.length === 0 ? (
                <CommandEmpty>
                  {searchQuery
                    ? `No fonts found matching "${searchQuery}"`
                    : "No fonts found."}
                </CommandEmpty>
              ) : (
                <CommandGroup>
                  {visibleFonts.map((font) => (
                    <CommandItem
                      key={`${font.postScriptName}-${font.name}`}
                      value={`${font.name} ${font.familyName} ${font.postScriptName}`}
                      onSelect={() => handleFontSelect(font.name)}
                      className="cursor-pointer"
                    >
                      <span
                        style={{ fontFamily: `"${font.name}"` }}
                        className="mr-2"
                      >
                        {font.name}
                      </span>
                      {font.monospace && (
                        <span className="ml-auto text-xs text-muted-foreground">
                          Mono
                        </span>
                      )}
                    </CommandItem>
                  ))}
                  {visibleCount < filteredFonts.length && (
                    <div className="px-2 py-1.5 text-xs text-center text-muted-foreground">
                      Showing {visibleCount} of {filteredFonts.length} fonts
                      {searchQuery && ` matching "${searchQuery}"`}...
                    </div>
                  )}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {value && (
        <p className="text-xs text-muted-foreground">
          Current: <span style={{ fontFamily: value }}>{value}</span>
        </p>
      )}
    </div>
  );
}
