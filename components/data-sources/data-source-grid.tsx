import type { DataSource } from "@/lib/stores/workspace-store";
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
  // Use only provided dataSources (from ETL); never fall back to static allDataSources
  const sourcesToShow = dataSources ?? [];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {sourcesToShow.map((dataSource) => {
        const connected = isConnected(dataSource.id);
        const connectedData = getConnectedDataSource(dataSource.id);
        // All ETL connectors are enabled; only disable when explicitly true
        const isDisabled = dataSource.disabled === true;

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
