import { Check, Table2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getIconComponent } from "./utils";

interface DataSourceCardProps {
  dataSource: {
    id: string;
    name: string;
    type: string;
    iconType: string;
    enterprise?: boolean;
  };
  isConnected: boolean;
  connectedData?: {
    selectedTables?: string[];
    selectedTable?: string;
  };
  onClick: () => void;
}

export function DataSourceCard({
  dataSource,
  isConnected,
  connectedData,
  onClick,
}: DataSourceCardProps) {
  const router = useRouter();

  return (
    <Card
      className={cn(
        "relative cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] border-border/50 bg-card",
        isConnected && "ring-2 ring-primary/30 border-primary/20",
      )}
      onClick={onClick}
    >
      {isConnected && (
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
        <div className="shrink-0 w-10 h-10 bg-background border rounded-md flex items-center justify-center">
          {getIconComponent(dataSource.iconType, 20)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-foreground truncate">
            {dataSource.name}
          </div>
          {isConnected && connectedData && (
            <div className="text-xs text-muted-foreground truncate mt-0.5">
              {(() => {
                const selectedTables =
                  connectedData.selectedTables ||
                  (connectedData.selectedTable
                    ? [connectedData.selectedTable]
                    : []);
                if (selectedTables.length === 0) return null;
                if (selectedTables.length === 1) return selectedTables[0];
                return `${selectedTables.length} tables selected`;
              })()}
            </div>
          )}
        </div>
        {isConnected && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/workspace/data-sources/${dataSource.id}/query`);
            }}
            title="View Tables & Query"
          >
            <Table2 className="h-4 w-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
