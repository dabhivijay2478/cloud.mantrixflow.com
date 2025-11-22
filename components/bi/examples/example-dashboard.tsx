"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Activity, DollarSign, TrendingUp, Users } from "lucide-react";
import {
  BarChart,
  DataTable,
  GridItem,
  GridLayout,
  KPICard,
  LineChart,
  MetricCard,
  Section,
  Sparkline,
  StatChange,
  TrendLabel,
} from "../index";

/**
 * ExampleDashboard
 * @description Complete example dashboard showcasing InsightFlow BI components.
 * Demonstrates real-world usage patterns and component composition.
 * @example
 * import { ExampleDashboard } from "@/components/bi/example-dashboard";
 *
 * function Page() {
 *   return <ExampleDashboard />;
 * }
 */

// Sample data
const salesData = [
  { month: "Jan", revenue: 4000, profit: 2400, expenses: 1600 },
  { month: "Feb", revenue: 3000, profit: 1398, expenses: 1602 },
  { month: "Mar", revenue: 2000, profit: 9800, expenses: 2200 },
  { month: "Apr", revenue: 2780, profit: 3908, expenses: 872 },
  { month: "May", revenue: 1890, profit: 4800, expenses: 1090 },
  { month: "Jun", revenue: 2390, profit: 3800, expenses: 590 },
];

const categoryData = [
  { category: "Electronics", sales: 45000, growth: 23 },
  { category: "Clothing", sales: 32000, growth: -5 },
  { category: "Food", sales: 28000, growth: 15 },
  { category: "Books", sales: 18000, growth: 8 },
];

interface Payment extends Record<string, unknown> {
  id: string;
  amount: number;
  status: string;
  email: string;
}

const payments: Payment[] = [
  { id: "m5gr84i9", amount: 316, status: "success", email: "ken99@yahoo.com" },
  { id: "3u1reuv4", amount: 242, status: "success", email: "Abe45@gmail.com" },
  {
    id: "derv1ws0",
    amount: 837,
    status: "processing",
    email: "Monserrat44@gmail.com",
  },
  {
    id: "5kma53ae",
    amount: 874,
    status: "success",
    email: "Silas22@gmail.com",
  },
  {
    id: "bhqecj4p",
    amount: 721,
    status: "failed",
    email: "carmella@hotmail.com",
  },
];

const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "amount",
    header: "Amount",
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

export function ExampleDashboard() {
  return (
    <div className="space-y-8 p-8">
      <Section
        title="Revenue Dashboard"
        description="Q4 2024 Performance Overview"
      >
        {/* KPI Cards */}
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
            value="1.2"
            label="Avg. Session"
            suffix="m"
            icon={Activity}
            description="Minutes per session"
          />
        </GridLayout>

        {/* Charts */}
        <GridLayout cols={2} gap="lg" className="mt-8">
          <GridItem>
            <LineChart
              data={salesData}
              xKey="month"
              yKeys={["revenue", "profit"]}
              title="Revenue & Profit Trends"
              description="Last 6 months performance"
            />
          </GridItem>
          <GridItem>
            <BarChart
              data={categoryData}
              xKey="category"
              yKeys={["sales"]}
              title="Sales by Category"
              description="Product category breakdown"
            />
          </GridItem>
        </GridLayout>

        {/* Data Table */}
        <div className="mt-8">
          <DataTable<Payment>
            columns={columns}
            data={payments}
            title="Recent Transactions"
            filterable={true}
            filterColumn="email"
            filterPlaceholder="Filter by email..."
            pagination={true}
            pageSize={5}
          />
        </div>

        {/* Additional Metrics */}
        <GridLayout cols={3} gap="md" className="mt-8">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Sales Trend</span>
              <TrendLabel trend="up" />
            </div>
            <Sparkline
              data={[20, 30, 25, 40, 35, 50, 45]}
              type="line"
              color="#10b981"
              height={40}
              width={200}
            />
            <div className="mt-2">
              <StatChange value={18.5} label="vs last week" size="sm" />
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">User Growth</span>
              <TrendLabel trend="up" />
            </div>
            <Sparkline
              data={[15, 22, 18, 28, 32, 40, 38]}
              type="area"
              color="#3b82f6"
              height={40}
              width={200}
            />
            <div className="mt-2">
              <StatChange value={25.3} label="vs last week" size="sm" />
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Conversion</span>
              <TrendLabel trend="stable" />
            </div>
            <Sparkline
              data={[25, 26, 25, 27, 26, 25, 26]}
              type="line"
              color="#8b5cf6"
              height={40}
              width={200}
            />
            <div className="mt-2">
              <StatChange value={0.8} label="vs last week" size="sm" />
            </div>
          </div>
        </GridLayout>
      </Section>
    </div>
  );
}
