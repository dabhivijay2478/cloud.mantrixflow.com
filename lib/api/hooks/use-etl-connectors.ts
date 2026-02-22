/**
 * ETL Connectors hook — fetches available sources and destinations from the ETL registry.
 * Uses api/etl/connectors (public, no auth). Falls back to static list when API unreachable.
 */

import { useQuery } from "@tanstack/react-query";
import { getFallbackConnectors } from "../connector-fallback";
import { EtlService } from "../services/etl.service";

export const etlConnectorsKeys = {
  all: ["etl-connectors"] as const,
  list: ["etl-connectors", "list"] as const,
};

export function useEtlConnectors(_organizationId?: string) {
  return useQuery({
    queryKey: etlConnectorsKeys.list,
    queryFn: async () => {
      try {
        return await EtlService.listConnectors();
      } catch {
        return getFallbackConnectors();
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: true,
  });
}
