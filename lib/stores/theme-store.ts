/**
 * Theme Store
 * Zustand store for managing theme state
 */

import { create } from "zustand";
import type { ThemeConfig, ThemeMode } from "@/lib/utils/theme";
import {
  getDefaultTheme,
  applyTheme,
  loadThemeFromStorage,
  saveThemeToStorage,
} from "@/lib/utils/theme";

interface ThemeStore {
  theme: ThemeConfig;
  isDark: boolean;
  setTheme: (theme: Partial<ThemeConfig>) => void;
  setMode: (mode: ThemeMode) => void;
  setColor: (colorKey: keyof ThemeConfig["colors"], value: string) => void;
  setFont: (fontKey: keyof ThemeConfig["fonts"], value: string) => void;
  setRadius: (radius: number) => void;
  resetTheme: () => void;
  applyCurrentTheme: () => void;
  updateIsDark: (dark: boolean) => void;
}

// Initialize theme from storage or use default
const initializeTheme = (): ThemeConfig => {
  if (typeof window !== "undefined") {
    return loadThemeFromStorage() || getDefaultTheme();
  }
  return getDefaultTheme();
};

export const useThemeStore = create<ThemeStore>((set, get) => ({
  theme: initializeTheme(),
  isDark: false,

  setTheme: (newTheme) => {
    const updatedTheme = { ...get().theme, ...newTheme };
    set({ theme: updatedTheme });
    if (typeof window !== "undefined") {
      saveThemeToStorage(updatedTheme);
    }
    get().applyCurrentTheme();
  },

  setMode: (mode) => {
    const updatedTheme = { ...get().theme, mode };
    set({ theme: updatedTheme });
    if (typeof window !== "undefined") {
      saveThemeToStorage(updatedTheme);
    }
  },

  setColor: (colorKey, value) => {
    const updatedTheme = {
      ...get().theme,
      colors: {
        ...get().theme.colors,
        [colorKey]: value,
      },
    };
    set({ theme: updatedTheme });
    if (typeof window !== "undefined") {
      saveThemeToStorage(updatedTheme);
    }
    get().applyCurrentTheme();
  },

  setFont: (fontKey, value) => {
    const updatedTheme = {
      ...get().theme,
      fonts: {
        ...get().theme.fonts,
        [fontKey]: value,
      },
    };
    set({ theme: updatedTheme });
    if (typeof window !== "undefined") {
      saveThemeToStorage(updatedTheme);
    }
    get().applyCurrentTheme();
  },

  setRadius: (radius) => {
    const updatedTheme = { ...get().theme, radius };
    set({ theme: updatedTheme });
    if (typeof window !== "undefined") {
      saveThemeToStorage(updatedTheme);
    }
    get().applyCurrentTheme();
  },

  resetTheme: () => {
    const defaultTheme = getDefaultTheme();
    set({ theme: defaultTheme });
    if (typeof window !== "undefined") {
      saveThemeToStorage(defaultTheme);
    }
    get().applyCurrentTheme();
  },

  applyCurrentTheme: () => {
    const { theme, isDark } = get();
    if (typeof window !== "undefined") {
      applyTheme(theme, isDark);
    }
  },

  updateIsDark: (dark: boolean) => {
    set({ isDark: dark });
    get().applyCurrentTheme();
  },
}));

// Helper to update isDark from outside
export const updateThemeDarkMode = (isDark: boolean) => {
  useThemeStore.getState().updateIsDark(isDark);
};

