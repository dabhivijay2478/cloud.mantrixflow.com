"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { Plus, Database, Check, X, Loader2 } from "lucide-react";
import { toast } from "@/lib/utils/toast";
import { cn } from "@/lib/utils";

// Connection schema configuration for each data source type
const connectionSchemas: Record<string, {
  fields: Array<{
    name: string;
    label: string;
    type: "text" | "password" | "number" | "textarea" | "file";
    placeholder?: string;
    required?: boolean;
    description?: string;
  }>;
  connectionString?: boolean;
  testConnection?: boolean;
}> = {
  postgres: {
    fields: [
      { name: "host", label: "Host", type: "text", placeholder: "localhost", required: true },
      { name: "port", label: "Port", type: "number", placeholder: "5432", required: true },
      { name: "database", label: "Database", type: "text", placeholder: "mydb", required: true },
      { name: "username", label: "Username", type: "text", placeholder: "user", required: true },
      { name: "password", label: "Password", type: "password", placeholder: "••••••••", required: true },
    ],
    connectionString: true,
    testConnection: true,
  },
  mysql: {
    fields: [
      { name: "host", label: "Host", type: "text", placeholder: "localhost", required: true },
      { name: "port", label: "Port", type: "number", placeholder: "3306", required: true },
      { name: "database", label: "Database", type: "text", placeholder: "mydb", required: true },
      { name: "username", label: "Username", type: "text", placeholder: "user", required: true },
      { name: "password", label: "Password", type: "password", placeholder: "••••••••", required: true },
    ],
    connectionString: true,
    testConnection: true,
  },
  mongodb: {
    fields: [
      { name: "host", label: "Host", type: "text", placeholder: "localhost", required: true },
      { name: "port", label: "Port", type: "number", placeholder: "27017", required: true },
      { name: "database", label: "Database", type: "text", placeholder: "mydb", required: true },
      { name: "username", label: "Username", type: "text", placeholder: "user", required: false },
      { name: "password", label: "Password", type: "password", placeholder: "••••••••", required: false },
    ],
    connectionString: true,
    testConnection: true,
  },
  mssql: {
    fields: [
      { name: "host", label: "Server", type: "text", placeholder: "localhost", required: true },
      { name: "port", label: "Port", type: "number", placeholder: "1433", required: true },
      { name: "database", label: "Database", type: "text", placeholder: "mydb", required: true },
      { name: "username", label: "Username", type: "text", placeholder: "user", required: true },
      { name: "password", label: "Password", type: "password", placeholder: "••••••••", required: true },
    ],
    connectionString: true,
    testConnection: true,
  },
  bigquery: {
    fields: [
      { name: "projectId", label: "Project ID", type: "text", placeholder: "my-project", required: true },
      { name: "datasetId", label: "Dataset ID", type: "text", placeholder: "my_dataset", required: true },
      { name: "credentials", label: "Service Account JSON", type: "textarea", placeholder: "Paste your service account JSON", required: true, description: "Paste your Google Cloud service account JSON credentials" },
    ],
    testConnection: true,
  },
  snowflake: {
    fields: [
      { name: "account", label: "Account", type: "text", placeholder: "myaccount", required: true },
      { name: "warehouse", label: "Warehouse", type: "text", placeholder: "COMPUTE_WH", required: true },
      { name: "database", label: "Database", type: "text", placeholder: "mydb", required: true },
      { name: "schema", label: "Schema", type: "text", placeholder: "PUBLIC", required: true },
      { name: "username", label: "Username", type: "text", placeholder: "user", required: true },
      { name: "password", label: "Password", type: "password", placeholder: "••••••••", required: true },
    ],
    testConnection: true,
  },
  redshift: {
    fields: [
      { name: "host", label: "Host", type: "text", placeholder: "cluster.region.redshift.amazonaws.com", required: true },
      { name: "port", label: "Port", type: "number", placeholder: "5439", required: true },
      { name: "database", label: "Database", type: "text", placeholder: "dev", required: true },
      { name: "username", label: "Username", type: "text", placeholder: "awsuser", required: true },
      { name: "password", label: "Password", type: "password", placeholder: "••••••••", required: true },
    ],
    connectionString: true,
    testConnection: true,
  },
  clickhouse: {
    fields: [
      { name: "host", label: "Host", type: "text", placeholder: "localhost", required: true },
      { name: "port", label: "Port", type: "number", placeholder: "9000", required: true },
      { name: "database", label: "Database", type: "text", placeholder: "default", required: true },
      { name: "username", label: "Username", type: "text", placeholder: "default", required: true },
      { name: "password", label: "Password", type: "password", placeholder: "••••••••", required: false },
    ],
    connectionString: true,
    testConnection: true,
  },
  "s3": {
    fields: [
      { name: "bucket", label: "Bucket Name", type: "text", placeholder: "my-bucket", required: true },
      { name: "region", label: "Region", type: "text", placeholder: "us-east-1", required: true },
      { name: "accessKeyId", label: "Access Key ID", type: "text", placeholder: "AKIAIOSFODNN7EXAMPLE", required: true },
      { name: "secretAccessKey", label: "Secret Access Key", type: "password", placeholder: "••••••••", required: true },
    ],
    testConnection: true,
  },
  "s3-datalake": {
    fields: [
      { name: "bucket", label: "Bucket Name", type: "text", placeholder: "my-datalake", required: true },
      { name: "region", label: "Region", type: "text", placeholder: "us-east-1", required: true },
      { name: "accessKeyId", label: "Access Key ID", type: "text", placeholder: "AKIAIOSFODNN7EXAMPLE", required: true },
      { name: "secretAccessKey", label: "Secret Access Key", type: "password", placeholder: "••••••••", required: true },
      { name: "prefix", label: "Prefix (Optional)", type: "text", placeholder: "raw/", required: false },
    ],
    testConnection: true,
  },
  "azure-blob-storage": {
    fields: [
      { name: "accountName", label: "Account Name", type: "text", placeholder: "mystorageaccount", required: true },
      { name: "containerName", label: "Container Name", type: "text", placeholder: "mycontainer", required: true },
      { name: "accountKey", label: "Account Key", type: "password", placeholder: "••••••••", required: true },
    ],
    testConnection: true,
  },
  databricks: {
    fields: [
      { name: "serverHostname", label: "Server Hostname", type: "text", placeholder: "adb-1234567890.1.azuredatabricks.net", required: true },
      { name: "httpPath", label: "HTTP Path", type: "text", placeholder: "/sql/1.0/warehouses/abc123", required: true },
      { name: "personalAccessToken", label: "Personal Access Token", type: "password", placeholder: "••••••••", required: true },
    ],
    testConnection: true,
  },
  pinecone: {
    fields: [
      { name: "apiKey", label: "API Key", type: "password", placeholder: "Enter your Pinecone API key", required: true },
      { name: "environment", label: "Environment", type: "text", placeholder: "us-east1-gcp", required: true },
      { name: "indexName", label: "Index Name", type: "text", placeholder: "my-index", required: true },
    ],
    testConnection: true,
  },
  milvus: {
    fields: [
      { name: "host", label: "Host", type: "text", placeholder: "localhost", required: true },
      { name: "port", label: "Port", type: "number", placeholder: "19530", required: true },
      { name: "username", label: "Username", type: "text", placeholder: "root", required: false },
      { name: "password", label: "Password", type: "password", placeholder: "••••••••", required: false },
    ],
    testConnection: true,
  },
  weaviate: {
    fields: [
      { name: "url", label: "Weaviate URL", type: "text", placeholder: "https://your-cluster.weaviate.network", required: true },
      { name: "apiKey", label: "API Key", type: "password", placeholder: "Enter your API key", required: false },
    ],
    testConnection: true,
  },
  pgvector: {
    fields: [
      { name: "host", label: "Host", type: "text", placeholder: "localhost", required: true },
      { name: "port", label: "Port", type: "number", placeholder: "5432", required: true },
      { name: "database", label: "Database", type: "text", placeholder: "mydb", required: true },
      { name: "username", label: "Username", type: "text", placeholder: "user", required: true },
      { name: "password", label: "Password", type: "password", placeholder: "••••••••", required: true },
    ],
    connectionString: true,
    testConnection: true,
  },
  "snowflake-cortex": {
    fields: [
      { name: "account", label: "Account", type: "text", placeholder: "myaccount", required: true },
      { name: "warehouse", label: "Warehouse", type: "text", placeholder: "COMPUTE_WH", required: true },
      { name: "database", label: "Database", type: "text", placeholder: "mydb", required: true },
      { name: "username", label: "Username", type: "text", placeholder: "user", required: true },
      { name: "password", label: "Password", type: "password", placeholder: "••••••••", required: true },
    ],
    testConnection: true,
  },
  api: {
    fields: [
      { name: "endpoint", label: "API Endpoint", type: "text", placeholder: "https://api.example.com", required: true },
      { name: "apiKey", label: "API Key", type: "password", placeholder: "Enter your API key", required: true },
      { name: "headers", label: "Custom Headers (JSON)", type: "textarea", placeholder: '{"X-Custom-Header": "value"}', required: false, description: "Optional custom headers in JSON format" },
    ],
    testConnection: true,
  },
  "customer-io": {
    fields: [
      { name: "appApiKey", label: "App API Key", type: "password", placeholder: "Enter your App API key", required: true },
      { name: "siteId", label: "Site ID", type: "text", placeholder: "your-site-id", required: true },
    ],
    testConnection: true,
  },
};

