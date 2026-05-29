"use client"
import { useState, useRef, useEffect } from "react"
import {
  Download, FileSpreadsheet, FileText, MonitorPlay,
  Mail, HardDrive, Bookmark, Image, FileJson,
  Table, Printer, ChevronDown, X, Send
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
  onExcelOverride?: () => Promise<void>
}

interface ExportMenuProps {
  config: ExportConfig
}

interface SendModalProps {
  isOpen: boolean
  onClose: () => void
  config: ExportConfig
}

function SendModal({ isOpen, onClose, config }: SendModalProps) {
  const [to, setTo] = useState("")
  const [subject, setSubject] = useState(`Export — ${config.title}${config.projectName ? " — " + config.projectName : ""}`)
  const [message, setMessage] = useState(`Bonjour,\n\nVeuillez trouver ci-joint l'export "${config.title}"${config.projectName ? " du projet " + config.projectName : ""}.\n\nCordialement`)
  const [format, setFormat] = useState<"excel"|"csv"|"pdf">("excel")
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<"success"|"error"|null>(null)
  const [error, setError] = useState("")

  if (!isOpen) return null

  const handleSend = async () => {
    if (!to.trim()) { setError("Email destinataire requis"); return }
    setSending(true)
    setError("")
    try {
      let fileBase64 = ""
      let filename = config.filename
      let mimeType = ""

      if (format === "excel") {
        // Générer Excel via onExcelOverride ou SheetJS
        if (config.onExcelOverride) {
          // Pour les pages avec override (ex: EVM), on génère via l'API
          const res = await fetch("/api/export/evm-excel", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              tasks: (config as any).tasks ?? config.rows ?? [],
              currentPeriod: (config as any).currentPeriod ?? 0,
              projectName: config.projectName,
            })
          })
          if (res.ok) {
            const blob = await res.blob()
            const buffer = await blob.arrayBuffer()
            fileBase64 = btoa(String.fromCharCode(...new Uint8Array(buffer)))
            filename = config.filename + ".xlsx"
            mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          }
        } else if (config.rows?.length) {
          const XLSX = await import("xlsx")
          const ws = XLSX.utils.json_to_sheet(config.rows)
          const wb = XLSX.utils.book_new()
          XLSX.utils.book_append_sheet(wb, ws, "Export")
          const buf = XLSX.write(wb, { type: "base64", bookType: "xlsx" })
          fileBase64 = buf
          filename = config.filename + ".xlsx"
          mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        }
      } else if (format === "csv") {
        if (config.rows?.length) {
          const headers = Object.keys(config.rows[0])
          const csv = [headers.join(";"), ...config.rows.map(r => headers.map(h => String(r[h] ?? "")).join(";"))].join("\n")
          fileBase64 = btoa(unescape(encodeURIComponent("\uFEFF" + csv)))
          filename = config.filename + ".csv"
          mimeType = "text/csv"
        }
      }

      if (!fileBase64) {
        setError("Impossible de générer le fichier. Vérifiez que des données sont disponibles.")
        setSending(false)
        return
      }

      const res = await fetch("/api/email/send-export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: to.trim(), subject, message, filename, fileBase64, mimeType })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Erreur envoi")
      setResult("success")
    } catch (e: any) {
      setError(e.message)
      setResult("error")
    } finally {
      setSending(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "8px 12px", borderRadius: 8,
    border: "1px solid var(--border)", background: "var(--bg)",
    color: "var(--text-1)", fontSize: 13, outline: "none", boxSizing: "border-box"
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "var(--bg-card)", borderRadius: 16, border: "1px solid var(--border)", width: "100%", maxWidth: 500, padding: 28, boxShadow: "0 24px 64px rgba(0,0,0,0.5)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#1e40af,#3b82f6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Mail size={16} color="#fff" />
            </div>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--text-1)", margin: 0 }}>Envoyer par email</h3>
              <p style={{ fontSize: 11, color: "var(--text-3)", margin: 0 }}>{config.title}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", padding: 4 }}>
            <X size={16} />
          </button>
        </div>

        {result === "success" ? (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--text-1)", margin: "0 0 8px" }}>Email envoyé !</h3>
            <p style={{ fontSize: 13, color: "var(--text-2)", margin: "0 0 20px" }}>Le fichier a été envoyé à <strong>{to}</strong></p>
            <button onClick={onClose} style={{ padding: "8px 24px", borderRadius: 8, background: "var(--primary)", color: "#fff", border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Fermer</button>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)", display: "block", marginBottom: 5 }}>Format du fichier</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {[["excel", "📊 Excel (.xlsx)"], ["csv", "📋 CSV"]].map(([val, lbl]) => (
                    <button key={val} onClick={() => setFormat(val as any)}
                      style={{ flex: 1, padding: "8px", borderRadius: 8, border: `1px solid ${format === val ? "var(--primary)" : "var(--border)"}`, background: format === val ? "rgba(123,94,255,0.1)" : "transparent", color: format === val ? "var(--primary-light)" : "var(--text-2)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)", display: "block", marginBottom: 5 }}>Destinataire *</label>
                <input type="email" value={to} onChange={e => setTo(e.target.value)} placeholder="email@destinataire.com" style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)", display: "block", marginBottom: 5 }}>Sujet</label>
                <input type="text" value={subject} onChange={e => setSubject(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)", display: "block", marginBottom: 5 }}>Message</label>
                <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4}
                  style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }} />
              </div>
              {error && (
                <div style={{ background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.3)", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#dc2626" }}>
                  ❌ {error}
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button onClick={onClose} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "1px solid var(--border)", background: "transparent", color: "var(--text-2)", fontSize: 13, cursor: "pointer" }}>
                Annuler
              </button>
              <button onClick={handleSend} disabled={sending}
                style={{ flex: 2, padding: "10px", borderRadius: 8, border: "none", background: sending ? "var(--border)" : "linear-gradient(135deg,#1e40af,#3b82f6)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: sending ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <Send size={14} />
                {sending ? "Envoi en cours..." : "Envoyer le fichier"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function ExportMenu({ config }: ExportMenuProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)
  const [sendModalOpen, setSendModalOpen] = useState(false)
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
          key: "excel", icon: FileSpreadsheet, label: "Excel (.xlsx)", color: "#22c55e",
          fn: async () => {
            if (config.onExcelOverride) {
              await config.onExcelOverride()
            } else {
              const { exportExcel } = await import("@/lib/exportAll")
              if (config.rows?.length) exportExcel(config.rows, config.filename)
            }
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
              { title: config.title, content: config.rows?.slice(0, 10).map(r => Object.values(r).join(" | ")) ?? [] }
            ]
            await exportPPTX(config.title, slides, config.filename, config.projectName)
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
          key: "gmail", icon: Mail, label: "Envoyer par email", color: "#f87171",
          fn: async () => {
            setOpen(false)
            setSendModalOpen(true)
          }
        },
        {
          key: "drive", icon: HardDrive, label: "Google Drive", color: "#fbbf24",
          fn: async () => {
            const { exportDrive } = await import("@/lib/exportAll")
            const content = config.notionContent ?? (config.rows ? JSON.stringify(config.rows, null, 2) : "")
            await exportDrive(content, config.filename)
          }
        },
        {
          key: "notion", icon: Bookmark, label: "Notion", color: "#e2e8f0",
          fn: async () => {
            const { exportNotion } = await import("@/lib/exportAll")
            const content = config.notionContent ??
              (config.rows?.map(r => `## ${Object.values(r)[0]}\n${Object.entries(r).map(([k, v]) => `- **${k}**: ${v}`).join("\n")}`).join("\n\n") ?? "")
            await exportNotion(config.title, content)
          }
        },
      ]
    }
  ]

  return (
    <>
      <SendModal isOpen={sendModalOpen} onClose={() => setSendModalOpen(false)} config={config} />
      <div ref={ref} style={{ position: "relative" }}>
        <button onClick={() => setOpen(o => !o)}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--r8)", fontSize: 12, fontWeight: 500, color: "var(--primary-light)", cursor: "pointer" }}>
          <Download size={13} />
          Exporter
          <ChevronDown size={11} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
        </button>

        {open && (
          <div style={{ position: "absolute", right: 0, top: "calc(100% + 6px)", zIndex: 1000, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--r10)", minWidth: 200, boxShadow: "0 8px 32px rgba(0,0,0,0.5)", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderBottom: "1px solid var(--border)" }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 1 }}>Exporter</span>
              <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", padding: 2 }}><X size={12} /></button>
            </div>
            {ACTIONS.map(group => (
              <div key={group.group}>
                <div style={{ padding: "6px 14px 4px", fontSize: 10, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 1, background: "var(--bg)" }}>
                  {group.group}
                </div>
                {group.items.map(item => (
                  <button key={item.key} onClick={() => run(item.key, item.fn)} disabled={loading === item.key}
                    style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "8px 14px", background: "transparent", border: "none", borderBottom: "1px solid var(--border)", cursor: "pointer", opacity: loading === item.key ? 0.5 : 1, transition: "background 0.1s" }}
                    onMouseEnter={e => (e.currentTarget as any).style.background = "var(--bg-glass)"}
                    onMouseLeave={e => (e.currentTarget as any).style.background = "transparent"}>
                    <item.icon size={14} style={{ color: item.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: "var(--text-1)" }}>{item.label}</span>
                    {loading === item.key && <span style={{ marginLeft: "auto", fontSize: 10, color: "var(--text-3)" }}>...</span>}
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
