import type { ConnectionDisplay } from "../types";

type ApiConnection = {
  id: string;
  name: string;
  type?: string;
  connectorRole?: "source" | "destination";
  status?: string;
  lastConnectedAt?: Date | string;
  createdAt?: Date | string;
  config?: { host?: string; port?: number; database?: string; path?: string };
  pipelineCount?: number;
};

function formatTimeAgo(date: Date | string | undefined): string | undefined {
  if (!date) return undefined;
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hr${diffHours !== 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  return undefined;
}

function buildHostSummary(conn: ApiConnection): string {
  const config = conn.config;
  if (!config) return "—";
  if (config.path) return config.path;
  const host = config.host ?? "—";
  const port = config.port;
  const db = config.database ?? "";
  if (port && db) return `${host}:${port}/${db}`;
  if (port) return `${host}:${port}`;
  if (db) return `${host}/${db}`;
  return host;
}

export function mapConnectionToDisplay(conn: ApiConnection): ConnectionDisplay {
  const pipelineCount = conn.pipelineCount ?? 0;
  const lastConnectedAt = conn.lastConnectedAt ?? conn.createdAt;
  const status = conn.status ?? "inactive";
  const isActive = status === "active" || status === "connected";

  let lastTestResult: ConnectionDisplay["lastTestResult"] = "never";
  let lastTestTime: string | undefined;

  if (lastConnectedAt) {
    lastTestTime = formatTimeAgo(lastConnectedAt);
    lastTestResult = isActive ? "success" : "failed";
  }
  if (status === "error") lastTestResult = "failed";

  return {
    id: conn.id,
    name: conn.name,
    type: (conn.type as string) ?? "postgres",
    role: (conn.connectorRole as "source" | "destination") ?? "source",
    status: isActive ? "active" : "inactive",
    hostSummary: buildHostSummary(conn),
    pipelineCount,
    lastTestResult,
    lastTestTime,
  };
}
