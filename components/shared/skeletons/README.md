# Shared Skeleton System

A comprehensive, reusable skeleton loading system for consistent loading states across the entire application.

## Overview

This skeleton system provides 7 specialized skeleton components that can be composed to create loading states for any page or component. All skeletons use shadcn/ui's `Skeleton` component and follow the application's design system.

## Components

### 1. PageHeaderSkeleton
Skeleton for page headers with title, subtitle, and action buttons.

```tsx
import { PageHeaderSkeleton } from "@/components/shared";

<PageHeaderSkeleton />
<PageHeaderSkeleton showSubtitle={false} showAction={false} />
```

**Props:**
- `showSubtitle?: boolean` - Show subtitle skeleton (default: true)
- `showAction?: boolean` - Show action button skeleton (default: true)
- `showBreadcrumbs?: boolean` - Show breadcrumbs skeleton (default: false)
- `className?: string` - Additional CSS classes

### 2. TableSkeleton
Skeleton for data tables with configurable columns and rows.

```tsx
import { TableSkeleton } from "@/components/shared";

<TableSkeleton columnCount={6} rowCount={8} />
<TableSkeleton columnCount={4} rowCount={5} showCheckbox showAction />
```

**Props:**
- `columnCount?: number` - Number of columns (default: 5)
- `rowCount?: number` - Number of rows (default: 5)
- `showCheckbox?: boolean` - Show checkbox column (default: false)
- `showAction?: boolean` - Show action column (default: false)
- `className?: string` - Additional CSS classes

### 3. DashboardSkeleton
Skeleton for dashboard pages with metric cards, charts, and activity lists.

```tsx
import { DashboardSkeleton } from "@/components/shared";

<DashboardSkeleton />
<DashboardSkeleton metricCardCount={3} showChart={false} />
```

**Props:**
- `metricCardCount?: number` - Number of metric cards (default: 4)
- `showChart?: boolean` - Show chart placeholder (default: true)
- `showActivity?: boolean` - Show activity list (default: true)
- `activityItemCount?: number` - Number of activity items (default: 5)
- `className?: string` - Additional CSS classes

### 4. SettingsSkeleton
Skeleton for settings pages with sections and form fields.

```tsx
import { SettingsSkeleton } from "@/components/shared";

<SettingsSkeleton />
<SettingsSkeleton sectionCount={2} fieldCountPerSection={4} />
```

**Props:**
- `sectionCount?: number` - Number of sections (default: 3)
- `fieldCountPerSection?: number` - Number of form fields per section (default: 3)
- `showSaveButton?: boolean` - Show save button placeholder (default: true)
- `className?: string` - Additional CSS classes

### 5. LogsSkeleton
Skeleton for logs/activity pages combining header, filters, and table.

```tsx
import { LogsSkeleton } from "@/components/shared";

<LogsSkeleton />
<LogsSkeleton columnCount={6} rowCount={10} showFilters={false} />
```

**Props:**
- `columnCount?: number` - Number of table columns (default: 5)
- `rowCount?: number` - Number of table rows (default: 8)
- `showFilters?: boolean` - Show filter bar skeleton (default: true)
- `className?: string` - Additional CSS classes

### 6. AppHeaderSkeleton
Skeleton for app header/organization switcher during initial load.

```tsx
import { AppHeaderSkeleton } from "@/components/shared";

<AppHeaderSkeleton />
<AppHeaderSkeleton showSidebar sidebarItemCount={6} />
```

**Props:**
- `showSidebar?: boolean` - Show sidebar navigation items (default: false)
- `sidebarItemCount?: number` - Number of sidebar items (default: 5)
- `className?: string` - Additional CSS classes

### 7. InlineSkeleton
Common inline skeleton for loading states and transitions.

```tsx
import { InlineSkeleton } from "@/components/shared";

<InlineSkeleton />
<InlineSkeleton size="lg" count={3} />
<InlineSkeleton circular size="md" />
```

**Props:**
- `size?: "sm" | "md" | "lg"` - Size variant (default: "md")
- `count?: number` - Number of skeleton lines (default: 1)
- `circular?: boolean` - Use circular shape (default: false)
- `className?: string` - Additional CSS classes

## Usage Examples

### Page with Header and Table
```tsx
if (isLoading) {
  return (
    <>
      <PageHeaderSkeleton />
      <TableSkeleton columnCount={6} rowCount={8} />
    </>
  );
}
```

### Dashboard Page
```tsx
if (isLoading) {
  return (
    <>
      <PageHeaderSkeleton />
      <DashboardSkeleton />
    </>
  );
}
```

### Settings Page
```tsx
if (isLoading) {
  return (
    <>
      <PageHeaderSkeleton />
      <SettingsSkeleton />
    </>
  );
}
```

### Activity/Logs Page
```tsx
if (isLoading) {
  return <LogsSkeleton />;
}
```

## Best Practices

1. **Match Layout Dimensions**: Skeletons should match the final layout dimensions to prevent layout shifts
2. **Compose Skeletons**: Combine multiple skeletons to match complex page layouts
3. **Use Appropriate Skeletons**: Choose the skeleton that best matches your page structure
4. **Consistent Spacing**: Skeletons use the same spacing as actual content
5. **Responsive Design**: All skeletons respect responsive layouts

## Integration

All skeletons are exported from `@/components/shared`:

```tsx
import {
  PageHeaderSkeleton,
  TableSkeleton,
  DashboardSkeleton,
  SettingsSkeleton,
  LogsSkeleton,
  AppHeaderSkeleton,
  InlineSkeleton,
} from "@/components/shared";
```

## Notes

- The `DataTable` component automatically uses `TableSkeleton` when `isLoading={true}`
- Skeletons use staggered animations for better visual feedback
- All skeletons are fully typed with TypeScript
- Skeletons respect the application's theme and color system
