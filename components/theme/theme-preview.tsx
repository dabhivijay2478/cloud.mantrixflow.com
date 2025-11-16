/**
 * Theme Preview Component
 * Live preview of theme customization
 */

"use client";

import { AreaChart } from "@/components/bi/charts/area-chart";
import { BarChart } from "@/components/bi/charts/bar-chart";
import { DonutChart } from "@/components/bi/charts/donut-chart";
import { LineChart } from "@/components/bi/charts/line-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function ThemePreview() {
  // Sample data for chart previews
  const barChartData = [
    { month: "Jan", sales: 4000, revenue: 2400 },
    { month: "Feb", sales: 3000, revenue: 1398 },
    { month: "Mar", sales: 2000, revenue: 9800 },
    { month: "Apr", sales: 2780, revenue: 3908 },
    { month: "May", sales: 1890, revenue: 4800 },
  ];

  const lineChartData = [
    { month: "Jan", users: 400, sessions: 240 },
    { month: "Feb", users: 300, sessions: 139 },
    { month: "Mar", users: 200, sessions: 980 },
    { month: "Apr", users: 278, sessions: 390 },
    { month: "May", users: 189, sessions: 480 },
  ];

  const donutChartData = [
    { name: "Desktop", value: 400 },
    { name: "Mobile", value: 300 },
    { name: "Tablet", value: 200 },
    { name: "Other", value: 100 },
  ];

  const areaChartData = [
    { month: "Jan", productA: 4000, productB: 2400, productC: 2000 },
    { month: "Feb", productA: 3000, productB: 1398, productC: 1500 },
    { month: "Mar", productA: 2000, productB: 9800, productC: 1800 },
    { month: "Apr", productA: 2780, productB: 3908, productC: 2200 },
    { month: "May", productA: 1890, productB: 4800, productC: 1900 },
  ];

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Theme Preview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Colors */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Colors</h4>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="default">
                Primary
              </Button>
              <Button size="sm" variant="secondary">
                Secondary
              </Button>
              <Button size="sm" variant="outline">
                Outline
              </Button>
              <Button size="sm" variant="ghost">
                Ghost
              </Button>
              <Button size="sm" variant="destructive">
                Destructive
              </Button>
            </div>
          </div>

          {/* Badges */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Badges</h4>
            <div className="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
            </div>
          </div>

          {/* Input */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Input</h4>
            <Input placeholder="Enter text..." />
          </div>

          {/* Typography */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Typography</h4>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold">Heading 1</h1>
              <h2 className="text-xl font-semibold">Heading 2</h2>
              <h3 className="text-lg font-medium">Heading 3</h3>
              <p className="text-sm">Body text with regular weight</p>
              <p className="text-xs text-muted-foreground">
                Muted text for secondary information
              </p>
            </div>
          </div>

          {/* Card */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Card</h4>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Card Title</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  This is a preview card showing how your theme will look.
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Chart Previews */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Chart Previews</CardTitle>
            <p className="text-sm text-muted-foreground">
              See how your theme colors appear in different chart types
            </p>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Bar Chart Preview */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Bar Chart</h4>
              <div className="h-[300px]">
                <BarChart
                  data={barChartData}
                  xKey="month"
                  yKeys={["sales", "revenue"]}
                  title="Monthly Sales & Revenue"
                  description="Comparison of sales and revenue over time"
                />
              </div>
            </div>

            {/* Line Chart Preview */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Line Chart</h4>
              <div className="h-[300px]">
                <LineChart
                  data={lineChartData}
                  xKey="month"
                  yKeys={["users", "sessions"]}
                  title="User Growth Trend"
                  description="Tracking users and sessions over time"
                />
              </div>
            </div>

            {/* Donut Chart Preview */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Donut Chart</h4>
              <div className="h-[400px]">
                <DonutChart
                  data={donutChartData}
                  nameKey="name"
                  valueKey="value"
                  title="Device Distribution"
                  description="Breakdown of devices used by visitors"
                />
              </div>
            </div>

            {/* Area Chart Preview */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Stacked Area Chart</h4>
              <div className="h-[300px]">
                <AreaChart
                  data={areaChartData}
                  xKey="month"
                  yKeys={["productA", "productB", "productC"]}
                  title="Product Sales by Month"
                  description="Stacked area showing product performance"
                  stacked={true}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
