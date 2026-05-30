"use client"
import { useState, useRef, useEffect } from "react"
import {
  Download, FileSpreadsheet, FileText, MonitorPlay,
  Mail, HardDrive, Bookmark, Image, FileJson,
  Table, Printer, ChevronDown, X, Send, Loader2
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
  projectId?: string
  toolType?: string
}

interface ExportMenuProps {
  config: ExportConfig
}

// ─── Helpers base64 robustes ────────────────────────────────────────────────

// FIX : btoa(String.fromCharCode(...)) plante sur gros fichiers (stack overflow)
// Solution : chunking + Uint8Array
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  const CHUNK = 8192
  let binary = ""
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, Math.min(i + CHUNK, bytes.length)))
  }
  return btoa(binary)
}

// FIX : CSV → base64 via TextEncoder (pas de btoa(unescape(...)) cassé)
function csvToBase64(csv: string): string {
  const encoded = new TextEncoder().encode("\uFEFF" + csv)
  return arrayBufferToBase64(encoded.buffer)
}

// ─── Génération fichier par format ─────────────────────────────────────────

async function generateFile(
  format: "excel" | "csv",
  config: ExportConfig
): Promise<{ base64: string; filename: string; mimeType: string; rowCount: number } | null> {

  if (format === "excel") {
    // Cas EVM ou outil avec override custom → appel API dédié
    if (config.onExcelOverride && config.projectId) {
      const toolType = config.toolType ?? "evm"
      const res = await fetch("/api/export/tool-excel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: config.projectId,
          toolType,
          projectName: config.projectName,
        }),
      })
      if (!res.ok) throw new Error(`Erreur export Excel : ${res.statusText}`)
      const blob = await res.blob()
      const buffer = await blob.arrayBuffer()
      return {
        base64: arrayBufferToBase64(buffer),
        filename: config.filename + ".xlsx",
        mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        rowCount: config.rows?.length ?? 0,
      }
    }

    // Cas standard — API serveur si projectId disponible
    if (config.projectId && config.toolType) {
      const res = await fetch("/api/export/tool-excel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: config.projectId,
          toolType: config.toolType,
          projectName: config.projectName,
        }),
      })
      if (!res.ok) throw new Error(`Erreur export Excel : ${res.statusText}`)
      const blob = await res.blob()
      const buffer = await blob.arrayBuffer()
      return {
        base64: arrayBufferToBase64(buffer),
        filename: config.filename + ".xlsx",
        mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        rowCount: config.rows?.length ?? 0,
      }
    }
    // Fallback SheetJS
    if (!config.rows?.length) throw new Error("Aucune donnée à exporter")
    const XLSX = await import("xlsx")
    const ws = XLSX.utils.json_to_sheet(config.rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, config.title.slice(0, 31))
    // FIX : on utilise type:"array" puis on converti en base64 correctement
    const buf = XLSX.write(wb, { type: "array", bookType: "xlsx" }) as Uint8Array
    return {
      base64: arrayBufferToBase64(buf.buffer as ArrayBuffer),
      filename: config.filename + ".xlsx",
      mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      rowCount: config.rows.length,
    }
  }

  if (format === "csv") {
    if (!config.rows?.length) throw new Error("Aucune donnée à exporter")
    const headers = Object.keys(config.rows[0])
    const lines = [
      headers.join(";"),
      ...config.rows.map(r =>
        headers.map(h => {
          const val = String(r[h] ?? "")
          // Échapper les guillemets et entourer si nécessaire
          return val.includes(";") || val.includes('"') || val.includes("\n")
            ? `"${val.replace(/"/g, '""')}"`
            : val
        }).join(";")
      ),
    ]
    return {
      base64: csvToBase64(lines.join("\n")),
      filename: config.filename + ".csv",
      mimeType: "text/csv;charset=utf-8",
      rowCount: config.rows.length,
    }
  }

  return null
}

// ─── Modal d'envoi email ────────────────────────────────────────────────────

interface SendModalProps {
  isOpen: boolean
  onClose: () => void
  config: ExportConfig
}

