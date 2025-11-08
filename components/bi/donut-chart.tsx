"use client";

import { PieChart, type PieChartProps } from "./pie-chart";

/**
 * DonutChart
 * @description Part-to-whole visualization with a hollow center (donut style).
 * Wrapper around PieChart with innerRadius preset for donut effect.
 * @param {Omit<PieChartProps, "innerRadius">} props - Component properties (excludes innerRadius)
 * @returns {JSX.Element} DonutChart component
 * @example
 * <DonutChart
 *   data={[
 *     { name: "Category A", value: 400 },
 *     { name: "Category B", value: 300 },
 *     { name: "Category C", value: 200 }
 *   ]}
 *   nameKey="name"
 *   valueKey="value"
 *   title="Market Share"
 * />
 */

export type DonutChartProps = Omit<PieChartProps, "innerRadius">;

export function DonutChart(props: DonutChartProps) {
  return <PieChart {...props} innerRadius={60} />;
}
