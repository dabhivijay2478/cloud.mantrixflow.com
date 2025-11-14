/**
 * Shared Components Barrel Export
 * @description Centralized exports for all shared components
 */

// Layout Components
export { PageHeader, type PageHeaderProps } from "./layout/page-header";
export { PageContainer, type PageContainerProps } from "./layout/page-container";
export { CenteredCardLayout, type CenteredCardLayoutProps } from "./layout/centered-card-layout";
export { Section, type SectionProps } from "./layout/section";

// Feedback Components
export { LoadingState, type LoadingStateProps } from "./feedback/loading-state";
export { EmptyState, type EmptyStateProps } from "./feedback/empty-state";
export { ErrorState, type ErrorStateProps } from "./feedback/error-state";

// Navigation Components
export { BackButton, type BackButtonProps } from "./navigation/back-button";
export { StepIndicator, type StepIndicatorProps, type Step } from "./navigation/step-indicator";

// Data Display Components
export { Timestamp, type TimestampProps } from "./data-display/timestamp";

// Form Components
export { FormSection, type FormSectionProps } from "./forms/form-section";
export { FormActions, type FormActionsProps } from "./forms/form-actions";
export { FormFieldWrapper, type FormFieldWrapperProps } from "./forms/form-field-wrapper";

