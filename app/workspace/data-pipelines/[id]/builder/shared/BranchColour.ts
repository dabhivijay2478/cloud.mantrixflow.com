/**
 * Branch colour system for MANTrixFlow Pipeline Builder
 * Applied to: edges, node borders, source handles, BranchGroup, branch labels
 */

export interface BranchColourEntry {
  index: number;
  bg: string;
  border: string;
  hex: string;
  dot: string;
  bgOpacity: string;
}

export const BRANCH_COLOURS: BranchColourEntry[] = [
  {
    index: 0,
    bg: "bg-blue-500/10",
    border: "border-blue-500",
    hex: "#3b82f6",
    dot: "bg-blue-500",
    bgOpacity: "rgba(59, 130, 246, 0.07)",
  },
  {
    index: 1,
    bg: "bg-violet-500/10",
    border: "border-violet-500",
    hex: "#8b5cf6",
    dot: "bg-violet-500",
    bgOpacity: "rgba(139, 92, 246, 0.07)",
  },
  {
    index: 2,
    bg: "bg-amber-500/10",
    border: "border-amber-500",
    hex: "#f59e0b",
    dot: "bg-amber-500",
    bgOpacity: "rgba(245, 158, 11, 0.07)",
  },
  {
    index: 3,
    bg: "bg-rose-500/10",
    border: "border-rose-500",
    hex: "#f43f5e",
    dot: "bg-rose-500",
    bgOpacity: "rgba(244, 63, 94, 0.07)",
  },
  {
    index: 4,
    bg: "bg-emerald-500/10",
    border: "border-emerald-500",
    hex: "#10b981",
    dot: "bg-emerald-500",
    bgOpacity: "rgba(16, 185, 129, 0.07)",
  },
  {
    index: 5,
    bg: "bg-sky-500/10",
    border: "border-sky-500",
    hex: "#0ea5e9",
    dot: "bg-sky-500",
    bgOpacity: "rgba(14, 165, 233, 0.07)",
  },
  {
    index: 6,
    bg: "bg-orange-500/10",
    border: "border-orange-500",
    hex: "#f97316",
    dot: "bg-orange-500",
    bgOpacity: "rgba(249, 115, 22, 0.07)",
  },
];

export function getBranchColour(index: number): BranchColourEntry {
  return BRANCH_COLOURS[index % BRANCH_COLOURS.length];
}
