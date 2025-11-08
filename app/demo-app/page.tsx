"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DollarSign, ShoppingCart, TrendingUp, Users } from "lucide-react";
import * as React from "react";

// Import all BI components
import {
  AICommentary,
  AnomalyBadge,
  AreaChart,
  BarChart,
  BulletChart,
  createSortableHeader,
  // Data Display
  DataTable,
  // Filters
  DateRangePicker,
  DonutChart,
  EditPrompt,
  // Share/Embed
  EmbedCode,
  ExportPDF,
  FeedbackThumbs,
  // Advanced Analytics
  ForecastLine,
  FunnelChart,
  Gauge,
  GridItem,
  // Layout
  GridLayout,
  Heatmap,
  // Insights
  InsightText,
  // Metrics
  KPICard,
  // Charts
  LineChart,
  MetricCard,
  MultiSelect,
  PieChart,
  ProgressBar,
  // AI Components
  PromptInput,
  RadarChart,
  RegenerateButton,
  SearchInput,
  Section,
  ShareButton,
  Sparkline,
  StatChange,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TreeMap,
  TrendLabel,
} from "@/components/bi";

/**
 * Demo page showcasing all InsightFlow BI components
 */
export default function DemoPage() {
  const [searchValue, setSearchValue] = React.useState("");
  const [selectedFrameworks, setSelectedFrameworks] = React.useState<string[]>(
    [],
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-2">InsightFlow BI Components</h1>
          <p className="text-muted-foreground text-lg">
            Complete component library showcase - 37+ production-ready
            components
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* ========================================
            1. CORE CHARTS
        ======================================== */}
        <Section
          title="📊 Core Charts"
          description="Time series, comparisons, and part-to-whole visualizations"
        >
          <GridLayout cols={2} gap="lg">
            <LineChart
              data={sampleTimeSeriesData}
              xKey="month"
              yKeys={["revenue", "profit"]}
              title="Line Chart"
              description="Time series with multiple lines"
            />

            <BarChart
              data={sampleCategoryData}
              xKey="category"
              yKeys={["sales"]}
              title="Bar Chart"
              description="Vertical bar comparison"
            />

            <AreaChart
              data={sampleTimeSeriesData}
              xKey="month"
              yKeys={["revenue", "profit"]}
              title="Area Chart"
              description="Cumulative trends"
              stacked={true}
            />

            <GridItem>
              <GridLayout cols={2} gap="md">
                <PieChart
                  data={samplePieData}
                  nameKey="name"
                  valueKey="value"
                  title="Pie Chart"
                  description="Part-to-whole"
                />

                <DonutChart
                  data={samplePieData}
                  nameKey="name"
                  valueKey="value"
                  title="Donut Chart"
                  description="With hollow center"
                />
              </GridLayout>
            </GridItem>
          </GridLayout>
        </Section>

        {/* ========================================
            2. METRICS & KPIs
        ======================================== */}
        <Section
          title="📈 Metrics & KPIs"
          description="Key performance indicators and metric displays"
        >
          <GridLayout cols={4} gap="md">
            <KPICard
              value="$45,231"
              label="Total Revenue"
              change={12.5}
              changeLabel="vs last month"
              icon={DollarSign}
            />

            <KPICard
              value="2,350"
              label="Active Users"
              change={-5.2}
              changeLabel="vs last month"
              icon={Users}
            />

            <MetricCard
              value="23.8"
              label="Conversion Rate"
              suffix="%"
              icon={TrendingUp}
              valueColor="text-green-600"
            />

            <MetricCard
              value="1,234"
              label="Total Orders"
              icon={ShoppingCart}
              description="Last 30 days"
            />
          </GridLayout>

          <div className="mt-8">
            <GridLayout cols={3} gap="md">
              <div className="p-6 border rounded-lg">
                <h3 className="text-sm font-semibold mb-3">Sparkline - Line</h3>
                <Sparkline
                  data={[20, 30, 25, 40, 35, 50, 45, 60, 55]}
                  type="line"
                  color="#10b981"
                  height={60}
                  width={200}
                />
                <div className="mt-3">
                  <StatChange value={18.5} label="vs last week" />
                </div>
              </div>

              <div className="p-6 border rounded-lg">
                <h3 className="text-sm font-semibold mb-3">Sparkline - Area</h3>
                <Sparkline
                  data={[15, 22, 18, 28, 32, 40, 38, 45, 42]}
                  type="area"
                  color="#3b82f6"
                  height={60}
                  width={200}
                />
                <div className="mt-3">
                  <StatChange value={-3.2} label="vs last week" />
                </div>
              </div>

              <div className="p-6 border rounded-lg">
                <h3 className="text-sm font-semibold mb-3">Progress Bar</h3>
                <ProgressBar
                  value={75}
                  max={100}
                  label="Goal Progress"
                  variant="success"
                  asCard={false}
                />
                <div className="mt-3">
                  <TrendLabel trend="up" />
                </div>
              </div>
            </GridLayout>
          </div>
        </Section>

        {/* ========================================
            3. ADVANCED ANALYTICS
        ======================================== */}
        <Section
          title="🔬 Advanced Analytics"
          description="Complex visualizations and specialized charts"
        >
          <Tabs defaultValue="forecast" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="forecast">Forecast</TabsTrigger>
              <TabsTrigger value="funnel">Funnel</TabsTrigger>
              <TabsTrigger value="gauge">Gauge</TabsTrigger>
              <TabsTrigger value="radar">Radar</TabsTrigger>
              <TabsTrigger value="more">More</TabsTrigger>
            </TabsList>

            <TabsContent value="forecast" className="space-y-4">
              <ForecastLine
                historicalData={sampleTimeSeriesData.slice(0, 4)}
                forecastData={sampleForecastData}
                xKey="month"
                yKey="revenue"
                title="Revenue Forecast"
                description="AI-predicted future values"
                showConfidenceInterval={true}
              />
            </TabsContent>

            <TabsContent value="funnel" className="space-y-4">
              <GridLayout cols={2} gap="lg">
                <FunnelChart
                  data={sampleFunnelData}
                  title="Conversion Funnel"
                  description="User journey stages"
                />

                <BulletChart
                  value={75}
                  target={100}
                  label="Q4 Sales Target"
                  unit="K"
                  title="Bullet Chart"
                  description="Target vs actual performance"
                />
              </GridLayout>
            </TabsContent>

            <TabsContent value="gauge" className="space-y-4">
              <GridLayout cols={2} gap="lg">
                <Gauge
                  value={75}
                  max={100}
                  title="Performance Score"
                  label="Overall Rating"
                  unit="%"
                />

                <Gauge
                  value={42}
                  max={100}
                  title="System Health"
                  label="Server Status"
                  unit="%"
                />
              </GridLayout>
            </TabsContent>

            <TabsContent value="radar" className="space-y-4">
              <RadarChart
                data={sampleRadarData}
                categoryKey="subject"
                valueKeys={["score", "average"]}
                title="Performance Radar"
                description="Multi-dimensional comparison"
              />
            </TabsContent>

            <TabsContent value="more" className="space-y-4">
              <GridLayout cols={2} gap="lg">
                <Heatmap
                  data={sampleHeatmapData}
                  xLabels={["Mon", "Tue", "Wed", "Thu", "Fri"]}
                  yLabels={["Morning", "Afternoon", "Evening"]}
                  title="Activity Heatmap"
                  colorScale="blue"
                  showValues={true}
                />

                <TreeMap
                  data={sampleTreemapData}
                  title="Market Share"
                  description="Product distribution"
                />
              </GridLayout>
            </TabsContent>
          </Tabs>
        </Section>

        {/* ========================================
            4. DATA TABLE
        ======================================== */}
        <Section
          title="📋 Data Table"
          description="Sortable, filterable table with TanStack Table v8"
        >
          <DataTable
            columns={tableColumns}
            data={sampleTableData}
            title="Recent Transactions"
            filterable={true}
            filterColumn="email"
            filterPlaceholder="Filter by email..."
            pagination={true}
            pageSize={5}
            columnVisibility={true}
          />
        </Section>

        {/* ========================================
            5. INSIGHTS & TEXT
        ======================================== */}
        <Section
          title="💡 Insights & Text Components"
          description="AI-generated insights and trend indicators"
        >
          <div className="space-y-6">
            <AICommentary
              title="Performance Analysis"
              content="Based on the data trends from the last quarter, there is a strong positive correlation between marketing spend and revenue growth. The ROI has improved by 18% quarter-over-quarter, indicating that our current strategy is working effectively."
              summary="Marketing investments are yielding significant returns"
              highlights={[
                "18% ROI improvement over Q3",
                "Strong correlation between spend and revenue",
                "Recommend increasing budget by 15% for Q1",
              ]}
              confidence="High (95%)"
            />

            <GridLayout cols={2} gap="lg">
              <div className="p-6 border rounded-lg space-y-4">
                <h3 className="font-semibold">Insight Text Examples</h3>
                <InsightText
                  text="Sales increased by 23% compared to last quarter"
                  type="positive"
                />
                <InsightText
                  text="Customer churn rate is above target threshold"
                  type="negative"
                />
                <InsightText
                  text="Average order value remains stable at $85.50"
                  type="neutral"
                />
                <InsightText
                  text="New feature adoption rate: 67% of active users"
                  type="info"
                />
              </div>

              <div className="p-6 border rounded-lg space-y-4">
                <h3 className="font-semibold">Trend & Change Indicators</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <TrendLabel trend="up" />
                    <StatChange value={12.5} label="vs last month" />
                  </div>
                  <div className="flex items-center gap-3">
                    <TrendLabel trend="down" />
                    <StatChange value={-8.3} label="vs last month" />
                  </div>
                  <div className="flex items-center gap-3">
                    <TrendLabel trend="stable" />
                    <StatChange value={0.5} label="vs last month" />
                  </div>
                  <AnomalyBadge
                    label="Unusual Traffic"
                    severity="high"
                    value={245}
                    description="+245% from average"
                  />
                  <AnomalyBadge
                    label="Spike Detected"
                    severity="medium"
                    value={87}
                  />
                </div>
              </div>
            </GridLayout>
          </div>
        </Section>

        {/* ========================================
            6. FILTERS & INPUTS
        ======================================== */}
        <Section
          title="🔍 Filters & Input Components"
          description="Search, select, and date range filtering"
        >
          <GridLayout cols={3} gap="lg">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Search Input</h3>
              <SearchInput
                value={searchValue}
                onChange={setSearchValue}
                placeholder="Search products..."
              />
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Multi Select</h3>
              <MultiSelect
                options={frameworkOptions}
                value={selectedFrameworks}
                onChange={setSelectedFrameworks}
                placeholder="Select frameworks..."
              />
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Date Range Picker</h3>
              <DateRangePicker placeholder="Pick a date range" />
            </div>
          </GridLayout>
        </Section>

        {/* ========================================
            7. AI COMPONENTS
        ======================================== */}
        <Section
          title="🤖 AI Prompt & Feedback"
          description="AI-powered dashboard generation and feedback"
        >
          <GridLayout cols={1} gap="lg">
            <PromptInput
              placeholder="Describe the dashboard you want to create..."
              onSubmit={(prompt) => console.log("Generate:", prompt)}
              suggestions={[
                "Show me sales trends for the last 6 months",
                "Create a customer demographics breakdown",
                "Display top products by revenue",
              ]}
            />

            <div className="p-6 border rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">AI Output Actions</h3>
                <div className="flex gap-2">
                  <RegenerateButton
                    onRegenerate={() => console.log("Regenerate")}
                  />
                  <EditPrompt
                    originalPrompt="Show me sales data"
                    onSubmit={(prompt) => console.log("Edit:", prompt)}
                  />
                </div>
              </div>
              <FeedbackThumbs
                onFeedback={(feedback) => console.log("Feedback:", feedback)}
              />
            </div>
          </GridLayout>
        </Section>

        {/* ========================================
            8. SHARE & EMBED
        ======================================== */}
        <Section
          title="📤 Share & Embed"
          description="Export, share, and embed functionality"
        >
          <GridLayout cols={2} gap="lg">
            <EmbedCode
              url="https://example.com/dashboard/demo"
              width={1200}
              height={800}
              title="Embed Code"
              description="Copy embed code for your dashboard"
            />

            <div className="p-6 border rounded-lg space-y-4">
              <h3 className="font-semibold mb-4">Sharing Options</h3>
              <div className="flex gap-3">
                <ShareButton
                  url="https://example.com/dashboard/demo"
                  title="InsightFlow Dashboard"
                  description="Check out this analytics dashboard"
                />
                <ExportPDF
                  onExport={() => console.log("Export PDF")}
                  filename="dashboard-report.pdf"
                />
              </div>

              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-muted-foreground mb-3">
                  QR Code for mobile access (requires API)
                </p>
                <div className="text-xs text-muted-foreground">
                  Note: QR Code component available - requires QR generation
                  service
                </div>
              </div>
            </div>
          </GridLayout>
        </Section>

        {/* ========================================
            9. LAYOUT COMPONENTS
        ======================================== */}
        <Section
          title="📐 Layout Components"
          description="Grid systems and responsive layouts"
        >
          <div className="p-6 border rounded-lg space-y-4">
            <h3 className="font-semibold">GridLayout Examples</h3>

            <div className="space-y-6">
              <div>
                <p className="text-sm text-muted-foreground mb-2">4 Columns</p>
                <GridLayout cols={4} gap="sm">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-muted p-4 rounded text-center">
                      Col {i}
                    </div>
                  ))}
                </GridLayout>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Custom Column Spans
                </p>
                <GridLayout cols={4} gap="sm">
                  <GridItem colSpan={3}>
                    <div className="bg-primary/10 p-4 rounded text-center">
                      Spans 3 columns
                    </div>
                  </GridItem>
                  <GridItem colSpan={1}>
                    <div className="bg-muted p-4 rounded text-center">
                      1 col
                    </div>
                  </GridItem>
                </GridLayout>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  3 Columns (Responsive)
                </p>
                <GridLayout cols={3} gap="md">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-muted p-6 rounded text-center">
                      Card {i}
                    </div>
                  ))}
                </GridLayout>
              </div>
            </div>
          </div>
        </Section>

        {/* Footer */}
        <div className="py-12 text-center border-t">
          <h2 className="text-2xl font-bold mb-2">🎉 All Components Loaded!</h2>
          <p className="text-muted-foreground">
            37+ production-ready BI components • Full TypeScript • Dark Mode •
            Responsive
          </p>
          <div className="mt-4 flex gap-3 justify-center">
            <div className="text-sm">
              <span className="font-semibold">Total Components:</span> 37+
            </div>
            <div className="text-sm">
              <span className="font-semibold">Lines of Code:</span> ~5,000+
            </div>
            <div className="text-sm">
              <span className="font-semibold">TypeScript:</span> 100%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SAMPLE DATA
