/**
 * Connector Metadata TanStack Query Hooks
 * Fetches connector field schemas for dynamic connection forms.
 */

import { useQuery } from "@tanstack/react-query";
import { ConnectorsService } from "../services/connectors.service";

export const connectorMetadataKeys = {
  all: ["connector-metadata"] as const,
  metadata: () => [...connectorMetadataKeys.all, "metadata"] as const,
};

/**
 * Get connector metadata for all supported source types.
 * Used to build connection forms dynamically from API instead of hardcoded constants.
 */
export function useConnectorMetadata() {
  return useQuery({
    queryKey: connectorMetadataKeys.metadata(),
    queryFn: () => ConnectorsService.getMetadata(),
    staleTime: 5 * 60 * 1000, // 5 minutes - metadata rarely changes
  });
}
