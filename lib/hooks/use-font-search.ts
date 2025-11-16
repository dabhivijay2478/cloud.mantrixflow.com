/**
 * Font Search Hook
 * Hook for searching and filtering Google Fonts with pagination
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FilterFontCategory, FontInfo } from "@/lib/types/fonts";
import { fetchGoogleFonts } from "@/lib/utils/google-fonts";

interface UseFontSearchOptions {
  query: string;
  category: FilterFontCategory;
  limit?: number;
  enabled?: boolean;
}

const FONTS_PER_PAGE = 20;

// Global cache for fonts
let globalFontCache: FontInfo[] | null = null;
let globalFontPromise: Promise<FontInfo[]> | null = null;

export function useFontSearch({
  query,
  category,
  limit: _limit = 15,
  enabled = true,
}: UseFontSearchOptions) {
  const [fonts, setFonts] = useState<FontInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  // Fetch fonts on mount
  useEffect(() => {
    if (!enabled) return;

    const loadFonts = async () => {
      if (globalFontCache) {
        setFonts(globalFontCache);
        setLoading(false);
        return;
      }

      if (globalFontPromise) {
        const fetchedFonts = await globalFontPromise;
        setFonts(fetchedFonts);
        setLoading(false);
        return;
      }

      setLoading(true);
      globalFontPromise = fetchGoogleFonts();
      const fetchedFonts = await globalFontPromise;
      globalFontCache = fetchedFonts;
      setFonts(fetchedFonts);
      setLoading(false);
      globalFontPromise = null;
    };

    loadFonts();
  }, [enabled]);

  // Filter and paginate fonts
  const filteredFonts = useMemo(() => {
    let filtered = fonts;

    // Filter by category
    if (category !== "all") {
      filtered = filtered.filter((font) => font.category === category);
    }

    // Filter by search query
    if (query.trim()) {
      const searchLower = query.toLowerCase().trim();
      filtered = filtered.filter((font) =>
        font.family.toLowerCase().includes(searchLower),
      );
    }

    return filtered;
  }, [fonts, category, query]);

  // Get paginated fonts
  const paginatedFonts = useMemo(() => {
    const start = 0;
    const end = start + (page + 1) * FONTS_PER_PAGE;
    return filteredFonts.slice(start, end);
  }, [filteredFonts, page]);

  // Check if there are more fonts
  const hasMore = useMemo(() => {
    return paginatedFonts.length < filteredFonts.length;
  }, [paginatedFonts.length, filteredFonts.length]);

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, []);

  const fetchNextPage = useCallback(() => {
    if (hasMore && !loading) {
      setPage((prev) => prev + 1);
    }
  }, [hasMore, loading]);

  return {
    data: {
      pages: [{ fonts: paginatedFonts }],
    },
    isLoading: loading,
    isFetchingNextPage: false,
    hasNextPage: hasMore,
    fetchNextPage,
  };
}
