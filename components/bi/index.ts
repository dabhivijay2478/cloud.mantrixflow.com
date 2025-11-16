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

export type { AreaChartProps } from "./charts/area-chart";
export { AreaChart } from "./charts/area-chart";
export type { BarChartProps } from "./charts/bar-chart";
export { BarChart } from "./charts/bar-chart";
export type { ClusteredBarChartProps } from "./charts/clustered-bar-chart";
export { ClusteredBarChart } from "./charts/clustered-bar-chart";
export type { ClusteredColumnChartProps } from "./charts/clustered-column-chart";
export { ClusteredColumnChart } from "./charts/clustered-column-chart";
export type { DonutChartProps } from "./charts/donut-chart";
export { DonutChart } from "./charts/donut-chart";
export type { LineChartProps } from "./charts/line-chart";
export { LineChart } from "./charts/line-chart";
export type { ChartSkeletonProps } from "./charts/chart-skeleton";
export { ChartSkeleton } from "./charts/chart-skeleton";
export type { LineStackedColumnChartProps } from "./charts/line-stacked-column-chart";
export { LineStackedColumnChart } from "./charts/line-stacked-column-chart";
export type { PieChartProps } from "./charts/pie-chart";
export { PieChart } from "./charts/pie-chart";
export type { RibbonChartProps } from "./charts/ribbon-chart";
export { RibbonChart } from "./charts/ribbon-chart";
export type { ScatterChartProps } from "./charts/scatter-chart";
export { ScatterChart } from "./charts/scatter-chart";
export type { StackedAreaChartProps } from "./charts/stacked-area-chart";
export { StackedAreaChart } from "./charts/stacked-area-chart";
export type { StackedBarChartProps } from "./charts/stacked-bar-chart";
export { StackedBarChart } from "./charts/stacked-bar-chart";
export type { StackedColumnChartProps } from "./charts/stacked-column-chart";
export { StackedColumnChart } from "./charts/stacked-column-chart";
export type {
  WaterfallChartProps,
  WaterfallDataPoint,
} from "./charts/waterfall-chart";
export { WaterfallChart } from "./charts/waterfall-chart";

// ============================================================================
// Core BI Components - Metrics
// ============================================================================

export type { KPICardProps } from "./metrics/kpi-card";
export { KPICard } from "./metrics/kpi-card";
export type { MetricCardProps } from "./metrics/metric-card";
export { MetricCard } from "./metrics/metric-card";
export type { CardRow, MultiRowCardProps } from "./metrics/multi-row-card";
export { MultiRowCard } from "./metrics/multi-row-card";
export type { ProgressBarProps } from "./metrics/progress-bar";
export { ProgressBar } from "./metrics/progress-bar";
export type { SparklineProps, SparklineType } from "./metrics/sparkline";
export { Sparkline } from "./metrics/sparkline";

// ============================================================================
// Core BI Components - Data Display
// ============================================================================

export type { DataTableProps } from "./data-display/data-table";
export { createSortableHeader, DataTable } from "./data-display/data-table";
export type { SQLEditorProps } from "./data-display/sql-editor";
export { SQLEditor } from "./data-display/sql-editor";
export type { SQLResultViewerProps } from "./data-display/sql-result-viewer";
export { SQLResultViewer } from "./data-display/sql-result-viewer";
export type { TableNavigationProps } from "./data-display/table-navigation";
export { TableNavigation } from "./data-display/table-navigation";

// ============================================================================
// Layout & Container Components
// ============================================================================

export type { SectionProps } from "@/components/shared/layout/section";
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
export type { GridItemProps, GridLayoutProps } from "./layout/grid-layout";
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
export type { DateRangePickerProps } from "./filters/date-range-picker";
export { DateRangePicker, dateRangePresets } from "./filters/date-range-picker";
export type { MultiSelectProps, SelectOption } from "./filters/multi-select";
export { MultiSelect } from "./filters/multi-select";
export type { SearchInputProps } from "./filters/search-input";
export { SearchInput } from "./filters/search-input";
export type { SlicerOption, SlicerProps, SlicerType } from "./filters/slicer";
export { Slicer } from "./filters/slicer";

// ============================================================================
// Advanced Analytics Components
// ============================================================================

