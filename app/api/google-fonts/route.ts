/**
 * Google Fonts API Route
 * Server-side route to fetch Google Fonts (avoids CORS and API key issues)
 */

import { NextResponse } from "next/server";
import type { FontInfo, GoogleFont, GoogleFontsAPIResponse } from "@/lib/types/fonts";

// Cache fonts in memory
let cachedFonts: FontInfo[] | null = null;
let cacheTimestamp: number | null = null;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

// Fallback list of popular Google Fonts
const FALLBACK_FONTS: FontInfo[] = [
  // Sans Serif
  { family: "Inter", category: "sans-serif", variants: ["100", "200", "300", "400", "500", "600", "700", "800", "900"], variable: true },
  { family: "Roboto", category: "sans-serif", variants: ["100", "300", "400", "500", "700", "900"], variable: false },
  { family: "Open Sans", category: "sans-serif", variants: ["300", "400", "500", "600", "700", "800"], variable: true },
  { family: "Poppins", category: "sans-serif", variants: ["100", "200", "300", "400", "500", "600", "700", "800", "900"], variable: false },
  { family: "Montserrat", category: "sans-serif", variants: ["100", "200", "300", "400", "500", "600", "700", "800", "900"], variable: false },
  { family: "Lato", category: "sans-serif", variants: ["100", "300", "400", "700", "900"], variable: false },
  { family: "Raleway", category: "sans-serif", variants: ["100", "200", "300", "400", "500", "600", "700", "800", "900"], variable: true },
  { family: "Nunito", category: "sans-serif", variants: ["200", "300", "400", "500", "600", "700", "800", "900"], variable: true },
  { family: "Source Sans Pro", category: "sans-serif", variants: ["200", "300", "400", "600", "700", "900"], variable: false },
  { family: "Ubuntu", category: "sans-serif", variants: ["300", "400", "500", "700"], variable: false },
  { family: "DM Sans", category: "sans-serif", variants: ["100", "200", "300", "400", "500", "600", "700", "800", "900"], variable: true },
  { family: "Outfit", category: "sans-serif", variants: ["100", "200", "300", "400", "500", "600", "700", "800", "900"], variable: false },
  { family: "Plus Jakarta Sans", category: "sans-serif", variants: ["200", "300", "400", "500", "600", "700", "800"], variable: false },
  { family: "Work Sans", category: "sans-serif", variants: ["100", "200", "300", "400", "500", "600", "700", "800", "900"], variable: false },
  { family: "Manrope", category: "sans-serif", variants: ["200", "300", "400", "500", "600", "700", "800"], variable: true },
  { family: "Figtree", category: "sans-serif", variants: ["300", "400", "500", "600", "700", "800", "900"], variable: false },
  { family: "Space Grotesk", category: "sans-serif", variants: ["300", "400", "500", "600", "700"], variable: false },
  { family: "Geist Sans", category: "sans-serif", variants: ["100", "200", "300", "400", "500", "600", "700", "800", "900"], variable: true },
  
  // Serif
  { family: "Merriweather", category: "serif", variants: ["300", "400", "700", "900"], variable: false },
  { family: "Playfair Display", category: "serif", variants: ["400", "500", "600", "700", "800", "900"], variable: true },
  { family: "Lora", category: "serif", variants: ["400", "500", "600", "700"], variable: true },
  { family: "Source Serif Pro", category: "serif", variants: ["200", "300", "400", "600", "700", "900"], variable: false },
  { family: "Libre Baskerville", category: "serif", variants: ["400", "700"], variable: false },
  { family: "Crimson Text", category: "serif", variants: ["400", "600", "700"], variable: false },
  { family: "Cormorant Garamond", category: "serif", variants: ["300", "400", "500", "600", "700"], variable: false },
  { family: "EB Garamond", category: "serif", variants: ["400", "500", "600", "700", "800"], variable: false },
  { family: "Bitter", category: "serif", variants: ["100", "200", "300", "400", "500", "600", "700", "800", "900"], variable: true },
  { family: "PT Serif", category: "serif", variants: ["400", "700"], variable: false },
  
  // Monospace
  { family: "JetBrains Mono", category: "monospace", variants: ["100", "200", "300", "400", "500", "600", "700", "800"], variable: true },
  { family: "Fira Code", category: "monospace", variants: ["300", "400", "500", "600", "700"], variable: true },
  { family: "Source Code Pro", category: "monospace", variants: ["200", "300", "400", "500", "600", "700", "800", "900"], variable: false },
  { family: "IBM Plex Mono", category: "monospace", variants: ["100", "200", "300", "400", "500", "600", "700"], variable: false },
  { family: "Roboto Mono", category: "monospace", variants: ["100", "200", "300", "400", "500", "600", "700"], variable: false },
  { family: "Space Mono", category: "monospace", variants: ["400", "700"], variable: false },
  { family: "Geist Mono", category: "monospace", variants: ["100", "200", "300", "400", "500", "600", "700", "800", "900"], variable: true },
  { family: "Courier Prime", category: "monospace", variants: ["400", "700"], variable: false },
  { family: "Inconsolata", category: "monospace", variants: ["200", "300", "400", "500", "600", "700", "800", "900"], variable: true },
  
  // Display
  { family: "Oswald", category: "display", variants: ["200", "300", "400", "500", "600", "700"], variable: false },
  { family: "Bebas Neue", category: "display", variants: ["400"], variable: false },
  { family: "Anton", category: "display", variants: ["400"], variable: false },
  { family: "Righteous", category: "display", variants: ["400"], variable: false },
  { family: "Bungee", category: "display", variants: ["400"], variable: false },
  
  // Handwriting
  { family: "Dancing Script", category: "handwriting", variants: ["400", "500", "600", "700"], variable: false },
  { family: "Pacifico", category: "handwriting", variants: ["400"], variable: false },
  { family: "Caveat", category: "handwriting", variants: ["400", "500", "600", "700"], variable: false },
  { family: "Kalam", category: "handwriting", variants: ["300", "400", "700"], variable: false },
  { family: "Permanent Marker", category: "handwriting", variants: ["400"], variable: false },
];

