/**
 * Theme Utilities
 * Color generation, theme management, and CSS variable utilities
 */

export type ThemeMode = "light" | "dark" | "system";

export interface ColorPalette {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}

export interface PrimitiveColors {
  primary: string;
  secondary: string;
  accent: string;
  neutral: string;
  success: string;
  warning: string;
  error: string;
}

export interface ThemeConfig {
  name: string;
  mode: ThemeMode;
  colors: PrimitiveColors;
  fonts: {
    sans: string;
    serif: string;
    mono: string;
  };
  radius: number;
}

/**
 * Convert hex color to HSL
 */
export function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

/**
 * Convert HSL to hex
 */
export function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/**
 * Generate color palette from base color (50-950 shades)
 */
export function generateColorPalette(baseColor: string): ColorPalette {
  const [h, s] = hexToHsl(baseColor);
  const baseL = hexToHsl(baseColor)[2];

  // Generate shades with varying lightness
  const shades: ColorPalette = {
    50: hslToHex(h, Math.max(0, s - 20), Math.min(98, baseL + 45)),
    100: hslToHex(h, Math.max(0, s - 15), Math.min(95, baseL + 35)),
    200: hslToHex(h, Math.max(0, s - 10), Math.min(90, baseL + 25)),
    300: hslToHex(h, Math.max(0, s - 5), Math.min(85, baseL + 15)),
    400: hslToHex(h, s, Math.min(75, baseL + 5)),
    500: baseColor, // Base color
    600: hslToHex(h, Math.min(100, s + 5), Math.max(25, baseL - 10)),
    700: hslToHex(h, Math.min(100, s + 10), Math.max(20, baseL - 20)),
    800: hslToHex(h, Math.min(100, s + 15), Math.max(15, baseL - 30)),
    900: hslToHex(h, Math.min(100, s + 20), Math.max(10, baseL - 40)),
    950: hslToHex(h, Math.min(100, s + 25), Math.max(5, baseL - 50)),
  };

  return shades;
}

/**
 * Get default theme configuration
 */
export function getDefaultTheme(): ThemeConfig {
  return {
    name: "Default",
    mode: "system",
    colors: {
      primary: "#00a859",
      secondary: "#007fff",
      accent: "#8a2be2",
      neutral: "#71717a",
      success: "#22c55e",
      warning: "#f59e0b",
      error: "#ef4444",
    },
    fonts: {
      sans: "Poppins, sans-serif",
      serif: "Georgia, serif",
      mono: "JetBrains Mono, monospace",
    },
    radius: 0.5,
  };
}

/**
 * Check if theme is customized (different from default)
 */
export function isThemeCustomized(theme: ThemeConfig): boolean {
  const defaultTheme = getDefaultTheme();
  
  // Check colors
  const colorsCustomized = Object.keys(theme.colors).some(
    (key) => theme.colors[key as keyof typeof theme.colors] !== defaultTheme.colors[key as keyof typeof defaultTheme.colors]
  );
  
  // Check fonts
  const fontsCustomized = 
    theme.fonts.sans !== defaultTheme.fonts.sans ||
    theme.fonts.serif !== defaultTheme.fonts.serif ||
    theme.fonts.mono !== defaultTheme.fonts.mono;
  
  // Check radius
  const radiusCustomized = theme.radius !== defaultTheme.radius;
  
  return colorsCustomized || fontsCustomized || radiusCustomized;
}

/**
 * Clear custom theme CSS variables (revert to default from globals.css)
 */
export function clearCustomTheme(): void {
  if (typeof window === "undefined") return;
  const root = document.documentElement;
  
  // Remove all custom theme CSS variables
  // This allows the default values from globals.css to be used
  
  // Remove color palette variables
  const colorShades = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"];
  const colorTypes = ["primary", "secondary", "accent", "neutral", "success", "warning", "error"];
  
  colorTypes.forEach((type) => {
    colorShades.forEach((shade) => {
      root.style.removeProperty(`--${type}-${shade}`);
    });
  });
  
  // Remove semantic color overrides (let globals.css handle them)
  const semanticColors = [
    "background", "foreground", "card", "card-foreground",
    "popover", "popover-foreground", "primary", "primary-foreground",
    "secondary", "secondary-foreground", "muted", "muted-foreground",
    "accent", "accent-foreground", "destructive", "destructive-foreground",
    "border", "input", "ring"
  ];
  
  semanticColors.forEach((color) => {
    root.style.removeProperty(`--${color}`);
  });
  
  // Remove font overrides
  root.style.removeProperty("--font-sans");
  root.style.removeProperty("--font-serif");
  root.style.removeProperty("--font-mono");
  
  // Remove radius override
  root.style.removeProperty("--radius");
}

/**
 * Apply theme to CSS variables
 * Only applies if theme is customized, otherwise uses default from globals.css
 */
