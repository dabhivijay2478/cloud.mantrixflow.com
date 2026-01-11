/**
 * Global Search TanStack Query Hook
 */

import { useQuery } from "@tanstack/react-query";
import { SearchService, type SearchRequest } from "../services/search.service";

export const globalSearchKeys = {
  all: ["global-search"] as const,
  search: (request: SearchRequest) =>
    [...globalSearchKeys.all, "search", request] as const,
};

export function useGlobalSearch(
  request: SearchRequest | null,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: request
      ? globalSearchKeys.search(request)
      : globalSearchKeys.all,
    queryFn: () => {
      if (!request) {
        throw new Error("Search request is required");
      }
      return SearchService.search(request);
    },
    enabled: options?.enabled !== false && !!request && !!request.query.trim(),
    staleTime: 30 * 1000, // 30 seconds
  });
}
