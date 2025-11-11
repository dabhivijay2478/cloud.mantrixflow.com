"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { Plus, Database, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export default function DataSourcesPage() {
  const router = useRouter();
  const { dataSources, removeDataSource, setCurrentDataSource } = useWorkspaceStore();

  const handleAddDataSource = () => {
    router.push("/onboarding/data-source");
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this data source?")) {
      removeDataSource(id);
      toast.success("Data source deleted");
    }
  };

  const handleSelect = (id: string) => {
    const source = dataSources.find((ds) => ds.id === id);
    if (source) {
      setCurrentDataSource(source);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "bg-green-500";
      case "disconnected":
        return "bg-gray-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Data Sources</h1>
          <p className="text-muted-foreground">Manage your connected data sources</p>
        </div>
        <Button onClick={handleAddDataSource}>
          <Plus className="mr-2 h-4 w-4" />
          Add Data Source
        </Button>
      </div>

      {dataSources.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Database className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No data sources</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Connect your first data source to get started
            </p>
            <Button onClick={handleAddDataSource}>
              <Plus className="mr-2 h-4 w-4" />
              Add Data Source
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dataSources.map((source) => (
            <Card key={source.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Database className="h-5 w-5 text-primary" />
                    <div>
                      <CardTitle className="text-lg">{source.name}</CardTitle>
                      <CardDescription className="capitalize">{source.type}</CardDescription>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={`${getStatusColor(source.status)} text-white border-0`}
                  >
                    {source.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {source.selectedTable && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Table: </span>
                      <span className="font-medium">{source.selectedTable}</span>
                    </div>
                  )}
                  {source.connectedAt && (
                    <div className="text-xs text-muted-foreground">
                      Connected {new Date(source.connectedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSelect(source.id)}
                  >
                    <ExternalLink className="mr-2 h-3 w-3" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(source.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

