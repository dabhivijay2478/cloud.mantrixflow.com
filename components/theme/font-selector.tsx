/**
 * Font Selector Component
 * Component for selecting Google Fonts with search and infinite scroll
 */

"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChevronDown, Check, Loader2, X } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFontSearch } from "@/lib/hooks/use-font-search";
import type { FilterFontCategory, FontInfo } from "@/lib/types/fonts";
import {
  buildFontFamily,
  getDefaultWeights,
  loadGoogleFont,
  waitForFont,
} from "@/lib/utils/google-fonts";

interface FontSelectorProps {
  label: string;
  value: string;
  onChange: (font: string) => void;
  description?: string;
  className?: string;
}

export function FontSelector({
  label,
  value,
  onChange,
  description,
  className,
}: FontSelectorProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<FilterFontCategory>("all");
  const [loadingFont, setLoadingFont] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const selectedFontRef = useRef<HTMLDivElement>(null);
  const hasScrolledToSelectedFont = useRef(false);

  // Determine category from label
  const defaultCategory: FilterFontCategory = useMemo(() => {
    if (label.toLowerCase().includes("sans") || label.toLowerCase().includes("body")) {
      return "sans-serif";
    }
    if (label.toLowerCase().includes("serif")) {
      return "serif";
    }
    if (label.toLowerCase().includes("mono")) {
      return "monospace";
    }
    return "all";
  }, [label]);

  // Initialize category
  useEffect(() => {
    if (defaultCategory !== "all") {
      setSelectedCategory(defaultCategory);
    }
  }, [defaultCategory]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(inputValue);
    }, 300);
    return () => clearTimeout(timer);
  }, [inputValue]);

  const fontQuery = useFontSearch({
    query: searchQuery,
    category: selectedCategory,
    limit: 20,
    enabled: open,
  });

  // Reset scroll position when category or search changes
  useEffect(() => {
    if (!open) return;
    scrollRef.current?.scrollTo({ top: 0 });
    hasScrolledToSelectedFont.current = false;
  }, [selectedCategory, searchQuery, open]);

  // Scroll to selected font on open
  useEffect(() => {
    if (open && fontQuery.data && !hasScrolledToSelectedFont.current) {
      requestAnimationFrame(() => {
        selectedFontRef.current?.scrollIntoView({
          block: "center",
          inline: "nearest",
        });
      });
      hasScrolledToSelectedFont.current = true;
    } else if (!open) {
      hasScrolledToSelectedFont.current = false;
    }
  }, [open, fontQuery.data]);

  // Flatten all pages into a single array
  const allFonts = useMemo(() => {
    if (!fontQuery.data) return [];
    return fontQuery.data.pages.flatMap((page) => page.fonts);
  }, [fontQuery.data]);

  // Intersection Observer for infinite scroll
  const loadMoreRefCallback = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node) return;

      const observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry.isIntersecting && fontQuery.hasNextPage && !fontQuery.isFetchingNextPage) {
            fontQuery.fetchNextPage();
          }
        },
        {
          root: scrollRef.current,
          rootMargin: "100px",
          threshold: 0,
        }
      );

      observer.observe(node);
      return () => observer.unobserve(node);
    },
    [fontQuery.hasNextPage, fontQuery.isFetchingNextPage, fontQuery.fetchNextPage]
  );

  const handleFontSelect = useCallback(
    async (font: FontInfo) => {
      setLoadingFont(font.family);
      try {
        const weights = getDefaultWeights(font.variants);
        loadGoogleFont(font.family, weights);
        await waitForFont(font.family, weights[0]);
      } catch (error) {
        console.warn(`Failed to load font ${font.family}:`, error);
      }
      setLoadingFont(null);
      
      const fontFamily = buildFontFamily(font.family, font.category);
      onChange(fontFamily);
      setOpen(false);
      setInputValue("");
    },
    [onChange]
  );

  // Get current font info for display
  const currentFont = useMemo(() => {
    if (!value) return null;

    // Extract font name from value (e.g., "Poppins, sans-serif" -> "Poppins")
    const extractedFontName = value.split(",")[0].trim().replace(/['"]/g, "");
    
    // Try to find in search results
    const foundFont = allFonts.find((font: FontInfo) => font.family === extractedFontName);
    if (foundFont) return foundFont;

    // Return fallback
    return {
      family: extractedFontName,
      category: defaultCategory !== "all" ? defaultCategory : "sans-serif",
      variants: ["400"],
      variable: false,
    } as FontInfo;
  }, [value, allFonts, defaultCategory]);

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
            <div className="flex items-center gap-2">
              {currentFont ? (
                <span
                  style={{
                    fontFamily: buildFontFamily(currentFont.family, currentFont.category),
                  }}
                >
                  {currentFont.family}
                </span>
              ) : (
                <span className="text-muted-foreground">Select font...</span>
              )}
            </div>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command shouldFilter={false} className="h-96 w-full overflow-hidden">
            <div className="flex flex-col">
              <div className="relative">
                <CommandInput
                  className="h-10 w-full border-none p-0 pr-10"
                  placeholder="Search Google fonts..."
                  value={inputValue}
                  onValueChange={setInputValue}
                />
                {inputValue && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setInputValue("")}
                    className="absolute top-2 right-2 h-6 w-6"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="px-2 py-1">
                <Select
                  value={selectedCategory}
                  onValueChange={(value) => setSelectedCategory(value as FilterFontCategory)}
                >
                  <SelectTrigger className="h-8 px-2 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Fonts</SelectItem>
                    <SelectItem value="sans-serif">Sans Serif</SelectItem>
                    <SelectItem value="serif">Serif</SelectItem>
                    <SelectItem value="monospace">Monospace</SelectItem>
                    <SelectItem value="display">Display</SelectItem>
                    <SelectItem value="handwriting">Handwriting</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {fontQuery.isLoading ? (
              <div className="flex h-full items-center justify-center gap-2 p-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading fonts...</span>
              </div>
            ) : allFonts.length === 0 ? (
              <CommandEmpty>No fonts found.</CommandEmpty>
            ) : (
              <CommandList className="max-h-[300px] p-1" ref={scrollRef}>
                {allFonts.map((font: FontInfo) => {
                  const isSelected = font.family === (currentFont?.family || "");
                  const isLoading = loadingFont === font.family;
                  const fontFamily = buildFontFamily(font.family, font.category);

                  const handlePreloadOnHover = () => {
                    loadGoogleFont(font.family, ["400"]);
                  };

                  return (
                    <CommandItem
                      key={font.family}
                      className="flex cursor-pointer items-center justify-between gap-2 p-2"
                      onSelect={() => handleFontSelect(font)}
                      disabled={isLoading}
                      onMouseEnter={handlePreloadOnHover}
                      ref={isSelected ? selectedFontRef : null}
                    >
                      <div className="flex w-full flex-1 flex-col justify-between">
                        <span
                          className="inline-flex items-center gap-2 truncate"
                          style={{ fontFamily }}
                        >
                          {font.family}
                          {isLoading && <Loader2 className="h-3 w-3 animate-spin" />}
                        </span>
                        <div className="flex items-center gap-1 text-xs font-normal opacity-70">
                          <span>{font.category}</span>
                          {font.variable && (
                            <span className="inline-flex items-center gap-1">
                              <span>•</span>
                              <span>Variable</span>
                            </span>
                          )}
                        </div>
                      </div>
                      {isSelected && <Check className="h-4 w-4 shrink-0 opacity-70" />}
                    </CommandItem>
                  );
                })}
                {/* Load more trigger */}
                {fontQuery.hasNextPage && (
                  <div ref={loadMoreRefCallback} className="h-2 w-full" />
                )}
                {/* Loading indicator */}
                {fontQuery.isFetchingNextPage && (
                  <div className="flex items-center justify-center gap-2 p-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Loading more fonts...</span>
                  </div>
                )}
              </CommandList>
            )}
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
