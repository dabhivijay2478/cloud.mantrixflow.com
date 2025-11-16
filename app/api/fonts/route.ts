/**
 * Fonts API Route
 * Returns list of system fonts using font-list package with caching
 */

import { getFonts2 } from "font-list";
import { NextResponse } from "next/server";

// Cache fonts in memory to avoid repeated system calls
let cachedFonts: Array<{
  name: string;
  familyName: string;
  postScriptName: string;
  monospace: boolean;
  weight: string;
  style: string;
}> | null = null;

let cacheTimestamp: number | null = null;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour cache

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

    // Fetch fonts from system
    const fonts = await getFonts2({ disableQuoting: true });

    // Filter and format fonts
    const formattedFonts = fonts.map((font) => ({
      name: font.name,
      familyName: font.familyName,
      postScriptName: font.postScriptName,
      monospace: font.monospace ?? false,
      weight: font.weight,
      style: font.style,
    }));

    // Cache the results
    cachedFonts = formattedFonts;
    cacheTimestamp = now;

    return NextResponse.json(
      { fonts: formattedFonts, cached: false },
      {
        headers: {
          "Cache-Control": "public, max-age=3600",
        },
      },
    );
  } catch (error) {
    console.error("Error fetching fonts:", error);
    return NextResponse.json(
      { error: "Failed to fetch fonts" },
      { status: 500 },
    );
  }
}
