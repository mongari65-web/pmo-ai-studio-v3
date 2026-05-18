"use client"
import { NavButtons } from "@/components/ui/BackButton"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import AppLayout from "@/components/layout/AppLayout"
import ToolLayout from "@/components/tools/ToolLayout"
import { useProject, useToolData } from "@/hooks/useProject"
import { toast } from "sonner"
import { Pencil, Trash2, Check, X, Plus } from "lucide-react"

interface RAIDItem {
  id: string; category: "Risk"|"Action"|"Issue"|"Decision"
  title: string; description: string; probability?: string; impact?: string
  priority: string; owner: string; due_date: string; status: string; mitigation: string
}

const CAT = { Risk:{color:"#ef4444",icon:"⚠️"}, Action:{color:"#3b82f6",icon:"✅"}, Issue:{color:"#f59e0b",icon:"🔴"}, Decision:{color:"#22c55e",icon:"📌"} }
const PRI = { Critique:"#ef4444", Élevé:"#f59e0b", Moyen:"#3b82f6", Faible:"#22c55e" }

const emptyItem = (): RAIDItem => ({
  id: Date.now().toString(), category: "Risk", title: "", description: "",
  probability: "Moyen", impact: "Moyen", priority: "Moyen",
  owner: "", due_date: "", status: "Ouvert", mitigation: ""
})

export default function RAIDPage() {
  const { id } = useParams<{ id: string }>()
  const { project } = useProject(id)
  const { data, history, loading, setLoading, save, loadHistory } = useToolData(id, "raid")
  const [items, setItems] = useState<RAIDItem[]>([])
  const [filter, setFilter] = useState("All")
  const [editItem, setEditItem] = useState<RAIDItem | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formItem, setFormItem] = useState<RAIDItem>(emptyItem())

  useEffect(() => { if (data?.items) setItems(data.items) }, [data])

  const generate = async () => {
    if (!project) return
    setLoading(true); toast.info("Génération RAID en cours...")
    try {
      const res = await fetch("/api/generate", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ tool:"raid", projectName: project.name, projectDescription: project.description })
      })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      const newItems = json.data?.items ?? []
      setItems(newItems); await save({ items: newItems })
      toast.success(`RAID généré — ${newItems.length} éléments`)
    } catch(e:any) { toast.error(e.message) }
    finally { setLoading(false) }
  }

  const saveItem = async () => {
    let updated: RAIDItem[]
    if (editItem) {
      updated = items.map(i => i.id === formItem.id ? formItem : i)
    } else {
      updated = [...items, { ...formItem, id: Date.now().toString() }]
    }
    setItems(updated); await save({ items: updated })
    setShowForm(false); setEditItem(null); setFormItem(emptyItem())
  }

  const deleteItem = async (rid: string) => {
    const updated = items.filter(i => i.id !== rid)
    setItems(updated); await save({ items: updated })
  }

  const filtered = filter === "All" ? items : items.filter(i => i.category === filter)

  return (
    <AppLayout>
      <ToolLayout title="RAID Register" icon="⚠️" subtitle="// RISQUES · ACTIONS · ISSUES · DÉCISIONS"
        history={history} onLoadHistory={(e) => { loadHistory(e); if(e.data?.items) setItems(e.data.items) }}
        onGenerate={generate} generateLabel="Générer RAID" generating={loading}
        onAdd={() => { setEditItem(null); setFormItem(emptyItem()); setShowForm(true) }} addLabel="+ Ajouter"
        exportRows={filtered.map(i => ({ Catégorie:i.category, Titre:i.title, Priorité:i.priority, Responsable:i.owner, Échéance:i.due_date, Statut:i.status, Mitigation:i.mitigation }))}
        exportFilename={`RAID_${project?.name ?? ""}`} projectName={project?.name}>

        {/* Category filters */}
        <div>
          {["All","Risk","Action","Issue","Decision"].map(cat => (
            <button key={cat} onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                filter===cat
                  ? cat==="All" ? "bg-primary text-white" : `text-white`
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
              style={filter===cat && cat!=="All" ? { background: CAT[cat as keyof typeof CAT]?.color } : {}}>
              {cat==="All" ? `Tous (${items.length})` : `${CAT[cat as keyof typeof CAT]?.icon} ${cat} (${items.filter(i=>i.category===cat).length})`}
            </button>
          ))}
        </div>

        {/* Add/Edit form */}
        {showForm && (
          <div>
            <p>{editItem ? "Modifier" : "Nouvel élément"} RAID</p>
            <div>
              <div>
                <label>Catégorie</label>
                <select value={formItem.category} onChange={e => setFormItem({...formItem, category: e.target.value as any})}>
                  {["Risk","Action","Issue","Decision"].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label>Priorité</label>
                <select value={formItem.priority} onChange={e => setFormItem({...formItem, priority: e.target.value})}>
                  {["Critique","Élevé","Moyen","Faible"].map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label>Statut</label>
                <select value={formItem.status} onChange={e => setFormItem({...formItem, status: e.target.value})}>
                  {["Ouvert","En cours","Fermé","Accepté"].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label>Titre</label>
                <input value={formItem.title} onChange={e => setFormItem({...formItem, title: e.target.value})}/>
              </div>
              <div>
                <label>Description</label>
                <textarea value={formItem.description} onChange={e => setFormItem({...formItem, description: e.target.value})}
                  rows={2}/>
              </div>
              <div>
                <label>Responsable</label>
                <input value={formItem.owner} onChange={e => setFormItem({...formItem, owner: e.target.value})}/>
              </div>
              <div>
                <label>Échéance</label>
                <input type="date" value={formItem.due_date} onChange={e => setFormItem({...formItem, due_date: e.target.value})}/>
              </div>
              <div>
                <label>Mitigation</label>
                <input value={formItem.mitigation} onChange={e => setFormItem({...formItem, mitigation: e.target.value})}/>
              </div>
            </div>
            <div>
              <button onClick={saveItem}>Enregistrer</button>
              <button onClick={() => setShowForm(false)}>Annuler</button>
            </div>
          </div>
        )}

        {filtered.length === 0 && !loading && (
          <div>
            <div>⚠️</div>
            <p>Aucun élément RAID</p>
            <p>Générez automatiquement ou ajoutez manuellement</p>
          </div>
        )}

        <div>
          {filtered.map(item => {
            const cfg = CAT[item.category]
            const priColor = PRI[item.priority as keyof typeof PRI] ?? "#64748b"
            return (
              <div key={item.id}style={{background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:"var(--r12)",padding:16,marginBottom:10}}  style={{ borderLeft: `4px solid ${cfg.color}` }}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:8}}>
                  <div>
                    <div>
                      <span style={{ background: cfg.color+"22", color: cfg.color }}>{cfg.icon} {item.category}</span>
                      <span style={{ background: priColor+"22", color: priColor }}>{item.priority}</span>
                      <span>{item.status}</span>
                    </div>
                    <p>{item.title}</p>
                    <p style={{fontSize:12,color:"var(--text-2)",margin:"0 0 8px",lineHeight:1.5}}>{item.description}</p>
                    <div>
                      <span>👤 {item.owner}</span>
                      {item.due_date && <span>📅 {item.due_date}</span>}
                      {item.mitigation && <span>🛡️ {item.mitigation}</span>}
                    </div>
                  </div>
                  <div>
                    <button onClick={() => { setEditItem(item); setFormItem({...item}); setShowForm(true) }}><Pencil size={13}/></button>
                    <button onClick={() => deleteItem(item.id)}><Trash2 size={13}/></button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </ToolLayout>
    </AppLayout>
  )
}
