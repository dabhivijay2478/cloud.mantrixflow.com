/**
 * API Module Exports
 * Central export point for all API-related functionality
 */

export type {
  ApiDeleteResponse,
  ApiError,
  ApiListResponse,
  ApiResponse,
} from "./client";
// Client
export { ApiClient, ApiClientError } from "./client";

// Config
export { getApiBaseUrl, getApiUrl, getAuthToken } from "./config";
// Constants
export { BASE_PATH, orgPath } from "./constants";
// Error handling
export { getApiErrorMessage, handleApiError } from "./error-handler";
// Hooks - Activity Logs
export * from "./hooks/use-activity-logs";
export { activityLogsKeys } from "./hooks/use-activity-logs";
// Hooks - Connection (new connection management)
export * from "./hooks/use-connection";
export { connectionKeys } from "./hooks/use-connection";
// Hooks - Dashboard
export * from "./hooks/use-dashboard";
export { dashboardKeys } from "./hooks/use-dashboard";
// Hooks - Email Preferences
export * from "./hooks/use-email-preferences";
export { emailPreferencesKeys } from "./hooks/use-email-preferences";
// Hooks - Data Pipelines
export * from "./hooks/use-data-pipelines";
export { dataPipelinesKeys } from "./hooks/use-data-pipelines";
export { usePipelineRunsRealtime } from "./hooks/use-pipeline-runs-realtime";
// Hooks - Data Source (new dynamic data sources)
export * from "./hooks/use-data-source";
export { dataSourceKeys } from "./hooks/use-data-source";
// Hooks - Data Sources (legacy postgres connections)
export {
  dataSourcesKeys,
  useCancelSyncJob,
  useConnection as useConnectionLegacy,
  useConnectionHealth,
  useConnectionMetrics,
  useConnections,
  useCreateConnection,
  useCreateSyncJob,
  useDatabases,
  useDeleteConnection,
  useExecuteQuery,
  useExplainQuery,
  useQueryLogs,
  useSchemas,
  useSchemasWithTables,
  useSyncJob,
  useSyncJobs,
  useTableSchema,
  useTables,
  useTestConnection as useTestConnectionLegacy,
  useUpdateConnection,
  useUpdateSyncJobSchedule,
} from "./hooks/use-data-sources";
// Hooks - Destination Schemas
export * from "./hooks/use-destination-schemas";
export { destinationSchemasKeys } from "./hooks/use-destination-schemas";
// Hooks - Global Search
export * from "./hooks/use-global-search";
export { globalSearchKeys } from "./hooks/use-global-search";
// Hooks - Onboarding
export * from "./hooks/use-onboarding";
export { onboardingKeys } from "./hooks/use-onboarding";
export * from "./hooks/use-organization-members";
export { organizationMembersKeys } from "./hooks/use-organization-members";
// Hooks - Organizations
export * from "./hooks/use-organizations";
export { organizationsKeys } from "./hooks/use-organizations";
// Hooks - Source Schemas
export * from "./hooks/use-source-schemas";
export { sourceSchemasKeys } from "./hooks/use-source-schemas";
// Hooks - Users
export * from "./hooks/use-users";
export { usersKeys } from "./hooks/use-users";
// Services
export { ActivityLogsService } from "./services/activity-logs.service";
export { ConnectionService } from "./services/connection.service";
export { DashboardService } from "./services/dashboard.service";
export { EmailPreferencesService } from "./services/email-preferences.service";
export { DataPipelinesService } from "./services/data-pipelines.service";
export { DataSourceService } from "./services/data-source.service";
export { DataSourcesService } from "./services/data-sources.service";
export { DestinationSchemasService } from "./services/destination-schemas.service";
export { OnboardingService } from "./services/onboarding.service";
export { OrganizationsService } from "./services/organizations.service";
export { SearchService } from "./services/search.service";
export { SourceSchemasService } from "./services/source-schemas.service";
export { UsersService } from "./services/users.service";
export type * from "./types/activity-logs";
export type * from "./types/dashboard";
export type * from "./types/data-pipelines";
// Types
export type * from "./types/data-sources";
export type * from "./types/organizations";
export type * from "./types/users";