export async function GET() {
  try {
    // Return cached fonts if available and not expired
    const now = Date.now();
    if (
      cachedFonts &&
      cacheTimestamp &&
      now - cacheTimestamp < CACHE_DURATION
    ) {
      return NextResponse.json(
        { fonts: cachedFonts, cached: true },
        {
          headers: {
            "Cache-Control": "public, max-age=3600",
          },
        },
      );
    }

    // Try to fetch from Google Fonts API
    // Note: This may require an API key, so we'll use fallback if it fails
    try {
      const apiKey = process.env.GOOGLE_FONTS_API_KEY;
      const url = apiKey
        ? `https://www.googleapis.com/webfonts/v1/webfonts?key=${apiKey}&sort=popularity`
        : `https://www.googleapis.com/webfonts/v1/webfonts?sort=popularity`;

      const response = await fetch(url, {
        next: { revalidate: 3600 }, // Cache for 1 hour
      });

      if (response.ok) {
        const data: GoogleFontsAPIResponse = await response.json();

        // Transform to our format
        const fonts: FontInfo[] = data.items.map((font: GoogleFont) => ({
          family: font.family,
          category: font.category,
          variants: font.variants,
          variable: Boolean(font.axes && font.axes.length > 0),
        }));

        // Cache the results
        cachedFonts = fonts;
        cacheTimestamp = now;

        return NextResponse.json(
          { fonts, cached: false },
          {
            headers: {
              "Cache-Control": "public, max-age=3600",
            },
          },
        );
      }
    } catch (apiError) {
      console.warn("Google Fonts API failed, using fallback fonts:", apiError);
    }

    // Use fallback fonts if API fails
    cachedFonts = FALLBACK_FONTS;
    cacheTimestamp = now;

    return NextResponse.json(
      { fonts: FALLBACK_FONTS, cached: false, fallback: true },
      {
        headers: {
          "Cache-Control": "public, max-age=3600",
        },
      },
    );
  } catch (error) {
    console.error("Error fetching fonts:", error);
    // Return fallback fonts on error
    return NextResponse.json(
      { fonts: FALLBACK_FONTS, fallback: true },
      {
        status: 200, // Still return 200 with fallback
        headers: {
          "Cache-Control": "public, max-age=3600",
        },
      },
    );
  }
}