// ============================================================================

const sampleTimeSeriesData = [
  { month: "Jan", revenue: 4000, profit: 2400, expenses: 1600 },
  { month: "Feb", revenue: 3000, profit: 1398, expenses: 1602 },
  { month: "Mar", revenue: 2000, profit: 9800, expenses: 2200 },
  { month: "Apr", revenue: 2780, profit: 3908, expenses: 872 },
  { month: "May", revenue: 1890, profit: 4800, expenses: 1090 },
  { month: "Jun", revenue: 2390, profit: 3800, expenses: 590 },
];

const sampleCategoryData = [
  { category: "Electronics", sales: 45000 },
  { category: "Clothing", sales: 32000 },
  { category: "Food", sales: 28000 },
  { category: "Books", sales: 18000 },
];

const samplePieData = [
  { name: "Desktop", value: 400 },
  { name: "Mobile", value: 300 },
  { name: "Tablet", value: 200 },
  { name: "Other", value: 100 },
];

const sampleForecastData = [
  { month: "Jul", revenue: 3200, lower: 2800, upper: 3600 },
  { month: "Aug", revenue: 3800, lower: 3400, upper: 4200 },
  { month: "Sep", revenue: 4200, lower: 3800, upper: 4600 },
];

const sampleFunnelData = [
  { name: "Website Visitors", value: 10000 },
  { name: "Sign Ups", value: 5000 },
  { name: "Active Users", value: 2500 },
  { name: "Paid Subscribers", value: 500 },
];

