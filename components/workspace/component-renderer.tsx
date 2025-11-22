"use client";

import * as BIComponents from "@/components/bi";
import type { DashboardComponent } from "@/lib/stores/workspace-store";

// Sample data for components
const sampleBarData = [
  { month: "Jan", value: 186 },
  { month: "Feb", value: 305 },
  { month: "Mar", value: 237 },
  { month: "Apr", value: 273 },
  { month: "May", value: 209 },
  { month: "Jun", value: 214 },
];

const sampleLineData = [
  { month: "Jan", desktop: 186, mobile: 80 },
  { month: "Feb", desktop: 305, mobile: 200 },
  { month: "Mar", desktop: 237, mobile: 120 },
  { month: "Apr", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "Jun", desktop: 214, mobile: 140 },
];

const sampleAreaData = [
  { month: "Jan", desktop: 186, mobile: 80 },
  { month: "Feb", desktop: 305, mobile: 200 },
  { month: "Mar", desktop: 237, mobile: 120 },
  { month: "Apr", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "Jun", desktop: 214, mobile: 140 },
];

const samplePieData = [
  { name: "Desktop", value: 400, fill: "var(--chart-1)" },
  { name: "Mobile", value: 300, fill: "var(--chart-2)" },
  { name: "Tablet", value: 200, fill: "var(--chart-3)" },
  { name: "Other", value: 100, fill: "var(--chart-4)" },
];

interface ComponentRendererProps {
  component: DashboardComponent;
}

