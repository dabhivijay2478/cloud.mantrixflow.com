/**
 * Mock Data Service
 * Generates realistic mock data based on dataset columns and selected fields
 */

import type { DatasetColumn } from "@/lib/stores/workspace-store";

export interface MockDataOptions {
  rowCount?: number;
  seed?: number;
}

/**
 * Generates mock data based on column definitions
 */
export function generateMockData(
  columns: DatasetColumn[],
  options: MockDataOptions = {},
): Array<Record<string, unknown>> {
  const { rowCount = 20, seed } = options;
  const data: Array<Record<string, unknown>> = [];

  // Simple seeded random for consistency
  let randomSeed = seed || Math.random() * 1000;
  const seededRandom = () => {
    randomSeed = (randomSeed * 9301 + 49297) % 233280;
    return randomSeed / 233280;
  };

  // Generate data for each row
  for (let i = 0; i < rowCount; i++) {
    const row: Record<string, unknown> = {};

    columns.forEach((col) => {
      switch (col.type) {
        case "string":
          row[col.name] = generateStringValue(col.name, i, seededRandom);
          break;
        case "number":
          row[col.name] = generateNumberValue(col.name, i, seededRandom);
          break;
        case "date":
          row[col.name] = generateDateValue(col.name, i, seededRandom);
          break;
        case "boolean":
          row[col.name] = seededRandom() > 0.5;
          break;
        default:
          row[col.name] = null;
      }
    });

    data.push(row);
  }

  return data;
}

/**
 * Generates string values based on column name patterns
 */
function generateStringValue(
  columnName: string,
  index: number,
  random: () => number,
): string {
  const name = columnName.toLowerCase();

  if (name.includes("name") || name.includes("product")) {
    const names = [
      "Product A",
      "Product B",
      "Product C",
      "Product D",
      "Product E",
    ];
    return names[index % names.length];
  }

  if (name.includes("category") || name.includes("type")) {
    const categories = ["Electronics", "Clothing", "Food", "Books", "Toys"];
    return categories[index % categories.length];
  }

  if (name.includes("status")) {
    const statuses = ["Active", "Inactive", "Pending", "Completed"];
    return statuses[index % statuses.length];
  }

  if (name.includes("email")) {
    return `user${index}@example.com`;
  }

  if (name.includes("country") || name.includes("region")) {
    const countries = ["USA", "UK", "Canada", "Germany", "France"];
    return countries[index % countries.length];
  }

  if (name.includes("city")) {
    const cities = ["New York", "London", "Toronto", "Berlin", "Paris"];
    return cities[index % cities.length];
  }

  // Default: generic string
  return `Value ${index + 1}`;
}

/**
 * Generates number values based on column name patterns
 */
function generateNumberValue(
  columnName: string,
  index: number,
  random: () => number,
): number {
  const name = columnName.toLowerCase();

  if (name.includes("revenue") || name.includes("sales") || name.includes("amount")) {
    // Revenue-like values: increasing trend with some variance
    const base = 1000 + index * 50;
    const variance = (random() - 0.5) * 200;
    return Math.round(base + variance);
  }

  if (name.includes("quantity") || name.includes("count") || name.includes("qty")) {
    // Quantity values: moderate range
    return Math.round(10 + random() * 90);
  }

  if (name.includes("price") || name.includes("cost")) {
    // Price values: reasonable range
    return Math.round((10 + random() * 90) * 100) / 100;
  }

  if (name.includes("id")) {
    return index + 1;
  }

  if (name.includes("percentage") || name.includes("percent")) {
    return Math.round(random() * 100);
  }

  if (name.includes("rating") || name.includes("score")) {
    return Math.round(1 + random() * 4);
  }

  // Default: random number between 0 and 1000
  return Math.round(random() * 1000);
}

/**
 * Generates date values based on column name patterns
 */
function generateDateValue(
  columnName: string,
  index: number,
  random: () => number,
): string {
  const name = columnName.toLowerCase();
  const now = new Date();

  if (name.includes("created") || name.includes("start")) {
    // Dates going back in time
    const daysAgo = index * 7 + Math.floor(random() * 7);
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString().split("T")[0];
  }

  if (name.includes("updated") || name.includes("modified")) {
    // Recent dates
    const daysAgo = Math.floor(random() * 30);
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString().split("T")[0];
  }

  if (name.includes("date") || name.includes("time")) {
    // Sequential dates
    const daysAgo = index;
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString().split("T")[0];
  }

  // Default: current date
  return now.toISOString().split("T")[0];
}

/**
 * Transforms dataset data for chart consumption
 * Filters and formats data based on selected fields
 */
export function transformDataForChart(
  data: Array<Record<string, unknown>>,
  xKey?: string,
  yKeys?: string[],
  groupingKey?: string,
): Array<Record<string, unknown>> {
  if (!data || data.length === 0) {
    return [];
  }

  // If no keys specified, return data as-is
  if (!xKey && (!yKeys || yKeys.length === 0)) {
    return data;
  }

  // Filter to only include relevant columns
  const relevantKeys = [
    ...(xKey ? [xKey] : []),
    ...(yKeys || []),
    ...(groupingKey ? [groupingKey] : []),
  ].filter(Boolean);

  return data.map((row) => {
    const filteredRow: Record<string, unknown> = {};
    relevantKeys.forEach((key) => {
      if (row[key] !== undefined) {
        filteredRow[key] = row[key];
      }
    });
    return filteredRow;
  });
}

/**
 * Generates sample data for a specific chart type
 */
export function generateChartData(
  columns: DatasetColumn[],
  xKey?: string,
  yKeys?: string[],
  options: MockDataOptions = {},
): Array<Record<string, unknown>> {
  // Generate full dataset
  const fullData = generateMockData(columns, options);

  // Transform for chart
  return transformDataForChart(fullData, xKey, yKeys);
}

