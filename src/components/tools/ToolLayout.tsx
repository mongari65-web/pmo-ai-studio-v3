"use client"
import { useState } from "react"
import { History, ChevronDown, Zap, Plus, Loader2 } from "lucide-react"
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

  const exportConfig = exportRows ? {
    rows: exportRows,
    filename: exportFilename,
    contentId,
    svgRef,
    jsonData,
    pptxSlides,
    title,
    projectName,
  } : null

  return (
    <div style={{ padding:"24px 28px", minHeight:"100%", background:"var(--bg)", position:"relative" }}>

      {/* Glow ambiance */}
      <div style={{ position:"fixed", top:"15%", right:"25%", width:500, height:350,
        background:"radial-gradient(ellipse,rgba(123,94,255,0.05),transparent 70%)",
        pointerEvents:"none", zIndex:0 }}/>

      {/* ── HEADER ── */}
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between",
        flexWrap:"wrap", gap:12, marginBottom:20, position:"relative", zIndex:1 }}>

        {/* Titre */}
        <div>
          <p style={{ fontSize:10, fontWeight:600, color:"var(--text-3)",
            textTransform:"uppercase", letterSpacing:"1.5px", margin:"0 0 6px",
            display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ width:16, height:1, background:"var(--primary)", display:"inline-block" }}/>
            {subtitle ?? "// OUTIL PMO"}
          </p>
          <h1 style={{ fontSize:22, fontWeight:800, color:"var(--text-1)", margin:0,
            display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:22 }}>{icon}</span>
            {title}
          </h1>
          {projectName && (
            <p style={{ fontSize:12, color:"var(--text-3)", margin:"4px 0 0" }}>
              Projet : {projectName}
            </p>
          )}
        </div>

        {/* Actions */}
        <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", justifyContent:"flex-end" }}>

          {/* QuotaBadge */}
          {onGenerate && <QuotaBadge/>}

          {/* Historique */}
          <div style={{ position:"relative" }}>
            <button onClick={() => setHistOpen(o => !o)}
              style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 12px",
                background:"var(--bg-card)", border:"1px solid var(--border)",
                borderRadius:"var(--r8)", fontSize:12, fontWeight:500,
                color:"#FF991F", cursor:"pointer", transition:"all 0.15s" }}
              onMouseEnter={e => (e.currentTarget as any).style.borderColor = "var(--border-hover)"}
              onMouseLeave={e => (e.currentTarget as any).style.borderColor = "var(--border)"}>
              <History size={13}/>
              Historique ({history.length})
              <ChevronDown size={11} style={{ transition:"transform 0.2s",
                transform: histOpen ? "rotate(180deg)" : "none" }}/>
            </button>

            {histOpen && (
              <div style={{ position:"absolute", right:0, top:"calc(100% + 6px)", zIndex:100,
                background:"var(--bg-card)", border:"1px solid var(--border)",
                borderRadius:"var(--r10)", padding:6, minWidth:240,
                boxShadow:"0 8px 32px rgba(0,0,0,0.5)" }}>
                {history.length === 0 ? (
                  <p style={{ padding:"12px 14px", fontSize:12, color:"var(--text-3)", margin:0 }}>
                    Aucune génération
                  </p>
                ) : history.slice(0, 10).map((entry: any) => (
                  <button key={entry.id}
                    onClick={() => { onLoadHistory(entry); setHistOpen(false) }}
                    style={{ display:"flex", flexDirection:"column", alignItems:"flex-start",
                      width:"100%", padding:"8px 12px", background:"transparent",
                      border:"none", borderRadius:"var(--r8)", cursor:"pointer",
                      transition:"background 0.1s" }}
                    onMouseEnter={e => (e.currentTarget as any).style.background = "var(--bg-glass)"}
                    onMouseLeave={e => (e.currentTarget as any).style.background = "transparent"}>
                    <span style={{ fontSize:12, color:"var(--text-1)", fontWeight:500 }}>
                      {new Date(entry.created_at).toLocaleDateString("fr-FR", {
                        day:"2-digit", month:"short", hour:"2-digit", minute:"2-digit"
                      })}
                    </span>
                    {entry.label && (
                      <span style={{ fontSize:11, color:"var(--text-3)" }}>{entry.label}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Export */}
          {exportConfig && <ExportMenu config={exportConfig}/>}

          {/* Ajouter */}
          {onAdd && (
            <button onClick={onAdd}
              style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px",
                background:"var(--bg-card)", border:"1px solid var(--border)",
                borderRadius:"var(--r8)", fontSize:12, fontWeight:500,
                color:"var(--text-2)", cursor:"pointer", transition:"all 0.15s" }}
              onMouseEnter={e => (e.currentTarget as any).style.borderColor = "var(--border-hover)"}
              onMouseLeave={e => (e.currentTarget as any).style.borderColor = "var(--border)"}>
              <Plus size={13}/>
              {addLabel}
            </button>
          )}

          {/* Générer IA */}
          {onGenerate && (
            <button onClick={onGenerate} disabled={generating}
              style={{ display:"flex", alignItems:"center", gap:7, padding:"8px 18px",
                background: generating
                  ? "var(--bg-card)"
                  : "linear-gradient(135deg,var(--primary),var(--primary-dark))",
                border: generating ? "1px solid var(--border)" : "none",
                borderRadius:"var(--r8)", fontSize:13, fontWeight:600,
                color: generating ? "var(--text-3)" : "#fff",
                cursor: generating ? "not-allowed" : "pointer",
                boxShadow: generating ? "none" : "0 0 20px var(--primary-glow)",
                transition:"all 0.2s", opacity: generating ? 0.7 : 1 }}>
              {generating
                ? <><Loader2 size={14} style={{ animation:"spin 1s linear infinite" }}/> Génération...</>
                : <><Zap size={14}/> {generateLabel}</>
              }
            </button>
          )}
        </div>
      </div>

      {/* CollabBar */}
      {projectId && (
        <div style={{ marginBottom:16, position:"relative", zIndex:1 }}>
          <CollabBar projectId={projectId} toolType={title}/>
        </div>
      )}

      {/* Content */}
      <div id={contentId} style={{ position:"relative", zIndex:1 }}>
        {children}
      </div>

      <style>{`
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>
    </div>
  )
}
