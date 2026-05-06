"use client"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import AppLayout from "@/components/layout/AppLayout"
import ToolLayout from "@/components/tools/ToolLayout"
import { useProject, useToolData } from "@/hooks/useProject"
import { toast } from "sonner"

export default function GanttPage() {
  const { id } = useParams<{ id: string }>()
  const { project } = useProject(id)
  const { data, history, loading, setLoading, save, loadHistory } = useToolData(id, "gantt")
  const [items, setItems] = useState<any[]>([])

  useEffect(() => {
    const key = Object.keys(data ?? {})[0]
    if (key && data?.[key]) setItems(data[key])
  }, [data])

  const generate = async () => {
    if (!project) return
    setLoading(true)
    toast.info("Génération Planning Gantt en cours...")
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool: "gantt",
          projectName: project.name,
          projectDescription: project.description,
          budget: project.budget,
          startDate: project.start_date,
          endDate: project.end_date
        })
      })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      const key = Object.keys(json.data ?? {})[0]
      const newItems = key ? json.data[key] : []
      setItems(newItems)
      await save(json.data)
      toast.success("Planning Gantt généré — " + newItems.length + " éléments")
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppLayout>
      <ToolLayout
        title="Planning Gantt" icon="📅" subtitle="// PLANNING"
        history={history}
        onLoadHistory={(e) => {
          loadHistory(e)
          const k = Object.keys(e.data ?? {})[0]
          if (k) setItems(e.data[k])
        }}
        onGenerate={generate}
        generateLabel="Générer Planning Gantt"
        generating={loading}
        projectName={project?.name}
        exportRows={items.map((item, i) => ({ Index: i + 1, ...item }))}
        exportFilename={"gantt_" + (project?.name ?? "")}>

        {items.length === 0 && !loading && (
          <div className="bg-card border border-dashed border-border rounded-xl p-16 text-center">
            <div className="text-5xl mb-3">📅</div>
            <p className="font-semibold text-foreground mb-1">Aucun contenu</p>
            <p className="text-sm text-muted-foreground">
              Cliquez sur "Générer Planning Gantt" pour démarrer
            </p>
          </div>
        )}

        {loading && (
          <div className="bg-card border border-border rounded-xl p-16 text-center text-primary">
            <div className="text-4xl mb-3 animate-pulse">⏳</div>
            <p>Génération IA en cours...</p>
          </div>
        )}

        {items.length > 0 && (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-primary/20 border-b border-border">
                  {Object.keys(items[0]).filter(k => !["id"].includes(k)).map(k => (
                    <th key={k} className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      {k}
                    </th>
                  ))}
                  <th className="px-3 py-2.5 text-xs text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx} className="border-b border-border hover:bg-accent/30 transition-colors">
                    {Object.entries(item).filter(([k]) => !["id"].includes(k)).map(([k, v]) => (
                      <td key={k} className="px-3 py-2 text-xs text-muted-foreground max-w-40 truncate" title={String(v)}>
                        {String(v)}
                      </td>
                    ))}
                    <td className="px-3 py-2">
                      <button className="text-xs text-primary hover:underline">Éditer</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ToolLayout>
    </AppLayout>
  )
}
