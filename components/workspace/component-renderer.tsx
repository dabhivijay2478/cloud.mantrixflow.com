"use client";

import type * as React from "react";
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

const _samplePieData = [
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
        // Use provided data if available, otherwise generate sample data
        const xKey = getStringValue(mergedConfig.xKey, "month");
        const yKeys = getStringArrayValue(mergedConfig.yKeys, [
          "desktop",
          "mobile",
        ]);
        
        // Prefer actual data from config, fall back to generated sample
        const chartData = Array.isArray(mergedConfig.data) && mergedConfig.data.length > 0
          ? mergedConfig.data
          : generateSampleData(xKey, yKeys);

        return (
          <BIComponents.LineChart
            data={chartData}
            xKey={xKey}
            yKeys={yKeys}
            title={mergedConfig.title as string}
            description={mergedConfig.description as string}
          />
        );
      }

      case "bar-chart": {
        const xKey = getStringValue(mergedConfig.xKey, "month");
        const yKeys = getStringArrayValue(mergedConfig.yKeys, ["value"]);
        
        // Prefer actual data from config, fall back to generated sample
        const chartData = Array.isArray(mergedConfig.data) && mergedConfig.data.length > 0
          ? mergedConfig.data
          : generateSampleData(xKey, yKeys);

        return (
          <BIComponents.BarChart
            data={chartData}
            xKey={xKey}
            yKeys={yKeys}
            title={mergedConfig.title as string}
            description={mergedConfig.description as string}
          />
        );
      }

      case "area-chart": {
        const xKey = getStringValue(mergedConfig.xKey, "month");
        const yKeys = getStringArrayValue(mergedConfig.yKeys, [
          "desktop",
          "mobile",
        ]);
        
        // Prefer actual data from config, fall back to generated sample
        const chartData = Array.isArray(mergedConfig.data) && mergedConfig.data.length > 0
          ? mergedConfig.data
          : generateSampleData(xKey, yKeys);

        return (
          <BIComponents.AreaChart
            data={chartData}
            xKey={xKey}
            yKeys={yKeys}
            title={mergedConfig.title as string}
            description={mergedConfig.description as string}
          />
        );
      }

      case "pie-chart": {
        // For pie charts, generate with name/value pairs
        const nameKey = getStringValue(mergedConfig.nameKey, "name");
        const valueKey = getStringValue(mergedConfig.valueKey, "value");
        
        // Prefer actual data from config, fall back to generated sample
        const defaultPieData = [...Array(6)].map((_, i) => ({
          [nameKey]: `Category ${String.fromCharCode(65 + i)}`,
          [valueKey]: Math.floor(Math.random() * 300) + 100,
        }));
        const pieData = Array.isArray(mergedConfig.data) && mergedConfig.data.length > 0
          ? mergedConfig.data
          : defaultPieData;

        return (
          <BIComponents.PieChart
            data={pieData}
            nameKey={nameKey}
            valueKey={valueKey}
            title={mergedConfig.title as string}
            description={mergedConfig.description as string}
          />
        );
      }

      case "donut-chart": {
        const nameKey = getStringValue(mergedConfig.nameKey, "name");
        const valueKey = getStringValue(mergedConfig.valueKey, "value");
        
        // Prefer actual data from config, fall back to generated sample
        const defaultDonutData = [...Array(6)].map((_, i) => ({
          [nameKey]: `Category ${String.fromCharCode(65 + i)}`,
          [valueKey]: Math.floor(Math.random() * 300) + 100,
        }));
        const donutData = Array.isArray(mergedConfig.data) && mergedConfig.data.length > 0
          ? mergedConfig.data
          : defaultDonutData;

        return (
          <BIComponents.DonutChart
            data={donutData}
            nameKey={nameKey}
            valueKey={valueKey}
            title={mergedConfig.title as string}
            description={mergedConfig.description as string}
          />
        );
      }

      case "stacked-bar-chart": {
        const xKey = getStringValue(mergedConfig.xKey, "month");
        const yKeys = getStringArrayValue(mergedConfig.yKeys, ["value"]);
        
        // Prefer actual data from config, fall back to generated sample
        const chartData = Array.isArray(mergedConfig.data) && mergedConfig.data.length > 0
          ? mergedConfig.data
          : generateSampleData(xKey, yKeys);

        return (
          <BIComponents.StackedBarChart
            data={chartData}
            xKey={xKey}
            yKeys={yKeys}
            title={mergedConfig.title as string}
            description={mergedConfig.description as string}
          />
        );
      }

      case "stacked-column-chart": {
        const xKey = getStringValue(mergedConfig.xKey, "month");
        const yKeys = getStringArrayValue(mergedConfig.yKeys, ["value"]);
        
        // Prefer actual data from config, fall back to generated sample
        const chartData = Array.isArray(mergedConfig.data) && mergedConfig.data.length > 0
          ? mergedConfig.data
          : generateSampleData(xKey, yKeys);

        return (
          <BIComponents.StackedColumnChart
            data={chartData}
            xKey={xKey}
            yKeys={yKeys}
            title={mergedConfig.title as string}
            description={mergedConfig.description as string}
          />
        );
      }

      case "clustered-bar-chart": {
        const xKey = getStringValue(mergedConfig.xKey, "month");
        const yKeys = getStringArrayValue(mergedConfig.yKeys, ["value"]);
        
        // Prefer actual data from config, fall back to sample
        const chartData = Array.isArray(mergedConfig.data) && mergedConfig.data.length > 0
          ? mergedConfig.data
          : sampleBarData;
        
        return (
          <BIComponents.ClusteredBarChart
            data={chartData}
            xKey={xKey}
            yKeys={yKeys}
            title={mergedConfig.title as string}
            description={mergedConfig.description as string}
          />
        );
      }

      case "clustered-column-chart": {
        const xKey = getStringValue(mergedConfig.xKey, "month");
        const yKeys = getStringArrayValue(mergedConfig.yKeys, ["value"]);
        
        // Prefer actual data from config, fall back to sample
        const chartData = Array.isArray(mergedConfig.data) && mergedConfig.data.length > 0
          ? mergedConfig.data
          : sampleBarData;
        
        return (
          <BIComponents.ClusteredColumnChart
            data={chartData}
            xKey={xKey}
            yKeys={yKeys}
            title={mergedConfig.title as string}
            description={mergedConfig.description as string}
          />
        );
      }

      case "stacked-area-chart": {
        const xKey = getStringValue(mergedConfig.xKey, "month");
        const yKeys = getStringArrayValue(mergedConfig.yKeys, [
          "desktop",
          "mobile",
        ]);
        
        // Prefer actual data from config, fall back to generated sample
        const chartData = Array.isArray(mergedConfig.data) && mergedConfig.data.length > 0
          ? mergedConfig.data
          : generateSampleData(xKey, yKeys);

        return (
          <BIComponents.StackedAreaChart
            data={chartData}
            xKey={xKey}
            yKeys={yKeys}
            title={mergedConfig.title as string}
            description={mergedConfig.description as string}
          />
        );
      }

      case "line-stacked-column-chart": {
        const xKey = getStringValue(mergedConfig.xKey, "month");
        const columnKeys = getStringArrayValue(mergedConfig.yKeys, ["desktop"]);
        const lineKeys = getStringArrayValue(mergedConfig.lineKeys, ["mobile"]);
        
        // Prefer actual data from config, fall back to sample
        const chartData = Array.isArray(mergedConfig.data) && mergedConfig.data.length > 0
          ? mergedConfig.data
          : sampleLineData;
        
        return (
          <BIComponents.LineStackedColumnChart
            data={chartData}
            xKey={xKey}
            columnKeys={columnKeys}
            lineKeys={lineKeys}
            title={mergedConfig.title as string}
            description={mergedConfig.description as string}
          />
        );
      }

      case "ribbon-chart": {
        const xKey = getStringValue(mergedConfig.xKey, "month");
        const yKeys = getStringArrayValue(mergedConfig.yKeys, [
          "desktop",
          "mobile",
        ]);
        
        // Prefer actual data from config, fall back to sample
        const chartData = Array.isArray(mergedConfig.data) && mergedConfig.data.length > 0
          ? mergedConfig.data
          : sampleAreaData;
        
        return (
          <BIComponents.RibbonChart
            data={chartData}
            xKey={xKey}
            yKeys={yKeys}
            title={mergedConfig.title as string}
            description={mergedConfig.description as string}
          />
        );
      }

      case "waterfall-chart": {
        const defaultWaterfallData = [
          { name: "Start", value: 100, type: "start" as const },
          { name: "Add", value: 50, type: "positive" as const },
          { name: "Subtract", value: -20, type: "negative" as const },
          { name: "End", value: 130, type: "total" as const },
        ];
        return (
          <BIComponents.WaterfallChart
            data={getArrayValue(mergedConfig.data, defaultWaterfallData)}
            title={mergedConfig.title as string}
            description={mergedConfig.description as string}
          />
        );
      }

      case "scatter-chart": {
        const xKey = getStringValue(mergedConfig.xKey, "x");
        const yKey = getStringValue(mergedConfig.yKey, "y");
        
        // Prefer actual data from config, fall back to generated sample
        const chartData = Array.isArray(mergedConfig.data) && mergedConfig.data.length > 0
          ? mergedConfig.data
          : generateSampleData(xKey, [yKey]);

        return (
          <BIComponents.ScatterChart
            data={chartData}
            xKey={xKey}
            yKey={yKey}
            title={mergedConfig.title as string}
            description={mergedConfig.description as string}
          />
        );
      }

      case "radar-chart":
        return (
          <div className="p-4 border border-dashed">
            Radar Chart (Coming Soon)
          </div>
        );

      case "funnel-chart": {
        const defaultFunnelData = [
          { name: "Visits", value: 1000 },
          { name: "Leads", value: 500 },
          { name: "Sales", value: 100 },
        ];
        return (
          <BIComponents.FunnelChart
            data={getArrayValue(mergedConfig.data, defaultFunnelData)}
            title={mergedConfig.title as string}
            description={mergedConfig.description as string}
          />
        );
      }

      case "heatmap": {
        const xLabels = getStringArrayValue(mergedConfig.xLabels, [
          "Mon",
          "Tue",
        ]);
        const yLabels = getStringArrayValue(mergedConfig.yLabels, [
          "Week 1",
          "Week 2",
        ]);
        const defaultHeatmapData = [
          { x: 0, y: 0, value: 10 },
          { x: 1, y: 0, value: 20 },
          { x: 0, y: 1, value: 15 },
          { x: 1, y: 1, value: 25 },
        ];
        return (
          <BIComponents.Heatmap
            data={getArrayValue(mergedConfig.data, defaultHeatmapData)}
            xLabels={xLabels}
            yLabels={yLabels}
            title={mergedConfig.title as string}
            description={mergedConfig.description as string}
          />
        );
      }

      case "treemap": {
        const defaultTreemapData = [
          { name: "A", size: 100 },
          { name: "B", size: 200 },
          { name: "C", size: 150 },
        ];
        return (
          <BIComponents.TreeMap
            data={getArrayValue(mergedConfig.data, defaultTreemapData)}
            title={mergedConfig.title as string}
            description={mergedConfig.description as string}
          />
        );
      }

      case "sankey-diagram": {
        const defaultNodes = [
          { id: "A", name: "Source A" },
          { id: "B", name: "Target B" },
        ];
        const defaultLinks = [{ source: "A", target: "B", value: 100 }];
        return (
          <BIComponents.SankeyDiagram
            nodes={getArrayValue(mergedConfig.nodes, defaultNodes)}
            links={getArrayValue(mergedConfig.links, defaultLinks)}
            title={mergedConfig.title as string}
            description={mergedConfig.description as string}
          />
        );
      }

      case "forecast-line": {
        const xKey = getStringValue(mergedConfig.xKey, "month");
        const yKey = getStringValue(mergedConfig.yKey, "desktop");
        const defaultForecastData = [
          { month: "Jul", desktop: 250, mobile: 160 },
          { month: "Aug", desktop: 280, mobile: 180 },
        ];
        return (
          <BIComponents.ForecastLine
            historicalData={getArrayValue(
              mergedConfig.historicalData,
              sampleLineData,
            )}
            forecastData={getArrayValue(
              mergedConfig.forecastData,
              defaultForecastData,
            )}
            xKey={xKey}
            yKey={yKey}
            title={mergedConfig.title as string}
            description={mergedConfig.description as string}
            showConfidenceInterval={
              mergedConfig.showConfidenceInterval as boolean
            }
          />
        );
      }

      // Metrics
      case "kpi-card":
        return (
          <BIComponents.KPICard
            value={getStringOrNumberValue(mergedConfig.value, "$45,231")}
            label={getStringValue(mergedConfig.label, "Total Revenue")}
            change={getNumberValue(mergedConfig.change, 12.5)}
            changeLabel={getStringValue(
              mergedConfig.changeLabel,
              "vs last month",
            )}
            trend={mergedConfig.trend as "up" | "down" | "neutral" | undefined}
          />
        );

      case "metric-card":
        return (
          <BIComponents.MetricCard
            value={getStringOrNumberValue(mergedConfig.value, "12,345")}
            label={getStringValue(mergedConfig.label, "Active Users")}
            description={getStringValue(
              mergedConfig.description,
              "Currently online",
            )}
          />
        );

      case "gauge":
        return (
          <BIComponents.Gauge
            value={getNumberValue(mergedConfig.value, 75)}
            max={getNumberValue(mergedConfig.max, 100)}
            label={getStringValue(mergedConfig.label, "Progress")}
            thresholds={
              mergedConfig.thresholds as
                | Array<{ max: number; color: string }>
                | undefined
            }
          />
        );

      case "bullet-chart": {
        const defaultZones = [
          { max: 50, color: "#fecaca" },
          { max: 70, color: "#fde68a" },
          { max: 100, color: "#bbf7d0" },
        ];
        return (
          <BIComponents.BulletChart
            value={getNumberValue(mergedConfig.value, 75)}
            target={getNumberValue(mergedConfig.target, 80)}
            label={getStringValue(mergedConfig.label, "Revenue")}
            zones={getArrayValue(mergedConfig.zones, defaultZones)}
          />
        );
      }

      case "sparkline": {
        const defaultSparklineData = [10, 20, 15, 30, 25, 40, 35];
        const typeValue = mergedConfig.type;
        const sparklineType =
          typeValue === "line" || typeValue === "area" ? typeValue : "line";
        return (
          <BIComponents.Sparkline
            data={getArrayValue(mergedConfig.data, defaultSparklineData)}
            color={getStringValue(mergedConfig.color, "var(--chart-1)")}
            type={sparklineType}
          />
        );
      }

      case "progress-bar":
        return (
          <BIComponents.ProgressBar
            value={getNumberValue(mergedConfig.value, 65)}
            label={getStringValue(mergedConfig.label, "Progress")}
            max={getNumberValue(mergedConfig.max, 100)}
          />
        );

      case "multi-row-card": {
        const defaultRows = [
          { label: "Revenue", value: "$45,231" },
          { label: "Profit", value: "$12,345" },
        ];
        return (
          <BIComponents.MultiRowCard
            rows={getArrayValue(mergedConfig.rows, defaultRows)}
            title={mergedConfig.title as string}
          />
        );
      }

      // Data Display
      case "data-table": {
        const defaultTableData = [
          { id: 1, name: "Item 1", value: 100 },
          { id: 2, name: "Item 2", value: 200 },
        ];
        const defaultColumns = [
          { accessorKey: "name", header: "Name" },
          { accessorKey: "value", header: "Value" },
        ];
        return (
          <BIComponents.DataTable
            data={getArrayValue(mergedConfig.data, defaultTableData)}
            columns={getArrayValue(mergedConfig.columns, defaultColumns)}
          />
        );
      }

      case "matrix": {
        // Matrix component expects rowKeys and columnKeys arrays
        // For now, provide default values that match the expected format
        const defaultMatrixData = [
          { row: "A", col1: 10, col2: 20 },
          { row: "B", col1: 15, col2: 25 },
        ];
        const defaultRowKeys = ["A", "B"];
        const defaultColumnKeys = ["col1", "col2"];
        return (
          <BIComponents.Matrix
            data={getArrayValue(mergedConfig.data, defaultMatrixData)}
            rowKeys={getStringArrayValue(mergedConfig.rowKeys, defaultRowKeys)}
            columnKeys={getStringArrayValue(
              mergedConfig.columnKeys,
              defaultColumnKeys,
            )}
            title={mergedConfig.title as string}
            description={mergedConfig.description as string}
          />
        );
      }

      case "paginated-report": {
        return (
          <BIComponents.PaginatedReport
            data={getArrayValue(mergedConfig.data, [])}
            columns={getArrayValue(mergedConfig.columns, [])}
            title={mergedConfig.title as string}
            description={mergedConfig.description as string}
          />
        );
      }

      // Maps
      case "map": {
        const defaultMarkers = [
          { lat: 40.7128, lng: -74.006, label: "New York" },
        ];
        return (
          <BIComponents.Map
            markers={getArrayValue(mergedConfig.markers, defaultMarkers)}
            title={mergedConfig.title as string}
            description={mergedConfig.description as string}
          />
        );
      }

      case "filled-map": {
        return (
          <BIComponents.FilledMap
            regions={getArrayValue(mergedConfig.regions, [])}
            title={mergedConfig.title as string}
            description={mergedConfig.description as string}
          />
        );
      }

      case "basic-leaflet-map":
      case "leaflet-map-with-pin":
      case "leaflet-map-grayscale":
      case "leaflet-map-custom-pin":
      case "leaflet-map-bubbles":
      case "leaflet-map-change-city":
      case "leaflet-map-custom-popover":
        return (
          <div className="p-4 border border-dashed">
            Leaflet Map (Coming Soon)
          </div>
        );

      // Layout & Container
      case "grid-layout": {
        const colsValue = mergedConfig.cols;
        const validCols = [1, 2, 3, 4, 6, 12] as const;
        const cols =
          typeof colsValue === "number" &&
          validCols.includes(colsValue as (typeof validCols)[number])
            ? (colsValue as (typeof validCols)[number])
            : 3;
        return (
          <BIComponents.GridLayout
            cols={cols}
            gap={
              getStringValue(mergedConfig.gap, "md") as
                | "sm"
                | "md"
                | "lg"
                | undefined
            }
          >
            {mergedConfig.children &&
            (typeof mergedConfig.children === "string" ||
              typeof mergedConfig.children === "number" ||
              Array.isArray(mergedConfig.children) ||
              (typeof mergedConfig.children === "object" &&
                "$$typeof" in mergedConfig.children)) ? (
              (mergedConfig.children as React.ReactNode)
            ) : (
              <div>Grid Layout</div>
            )}
          </BIComponents.GridLayout>
        );
      }

      case "section":
        return (
          <BIComponents.Section
            title={mergedConfig.title as string | undefined}
            description={mergedConfig.description as string | undefined}
          >
            {mergedConfig.children &&
            (typeof mergedConfig.children === "string" ||
              typeof mergedConfig.children === "number" ||
              Array.isArray(mergedConfig.children) ||
              (typeof mergedConfig.children === "object" &&
                "$$typeof" in mergedConfig.children)) ? (
              (mergedConfig.children as React.ReactNode)
            ) : (
              <div>Section Content</div>
            )}
          </BIComponents.Section>
        );

      // Input & Filter
      case "date-range-picker":
        return <BIComponents.DateRangePicker {...mergedConfig} />;
      case "multi-select": {
        const defaultOptions = getArrayValue(mergedConfig.options, [
          { value: "option1", label: "Option 1" },
          { value: "option2", label: "Option 2" },
        ]);
        return (
          <BIComponents.MultiSelect
            options={defaultOptions}
            {...(mergedConfig as Record<string, unknown>)}
          />
        );
      }
      case "search-input":
        return <BIComponents.SearchInput {...mergedConfig} />;
      case "slicer": {
        const defaultOptions = getArrayValue(mergedConfig.options, [
          { value: "option1", label: "Option 1" },
          { value: "option2", label: "Option 2" },
        ]);
        return (
          <BIComponents.Slicer
            options={defaultOptions}
            {...(mergedConfig as Record<string, unknown>)}
          />
        );
      }

      // Text & Insight
      case "insight-text":
        return (
          <BIComponents.InsightText
            text={getStringValue(mergedConfig.text, "Sample insight text")}
            type={
              getStringValue(mergedConfig.type, "info") as
                | "positive"
                | "negative"
                | "neutral"
                | "info"
            }
          />
        );

      case "ai-commentary":
        return (
          <BIComponents.AICommentary
            content={getStringValue(
              mergedConfig.content,
              "AI-generated commentary",
            )}
            title={mergedConfig.title as string | undefined}
            summary={mergedConfig.summary as string | undefined}
            highlights={getStringArrayValue(mergedConfig.highlights, [])}
            confidence={mergedConfig.confidence as string | undefined}
          />
        );

      case "stat-change":
        return (
          <BIComponents.StatChange
            value={getNumberValue(mergedConfig.value, 12.5)}
            label={getStringValue(mergedConfig.label, "Growth")}
            size={mergedConfig.size as "sm" | "md" | "lg" | undefined}
          />
        );

      case "trend-label":
        return (
          <BIComponents.TrendLabel
            trend={
              getStringValue(mergedConfig.trend, "up") as
                | "up"
                | "down"
                | "stable"
            }
            label={getStringValue(mergedConfig.label, "Rising")}
            variant={
              mergedConfig.variant as
                | "default"
                | "outline"
                | "secondary"
                | undefined
            }
          />
        );

      case "anomaly-badge":
        return (
          <BIComponents.AnomalyBadge
            severity={
              getStringValue(mergedConfig.severity, "medium") as
                | "low"
                | "medium"
                | "high"
            }
            label={getStringValue(mergedConfig.label, "Anomaly Detected")}
          />
        );

      // Embed & Share
      case "embed-code":
        return (
          <BIComponents.EmbedCode
            url={getStringValue(mergedConfig.url, "")}
            {...(mergedConfig as Record<string, unknown>)}
          />
        );
      case "share-button":
        return (
          <BIComponents.ShareButton
            url={getStringValue(mergedConfig.url, "")}
            {...(mergedConfig as Record<string, unknown>)}
          />
        );
      case "qr-code":
        return (
          <BIComponents.QRCode
            url={getStringValue(mergedConfig.url, "")}
            {...(mergedConfig as Record<string, unknown>)}
          />
        );
      case "export-pdf":
        return (
          <BIComponents.ExportPDF
            onExport={
              typeof mergedConfig.onExport === "function"
                ? (mergedConfig.onExport as () => void | Promise<void>)
                : () => {}
            }
            {...(mergedConfig as Record<string, unknown>)}
          />
        );

      // AI Prompt & Feedback
      case "prompt-input":
        return (
          <BIComponents.PromptInput
            {...(mergedConfig as Record<string, unknown>)}
          />
        );
      case "regenerate-button":
        return (
          <BIComponents.RegenerateButton
            onRegenerate={
              typeof mergedConfig.onRegenerate === "function"
                ? (mergedConfig.onRegenerate as () => void | Promise<void>)
                : () => {}
            }
            {...(mergedConfig as Record<string, unknown>)}
          />
        );
      case "feedback-thumbs":
        return (
          <BIComponents.FeedbackThumbs
            {...(mergedConfig as Record<string, unknown>)}
          />
        );
      case "edit-prompt":
        return (
          <BIComponents.EditPrompt
            originalPrompt={getStringValue(mergedConfig.originalPrompt, "")}
            onSubmit={
              typeof mergedConfig.onSubmit === "function"
                ? (mergedConfig.onSubmit as (
                    newPrompt: string,
                  ) => void | Promise<void>)
                : () => {}
            }
            {...(mergedConfig as Record<string, unknown>)}
          />
        );
      case "qa":
        return (
          <BIComponents.QA {...(mergedConfig as Record<string, unknown>)} />
        );

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

