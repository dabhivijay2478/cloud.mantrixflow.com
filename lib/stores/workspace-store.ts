import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

export interface DataSource {
  id: string;
  name: string;
  type:
    | "postgres"
    | "mysql"
    | "mongodb"
    | "bigquery"
    | "snowflake"
    | "redshift"
    | "excel"
    | "csv"
    | "google-sheets"
    | "api"
    | "azure-blob-storage"
    | "customer-io"
    | "milvus"
    | "pinecone"
    | "s3"
    | "databricks"
    | "mssql"
    | "s3-datalake"
    | "snowflake-cortex"
    | "clickhouse"
    | "hubspot"
    | "pgvector"
    | "salesforce"
    | "weaviate";
  status: "connected" | "disconnected" | "error";
  organizationId?: string;
  connectedAt?: string;
  tables?: string[];
  selectedTable?: string; // Keep for backward compatibility
  selectedTables?: string[]; // New field for multiple selection
}

export interface DatasetColumn {
  name: string;
  type: "string" | "number" | "date" | "boolean";
  selected: boolean;
  order: number;
}

export interface SavedQuery {
  id: string;
  name: string;
  query: string;
  dataSourceId: string;
  organizationId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Dataset {
  id: string;
  name: string;
  description?: string;
  dataSourceId: string;
  sourceType: "table" | "custom_query";
  sourceName: string; // table name or query name
  query?: string; // if sourceType is custom_query
  columns: DatasetColumn[];
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface OnboardingState {
  currentStep:
    | "welcome"
    | "organization"
    | "data-source"
    | "connect"
    | "select"
    | "importing"
    | "complete";
  organizationId?: string;
  dataSourceId?: string;
  connectorType?: string;
  completed: boolean;
}

export interface Pipeline {
  id: string;
  name: string;
  type: "bulk" | "stream" | "emit";
  sourceId: string;
  destinationIds: string[];
  status: "active" | "paused" | "error";
  createdAt: string;
  description?: string;
  config?: Record<string, unknown>;
}

interface WorkspaceState {
  // Organizations
  currentOrganization: Organization | null;
  organizations: Organization[];

  // Data Sources
  dataSources: DataSource[];
  currentDataSource: DataSource | null;

  // Datasets
  datasets: Dataset[];
  currentDataset: Dataset | null;

  // Saved Queries
  savedQueries: SavedQuery[];

  // Pipelines
  pipelines: Pipeline[];

  // Onboarding
  onboarding: OnboardingState;

  // UI State
  sidebarOpen: boolean;
  agentPanelOpen: boolean;
  dataPanelOpen: boolean;
  selectedDatasetId: string | null;
}

interface WorkspaceActions {
  // Organization actions
  setCurrentOrganization: (org: Organization | null) => void;
  addOrganization: (org: Organization) => void;
  updateOrganization: (id: string, updates: Partial<Organization>) => void;

  // Data Source actions
  setCurrentDataSource: (source: DataSource | null) => void;
  addDataSource: (source: DataSource) => void;
  updateDataSource: (id: string, updates: Partial<DataSource>) => void;
  removeDataSource: (id: string) => void;

  // Dataset actions
  setCurrentDataset: (dataset: Dataset | null) => void;
  addDataset: (dataset: Dataset) => void;
  updateDataset: (id: string, updates: Partial<Dataset>) => void;
  removeDataset: (id: string) => void;

  // Saved Query actions
  addSavedQuery: (query: SavedQuery) => void;
  updateSavedQuery: (id: string, updates: Partial<SavedQuery>) => void;
  removeSavedQuery: (id: string) => void;

  // Pipeline actions
  addPipeline: (pipeline: Pipeline) => void;
  updatePipeline: (id: string, updates: Partial<Pipeline>) => void;
  removePipeline: (id: string) => void;

  // Onboarding actions
  setOnboardingStep: (step: OnboardingState["currentStep"]) => void;
  updateOnboarding: (updates: Partial<OnboardingState>) => void;
  completeOnboarding: () => void;

  // UI actions
  setSidebarOpen: (open: boolean) => void;
  setAgentPanelOpen: (open: boolean) => void;
  setDataPanelOpen: (open: boolean) => void;
  setSelectedDatasetId: (id: string | null) => void;
  toggleSidebar: () => void;
  toggleAgentPanel: () => void;
}

export const useWorkspaceStore = create<WorkspaceState & WorkspaceActions>()(
  persist(
    (set) => ({
      // Initial state
      currentOrganization: null,
      organizations: [],
      dataSources: [],
      currentDataSource: null,
      datasets: [],
      currentDataset: null,
      savedQueries: [],
      pipelines: [],
      onboarding: {
        currentStep: "welcome",
        completed: false,
      },
      sidebarOpen: true,
      agentPanelOpen: true,
      dataPanelOpen: true,
      selectedDatasetId: null,

      // Organization actions
      setCurrentOrganization: (org) => set({ currentOrganization: org }),
      addOrganization: (org) =>
        set((state) => ({
          organizations: [...state.organizations, org],
          currentOrganization: org,
        })),
      updateOrganization: (id, updates) =>
        set((state) => ({
          organizations: state.organizations.map((org) =>
            org.id === id ? { ...org, ...updates } : org,
          ),
          currentOrganization:
            state.currentOrganization?.id === id
              ? { ...state.currentOrganization, ...updates }
              : state.currentOrganization,
        })),

      // Data Source actions
      setCurrentDataSource: (source) => set({ currentDataSource: source }),
      addDataSource: (source) =>
        set((state) => ({
          dataSources: [...state.dataSources, source],
          currentDataSource: source,
        })),
      updateDataSource: (id, updates) =>
        set((state) => ({
          dataSources: state.dataSources.map((source) =>
            source.id === id ? { ...source, ...updates } : source,
          ),
          currentDataSource:
            state.currentDataSource?.id === id
              ? { ...state.currentDataSource, ...updates }
              : state.currentDataSource,
        })),
      removeDataSource: (id) =>
        set((state) => ({
          dataSources: state.dataSources.filter((source) => source.id !== id),
          currentDataSource:
            state.currentDataSource?.id === id ? null : state.currentDataSource,
        })),

      // Dataset actions
      setCurrentDataset: (dataset) => set({ currentDataset: dataset }),
      addDataset: (dataset) =>
        set((state) => ({
          datasets: [...state.datasets, dataset],
          currentDataset: dataset,
        })),
      updateDataset: (id, updates) =>
        set((state) => ({
          datasets: state.datasets.map((ds) =>
            ds.id === id ? { ...ds, ...updates } : ds,
          ),
          currentDataset:
            state.currentDataset?.id === id
              ? { ...state.currentDataset, ...updates }
              : state.currentDataset,
        })),
      removeDataset: (id) =>
        set((state) => ({
          datasets: state.datasets.filter((ds) => ds.id !== id),
          currentDataset:
            state.currentDataset?.id === id ? null : state.currentDataset,
        })),

      // Saved Query actions
      addSavedQuery: (query) =>
        set((state) => ({
          savedQueries: [...state.savedQueries, query],
        })),
      updateSavedQuery: (id, updates) =>
        set((state) => ({
          savedQueries: state.savedQueries.map((q) =>
            q.id === id ? { ...q, ...updates } : q,
          ),
        })),
      removeSavedQuery: (id) =>
        set((state) => ({
          savedQueries: state.savedQueries.filter((q) => q.id !== id),
        })),

      // Pipeline actions
      addPipeline: (pipeline) =>
        set((state) => ({
          pipelines: [...state.pipelines, pipeline],
        })),
      updatePipeline: (id, updates) =>
        set((state) => ({
          pipelines: state.pipelines.map((pipeline) =>
            pipeline.id === id ? { ...pipeline, ...updates } : pipeline,
          ),
        })),
      removePipeline: (id) =>
        set((state) => ({
          pipelines: state.pipelines.filter((pipeline) => pipeline.id !== id),
        })),

      // Onboarding actions
      setOnboardingStep: (step) =>
        set((state) => ({
          onboarding: { ...state.onboarding, currentStep: step },
        })),
      updateOnboarding: (updates) =>
        set((state) => ({
          onboarding: { ...state.onboarding, ...updates },
        })),
      completeOnboarding: () =>
        set((state) => ({
          onboarding: {
            ...state.onboarding,
            completed: true,
            currentStep: "complete",
          },
        })),

      // UI actions
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setAgentPanelOpen: (open) => set({ agentPanelOpen: open }),
      setDataPanelOpen: (open) => set({ dataPanelOpen: open }),
      setSelectedDatasetId: (id) => set({ selectedDatasetId: id }),
      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      toggleAgentPanel: () =>
        set((state) => ({ agentPanelOpen: !state.agentPanelOpen })),
    }),
    {
      name: "mantrixflow-workspace-storage",
      storage:
        typeof window !== "undefined"
          ? createJSONStorage(() => localStorage)
          : undefined,
      partialize: (state) => ({
        currentOrganization: state.currentOrganization,
        organizations: state.organizations,
        dataSources: state.dataSources,
        datasets: state.datasets,
        savedQueries: state.savedQueries,
        pipelines: state.pipelines,
        onboarding: state.onboarding,
        sidebarOpen: state.sidebarOpen,
        agentPanelOpen: state.agentPanelOpen,
        dataPanelOpen: state.dataPanelOpen,
        selectedDatasetId: state.selectedDatasetId,
      }),
    },
  ),
);