const sampleRadarData = [
  { subject: "Performance", score: 90, average: 75 },
  { subject: "Reliability", score: 85, average: 80 },
  { subject: "Usability", score: 75, average: 70 },
  { subject: "Security", score: 95, average: 85 },
  { subject: "Scalability", score: 80, average: 75 },
];

const sampleHeatmapData = [
  { x: 0, y: 0, value: 45 },
  { x: 1, y: 0, value: 78 },
  { x: 2, y: 0, value: 62 },
  { x: 3, y: 0, value: 91 },
  { x: 4, y: 0, value: 55 },
  { x: 0, y: 1, value: 23 },
  { x: 1, y: 1, value: 91 },
  { x: 2, y: 1, value: 88 },
  { x: 3, y: 1, value: 67 },
  { x: 4, y: 1, value: 72 },
  { x: 0, y: 2, value: 34 },
  { x: 1, y: 2, value: 56 },
  { x: 2, y: 2, value: 45 },
  { x: 3, y: 2, value: 89 },
  { x: 4, y: 2, value: 93 },
];

const sampleTreemapData = [
  { name: "Product A", size: 4000 },
  { name: "Product B", size: 3000 },
  { name: "Product C", size: 2000 },
  { name: "Product D", size: 1000 },
];

interface Payment {
  id: string;
  amount: number;
  status: string;
  email: string;
}

