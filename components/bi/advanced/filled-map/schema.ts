/**
 * FilledMap Schema
 * Property definitions for the FilledMap component
 */

import type { ComponentSchema } from "@/components/bi/schema-types";

export const filledMapSchema: ComponentSchema = {
  componentType: "filled-map",
  displayName: "Filled Map",
  icon: "MapPin",
  category: "Maps",
  description: "Choropleth map with filled regions",
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
      key: "colorScale",
      type: "enum",
      label: "Color Scale",
      defaultValue: "blues",
      controlType: "select",
      options: [
        { value: "blues", label: "Blues" },
        { value: "greens", label: "Greens" },
        { value: "reds", label: "Reds" },
      ],
    },
  ],
};
