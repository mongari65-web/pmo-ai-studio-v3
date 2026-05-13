"use client"
import { useState } from "react"
import { History, ChevronDown } from "lucide-react"
import ExportMenu from "./ExportMenu"
import QuotaBadge from "./QuotaBadge"
import CollabBar from "@/components/collaboration/CollabBar"

interface ToolLayoutProps {
  title: string
  icon: string
  subtitle?: string
  history: any[]
  onLoadHistory: (entry: any) => void
  onGenerate?: () => void
  generateLabel?: string
  generating?: boolean
  onAdd?: () => void
  addLabel?: string
  children: React.ReactNode
  projectName?: string
  exportRows?: Record<string, any>[]
  exportFilename?: string
  contentId?: string
  svgRef?: React.RefObject<SVGElement>
  jsonData?: any
  pptxSlides?: Array<{ title: string; content: string[] }>
  projectId?: string
}

export default function ToolLayout({
  title, icon, subtitle, history, onLoadHistory,
  onGenerate, generateLabel = "Générer IA", generating,
  onAdd, addLabel = "+ Ajouter",
  children, projectName,
  exportRows, exportFilename = "export", contentId = "tool-content",
  svgRef, jsonData, pptxSlides, projectId
}: ToolLayoutProps) {
  const [histOpen, setHistOpen] = useState(false)

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mb-1">{subtitle ?? "// OUTIL PMO"}</p>
          <h1 className="text-2xl font-bold flex items-center gap-2"><span>{icon}</span>{title}</h1>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          {/* Historique */}
          <div className="relative">
            <button onClick={() => setHistOpen(o => !o)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card text-sm font-medium text-amber-400 hover:bg-accent transition-colors">
              <History size={14}/>
              Historique ({history.length})
              <ChevronDown size={12} className={`transition-transform ${histOpen ? "rotate-180" : ""}`}/>
            </button>
            {histOpen && (
              <div className="absolute right-0 top-full mt-1 z-50 bg-card border border-border rounded-xl shadow-xl min-w-64 overflow-hidden">
                {history.length === 0 ? (
                  <p className="p-4 text-sm text-muted-foreground">Aucune génération</p>
                ) : history.map((h, i) => (
                  <button key={h.id} onClick={() => { onLoadHistory(h); setHistOpen(false) }}
                    className="w-full flex flex-col gap-0.5 px-4 py-3 hover:bg-accent border-b border-border last:border-0 text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {new Date(h.created_at).toLocaleDateString("fr-FR", { day:"2-digit", month:"2-digit", hour:"2-digit", minute:"2-digit" })}
                      </span>
                      {i === 0 && <span className="text-[10px] bg-amber-400 text-black rounded px-1.5 font-bold">Dernière</span>}
                    </div>
                    <span className="text-sm text-foreground">{h.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Add */}
          {onAdd && (
            <button onClick={onAdd}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-card text-sm font-medium text-foreground hover:bg-accent transition-colors">
              {addLabel}
            </button>
          )}

          {/* Export universel */}
          <ExportMenu config={{
            rows: exportRows,
            filename: exportFilename,
            title,
            projectName,
            contentId,
            svgRef,
            jsonData,
            pptxSlides,
          }}/>

          {/* Collab */}
          {projectId && (
            <CollabBar projectId={projectId} toolType={exportFilename?.split("_")[0]?.toLowerCase() ?? "tool"} projectName={projectName}/>
          )}

          {/* Quota badge */}
          <QuotaBadge/>

          {/* Generate */}
          {onGenerate && (
            <button onClick={onGenerate} disabled={generating}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
              {generating ? "⏳ Génération..." : `⚡ ${generateLabel}`}
            </button>
          )}
        </div>
      </div>

      <div id={contentId}>{children}</div>
    </div>
  )
}