// Dynamic schema builder based on data source type
const buildConnectionSchema = (dataSourceType: string) => {
  const schema = connectionSchemas[dataSourceType];
  if (!schema) {
    return z.object({}).passthrough();
  }

  const schemaObject: Record<string, z.ZodTypeAny> = {};

  // Add connection string field if supported
  if (schema.connectionString) {
    schemaObject.connectionString = z.string().optional();
  }

  // Add all fields from schema
  schema.fields.forEach((field) => {
    if (field.required) {
      schemaObject[field.name] = z.string().min(1, `${field.label} is required`);
    } else {
      schemaObject[field.name] = z.string().optional();
    }
  });

  return z.object(schemaObject).refine(
    (data) => {
      // If connection string is provided, it's valid
      if (schema.connectionString && data.connectionString) {
        return true;
      }
      // Otherwise, all required fields must be present
      return schema.fields.every((field) => {
        if (!field.required) return true;
        return data[field.name as keyof typeof data] && String(data[field.name as keyof typeof data]).trim().length > 0;
      });
    },
    {
      message: "Please provide all required connection details",
    }
  );
};

type ConnectionFormValues = Record<string, string>;

// All available data sources based on the image
const allDataSources = [
  { id: "azure-blob-storage", name: "Azure Blob Storage", type: "azure-blob-storage" as const, icon: "📦" },
  { id: "customer-io", name: "Customer IO", type: "customer-io" as const, icon: "➡️" },
  { id: "milvus", name: "Milvus", type: "milvus" as const, icon: "👁️" },
  { id: "pinecone", name: "Pinecone", type: "pinecone" as const, icon: "❄️" },
  { id: "s3", name: "S3", type: "s3" as const, icon: "🪣" },
  { id: "snowflake", name: "Snowflake", type: "snowflake" as const, icon: "❄️" },
  { id: "bigquery", name: "BigQuery", type: "bigquery" as const, icon: "🔍" },
  { id: "databricks-lakehouse", name: "Databricks Lakehouse", type: "databricks" as const, icon: "📊" },
  { id: "ms-sql-server", name: "MS SQL Server", type: "mssql" as const, icon: "🔴" },
  { id: "postgres", name: "Postgres", type: "postgres" as const, icon: "🐘" },
  { id: "s3-data-lake", name: "S3 Data Lake", type: "s3-datalake" as const, icon: "📥" },
  { id: "snowflake-cortex", name: "Snowflake Cortex", type: "snowflake-cortex" as const, icon: "❄️" },
  { id: "clickhouse", name: "Clickhouse", type: "clickhouse" as const, icon: "📊" },
  { id: "hubspot", name: "HubSpot", type: "hubspot" as const, icon: "⭐" },
  { id: "pgvector", name: "PGVector", type: "pgvector" as const, icon: "🐘" },
  { id: "redshift", name: "Redshift", type: "redshift" as const, icon: "📦" },
  { id: "salesforce", name: "Salesforce", type: "salesforce" as const, icon: "💼", enterprise: true },
  { id: "weaviate", name: "Weaviate", type: "weaviate" as const, icon: "🌊" },
  // Additional common data sources
  { id: "mysql", name: "MySQL", type: "mysql" as const, icon: "🗄️" },
  { id: "mongodb", name: "MongoDB", type: "mongodb" as const, icon: "🍃" },
  { id: "google-sheets", name: "Google Sheets", type: "google-sheets" as const, icon: "📊" },
  { id: "excel", name: "Excel / CSV", type: "excel" as const, icon: "📄" },
  { id: "api", name: "REST API", type: "api" as const, icon: "🌐" },
];

