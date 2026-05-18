"use client"
import { NavButtons } from "@/components/ui/BackButton"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import AppLayout from "@/components/layout/AppLayout"
import ToolLayout from "@/components/tools/ToolLayout"
import { useProject } from "@/hooks/useProject"
import { useToolData } from "@/hooks/useProject"
import { toast } from "sonner"
import { Pencil, Trash2, Check, X } from "lucide-react"

interface WBSItem {
  id: string; code: string; name: string; level: number
  description: string; deliverable: string; responsible: string
  duration: string; budget: string; dependencies: string
}

const LEVEL_COLORS: Record<number, string> = {
  1: "var(--primary)", 2: "#7c3aed", 3: "#059669", 4: "#d97706"
}

const empty = (): WBSItem => ({
  id: Date.now().toString(), code: "", name: "", level: 2,
  description: "", deliverable: "", responsible: "", duration: "", budget: "", dependencies: ""
})

export default function WBSPage() {
  const { id } = useParams<{ id: string }>()
  const { project } = useProject(id)
  const { data, setData, history, loading, setLoading, save, loadHistory } = useToolData(id, "wbs")
  const [items, setItems] = useState<WBSItem[]>([])
  const [editId, setEditId] = useState<string | null>(null)
  const [editRow, setEditRow] = useState<WBSItem | null>(null)
  const [adding, setAdding] = useState(false)
  const [newRow, setNewRow] = useState<WBSItem>(empty())

  useEffect(() => { if (data?.items) setItems(data.items) }, [data])

  const generate = async () => {
    if (!project) return
    setLoading(true)
    toast.info("Génération WBS en cours...")
    try {
      const res = await fetch("/api/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool: "wbs", projectName: project.name,
          projectDescription: project.description,
          budget: project.budget, startDate: project.start_date, endDate: project.end_date
        })
      })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      const newItems = json.data?.items ?? []
      setItems(newItems)
      await save({ items: newItems })
      toast.success(`WBS généré — ${newItems.length} éléments`)
    } catch (e: any) { toast.error(e.message) }
    finally { setLoading(false) }
  }

  const startEdit = (item: WBSItem) => { setEditId(item.id); setEditRow({ ...item }) }
  const cancelEdit = () => { setEditId(null); setEditRow(null) }
  const confirmEdit = async () => {
    if (!editRow) return
    const updated = items.map(i => i.id === editRow.id ? editRow : i)
    setItems(updated); setEditId(null); setEditRow(null)
    await save({ items: updated })
  }
  const deleteItem = async (id: string) => {
    const updated = items.filter(i => i.id !== id)
    setItems(updated); await save({ items: updated })
  }
  const addItem = async () => {
    const updated = [...items, { ...newRow, id: Date.now().toString() }]
    setItems(updated); setAdding(false); setNewRow(empty())
    await save({ items: updated })
  }

  const toRows = () => items.map(i => ({
    Code: i.code, Élément: i.name, Niveau: i.level,
    Description: i.description, Livrable: i.deliverable,
    Responsable: i.responsible, Durée: i.duration, Budget: i.budget
  }))

  const COLS = ["Code","Élément WBS","Niv.","Livrable","Responsable","Durée","Budget","Actions"]

  return (
    <AppLayout>
      <ToolLayout title="WBS — Dictionnaire" icon="🗂️" subtitle="// STRUCTURE DE DÉCOUPAGE"
        history={history} onLoadHistory={(e) => { loadHistory(e); if (e.data?.items) setItems(e.data.items) }}
        onGenerate={generate} generateLabel="Générer WBS" generating={loading}
        onAdd={() => setAdding(true)} addLabel="+ Ajouter ligne"
        exportRows={toRows()} exportFilename={`WBS_${project?.name ?? ""}`}
        projectName={project?.name}>

        {items.length === 0 && !loading && (
          <div className="bg-card border border-dashed border-border rounded-xl p-16 text-center">
            <div className="text-5xl mb-3">🗂️</div>
            <p className="font-semibold text-foreground mb-1">Aucun élément WBS</p>
            <p className="text-sm text-muted-foreground">Générez automatiquement ou ajoutez manuellement</p>
          </div>
        )}

        {items.length > 0 && (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-primary/20 border-b border-border">
                  {COLS.map(c => (
                    <th key={c} className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={item.id} className="border-b border-border hover:bg-accent/30 transition-colors"
                    style={{ borderLeft: `3px solid ${LEVEL_COLORS[item.level] ?? "#475569"}` }}>
                    {editId === item.id && editRow ? (
                      <>
                        <td className="px-2 py-1"><input value={editRow.code} onChange={e => setEditRow({...editRow, code: e.target.value})} className="w-full bg-background border border-border rounded px-2 py-1 text-xs"/></td>
                        <td className="px-2 py-1"><input value={editRow.name} onChange={e => setEditRow({...editRow, name: e.target.value})} className="w-full bg-background border border-border rounded px-2 py-1 text-xs"/></td>
                        <td className="px-2 py-1"><select value={editRow.level} onChange={e => setEditRow({...editRow, level: +e.target.value})} className="bg-background border border-border rounded px-1 py-1 text-xs">{[1,2,3,4].map(l => <option key={l}>{l}</option>)}</select></td>
                        <td className="px-2 py-1"><input value={editRow.deliverable} onChange={e => setEditRow({...editRow, deliverable: e.target.value})} className="w-full bg-background border border-border rounded px-2 py-1 text-xs"/></td>
                        <td className="px-2 py-1"><input value={editRow.responsible} onChange={e => setEditRow({...editRow, responsible: e.target.value})} className="w-full bg-background border border-border rounded px-2 py-1 text-xs"/></td>
                        <td className="px-2 py-1"><input value={editRow.duration} onChange={e => setEditRow({...editRow, duration: e.target.value})} className="w-full bg-background border border-border rounded px-2 py-1 text-xs"/></td>
                        <td className="px-2 py-1"><input value={editRow.budget} onChange={e => setEditRow({...editRow, budget: e.target.value})} className="w-full bg-background border border-border rounded px-2 py-1 text-xs"/></td>
                        <td className="px-2 py-1">
                          <div className="flex gap-1">
                            <button onClick={confirmEdit} className="p-1 text-green-400 hover:bg-green-500/10 rounded"><Check size={14}/></button>
                            <button onClick={cancelEdit} className="p-1 text-red-400 hover:bg-red-500/10 rounded"><X size={14}/></button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{item.code}</td>
                        <td className="px-3 py-2 font-medium text-foreground" style={{ paddingLeft: `${8 + (item.level-1)*16}px` }}>{item.name}</td>
                        <td className="px-3 py-2"><span className="px-1.5 py-0.5 rounded text-[10px] font-bold" style={{ background: LEVEL_COLORS[item.level]+"22", color: LEVEL_COLORS[item.level] }}>N{item.level}</span></td>
                        <td className="px-3 py-2 text-xs text-muted-foreground max-w-32 truncate">{item.deliverable}</td>
                        <td className="px-3 py-2 text-xs text-blue-400">{item.responsible}</td>
                        <td className="px-3 py-2 text-xs text-green-400">{item.duration}</td>
                        <td className="px-3 py-2 text-xs text-amber-400">{item.budget}</td>
                        <td className="px-3 py-2">
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 hover:opacity-100">
                            <button onClick={() => startEdit(item)} className="p-1 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition-colors"><Pencil size={12}/></button>
                            <button onClick={() => deleteItem(item.id)} className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"><Trash2 size={12}/></button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
                {/* Add row */}
                {adding && (
                  <tr className="border-b border-border bg-primary/5">
                    <td className="px-2 py-1"><input value={newRow.code} onChange={e => setNewRow({...newRow, code: e.target.value})} placeholder="1.1" className="w-full bg-background border border-primary/40 rounded px-2 py-1 text-xs"/></td>
                    <td className="px-2 py-1"><input value={newRow.name} onChange={e => setNewRow({...newRow, name: e.target.value})} placeholder="Nom de l'élément" className="w-full bg-background border border-primary/40 rounded px-2 py-1 text-xs"/></td>
                    <td className="px-2 py-1"><select value={newRow.level} onChange={e => setNewRow({...newRow, level: +e.target.value})} className="bg-background border border-primary/40 rounded px-1 py-1 text-xs">{[1,2,3,4].map(l => <option key={l}>{l}</option>)}</select></td>
                    <td className="px-2 py-1"><input value={newRow.deliverable} onChange={e => setNewRow({...newRow, deliverable: e.target.value})} placeholder="Livrable" className="w-full bg-background border border-primary/40 rounded px-2 py-1 text-xs"/></td>
                    <td className="px-2 py-1"><input value={newRow.responsible} onChange={e => setNewRow({...newRow, responsible: e.target.value})} placeholder="Responsable" className="w-full bg-background border border-primary/40 rounded px-2 py-1 text-xs"/></td>
                    <td className="px-2 py-1"><input value={newRow.duration} onChange={e => setNewRow({...newRow, duration: e.target.value})} placeholder="2 sem." className="w-full bg-background border border-primary/40 rounded px-2 py-1 text-xs"/></td>
                    <td className="px-2 py-1"><input value={newRow.budget} onChange={e => setNewRow({...newRow, budget: e.target.value})} placeholder="5000€" className="w-full bg-background border border-primary/40 rounded px-2 py-1 text-xs"/></td>
                    <td className="px-2 py-1">
                      <div className="flex gap-1">
                        <button onClick={addItem} className="p-1 text-green-400 hover:bg-green-500/10 rounded"><Check size={14}/></button>
                        <button onClick={() => setAdding(false)} className="p-1 text-red-400 hover:bg-red-500/10 rounded"><X size={14}/></button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </ToolLayout>
    </AppLayout>
  )
}