const sampleTableData: Payment[] = [
  { id: "m5gr84i9", amount: 316, status: "success", email: "ken99@yahoo.com" },
  { id: "3u1reuv4", amount: 242, status: "success", email: "abe45@gmail.com" },
  {
    id: "derv1ws0",
    amount: 837,
    status: "processing",
    email: "monserrat44@gmail.com",
  },
  {
    id: "5kma53ae",
    amount: 874,
    status: "success",
    email: "silas22@gmail.com",
  },
  {
    id: "bhqecj4p",
    amount: 721,
    status: "failed",
    email: "carmella@hotmail.com",
  },
  {
    id: "jkasd823",
    amount: 456,
    status: "success",
    email: "john.doe@example.com",
  },
  {
    id: "mxcz9821",
    amount: 923,
    status: "processing",
    email: "jane.smith@example.com",
  },
];

const tableColumns: ColumnDef<Payment>[] = [
  {
    accessorKey: "email",
    header: createSortableHeader("Email"),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            status === "success"
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
              : status === "processing"
                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
          }`}
        >
          {status}
        </span>
      );
    },
  },
  {
    accessorKey: "amount",
    header: createSortableHeader("Amount"),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);
      return <div className="font-medium">{formatted}</div>;
    },
  },
];

const frameworkOptions = [
  { value: "react", label: "React" },
  { value: "vue", label: "Vue" },
  { value: "angular", label: "Angular" },
  { value: "svelte", label: "Svelte" },
  { value: "next", label: "Next.js" },
];
