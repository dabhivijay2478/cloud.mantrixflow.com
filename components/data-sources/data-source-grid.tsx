import type { DataSource } from "@/lib/stores/workspace-store";
import { allDataSources } from "./constants";
import { DataSourceCard } from "./data-source-card";

interface DataSourceGridProps {
  dataSources?: Array<{
    id: string;
    name: string;
    type: string;
    iconType: string;
    enterprise?: boolean;
    disabled?: boolean;
  }>;
  isConnected: (id: string) => boolean;
  getConnectedDataSource: (id: string) => DataSource | undefined;
  onDataSourceClick: (id: string) => void;
}

export function DataSourceGrid({
  dataSources,
  isConnected,
  getConnectedDataSource,
  onDataSourceClick,
}: DataSourceGridProps) {
  const sourcesToShow = dataSources || allDataSources;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {sourcesToShow.map((dataSource) => {
        const connected = isConnected(dataSource.id);
        const connectedData = getConnectedDataSource(dataSource.id);
        const isDisabled = "disabled" in dataSource && dataSource.disabled;

        return (
          <DataSourceCard
            key={dataSource.id}
            dataSource={dataSource}
            isConnected={connected}
            connectedData={connectedData}
            onClick={() => !isDisabled && onDataSourceClick(dataSource.id)}
            disabled={isDisabled}
          />
        );
      })}
    </div>
  );
}