// Mock tables/sheets for demonstration
const mockTables: Record<string, string[]> = {
  postgres: ["users", "orders", "products", "transactions"],
  mysql: ["customers", "sales", "inventory"],
  bigquery: ["analytics_events", "user_sessions", "revenue_data"],
  snowflake: ["warehouse_data", "sales_facts", "customer_dim"],
  "google-sheets": ["Sheet1", "Sales Data", "Customer List"],
  excel: ["Data", "Summary", "Details"],
  redshift: ["fact_sales", "dim_customers", "dim_products"],
  mssql: ["dbo.Users", "dbo.Orders", "dbo.Products"],
  mongodb: ["users", "orders", "products"],
  s3: ["bucket1/data.csv", "bucket2/analytics.json"],
  "s3-datalake": ["lake/raw/", "lake/processed/"],
  clickhouse: ["events", "metrics", "logs"],
  hubspot: ["contacts", "deals", "companies"],
  salesforce: ["Account", "Contact", "Opportunity"],
  databricks: ["default.sales", "default.customers"],
  milvus: ["vectors", "embeddings"],
  pinecone: ["index1", "index2"],
  weaviate: ["Class1", "Class2"],
  pgvector: ["embeddings", "documents"],
  "snowflake-cortex": ["cortex_data", "ml_results"],
  "azure-blob-storage": ["container1/", "container2/"],
  "customer-io": ["events", "campaigns"],
};

