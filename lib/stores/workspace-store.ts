import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface Organization {
  id: string
  name: string
  slug: string
  createdAt: string
}

export interface DataSource {
  id: string
  name: string
  type: 'postgres' | 'mysql' | 'mongodb' | 'bigquery' | 'snowflake' | 'redshift' | 'excel' | 'csv' | 'google-sheets' | 'api' | 'azure-blob-storage' | 'customer-io' | 'milvus' | 'pinecone' | 's3' | 'databricks' | 'mssql' | 's3-datalake' | 'snowflake-cortex' | 'clickhouse' | 'hubspot' | 'pgvector' | 'salesforce' | 'weaviate'
  status: 'connected' | 'disconnected' | 'error'
  connectedAt?: string
  tables?: string[]
  selectedTable?: string
}

export interface Dashboard {
  id: string
  name: string
  description?: string
  organizationId: string
  dataSourceId?: string
  createdAt: string
  updatedAt: string
  components: DashboardComponent[]
}

export interface DashboardComponent {
  id: string
  type: string
  position: { x: number; y: number; w: number; h: number }
  config: Record<string, unknown>
}

export interface OnboardingState {
  currentStep: 'welcome' | 'organization' | 'data-source' | 'connect' | 'select' | 'importing' | 'first-dashboard' | 'complete'
  organizationId?: string
  dataSourceId?: string
  connectorType?: string
  completed: boolean
}

interface WorkspaceState {
  // Organizations
  currentOrganization: Organization | null
  organizations: Organization[]
  
  // Data Sources
  dataSources: DataSource[]
  currentDataSource: DataSource | null
  
  // Dashboards
  dashboards: Dashboard[]
  currentDashboard: Dashboard | null
  
  // Onboarding
  onboarding: OnboardingState
  
  // UI State
  sidebarOpen: boolean
  componentsPanelOpen: boolean
  agentPanelOpen: boolean
}

interface WorkspaceActions {
  // Organization actions
  setCurrentOrganization: (org: Organization | null) => void
  addOrganization: (org: Organization) => void
  updateOrganization: (id: string, updates: Partial<Organization>) => void
  
  // Data Source actions
  setCurrentDataSource: (source: DataSource | null) => void
  addDataSource: (source: DataSource) => void
  updateDataSource: (id: string, updates: Partial<DataSource>) => void
  removeDataSource: (id: string) => void
  
  // Dashboard actions
  setCurrentDashboard: (dashboard: Dashboard | null) => void
  addDashboard: (dashboard: Dashboard) => void
  updateDashboard: (id: string, updates: Partial<Dashboard>) => void
  removeDashboard: (id: string) => void
  addComponentToDashboard: (dashboardId: string, component: DashboardComponent) => void
  updateDashboardComponent: (dashboardId: string, componentId: string, updates: Partial<DashboardComponent>) => void
  removeDashboardComponent: (dashboardId: string, componentId: string) => void
  
  // Onboarding actions
  setOnboardingStep: (step: OnboardingState['currentStep']) => void
  updateOnboarding: (updates: Partial<OnboardingState>) => void
  completeOnboarding: () => void
  
  // UI actions
  setSidebarOpen: (open: boolean) => void
  setComponentsPanelOpen: (open: boolean) => void
  setAgentPanelOpen: (open: boolean) => void
  toggleSidebar: () => void
  toggleComponentsPanel: () => void
  toggleAgentPanel: () => void
}

