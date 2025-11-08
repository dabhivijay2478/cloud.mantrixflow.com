# InsightFlow BI Components Library

A comprehensive collection of business intelligence components built with **Shadcn/UI**, **Tailwind CSS**, **TypeScript**, and **Recharts**.

## 📦 Installation

All dependencies are already included in this project:
- `recharts` - Chart library
- `@tanstack/react-table` - Table functionality
- `lucide-react` - Icons
- All Shadcn/UI components

## 🎯 Quick Start

```tsx
import { LineChart, KPICard, DataTable } from "@/components/bi";

function Dashboard() {
  return (
    <div>
      <KPICard 
        value="$45,231" 
        label="Revenue" 
        change={12.5} 
      />
      
      <LineChart
        data={salesData}
        xKey="month"
        yKeys={["revenue", "profit"]}
        title="Sales Trends"
      />
    </div>
  );
}
```

## 📊 Component Categories

### 1. Core BI Components - Charts

**LineChart** - Time series visualization
```tsx
<LineChart
  data={[{ month: "Jan", revenue: 4000 }]}
  xKey="month"
  yKeys={["revenue"]}
  title="Revenue Trends"
/>
```

**BarChart** - Comparison view
```tsx
<BarChart
  data={data}
  xKey="category"
  yKeys={["value1", "value2"]}
  stacked={true}
/>
```

**AreaChart** - Cumulative trends
```tsx
<AreaChart
  data={data}
  xKey="date"
  yKeys={["users", "sessions"]}
  stacked={false}
/>
```

**PieChart** - Part-to-whole visualization
```tsx
<PieChart
  data={[{ name: "Desktop", value: 400 }]}
  nameKey="name"
  valueKey="value"
/>
```

**DonutChart** - Donut-style pie chart
```tsx
<DonutChart
  data={data}
  nameKey="category"
  valueKey="amount"
/>
```

### 2. Core BI Components - Metrics

**KPICard** - Key Performance Indicator
```tsx
<KPICard
  value="$45,231"
  label="Total Revenue"
  change={12.5}
  changeLabel="vs last month"
  icon={DollarSign}
/>
```

**MetricCard** - Big number display
```tsx
<MetricCard
  value="1,234"
  label="Active Users"
  prefix=""
  suffix="K"
  icon={Users}
/>
```

**Sparkline** - Inline mini-chart
```tsx
<Sparkline
  data={[10, 25, 15, 40, 30]}
  type="line"
  color="#10b981"
/>
```

**ProgressBar** - Percentage completion
```tsx
<ProgressBar
  value={75}
  max={100}
  label="Goal Progress"
  variant="success"
/>
```

### 3. Data Display

**DataTable** - Sortable, filterable table
```tsx
<DataTable
  columns={columns}
  data={payments}
  filterable={true}
  filterColumn="email"
  pagination={true}
/>
```

### 4. Layout & Container Components

**GridLayout** - Responsive grid system
```tsx
<GridLayout cols={3} gap="md">
  <GridItem colSpan={2}>Wide content</GridItem>
  <GridItem>Normal content</GridItem>
</GridLayout>
```

**Section** - Content grouping
```tsx
<Section
  title="Revenue Overview"
  description="Monthly metrics"
  action={<Button>Export</Button>}
>
  <LineChart data={data} />
</Section>
```

### 5. Input & Filter Components

**DateRangePicker** - Date range selection
```tsx
<DateRangePicker
  value={dateRange}
  onChange={setDateRange}
  placeholder="Pick a date range"
/>
```

**MultiSelect** - Multiple selection
```tsx
<MultiSelect
  options={frameworks}
  value={selected}
  onChange={setSelected}
/>
```

**SearchInput** - Search with clear
```tsx
<SearchInput
  value={search}
  onChange={setSearch}
  placeholder="Search..."
/>
```

### 6. Advanced Analytics Components

**ForecastLine** - AI predictions
```tsx
<ForecastLine
  historicalData={historical}
  forecastData={forecast}
  xKey="month"
  yKey="value"
  showConfidenceInterval={true}
/>
```

**FunnelChart** - Conversion funnel
```tsx
<FunnelChart
  data={[
    { name: "Visitors", value: 10000 },
    { name: "Sign Ups", value: 5000 }
  ]}
/>
```

