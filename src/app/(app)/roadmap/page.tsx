"use client"
import { useEffect, useState, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import AppLayout from "@/components/layout/AppLayout"
import Link from "next/link"
import { Plus, RefreshCw, Pencil, Trash2, Check, X } from "lucide-react"
import { toast } from "sonner"

interface RoadmapItem {
  id:string; title:string; description:string; category:string; status:"planned"|"in-progress"|"done"|"cancelled"
  quarter:string; priority:"high"|"medium"|"low"; projectId?:string; projectName?:string; tags:string[]
}

const STATUS_CFG = {
  "planned":    { label:"Planifié",    color:"#64748b", bg:"rgba(100,116,139,0.1)", emoji:"📋" },
  "in-progress":{ label:"En cours",   color:"#f59e0b", bg:"rgba(245,158,11,0.1)",  emoji:"🔄" },
  "done":       { label:"Terminé",    color:"#22c55e", bg:"rgba(34,197,94,0.1)",   emoji:"✅" },
  "cancelled":  { label:"Annulé",     color:"#ef4444", bg:"rgba(239,68,68,0.1)",   emoji:"❌" },
}
const PRI_CFG = {
  "high":   { label:"Haute",   color:"#ef4444" },
  "medium": { label:"Moyenne", color:"#f59e0b" },
  "low":    { label:"Faible",  color:"#22c55e" },
}
const CATEGORIES = ["Feature","Amélioration","Bug","Infrastructure","Sécurité","Performance","UX","API"]
const QUARTERS = ["Q1 2026","Q2 2026","Q3 2026","Q4 2026","Q1 2027","Q2 2027"]

const empty = ():RoadmapItem => ({
  id:Date.now().toString(), title:"", description:"", category:"Feature",
  status:"planned", quarter:"Q2 2026", priority:"medium", tags:[]
})

export default function RoadmapPage() {
  const [items, setItems]       = useState<RoadmapItem[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [newItem, setNewItem]   = useState<RoadmapItem>(empty())
  const [editId, setEditId]     = useState<string|null>(null)
  const [filterQ, setFilterQ]   = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [view, setView]         = useState<"kanban"|"timeline">("kanban")
  const supabase = createClient()

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    const { data: projs }   = await supabase.from("projects").select("id,name,icon").order("created_at", { ascending:false })
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: stored } = await supabase.from("project_tools")
        .select("data").eq("project_id", "roadmap-global-"+user.id).eq("tool_type","roadmap").maybeSingle()
      if (stored?.data?.items) setItems(stored.data.items)
    }
    setProjects(projs ?? [])
  }

  const saveItems = async (its:RoadmapItem[]) => {
    setItems(its)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from("project_tools").upsert({
      project_id:"roadmap-global-"+user.id, tool_type:"roadmap",
      data:{ items:its }, updated_at:new Date().toISOString()
    }, { onConflict:"project_id,tool_type" })
  }

  const addItem = () => {
    if (!newItem.title) { toast.error("Titre obligatoire"); return }
    saveItems([...items, { ...newItem, id:Date.now().toString() }])
    setNewItem(empty()); setShowForm(false)
    toast.success("Élément ajouté")
  }

  const filtered = items.filter(i =>
    (filterQ==="all"||i.quarter===filterQ) &&
    (filterStatus==="all"||i.status===filterStatus)
  )

  // Grouper par trimestre pour le kanban
  const byQuarter = useMemo(() => {
    const map: Record<string,RoadmapItem[]> = {}
    QUARTERS.forEach(q => { map[q] = filtered.filter(i=>i.quarter===q) })
    return map
  }, [filtered])

  const activeQuarters = QUARTERS.filter(q => byQuarter[q]?.length > 0 || filterQ === q || filterQ === "all")

  // Stats
  const stats = {
    total:     items.length,
    done:      items.filter(i=>i.status==="done").length,
    inProgress:items.filter(i=>i.status==="in-progress").length,
    planned:   items.filter(i=>i.status==="planned").length,
  }

  const inp = { width:"100%", fontSize:11, border:"1px solid var(--border)", borderRadius:6, padding:"6px 8px", background:"var(--bg)", color:"var(--text-1)", boxSizing:"border-box" as const }

  return (
    <AppLayout>
      <div style={{ padding:"20px 24px", background:"var(--bg)", minHeight:"100%", display:"flex", flexDirection:"column", gap:14 }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <p style={{ fontSize:10, color:"var(--text-3)", textTransform:"uppercase", letterSpacing:"1px", margin:"0 0 4px" }}>// ROADMAP</p>
            <h1 style={{ fontSize:22, fontWeight:800, color:"var(--text-1)", margin:0 }}>Feuille de Route Produit</h1>
            <p style={{ fontSize:13, color:"var(--text-3)", margin:"4px 0 0" }}>Vision trimestrielle — planification stratégique</p>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={loadData} style={{ display:"flex", alignItems:"center", gap:5, padding:"7px 12px", border:"1px solid var(--border)", borderRadius:8, background:"transparent", color:"var(--text-2)", fontSize:12, cursor:"pointer" }}>
              <RefreshCw size={13}/>
            </button>
            <button onClick={() => setShowForm(!showForm)} style={{ display:"flex", alignItems:"center", gap:5, padding:"7px 14px", background:"var(--primary)", color:"#fff", border:"none", borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer" }}>
              <Plus size={13}/> Ajouter
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
          {[
            { label:"Total",      value:stats.total,      color:"var(--primary)" },
            { label:"✅ Terminés",value:stats.done,       color:"#22c55e" },
            { label:"🔄 En cours",value:stats.inProgress, color:"#f59e0b" },
            { label:"📋 Planifiés",value:stats.planned,   color:"#64748b" },
          ].map(k => (
            <div key={k.label} style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:10, padding:"10px 14px", textAlign:"center" }}>
              <div style={{ fontSize:20, fontWeight:800, color:k.color }}>{k.value}</div>
              <div style={{ fontSize:10, color:"var(--text-3)", marginTop:2 }}>{k.label}</div>
            </div>
          ))}
        </div>

        {/* Formulaire */}
        {showForm && (
          <div style={{ background:"var(--bg-card)", border:"1px solid rgba(123,94,255,0.3)", borderRadius:12, padding:"16px" }}>
            <h4 style={{ fontSize:13, fontWeight:700, color:"var(--text-1)", margin:"0 0 12px" }}>+ Nouvel élément de roadmap</h4>
            <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr", gap:8, marginBottom:8 }}>
              <div><div style={{ fontSize:10, color:"var(--text-3)", marginBottom:3 }}>Titre *</div>
                <input value={newItem.title} onChange={e=>setNewItem(p=>({...p,title:e.target.value}))} placeholder="Titre de la fonctionnalité" style={inp}/></div>
              <div><div style={{ fontSize:10, color:"var(--text-3)", marginBottom:3 }}>Trimestre</div>
                <select value={newItem.quarter} onChange={e=>setNewItem(p=>({...p,quarter:e.target.value}))} style={inp}>
                  {QUARTERS.map(q=><option key={q}>{q}</option>)}</select></div>
              <div><div style={{ fontSize:10, color:"var(--text-3)", marginBottom:3 }}>Catégorie</div>
                <select value={newItem.category} onChange={e=>setNewItem(p=>({...p,category:e.target.value}))} style={inp}>
                  {CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></div>
              <div><div style={{ fontSize:10, color:"var(--text-3)", marginBottom:3 }}>Priorité</div>
                <select value={newItem.priority} onChange={e=>setNewItem(p=>({...p,priority:e.target.value as any}))} style={inp}>
                  <option value="high">Haute</option><option value="medium">Moyenne</option><option value="low">Faible</option></select></div>
              <div><div style={{ fontSize:10, color:"var(--text-3)", marginBottom:3 }}>Statut</div>
                <select value={newItem.status} onChange={e=>setNewItem(p=>({...p,status:e.target.value as any}))} style={inp}>
                  <option value="planned">Planifié</option><option value="in-progress">En cours</option><option value="done">Terminé</option></select></div>
            </div>
            <div style={{ marginBottom:8 }}>
              <div style={{ fontSize:10, color:"var(--text-3)", marginBottom:3 }}>Description</div>
              <textarea value={newItem.description} onChange={e=>setNewItem(p=>({...p,description:e.target.value}))} rows={2}
                style={{ ...inp, resize:"vertical" }}/>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={addItem} style={{ padding:"7px 18px", background:"var(--primary)", color:"#fff", border:"none", borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer" }}>✓ Ajouter</button>
              <button onClick={() => { setShowForm(false); setNewItem(empty()) }} style={{ padding:"7px 14px", background:"transparent", border:"1px solid var(--border)", borderRadius:8, fontSize:12, color:"var(--text-2)", cursor:"pointer" }}>Annuler</button>
            </div>
          </div>
        )}

        {/* Filtres + vue */}
        <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
          <div style={{ display:"flex", gap:4 }}>
            {["all",...QUARTERS].map(q => (
              <button key={q} onClick={()=>setFilterQ(q)}
                style={{ padding:"5px 12px", borderRadius:20, fontSize:11, fontWeight:500, cursor:"pointer", border:"1px solid "+(filterQ===q?"var(--primary)":"var(--border)"), background:filterQ===q?"var(--primary-bg)":"transparent", color:filterQ===q?"var(--primary-light)":"var(--text-3)" }}>
                {q==="all"?"Tous":q}
              </button>
            ))}
          </div>
          <div style={{ display:"flex", gap:4 }}>
            {["all","planned","in-progress","done"].map(s => {
              const cfg = STATUS_CFG[s as keyof typeof STATUS_CFG]
              return (
                <button key={s} onClick={()=>setFilterStatus(s)}
                  style={{ padding:"5px 12px", borderRadius:20, fontSize:11, fontWeight:500, cursor:"pointer", border:"1px solid "+(filterStatus===s?(cfg?.color||"var(--primary)"):"var(--border)"), background:filterStatus===s?(cfg?.bg||"var(--primary-bg)"):"transparent", color:filterStatus===s?(cfg?.color||"var(--primary-light)"):"var(--text-3)" }}>
                  {s==="all"?"Tous statuts":cfg?.emoji+" "+cfg?.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Vue Kanban par trimestre ── */}
        {items.length === 0 ? (
          <div style={{ textAlign:"center", padding:"60px 20px" }}>
            <div style={{ fontSize:40, marginBottom:12 }}>🗺️</div>
            <p style={{ color:"var(--text-2)", fontSize:14 }}>Roadmap vide</p>
            <p style={{ color:"var(--text-3)", fontSize:12 }}>Cliquez sur "+ Ajouter" pour planifier vos prochaines fonctionnalités</p>
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
            {activeQuarters.filter(q=>byQuarter[q]?.length>0).map(quarter => (
              <div key={quarter} style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, overflow:"hidden" }}>
                {/* Header trimestre */}
                <div style={{ padding:"10px 14px", borderBottom:"1px solid var(--border)", background:"rgba(123,94,255,0.06)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <span style={{ fontSize:13, fontWeight:800, color:"var(--primary-light)" }}>{quarter}</span>
                  <span style={{ fontSize:10, padding:"1px 8px", borderRadius:8, background:"var(--primary-bg)", color:"var(--primary-light)", fontWeight:600 }}>{byQuarter[quarter].length}</span>
                </div>

                {/* Items */}
                <div style={{ padding:"10px" }}>
                  {byQuarter[quarter].map(item => {
                    const sta = STATUS_CFG[item.status]
                    const pri = PRI_CFG[item.priority]
                    const isEditing = editId === item.id
                    return (
                      <div key={item.id} style={{ background:"var(--bg)", border:"1px solid var(--border)", borderRadius:8, padding:"10px 12px", marginBottom:8 }}>
                        {isEditing ? (
                          <div>
                            <input value={item.title} onChange={e=>setItems(prev=>prev.map(i=>i.id===item.id?{...i,title:e.target.value}:i))}
                              style={{ ...inp, marginBottom:6 }}/>
                            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6, marginBottom:6 }}>
                              <select value={item.status} onChange={e=>setItems(prev=>prev.map(i=>i.id===item.id?{...i,status:e.target.value as any}:i))} style={inp}>
                                {Object.entries(STATUS_CFG).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
                              </select>
                              <select value={item.priority} onChange={e=>setItems(prev=>prev.map(i=>i.id===item.id?{...i,priority:e.target.value as any}:i))} style={inp}>
                                {Object.entries(PRI_CFG).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
                              </select>
                            </div>
                            <div style={{ display:"flex", gap:4 }}>
                              <button onClick={() => { saveItems(items); setEditId(null) }} style={{ padding:"3px 8px", background:"var(--primary)", color:"#fff", border:"none", borderRadius:5, cursor:"pointer" }}><Check size={11}/></button>
                              <button onClick={() => setEditId(null)} style={{ padding:"3px 8px", background:"transparent", border:"1px solid var(--border)", borderRadius:5, cursor:"pointer", color:"var(--text-3)" }}><X size={11}/></button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div style={{ display:"flex", alignItems:"flex-start", gap:6, marginBottom:5 }}>
                              <span style={{ fontSize:12, fontWeight:700, color:"var(--text-1)", flex:1, lineHeight:1.3 }}>{item.title}</span>
                              <div style={{ display:"flex", gap:3, flexShrink:0 }}>
                                <button onClick={() => setEditId(item.id)} style={{ padding:"2px 5px", background:"transparent", border:"1px solid var(--border)", borderRadius:4, cursor:"pointer", color:"var(--text-3)" }}><Pencil size={9}/></button>
                                <button onClick={() => saveItems(items.filter(i=>i.id!==item.id))} style={{ padding:"2px 5px", background:"transparent", border:"1px solid rgba(239,68,68,0.3)", borderRadius:4, cursor:"pointer", color:"#ef4444" }}><Trash2 size={9}/></button>
                              </div>
                            </div>
                            {item.description && <p style={{ fontSize:10, color:"var(--text-3)", margin:"0 0 6px", lineHeight:1.4 }}>{item.description.slice(0,80)}{item.description.length>80?"…":""}</p>}
                            <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                              <span style={{ fontSize:9, padding:"1px 6px", borderRadius:4, background:sta.bg, color:sta.color, fontWeight:600 }}>{sta.emoji} {sta.label}</span>
                              <span style={{ fontSize:9, padding:"1px 6px", borderRadius:4, background:pri.color+"22", color:pri.color, fontWeight:600 }}>{pri.label}</span>
                              <span style={{ fontSize:9, padding:"1px 6px", borderRadius:4, background:"var(--bg-card)", color:"var(--text-3)", border:"1px solid var(--border)" }}>{item.category}</span>
                            </div>
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
