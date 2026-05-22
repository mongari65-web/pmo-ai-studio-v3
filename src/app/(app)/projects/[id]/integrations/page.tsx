"use client"
import { useState } from "react"
import { useParams } from "next/navigation"
import AppLayout from "@/components/layout/AppLayout"
import ToolLayout from "@/components/tools/ToolLayout"
import { useProject, useToolData } from "@/hooks/useProject"
import { toast } from "sonner"
import { Upload, Link2, FileText, Check, ArrowRight, Zap } from "lucide-react"

const SOURCES = [
  {
    id:"jira", icon:"🔵", name:"Jira", color:"#0052CC", bg:"rgba(0,82,204,0.08)", border:"rgba(0,82,204,0.25)",
    desc:"Importez vos issues Jira vers Gantt + RAID automatiquement",
    fields:["URL Jira (ex: https://monsite.atlassian.net)","Email Jira","API Token Jira","Clé du projet (ex: PMO)"],
    output:["Gantt (tâches)","RAID (bugs/critiques)"],
  },
  {
    id:"notion", icon:"⬛", name:"Notion", color:"#000", bg:"rgba(0,0,0,0.06)", border:"rgba(0,0,0,0.15)",
    desc:"Importez vos bases de données Notion vers WBS automatiquement",
    fields:["Token d'intégration Notion","ID de la base de données"],
    output:["WBS (pages Notion)"],
  },
  {
    id:"csv", icon:"📊", name:"CSV / Excel", color:"#22c55e", bg:"rgba(34,197,94,0.08)", border:"rgba(34,197,94,0.25)",
    desc:"Importez un fichier CSV avec vos tâches vers le Gantt",
    fields:[], output:["Gantt (colonnes: name, start, end, progress, responsible, phase)"],
  },
]