export function applyTheme(theme: ThemeConfig, isDark: boolean = false) {
  const root = document.documentElement;
  
  // Check if theme is customized
  if (!isThemeCustomized(theme)) {
    // If not customized, clear any custom CSS variables and use defaults from globals.css
    clearCustomTheme();
    return;
  }

  // Generate color palettes
  const primaryPalette = generateColorPalette(theme.colors.primary);
  const secondaryPalette = generateColorPalette(theme.colors.secondary);
  const accentPalette = generateColorPalette(theme.colors.accent);
  const neutralPalette = generateColorPalette(theme.colors.neutral);
  const successPalette = generateColorPalette(theme.colors.success);
  const warningPalette = generateColorPalette(theme.colors.warning);
  const errorPalette = generateColorPalette(theme.colors.error);

  // Apply primitive colors
  Object.entries(primaryPalette).forEach(([shade, color]) => {
    root.style.setProperty(`--primary-${shade}`, color);
  });
  Object.entries(secondaryPalette).forEach(([shade, color]) => {
    root.style.setProperty(`--secondary-${shade}`, color);
  });
  Object.entries(accentPalette).forEach(([shade, color]) => {
    root.style.setProperty(`--accent-${shade}`, color);
  });
  Object.entries(neutralPalette).forEach(([shade, color]) => {
    root.style.setProperty(`--neutral-${shade}`, color);
  });
  Object.entries(successPalette).forEach(([shade, color]) => {
    root.style.setProperty(`--success-${shade}`, color);
  });
  Object.entries(warningPalette).forEach(([shade, color]) => {
    root.style.setProperty(`--warning-${shade}`, color);
  });
  Object.entries(errorPalette).forEach(([shade, color]) => {
    root.style.setProperty(`--error-${shade}`, color);
  });

  // Apply semantic colors based on mode
  if (isDark) {
    root.style.setProperty("--background", neutralPalette[950]);
    root.style.setProperty("--foreground", neutralPalette[50]);
    root.style.setProperty("--card", neutralPalette[900]);
    root.style.setProperty("--card-foreground", neutralPalette[50]);
    root.style.setProperty("--popover", neutralPalette[950]);
    root.style.setProperty("--popover-foreground", neutralPalette[50]);
    root.style.setProperty("--primary", primaryPalette[500]);
    root.style.setProperty("--primary-foreground", neutralPalette[950]);
    root.style.setProperty("--secondary", secondaryPalette[500]);
    root.style.setProperty("--secondary-foreground", neutralPalette[950]);
    root.style.setProperty("--muted", neutralPalette[800]);
    root.style.setProperty("--muted-foreground", neutralPalette[300]);
    root.style.setProperty("--accent", accentPalette[500]);
    root.style.setProperty("--accent-foreground", neutralPalette[950]);
    root.style.setProperty("--destructive", errorPalette[500]);
    root.style.setProperty("--destructive-foreground", neutralPalette[50]);
    root.style.setProperty("--border", neutralPalette[800]);
    root.style.setProperty("--input", neutralPalette[800]);
    root.style.setProperty("--ring", primaryPalette[500]);
  } else {
    root.style.setProperty("--background", neutralPalette[50]);
    root.style.setProperty("--foreground", neutralPalette[950]);
    root.style.setProperty("--card", "#ffffff");
    root.style.setProperty("--card-foreground", neutralPalette[950]);
    root.style.setProperty("--popover", "#ffffff");
    root.style.setProperty("--popover-foreground", neutralPalette[950]);
    root.style.setProperty("--primary", primaryPalette[500]);
    root.style.setProperty("--primary-foreground", "#ffffff");
    root.style.setProperty("--secondary", secondaryPalette[500]);
    root.style.setProperty("--secondary-foreground", "#ffffff");
    root.style.setProperty("--muted", neutralPalette[100]);
    root.style.setProperty("--muted-foreground", neutralPalette[600]);
    root.style.setProperty("--accent", accentPalette[500]);
    root.style.setProperty("--accent-foreground", "#ffffff");
    root.style.setProperty("--destructive", errorPalette[500]);
    root.style.setProperty("--destructive-foreground", "#ffffff");
    root.style.setProperty("--border", neutralPalette[200]);
    root.style.setProperty("--input", neutralPalette[200]);
    root.style.setProperty("--ring", primaryPalette[500]);
  }

  // Apply fonts
  root.style.setProperty("--font-sans", theme.fonts.sans);
  root.style.setProperty("--font-serif", theme.fonts.serif);
  root.style.setProperty("--font-mono", theme.fonts.mono);

  // Apply radius
  root.style.setProperty("--radius", `${theme.radius}rem`);
}

/**
 * Load theme from localStorage
 */
export function loadThemeFromStorage(): ThemeConfig | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem("custom-theme");
    if (stored) {
      return JSON.parse(stored) as ThemeConfig;
    }
  } catch (error) {
    console.error("Failed to load theme from storage:", error);
  }
  return null;
}

/**
 * Save theme to localStorage
 */
export function saveThemeToStorage(theme: ThemeConfig): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("custom-theme", JSON.stringify(theme));
  } catch (error) {
    console.error("Failed to save theme to storage:", error);
  }
}

/**
 * Reset theme to defaults
 */
export function resetTheme(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("custom-theme");
  clearCustomTheme();
}

/**
 * Validate hex color
 */
export function isValidHexColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

/**
 * Get contrast color (black or white) for a given background
 */
export function getContrastColor(backgroundColor: string): string {
  const [r, g, b] = [
    parseInt(backgroundColor.slice(1, 3), 16),
    parseInt(backgroundColor.slice(3, 5), 16),
    parseInt(backgroundColor.slice(5, 7), 16),
  ];
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? "#000000" : "#ffffff";
}

