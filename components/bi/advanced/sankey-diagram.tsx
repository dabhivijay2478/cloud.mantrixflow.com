"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * SankeyDiagram
 * @description Flow visualization showing connections between sources and targets.
 * Perfect for displaying resource flows, user journeys, and process transitions.
 * Note: This is a simplified implementation. For production, consider using a library like recharts-sankey
 * @param {SankeyDiagramProps} props - Component properties
 * @param {SankeyNode[]} props.nodes - Array of node definitions
 * @param {SankeyLink[]} props.links - Array of link definitions
 * @param {string} [props.title] - Chart title
 * @param {string} [props.description] - Chart description
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} SankeyDiagram component
 * @example
 * <SankeyDiagram
 *   nodes={[
 *     { id: "a", name: "Website" },
 *     { id: "b", name: "Product Page" },
 *     { id: "c", name: "Checkout" }
 *   ]}
 *   links={[
 *     { source: "a", target: "b", value: 1000 },
 *     { source: "b", target: "c", value: 500 }
 *   ]}
 *   title="User Journey Flow"
 * />
 */

export interface SankeyNode {
  id: string;
  name: string;
}

export interface SankeyLink {
  source: string;
  target: string;
  value: number;
}

export interface SankeyDiagramProps {
  nodes: SankeyNode[];
  links: SankeyLink[];
  title?: string;
  description?: string;
  className?: string;
}

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7c7c",
  "#a78bfa",
  "#fb923c",
];

export function SankeyDiagram({
  nodes,
  links,
  title,
  description,
  className,
}: SankeyDiagramProps) {
  // Calculate node positions (simplified layout)
  const nodeMap = new Map(
    nodes.map((node, i) => [node.id, { ...node, index: i }]),
  );

  // Calculate total values for width scaling
  const maxValue = Math.max(...links.map((link) => link.value));

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
        <div className="relative min-h-[400px] p-4">
          {/* Simplified Sankey visualization */}
          <div className="space-y-8">
            {/* Group nodes by depth/level */}
            <div className="grid grid-cols-3 gap-8">
              {/* Source nodes */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-center">Source</h4>
                {nodes
                  .slice(0, Math.ceil(nodes.length / 3))
                  .map((node, index) => (
                    <div
                      key={node.id}
                      className={cn(
                        "p-4 rounded-lg border-2 text-center font-medium",
                        "transition-all hover:shadow-md",
                      )}
                      style={{
                        borderColor: COLORS[index % COLORS.length],
                        backgroundColor: `${COLORS[index % COLORS.length]}20`,
                      }}
                    >
                      {node.name}
                    </div>
                  ))}
              </div>

              {/* Middle nodes */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-center">Process</h4>
                {nodes
                  .slice(
                    Math.ceil(nodes.length / 3),
                    Math.ceil((nodes.length * 2) / 3),
                  )
                  .map((node, index) => (
                    <div
                      key={node.id}
                      className={cn(
                        "p-4 rounded-lg border-2 text-center font-medium",
                        "transition-all hover:shadow-md",
                      )}
                      style={{
                        borderColor:
                          COLORS[
                            (index + Math.ceil(nodes.length / 3)) %
                              COLORS.length
                          ],
                        backgroundColor: `${COLORS[(index + Math.ceil(nodes.length / 3)) % COLORS.length]}20`,
                      }}
                    >
                      {node.name}
                    </div>
                  ))}
              </div>

              {/* Target nodes */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-center">Target</h4>
                {nodes
                  .slice(Math.ceil((nodes.length * 2) / 3))
                  .map((node, index) => (
                    <div
                      key={node.id}
                      className={cn(
                        "p-4 rounded-lg border-2 text-center font-medium",
                        "transition-all hover:shadow-md",
                      )}
                      style={{
                        borderColor:
                          COLORS[
                            (index + Math.ceil((nodes.length * 2) / 3)) %
                              COLORS.length
                          ],
                        backgroundColor: `${COLORS[(index + Math.ceil((nodes.length * 2) / 3)) % COLORS.length]}20`,
                      }}
                    >
                      {node.name}
                    </div>
                  ))}
              </div>
            </div>

            {/* Flow information */}
            <div className="mt-8 space-y-2">
              <h4 className="text-sm font-semibold">Flow Details:</h4>
              {links.map((link, index) => {
                const sourceNode = nodeMap.get(link.source);
                const targetNode = nodeMap.get(link.target);
                const widthPercent = (link.value / maxValue) * 100;

                return (
                  <div
                    key={`link-${link.source}-${link.target}-${index}`}
                    className="flex items-center gap-2 text-sm"
                  >
                    <span className="text-muted-foreground min-w-[100px]">
                      {sourceNode?.name}
                    </span>
                    <div className="flex-1 relative h-6 bg-muted rounded overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 rounded flex items-center justify-center text-xs font-medium text-white"
                        style={{
                          width: `${widthPercent}%`,
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      >
                        {widthPercent > 15 && link.value.toLocaleString()}
                      </div>
                    </div>
                    <span className="text-muted-foreground min-w-[100px]">
                      {targetNode?.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
