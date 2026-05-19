import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })

    const { source, projectId, data } = await req.json()

    if (source === "jira") {
      // Convertir les issues Jira en tâches Gantt + items RAID
      const issues = data.issues ?? []

      const ganttTasks = issues.map((issue: any, i: number) => ({
        id: "T" + (i + 1),
        wbs: (i + 1) + ".0",
        name: issue.summary ?? issue.fields?.summary ?? "Issue " + (i + 1),
        phase: issue.fields?.issuetype?.name ?? "Développement",
        start: issue.fields?.created?.split("T")[0] ?? new Date().toISOString().split("T")[0],
        end: issue.fields?.duedate ?? new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
        progress: issue.fields?.status?.name === "Done" ? 100 : issue.fields?.status?.name === "In Progress" ? 50 : 0,
        critical: issue.fields?.priority?.name === "Highest" || issue.fields?.priority?.name === "High",
        responsible: issue.fields?.assignee?.displayName ?? "",
        dependencies: "",
      }))

      const raidItems = issues
        .filter((i: any) => i.fields?.issuetype?.name === "Bug" || i.fields?.priority?.name === "Highest")
        .map((issue: any, i: number) => ({
          id: "R" + Date.now() + i,
          category: issue.fields?.issuetype?.name === "Bug" ? "Issue" : "Risk",
          title: issue.fields?.summary ?? "Issue " + (i + 1),
          description: issue.fields?.description ?? "",
          priority: issue.fields?.priority?.name === "Highest" ? "Critique" : "Haute",
          owner: issue.fields?.assignee?.displayName ?? "",
          due_date: issue.fields?.duedate ?? "",
          status: issue.fields?.status?.name === "Done" ? "Résolu" : "Ouvert",
          mitigation: "",
        }))

      // Sauvegarder dans project_tools
      if (ganttTasks.length > 0) {
        await supabase.from("project_tools").upsert({
          project_id: projectId, tool_type: "gantt",
          data: { tasks: ganttTasks }, updated_at: new Date().toISOString()
        }, { onConflict: "project_id,tool_type" })
      }
      if (raidItems.length > 0) {
        await supabase.from("project_tools").upsert({
          project_id: projectId, tool_type: "raid",
          data: { items: raidItems }, updated_at: new Date().toISOString()
        }, { onConflict: "project_id,tool_type" })
      }

      return NextResponse.json({ success: true, ganttTasks: ganttTasks.length, raidItems: raidItems.length })
    }

    if (source === "notion") {
      // Convertir les pages Notion en WBS + tâches
      const pages = data.pages ?? data.results ?? []

      const wbsItems = pages.map((page: any, i: number) => {
        const title = page.properties?.Name?.title?.[0]?.text?.content
          ?? page.properties?.Titre?.title?.[0]?.text?.content
          ?? page.title ?? "Page " + (i + 1)
        return {
          id: (i + 1) + ".0",
          name: title,
          level: 1,
          parent: null,
          responsible: page.properties?.Assignee?.people?.[0]?.name ?? "",
          status: page.properties?.Status?.status?.name ?? "À faire",
        }
      })

      if (wbsItems.length > 0) {
        await supabase.from("project_tools").upsert({
          project_id: projectId, tool_type: "wbs",
          data: { items: wbsItems }, updated_at: new Date().toISOString()
        }, { onConflict: "project_id,tool_type" })
      }

      return NextResponse.json({ success: true, wbsItems: wbsItems.length })
    }

    if (source === "csv") {
      // Import CSV générique (tâches)
      const rows = data.rows ?? []
      const tasks = rows.map((r: any, i: number) => ({
        id: "T" + (i + 1), wbs: (i + 1) + ".0",
        name: r.name ?? r.Nom ?? r.Task ?? r.Tâche ?? "Tâche " + (i + 1),
        phase: r.phase ?? r.Phase ?? "Phase 1",
        start: r.start ?? r.Début ?? r.Start ?? new Date().toISOString().split("T")[0],
        end: r.end ?? r.Fin ?? r.End ?? new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
        progress: parseInt(r.progress ?? r.Avancement ?? "0"),
        critical: false, responsible: r.responsible ?? r.Responsable ?? "", dependencies: "",
      }))

      await supabase.from("project_tools").upsert({
        project_id: projectId, tool_type: "gantt",
        data: { tasks }, updated_at: new Date().toISOString()
      }, { onConflict: "project_id,tool_type" })

      return NextResponse.json({ success: true, tasks: tasks.length })
    }

    return NextResponse.json({ error: "Source non supportée" }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