function SendModal({ isOpen, onClose, config }: SendModalProps) {
  const [to, setTo]           = useState("")
  const [subject, setSubject] = useState(
    `${config.title}${config.projectName ? " — " + config.projectName : ""} | PMO AI Studio`
  )
  const [message, setMessage] = useState(
    `Bonjour,\n\nVeuillez trouver ci-joint le document "${config.title}"${config.projectName ? ` du projet "${config.projectName}"` : ""}.\n\nCe fichier a été généré par PMO AI Studio.\n\nCordialement`
  )
  const [format, setFormat]   = useState<"excel"|"csv">("excel")
  const [sending, setSending] = useState(false)
  const [step, setStep]       = useState<"form"|"sending"|"success"|"error">("form")
  const [error, setError]     = useState("")
  const [sentTo, setSentTo]   = useState("")

  // Reset à l'ouverture
  useEffect(() => {
    if (isOpen) {
      setStep("form"); setError(""); setSentTo("")
      setTo(""); 
      setSubject(`${config.title}${config.projectName ? " — " + config.projectName : ""} | PMO AI Studio`)
      setMessage(`Bonjour,\n\nVeuillez trouver ci-joint le document "${config.title}"${config.projectName ? ` du projet "${config.projectName}"` : ""}.\n\nCe fichier a été généré par PMO AI Studio.\n\nCordialement`)
    }
  }, [isOpen, config.title, config.projectName])

  if (!isOpen) return null

  const handleSend = async () => {
    const email = to.trim()
    if (!email) { setError("L'adresse email est requise"); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Adresse email invalide"); return }

    setError("")
    setStep("sending")
    setSending(true)

    try {
      const file = await generateFile(format, config)
      if (!file) throw new Error("Impossible de générer le fichier — vérifiez que des données sont disponibles")

      const res = await fetch("/api/email/send-export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: email,
          subject,
          message,
          filename: file.filename,
          fileBase64: file.base64,
          mimeType: file.mimeType,
          toolType: config.toolType ?? config.title.toLowerCase().replace(/\s+/g, ""),
          projectName: config.projectName,
          rowCount: file.rowCount,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Erreur lors de l'envoi")

      setSentTo(email)
      setStep("success")
    } catch (e: any) {
      setError(e.message)
      setStep("error")
    } finally {
      setSending(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "9px 12px", borderRadius: 8,
    border: "1px solid var(--border)", background: "var(--bg)",
    color: "var(--text-1)", fontSize: 13, outline: "none",
    boxSizing: "border-box", fontFamily: "inherit",
  }

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div style={{ background:"var(--bg-card)", borderRadius:16, border:"1px solid var(--border)", width:"100%", maxWidth:520, boxShadow:"0 32px 80px rgba(0,0,0,0.6)", overflow:"hidden" }}>

        {/* Header */}
        <div style={{ padding:"20px 24px 16px", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:"linear-gradient(135deg,#1e40af,#3b82f6)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <Mail size={16} color="#fff"/>
            </div>
            <div>
              <h3 style={{ fontSize:15, fontWeight:800, color:"var(--text-1)", margin:0 }}>Envoyer par email</h3>
              <p style={{ fontSize:11, color:"var(--text-3)", margin:0 }}>
                {config.title}{config.projectName ? ` — ${config.projectName}` : ""}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--text-3)", padding:4, borderRadius:6 }}>
            <X size={16}/>
          </button>
        </div>

        <div style={{ padding:"20px 24px 24px" }}>

          {/* État : succès */}
          {step === "success" && (
            <div style={{ textAlign:"center", padding:"16px 0 8px" }}>
              <div style={{ fontSize:52, marginBottom:14 }}>✅</div>
              <h3 style={{ fontSize:17, fontWeight:800, color:"var(--text-1)", margin:"0 0 8px" }}>Email envoyé !</h3>
              <p style={{ fontSize:13, color:"var(--text-2)", margin:"0 0 8px" }}>
                Le fichier a été envoyé à
              </p>
              <p style={{ fontSize:13, fontWeight:700, color:"var(--primary-light)", margin:"0 0 24px" }}>{sentTo}</p>
              <button onClick={onClose}
                style={{ padding:"9px 28px", borderRadius:8, background:"var(--primary)", color:"#fff", border:"none", fontSize:13, fontWeight:700, cursor:"pointer" }}>
                Fermer
              </button>
            </div>
          )}

          {/* État : envoi en cours */}
          {step === "sending" && (
            <div style={{ textAlign:"center", padding:"32px 0" }}>
              <div style={{ display:"flex", justifyContent:"center", marginBottom:16 }}>
                <Loader2 size={40} color="var(--primary-light)" style={{ animation:"spin 1s linear infinite" }}/>
              </div>
              <p style={{ fontSize:14, color:"var(--text-1)", fontWeight:600, margin:"0 0 4px" }}>Envoi en cours...</p>
              <p style={{ fontSize:12, color:"var(--text-3)", margin:0 }}>Génération du fichier et envoi par email</p>
              <style>{`@keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }`}</style>
            </div>
          )}

          {/* État : formulaire ou erreur */}
          {(step === "form" || step === "error") && (
            <>
              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

                {/* Sélecteur de format */}
                <div>
                  <label style={{ fontSize:12, fontWeight:600, color:"var(--text-2)", display:"block", marginBottom:6 }}>Format du fichier joint</label>
                  <div style={{ display:"flex", gap:8 }}>
                    {([
                      ["excel", "📊", "Excel (.xlsx)"],
                      ["csv",   "📋", "CSV (.csv)"],
                    ] as const).map(([val, icon, lbl]) => (
                      <button key={val} onClick={()=>setFormat(val)}
                        style={{ flex:1, padding:"9px 8px", borderRadius:8, border:`1px solid ${format===val?"var(--primary)":"var(--border)"}`, background:format===val?"rgba(123,94,255,0.1)":"transparent", color:format===val?"var(--primary-light)":"var(--text-2)", fontSize:12, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                        <span>{icon}</span>{lbl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Destinataire */}
                <div>
                  <label style={{ fontSize:12, fontWeight:600, color:"var(--text-2)", display:"block", marginBottom:5 }}>
                    Destinataire <span style={{ color:"#ef4444" }}>*</span>
                  </label>
                  <input
                    type="email"
                    value={to}
                    onChange={e=>{ setTo(e.target.value); if(error) setError("") }}
                    onKeyDown={e=>e.key==="Enter"&&handleSend()}
                    placeholder="prenom.nom@entreprise.com"
                    style={{ ...inputStyle, borderColor: error&&!to.trim() ? "#ef4444" : "var(--border)" }}
                  />
                </div>

                {/* Sujet */}
                <div>
                  <label style={{ fontSize:12, fontWeight:600, color:"var(--text-2)", display:"block", marginBottom:5 }}>Sujet</label>
                  <input type="text" value={subject} onChange={e=>setSubject(e.target.value)} style={inputStyle}/>
                </div>

                {/* Message */}
                <div>
                  <label style={{ fontSize:12, fontWeight:600, color:"var(--text-2)", display:"block", marginBottom:5 }}>Message</label>
                  <textarea
                    value={message}
                    onChange={e=>setMessage(e.target.value)}
                    rows={4}
                    style={{ ...inputStyle, resize:"vertical", lineHeight:1.6 }}
                  />
                </div>

                {/* Erreur */}
                {step === "error" && error && (
                  <div style={{ background:"rgba(220,38,38,0.08)", border:"1px solid rgba(220,38,38,0.25)", borderRadius:8, padding:"10px 14px", fontSize:12, color:"#dc2626", display:"flex", alignItems:"flex-start", gap:8 }}>
                    <span style={{ flexShrink:0 }}>❌</span>
                    <span>{error}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ display:"flex", gap:10, marginTop:20 }}>
                <button onClick={onClose}
                  style={{ flex:1, padding:"10px", borderRadius:8, border:"1px solid var(--border)", background:"transparent", color:"var(--text-2)", fontSize:13, cursor:"pointer", fontWeight:500 }}>
                  Annuler
                </button>
                <button onClick={handleSend}
                  style={{ flex:2, padding:"10px", borderRadius:8, border:"none", background:"linear-gradient(135deg,#1e40af,#3b82f6)", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                  <Send size={14}/>
                  Envoyer le fichier
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── ExportMenu principal ───────────────────────────────────────────────────

export default function ExportMenu({ config }: ExportMenuProps) {
  const [open, setOpen]               = useState(false)
  const [loading, setLoading]         = useState<string|null>(null)
  const [sendModalOpen, setSendModalOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const run = async (key: string, fn: () => Promise<void>|void) => {
    setLoading(key)
    try { await fn() } finally { setLoading(null); setOpen(false) }
  }

  const ACTIONS = [
    {
      group: "Fichiers",
      items: [
        {
          key:"excel", icon:FileSpreadsheet, label:"Excel (.xlsx)", color:"#22c55e",
          fn: async () => {
            if (config.onExcelOverride) {
              await config.onExcelOverride()
            } else if (config.projectId && config.toolType) {
              const res = await fetch("/api/export/tool-excel", {
                method:"POST", headers:{"Content-Type":"application/json"},
                body: JSON.stringify({ projectId:config.projectId, toolType:config.toolType, projectName:config.projectName })
              })
              if (res.ok) {
                const blob = await res.blob()
                const a = document.createElement("a")
                a.href = URL.createObjectURL(blob)
                a.download = config.filename + ".xlsx"
                a.click()
                URL.revokeObjectURL(a.href)
              }
            } else {
              const { exportExcel } = await import("@/lib/exportAll")
              if (config.rows?.length) exportExcel(config.rows, config.filename)
            }
          }
        },
        {
          key:"csv", icon:Table, label:"CSV", color:"#60a5fa",
          fn: async () => {
            const { exportCSV } = await import("@/lib/exportAll")
            if (config.rows?.length) exportCSV(config.rows, config.filename)
          }
        },
        {
          key:"json", icon:FileJson, label:"JSON", color:"#a78bfa",
          fn: async () => {
            const { exportJSON } = await import("@/lib/exportAll")
            exportJSON(config.jsonData ?? config.rows, config.filename)
          }
        },
        {
          key:"word", icon:FileText, label:"Word (.doc)", color:"#3b82f6",
          fn: async () => {
            const { exportWord } = await import("@/lib/exportAll")
            const el = config.contentId ? document.getElementById(config.contentId) : null
            exportWord(el?.innerHTML ?? "", config.filename, config.title)
          }
        },
        {
          key:"pdf", icon:Printer, label:"PDF (impression)", color:"#f87171",
          fn: async () => {
            const { exportPDF } = await import("@/lib/exportAll")
            if (config.contentId) exportPDF(config.contentId, config.title, config.projectName)
          }
        },
        {
          key:"pptx", icon:MonitorPlay, label:"PowerPoint (.pptx)", color:"#f59e0b",
          fn: async () => {
            const { exportPPTX } = await import("@/lib/exportAll")
            const slides = config.pptxSlides ?? [
              { title:config.title, content:config.rows?.slice(0,10).map(r=>Object.values(r).join(" | ")) ?? [] }
            ]
            await exportPPTX(config.title, slides, config.filename, config.projectName)
          }
        },
        {
          key:"png", icon:Image, label:"Image PNG", color:"#06b6d4",
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
          key:"gmail", icon:Mail, label:"Envoyer par email", color:"#f87171",
          fn: async () => { setOpen(false); setSendModalOpen(true) }
        },
        {
          key:"drive", icon:HardDrive, label:"Google Drive", color:"#fbbf24",
          fn: async () => {
            const { exportDrive } = await import("@/lib/exportAll")
            const content = config.notionContent ?? (config.rows ? JSON.stringify(config.rows, null, 2) : "")
            await exportDrive(content, config.filename)
          }
        },
        {
          key:"notion", icon:Bookmark, label:"Notion", color:"#e2e8f0",
          fn: async () => {
            const { exportNotion } = await import("@/lib/exportAll")
            const content = config.notionContent ??
              (config.rows?.map(r => `## ${Object.values(r)[0]}\n${Object.entries(r).map(([k,v])=>`- **${k}**: ${v}`).join("\n")}`).join("\n\n") ?? "")
            await exportNotion(config.title, content)
          }
        },
      ]
    }
  ]

  return (
    <>
      <SendModal isOpen={sendModalOpen} onClose={()=>setSendModalOpen(false)} config={config}/>
      <div ref={ref} style={{ position:"relative" }}>
        <button onClick={()=>setOpen(o=>!o)}
          style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 12px", background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:"var(--r8)", fontSize:12, fontWeight:500, color:"var(--primary-light)", cursor:"pointer" }}>
          <Download size={13}/>
          Exporter
          <ChevronDown size={11} style={{ transform:open?"rotate(180deg)":"none", transition:"transform 0.2s" }}/>
        </button>

        {open && (
          <div style={{ position:"absolute", right:0, top:"calc(100% + 6px)", zIndex:1000, background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:"var(--r10)", minWidth:210, boxShadow:"0 8px 32px rgba(0,0,0,0.5)", overflow:"hidden" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 14px", borderBottom:"1px solid var(--border)" }}>
              <span style={{ fontSize:10, fontWeight:700, color:"var(--text-3)", textTransform:"uppercase", letterSpacing:1 }}>Exporter</span>
              <button onClick={()=>setOpen(false)} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--text-3)", padding:2 }}><X size={12}/></button>
            </div>
            {ACTIONS.map(group => (
              <div key={group.group}>
                <div style={{ padding:"6px 14px 4px", fontSize:10, fontWeight:700, color:"var(--text-3)", textTransform:"uppercase", letterSpacing:1, background:"var(--bg)" }}>
                  {group.group}
                </div>
                {group.items.map(item => (
                  <button key={item.key} onClick={()=>run(item.key, item.fn)} disabled={loading===item.key}
                    style={{ display:"flex", alignItems:"center", gap:10, width:"100%", padding:"9px 14px", background:"transparent", border:"none", borderBottom:"1px solid var(--border)", cursor:"pointer", opacity:loading===item.key?0.5:1, transition:"background 0.1s" }}
                    onMouseEnter={e=>(e.currentTarget as any).style.background="var(--bg-glass)"}
                    onMouseLeave={e=>(e.currentTarget as any).style.background="transparent"}>
                    <item.icon size={14} style={{ color:item.color, flexShrink:0 }}/>
                    <span style={{ fontSize:12, color:"var(--text-1)" }}>{item.label}</span>
                    {loading===item.key && (
                      <span style={{ marginLeft:"auto" }}>
                        <Loader2 size={11} color="var(--text-3)" style={{ animation:"spin 1s linear infinite" }}/>
                        <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
                      </span>
                    )}
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
