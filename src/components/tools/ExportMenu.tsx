"use client"
// components/tools/ExportMenu.tsx — Menu export universel
import { useState, useRef, useEffect } from "react"
import {
  Download, FileSpreadsheet, FileText, Presentation,
  Mail, HardDrive, Bookmark, Image, FileJson,
  Table, Printer, ChevronDown, X
} from "lucide-react"

interface ExportConfig {
  rows?: Record<string, any>[]
  filename: string
  title: string
  projectName?: string
  contentId?: string
  svgRef?: React.RefObject<SVGElement>
  jsonData?: any
  notionContent?: string
  gmailBody?: string
  pptxSlides?: Array<{ title: string; content: string[] }>
}

interface ExportMenuProps {
  config: ExportConfig
}

export default function ExportMenu({ config }: ExportMenuProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const run = async (key: string, fn: () => Promise<void> | void) => {
    setLoading(key)
    try { await fn() } finally { setLoading(null); setOpen(false) }
  }

  const ACTIONS = [
    {
      group: "Fichiers",
      items: [
        {
          key: "excel", icon: FileSpreadsheet, label: "Excel (.xls)", color: "#22c55e",
          fn: async () => {
            const { exportExcel } = await import("@/lib/exportAll")
            if (config.rows?.length) exportExcel(config.rows, config.filename)
          }
        },
        {
          key: "csv", icon: Table, label: "CSV", color: "#60a5fa",
          fn: async () => {
            const { exportCSV } = await import("@/lib/exportAll")
            if (config.rows?.length) exportCSV(config.rows, config.filename)
          }
        },
        {
          key: "json", icon: FileJson, label: "JSON", color: "#a78bfa",
          fn: async () => {
            const { exportJSON } = await import("@/lib/exportAll")
            exportJSON(config.jsonData ?? config.rows, config.filename)
          }
        },
        {
          key: "word", icon: FileText, label: "Word (.doc)", color: "#3b82f6",
          fn: async () => {
            const { exportWord } = await import("@/lib/exportAll")
            const el = config.contentId ? document.getElementById(config.contentId) : null
            exportWord(el?.innerHTML ?? "", config.filename, config.title)
          }
        },
        {
          key: "pdf", icon: Printer, label: "PDF (impression)", color: "#f87171",
          fn: async () => {
            const { exportPDF } = await import("@/lib/exportAll")
            if (config.contentId) exportPDF(config.contentId, config.title, config.projectName)
          }
        },
        {
          key: "pptx", icon: Presentation, label: "PowerPoint (.pptx)", color: "#f59e0b",
          fn: async () => {
            const { exportPPTX } = await import("@/lib/exportAll")
            const slides = config.pptxSlides ?? [
              {
                title: config.title,
                content: config.rows?.slice(0,10).map(r => Object.values(r).join(" | ")) ?? []
              }
            ]
            await exportPPTX(config.title, slides, config.filename)
          }
        },
        {
          key: "png", icon: Image, label: "Image PNG", color: "#06b6d4",
          fn: async () => {
            const { exportSVGasPNG } = await import("@/lib/exportAll")
            if (config.svgRef?.current) exportSVGasPNG(config.svgRef.current, config.filename)
            else alert("PNG disponible uniquement pour les visualisations SVG (MindMap, Gantt)")
          }
        },
      ]
    },
    {
      group: "Partager",
      items: [
        {
          key: "gmail", icon: Mail, label: "Gmail", color: "#f87171",
          fn: async () => {
            const { exportGmail } = await import("@/lib/exportAll")
            const body = config.gmailBody ??
              (config.rows?.map(r => Object.entries(r).map(([k,v]) => `${k}: ${v}`).join(" | ")).join("\n") ?? "")
            exportGmail(`${config.title} — ${config.projectName ?? ""}`, body)
          }
        },
        {
          key: "drive", icon: HardDrive, label: "Google Drive", color: "#fbbf24",
          fn: async () => {
            const { exportDrive } = await import("@/lib/exportAll")
            const content = config.notionContent ??
              (config.rows ? JSON.stringify(config.rows, null, 2) : "")
            await exportDrive(content, config.filename)
          }
        },
        {
          key: "notion", icon: Bookmark, label: "Notion", color: "#e2e8f0",
          fn: async () => {
            const { exportNotion } = await import("@/lib/exportAll")
            const content = config.notionContent ??
              (config.rows?.map(r => `## ${Object.values(r)[0]}\n${Object.entries(r).map(([k,v]) => `- **${k}**: ${v}`).join("\n")}`).join("\n\n") ?? "")
            await exportNotion(config.title, content)
          }
        },
      ]
    }
  ]

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card text-sm font-medium text-purple-400 hover:bg-accent transition-colors"
      >
        <Download size={14}/>
        Exporter
        <ChevronDown size={12} className={`transition-transform ${open ? "rotate-180" : ""}`}/>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 bg-card border border-border rounded-xl shadow-2xl w-56 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-border">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Exporter</span>
            <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
              <X size={12}/>
            </button>
          </div>

          {ACTIONS.map(group => (
            <div key={group.group}>
              <div className="px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider bg-muted/50">
                {group.group}
              </div>
              {group.items.map(item => (
                <button
                  key={item.key}
                  onClick={() => run(item.key, item.fn)}
                  disabled={loading === item.key}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-accent border-b border-border/50 last:border-0 transition-colors disabled:opacity-50"
                >
                  <item.icon size={14} style={{ color: item.color }} className="flex-shrink-0"/>
                  <span className="text-sm text-foreground">{item.label}</span>
                  {loading === item.key && (
                    <span className="ml-auto text-[10px] text-muted-foreground animate-pulse">...</span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