export default function DataSourcesPage() {
  const router = useRouter();
  const { dataSources, addDataSource, updateDataSource, removeDataSource } = useWorkspaceStore();
  const [selectedDataSource, setSelectedDataSource] = useState<string | null>(null);
  const [showAddMode, setShowAddMode] = useState(false);
  const [showConnectionSheet, setShowConnectionSheet] = useState(false);
  const [connectingDataSourceId, setConnectingDataSourceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionTestResult, setConnectionTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const getCurrentSchema = () => {
    if (!connectingDataSourceId) return null;
    const dataSource = allDataSources.find((ds) => ds.id === connectingDataSourceId);
    return dataSource ? connectionSchemas[dataSource.type] : null;
  };

  const getDefaultValues = () => {
    const schema = getCurrentSchema();
    if (!schema) return {};
    const defaults: Record<string, string> = {};
    if (schema.connectionString) {
      defaults.connectionString = "";
    }
    schema.fields.forEach((field) => {
      defaults[field.name] = "";
    });
    return defaults;
  };

  const form = useForm<ConnectionFormValues>({
    resolver: (data) => {
      if (!connectingDataSourceId) return { values: data, errors: {} };
      const dataSource = allDataSources.find((ds) => ds.id === connectingDataSourceId);
      if (!dataSource) return { values: data, errors: {} };
      const schema = buildConnectionSchema(dataSource.type);
      const result = schema.safeParse(data);
      if (result.success) {
        return { values: result.data, errors: {} };
      } else {
        const errors: Record<string, { message: string }> = {};
        result.error.errors.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0] as string] = { message: err.message };
          }
        });
        return { values: data, errors };
      }
    },
    defaultValues: getDefaultValues(),
  });

  // Reset form when data source changes
  useEffect(() => {
    if (connectingDataSourceId) {
      form.reset(getDefaultValues());
    }
  }, [connectingDataSourceId]);

  const isConnected = (dataSourceId: string) => {
    return dataSources.some((ds) => ds.id === dataSourceId && ds.status === "connected");
  };

  const getConnectedDataSource = (dataSourceId: string) => {
    return dataSources.find((ds) => ds.id === dataSourceId);
  };

  const handleDataSourceClick = (dataSourceId: string) => {
    if (isConnected(dataSourceId)) {
      // If already connected, show sheet selection
      setSelectedDataSource(dataSourceId);
      setShowAddMode(false);
    } else {
      // If not connected, show connection flow
      setSelectedDataSource(dataSourceId);
      setShowAddMode(true);
    }
  };

  const handleConnectClick = (dataSourceId: string) => {
    setConnectingDataSourceId(dataSourceId);
    setShowConnectionSheet(true);
    setConnectionTestResult(null);
    form.reset(getDefaultValues());
  };

  const handleTestConnection = async () => {
    if (!connectingDataSourceId) return;

    const dataSource = allDataSources.find((ds) => ds.id === connectingDataSourceId);
    if (!dataSource) return;

    const formData = form.getValues();
    const isValid = await form.trigger();

    if (!isValid) {
      toast.error("Please fill in all required fields", "All required connection fields must be filled before testing.");
      return;
    }

    setTestingConnection(true);
    setConnectionTestResult(null);

    try {
      // Simulate connection test - in real app, this would call an API
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulate success/failure (90% success rate for demo)
      const success = Math.random() > 0.1;

      if (success) {
        setConnectionTestResult({
          success: true,
          message: "Connection successful! You can now save this connection.",
        });
        toast.success("Connection test successful!", "The connection to your data source was successful.");
      } else {
        setConnectionTestResult({
          success: false,
          message: "Connection failed. Please check your credentials and try again.",
        });
        toast.error("Connection test failed", "Unable to connect to the data source. Please check your credentials and try again.");
      }
    } catch (error) {
      setConnectionTestResult({
        success: false,
        message: "An error occurred while testing the connection.",
      });
      toast.error("Connection test failed", "An error occurred while testing the connection. Please try again.");
    } finally {
      setTestingConnection(false);
    }
  };

  const handleConnect = async (data: ConnectionFormValues) => {
    if (!connectingDataSourceId) return;

    const dataSource = allDataSources.find((ds) => ds.id === connectingDataSourceId);
    if (!dataSource) return;

    setLoading(true);
    try {
      // Simulate connection - in real app, this would call an API
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const newDataSource = {
        id: connectingDataSourceId,
        name: dataSource.name,
        type: dataSource.type,
        status: "connected" as const,
        connectedAt: new Date().toISOString(),
        tables: mockTables[dataSource.type] || [],
      };

      addDataSource(newDataSource);
      toast.success(`${dataSource.name} connected successfully`, "Your data source has been connected and is ready to use.");
      setShowConnectionSheet(false);
      setConnectingDataSourceId(null);
      setSelectedDataSource(connectingDataSourceId);
      setShowAddMode(false);
      setConnectionTestResult(null);
      form.reset();
    } catch (error) {
      toast.error("Failed to connect data source", "Unable to connect the data source. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthConnect = async (dataSourceId: string) => {
    const dataSource = allDataSources.find((ds) => ds.id === dataSourceId);
    if (!dataSource) return;

    setLoading(true);
    try {
      // Simulate OAuth flow
      toast.info("Redirecting to OAuth...", "You will be redirected to complete the OAuth authentication.");
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const newDataSource = {
        id: dataSourceId,
        name: dataSource.name,
        type: dataSource.type,
        status: "connected" as const,
        connectedAt: new Date().toISOString(),
        tables: mockTables[dataSource.type] || [],
      };

      addDataSource(newDataSource);
      toast.success(`${dataSource.name} connected successfully`);
      setSelectedDataSource(dataSourceId);
      setShowAddMode(false);
    } catch (error) {
      toast.error("Failed to connect data source");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (dataSourceId: string, file: File) => {
    const dataSource = allDataSources.find((ds) => ds.id === dataSourceId);
    if (!dataSource) return;

    const newDataSource = {
      id: dataSourceId,
      name: file.name,
      type: dataSource.type,
      status: "connected" as const,
      connectedAt: new Date().toISOString(),
      tables: mockTables[dataSource.type] || [],
    };

    addDataSource(newDataSource);
    toast.success("File uploaded successfully");
    setSelectedDataSource(dataSourceId);
    setShowAddMode(false);
  };

  const getConnectionFields = (dataSourceType: string) => {
    const oauthSources = ["google-sheets", "salesforce", "hubspot"];
    const fileSources = ["excel", "csv"];

    if (oauthSources.includes(dataSourceType)) {
      return "oauth";
    }
    if (fileSources.includes(dataSourceType)) {
      return "file";
    }
    return "form";
  };

  const handleSelectTable = (dataSourceId: string, table: string) => {
    const dataSource = getConnectedDataSource(dataSourceId);
    if (!dataSource) return;

    // Get current selected tables (support both old selectedTable and new selectedTables)
    const currentSelected = dataSource.selectedTables || (dataSource.selectedTable ? [dataSource.selectedTable] : []);
    
    // Toggle table selection
    const isSelected = currentSelected.includes(table);
    const newSelectedTables = isSelected
      ? currentSelected.filter((t) => t !== table)
      : [...currentSelected, table];

    updateDataSource(dataSourceId, { 
      selectedTables: newSelectedTables,
      // Keep selectedTable for backward compatibility (use first selected)
      selectedTable: newSelectedTables.length > 0 ? newSelectedTables[0] : undefined
    });

    if (isSelected) {
      toast.success(`Deselected ${table}`, `${newSelectedTables.length} table(s) selected`);
    } else {
      toast.success(`Selected ${table}`, `${newSelectedTables.length} table(s) selected`);
    }
  };

  const handleDisconnect = (dataSourceId: string) => {
    if (confirm("Are you sure you want to disconnect this data source?")) {
      removeDataSource(dataSourceId);
      toast.success("Data source disconnected");
      setSelectedDataSource(null);
    }
  };

  const selectedDataSourceData = selectedDataSource
    ? allDataSources.find((ds) => ds.id === selectedDataSource)
    : null;

  const connectedDataSource = selectedDataSource
    ? getConnectedDataSource(selectedDataSource)
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Data Sources</h1>
          <p className="text-muted-foreground">Connect and manage your data sources</p>
        </div>
        {selectedDataSource && (
          <Button variant="outline" onClick={() => setSelectedDataSource(null)}>
            <X className="mr-2 h-4 w-4" />
            Back to List
        </Button>
        )}
      </div>

      {!selectedDataSource ? (
        // Grid view of all data sources
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {allDataSources.map((dataSource) => {
            const connected = isConnected(dataSource.id);
            const connectedData = getConnectedDataSource(dataSource.id);

            return (
              <Card
                key={dataSource.id}
                className={cn(
                  "relative cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] border-border/50 bg-card",
                  connected && "ring-2 ring-primary/30 border-primary/20"
                )}
                onClick={() => handleDataSourceClick(dataSource.id)}
              >
                {connected && (
                  <Badge
                    className="absolute top-2 right-2 bg-green-500 text-white border-0 shadow-sm z-10"
                    variant="default"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                )}
                {dataSource.enterprise && (
                  <Badge
                    className="absolute top-2 left-2 bg-black text-white text-xs shadow-sm z-10"
                    variant="default"
                  >
                    ENTERPRISE
                  </Badge>
                )}
                <CardContent className="p-1 flex items-center gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-background border rounded-md flex items-center justify-center text-xl">
                    {dataSource.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">
                      {dataSource.name}
                    </div>
                    {connected && connectedData && (
                      <div className="text-xs text-muted-foreground truncate mt-0.5">
                        {(() => {
                          const selectedTables = connectedData.selectedTables || (connectedData.selectedTable ? [connectedData.selectedTable] : []);
                          if (selectedTables.length === 0) return null;
                          if (selectedTables.length === 1) return selectedTables[0];
                          return `${selectedTables.length} tables selected`;
                        })()}
                      </div>
                    )}
                  </div>
          </CardContent>
        </Card>
            );
          })}
        </div>
      ) : (
        // Sheet/Table selection view
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-3xl">{selectedDataSourceData?.icon}</div>
                  <div>
                    <h3 className="font-semibold text-lg">{selectedDataSourceData?.name}</h3>
                    {selectedDataSourceData?.enterprise && (
                      <Badge className="mt-1 bg-black text-white text-xs">ENTERPRISE</Badge>
                    )}
                  </div>
                </div>
                {connectedDataSource ? (
                  <div className="space-y-4">
                    <div>
                      <Badge className="bg-green-500 text-white">
                        <Check className="h-3 w-3 mr-1" />
                        Connected
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Connected on {new Date(connectedDataSource.connectedAt || "").toLocaleDateString()}
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDisconnect(selectedDataSource)}
                      className="w-full"
                    >
                      Disconnect
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Connect to {selectedDataSourceData?.name} to start using it in your dashboards.
                    </p>
                    {selectedDataSourceData && (
                      <>
                        {getConnectionFields(selectedDataSourceData.type) === "oauth" ? (
                          <Button
                            onClick={() => handleOAuthConnect(selectedDataSource)}
                            className="w-full"
                            disabled={loading}
                          >
                            {loading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Connecting...
                              </>
                            ) : (
                              <>
                                <Plus className="mr-2 h-4 w-4" />
                                Connect with OAuth
                              </>
                            )}
                          </Button>
                        ) : getConnectionFields(selectedDataSourceData.type) === "file" ? (
                          <div className="space-y-2">
                            <Input
                              type="file"
                              accept={selectedDataSourceData.type === "excel" ? ".xlsx,.xls" : ".csv"}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleFileUpload(selectedDataSource, file);
                                }
                              }}
                            />
                          </div>
                        ) : (
                          <Button
                            onClick={() => handleConnectClick(selectedDataSource)}
                            className="w-full"
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Connect {selectedDataSourceData.name}
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
                </div>

          <div className="lg:col-span-2">
            {connectedDataSource ? (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">Select Sheet/Table</h3>
                    <div className="flex items-center gap-2">
                      {(() => {
                        const selectedTables = connectedDataSource.selectedTables || (connectedDataSource.selectedTable ? [connectedDataSource.selectedTable] : []);
                        const allTables = connectedDataSource.tables || [];
                        const allSelected = allTables.length > 0 && selectedTables.length === allTables.length;
                        
                        return (
                          <>
                            {selectedTables.length > 0 && (
                              <Badge variant="secondary" className="text-sm">
                                {selectedTables.length} {selectedTables.length === 1 ? 'table' : 'tables'} selected
                              </Badge>
                            )}
                            {allTables.length > 0 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (allSelected) {
                                    // Deselect all
                                    updateDataSource(selectedDataSource, {
                                      selectedTables: [],
                                      selectedTable: undefined
                                    });
                                    toast.info("All tables deselected");
                                  } else {
                                    // Select all
                                    updateDataSource(selectedDataSource, {
                                      selectedTables: allTables,
                                      selectedTable: allTables[0]
                                    });
                                    toast.success(`All ${allTables.length} tables selected`);
                                  }
                                }}
                              >
                                {allSelected ? "Deselect All" : "Select All"}
                              </Button>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                  <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                      {connectedDataSource.tables && connectedDataSource.tables.length > 0 ? (
                        connectedDataSource.tables.map((table) => {
                          const selectedTables = connectedDataSource.selectedTables || (connectedDataSource.selectedTable ? [connectedDataSource.selectedTable] : []);
                          const isSelected = selectedTables.includes(table);
                          return (
                            <Card
                              key={table}
                              className={cn(
                                "cursor-pointer transition-all hover:shadow-md",
                                isSelected && "ring-2 ring-primary bg-primary/5"
                              )}
                              onClick={() => handleSelectTable(selectedDataSource, table)}
                            >
                              <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3 flex-1">
                                  <Checkbox
                                    checked={isSelected}
                                    onCheckedChange={() => handleSelectTable(selectedDataSource, table)}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  <Database className="h-5 w-5 text-muted-foreground" />
                                  <span className="font-medium">{table}</span>
                                </div>
                                {isSelected && (
                                  <Check className="h-5 w-5 text-primary" />
                                )}
                              </CardContent>
                            </Card>
                          );
                        })
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <p>No tables/sheets available</p>
                    </div>
                  )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center py-12">
                    <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Connect to {selectedDataSourceData?.name} to view available tables and sheets.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Connection Sheet */}
      <Sheet open={showConnectionSheet} onOpenChange={(open) => {
        setShowConnectionSheet(open);
        if (!open) {
          setConnectingDataSourceId(null);
          setConnectionTestResult(null);
          form.reset();
        }
      }}>
        <SheetContent side="right" className="w-full sm:max-w-2xl flex flex-col p-0 h-full overflow-hidden">
          {connectingDataSourceId && (
            <>
              <SheetHeader className="px-6 pt-6 pb-4 border-b bg-muted/30 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="text-3xl bg-background p-2 rounded-lg border">
                    {allDataSources.find((ds) => ds.id === connectingDataSourceId)?.icon}
                  </div>
                  <div className="flex-1">
                    <SheetTitle className="text-xl font-semibold">
                      Connect {allDataSources.find((ds) => ds.id === connectingDataSourceId)?.name}
                    </SheetTitle>
                    <SheetDescription className="mt-1.5 text-sm">
                      Enter your connection details to connect this data source
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              <ScrollArea className="flex-1 min-h-0 overflow-y-auto">
                <div className="px-6 py-6">
                  <form onSubmit={form.handleSubmit(handleConnect)} className="space-y-6">
                    {(() => {
                      const dataSource = allDataSources.find((ds) => ds.id === connectingDataSourceId);
                      const schema = dataSource ? connectionSchemas[dataSource.type] : null;

                      if (!schema) {
                        return (
                          <div className="text-center py-8 text-muted-foreground">
                            <p>Connection configuration not available for this data source.</p>
                          </div>
                        );
                      }

                      return (
                        <>
                          {schema.connectionString && (
                            <div className="space-y-2">
                              <Label htmlFor="connectionString" className="text-sm font-medium">
                                Connection String <span className="text-muted-foreground font-normal">(Optional)</span>
                              </Label>
                              <Textarea
                                id="connectionString"
                                placeholder={
                                  dataSource?.type === "postgres"
                                    ? "postgresql://user:password@host:port/database"
                                    : dataSource?.type === "mysql"
                                      ? "mysql://user:password@host:port/database"
                                      : "Enter connection string"
                                }
                                {...form.register("connectionString")}
                                rows={3}
                                className="font-mono text-sm"
                              />
                              <p className="text-xs text-muted-foreground">
                                Or fill in individual fields below
                              </p>
                            </div>
                          )}

                          {schema.connectionString && (
                            <div className="relative">
                              <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                              </div>
                              <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">Or</span>
                              </div>
                            </div>
                          )}

                          <div className="grid gap-4">
                            {schema.fields.map((field) => (
                              <div key={field.name} className="space-y-2">
                                <Label htmlFor={field.name} className="text-sm font-medium">
                                  {field.label}
                                  {field.required && <span className="text-destructive ml-1">*</span>}
                                </Label>
                                {field.type === "textarea" ? (
                                  <Textarea
                                    id={field.name}
                                    placeholder={field.placeholder}
                                    {...form.register(field.name)}
                                    rows={4}
                                    className={field.name === "credentials" || field.name === "headers" ? "font-mono text-sm" : ""}
                                  />
                                ) : (
                                  <Input
                                    id={field.name}
                                    type={field.type}
                                    placeholder={field.placeholder}
                                    {...form.register(field.name)}
                                    className={field.type === "password" ? "font-mono" : ""}
                                  />
                                )}
                                {field.description && (
                                  <p className="text-xs text-muted-foreground">{field.description}</p>
                                )}
                                {form.formState.errors[field.name] && (
                                  <p className="text-xs text-destructive">
                                    {form.formState.errors[field.name]?.message}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>

                          {connectionTestResult && (
                            <div
                              className={cn(
                                "p-4 rounded-lg border",
                                connectionTestResult.success
                                  ? "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"
                                  : "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800"
                              )}
                            >
                              <div className="flex items-start gap-2">
                                {connectionTestResult.success ? (
                                  <Check className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                                ) : (
                                  <X className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                                )}
                                <div className="flex-1">
                                  <p
                                    className={cn(
                                      "text-sm font-medium",
                                      connectionTestResult.success
                                        ? "text-green-800 dark:text-green-200"
                                        : "text-red-800 dark:text-red-200"
                                    )}
                                  >
                                    {connectionTestResult.success ? "Connection Successful" : "Connection Failed"}
                                  </p>
                                  <p
                                    className={cn(
                                      "text-xs mt-1",
                                      connectionTestResult.success
                                        ? "text-green-700 dark:text-green-300"
                                        : "text-red-700 dark:text-red-300"
                                    )}
                                  >
                                    {connectionTestResult.message}
                                  </p>
                                </div>
                              </div>
                    </div>
                  )}
                        </>
                      );
                    })()}
                  </form>
                </div>
              </ScrollArea>

              <SheetFooter className="border-t bg-muted/30 px-6 py-4 gap-2 flex-col sm:flex-row shrink-0">
                <div className="flex gap-2 w-full sm:w-auto order-2 sm:order-1">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowConnectionSheet(false);
                      setConnectingDataSourceId(null);
                      setConnectionTestResult(null);
                      form.reset();
                    }}
                    className="flex-1 sm:flex-initial"
                  >
                    Cancel
                  </Button>
                  {getCurrentSchema()?.testConnection && (
                  <Button
                      type="button"
                      variant="secondary"
                      onClick={handleTestConnection}
                      disabled={testingConnection || loading}
                      className="flex-1 sm:flex-initial"
                    >
                      {testingConnection ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Test Connection
                        </>
                      )}
                  </Button>
                  )}
                </div>
                <Button
                  type="submit"
                  onClick={form.handleSubmit(handleConnect)}
                  disabled={loading || testingConnection}
                  className="w-full sm:w-auto order-1 sm:order-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Connect
                    </>
                  )}
                </Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
