/**
 * ETL Connectors hook — fetches available sources and destinations from the ETL registry.
 * Uses api/connectors/metadata (real ETL only, no fallback).
 */

import { useQuery } from "@tanstack/react-query";
import { EtlService } from "../services/etl.service";

export const etlConnectorsKeys = {
  all: ["etl-connectors"] as const,
  list: (organizationId?: string) =>
    ["etl-connectors", "list", organizationId] as const,
};

export function useEtlConnectors(organizationId?: string) {
  return useQuery({
    queryKey: etlConnectorsKeys.list(organizationId),
    queryFn: () => EtlService.listConnectors(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: true,
  });
}
