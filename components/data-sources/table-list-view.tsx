import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Database, Table2, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/utils/toast";

interface TableListViewProps {
  dataSourceId: string;
  tables: string[];
  selectedTables: string[];
  onSelectTable: (table: string) => void;
  onViewTableData: (table: string) => void;
  onUpdateDataSource: (updates: {
    selectedTables: string[];
    selectedTable?: string;
  }) => void;
}

export function TableListView({
  dataSourceId,
  tables,
  selectedTables,
  onSelectTable,
  onViewTableData,
  onUpdateDataSource,
}: TableListViewProps) {
  const router = useRouter();
  const allSelected =
    tables.length > 0 && selectedTables.length === tables.length;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Select Sheet/Table</h3>
          <div className="flex items-center gap-2">
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
            {selectedTables.length > 0 && (
              <Badge variant="secondary" className="text-sm">
                {selectedTables.length}{" "}
                {selectedTables.length === 1 ? "table" : "tables"} selected
              </Badge>
            )}
            {tables.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (allSelected) {
                    onUpdateDataSource({
                      selectedTables: [],
                      selectedTable: undefined,
                    });
                    toast.info("All tables deselected");
                  } else {
                    onUpdateDataSource({
                      selectedTables: tables,
                      selectedTable: tables[0],
                    });
                    toast.success(`All ${tables.length} tables selected`);
                  }
                }}
              >
                {allSelected ? "Deselect All" : "Select All"}
              </Button>
            )}
          </div>
        </div>
        <ScrollArea className="h-[400px]">
          <div className="space-y-2">
            {tables && tables.length > 0 ? (
              tables.map((table) => {
                const isSelected = selectedTables.includes(table);
                return (
                  <Card
                    key={table}
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md",
                      isSelected && "ring-2 ring-primary bg-primary/5",
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div
                          className="flex items-center gap-3 flex-1 cursor-pointer"
                          onClick={() => onSelectTable(table)}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => onSelectTable(table)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <Database className="h-5 w-5 text-muted-foreground" />
                          <span className="font-medium">{table}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {isSelected && (
                            <Check className="h-5 w-5 text-primary" />
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewTableData(table);
                            }}
                            className="h-8"
                          >
                            <Table2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
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
  );
}
