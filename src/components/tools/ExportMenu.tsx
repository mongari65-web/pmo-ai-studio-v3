"use client"
// components/tools/ExportMenu.tsx — Menu export universel
import { useState, useRef, useEffect } from "react"
import {
  Download, FileSpreadsheet, FileText, MonitorPlay,
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
          key: "pptx", icon: MonitorPlay, label: "PowerPoint (.pptx)", color: "#f59e0b",
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
    <div ref={ref} style={{ position:"relative" }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 12px",
          background:"var(--bg-card)", border:"1px solid var(--border)",
          borderRadius:"var(--r8)", fontSize:12, fontWeight:500,
          color:"var(--primary-light)", cursor:"pointer" }}>
        <Download size={13}/>
        Exporter
        <ChevronDown size={11} style={{ transform: open ? "rotate(180deg)" : "none", transition:"transform 0.2s" }}/>
      </button>

      {open && (
        <div style={{ position:"absolute", right:0, top:"calc(100% + 6px)", zIndex:1000,
          background:"var(--bg-card)", border:"1px solid var(--border)",
          borderRadius:"var(--r10)", minWidth:200,
          boxShadow:"0 8px 32px rgba(0,0,0,0.5)", overflow:"hidden" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
            padding:"10px 14px", borderBottom:"1px solid var(--border)" }}>
            <span style={{ fontSize:10, fontWeight:700, color:"var(--text-3)", textTransform:"uppercase", letterSpacing:1 }}>Exporter</span>
            <button onClick={() => setOpen(false)}
              style={{ background:"none", border:"none", cursor:"pointer", color:"var(--text-3)", padding:2 }}>
              <X size={12}/>
            </button>
          </div>

          {ACTIONS.map(group => (
            <div key={group.group}>
              <div style={{ padding:"6px 14px 4px", fontSize:10, fontWeight:700,
                color:"var(--text-3)", textTransform:"uppercase", letterSpacing:1,
                background:"var(--bg)" }}>
                {group.group}
              </div>
              {group.items.map(item => (
                <button key={item.key}
                  onClick={() => run(item.key, item.fn)}
                  disabled={loading === item.key}
                  style={{ display:"flex", alignItems:"center", gap:10, width:"100%",
                    padding:"8px 14px", background:"transparent", border:"none",
                    borderBottom:"1px solid var(--border)", cursor:"pointer",
                    opacity: loading === item.key ? 0.5 : 1, transition:"background 0.1s" }}
                  onMouseEnter={e => (e.currentTarget as any).style.background = "var(--bg-glass)"}
                  onMouseLeave={e => (e.currentTarget as any).style.background = "transparent"}>
                  <item.icon size={14} style={{ color: item.color, flexShrink:0 }}/>
                  <span style={{ fontSize:12, color:"var(--text-1)" }}>{item.label}</span>
                  {loading === item.key && (
                    <span style={{ marginLeft:"auto", fontSize:10, color:"var(--text-3)" }}>...</span>
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
