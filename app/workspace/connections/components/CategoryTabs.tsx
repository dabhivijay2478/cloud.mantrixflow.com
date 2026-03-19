"use client";

import { cn } from "@/lib/utils";

export type CategoryFilter =
  | "all"
  | "databases"
  | "warehouses"
  | "saas"
  | "files";

const CATEGORIES: { value: CategoryFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "databases", label: "Databases" },
  { value: "warehouses", label: "Warehouses & Lakes" },
  { value: "saas", label: "SaaS & APIs" },
  { value: "files", label: "Files & Storage" },
];

interface CategoryTabsProps {
  value: CategoryFilter;
  onChange: (value: CategoryFilter) => void;
  className?: string;
}

export function CategoryTabs({ value, onChange, className }: CategoryTabsProps) {
  return (
    <div
      className={cn(
        "flex gap-1 overflow-x-auto pb-2 scrollbar-thin",
        className,
      )}
    >
      {CATEGORIES.map((cat) => (
        <button
          key={cat.value}
          type="button"
          onClick={() => onChange(cat.value)}
          className={cn(
            "shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition-colors whitespace-nowrap",
            value === cat.value
              ? "bg-primary text-primary-foreground"
              : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}
