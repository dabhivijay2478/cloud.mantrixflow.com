/**
 * Font Types
 * Type definitions for Google Fonts
 */

export type FontCategory =
  | "sans-serif"
  | "serif"
  | "display"
  | "handwriting"
  | "monospace";

// Google Fonts API response types
export type GoogleFontAxis = {
  tag: string;
  start: number;
  end: number;
};

export type GoogleFontFiles = {
  [variant: string]: string; // URL to font file
};

export type GoogleFont = {
  kind: "webfonts#webfont";
  family: string;
  category: FontCategory;
  variants: string[];
  subsets: string[];
  version: string;
  lastModified: string;
  files: GoogleFontFiles;
  menu?: string;
  axes?: GoogleFontAxis[]; // For variable fonts
};

export type GoogleFontsAPIResponse = {
  kind: "webfonts#webfontList";
  items: GoogleFont[];
};

// App's font info type
export interface FontInfo {
  family: string;
  category: FontCategory;
  variants: string[];
  variable: boolean;
}

export type PaginatedFontsResponse = {
  fonts: FontInfo[];
  total: number;
  offset: number;
  limit: number;
  hasMore: boolean;
};

export type FilterFontCategory = "all" | FontCategory;
