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

export type { AreaChartProps } from "./area-chart";
export { AreaChart } from "./area-chart";
export type { BarChartProps } from "./bar-chart";
export { BarChart } from "./bar-chart";
export type { ClusteredBarChartProps } from "./clustered-bar-chart";
export { ClusteredBarChart } from "./clustered-bar-chart";
export type { ClusteredColumnChartProps } from "./clustered-column-chart";
export { ClusteredColumnChart } from "./clustered-column-chart";
export type { DonutChartProps } from "./donut-chart";
export { DonutChart } from "./donut-chart";
export type { LineChartProps } from "./line-chart";
export { LineChart } from "./line-chart";
export type { LineStackedColumnChartProps } from "./line-stacked-column-chart";
export { LineStackedColumnChart } from "./line-stacked-column-chart";
export type { PieChartProps } from "./pie-chart";
export { PieChart } from "./pie-chart";
export type { RibbonChartProps } from "./ribbon-chart";
export { RibbonChart } from "./ribbon-chart";
export type { ScatterChartProps } from "./scatter-chart";
export { ScatterChart } from "./scatter-chart";
export type { StackedAreaChartProps } from "./stacked-area-chart";
export { StackedAreaChart } from "./stacked-area-chart";
export type { StackedBarChartProps } from "./stacked-bar-chart";
export { StackedBarChart } from "./stacked-bar-chart";
export type { StackedColumnChartProps } from "./stacked-column-chart";
export { StackedColumnChart } from "./stacked-column-chart";
export type {
  WaterfallChartProps,
  WaterfallDataPoint,
} from "./waterfall-chart";
export { WaterfallChart } from "./waterfall-chart";

// ============================================================================
// Core BI Components - Metrics
// ============================================================================

export type { KPICardProps } from "./kpi-card";
export { KPICard } from "./kpi-card";
export type { MetricCardProps } from "./metric-card";
export { MetricCard } from "./metric-card";
export type { CardRow, MultiRowCardProps } from "./multi-row-card";
export { MultiRowCard } from "./multi-row-card";
export type { ProgressBarProps } from "./progress-bar";
export { ProgressBar } from "./progress-bar";
export type { SparklineProps, SparklineType } from "./sparkline";
export { Sparkline } from "./sparkline";

// ============================================================================
// Core BI Components - Data Display
// ============================================================================

export type { DataTableProps } from "./data-table";
export { createSortableHeader, DataTable } from "./data-table";
export type { SQLEditorProps } from "./sql-editor";
export { SQLEditor } from "./sql-editor";
export type { SQLResultViewerProps } from "./sql-result-viewer";
export { SQLResultViewer } from "./sql-result-viewer";
export type { TableNavigationProps } from "./table-navigation";
export { TableNavigation } from "./table-navigation";

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
export type { GridItemProps, GridLayoutProps } from "./grid-layout";
export { GridItem, GridLayout } from "./grid-layout";

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
export type { DateRangePickerProps } from "./date-range-picker";
export { DateRangePicker, dateRangePresets } from "./date-range-picker";
export type { MultiSelectProps, SelectOption } from "./multi-select";
export { MultiSelect } from "./multi-select";
export type { SearchInputProps } from "./search-input";
export { SearchInput } from "./search-input";
export type { SlicerOption, SlicerProps, SlicerType } from "./slicer";
export { Slicer } from "./slicer";

// ============================================================================
// Advanced Analytics Components
// ============================================================================

export type { AnomalyBadgeProps, AnomalySeverity } from "./anomaly-badge";
export { AnomalyBadge } from "./anomaly-badge";
export type { BulletChartProps, BulletZone } from "./bullet-chart";
export { BulletChart } from "./bullet-chart";
export type { FilledMapProps, MapRegion } from "./filled-map";
export { FilledMap } from "./filled-map";
export type { ForecastLineProps } from "./forecast-line";
export { ForecastLine } from "./forecast-line";
export type { FunnelChartProps, FunnelStage } from "./funnel-chart";
export { FunnelChart } from "./funnel-chart";
export type { GaugeProps, GaugeThreshold } from "./gauge";
export { Gauge } from "./gauge";
export type { HeatmapCell, HeatmapProps } from "./heatmap";
export { Heatmap } from "./heatmap";
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
} from "./leaflet-map";
// Leaflet Map Components
export {
  BasicLeafletMap,
  LeafletMapBubbles,
  LeafletMapChangeCity,
  LeafletMapCustomPin,
  LeafletMapCustomPopover,
  LeafletMapGrayscale,
  LeafletMapWithPin,
} from "./leaflet-map";
export type { MapMarker, MapProps } from "./map";
export { MapComponent as Map } from "./map";
export type { MatrixProps } from "./matrix";
export { Matrix } from "./matrix";
export type { RadarChartProps } from "./radar-chart";
export { RadarChart } from "./radar-chart";
export type {
  SankeyDiagramProps,
  SankeyLink,
  SankeyNode,
} from "./sankey-diagram";
export { SankeyDiagram } from "./sankey-diagram";
export type { TreeMapNode, TreeMapProps } from "./treemap";
export { TreeMap } from "./treemap";

// ============================================================================
// Text & Insight Components
// ============================================================================

export type { AICommentaryProps } from "./ai-commentary";
export { AICommentary } from "./ai-commentary";
export type { InsightTextProps, InsightType } from "./insight-text";
export { InsightText } from "./insight-text";
export type { StatChangeProps, StatChangeSize } from "./stat-change";
export { StatChange } from "./stat-change";
export type {
  TrendDirection,
  TrendLabelProps,
  TrendLabelVariant,
} from "./trend-label";
export { TrendLabel } from "./trend-label";

// ============================================================================
// Embed & Share Components
// ============================================================================

export type { EmbedCodeProps } from "./embed-code";
export { EmbedCode } from "./embed-code";
export type {
  ExportPDFProps,
  ExportPDFSize,
  ExportPDFVariant,
} from "./export-pdf";
export { ExportPDF } from "./export-pdf";
export type { QRCodeProps } from "./qr-code";
export { QRCode } from "./qr-code";
export type {
  ShareButtonProps,
  ShareButtonSize,
  ShareButtonVariant,
} from "./share-button";
export { ShareButton } from "./share-button";

// ============================================================================
// AI Prompt & Feedback Components
// ============================================================================

export type {
  EditPromptProps,
  EditPromptSize,
  EditPromptVariant,
} from "./edit-prompt";
export { EditPrompt } from "./edit-prompt";
export type {
  FeedbackThumbsProps,
  FeedbackThumbsSize,
  FeedbackValue,
} from "./feedback-thumbs";
export { FeedbackThumbs } from "./feedback-thumbs";
export type { PaginatedReportProps, ReportColumn } from "./paginated-report";
export { PaginatedReport } from "./paginated-report";
export type { PromptInputProps } from "./prompt-input";
export { PromptInput } from "./prompt-input";
export type { QAAnswer, QAProps } from "./qa";
export { QA } from "./qa";
export type {
  RegenerateButtonProps,
  RegenerateButtonSize,
  RegenerateButtonVariant,
} from "./regenerate-button";
export { RegenerateButton } from "./regenerate-button";

// ============================================================================
// Example & Demo Components
// ============================================================================

export { ExampleDashboard } from "./example-dashboard";
