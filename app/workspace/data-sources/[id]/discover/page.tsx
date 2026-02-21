"use client";

import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Database,
  Filter,
  Folder,
  Loader2,
  RefreshCw,
  Table as TableIcon,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/shared";
import {
  useConnection,
  useDataSource,
  useDiscoverSchemaFull,
} from "@/lib/api";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/utils/toast";

type DiscoverSchema = {
  name: string;
  tables?: Array<{
    name: string;
    type?: string;
    columns?: Array<{ name: string; type: string; nullable?: boolean }>;
  }>;
};

type DiscoverDatabase = {
  name: string;
  collections?: Array<{
    name: string;
    type?: string;
    fields?: Array<{ name: string; type: string; nullable?: boolean }>;
  }>;
};

type DiscoverResponse = {
  schemas?: DiscoverSchema[];
  databases?: DiscoverDatabase[];
};

export default function DataSourceDiscoverPage() {
  const params = useParams();
  const router = useRouter();
  const dataSourceId = params.id as string;
  const { currentOrganization } = useWorkspaceStore();
  const organizationId = currentOrganization?.id;

  const { data: dataSourceData, isLoading: dataSourceLoading } = useDataSource(
    organizationId,
    dataSourceId,
  );
  const { data: connection, isLoading: connectionLoading } = useConnection(
    organizationId,
    dataSourceId,
  );
  const [schemaFilter, setSchemaFilter] = useState<string | undefined>(
    undefined,
  );

  const discoverOptions = useMemo(
    () =>
      schemaFilter ? { schemaName: schemaFilter } : undefined,
    [schemaFilter],
  );

  const {
    data: discoverData,
    isLoading: discoverLoading,
    refetch: refetchDiscover,
    isRefetching,
  } = useDiscoverSchemaFull(
    organizationId,
    dataSourceId,
    discoverOptions,
  );

  const [expandedSchemas, setExpandedSchemas] = useState<Set<string>>(new Set());
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set());
  const [expandedDatabases, setExpandedDatabases] = useState<Set<string>>(
    new Set(),
  );
  const [expandedCollections, setExpandedCollections] = useState<Set<string>>(
    new Set(),
  );

  const isLoading = dataSourceLoading || connectionLoading;
  const schemaData = discoverData as DiscoverResponse | undefined;

  const toggleSchema = (key: string) => {
    setExpandedSchemas((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleTable = (key: string) => {
    setExpandedTables((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleDatabase = (key: string) => {
    setExpandedDatabases((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleCollection = (key: string) => {
    setExpandedCollections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Expand first schema/database by default when data loads
  useEffect(() => {
    if (!schemaData) return;
    if (schemaData.schemas && schemaData.schemas.length > 0) {
      setExpandedSchemas(
        (prev) => new Set([...prev, `schema-${schemaData.schemas![0].name}`]),
      );
    }
    if (schemaData.databases && schemaData.databases.length > 0) {
      setExpandedDatabases(
        (prev) => new Set([...prev, `db-${schemaData.databases![0].name}`]),
      );
    }
  }, [schemaData]);

  const handleRefresh = async () => {
    try {
      await refetchDiscover();
      toast.success("Schema refreshed", "Discovery completed successfully.");
    } catch {
      toast.error("Refresh failed", "Could not discover schema.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card>
          <CardContent className="p-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground text-center">
              Loading data source...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!dataSourceData || !connection) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Discover Schema"
          description="Schema discovery for data source"
        />
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-4">
              Data source or connection not found
            </p>
            <Button
              variant="outline"
              onClick={() => router.push("/workspace/data-sources")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Data Sources
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Allow discover when connection exists (with config). Status may be "inactive"
  // until test connection runs, but ETL discover works if credentials are valid.
  const hasSchemas = schemaData?.schemas && schemaData.schemas.length > 0;
  const hasDatabases = schemaData?.databases && schemaData.databases.length > 0;

  const schemaOptions = useMemo(() => {
    const names = new Set<string>();
    if (schemaData?.schemas) {
      schemaData.schemas.forEach((s) => names.add(s.name));
    }
    if (schemaData?.databases) {
      schemaData.databases.forEach((d) => names.add(d.name));
    }
    return Array.from(names).sort();
  }, [schemaData]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Discover Schema"
        description={`Databases, schemas, tables, and columns for ${dataSourceData.name}`}
        action={
          <div className="flex items-center gap-2 flex-wrap">
            {(hasSchemas || hasDatabases) && schemaOptions.length > 0 && (
              <Select
                value={schemaFilter ?? "all"}
                onValueChange={(v) =>
                  setSchemaFilter(v === "all" ? undefined : v)
                }
              >
                <SelectTrigger className="w-[180px] h-9">
                  <Filter className="h-4 w-4 mr-1.5 text-muted-foreground shrink-0" />
                  <SelectValue placeholder="Filter by schema" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All schemas</SelectItem>
                  {schemaOptions.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={discoverLoading || isRefetching}
            >
              {(discoverLoading || isRefetching) ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span className="ml-2">Refresh</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/workspace/data-sources")}
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="ml-2">Back</span>
            </Button>
          </div>
        }
      />

      <Card>
        <CardContent className="p-6">
          {discoverLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !hasSchemas && !hasDatabases ? (
            <div className="text-center py-12 text-muted-foreground">
              <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No schemas or databases discovered.</p>
              <p className="text-sm mt-1">
                Click Refresh to discover the schema.
              </p>
              <p className="text-xs mt-2">
                After discovery, use the schema filter to limit refreshes to a
                specific schema and reduce load time.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* SQL-style: Schemas > Tables > Columns */}
              {hasSchemas &&
                schemaData!.schemas!.map((schema) => {
                  const schemaKey = `schema-${schema.name}`;
                  const isSchemaExpanded = expandedSchemas.has(schemaKey);
                  const tables = schema.tables || [];

                  return (
                    <div key={schemaKey} className="border rounded-lg">
                      <button
                        type="button"
                        className="flex items-center gap-2 w-full p-3 text-left hover:bg-muted/50 rounded-t-lg"
                        onClick={() => toggleSchema(schemaKey)}
                      >
                        {isSchemaExpanded ? (
                          <ChevronDown className="h-4 w-4 shrink-0" />
                        ) : (
                          <ChevronRight className="h-4 w-4 shrink-0" />
                        )}
                        <Folder className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{schema.name}</span>
                        <span className="text-muted-foreground text-sm">
                          ({tables.length} tables)
                        </span>
                      </button>

                      {isSchemaExpanded && (
                        <div className="border-t pl-6">
                          {tables.map((table) => {
                            const tableKey = `${schemaKey}-${table.name}`;
                            const isTableExpanded = expandedTables.has(tableKey);
                            const columns = table.columns || [];

                            return (
                              <div
                                key={tableKey}
                                className="border-b last:border-b-0"
                              >
                                <button
                                  type="button"
                                  className="flex items-center gap-2 w-full p-3 text-left hover:bg-muted/30"
                                  onClick={() => toggleTable(tableKey)}
                                >
                                  {isTableExpanded ? (
                                    <ChevronDown className="h-4 w-4 shrink-0" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4 shrink-0" />
                                  )}
                                  <TableIcon className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">
                                    {table.name}
                                  </span>
                                  {table.type && (
                                    <span className="text-muted-foreground text-xs">
                                      ({table.type})
                                    </span>
                                  )}
                                  <span className="text-muted-foreground text-sm">
                                    ({columns.length} columns)
                                  </span>
                                </button>

                                {isTableExpanded && columns.length > 0 && (
                                  <div className="bg-muted/20 px-4 py-3">
                                    <div className="text-xs font-medium text-muted-foreground mb-2">
                                      Columns
                                    </div>
                                    <div className="space-y-1">
                                      {columns.map((col) => (
                                        <div
                                          key={col.name}
                                          className="flex items-center gap-4 text-sm font-mono"
                                        >
                                          <span className="min-w-[180px]">
                                            {col.name}
                                          </span>
                                          <span
                                            className={cn(
                                              "text-muted-foreground",
                                              col.nullable && "italic",
                                            )}
                                          >
                                            {col.type}
                                            {col.nullable && " (nullable)"}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}

              {/* NoSQL-style: Databases > Collections > Fields */}
              {hasDatabases &&
                schemaData!.databases!.map((db) => {
                  const dbKey = `db-${db.name}`;
                  const isDbExpanded = expandedDatabases.has(dbKey);
                  const collections = db.collections || [];

                  return (
                    <div key={dbKey} className="border rounded-lg">
                      <button
                        type="button"
                        className="flex items-center gap-2 w-full p-3 text-left hover:bg-muted/50 rounded-t-lg"
                        onClick={() => toggleDatabase(dbKey)}
                      >
                        {isDbExpanded ? (
                          <ChevronDown className="h-4 w-4 shrink-0" />
                        ) : (
                          <ChevronRight className="h-4 w-4 shrink-0" />
                        )}
                        <Database className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{db.name}</span>
                        <span className="text-muted-foreground text-sm">
                          ({collections.length} collections)
                        </span>
                      </button>

                      {isDbExpanded && (
                        <div className="border-t pl-6">
                          {collections.map((coll) => {
                            const collKey = `${dbKey}-${coll.name}`;
                            const isCollExpanded =
                              expandedCollections.has(collKey);
                            const fields =
                              (coll as { fields?: Array<{ name: string; type: string; nullable?: boolean }> })
                                .fields || [];

                            return (
                              <div
                                key={collKey}
                                className="border-b last:border-b-0"
                              >
                                <button
                                  type="button"
                                  className="flex items-center gap-2 w-full p-3 text-left hover:bg-muted/30"
                                  onClick={() => toggleCollection(collKey)}
                                >
                                  {isCollExpanded ? (
                                    <ChevronDown className="h-4 w-4 shrink-0" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4 shrink-0" />
                                  )}
                                  <TableIcon className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">
                                    {coll.name}
                                  </span>
                                  {fields.length > 0 && (
                                    <span className="text-muted-foreground text-sm">
                                      ({fields.length} fields)
                                    </span>
                                  )}
                                </button>

                                {isCollExpanded && fields.length > 0 && (
                                  <div className="bg-muted/20 px-4 py-3">
                                    <div className="text-xs font-medium text-muted-foreground mb-2">
                                      Fields
                                    </div>
                                    <div className="space-y-1">
                                      {fields.map((f) => (
                                        <div
                                          key={f.name}
                                          className="flex items-center gap-4 text-sm font-mono"
                                        >
                                          <span className="min-w-[180px]">
                                            {f.name}
                                          </span>
                                          <span
                                            className={cn(
                                              "text-muted-foreground",
                                              f.nullable && "italic",
                                            )}
                                          >
                                            {f.type}
                                            {f.nullable && " (nullable)"}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
