"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export function useProject(id: string) {
  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  useEffect(() => {
    if (!id) return
    supabase.from("projects").select("*").eq("id", id).single()
      .then(({ data }) => { setProject(data); setLoading(false) })
  }, [id])
  return { project, loading, setProject }
}

export function useToolData(projectId: string, toolType: string) {
  const [data, setData] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (!projectId || !toolType) return
    // Load current data
    supabase.from("project_tools").select("*")
      .eq("project_id", projectId).eq("tool_type", toolType).single()
      .then(({ data: d }) => { if (d) setData(d.data) })
    // Load history
    supabase.from("tool_history").select("*")
      .eq("project_id", projectId).eq("tool_type", toolType)
      .order("created_at", { ascending: false }).limit(10)
      .then(({ data: h }) => setHistory(h ?? []))
  }, [projectId, toolType])

  const save = async (newData: any, label?: string) => {
    // Upsert current
    await supabase.from("project_tools").upsert({
      project_id: projectId, tool_type: toolType,
      data: newData, generated_by: "ai", updated_at: new Date().toISOString()
    }, { onConflict: "project_id,tool_type" })
    // Save history
    const { data: hist } = await supabase.from("tool_history").insert({
      project_id: projectId, tool_type: toolType,
      label: label ?? `${toolType} — ${new Date().toLocaleDateString("fr-FR")}`,
      data: newData
    }).select().single()
    if (hist) setHistory(prev => [hist, ...prev.slice(0, 9)])
    setData(newData)
  }

  const loadHistory = (entry: any) => setData(entry.data)

  return { data, setData, history, loading, setLoading, save, loadHistory }
}
