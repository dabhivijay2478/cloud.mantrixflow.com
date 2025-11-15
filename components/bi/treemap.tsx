"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Treemap as RechartsTreemap,
} from "recharts";

/**
 * TreeMap
 * @description Hierarchical data visualization using nested rectangles.
 * Shows part-to-whole relationships with size representing value.
 * @param {TreeMapProps} props - Component properties
 * @param {TreeMapNode[]} props.data - Array of treemap nodes
 * @param {string} [props.title] - Chart title
 * @param {string} [props.description] - Chart description
 * @param {string[]} [props.colors] - Custom color palette
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} TreeMap component
 * @example
 * <TreeMap
 *   data={[
 *     { name: "Product A", size: 4000 },
 *     { name: "Product B", size: 3000 },
 *     { name: "Product C", size: 2000 },
 *     { name: "Product D", size: 1000 }
 *   ]}
 *   title="Product Sales"
 * />
 */

export interface TreeMapNode {
  name: string;
  size: number;
  children?: TreeMapNode[];
}

export interface TreeMapProps {
  data: TreeMapNode[];
  title?: string;
  description?: string;
  colors?: string[];
  className?: string;
}

const DEFAULT_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

// Custom content for treemap cells
const CustomContent = (props: any) => {
  const { x, y, width, height, name, size, depth, colors } = props;
  
  if (width < 40 || height < 40) return null;

  // Ensure size is a valid number
  const displaySize = typeof size === 'number' && !isNaN(size) ? size : 0;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: colors[depth % colors.length],
          stroke: "#fff",
          strokeWidth: 2,
        }}
      />
      <text
        x={x + width / 2}
        y={y + height / 2}
        textAnchor="middle"
        fill="#fff"
        fontSize={14}
        fontWeight="bold"
      >
        {name}
      </text>
      {displaySize > 0 && (
        <text
          x={x + width / 2}
          y={y + height / 2 + 20}
          textAnchor="middle"
          fill="#fff"
          fontSize={12}
        >
          {displaySize.toLocaleString()}
        </text>
      )}
    </g>
  );
};

export function TreeMap({
  data,
  title,
  description,
  colors = DEFAULT_COLORS,
  className,
}: TreeMapProps) {
  const chartConfig = {
    size: {
      label: "Size",
      color: colors[0],
    },
  } satisfies ChartConfig;

  return (
    <Card className={className}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </CardHeader>
      )}
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[400px] w-full">
          <RechartsTreemap
            accessibilityLayer
            data={data}
            dataKey="size"
            aspectRatio={4 / 3}
            stroke="#fff"
            fill={colors[0]}
            content={<CustomContent colors={colors} />}
          />
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