// Helper function to safely extract string value from config
function getStringValue(value: unknown, defaultValue: string): string {
  return typeof value === "string" ? value : defaultValue;
}

// Helper function to safely extract number value from config
function getNumberValue(value: unknown, defaultValue: number): number {
  return typeof value === "number" ? value : defaultValue;
}

// Helper function to safely extract string or number value from config
function getStringOrNumberValue(
  value: unknown,
  defaultValue: string | number,
): string | number {
  return typeof value === "string" || typeof value === "number"
    ? value
    : defaultValue;
}

// Helper function to safely extract string array value from config
function getStringArrayValue(value: unknown, defaultValue: string[]): string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string")
    ? value
    : defaultValue;
}

// Helper function to safely extract array value from config
function getArrayValue<T>(value: unknown, defaultValue: T[]): T[] {
  return Array.isArray(value) ? value : defaultValue;
}

// Helper function to generate sample data based on field names
function generateSampleData(
  xKey: string,
  yKeys: string[],
): Array<Record<string, string | number>> {
  const sampleCategories = ["A", "B", "C", "D", "E", "F"];
  const sampleMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const sampleDates = [
    "2024-01",
    "2024-02",
    "2024-03",
    "2024-04",
    "2024-05",
    "2024-06",
  ];

  // Determine x-axis values based on key name
  let xValues: string[];
  if (xKey.toLowerCase().includes("month")) {
    xValues = sampleMonths;
  } else if (
    xKey.toLowerCase().includes("date") ||
    xKey.toLowerCase().includes("time")
  ) {
    xValues = sampleDates;
  } else if (
    xKey.toLowerCase().includes("category") ||
    xKey.toLowerCase().includes("name")
  ) {
    xValues = sampleCategories;
  } else {
    xValues = sampleCategories; // default
  }

  // Generate data points
  return xValues.map((xValue) => {
    const dataPoint: Record<string, string | number> = { [xKey]: xValue };

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
