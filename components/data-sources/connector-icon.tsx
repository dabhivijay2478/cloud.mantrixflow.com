"use client";

import { Cloud, Database, Globe, Server } from "lucide-react";
import type React from "react";
import {
  siAirtable,
  siClickhouse,
  siDatabricks,
  siDuckdb,
  siGithub,
  siGooglesheets,
  siGooglebigquery,
  siGooglecloud,
  siHubspot,
  siMilvus,
  siMongodb,
  siMysql,
  siNotion,
  siPostgresql,
  siSalesforce,
  siShopify,
  siSlack,
  siSnowflake,
  siStripe,
  siSupabase,
} from "simple-icons";

type SimpleIconData = { slug: string; path: string; title: string; hex?: string };

function SimpleIconSvg({
  icon,
  size = 24,
  className,
}: {
  icon: SimpleIconData;
  size?: number;
  className?: string;
}) {
  const svg = `<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" fill="currentColor"><path d="${icon.path}"/></svg>`;
  return (
    <span
      className={className}
      style={{ display: "inline-flex", width: size, height: size }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

// Map connector iconType to simple-icons export
const ICON_MAP: Record<string, SimpleIconData> = {
  snowflake: siSnowflake,
  "snowflake-cortex": siSnowflake,
  postgres: siPostgresql,
  postgresql: siPostgresql,
  mysql: siMysql,
  mongodb: siMongodb,
  bigquery: siGooglebigquery,
  "google-sheets": siGooglesheets,
  databricks: siDatabricks,
  clickhouse: siClickhouse,
  hubspot: siHubspot,
  salesforce: siSalesforce,
  github: siGithub,
  stripe: siStripe,
  shopify: siShopify,
  slack: siSlack,
  notion: siNotion,
  airtable: siAirtable,
  milvus: siMilvus,
  pgvector: siPostgresql,
  supabase: siSupabase,
  duckdb: siDuckdb,
  // S3, Redshift use AWS - use Google Cloud as placeholder (no AWS in simple-icons)
  s3: siGooglecloud,
  "s3-datalake": siGooglecloud,
  redshift: siGooglecloud,
  // MSSQL, Azure - use Server/Cloud from Lucide as fallback
};

export function getIconComponent(iconType: string, size: number = 24): React.ReactNode {
  const simpleIcon = ICON_MAP[iconType];
  if (simpleIcon) {
    return (
      <SimpleIconSvg
        icon={simpleIcon}
        size={size}
        className="shrink-0"
      />
    );
  }

  // Fallbacks for connectors without simple-icons
  const lucideFallbacks: Record<string, React.ReactNode> = {
    "azure-blob-storage": <Cloud size={size} className="shrink-0 text-blue-500" />,
    "customer-io": <Globe size={size} className="shrink-0 text-purple-500" />,
    pinecone: <Cloud size={size} className="shrink-0 text-blue-400" />,
    mssql: <Server size={size} className="shrink-0 text-red-500" />,
    weaviate: <Database size={size} className="shrink-0 text-blue-400" />,
    excel: <Database size={size} className="shrink-0 text-green-600" />,
    api: <Globe size={size} className="shrink-0 text-blue-500" />,
    "google-analytics": <Globe size={size} className="shrink-0 text-orange-500" />,
    "facebook-marketing": <Globe size={size} className="shrink-0 text-blue-600" />,
    faker: <Database size={size} className="shrink-0 text-muted-foreground" />,
    file: <Database size={size} className="shrink-0 text-muted-foreground" />,
  };

  return (
    lucideFallbacks[iconType] ?? (
      <Database size={size} className="shrink-0 text-muted-foreground" />
    )
  );
}
