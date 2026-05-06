"use client"
import { useState } from "react"
import { History, Printer, Download, FileSpreadsheet, FileText, ExternalLink, ChevronDown } from "lucide-react"

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
  // export data
  exportRows?: Record<string, any>[]
  exportFilename?: string
  contentId?: string
}

export default function ToolLayout({
  title, icon, subtitle, history, onLoadHistory,
  onGenerate, generateLabel = "Générer IA", generating,
  onAdd, addLabel = "+ Ajouter",
  children, projectName,
  exportRows, exportFilename = "export", contentId = "tool-content"
}: ToolLayoutProps) {
  const [histOpen, setHistOpen] = useState(false)
  const [expOpen, setExpOpen] = useState(false)

  const exportExcel = () => {
    if (!exportRows?.length) return
    const headers = Object.keys(exportRows[0])
    const rows = [headers.join("\t"), ...exportRows.map(r => headers.map(h => r[h] ?? "").join("\t"))]
    const blob = new Blob(["\uFEFF" + rows.join("\n")], { type: "application/vnd.ms-excel;charset=utf-8" })
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob)
    a.download = `${exportFilename}.xls`; a.click()
  }

  const exportPDF = () => {
    const el = document.getElementById(contentId)
    if (!el) return
    const w = window.open("", "_blank")!
    w.document.write(`<!DOCTYPE html><html><head><title>${title}</title>
    <style>body{font-family:Arial,sans-serif;padding:24px;color:#1e293b}
    table{border-collapse:collapse;width:100%}th,td{border:1px solid #cbd5e1;padding:8px 12px;font-size:12px}
    th{background:#1e40af;color:white}tr:nth-child(even){background:#f8fafc}
    h1{color:#1e40af;font-size:18px;margin-bottom:16px}
    @media print{body{padding:0}}</style></head>
    <body><h1>${title} — ${projectName ?? ""}</h1>${el.innerHTML}</body></html>`)
    w.document.close(); w.focus()
    setTimeout(() => w.print(), 500)
  }

  const exportGmail = () => {
    if (!exportRows?.length) return
    const body = exportRows.map(r => Object.entries(r).map(([k,v]) => `${k}: ${v}`).join(" | ")).join("\n")
    window.open(`https://mail.google.com/mail/?view=cm&su=${encodeURIComponent(title + " — " + (projectName ?? ""))}&body=${encodeURIComponent(body)}`, "_blank")
  }

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mb-1">
            {subtitle ?? "// OUTIL PMO"}
          </p>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span>{icon}</span> {title}
          </h1>
        </div>

        {/* Action bar */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {/* Historique */}
          <div className="relative">
            <button onClick={() => { setHistOpen(o => !o); setExpOpen(false) }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card text-sm font-medium text-amber-400 hover:bg-accent transition-colors">
              <History size={14}/>
              Historique ({history.length})
            </button>
            {histOpen && (
              <div className="absolute right-0 top-full mt-1 z-50 bg-card border border-border rounded-xl shadow-xl min-w-64 overflow-hidden">
                {history.length === 0
                  ? <p className="p-4 text-sm text-muted-foreground">Aucune génération</p>
                  : history.map((h, i) => (
                    <button key={h.id} onClick={() => { onLoadHistory(h); setHistOpen(false) }}
                      className="w-full flex flex-col gap-0.5 px-4 py-3 hover:bg-accent border-b border-border last:border-0 text-left transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{new Date(h.created_at).toLocaleDateString("fr-FR", { day:"2-digit", month:"2-digit", hour:"2-digit", minute:"2-digit" })}</span>
                        {i === 0 && <span className="text-[10px] bg-amber-400 text-black rounded px-1.5 font-bold">Dernière</span>}
                      </div>
                      <span className="text-sm text-foreground">{h.label}</span>
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* Add manual */}
          {onAdd && (
            <button onClick={onAdd}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-card text-sm font-medium text-foreground hover:bg-accent transition-colors">
              {addLabel}
            </button>
          )}

          {/* Export */}
          <div className="relative">
            <button onClick={() => { setExpOpen(o => !o); setHistOpen(false) }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-card text-sm font-medium text-purple-400 hover:bg-accent transition-colors">
              <Download size={14}/> Exporter <ChevronDown size={12}/>
            </button>
            {expOpen && (
              <div className="absolute right-0 top-full mt-1 z-50 bg-card border border-border rounded-xl shadow-xl min-w-48 overflow-hidden">
                {[
                  { icon: Printer, label: "Imprimer / PDF", fn: exportPDF, color: "text-foreground" },
                  { icon: FileSpreadsheet, label: "Excel (.xls)", fn: exportExcel, color: "text-green-400" },
                  { icon: FileText, label: "Gmail", fn: exportGmail, color: "text-red-400" },
                ].map(({ icon: Icon, label, fn, color }) => (
                  <button key={label} onClick={() => { fn(); setExpOpen(false) }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-accent text-sm border-b border-border last:border-0 transition-colors">
                    <Icon size={15} className={color}/> <span className={color}>{label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Generate AI */}
          {onGenerate && (
            <button onClick={onGenerate} disabled={generating}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {generating ? "⏳ Génération..." : `⚡ ${generateLabel}`}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div id={contentId}>
        {children}
      </div>
    </div>
  )
}