**Gauge** - Progress gauge
```tsx
<Gauge
  value={75}
  max={100}
  title="Sales Target"
  unit="%"
/>
```

**Heatmap** - Value density
```tsx
<Heatmap
  data={heatmapData}
  xLabels={["Mon", "Tue", "Wed"]}
  yLabels={["Morning", "Evening"]}
  colorScale="blue"
/>
```

**RadarChart** - Multi-dimension comparison
```tsx
<RadarChart
  data={data}
  categoryKey="subject"
  valueKeys={["score", "average"]}
/>
```

**TreeMap** - Hierarchical data
```tsx
<TreeMap
  data={[{ name: "Product A", size: 4000 }]}
/>
```

**BulletChart** - Target vs actual
```tsx
<BulletChart
  value={75}
  target={100}
  label="Q4 Sales"
/>
```

**SankeyDiagram** - Flow visualization
```tsx
<SankeyDiagram
  nodes={nodes}
  links={links}
  title="User Journey"
/>
```

**AnomalyBadge** - Outlier indicator
```tsx
<AnomalyBadge
  label="Unusual Traffic"
  severity="high"
  value={245}
/>
```

### 7. Text & Insight Components

**InsightText** - AI insight
```tsx
<InsightText
  text="Sales increased by 23%"
  type="positive"
/>
```

**AICommentary** - Detailed analysis
```tsx
<AICommentary
  title="Performance Analysis"
  content="Based on the data..."
  highlights={["18% ROI improvement"]}
/>
```

**StatChange** - Delta indicator
```tsx
<StatChange
  value={12.5}
  label="vs last month"
/>
```

**TrendLabel** - Trend tag
```tsx
<TrendLabel trend="up" />
```

### 8. Embed & Share Components

**EmbedCode** - Embed code generator
```tsx
<EmbedCode
  url="https://example.com/dashboard"
  width={800}
  height={600}
/>
```

**ShareButton** - Share functionality
```tsx
<ShareButton
  url="https://example.com/dashboard"
  title="Q4 Dashboard"
/>
```

**QRCode** - QR code generator
```tsx
<QRCode
  url="https://example.com/dashboard"
  size={200}
/>
```

**ExportPDF** - PDF export
```tsx
<ExportPDF
  onExport={handleExport}
  filename="dashboard.pdf"
/>
```

### 9. AI Prompt & Feedback Components

**PromptInput** - AI prompt interface
```tsx
<PromptInput
  onSubmit={generateDashboard}
  suggestions={["Show sales trends"]}
/>
```

**RegenerateButton** - Regenerate content
```tsx
<RegenerateButton
  onRegenerate={handleRegenerate}
/>
```

**FeedbackThumbs** - Like/dislike
```tsx
<FeedbackThumbs
  onFeedback={(feedback) => console.log(feedback)}
/>
```

**EditPrompt** - Edit and resubmit
```tsx
<EditPrompt
  originalPrompt="Show sales data"
  onSubmit={regenerate}
/>
```

## 🎨 Theming

All components support:
- ✅ Light/Dark mode (via next-themes)
- ✅ Tailwind CSS customization
- ✅ CSS variables for colors
- ✅ Responsive design

## ♿ Accessibility

All components include:
- ARIA labels and roles
- Keyboard navigation
- Screen reader support
- Focus management

## 📱 Responsive Design

Components are mobile-first and responsive:
- Breakpoints: `sm`, `md`, `lg`, `xl`, `2xl`
- Grid system adapts to screen size
- Touch-friendly on mobile devices

## 🔧 Customization

All components accept `className` prop for custom styling:

```tsx
<KPICard
  className="bg-blue-50 border-blue-200"
  value="$45K"
  label="Revenue"
/>
```

## 📚 TypeScript Support

Full TypeScript support with exported types:

```tsx
import type { LineChartProps, KPICardProps } from "@/components/bi";
```

## 🚀 Performance

- Optimized with React best practices
- Minimal re-renders
- Code splitting ready
- Tree-shakeable exports

## 📄 License

Part of the InsightFlow AI project.

## 🤝 Contributing

Components follow these standards:
1. Full JSDoc documentation
2. TypeScript interfaces for props
3. Example usage in comments
4. Responsive and accessible
5. Dark mode support

## 📖 Documentation

Each component includes:
- Purpose and use cases
- Props documentation
- Example code
- TypeScript types

---

**Built with ❤️ for InsightFlow AI**
