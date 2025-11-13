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

export { LineChart } from "./line-chart";
export type { LineChartProps } from "./line-chart";

export { BarChart } from "./bar-chart";
export type { BarChartProps } from "./bar-chart";

export { AreaChart } from "./area-chart";
export type { AreaChartProps } from "./area-chart";

export { PieChart } from "./pie-chart";
export type { PieChartProps } from "./pie-chart";

export { DonutChart } from "./donut-chart";
export type { DonutChartProps } from "./donut-chart";

export { StackedBarChart } from "./stacked-bar-chart";
export type { StackedBarChartProps } from "./stacked-bar-chart";

export { StackedColumnChart } from "./stacked-column-chart";
export type { StackedColumnChartProps } from "./stacked-column-chart";

export { ClusteredBarChart } from "./clustered-bar-chart";
export type { ClusteredBarChartProps } from "./clustered-bar-chart";

export { ClusteredColumnChart } from "./clustered-column-chart";
export type { ClusteredColumnChartProps } from "./clustered-column-chart";

export { StackedAreaChart } from "./stacked-area-chart";
export type { StackedAreaChartProps } from "./stacked-area-chart";

export { LineStackedColumnChart } from "./line-stacked-column-chart";
export type { LineStackedColumnChartProps } from "./line-stacked-column-chart";

export { RibbonChart } from "./ribbon-chart";
export type { RibbonChartProps } from "./ribbon-chart";

export { WaterfallChart } from "./waterfall-chart";
export type { WaterfallChartProps, WaterfallDataPoint } from "./waterfall-chart";

export { ScatterChart } from "./scatter-chart";
export type { ScatterChartProps } from "./scatter-chart";

// ============================================================================
// Core BI Components - Metrics
// ============================================================================

export { KPICard } from "./kpi-card";
export type { KPICardProps } from "./kpi-card";

export { MultiRowCard } from "./multi-row-card";
export type { MultiRowCardProps, CardRow } from "./multi-row-card";

export { Sparkline } from "./sparkline";
export type { SparklineProps, SparklineType } from "./sparkline";

export { MetricCard } from "./metric-card";
export type { MetricCardProps } from "./metric-card";

export { ProgressBar } from "./progress-bar";
export type { ProgressBarProps } from "./progress-bar";

// ============================================================================
// Core BI Components - Data Display
// ============================================================================

export { DataTable, createSortableHeader } from "./data-table";
export type { DataTableProps } from "./data-table";

export { SQLEditor } from "./sql-editor";
export type { SQLEditorProps } from "./sql-editor";

export { SQLResultViewer } from "./sql-result-viewer";
export type { SQLResultViewerProps } from "./sql-result-viewer";

export { TableNavigation } from "./table-navigation";
export type { TableNavigationProps } from "./table-navigation";

// ============================================================================
// Layout & Container Components
// ============================================================================

export { GridLayout, GridItem } from "./grid-layout";
export type { GridLayoutProps, GridItemProps } from "./grid-layout";

export { Section } from "./section";
export type { SectionProps } from "./section";

