"use client"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import AppLayout from "@/components/layout/AppLayout"
import ToolLayout from "@/components/tools/ToolLayout"
import { useProject, useToolData } from "@/hooks/useProject"
import { toast } from "sonner"
import { Pencil, Trash2, Check, X } from "lucide-react"

interface RAIDItem {
  id: string; category: "Risk"|"Action"|"Issue"|"Decision"
  title: string; description: string; probability?: string; impact?: string
  priority: string; owner: string; due_date: string; status: string; mitigation: string
}

const CAT = {
  Risk:     { color: "#ef4444", bg: "rgba(239,68,68,0.1)",    icon: "⚠️",  label: "Risk"     },
  Action:   { color: "#3b82f6", bg: "rgba(59,130,246,0.1)",   icon: "✅",  label: "Action"   },
  Issue:    { color: "#f59e0b", bg: "rgba(245,158,11,0.1)",   icon: "🔴",  label: "Issue"    },
  Decision: { color: "#22c55e", bg: "rgba(34,197,94,0.1)",    icon: "📌",  label: "Decision" },
}
const PRI: Record<string, { color: string; bg: string }> = {
  Critique: { color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
  Haute:    { color: "#f97316", bg: "rgba(249,115,22,0.12)" },
  Élevé:    { color: "#f97316", bg: "rgba(249,115,22,0.12)" },
  Moyenne:  { color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  Moyen:    { color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  Faible:   { color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
}
const STA: Record<string, { color: string; bg: string }> = {
  Ouvert:    { color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
  "En cours":{ color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  Fermé:     { color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
  Résolu:    { color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
  Accepté:   { color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
}

const emptyItem = (): RAIDItem => ({
  id: Date.now().toString(), category: "Risk", title: "", description: "",
  probability: "Moyenne", impact: "Moyen", priority: "Moyenne",
  owner: "", due_date: "", status: "Ouvert", mitigation: ""
})

const CATS = ["All","Risk","Action","Issue","Decision"] as const

export default function RAIDPage() {
  const { id } = useParams<{ id: string }>()
  const { project } = useProject(id)
  const { data, history, loading, setLoading, save, loadHistory } = useToolData(id, "raid")
  const [items, setItems]     = useState<RAIDItem[]>([])
  const [filter, setFilter]   = useState("All")
  const [editId, setEditId]   = useState<string|null>(null)
  const [editRow, setEditRow] = useState<RAIDItem|null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [newItem, setNewItem] = useState<RAIDItem>(emptyItem())

  useEffect(() => { if (data?.items) setItems(data.items) }, [data])

  const generate = async () => {
    if (!project) return
    setLoading(true); toast.info("Génération RAID en cours...")
    try {
      const res = await fetch("/api/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool: "raid", projectName: project.name, projectDescription: project.description })
      })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      const newItems = json.data?.items ?? []
      setItems(newItems); await save({ items: newItems })
      toast.success("RAID généré — " + newItems.length + " éléments")
    } catch(e: any) { toast.error(e.message) }
    finally { setLoading(false) }
  }

  const deleteItem = async (rid: string) => {
    const updated = items.filter(i => i.id !== rid)
    setItems(updated); await save({ items: updated })
  }

  const startEdit = (item: RAIDItem) => { setEditId(item.id); setEditRow({ ...item }) }
  const cancelEdit = () => { setEditId(null); setEditRow(null) }
  const saveEdit = async () => {
    if (!editRow) return
    const updated = items.map(i => i.id === editRow.id ? editRow : i)
    setItems(updated); await save({ items: updated })
    setEditId(null); setEditRow(null)
    toast.success("Élément mis à jour")
  }

  const saveNew = async () => {
    const updated = [...items, { ...newItem, id: Date.now().toString() }]
    setItems(updated); await save({ items: updated })
    setShowAdd(false); setNewItem(emptyItem())
    toast.success("Élément ajouté")
  }

  const filtered = filter === "All" ? items : items.filter(i => i.category === filter)

  const inp = (val: string, onChange: (v: string) => void, width?: number) => (
    <input value={val} onChange={e => onChange(e.target.value)}
      style={{ width: width ?? "100%", fontSize: 11, border: "1px solid var(--primary)", borderRadius: 4, padding: "2px 6px", background: "var(--bg)", color: "var(--text-1)", outline: "none" }} />
  )
  const sel = (val: string, onChange: (v: string) => void, opts: string[]) => (
    <select value={val} onChange={e => onChange(e.target.value)}
      style={{ fontSize: 11, border: "1px solid var(--primary)", borderRadius: 4, padding: "2px 5px", background: "var(--bg)", color: "var(--text-1)" }}>
      {opts.map(o => <option key={o}>{o}</option>)}
    </select>
  )

  // KPIs
  const risks    = items.filter(i => i.category === "Risk")
  const critiques = risks.filter(i => i.priority === "Critique").length
  const ouverts  = items.filter(i => i.status === "Ouvert").length

  return (
    <AppLayout>
      <ToolLayout title="RAID Register" icon="⚠️" subtitle="// RISQUES · ACTIONS · ISSUES · DÉCISIONS"
        history={history} onLoadHistory={(e) => { loadHistory(e); if(e.data?.items) setItems(e.data.items) }}
        onGenerate={generate} generateLabel="Générer RAID" generating={loading}
        onAdd={() => setShowAdd(true)} addLabel="+ Ajouter"
        exportRows={filtered.map(i => ({ Catégorie: i.category, Titre: i.title, Priorité: i.priority, Responsable: i.owner, Échéance: i.due_date, Statut: i.status, Mitigation: i.mitigation }))}
        exportFilename={"RAID_" + (project?.name ?? "")} projectName={project?.name}
        gammaType="raid" gammaData={data}>

        {/* KPIs */}
        {items.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10, marginBottom: 16 }}>
            {[
              { label: "Total",     value: items.length,                          color: "var(--primary)" },
              { label: "Risques",   value: risks.length,                          color: "#ef4444" },
              { label: "Critiques", value: critiques,                             color: "#ef4444" },
              { label: "Ouverts",   value: ouverts,                               color: "#f59e0b" },
              { label: "Résolus",   value: items.filter(i=>i.status==="Résolu"||i.status==="Fermé").length, color: "#22c55e" },
            ].map(k => (
              <div key={k.label} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 14px", textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: k.color }}>{k.value}</div>
                <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>{k.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Filtres */}
        <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
          {CATS.map(cat => {
            const cfg = cat === "All" ? null : CAT[cat]
            const count = cat === "All" ? items.length : items.filter(i => i.category === cat).length
            return (
              <button key={cat} onClick={() => setFilter(cat)}
                style={{
                  padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer",
                  border: "1px solid " + (filter === cat ? (cfg?.color ?? "var(--primary)") : "var(--border)"),
                  background: filter === cat ? (cfg?.bg ?? "var(--primary-bg)") : "transparent",
                  color: filter === cat ? (cfg?.color ?? "var(--primary-light)") : "var(--text-3)",
                }}>
                {cat === "All" ? "Tous (" + count + ")" : cfg!.icon + " " + cat + " (" + count + ")"}
              </button>
            )
          })}
        </div>

        {/* Formulaire ajout */}
        {showAdd && (
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--primary)", borderRadius: 10, padding: 16, marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--primary-light)", marginBottom: 12 }}>+ Nouvel élément RAID</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
              <div><div style={{ fontSize: 10, color: "var(--text-3)", marginBottom: 3 }}>Catégorie</div>{sel(newItem.category, v => setNewItem({...newItem, category: v as any}), ["Risk","Action","Issue","Decision"])}</div>
              <div><div style={{ fontSize: 10, color: "var(--text-3)", marginBottom: 3 }}>Priorité</div>{sel(newItem.priority, v => setNewItem({...newItem, priority: v}), ["Critique","Haute","Moyenne","Faible"])}</div>
              <div><div style={{ fontSize: 10, color: "var(--text-3)", marginBottom: 3 }}>Statut</div>{sel(newItem.status, v => setNewItem({...newItem, status: v}), ["Ouvert","En cours","Fermé","Résolu","Accepté"])}</div>
              <div><div style={{ fontSize: 10, color: "var(--text-3)", marginBottom: 3 }}>Échéance</div><input type="date" value={newItem.due_date} onChange={e => setNewItem({...newItem, due_date: e.target.value})} style={{ fontSize: 11, border: "1px solid var(--primary)", borderRadius: 4, padding: "2px 5px", background: "var(--bg)", color: "var(--text-1)" }}/></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10, marginBottom: 10 }}>
              <div><div style={{ fontSize: 10, color: "var(--text-3)", marginBottom: 3 }}>Titre</div>{inp(newItem.title, v => setNewItem({...newItem, title: v}))}</div>
              <div><div style={{ fontSize: 10, color: "var(--text-3)", marginBottom: 3 }}>Responsable</div>{inp(newItem.owner, v => setNewItem({...newItem, owner: v}))}</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
              <div><div style={{ fontSize: 10, color: "var(--text-3)", marginBottom: 3 }}>Description</div><textarea value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} rows={2} style={{ width: "100%", fontSize: 11, border: "1px solid var(--primary)", borderRadius: 4, padding: "4px 6px", background: "var(--bg)", color: "var(--text-1)", resize: "vertical" }}/></div>
              <div><div style={{ fontSize: 10, color: "var(--text-3)", marginBottom: 3 }}>Mitigation / Plan d'action</div><textarea value={newItem.mitigation} onChange={e => setNewItem({...newItem, mitigation: e.target.value})} rows={2} style={{ width: "100%", fontSize: 11, border: "1px solid var(--primary)", borderRadius: 4, padding: "4px 6px", background: "var(--bg)", color: "var(--text-1)", resize: "vertical" }}/></div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={saveNew} style={{ padding: "6px 16px", background: "var(--primary)", color: "#fff", border: "none", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}><Check size={13}/> Enregistrer</button>
              <button onClick={() => { setShowAdd(false); setNewItem(emptyItem()) }} style={{ padding: "6px 14px", background: "transparent", border: "1px solid var(--border)", borderRadius: 7, fontSize: 12, color: "var(--text-2)", cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}><X size={13}/> Annuler</button>
            </div>
          </div>
        )}

        {filtered.length === 0 && !loading && (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
            <p style={{ color: "var(--text-2)", fontSize: 15 }}>Aucun élément RAID</p>
            <p style={{ color: "var(--text-3)", fontSize: 13 }}>Générez automatiquement ou ajoutez manuellement</p>
          </div>
        )}

        {/* Tableau */}
        {filtered.length > 0 && (
          <div style={{ overflowX: "auto", borderRadius: 12, border: "1px solid var(--border)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: "var(--bg)" }}>
                  {["Catégorie", "Priorité", "Titre & Description", "Responsable", "Échéance", "Statut", "Mitigation", ""].map(h => (
                    <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--text-3)", borderBottom: "2px solid var(--border)", whiteSpace: "nowrap", textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, idx) => {
                  const cfg = CAT[item.category] ?? { color: "#64748b", bg: "rgba(100,116,139,0.1)", icon: "📋", label: item.category }
                  const pri = PRI[item.priority] ?? { color: "#64748b", bg: "rgba(100,116,139,0.1)" }
                  const sta = STA[item.status]   ?? { color: "#64748b", bg: "rgba(100,116,139,0.1)" }
                  const isEditing = editId === item.id && editRow

                  return (
                    <tr key={item.id} style={{ borderBottom: "1px solid var(--border)", background: idx % 2 === 0 ? "var(--bg-card)" : "var(--bg)", borderLeft: "3px solid " + cfg.color }}>
                      {isEditing ? (
                        <>
                          <td style={{ padding: "8px 10px" }}>{sel(editRow.category, v => setEditRow({...editRow, category: v as any}), ["Risk","Action","Issue","Decision"])}</td>
                          <td style={{ padding: "8px 10px" }}>{sel(editRow.priority, v => setEditRow({...editRow, priority: v}), ["Critique","Haute","Moyenne","Faible"])}</td>
                          <td style={{ padding: "8px 10px", minWidth: 200 }}>
                            {inp(editRow.title, v => setEditRow({...editRow, title: v}))}
                            <textarea value={editRow.description} onChange={e => setEditRow({...editRow, description: e.target.value})} rows={2} style={{ width: "100%", marginTop: 4, fontSize: 11, border: "1px solid var(--primary)", borderRadius: 4, padding: "3px 6px", background: "var(--bg)", color: "var(--text-1)", resize: "vertical" }}/>
                          </td>
                          <td style={{ padding: "8px 10px" }}>{inp(editRow.owner, v => setEditRow({...editRow, owner: v}), 100)}</td>
                          <td style={{ padding: "8px 10px" }}><input type="date" value={editRow.due_date} onChange={e => setEditRow({...editRow, due_date: e.target.value})} style={{ fontSize: 11, border: "1px solid var(--primary)", borderRadius: 4, padding: "2px 5px", background: "var(--bg)", color: "var(--text-1)" }}/></td>
                          <td style={{ padding: "8px 10px" }}>{sel(editRow.status, v => setEditRow({...editRow, status: v}), ["Ouvert","En cours","Fermé","Résolu","Accepté"])}</td>
                          <td style={{ padding: "8px 10px", minWidth: 160 }}><textarea value={editRow.mitigation} onChange={e => setEditRow({...editRow, mitigation: e.target.value})} rows={2} style={{ width: "100%", fontSize: 11, border: "1px solid var(--primary)", borderRadius: 4, padding: "3px 6px", background: "var(--bg)", color: "var(--text-1)", resize: "vertical" }}/></td>
                          <td style={{ padding: "8px 10px" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                              <button onClick={saveEdit} style={{ padding: "3px 8px", background: "var(--primary)", color: "#fff", border: "none", borderRadius: 5, cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}><Check size={11}/> OK</button>
                              <button onClick={cancelEdit} style={{ padding: "3px 8px", background: "transparent", border: "1px solid var(--border)", borderRadius: 5, cursor: "pointer", color: "var(--text-3)", display: "flex", alignItems: "center", gap: 3 }}><X size={11}/> Ann.</button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          {/* Catégorie */}
                          <td style={{ padding: "10px 12px", whiteSpace: "nowrap" }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 20, background: cfg.bg, color: cfg.color, fontSize: 11, fontWeight: 700 }}>
                              {cfg.icon} {item.category}
                            </span>
                          </td>
                          {/* Priorité */}
                          <td style={{ padding: "10px 12px", whiteSpace: "nowrap" }}>
                            <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: 20, background: pri.bg, color: pri.color, fontSize: 11, fontWeight: 700 }}>
                              {item.priority}
                            </span>
                          </td>
                          {/* Titre + description */}
                          <td style={{ padding: "10px 12px", minWidth: 220, maxWidth: 340 }}>
                            <div style={{ fontWeight: 600, color: "var(--text-1)", fontSize: 12, marginBottom: 3 }}>{item.title}</div>
                            <div style={{ fontSize: 11, color: "var(--text-3)", lineHeight: 1.4 }}>{item.description}</div>
                          </td>
                          {/* Responsable */}
                          <td style={{ padding: "10px 12px", whiteSpace: "nowrap" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--text-2)" }}>
                              <span>👤</span>{item.owner || "—"}
                            </div>
                          </td>
                          {/* Échéance */}
                          <td style={{ padding: "10px 12px", whiteSpace: "nowrap", fontSize: 11, color: "var(--text-3)" }}>
                            {item.due_date ? <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span>📅</span>{item.due_date}</span> : "—"}
                          </td>
                          {/* Statut */}
                          <td style={{ padding: "10px 12px", whiteSpace: "nowrap" }}>
                            <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: 20, background: sta.bg, color: sta.color, fontSize: 11, fontWeight: 600 }}>
                              {item.status}
                            </span>
                          </td>
                          {/* Mitigation */}
                          <td style={{ padding: "10px 12px", maxWidth: 260 }}>
                            {item.mitigation
                              ? <div style={{ fontSize: 11, color: "var(--text-2)", lineHeight: 1.4 }}>🛡️ {item.mitigation}</div>
                              : <span style={{ fontSize: 11, color: "var(--text-3)" }}>—</span>
                            }
                          </td>
                          {/* Actions */}
                          <td style={{ padding: "10px 10px", whiteSpace: "nowrap" }}>
                            <div style={{ display: "flex", gap: 5 }}>
                              <button onClick={() => startEdit(item)} style={{ padding: "4px 8px", background: "transparent", border: "1px solid var(--border)", borderRadius: 6, cursor: "pointer", color: "var(--text-3)" }}><Pencil size={12}/></button>
                              <button onClick={() => deleteItem(item.id)} style={{ padding: "4px 8px", background: "transparent", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 6, cursor: "pointer", color: "#ef4444" }}><Trash2 size={12}/></button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </ToolLayout>
    </AppLayout>
  )
}
