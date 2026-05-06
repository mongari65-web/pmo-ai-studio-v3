"use client"
import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"

export function useProject(id: string) {
  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!id) return
    supabase.from("projects").select("*").eq("id", id).single()
      .then(({ data, error }) => {
        if (error) console.error("[useProject]", error.message)
        setProject(data)
        setLoading(false)
      })
  }, [id])

  return { project, loading, setProject }
}

export function useToolData(projectId: string, toolType: string) {
  const [data, setData] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const fetchData = useCallback(async () => {
    if (!projectId || !toolType) return

    // Load current tool data
    const { data: toolData, error: toolErr } = await supabase
      .from("project_tools")
      .select("*")
      .eq("project_id", projectId)
      .eq("tool_type", toolType)
      .maybeSingle()

    if (toolErr) console.error("[useToolData] load:", toolErr.message)
    if (toolData?.data) setData(toolData.data)

    // Load history
    const { data: hist, error: histErr } = await supabase
      .from("tool_history")
      .select("*")
      .eq("project_id", projectId)
      .eq("tool_type", toolType)
      .order("created_at", { ascending: false })
      .limit(10)

    if (histErr) console.error("[useToolData] history:", histErr.message)
    setHistory(hist ?? [])
  }, [projectId, toolType])

  useEffect(() => { fetchData() }, [fetchData])

  const save = useCallback(async (newData: any, label?: string) => {
    if (!projectId || !toolType) return
    console.log(`[save] ${toolType}: saving ${JSON.stringify(newData).length} chars`)

    // Upsert current
    const { error: upsertErr } = await supabase.from("project_tools").upsert(
      { project_id: projectId, tool_type: toolType, data: newData, updated_at: new Date().toISOString() },
      { onConflict: "project_id,tool_type" }
    )
    if (upsertErr) console.error("[save] upsert:", upsertErr.message)

    // Save to history
    const { data: hist, error: histErr } = await supabase.from("tool_history").insert({
      project_id: projectId, tool_type: toolType,
      label: label ?? `${toolType} — ${new Date().toLocaleDateString("fr-FR", { day:"2-digit", month:"2-digit", hour:"2-digit", minute:"2-digit" })}`,
      data: newData
    }).select().single()

    if (histErr) console.error("[save] history:", histErr.message)
    if (hist) setHistory(prev => [hist, ...prev.slice(0, 9)])
    setData(newData)
  }, [projectId, toolType])

  const loadHistory = useCallback((entry: any) => {
    setData(entry.data)
  }, [])

  return { data, setData, history, loading, setLoading, save, loadHistory }
}
