import { Check, Loader2, Plus, Table2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { allDataSources } from "./constants";
import { getConnectionFields, getIconComponent } from "./utils";

interface DataSourceDetailProps {
  dataSourceId: string;
  connectedDataSource?: {
    status: string;
    connectedAt?: string;
    selectedTables?: string[];
    selectedTable?: string;
  };
  onConnect: () => void;
  onOAuthConnect: () => void;
  onFileUpload: (file: File) => void;
  onDisconnect: () => void;
  loading?: boolean;
}

export function DataSourceDetail({
  dataSourceId,
  connectedDataSource,
  onConnect,
  onOAuthConnect,
  onFileUpload,
  onDisconnect,
  loading = false,
}: DataSourceDetailProps) {
  const router = useRouter();
  const dataSource = allDataSources.find((ds) => ds.id === dataSourceId);

  if (!dataSource) return null;

  const connectionType = getConnectionFields(dataSource.type);

  return (
    <Card className="border">
      <CardContent className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 border">
            {getIconComponent(dataSource.iconType, 24)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg tracking-tight">
              {dataSource.name}
            </h3>
            {dataSource.enterprise && (
              <Badge className="mt-2 bg-foreground text-background text-xs font-semibold">
                ENTERPRISE
              </Badge>
            )}
          </div>
        </div>
        {connectedDataSource ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge className="bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))] border-0 font-medium">
                <Check className="h-3 w-3 mr-1" />
                Connected
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              Connected on{" "}
              <span className="font-medium">
                {new Date(
                  connectedDataSource.connectedAt || "",
                ).toLocaleDateString()}
              </span>
            </div>
            <div className="space-y-2 pt-2 border-t">
              <Button
                variant="default"
                size="sm"
                onClick={() =>
                  router.push(`/workspace/data-sources/${dataSourceId}/query`)
                }
                className="w-full"
              >
                <Table2 className="mr-2 h-4 w-4" />
                View Tables & Query
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onDisconnect}
                className="w-full"
              >
                Disconnect
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Connect to {dataSource.name} to start using it in your dashboards.
            </p>
            {connectionType === "oauth" ? (
              <Button
                onClick={onOAuthConnect}
                className="w-full"
                disabled={loading}
                size="lg"
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
            ) : connectionType === "file" ? (
              <div className="space-y-2">
                <input
                  type="file"
                  accept={dataSource.type === "excel" ? ".xlsx,.xls" : ".csv"}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      onFileUpload(file);
                    }
                  }}
                  className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
              </div>
            ) : (
              <Button onClick={onConnect} className="w-full" size="lg">
                <Plus className="mr-2 h-4 w-4" />
                Connect {dataSource.name}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
