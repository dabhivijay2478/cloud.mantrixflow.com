import { Table2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SQLResultViewer } from "./sql-result-viewer";

interface TableDataViewProps {
  dataSourceId: string;
  tableName: string;
  tableData: {
    columns: string[];
    rows: Record<string, unknown>[];
  };
  loading: boolean;
  onBack: () => void;
}

export function TableDataView({
  dataSourceId,
  tableName,
  tableData,
  loading,
  onBack,
}: TableDataViewProps) {
  const router = useRouter();

  return (
    <Card className="h-full flex flex-col">
      <CardContent className="p-6 flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <X className="mr-2 h-4 w-4" />
              Back to Tables
            </Button>
            <h3 className="font-semibold text-lg">Table: {tableName}</h3>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              router.push(`/workspace/data-sources/${dataSourceId}/query`)
            }
          >
            <Table2 className="mr-2 h-4 w-4" />
            Query Editor
          </Button>
        </div>
        <div className="flex-1 min-h-0">
          <SQLResultViewer
            columns={tableData.columns}
            rows={tableData.rows}
            loading={loading}
            error={null}
          />
        </div>
      </CardContent>
    </Card>
  );
}
