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
        <div className="flex gap-2 mb-4 flex-wrap">
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
          <div className="bg-card border border-primary/40 rounded-xl p-4 mb-4 space-y-3">
            <p className="text-sm font-semibold text-foreground">{editItem ? "Modifier" : "Nouvel élément"} RAID</p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Catégorie</label>
                <select value={formItem.category} onChange={e => setFormItem({...formItem, category: e.target.value as any})}
                  className="w-full px-2 py-1.5 bg-background border border-border rounded text-sm text-foreground">
                  {["Risk","Action","Issue","Decision"].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Priorité</label>
                <select value={formItem.priority} onChange={e => setFormItem({...formItem, priority: e.target.value})}
                  className="w-full px-2 py-1.5 bg-background border border-border rounded text-sm text-foreground">
                  {["Critique","Élevé","Moyen","Faible"].map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Statut</label>
                <select value={formItem.status} onChange={e => setFormItem({...formItem, status: e.target.value})}
                  className="w-full px-2 py-1.5 bg-background border border-border rounded text-sm text-foreground">
                  {["Ouvert","En cours","Fermé","Accepté"].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="col-span-3">
                <label className="text-xs text-muted-foreground mb-1 block">Titre</label>
                <input value={formItem.title} onChange={e => setFormItem({...formItem, title: e.target.value})}
                  className="w-full px-2 py-1.5 bg-background border border-border rounded text-sm text-foreground"/>
              </div>
              <div className="col-span-3">
                <label className="text-xs text-muted-foreground mb-1 block">Description</label>
                <textarea value={formItem.description} onChange={e => setFormItem({...formItem, description: e.target.value})}
                  rows={2} className="w-full px-2 py-1.5 bg-background border border-border rounded text-sm text-foreground resize-none"/>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Responsable</label>
                <input value={formItem.owner} onChange={e => setFormItem({...formItem, owner: e.target.value})}
                  className="w-full px-2 py-1.5 bg-background border border-border rounded text-sm text-foreground"/>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Échéance</label>
                <input type="date" value={formItem.due_date} onChange={e => setFormItem({...formItem, due_date: e.target.value})}
                  className="w-full px-2 py-1.5 bg-background border border-border rounded text-sm text-foreground"/>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Mitigation</label>
                <input value={formItem.mitigation} onChange={e => setFormItem({...formItem, mitigation: e.target.value})}
                  className="w-full px-2 py-1.5 bg-background border border-border rounded text-sm text-foreground"/>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={saveItem} className="px-4 py-1.5 bg-primary text-white rounded text-sm font-medium">Enregistrer</button>
              <button onClick={() => setShowForm(false)} className="px-4 py-1.5 bg-muted text-foreground rounded text-sm">Annuler</button>
            </div>
          </div>
        )}

        {filtered.length === 0 && !loading && (
          <div className="bg-card border border-dashed border-border rounded-xl p-16 text-center">
            <div className="text-5xl mb-3">⚠️</div>
            <p className="font-semibold text-foreground mb-1">Aucun élément RAID</p>
            <p className="text-sm text-muted-foreground">Générez automatiquement ou ajoutez manuellement</p>
          </div>
        )}

        <div className="space-y-3">
          {filtered.map(item => {
            const cfg = CAT[item.category]
            const priColor = PRI[item.priority as keyof typeof PRI] ?? "#64748b"
            return (
              <div key={item.id} className="bg-card border border-border rounded-xl p-4 group"
                style={{ borderLeft: `4px solid ${cfg.color}` }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: cfg.color+"22", color: cfg.color }}>{cfg.icon} {item.category}</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded" style={{ background: priColor+"22", color: priColor }}>{item.priority}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">{item.status}</span>
                    </div>
                    <p className="font-semibold text-foreground text-sm mb-1">{item.title}</p>
                    <p className="text-xs text-muted-foreground mb-2">{item.description}</p>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>👤 {item.owner}</span>
                      {item.due_date && <span>📅 {item.due_date}</span>}
                      {item.mitigation && <span>🛡️ {item.mitigation}</span>}
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditItem(item); setFormItem({...item}); setShowForm(true) }}
                      className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition-colors"><Pencil size={13}/></button>
                    <button onClick={() => deleteItem(item.id)}
                      className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"><Trash2 size={13}/></button>
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
