"use client"

import {
  Database,
  Flame,
  ShieldCheck,
  Cloud,
  BarChart3,
  FolderGit2,
  Github,
  GitBranch,
  FileText,
} from "lucide-react"
import { Button } from "@/components/ui/button"

type ConnectorCategory = "Databases" | "Warehouses and Lakes" | "Marketing Analytics" | "Unstructured"

interface Connector {
  name: string
  category: ConnectorCategory
  popular?: boolean
  icon?: React.ComponentType<{ className?: string }>
  iconColor?: string
}

const CONNECTORS: Connector[] = [
  // Databases
  { name: "Postgres", category: "Databases", popular: true, icon: Database, iconColor: "#336791" },
  { name: "Postgres destination", category: "Databases", popular: true, icon: Database, iconColor: "#336791" },
  { name: "MySQL", category: "Databases", icon: Database, iconColor: "#4479A1" },
  { name: "MySQL destination", category: "Databases", icon: Database, iconColor: "#4479A1" },
  // Warehouses and Lakes
  { name: "BigQuery", category: "Warehouses and Lakes", popular: true, icon: Cloud, iconColor: "#4285F4" },
  { name: "Redshift", category: "Warehouses and Lakes", icon: Cloud, iconColor: "#FF9900" },
  { name: "Azure Blob Storage", category: "Warehouses and Lakes", icon: Cloud, iconColor: "#0078D4" },
  // Marketing Analytics
  { name: "Facebook Marketing", category: "Marketing Analytics", icon: BarChart3, iconColor: "#1877F2" },
  { name: "Google Ads", category: "Marketing Analytics", popular: true, icon: BarChart3, iconColor: "#4285F4" },
  { name: "Google Analytics", category: "Marketing Analytics", icon: BarChart3, iconColor: "#FFC107" },
  { name: "HubSpot", category: "Marketing Analytics", icon: BarChart3, iconColor: "#FF7A59" },
  // Unstructured
  { name: "GitHub", category: "Unstructured", icon: Github, iconColor: "#181717" },
  { name: "GitLab", category: "Unstructured", icon: GitBranch, iconColor: "#FC6D26" },
  { name: "Google Drive", category: "Unstructured", icon: Cloud, iconColor: "#4285F4" },
  { name: "Microsoft OneDrive", category: "Unstructured", icon: Cloud, iconColor: "#0078D4" },
  { name: "Microsoft SharePoint", category: "Unstructured", icon: FolderGit2, iconColor: "#0078D4" },
  { name: "Notion", category: "Unstructured", icon: FileText, iconColor: "#000000" },
]

function ConnectorIcon({ icon: Icon, iconColor }: { icon?: React.ComponentType<{ className?: string }>; iconColor?: string }) {
  if (!Icon) {
    return (
      <div className="h-8 w-8 rounded bg-white/10 flex items-center justify-center">
        <span className="text-[10px] text-[#A7ABB3]">?</span>
      </div>
    )
  }

  return (
    <div
      className="h-8 w-8 rounded flex items-center justify-center"
      style={{ backgroundColor: iconColor || "rgba(255, 255, 255, 0.1)" }}
    >
      <Icon className="h-5 w-5 text-white" />
    </div>
  )
}

export default function ConnectorsPage() {
  return (
    <main className="min-h-screen bg-[#0B0C0F] text-[#F2F3F5]">
      <section className="max-w-6xl mx-auto px-4 pt-28 pb-16">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-[#A7ABB3]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Connectors
          </div>
          <h1 className="mt-4 font-serif text-4xl md:text-5xl font-medium leading-tight">
            Connect your modern data stack
          </h1>
          <p className="mt-4 max-w-2xl text-sm md:text-base text-[#A7ABB3] leading-relaxed">
            MantrixFlow supports databases, warehouses, marketing tools, and unstructured sources so you can model all
            of your data pipelines in one place.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button className="rounded-full bg-white/5 border border-white/15 hover:bg-white/10 hover:border-white/25 text-sm">
              Go to workspace data sources
            </Button>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] text-emerald-200">
              <ShieldCheck className="h-3 w-3" />
              Encrypted credentials · Org‑scoped access
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {CONNECTORS.map((connector) => (
            <div
              key={connector.name}
              className="flex flex-col justify-between rounded-2xl border border-white/12 bg-white/[0.02] px-4 py-4 md:px-5 md:py-5 hover:border-white/20 transition-colors cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <ConnectorIcon icon={connector.icon} iconColor={connector.iconColor} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-sm md:text-base font-medium truncate">{connector.name}</h2>
                    {connector.popular ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-400/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-200 flex-shrink-0">
                        <Flame className="h-2.5 w-2.5" />
                        Popular
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-[11px] md:text-xs text-[#A7ABB3]">{connector.category}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] text-[#777C88]">
                <span>{connector.category}</span>
                <span className="text-[#A7ABB3]">Click to configure</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}

