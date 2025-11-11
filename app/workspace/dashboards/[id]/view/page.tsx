"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { GridLayout, GridItem } from "@/components/bi/grid-layout";
import { LineChart, BarChart, KPICard, DataTable } from "@/components/bi";

export default function DashboardViewPage() {
  const params = useParams();
  const dashboardId = params.id as string;
  const { dashboards } = useWorkspaceStore();
  const [dashboard, setDashboard] = useState(
    dashboards.find((d) => d.id === dashboardId)
  );

  useEffect(() => {
    const found = dashboards.find((d) => d.id === dashboardId);
    if (found) {
      setDashboard(found);
    }
  }, [dashboardId, dashboards]);

  if (!dashboard) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Mock data for demonstration
  const sampleData = [
    { month: "Jan", revenue: 4000, profit: 2400 },
    { month: "Feb", revenue: 3000, profit: 1398 },
    { month: "Mar", revenue: 2000, profit: 9800 },
    { month: "Apr", revenue: 2780, profit: 3908 },
    { month: "May", revenue: 1890, profit: 4800 },
    { month: "Jun", revenue: 2390, profit: 3800 },
  ];

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{dashboard.name}</h1>
          {dashboard.description && (
            <p className="text-muted-foreground text-sm md:text-base">{dashboard.description}</p>
          )}
        </div>

        {dashboard.components.length === 0 ? (
          <Card>
            <CardContent className="p-6 md:p-12">
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">Your dashboard is empty</p>
                <p className="text-sm text-muted-foreground">
                  Add components to start visualizing your data
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {dashboard.components.map((component) => (
              <Card key={component.id} className="w-full">
                <CardContent className="p-4 md:p-6">
                  <div className="space-y-4">
                    {component.type === "line-chart" && (
                      <LineChart
                        data={sampleData}
                        xKey="month"
                        yKeys={["revenue", "profit"]}
                        title="Revenue Trends"
                      />
                    )}
                    {component.type === "bar-chart" && (
                      <BarChart
                        data={sampleData}
                        xKey="month"
                        yKeys={["revenue"]}
                        title="Revenue by Month"
                      />
                    )}
                    {component.type === "kpi-card" && (
                      <KPICard
                        value="$45,231"
                        label="Total Revenue"
                        change={12.5}
                        changeLabel="vs last month"
                      />
                    )}
                    {component.type === "data-table" && (
                      <DataTable
                        data={sampleData}
                        columns={[
                          { accessorKey: "month", header: "Month" },
                          { accessorKey: "revenue", header: "Revenue" },
                          { accessorKey: "profit", header: "Profit" },
                        ]}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

