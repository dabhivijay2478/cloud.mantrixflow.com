/**
 * Fonts Hook
 * Shared hook for fetching and caching fonts across components
 */

import { useState, useEffect } from "react";

interface FontInfo {
  name: string;
  familyName: string;
  postScriptName: string;
  monospace: boolean;
  weight: string;
  style: string;
}

// Global cache to share fonts across all components
let globalFontCache: FontInfo[] | null = null;
let globalFontPromise: Promise<FontInfo[]> | null = null;

export function useFonts() {
  const [fonts, setFonts] = useState<FontInfo[]>(globalFontCache || []);
  const [loading, setLoading] = useState(!globalFontCache);

  useEffect(() => {
    // If fonts are already cached, use them
    if (globalFontCache) {
      setFonts(globalFontCache);
      setLoading(false);
      return;
    }

    // If a request is already in progress, wait for it
    if (globalFontPromise) {
      globalFontPromise
        .then((fetchedFonts) => {
          setFonts(fetchedFonts);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
      return;
    }

    // Start new request
    setLoading(true);
    globalFontPromise = fetch("/api/fonts")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch fonts");
        }
        return response.json();
      })
      .then((data) => {
        const fetchedFonts = data.fonts || [];
        globalFontCache = fetchedFonts;
        setFonts(fetchedFonts);
        setLoading(false);
        return fetchedFonts;
      })
      .catch((error) => {
        console.error("Failed to fetch fonts:", error);
        setLoading(false);
        globalFontPromise = null;
        throw error;
      });

    // Cleanup: reset promise after completion
    globalFontPromise.finally(() => {
      globalFontPromise = null;
    });
  }, []);

  return { fonts, loading };
}

