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
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center">
            {getIconComponent(dataSource.iconType, 32)}
          </div>
          <div>
            <h3 className="font-semibold text-lg">{dataSource.name}</h3>
            {dataSource.enterprise && (
              <Badge className="mt-1 bg-black text-white text-xs">
                ENTERPRISE
              </Badge>
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
              Connected on{" "}
              {new Date(
                connectedDataSource.connectedAt || "",
              ).toLocaleDateString()}
            </div>
            <div className="space-y-2">
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
                variant="destructive"
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
                  className="w-full text-sm"
                />
              </div>
            ) : (
              <Button onClick={onConnect} className="w-full">
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