export type {
  AnomalyBadgeProps,
  AnomalySeverity,
} from "./advanced/anomaly-badge";
export { AnomalyBadge } from "./advanced/anomaly-badge";
export type { BulletChartProps, BulletZone } from "./advanced/bullet-chart";
export { BulletChart } from "./advanced/bullet-chart";
export type { FilledMapProps, MapRegion } from "./advanced/filled-map";
export { FilledMap } from "./advanced/filled-map";
export type { ForecastLineProps } from "./advanced/forecast-line";
export { ForecastLine } from "./advanced/forecast-line";
export type { FunnelChartProps, FunnelStage } from "./advanced/funnel-chart";
export { FunnelChart } from "./advanced/funnel-chart";
export type { GaugeProps, GaugeThreshold } from "./advanced/gauge";
export { Gauge } from "./advanced/gauge";
export type { HeatmapCell, HeatmapProps } from "./advanced/heatmap";
export { Heatmap } from "./advanced/heatmap";
export type {
  BasicLeafletMapProps,
  City,
  LeafletMapBubblesProps,
  LeafletMapChangeCityProps,
  LeafletMapCustomPinProps,
  LeafletMapCustomPopoverProps,
  LeafletMapGrayscaleProps,
  LeafletMapWithPinProps,
  LeafletMarker,
} from "./advanced/leaflet-map";
// Leaflet Map Components
export {
  BasicLeafletMap,
  LeafletMapBubbles,
  LeafletMapChangeCity,
  LeafletMapCustomPin,
  LeafletMapCustomPopover,
  LeafletMapGrayscale,
  LeafletMapWithPin,
} from "./advanced/leaflet-map";
export type { MapMarker, MapProps } from "./advanced/map";
export { MapComponent as Map } from "./advanced/map";
export type { MatrixProps } from "./advanced/matrix";
export { Matrix } from "./advanced/matrix";
export type { RadarChartProps } from "./advanced/radar-chart";
export { RadarChart } from "./advanced/radar-chart";
export type {
  SankeyDiagramProps,
  SankeyLink,
  SankeyNode,
} from "./advanced/sankey-diagram";
export { SankeyDiagram } from "./advanced/sankey-diagram";
export type { TreeMapNode, TreeMapProps } from "./advanced/treemap";
export { TreeMap } from "./advanced/treemap";

// ============================================================================
// Text & Insight Components
// ============================================================================

export type { AICommentaryProps } from "./insights/ai-commentary";
export { AICommentary } from "./insights/ai-commentary";
export type { InsightTextProps, InsightType } from "./insights/insight-text";
export { InsightText } from "./insights/insight-text";
export type { StatChangeProps, StatChangeSize } from "./insights/stat-change";
export { StatChange } from "./insights/stat-change";
export type {
  TrendDirection,
  TrendLabelProps,
  TrendLabelVariant,
} from "./insights/trend-label";
export { TrendLabel } from "./insights/trend-label";

// ============================================================================
// Embed & Share Components
// ============================================================================

export type { EmbedCodeProps } from "./share/embed-code";
export { EmbedCode } from "./share/embed-code";
export type {
  ExportPDFProps,
  ExportPDFSize,
  ExportPDFVariant,
} from "./share/export-pdf";
export { ExportPDF } from "./share/export-pdf";
export type { QRCodeProps } from "./share/qr-code";
export { QRCode } from "./share/qr-code";
export type {
  ShareButtonProps,
  ShareButtonSize,
  ShareButtonVariant,
} from "./share/share-button";
export { ShareButton } from "./share/share-button";

// ============================================================================
// AI Prompt & Feedback Components
// ============================================================================

export type {
  EditPromptProps,
  EditPromptSize,
  EditPromptVariant,
} from "./ai/edit-prompt";
export { EditPrompt } from "./ai/edit-prompt";
export type {
  FeedbackThumbsProps,
  FeedbackThumbsSize,
  FeedbackValue,
} from "./ai/feedback-thumbs";
export { FeedbackThumbs } from "./ai/feedback-thumbs";
export type { PaginatedReportProps, ReportColumn } from "./ai/paginated-report";
export { PaginatedReport } from "./ai/paginated-report";
export type { PromptInputProps } from "./ai/prompt-input";
export { PromptInput } from "./ai/prompt-input";
export type { QAAnswer, QAProps } from "./ai/qa";
export { QA } from "./ai/qa";
export type {
  RegenerateButtonProps,
  RegenerateButtonSize,
  RegenerateButtonVariant,
} from "./ai/regenerate-button";
export { RegenerateButton } from "./ai/regenerate-button";

// ============================================================================
// Example & Demo Components
// ============================================================================

export { ExampleDashboard } from "./examples/example-dashboard";
