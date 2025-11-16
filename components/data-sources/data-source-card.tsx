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
        "group relative cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] active:scale-[0.98] border",
        isConnected && "ring-2 ring-primary/20 border-primary/30",
      )}
      onClick={onClick}
    >
      {isConnected && (
        <Badge
          className="absolute top-2 right-2 bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))] border-0 shadow-sm z-10"
          variant="default"
        >
          <Check className="h-3 w-3 mr-1" />
          Connected
        </Badge>
      )}
      {dataSource.enterprise && (
        <Badge
          className="absolute top-2 left-2 bg-foreground text-background text-xs shadow-sm z-10 font-semibold"
          variant="default"
        >
          ENTERPRISE
        </Badge>
      )}
      <CardContent className="p-4 flex items-center gap-3">
        <div className="shrink-0 w-12 h-12 bg-muted border rounded-lg flex items-center justify-center transition-colors group-hover:bg-muted/80">
          {getIconComponent(dataSource.iconType, 24)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-foreground truncate">
            {dataSource.name}
          </div>
          {isConnected && connectedData && (
            <div className="text-xs text-muted-foreground truncate mt-1">
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
            className="h-8 w-8 p-0 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/workspace/data-sources/${dataSource.id}/query`);
            }}
            title="View Tables & Query"
            aria-label="View Tables & Query"
          >
            <Table2 className="h-4 w-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
