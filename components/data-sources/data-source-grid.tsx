import { allDataSources } from "./constants";
import { DataSourceCard } from "./data-source-card";

interface DataSourceGridProps {
  isConnected: (id: string) => boolean;
  getConnectedDataSource: (id: string) => any;
  onDataSourceClick: (id: string) => void;
}

export function DataSourceGrid({
  isConnected,
  getConnectedDataSource,
  onDataSourceClick,
}: DataSourceGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
      {allDataSources.map((dataSource) => {
        const connected = isConnected(dataSource.id);
        const connectedData = getConnectedDataSource(dataSource.id);

        return (
          <DataSourceCard
            key={dataSource.id}
            dataSource={dataSource}
            isConnected={connected}
            connectedData={connectedData}
            onClick={() => onDataSourceClick(dataSource.id)}
          />
        );
      })}
    </div>
  );
}
