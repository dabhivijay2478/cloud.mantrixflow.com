import { streamText, convertToModelMessages } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import type { UIMessage } from "@ai-sdk/react";

interface StreamConfig {
  replication_method: string;
  replication_key?: string | null;
}

interface PipelineContext {
  pipeline_id: string;
  pipeline_name: string;
  source: {
    connector_type: string;
    connection_name: string;
    selected_streams: string[];
    stream_configs: Record<string, StreamConfig>;
  };
  branches: Array<{
    id: string;
    label: string;
    transform_type: string;
    transform_script: string | null;
    destination_connector_type: string;
    destination_connection_name: string;
    emit_method: string;
  }>;
  last_run_status: string | null;
  last_run_rows: number | null;
}

function buildSystemPrompt(ctx: PipelineContext): string {
  const streamLines = ctx.source.selected_streams.map((s) => {
    const cfg = ctx.source.stream_configs?.[s];
    const mode = cfg?.replication_method ?? "FULL_TABLE";
    const key = cfg?.replication_key ? ` on ${cfg.replication_key}` : "";
    return `  - ${s}: ${mode}${key}`;
  }).join("\n") || "  (no tables selected)";

  const branchLines = ctx.branches.map((b, i) =>
    `  Branch ${i + 1}: ${b.label} → ${b.destination_connection_name} (${b.emit_method}), transform: ${b.transform_type}`
  ).join("\n") || "  (no branches)";

  const lastRun = ctx.last_run_status
    ? `${ctx.last_run_status} — ${ctx.last_run_rows?.toLocaleString() ?? 0} rows`
    : "No runs yet";

  return `You are an AI assistant embedded in MANTrixFlow, a data pipeline platform.
You help users configure ETL pipelines.

CURRENT PIPELINE:
Name: ${ctx.pipeline_name}
Source: ${ctx.source.connector_type} — ${ctx.source.connection_name}
Selected tables:
${streamLines}
Branches:
${branchLines}
Last run: ${lastRun}

WHAT YOU CAN DO:
You can suggest changes to this pipeline. When you want to make a change, end your response
with a JSON action block wrapped in <action> tags.

Valid actions:
<action>{"type":"select_streams","streams":["users","orders"]}</action>
<action>{"type":"set_incremental","stream":"users","replication_key":"updated_at"}</action>
<action>{"type":"set_full_table","stream":"products"}</action>
<action>{"type":"set_transform","branch_id":"branch-1","script":"def transform(record):\\n    return record"}</action>
<action>{"type":"set_emit_method","branch_id":"branch-1","method":"merge"}</action>
<action>{"type":"add_branch","label":"New Destination"}</action>
<action>{"type":"delete_branch","branch_id":"branch-2"}</action>
<action>{"type":"rename_branch","branch_id":"branch-1","label":"Analytics Postgres"}</action>
<action>{"type":"set_schedule","cron":"0 * * * *","human":"Every hour"}</action>

Rules:
- Only suggest changes that make sense for the current pipeline context
- Explain what you are doing in plain language before the action block
- If the user is asking a question (not requesting a change), answer it without an action block
- Keep responses concise — 2-4 sentences max before the action block
- If multiple changes are needed, group them into one response with one action block

CONNECTOR TYPES AVAILABLE: postgres, mysql, mariadb, mssql, oracle, bigquery, snowflake, redshift
SYNC MODES: FULL_TABLE, INCREMENTAL (requires replication key column), LOG_BASED (PostgreSQL WAL only)
EMIT METHODS: merge (upsert by PK), append (always insert), overwrite (drop+recreate)`;
}

export async function POST(req: Request) {
  const { messages, pipelineContext } = (await req.json()) as {
    messages: UIMessage[];
    pipelineContext: PipelineContext;
  };

  const systemPrompt = buildSystemPrompt(pipelineContext);

  const result = streamText({
    model: anthropic("claude-sonnet-4-5"),
    system: systemPrompt,
    messages: convertToModelMessages(messages),
    maxTokens: 500,
  });

  return result.toUIMessageStreamResponse();
}