export function ComponentRenderer({ component }: ComponentRendererProps) {
  const { type, config } = component;

  // Merge config with defaults
  const mergedConfig = {
    ...getDefaultConfig(type),
    ...config,
  };

  try {
    switch (type) {
      // Charts
      case "line-chart": {
        // Generate sample data if not provided, using the actual field names from config
        const chartData = mergedConfig.data || generateSampleData(
          mergedConfig.xKey || "month",
          mergedConfig.yKeys || ["desktop", "mobile"]
        );

        return (
          <BIComponents.LineChart
            data={chartData}
            xKey={mergedConfig.xKey || "month"}
            yKeys={mergedConfig.yKeys || ["desktop", "mobile"]}
            title={mergedConfig.title}
            description={mergedConfig.description}
          />
        );
      }

      case "bar-chart": {
        const chartData = mergedConfig.data || generateSampleData(
          mergedConfig.xKey || "month",
          mergedConfig.yKeys || ["value"]
        );

        return (
          <BIComponents.BarChart
            data={chartData}
            xKey={mergedConfig.xKey || "month"}
            yKeys={mergedConfig.yKeys || ["value"]}
            title={mergedConfig.title}
            description={mergedConfig.description}
          />
        );
      }

      case "area-chart": {
        const chartData = mergedConfig.data || generateSampleData(
          mergedConfig.xKey || "month",
          mergedConfig.yKeys || ["desktop", "mobile"]
        );

        return (
          <BIComponents.AreaChart
            data={chartData}
            xKey={mergedConfig.xKey || "month"}
            yKeys={mergedConfig.yKeys || ["desktop", "mobile"]}
            title={mergedConfig.title}
            description={mergedConfig.description}
          />
        );
      }

      case "pie-chart": {
        // For pie charts, generate with name/value pairs
        const pieData = mergedConfig.data || [...Array(6)].map((_, i) => ({
          [mergedConfig.nameKey || "name"]: `Category ${String.fromCharCode(65 + i)}`,
          [mergedConfig.valueKey || "value"]: Math.floor(Math.random() * 300) + 100,
        }));

        return (
          <BIComponents.PieChart
            data={pieData}
            nameKey={mergedConfig.nameKey || "name"}
            valueKey={mergedConfig.valueKey || "value"}
            title={mergedConfig.title}
            description={mergedConfig.description}
          />
        );
      }

      case "donut-chart": {
        const donutData = mergedConfig.data || [...Array(6)].map((_, i) => ({
          [mergedConfig.nameKey || "name"]: `Category ${String.fromCharCode(65 + i)}`,
          [mergedConfig.valueKey || "value"]: Math.floor(Math.random() * 300) + 100,
        }));

        return (
          <BIComponents.DonutChart
            data={donutData}
            nameKey={mergedConfig.nameKey || "name"}
            valueKey={mergedConfig.valueKey || "value"}
            title={mergedConfig.title}
            description={mergedConfig.description}
          />
        );
      }

      case "stacked-bar-chart": {
        const chartData = mergedConfig.data || generateSampleData(
          mergedConfig.xKey || "month",
          mergedConfig.yKeys || ["value"]
        );

        return (
          <BIComponents.StackedBarChart
            data={chartData}
            xKey={mergedConfig.xKey || "month"}
            yKeys={mergedConfig.yKeys || ["value"]}
            title={mergedConfig.title}
            description={mergedConfig.description}
          />
        );
      }

      case "stacked-column-chart": {
        const chartData = mergedConfig.data || generateSampleData(
          mergedConfig.xKey || "month",
          mergedConfig.yKeys || ["value"]
        );

        return (
          <BIComponents.StackedColumnChart
            data={chartData}
            xKey={mergedConfig.xKey || "month"}
            yKeys={mergedConfig.yKeys || ["value"]}
            title={mergedConfig.title}
            description={mergedConfig.description}
          />
        );
      }

      case "clustered-bar-chart":
        return (
          <BIComponents.ClusteredBarChart
            data={mergedConfig.data || sampleBarData}
            xKey={mergedConfig.xKey || "month"}
            yKeys={mergedConfig.yKeys || ["value"]}
            title={mergedConfig.title}
            description={mergedConfig.description}
          />
        );

      case "clustered-column-chart":
        return (
          <BIComponents.ClusteredColumnChart
            data={mergedConfig.data || sampleBarData}
            xKey={mergedConfig.xKey || "month"}
            yKeys={mergedConfig.yKeys || ["value"]}
            title={mergedConfig.title}
            description={mergedConfig.description}
          />
        );

      case "stacked-area-chart": {
        const chartData = mergedConfig.data || generateSampleData(
          mergedConfig.xKey || "month",
          mergedConfig.yKeys || ["desktop", "mobile"]
        );

        return (
          <BIComponents.StackedAreaChart
            data={chartData}
            xKey={mergedConfig.xKey || "month"}
            yKeys={mergedConfig.yKeys || ["desktop", "mobile"]}
            title={mergedConfig.title}
            description={mergedConfig.description}
          />
        );
      }

      case "line-stacked-column-chart":
        return (
          <BIComponents.LineStackedColumnChart
            data={mergedConfig.data || sampleLineData}
            xKey={mergedConfig.xKey || "month"}
            yKeys={mergedConfig.yKeys || ["desktop"]}
            lineKeys={mergedConfig.lineKeys || ["mobile"]}
            title={mergedConfig.title}
            description={mergedConfig.description}
          />
        );

      case "ribbon-chart":
        return (
          <BIComponents.RibbonChart
            data={mergedConfig.data || sampleAreaData}
            xKey={mergedConfig.xKey || "month"}
            yKeys={mergedConfig.yKeys || ["desktop", "mobile"]}
            title={mergedConfig.title}
            description={mergedConfig.description}
          />
        );

      case "waterfall-chart":
        return (
          <BIComponents.WaterfallChart
            data={
              mergedConfig.data || [
                { label: "Start", value: 100 },
                { label: "Add", value: 50 },
                { label: "Subtract", value: -20 },
                { label: "End", value: 130 },
              ]
            }
            labelKey={mergedConfig.labelKey || "label"}
            valueKey={mergedConfig.valueKey || "value"}
            title={mergedConfig.title}
            description={mergedConfig.description}
          />
        );

      case "scatter-chart": {
        const chartData = mergedConfig.data || generateSampleData(
          mergedConfig.xKey || "x",
          [mergedConfig.yKey || "y"]
        );

        return (
          <BIComponents.ScatterChart
            data={chartData}
            xKey={mergedConfig.xKey || "x"}
            yKey={mergedConfig.yKey || "y"}
            title={mergedConfig.title}
            description={mergedConfig.description}
          />
        );
      }

      case "radar-chart":
        return <div className="p-4 border border-dashed">Radar Chart (Coming Soon)</div>;

      case "funnel-chart":
        return (
          <BIComponents.FunnelChart
            data={
              mergedConfig.data || [
                { name: "Visits", value: 1000 },
                { name: "Leads", value: 500 },
                { name: "Sales", value: 100 },
              ]
            }
            title={mergedConfig.title}
            description={mergedConfig.description}
          />
        );

      case "heatmap":
        return (
          <BIComponents.Heatmap
            data={
              mergedConfig.data || [
                { x: 0, y: 0, value: 10 },
                { x: 1, y: 0, value: 20 },
                { x: 0, y: 1, value: 15 },
                { x: 1, y: 1, value: 25 },
              ]
            }
            xLabels={mergedConfig.xLabels || ["Mon", "Tue"]}
            yLabels={mergedConfig.yLabels || ["Week 1", "Week 2"]}
            title={mergedConfig.title}
            description={mergedConfig.description}
          />
        );

      case "treemap":
        return (
          <BIComponents.TreeMap
            data={
              mergedConfig.data || [
                { name: "A", value: 100 },
                { name: "B", value: 200 },
                { name: "C", value: 150 },
              ]
            }
            nameKey={mergedConfig.nameKey || "name"}
            valueKey={mergedConfig.valueKey || "value"}
            title={mergedConfig.title}
            description={mergedConfig.description}
          />
        );

      case "sankey-diagram":
        return (
          <BIComponents.SankeyDiagram
            nodes={
              mergedConfig.nodes || [
                { id: "A", label: "Source A" },
                { id: "B", label: "Target B" },
              ]
            }
            links={
              mergedConfig.links || [{ source: "A", target: "B", value: 100 }]
            }
            title={mergedConfig.title}
            description={mergedConfig.description}
          />
        );

      case "forecast-line":
        return (
          <BIComponents.ForecastLine
            historicalData={mergedConfig.historicalData || sampleLineData}
            forecastData={
              mergedConfig.forecastData || [
                { month: "Jul", desktop: 250, mobile: 160 },
                { month: "Aug", desktop: 280, mobile: 180 },
              ]
            }
            xKey={mergedConfig.xKey || "month"}
            yKey={mergedConfig.yKey || "desktop"}
            title={mergedConfig.title}
            description={mergedConfig.description}
            showConfidenceInterval={mergedConfig.showConfidenceInterval}
          />
        );

      // Metrics
      case "kpi-card":
        return (
          <BIComponents.KPICard
            value={mergedConfig.value || "$45,231"}
            label={mergedConfig.label || "Total Revenue"}
            change={mergedConfig.change || 12.5}
            changeLabel={mergedConfig.changeLabel || "vs last month"}
            trend={mergedConfig.trend}
          />
        );

      case "metric-card":
        return (
          <BIComponents.MetricCard
            value={mergedConfig.value || "12,345"}
            label={mergedConfig.label || "Active Users"}
            description={mergedConfig.description || "Currently online"}
          />
        );

      case "gauge":
        return (
          <BIComponents.Gauge
            value={mergedConfig.value || 75}
            max={mergedConfig.max || 100}
            label={mergedConfig.label || "Progress"}
            thresholds={mergedConfig.thresholds}
          />
        );

      case "bullet-chart":
        return (
          <BIComponents.BulletChart
            value={mergedConfig.value || 75}
            target={mergedConfig.target || 80}
            label={mergedConfig.label || "Revenue"}
            zones={
              mergedConfig.zones || [
                { max: 50, color: "#fecaca" },
                { max: 70, color: "#fde68a" },
                { max: 100, color: "#bbf7d0" },
              ]
            }
          />
        );

      case "sparkline":
        return (
          <BIComponents.Sparkline
            data={mergedConfig.data || [10, 20, 15, 30, 25, 40, 35]}
            color={mergedConfig.color || "var(--chart-1)"}
            type={mergedConfig.type || "line"}
          />
        );

      case "progress-bar":
        return (
          <BIComponents.ProgressBar
            value={mergedConfig.value || 65}
            label={mergedConfig.label || "Progress"}
            max={mergedConfig.max || 100}
          />
        );

      case "multi-row-card":
        return (
          <BIComponents.MultiRowCard
            rows={
              mergedConfig.rows || [
                { label: "Revenue", value: "$45,231" },
                { label: "Profit", value: "$12,345" },
              ]
            }
            title={mergedConfig.title}
          />
        );

      // Data Display
      case "data-table":
        return (
          <BIComponents.DataTable
            data={
              mergedConfig.data || [
                { id: 1, name: "Item 1", value: 100 },
                { id: 2, name: "Item 2", value: 200 },
              ]
            }
            columns={
              mergedConfig.columns || [
                { accessorKey: "name", header: "Name" },
                { accessorKey: "value", header: "Value" },
              ]
            }
          />
        );

      case "matrix":
        return (
          <BIComponents.Matrix
            data={
              mergedConfig.data || [
                { row: "A", col: "X", value: 10 },
                { row: "A", col: "Y", value: 20 },
              ]
            }
            rowKey={mergedConfig.rowKey || "row"}
            colKey={mergedConfig.colKey || "col"}
            valueKey={mergedConfig.valueKey || "value"}
            title={mergedConfig.title}
            description={mergedConfig.description}
          />
        );

      case "paginated-report":
        return (
          <BIComponents.PaginatedReport
            data={mergedConfig.data || []}
            columns={mergedConfig.columns || []}
            title={mergedConfig.title}
            description={mergedConfig.description}
          />
        );

      // Maps
      case "map":
        return (
          <BIComponents.Map
            markers={
              mergedConfig.markers || [
                { lat: 40.7128, lng: -74.006, label: "New York" },
              ]
            }
            title={mergedConfig.title}
            description={mergedConfig.description}
          />
        );

      case "filled-map":
        return (
          <BIComponents.FilledMap
            regions={mergedConfig.regions || []}
            title={mergedConfig.title}
            description={mergedConfig.description}
          />
        );

      case "basic-leaflet-map":
      case "leaflet-map-with-pin":
      case "leaflet-map-grayscale":
      case "leaflet-map-custom-pin":
      case "leaflet-map-bubbles":
      case "leaflet-map-change-city":
      case "leaflet-map-custom-popover":
        return <div className="p-4 border border-dashed">Leaflet Map (Coming Soon)</div>;

      // Layout & Container
      case "grid-layout":
        return (
          <BIComponents.GridLayout
            cols={mergedConfig.cols || 3}
            gap={mergedConfig.gap || "md"}
          >
            {mergedConfig.children || <div>Grid Layout</div>}
          </BIComponents.GridLayout>
        );

      case "section":
        return (
          <BIComponents.Section
            title={mergedConfig.title}
            description={mergedConfig.description}
          >
            {mergedConfig.children || <div>Section Content</div>}
          </BIComponents.Section>
        );

      // Input & Filter
      case "date-range-picker":
        return <BIComponents.DateRangePicker {...mergedConfig} />;
      case "multi-select":
        return <BIComponents.MultiSelect {...mergedConfig} />;
      case "search-input":
        return <BIComponents.SearchInput {...mergedConfig} />;
      case "slicer":
        return <BIComponents.Slicer {...mergedConfig} />;

      // Text & Insight
      case "insight-text":
        return (
          <BIComponents.InsightText
            text={mergedConfig.text || "Sample insight text"}
            type={mergedConfig.type || "info"}
          />
        );

      case "ai-commentary":
        return (
          <BIComponents.AICommentary
            text={mergedConfig.text || "AI-generated commentary"}
          />
        );

      case "stat-change":
        return (
          <BIComponents.StatChange
            value={mergedConfig.value || 12.5}
            label={mergedConfig.label || "Growth"}
            size={mergedConfig.size}
          />
        );

      case "trend-label":
        return (
          <BIComponents.TrendLabel
            trend={mergedConfig.trend || "up"}
            label={mergedConfig.label || "Rising"}
            variant={mergedConfig.variant}
          />
        );

      case "anomaly-badge":
        return (
          <BIComponents.AnomalyBadge
            severity={mergedConfig.severity || "medium"}
            label={mergedConfig.label || "Anomaly Detected"}
          />
        );

      // Embed & Share
      case "embed-code":
        return <BIComponents.EmbedCode {...mergedConfig} />;
      case "share-button":
        return <BIComponents.ShareButton {...mergedConfig} />;
      case "qr-code":
        return <BIComponents.QRCode {...mergedConfig} />;
      case "export-pdf":
        return <BIComponents.ExportPDF {...mergedConfig} />;

      // AI Prompt & Feedback
      case "prompt-input":
        return <BIComponents.PromptInput {...mergedConfig} />;
      case "regenerate-button":
        return <BIComponents.RegenerateButton {...mergedConfig} />;
      case "feedback-thumbs":
        return <BIComponents.FeedbackThumbs {...mergedConfig} />;
      case "edit-prompt":
        return <BIComponents.EditPrompt {...mergedConfig} />;
      case "qa":
        return <BIComponents.QA {...mergedConfig} />;

      default:
        return (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <p className="text-sm font-medium">Unknown component type</p>
              <p className="text-xs mt-1">{type}</p>
            </div>
          </div>
        );
    }
  } catch (error) {
    console.error(`Error rendering component ${type}:`, error);
    return (
      <div className="flex items-center justify-center h-full text-destructive">
        <div className="text-center">
          <p className="text-sm font-medium">Error rendering component</p>
          <p className="text-xs mt-1">{type}</p>
        </div>
      </div>
    );
  }
}

// Helper function to generate sample data based on field names
function generateSampleData(xKey: string, yKeys: string[]): Array<Record<string, any>> {
  const sampleCategories = ["A", "B", "C", "D", "E", "F"];
  const sampleMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const sampleDates = ["2024-01", "2024-02", "2024-03", "2024-04", "2024-05", "2024-06"];

  // Determine x-axis values based on key name
  let xValues: any[];
  if (xKey.toLowerCase().includes("month")) {
    xValues = sampleMonths;
  } else if (xKey.toLowerCase().includes("date") || xKey.toLowerCase().includes("time")) {
    xValues = sampleDates;
  } else if (xKey.toLowerCase().includes("category") || xKey.toLowerCase().includes("name")) {
    xValues = sampleCategories;
  } else {
    xValues = sampleCategories; // default
  }

  // Generate data points
  return xValues.map((xValue) => {
    const dataPoint: Record<string, any> = { [xKey]: xValue };

    // Add each y-axis field with sample numeric data
    yKeys.forEach((yKey) => {
      dataPoint[yKey] = Math.floor(Math.random() * 200) + 50;
    });

    return dataPoint;
  });
}

function getDefaultConfig(_type: string): Record<string, unknown> {
  // Return default configurations for each component type
  return {};
}
