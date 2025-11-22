/**
 * InsightFlow BI Components Library
 *
 * A comprehensive collection of business intelligence components built with
 * Shadcn/UI, Tailwind CSS, TypeScript, and Recharts.
 *
 * @module components/bi
 */
// ============================================================================
// Core BI Components - Charts
// ============================================================================
export { AreaChart } from "./charts/area-chart";
export { BarChart } from "./charts/bar-chart";
export { ChartSkeleton } from "./charts/chart-skeleton";
export { ClusteredBarChart } from "./charts/clustered-bar-chart";
export { ClusteredColumnChart } from "./charts/clustered-column-chart";
export { DonutChart } from "./charts/donut-chart";
export { WaterfallChart } from "./charts/waterfall-chart";
export { LineChart } from "./charts/line-chart";
export { LineStackedColumnChart } from "./charts/line-stacked-column-chart";
export { PieChart } from "./charts/pie-chart";
export { RibbonChart } from "./charts/ribbon-chart";
export { ScatterChart } from "./charts/scatter-chart";
export { StackedAreaChart } from "./charts/stacked-area-chart";
export { StackedBarChart } from "./charts/stacked-bar-chart";
export { StackedColumnChart } from "./charts/stacked-column-chart";
// export { WaterfallChart } from "./charts/waterfall-chart";
// ============================================================================
// Core BI Components - Metrics
// ============================================================================
export { KPICard } from "./metrics/kpi-card";
export { MetricCard } from "./metrics/metric-card";
export { MultiRowCard } from "./metrics/multi-row-card";
export { ProgressBar } from "./metrics/progress-bar";
export { Sparkline } from "./metrics/sparkline";
// ============================================================================
// Core BI Components - Data Display
// ============================================================================
export { createSortableHeader, DataTable } from "./data-display/data-table";
export { SQLEditor } from "./data-display/sql-editor";
export { SQLResultViewer } from "./data-display/sql-result-viewer";
export { TableNavigation } from "./data-display/table-navigation";
// ============================================================================
// Layout & Container Components
// ============================================================================
// Re-export Section from shared components (moved for better organization)
export { Section } from "@/components/shared/layout/section";
export {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
export {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
export {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
// Re-export commonly used Shadcn components for BI layouts
export { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
export { GridItem, GridLayout } from "./layout/grid-layout";
// ============================================================================
// Input & Filter Components
// ============================================================================
// Re-export Shadcn form components for filters
export {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
export { Slider } from "@/components/ui/slider";
export { Switch } from "@/components/ui/switch";
export { DateRangePicker, dateRangePresets } from "./filters/date-range-picker";
export { MultiSelect } from "./filters/multi-select";
export { SearchInput } from "./filters/search-input";
export { Slicer } from "./filters/slicer";
// ============================================================================
// Advanced Analytics Components
// ============================================================================
export { AnomalyBadge } from "./advanced/anomaly-badge";
export { BulletChart } from "./advanced/bullet-chart";
export { FilledMap } from "./advanced/filled-map";
export { ForecastLine } from "./advanced/forecast-line";
export { FunnelChart } from "./advanced/funnel-chart";
export { Gauge } from "./metrics/gauge";
export { Heatmap } from "./advanced/heatmap";
// Leaflet Map Components
// TODO: Fix leaflet-map folder structure
/*
export {
  BasicLeafletMap,
  LeafletMapBubbles,
  LeafletMapChangeCity,
  LeafletMapCustomPin,
  LeafletMapCustomPopover,
  LeafletMapGrayscale,
  LeafletMapWithPin,
} from "./advanced/leaflet-map";
*/
export { Map } from "./advanced/map";
export { Matrix } from "./advanced/matrix";
// TODO: Fix radar-chart folder structure
// export { RadarChart } from "./advanced/radar-chart";
export { SankeyDiagram } from "./advanced/sankey-diagram";
export { TreeMap } from "./advanced/treemap";
// ============================================================================
// Text & Insight Components
// ============================================================================
export { AICommentary } from "./insights/ai-commentary";
export { InsightText } from "./insights/insight-text";
export { StatChange } from "./insights/stat-change";
export { TrendLabel } from "./insights/trend-label";
// ============================================================================
// Embed & Share Components
// ============================================================================
export { EmbedCode } from "./share/embed-code";
export { ExportPDF } from "./share/export-pdf";
export { QRCode } from "./share/qr-code";
export { ShareButton } from "./share/share-button";
// ============================================================================
// AI Prompt & Feedback Components
// ============================================================================
export { EditPrompt } from "./ai/edit-prompt";
export { FeedbackThumbs } from "./ai/feedback-thumbs";
export { PaginatedReport } from "./ai/paginated-report";
export { PromptInput } from "./ai/prompt-input";
export { QA } from "./ai/qa";
export { RegenerateButton } from "./ai/regenerate-button";
// ============================================================================
// Example & Demo Components
// ============================================================================
export { ExampleDashboard } from "./examples/example-dashboard";
