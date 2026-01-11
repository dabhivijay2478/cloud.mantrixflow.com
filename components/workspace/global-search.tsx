"use client";

import { Database, Loader2, Plug, Search, User, Workflow } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useDebounce } from "@/hooks/use-debounce";
import { useGlobalSearch } from "@/lib/api";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { cn } from "@/lib/utils";

const ENTITY_ICONS: Record<string, typeof User> = {
  user: User,
  pipeline: Workflow,
  "data-source": Database,
  connector: Plug,
};

const ENTITY_LABELS: Record<string, string> = {
  user: "TEAM MEMBERS",
  pipeline: "PIPELINES",
  "data-source": "DATA SOURCES",
  connector: "CONNECTORS",
};

interface GlobalSearchProps {
  className?: string;
}

export function GlobalSearch({ className }: GlobalSearchProps) {
  const router = useRouter();
  const { currentOrganization } = useWorkspaceStore();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);

  // Search request
  const searchRequest =
    currentOrganization && debouncedQuery.trim()
      ? {
          organizationId: currentOrganization.id,
          query: debouncedQuery.trim(),
          limit: 5,
        }
      : null;

  const { data: searchResults, isLoading } = useGlobalSearch(searchRequest, {
    enabled: !!searchRequest,
  });

  // Group results by entity type, filtering out connectors (they're in progress)
  const groupedResults =
    searchResults?.results
      .filter((result) => result.type !== "connector") // Filter out connectors
      .reduce(
        (acc, result) => {
          if (!acc[result.type]) {
            acc[result.type] = [];
          }
          acc[result.type].push(result);
          return acc;
        },
        {} as Record<
          string,
          Array<{
            type: string;
            id: string;
            title: string;
            subtitle?: string;
            redirect: string;
            filterKey: string;
            filterValue: string;
          }>
        >,
      ) || {};

  const handleResultClick = useCallback(
    (result: {
      redirect: string;
      filterValue: string;
      type?: string;
      id?: string;
    }) => {
      // Don't navigate if it's a connector (disabled)
      if (result.type === "connector") {
        return;
      }

      setOpen(false);
      setQuery("");

      // For all types (including data sources), navigate to redirect URL with search param
      // This applies the search filter to the list page
      const url = new URL(result.redirect, window.location.origin);
      url.searchParams.set("search", result.filterValue);
      router.push(url.pathname + url.search);
    },
    [router],
  );

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        setOpen(true);
      }
      if (event.key === "Escape" && open) {
        setOpen(false);
        setQuery("");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const hasResults = searchResults && searchResults.results.length > 0;

  return (
    <>
      {/* Search Input Trigger */}
      <button
        type="button"
        className={cn("relative w-full cursor-pointer group", className)}
        onClick={() => setOpen(true)}
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none group-hover:text-foreground transition-colors" />
        <div className="w-full pl-9 pr-20 h-9 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background flex items-center text-muted-foreground group-hover:border-ring transition-colors">
          <span className="truncate">Run a command or search...</span>
        </div>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>
      </button>

      {/* Command Dialog - Styled like the image */}
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Search"
        description="Search across data sources, pipelines, and team members"
        className="max-w-2xl"
      >
        <Command
          className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider"
          shouldFilter={false}
          loop
        >
          <CommandInput
            placeholder="Search pipelines, data sources, and team members..."
            value={query}
            onValueChange={setQuery}
            className="h-12 text-base"
            autoFocus
            // showEscHint={true}
          />
          <CommandList className="max-h-[400px]">
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}

            {!isLoading && !hasResults && debouncedQuery.trim() && (
              <CommandEmpty className="py-8 text-sm text-muted-foreground">
                No results found.
              </CommandEmpty>
            )}

            {!isLoading && !debouncedQuery.trim() && (
              <>
                <CommandGroup heading="SEARCH TIPS">
                  <CommandItem
                    value="tip-team-members"
                    disabled
                    className="cursor-default"
                  >
                    <User className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="text-sm">
                        <span className="font-medium">Team Members:</span>
                        <span className="text-muted-foreground ml-1">
                          Search by name or email
                        </span>
                      </div>
                    </div>
                  </CommandItem>
                  <CommandItem
                    value="tip-pipelines"
                    disabled
                    className="cursor-default"
                  >
                    <Workflow className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="text-sm">
                        <span className="font-medium">Pipelines:</span>
                        <span className="text-muted-foreground ml-1">
                          Search by pipeline name or description
                        </span>
                      </div>
                    </div>
                  </CommandItem>
                  <CommandItem
                    value="tip-data-sources"
                    disabled
                    className="cursor-default"
                  >
                    <Database className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="text-sm">
                        <span className="font-medium">Data Sources:</span>
                        <span className="text-muted-foreground ml-1">
                          Search by connection name, connectors, host, or
                          database
                        </span>
                      </div>
                    </div>
                  </CommandItem>
                  {/* <CommandItem
                    value="tip-connectors"
                    disabled
                    className="cursor-default opacity-60"
                  >
                    <Plug className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="text-sm flex items-center gap-2">
                        <span className="font-medium">Connectors:</span>
                        <Badge variant="outline" className="text-xs">
                          Coming Soon
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground mt-0.5">
                        Search connectors by name or host
                      </span>
                    </div>
                  </CommandItem> */}
                </CommandGroup>
                <div className="border-t px-3 py-2 mt-2">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                        ↑
                      </kbd>
                      <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                        ↓
                      </kbd>
                      <span>to navigate</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                        ↵
                      </kbd>
                      <span>to select</span>
                    </div>
                    <div className="flex items-center gap-1.5 ml-auto">
                      <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                        Esc
                      </kbd>
                      <span>to close</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {!isLoading &&
              hasResults &&
              searchResults &&
              Object.entries(groupedResults).map(([type, results]) => {
                const Icon = ENTITY_ICONS[type] || Search;
                const label = ENTITY_LABELS[type] || type.toUpperCase();
                const isConnector = type === "connector";

                return (
                  <CommandGroup key={type} heading={label}>
                    {results.map((result, index) => {
                      const isDisabled = isConnector;
                      // Create a unique value for keyboard navigation
                      const itemValue = `${result.type}-${result.id}-${index}-${result.title.toLowerCase().replace(/\s+/g, "-")}`;

                      return (
                        <CommandItem
                          key={`${result.type}-${result.id}`}
                          value={itemValue}
                          onSelect={() => {
                            if (!isDisabled) {
                              handleResultClick({
                                ...result,
                                type: result.type,
                              });
                            }
                          }}
                          disabled={isDisabled}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-sm data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground",
                            isDisabled
                              ? "cursor-not-allowed opacity-60"
                              : "cursor-pointer",
                          )}
                        >
                          <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                          <div className="flex flex-col flex-1 min-w-0">
                            <div className="font-medium text-sm truncate flex items-center gap-2">
                              {result.title}
                              {isDisabled && (
                                <Badge
                                  variant="outline"
                                  className="text-xs shrink-0"
                                >
                                  Coming Soon
                                </Badge>
                              )}
                            </div>
                            {result.subtitle && (
                              <div className="text-xs text-muted-foreground truncate mt-0.5">
                                {result.subtitle}
                              </div>
                            )}
                          </div>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                );
              })}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
