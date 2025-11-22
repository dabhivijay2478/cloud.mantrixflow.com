/**
 * ForecastLine Schema
 * Property definitions for the ForecastLine component
 */

import type { ComponentSchema } from "@/components/bi/schema-types";

export const forecastLineSchema: ComponentSchema = {
  componentType: "forecast-line",
  displayName: "Forecast Line",
  icon: "TrendingUp",
  category: "Advanced",
  description: "Line chart with forecasted values",
  properties: [
    {
      key: "title",
      type: "string",
      label: "Title",
      defaultValue: "",
      controlType: "input",
    },
    {
      key: "description",
      type: "string",
      label: "Description",
      defaultValue: "",
      controlType: "textarea",
    },
    {
      key: "xKey",
      type: "string",
      label: "X-Axis Field",
      defaultValue: "month",
      controlType: "input",
    },
    {
      key: "yKey",
      type: "string",
      label: "Y-Axis Field",
      defaultValue: "value",
      controlType: "input",
    },
    {
      key: "showConfidenceInterval",
      type: "boolean",
      label: "Show Confidence Interval",
      defaultValue: true,
      controlType: "toggle",
    },
  ],
};
