"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { MOCK_CONNECTIONS } from "../../data/mockConnections";

export default function CdcSetupPage() {
  const params = useParams();
  const id = params?.id as string;
  const connection = MOCK_CONNECTIONS.find((c) => c.id === id);

  if (!connection) {
    return (
      <div className="space-y-6">
        <Link
          href="/workspace/connections"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
        >
          ← Back to Connections
        </Link>
        <p className="text-muted-foreground">Connection not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/workspace/connections`}
          className="text-muted-foreground hover:text-foreground mb-2 inline-flex items-center gap-1 text-sm"
        >
          ← Back to Connections
        </Link>
        <h1 className="text-2xl font-semibold">
          CDC Setup — {connection.name}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Enable Change Data Capture for real-time sync with PostgreSQL.
        </p>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <p className="text-muted-foreground text-sm">
          CDC setup wizard coming soon. This page will guide you through
          configuring WAL level, replication roles, and replication slots.
        </p>
      </div>
    </div>
  );
}