export const useWorkspaceStore = create<WorkspaceState & WorkspaceActions>()(
  persist(
    (set, get) => ({
      // Initial state
      currentOrganization: null,
      organizations: [],
      dataSources: [],
      currentDataSource: null,
      dashboards: [],
      currentDashboard: null,
      onboarding: {
        currentStep: 'welcome',
        completed: false,
      },
      sidebarOpen: true,
      componentsPanelOpen: true,
      agentPanelOpen: true,
      
      // Organization actions
      setCurrentOrganization: (org) => set({ currentOrganization: org }),
      addOrganization: (org) => set((state) => ({
        organizations: [...state.organizations, org],
        currentOrganization: org,
      })),
      updateOrganization: (id, updates) => set((state) => ({
        organizations: state.organizations.map((org) =>
          org.id === id ? { ...org, ...updates } : org
        ),
        currentOrganization:
          state.currentOrganization?.id === id
            ? { ...state.currentOrganization, ...updates }
            : state.currentOrganization,
      })),
      
      // Data Source actions
      setCurrentDataSource: (source) => set({ currentDataSource: source }),
      addDataSource: (source) => set((state) => ({
        dataSources: [...state.dataSources, source],
        currentDataSource: source,
      })),
      updateDataSource: (id, updates) => set((state) => ({
        dataSources: state.dataSources.map((source) =>
          source.id === id ? { ...source, ...updates } : source
        ),
        currentDataSource:
          state.currentDataSource?.id === id
            ? { ...state.currentDataSource, ...updates }
            : state.currentDataSource,
      })),
      removeDataSource: (id) => set((state) => ({
        dataSources: state.dataSources.filter((source) => source.id !== id),
        currentDataSource:
          state.currentDataSource?.id === id ? null : state.currentDataSource,
      })),
      
      // Dashboard actions
      setCurrentDashboard: (dashboard) => set({ currentDashboard: dashboard }),
      addDashboard: (dashboard) => set((state) => ({
        dashboards: [...state.dashboards, dashboard],
        currentDashboard: dashboard,
      })),
      updateDashboard: (id, updates) => set((state) => ({
        dashboards: state.dashboards.map((dash) =>
          dash.id === id ? { ...dash, ...updates } : dash
        ),
        currentDashboard:
          state.currentDashboard?.id === id
            ? { ...state.currentDashboard, ...updates }
            : state.currentDashboard,
      })),
      removeDashboard: (id) => set((state) => ({
        dashboards: state.dashboards.filter((dash) => dash.id !== id),
        currentDashboard:
          state.currentDashboard?.id === id ? null : state.currentDashboard,
      })),
      addComponentToDashboard: (dashboardId, component) => set((state) => ({
        dashboards: state.dashboards.map((dash) =>
          dash.id === dashboardId
            ? { ...dash, components: [...dash.components, component] }
            : dash
        ),
        currentDashboard:
          state.currentDashboard?.id === dashboardId
            ? {
                ...state.currentDashboard,
                components: [...state.currentDashboard.components, component],
              }
            : state.currentDashboard,
      })),
      updateDashboardComponent: (dashboardId, componentId, updates) => set((state) => ({
        dashboards: state.dashboards.map((dash) =>
          dash.id === dashboardId
            ? {
                ...dash,
                components: dash.components.map((comp) =>
                  comp.id === componentId ? { ...comp, ...updates } : comp
                ),
              }
            : dash
        ),
        currentDashboard:
          state.currentDashboard?.id === dashboardId
            ? {
                ...state.currentDashboard,
                components: state.currentDashboard.components.map((comp) =>
                  comp.id === componentId ? { ...comp, ...updates } : comp
                ),
              }
            : state.currentDashboard,
      })),
      removeDashboardComponent: (dashboardId, componentId) => set((state) => ({
        dashboards: state.dashboards.map((dash) =>
          dash.id === dashboardId
            ? {
                ...dash,
                components: dash.components.filter((comp) => comp.id !== componentId),
              }
            : dash
        ),
        currentDashboard:
          state.currentDashboard?.id === dashboardId
            ? {
                ...state.currentDashboard,
                components: state.currentDashboard.components.filter(
                  (comp) => comp.id !== componentId
                ),
              }
            : state.currentDashboard,
      })),
      
      // Onboarding actions
      setOnboardingStep: (step) => set((state) => ({
        onboarding: { ...state.onboarding, currentStep: step },
      })),
      updateOnboarding: (updates) => set((state) => ({
        onboarding: { ...state.onboarding, ...updates },
      })),
      completeOnboarding: () => set((state) => ({
        onboarding: { ...state.onboarding, completed: true, currentStep: 'complete' },
      })),
      
      // UI actions
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setComponentsPanelOpen: (open) => set({ componentsPanelOpen: open }),
      setAgentPanelOpen: (open) => set({ agentPanelOpen: open }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      toggleComponentsPanel: () => set((state) => ({ componentsPanelOpen: !state.componentsPanelOpen })),
      toggleAgentPanel: () => set((state) => ({ agentPanelOpen: !state.agentPanelOpen })),
    }),
    {
      name: 'mantrixflow-workspace-storage',
      storage: typeof window !== 'undefined' ? createJSONStorage(() => localStorage) : undefined,
      partialize: (state) => ({
        currentOrganization: state.currentOrganization,
        organizations: state.organizations,
        dataSources: state.dataSources,
        dashboards: state.dashboards,
        onboarding: state.onboarding,
        sidebarOpen: state.sidebarOpen,
        componentsPanelOpen: state.componentsPanelOpen,
        agentPanelOpen: state.agentPanelOpen,
      }),
    }
  )
)

