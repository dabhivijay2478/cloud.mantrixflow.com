/**
 * Google Fonts Utilities
 * Functions for fetching and loading Google Fonts
 */

import type { FontInfo } from "@/lib/types/fonts";

// Global cache for Google Fonts
let cachedFonts: FontInfo[] | null = null;
let cachePromise: Promise<FontInfo[]> | null = null;

/**
 * Fetch Google Fonts from API
 * Uses server-side API route to avoid CORS and API key issues
 */
export async function fetchGoogleFonts(): Promise<FontInfo[]> {
  // Return cached fonts if available
  if (cachedFonts) {
    return cachedFonts;
  }

  // If a request is in progress, wait for it
  if (cachePromise) {
    return cachePromise;
  }

  // Start new request - use our API route
  cachePromise = (async () => {
    try {
      const response = await fetch("/api/google-fonts");
      
      if (!response.ok) {
        throw new Error(`Fonts API error: ${response.status}`);
      }

      const data = await response.json();
      const fonts = data.fonts || [];

      // Cache the results
      cachedFonts = fonts;
      return fonts;
    } catch (error) {
      console.error("Failed to fetch fonts:", error);
      // Return fallback fonts if API fails
      const fallback = getFallbackFonts();
      cachedFonts = fallback;
      return fallback;
    } finally {
      cachePromise = null;
    }
  })();

  return cachePromise;
}

/**
 * Build Google Fonts CSS API URL
 */
export function buildFontCssUrl(family: string, weights: string[] = ["400"]): string {
  const encodedFamily = encodeURIComponent(family);
  const weightsParam = weights.join(";");
  return `https://fonts.googleapis.com/css2?family=${encodedFamily}:wght@${weightsParam}&display=swap`;
}

/**
 * Load Google Font using link tag
 */
export function loadGoogleFont(family: string, weights: string[] = ["400", "700"]): void {
  if (typeof document === "undefined") return;

  // Check if already loaded
  const href = buildFontCssUrl(family, weights);
  const existing = document.querySelector(`link[href="${href}"]`);
  if (existing) return;

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}

/**
 * Build font-family value for CSS
 */
export function buildFontFamily(fontFamily: string, category: FontCategory): string {
  const fallbacks: Record<FontCategory, string> = {
    "sans-serif": "ui-sans-serif, system-ui, sans-serif",
    serif: "ui-serif, Georgia, serif",
    monospace: "ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Monaco, Consolas, 'Courier New', monospace",
    display: "ui-serif, Georgia, serif",
    handwriting: "cursive",
  };
  
  return `${fontFamily}, ${fallbacks[category]}`;
}

/**
 * Get default weights for a font based on available variants
 */
export function getDefaultWeights(variants: string[]): string[] {
  const weightMap = ["100", "200", "300", "400", "500", "600", "700", "800", "900"];
  const availableWeights = variants.filter((variant) => weightMap.includes(variant));
  
  if (availableWeights.length === 0) return ["400"];
  
  const preferredWeights = ["400", "500", "600", "700"];
  const selectedWeights = preferredWeights.filter((weight) => availableWeights.includes(weight));
  
  if (selectedWeights.length === 0) {
    const fallbackWeights = availableWeights.slice(0, 2);
    return fallbackWeights.sort((a, b) => parseInt(a) - parseInt(b));
  }
  
  const finalWeights = [
    ...selectedWeights,
    ...availableWeights.filter((w) => !selectedWeights.includes(w)),
  ].slice(0, 4);
  
  return finalWeights.sort((a, b) => parseInt(a) - parseInt(b));
}

/**
 * Check if a font is loaded
 */
export function isFontLoaded(family: string, weight = "400"): boolean {
  if (typeof document === "undefined" || !document.fonts) return false;
  return document.fonts.check(`${weight} 16px "${family}"`);
}

/**
 * Wait for a font to load
 */
export async function waitForFont(
  family: string,
  weight = "400",
  timeout = 3000
): Promise<boolean> {
  if (typeof document === "undefined" || !document.fonts) return false;

  const font = `${weight} 16px "${family}"`;

  try {
    await Promise.race([
      document.fonts.load(font),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), timeout)),
    ]);
    return document.fonts.check(font);
  } catch {
    return false;
  }
}

/**
 * Fallback fonts if API fails
 * This is a minimal fallback - the API route has a more comprehensive list
 */
export function getFallbackFonts(): FontInfo[] {
  return [
    { family: "Inter", category: "sans-serif", variants: ["400", "600", "700"], variable: true },
    { family: "Roboto", category: "sans-serif", variants: ["400", "600", "700"], variable: false },
    { family: "Open Sans", category: "sans-serif", variants: ["400", "600", "700"], variable: true },
    { family: "Poppins", category: "sans-serif", variants: ["400", "600", "700"], variable: false },
    { family: "Montserrat", category: "sans-serif", variants: ["400", "600", "700"], variable: false },
    { family: "Merriweather", category: "serif", variants: ["400", "600", "700"], variable: false },
    { family: "Playfair Display", category: "serif", variants: ["400", "600", "700"], variable: true },
    { family: "Lora", category: "serif", variants: ["400", "600", "700"], variable: true },
    { family: "JetBrains Mono", category: "monospace", variants: ["400", "600", "700"], variable: true },
    { family: "Fira Code", category: "monospace", variants: ["400", "600", "700"], variable: true },
    { family: "Source Code Pro", category: "monospace", variants: ["400", "600", "700"], variable: false },
  ];
}