export default function IntegrationsPage() {
  const { id } = useParams<{ id:string }>()
  const { project } = useProject(id)
  const { data, history, loading, setLoading, save, loadHistory, deleteHistory } = useToolData(id, "integrations")

  const [activeSource, setActiveSource] = useState<string|null>(null)
  const [formData, setFormData]         = useState<Record<string,string>>({})
  const [csvFile, setCsvFile]           = useState<File|null>(null)
  const [importing, setImporting]       = useState(false)
  const [imported, setImported]         = useState<Record<string,any>>({})

  const importFromSource = async (sourceId:string) => {
    setImporting(true)
    try {
      let payload: any = { source:sourceId, projectId:id, data:{} }

      if (sourceId === "jira") {
        // Appel API Jira via proxy (évite CORS)
        const url   = formData["URL Jira (ex: https://monsite.atlassian.net)"]
        const email = formData["Email Jira"]
        const token = formData["API Token Jira"]
        const proj  = formData["Clé du projet (ex: PMO)"]
        if (!url || !email || !token || !proj) { toast.error("Tous les champs sont requis"); return }

        const auth = btoa(email+":"+token)
        const res = await fetch(`${url}/rest/api/3/search?jql=project=${proj}&maxResults=50`, {
          headers: { Authorization:"Basic "+auth, Accept:"application/json" }
        })
        if (!res.ok) throw new Error("Erreur Jira API : "+res.statusText)
        const json = await res.json()
        payload.data = { issues: json.issues ?? [] }
      }

      else if (sourceId === "notion") {
        const token = formData["Token d'intégration Notion"]
        const dbId  = formData["ID de la base de données"]
        if (!token || !dbId) { toast.error("Token et ID requis"); return }

        const res = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
          method:"POST", headers: { Authorization:"Bearer "+token, "Notion-Version":"2022-06-28", "Content-Type":"application/json" },
          body:"{}"
        })
        if (!res.ok) throw new Error("Erreur Notion API : "+res.statusText)
        const json = await res.json()
        payload.data = { pages: json.results ?? [] }
      }

      else if (sourceId === "csv") {
        if (!csvFile) { toast.error("Sélectionnez un fichier CSV"); return }
        const text = await csvFile.text()
        const lines = text.trim().split("\n")
        const headers = lines[0].split(",").map(h=>h.trim().replace(/"/g,""))
        const rows = lines.slice(1).map(line => {
          const vals = line.split(",").map(v=>v.trim().replace(/"/g,""))
          return Object.fromEntries(headers.map((h,i)=>[h,vals[i]??""]))
        })
        payload.data = { rows }
      }

      const res = await fetch("/api/integrations/import", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify(payload)
      })
      const result = await res.json()
      if (result.error) throw new Error(result.error)

      setImported(prev => ({ ...prev, [sourceId]:result }))
      await save({ imports:{ ...imported, [sourceId]:{ ...result, date:new Date().toISOString() } } })

      const msg = sourceId==="jira"
        ? `✅ ${result.ganttTasks} tâches → Gantt · ${result.raidItems} items → RAID`
        : sourceId==="notion" ? `✅ ${result.wbsItems} pages → WBS`
        : `✅ ${result.tasks} tâches → Gantt`
      toast.success(msg)
      setActiveSource(null)
    } catch(e:any) {
      toast.error("Erreur : "+e.message)
    } finally {
      setImporting(false)
    }
  }

  const toRows = () => Object.entries(imported).map(([k,v]) => ({ Source:k, Date:(v as any).date?.split("T")[0], Résultat:JSON.stringify(v) }))

  return (
    <AppLayout>
      <ToolLayout title="Intégrations" icon="🔗" subtitle="// IMPORT EXTERNE"
        history={history} onLoadHistory={(e) => { loadHistory(e); if(e.data?.imports) setImported(e.data.imports) }}
        exportRows={toRows()} exportFilename={"Integrations_"+(project?.name??"")} projectName={project?.name}>

        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          {/* Sources disponibles */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
            {SOURCES.map(src => {
              const imp = imported[src.id]
              const isActive = activeSource === src.id
              return (
                <div key={src.id} style={{ background:src.bg, border:"2px solid "+(isActive?src.color:src.border), borderRadius:12, padding:"16px", transition:"border-color 0.15s", cursor:"pointer" }}
                  onClick={() => setActiveSource(isActive?null:src.id)}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                    <span style={{ fontSize:24 }}>{src.icon}</span>
                    <div>
                      <div style={{ fontSize:13, fontWeight:800, color:"var(--text-1)" }}>{src.name}</div>
                      {imp && <div style={{ fontSize:9, color:"#22c55e", fontWeight:600 }}>✅ Importé le {imp.date?.split("T")[0]}</div>}
                    </div>
                    {imp && <Check size={14} style={{ color:"#22c55e", marginLeft:"auto" }}/>}
                  </div>
                  <p style={{ fontSize:11, color:"var(--text-2)", margin:"0 0 10px", lineHeight:1.4 }}>{src.desc}</p>
                  <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                    {src.output.map(o => (
                      <span key={o} style={{ fontSize:9, padding:"1px 7px", borderRadius:6, background:src.color+"22", color:src.color, fontWeight:600 }}>{o}</span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Formulaire source active */}
          {activeSource && (
            <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, padding:"16px" }}>
              {(() => {
                const src = SOURCES.find(s=>s.id===activeSource)!
                return (
                  <>
                    <h3 style={{ fontSize:13, fontWeight:700, color:"var(--text-1)", margin:"0 0 14px", display:"flex", alignItems:"center", gap:8 }}>
                      <span>{src.icon}</span> Configurer l'import {src.name}
                    </h3>

                    {src.id === "csv" ? (
                      <div>
                        <div style={{ fontSize:10, color:"var(--text-3)", marginBottom:6, textTransform:"uppercase", fontWeight:600 }}>Fichier CSV</div>
                        <div style={{ border:"2px dashed var(--border)", borderRadius:8, padding:"24px", textAlign:"center", cursor:"pointer", position:"relative" }}
                          onClick={() => document.getElementById("csv-input")?.click()}>
                          <input id="csv-input" type="file" accept=".csv,.txt" onChange={e=>setCsvFile(e.target.files?.[0]||null)} style={{ display:"none" }}/>
                          <Upload size={24} style={{ color:"var(--text-3)", margin:"0 auto 8px", display:"block" }}/>
                          <p style={{ fontSize:12, color:"var(--text-2)", margin:0 }}>{csvFile?csvFile.name:"Cliquez pour sélectionner un fichier CSV"}</p>
                          <p style={{ fontSize:10, color:"var(--text-3)", margin:"4px 0 0" }}>Colonnes attendues : name, start, end, progress, responsible, phase</p>
                        </div>
                        {csvFile && (
                          <div style={{ marginTop:8, padding:"6px 10px", background:"rgba(34,197,94,0.08)", borderRadius:6, fontSize:11, color:"#22c55e" }}>
                            ✅ {csvFile.name} sélectionné ({(csvFile.size/1024).toFixed(1)} KB)
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                        {src.fields.map(field => (
                          <div key={field}>
                            <div style={{ fontSize:10, color:"var(--text-3)", marginBottom:3, textTransform:"uppercase", fontWeight:600 }}>{field}</div>
                            <input type={field.toLowerCase().includes("token")||field.toLowerCase().includes("api")?"password":"text"}
                              value={formData[field]??""} onChange={e=>setFormData(p=>({...p,[field]:e.target.value}))}
                              placeholder={field}
                              style={{ width:"100%", fontSize:12, border:"1px solid var(--border)", borderRadius:7, padding:"8px 10px", background:"var(--bg)", color:"var(--text-1)", boxSizing:"border-box", outline:"none" }}/>
                          </div>
                        ))}
                      </div>
                    )}

                    <div style={{ display:"flex", gap:8, marginTop:14 }}>
                      <button onClick={() => importFromSource(activeSource)} disabled={importing}
                        style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 18px", background:src.color, color:"#fff", border:"none", borderRadius:8, fontSize:12, fontWeight:600, cursor:importing?"wait":"pointer", opacity:importing?0.7:1 }}>
                        {importing ? "Import en cours..." : <><Zap size={13}/> Importer maintenant</>}
                      </button>
                      <button onClick={() => setActiveSource(null)} style={{ padding:"9px 14px", background:"transparent", border:"1px solid var(--border)", borderRadius:8, fontSize:12, color:"var(--text-2)", cursor:"pointer" }}>
                        Annuler
                      </button>
                    </div>

                    {/* Guide */}
                    {src.id !== "csv" && (
                      <div style={{ marginTop:12, padding:"10px 12px", background:"rgba(245,158,11,0.06)", borderRadius:7, border:"1px solid rgba(245,158,11,0.2)" }}>
                        <p style={{ fontSize:11, fontWeight:600, color:"#f59e0b", margin:"0 0 4px" }}>📋 Comment obtenir les credentials ?</p>
                        <p style={{ fontSize:11, color:"var(--text-2)", margin:0, lineHeight:1.5 }}>
                          {src.id==="jira"
                            ? "Jira → Paramètres compte → Sécurité → Créer un token d'API"
                            : "Notion → notion.so/my-integrations → Créer une intégration → Token secret"}
                        </p>
                      </div>
                    )}
                  </>
                )
              })()}
            </div>
          )}

          {/* Historique imports */}
          {Object.keys(imported).length > 0 && (
            <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, padding:"14px 16px" }}>
              <h4 style={{ fontSize:12, fontWeight:700, color:"var(--text-1)", margin:"0 0 10px" }}>📋 Historique des imports</h4>
              {Object.entries(imported).map(([src, result]:any) => (
                <div key={src} style={{ display:"flex", alignItems:"center", gap:10, padding:"7px 0", borderBottom:"1px solid var(--border)", fontSize:11 }}>
                  <span>{SOURCES.find(s=>s.id===src)?.icon}</span>
                  <span style={{ fontWeight:600, color:"var(--text-1)", textTransform:"capitalize" }}>{src}</span>
                  <span style={{ color:"var(--text-3)" }}>{result.date?.split("T")[0]}</span>
                  <span style={{ marginLeft:"auto", color:"#22c55e", fontWeight:600 }}>✅ Importé</span>
                  <Link2 size={11} style={{ color:"var(--text-3)" }}/>
                </div>
              ))}
            </div>
          )}

          {/* Guide global */}
          <div style={{ background:"rgba(123,94,255,0.06)", border:"1px solid rgba(123,94,255,0.2)", borderRadius:10, padding:"12px 16px" }}>
            <p style={{ fontSize:12, fontWeight:700, color:"var(--primary-light)", margin:"0 0 8px" }}>🔗 Sources supportées</p>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
              {[
                { src:"Jira Cloud", out:"Issues → Gantt + RAID", note:"Token API requis" },
                { src:"Notion DB", out:"Pages → WBS", note:"Intégration Notion requise" },
                { src:"CSV/Excel", out:"Tâches → Gantt", note:"Format libre" },
              ].map(g => (
                <div key={g.src} style={{ fontSize:11, color:"var(--text-2)" }}>
                  <div style={{ fontWeight:700, color:"var(--text-1)", marginBottom:2 }}>{g.src}</div>
                  <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                    <ArrowRight size={10} style={{ color:"var(--primary-light)" }}/> {g.out}
                  </div>
                  <div style={{ fontSize:10, color:"var(--text-3)" }}>{g.note}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ToolLayout>
    </AppLayout>
  )
}
