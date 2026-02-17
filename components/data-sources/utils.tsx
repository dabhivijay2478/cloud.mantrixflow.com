import { Cloud, Database, Globe, Server } from "lucide-react";
import type React from "react";
import { BiNetworkChart } from "react-icons/bi";
import {
  FaCloud as FaCloudIcon,
  FaFileExcel,
  FaVectorSquare,
} from "react-icons/fa";
import {
  SiAmazon,
  SiClickhouse,
  SiDatabricks,
  SiGooglecloud,
  SiGooglesheets,
  SiHubspot,
  SiMongodb,
  SiMysql,
  SiPostgresql,
  SiSalesforce,
  SiSnowflake,
} from "react-icons/si";

// Icon component helper
export const getIconComponent = (iconType: string, size: number = 24) => {
  const iconMap: Record<string, React.ReactNode> = {
    "azure-blob-storage": <Cloud size={size} className="text-blue-500" />,
    "customer-io": <BiNetworkChart size={size} className="text-purple-500" />,
    milvus: <FaVectorSquare size={size} className="text-green-500" />,
    pinecone: <FaCloudIcon size={size} className="text-blue-400" />,
    s3: <SiAmazon size={size} className="text-orange-500" />,
    snowflake: <SiSnowflake size={size} className="text-blue-400" />,
    bigquery: <SiGooglecloud size={size} className="text-blue-500" />,
    databricks: <SiDatabricks size={size} className="text-orange-500" />,
    mssql: <Server size={size} className="text-red-500" />,
    postgres: <SiPostgresql size={size} className="text-blue-600" />,
    "s3-datalake": <SiAmazon size={size} className="text-orange-500" />,
    "snowflake-cortex": <SiSnowflake size={size} className="text-blue-400" />,
    clickhouse: <SiClickhouse size={size} className="text-yellow-500" />,
    hubspot: <SiHubspot size={size} className="text-orange-500" />,
    pgvector: <SiPostgresql size={size} className="text-blue-600" />,
    redshift: <SiAmazon size={size} className="text-orange-500" />,
    salesforce: <SiSalesforce size={size} className="text-blue-500" />,
    weaviate: <FaVectorSquare size={size} className="text-blue-400" />,
    mysql: <SiMysql size={size} className="text-blue-500" />,
    mongodb: <SiMongodb size={size} className="text-green-500" />,
    "google-sheets": <SiGooglesheets size={size} className="text-green-500" />,
    excel: <FaFileExcel size={size} className="text-green-600" />,
    api: <Globe size={size} className="text-blue-500" />,
  };

  return (
    iconMap[iconType] || (
      <Database size={size} className="text-muted-foreground" />
    )
  );
};