// Re-export commonly used Shadcn components for BI layouts
export { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
export { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
export { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

// ============================================================================
// Input & Filter Components
// ============================================================================

export { DateRangePicker, dateRangePresets } from "./date-range-picker";
export type { DateRangePickerProps } from "./date-range-picker";

export { MultiSelect } from "./multi-select";
export type { MultiSelectProps, SelectOption } from "./multi-select";

export { SearchInput } from "./search-input";
export type { SearchInputProps } from "./search-input";

export { Slicer } from "./slicer";
export type { SlicerProps, SlicerOption, SlicerType } from "./slicer";

// Re-export Shadcn form components for filters
export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
export { Switch } from "@/components/ui/switch";
export { Slider } from "@/components/ui/slider";

// ============================================================================
// Advanced Analytics Components
// ============================================================================

export { ForecastLine } from "./forecast-line";
export type { ForecastLineProps } from "./forecast-line";

export { AnomalyBadge } from "./anomaly-badge";
export type { AnomalyBadgeProps, AnomalySeverity } from "./anomaly-badge";

export { FunnelChart } from "./funnel-chart";
export type { FunnelChartProps, FunnelStage } from "./funnel-chart";

export { Heatmap } from "./heatmap";
export type { HeatmapProps, HeatmapCell } from "./heatmap";

export { SankeyDiagram } from "./sankey-diagram";
export type { SankeyDiagramProps, SankeyNode, SankeyLink } from "./sankey-diagram";

export { TreeMap } from "./treemap";
export type { TreeMapProps, TreeMapNode } from "./treemap";

export { RadarChart } from "./radar-chart";
export type { RadarChartProps } from "./radar-chart";

export { Gauge } from "./gauge";
export type { GaugeProps, GaugeThreshold } from "./gauge";

export { BulletChart } from "./bullet-chart";
export type { BulletChartProps, BulletZone } from "./bullet-chart";

export { Map } from "./map";
export type { MapProps, MapMarker } from "./map";

export { FilledMap } from "./filled-map";
export type { FilledMapProps, MapRegion } from "./filled-map";

// Leaflet Map Components
export {
  BasicLeafletMap,
  LeafletMapWithPin,
  LeafletMapGrayscale,
  LeafletMapCustomPin,
  LeafletMapCustomPopover,
  LeafletMapChangeCity,
  LeafletMapBubbles,
} from "./leaflet-map";
export type {
  BasicLeafletMapProps,
  LeafletMapWithPinProps,
  LeafletMapGrayscaleProps,
  LeafletMapCustomPinProps,
  LeafletMapCustomPopoverProps,
  LeafletMapChangeCityProps,
  LeafletMapBubblesProps,
  LeafletMarker,
  City,
} from "./leaflet-map";

export { Matrix } from "./matrix";
export type { MatrixProps } from "./matrix";

// ============================================================================
// Text & Insight Components
// ============================================================================

export { InsightText } from "./insight-text";
export type { InsightTextProps, InsightType } from "./insight-text";

export { AICommentary } from "./ai-commentary";
export type { AICommentaryProps } from "./ai-commentary";

export { StatChange } from "./stat-change";
export type { StatChangeProps, StatChangeSize } from "./stat-change";

export { TrendLabel } from "./trend-label";
export type { TrendLabelProps, TrendDirection, TrendLabelVariant } from "./trend-label";

// ============================================================================
// Embed & Share Components
// ============================================================================

export { EmbedCode } from "./embed-code";
export type { EmbedCodeProps } from "./embed-code";

export { ShareButton } from "./share-button";
export type { ShareButtonProps, ShareButtonVariant, ShareButtonSize } from "./share-button";

export { QRCode } from "./qr-code";
export type { QRCodeProps } from "./qr-code";

export { ExportPDF } from "./export-pdf";
export type { ExportPDFProps, ExportPDFVariant, ExportPDFSize } from "./export-pdf";

// ============================================================================
// AI Prompt & Feedback Components
// ============================================================================

export { PromptInput } from "./prompt-input";
export type { PromptInputProps } from "./prompt-input";

export { RegenerateButton } from "./regenerate-button";
export type { RegenerateButtonProps, RegenerateButtonVariant, RegenerateButtonSize } from "./regenerate-button";

export { FeedbackThumbs } from "./feedback-thumbs";
export type { FeedbackThumbsProps, FeedbackThumbsSize, FeedbackValue } from "./feedback-thumbs";

export { EditPrompt } from "./edit-prompt";
export type { EditPromptProps, EditPromptVariant, EditPromptSize } from "./edit-prompt";

export { QA } from "./qa";
export type { QAProps, QAAnswer } from "./qa";

export { PaginatedReport } from "./paginated-report";
export type { PaginatedReportProps, ReportColumn } from "./paginated-report";

// ============================================================================
// Example & Demo Components
// ============================================================================

export { ExampleDashboard } from "./example-dashboard";
