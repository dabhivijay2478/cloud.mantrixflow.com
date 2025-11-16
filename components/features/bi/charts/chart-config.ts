/**
 * Chart Configuration Utilities
 * @description Shared chart configuration constants and utilities
 */

import type { ChartConfig } from "@/components/ui/chart";

/**
 * Default chart color palette using CSS variables
 */
export const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

/**
 * Creates a ChartConfig object from an array of data keys
 * @param yKeys - Array of data keys to create config for
 * @param customColor - Optional custom color for the first key
 * @param customColors - Optional custom color array (overrides default palette)
 * @returns ChartConfig object
 */
export function createChartConfig(
  yKeys: string[],
  customColor?: string,
  customColors?: string[],
): ChartConfig {
  const colors = customColors || CHART_COLORS;
  return yKeys.reduce((config, key, index) => {
    config[key] = {
      label: key,
      color:
        index === 0 && customColor
          ? customColor
          : colors[index % colors.length],
    };
    return config;
  }, {} as ChartConfig);
}

/**
 * Base chart props shared by all chart components
 */
export interface BaseChartProps {
  data: Array<Record<string, unknown>>;
  title?: string;
  description?: string;
  className?: string;
}
