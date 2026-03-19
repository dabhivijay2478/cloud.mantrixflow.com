export type ConnectionRole = "source" | "destination";
export type ConnectionStatus = "active" | "inactive";

export interface MockConnection {
  id: string;
  name: string;
  type: string;
  role: ConnectionRole;
  status: ConnectionStatus;
  hostSummary: string;
  pipelineCount: number;
  lastTestResult: "success" | "never" | "failed";
  lastTestTime?: string; // e.g. "2 hrs ago", "5 days ago"
}

export const MOCK_CONNECTIONS: MockConnection[] = [
  {
    id: "conn-1",
    name: "Production Postgres",
    type: "postgres",
    role: "source",
    status: "active",
    hostSummary: "prod.db.company.com:5432/mydb",
    pipelineCount: 3,
    lastTestResult: "success",
    lastTestTime: "2 hrs ago",
  },
  {
    id: "conn-2",
    name: "BigQuery Archive",
    type: "bigquery",
    role: "destination",
    status: "active",
    hostSummary: "myproject / analytics_bq",
    pipelineCount: 1,
    lastTestResult: "never",
  },
  {
    id: "conn-3",
    name: "Analytics MySQL",
    type: "mysql",
    role: "source",
    status: "active",
    hostSummary: "analytics.company.com:3306/reporting",
    pipelineCount: 0,
    lastTestResult: "success",
    lastTestTime: "5 days ago",
  },
];
