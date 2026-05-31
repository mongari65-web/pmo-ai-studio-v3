import { NextRequest, NextResponse } from "next/server"
import ExcelJS from "exceljs"
import { createAdminClient } from "@/lib/supabase/admin"

const BLUE = "1E3A8A"; const BLUE_L = "DBEAFE"; const PURPLE = "7B5EFF"
const GREEN = "16A34A"; const RED = "DC2626"; const YELLOW = "CA8A04"
const GRAY = "F8FAFC"; const WHITE = "FFFFFF"; const DARK = "0F172A"

function hdr(ws: ExcelJS.Worksheet, row: ExcelJS.Row, color = BLUE) {
  row.eachCell(c => {
    c.font = { bold: true, color: { argb: "FF" + WHITE }, size: 11 }
    c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + color } }
    c.alignment = { horizontal: "center", vertical: "middle" }
    c.border = { bottom: { style: "thin", color: { argb: "FFFFFFFF" } } }
  })
  row.height = 22
}

function title(ws: ExcelJS.Worksheet, text: string, sub: string, cols: number) {
  ws.mergeCells(1, 1, 1, cols)
  const t = ws.getCell("A1")
  t.value = text; t.font = { bold: true, size: 14, color: { argb: "FF" + BLUE } }
  t.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + BLUE_L } }
  t.alignment = { horizontal: "left", vertical: "middle" }; ws.getRow(1).height = 28
  if (sub) {
    ws.mergeCells(2, 1, 2, cols)
    const s = ws.getCell("A2"); s.value = sub
    s.font = { size: 10, italic: true, color: { argb: "FF64748B" } }
  }
}

function dataRow(row: ExcelJS.Row, even: boolean) {
  row.eachCell(c => {
    c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: even ? "FFF8FAFC" : "FFFFFFFF" } }
    c.border = { bottom: { style: "hair", color: { argb: "FFE2E8F0" } } }
    c.alignment = { vertical: "middle", wrapText: true }
  })
  row.height = 18
}

function statusColor(status: string): string {
  const s = status?.toLowerCase() ?? ""
  if (s.includes("termin") || s.includes("atteint") || s.includes("fait")) return GREEN
  if (s.includes("cours") || s.includes("progress")) return YELLOW
  if (s.includes("retard") || s.includes("critique") || s.includes("bloqué")) return RED
  return "64748B"
}

function rag(val: number, good = 1): string {
  if (val >= good) return GREEN
  if (val >= good * 0.9) return YELLOW
  return RED
}

export async function POST(req: NextRequest) {
  try {
    const { projectId, toolType, projectName } = await req.json()
    if (!projectId || !toolType) return NextResponse.json({ error: "projectId et toolType requis" }, { status: 400 })

    const supabase = createAdminClient()
    const { data: toolData } = await supabase
      .from("project_tools").select("data").eq("project_id", projectId).eq("tool_type", toolType).maybeSingle()

    const d = toolData?.data ?? {}
    const date = new Date().toLocaleDateString("fr-FR")
    const wb = new ExcelJS.Workbook()
    wb.creator = "PMO AI Studio"; wb.created = new Date()
    const pName = projectName ?? "Projet"

    // ── RAID ──────────────────────────────────────────────────
    if (toolType === "raid") {
      const items = d.items ?? []
      const ws = wb.addWorksheet("📋 RAID", { properties: { tabColor: { argb: "FFDC2626" } } })
      ws.columns = [{ width: 10 }, { width: 12 }, { width: 35 }, { width: 40 }, { width: 12 }, { width: 12 }, { width: 15 }, { width: 18 }, { width: 12 }, { width: 30 }]
      title(ws, `📋 REGISTRE RAID — ${pName}`, `${items.length} éléments | Généré le ${date}`, 10)
      ws.addRow([])
      const h = ws.addRow(["#", "Catégorie", "Titre", "Description", "Probabilité", "Impact", "Priorité", "Responsable", "Échéance", "Mitigation"])
      hdr(ws, h, "DC2626")
      items.forEach((item: any, i: number) => {
        const r = ws.addRow([i + 1, item.category, item.title, item.description, item.probability ?? "-", item.impact ?? "-", item.priority, item.owner, item.due_date, item.mitigation])
        dataRow(r, i % 2 === 0)
        // Couleur catégorie
        const catColors: Record<string, string> = { Risk: "EF4444", Action: "3B82F6", Issue: "F59E0B", Decision: "22C55E" }
        const cc = catColors[item.category] ?? "64748B"
        r.getCell(2).font = { bold: true, color: { argb: "FF" + cc } }
        // Couleur priorité
        const pc = statusColor(item.priority)
        r.getCell(7).font = { bold: true, color: { argb: "FF" + pc } }
      })
      // Stats par catégorie
      ws.addRow([]); ws.addRow([])
      const statsRow = ws.addRow(["STATISTIQUES"])
      statsRow.getCell(1).font = { bold: true, color: { argb: "FF" + BLUE } }
      const cats = ["Risk", "Action", "Issue", "Decision"]
      cats.forEach(cat => {
        const count = items.filter((i: any) => i.category === cat).length
        const r = ws.addRow([cat, count + " éléments"])
        r.getCell(1).font = { bold: true }
      })
    }

    // ── WBS ───────────────────────────────────────────────────
    else if (toolType === "wbs") {
      const items = d.items ?? []
      const levelColors: Record<number, string> = { 1:"1E3A8A", 2:"7C3AED", 3:"059669", 4:"D97706" }
      const levelBg: Record<number, string>     = { 1:"E0E7FF", 2:"F5F3FF", 3:"ECFDF5", 4:"FFFBEB" }
      const statusColor = (s: string) => s?.includes("Termin") ? GREEN : s?.includes("cours") ? YELLOW : s?.includes("tard") || s?.includes("Bloqu") ? RED : "64748B"

      // ── Onglet 1 : WBS Arborescence
      const ws1 = wb.addWorksheet("🗂️ WBS", { properties: { tabColor: { argb: "FF1E3A8A" } } })
      ws1.columns = [{ width:12 },{ width:50 },{ width:8 },{ width:45 },{ width:20 },{ width:16 },{ width:14 },{ width:18 }]
      title(ws1, `🗂️ WORK BREAKDOWN STRUCTURE — ${pName}`, `${items.length} livrables | Généré le ${date}`, 8)
      ws1.addRow([])
      hdr(ws1, ws1.addRow(["Code","Élément WBS","Niv.","Livrable attendu","Responsable","Durée","Budget","Dépendances"]), BLUE)
      items.forEach((item: any, i: number) => {
        const lc = levelColors[item.level] ?? "64748B"
        const bg = levelBg[item.level] ?? "F8FAFC"
        const r = ws1.addRow([item.code, item.name, `N${item.level}`, item.deliverable, item.responsible, item.duration, item.budget, item.dependencies])
        r.height = 20
        r.getCell(1).font = { bold: item.level<=2, color:{ argb:"FF"+lc }, family:3 }
        r.getCell(2).font = { bold: item.level===1, size: item.level===1?12:11, color:{ argb:"FF1F2937" } }
        r.getCell(2).alignment = { indent: (item.level-1)*2 }
        r.getCell(3).font = { bold:true, color:{ argb:"FF"+lc } }
        r.getCell(3).alignment = { horizontal:"center" }
        r.getCell(5).font = { color:{ argb:"FF1D4ED8" } }
        r.getCell(6).font = { color:{ argb:"FF059669" } }
        r.getCell(7).font = { color:{ argb:"FFD97706" } }
        if (item.level <= 2) {
          r.eachCell(c => { c.fill = { type:"pattern", pattern:"solid", fgColor:{ argb:"FF"+bg } } })
        } else {
          dataRow(r, i%2===0)
        }
        r.eachCell(c => { if (!c.border) c.border = { bottom:{ style:"hair", color:{ argb:"FFE2E8F0" } } } })
      })
      // Totaux budget
      const budgets = items.map((i: any) => parseFloat(String(i.budget).replace(/[^0-9.]/g,""))||0)
      const totalBudget = budgets.reduce((a: number, b: number) => a+b, 0)
      if (totalBudget > 0) {
        ws1.addRow([])
        const tot = ws1.addRow(["TOTAL","","","","","",totalBudget,""])
        tot.getCell(1).font = { bold:true, color:{ argb:"FF"+BLUE } }
        tot.getCell(7).font = { bold:true, color:{ argb:"FF"+BLUE } }
        tot.getCell(7).numFmt = "#,##0 €"
        tot.eachCell(c => c.fill = { type:"pattern", pattern:"solid", fgColor:{ argb:"FFDBEAFE" } })
      }

      // ── Onglet 2 : Dictionnaire WBS
      const ws2 = wb.addWorksheet("📖 Dictionnaire", { properties: { tabColor: { argb: "FF7C3AED" } } })
      ws2.columns = [{ width:12 },{ width:8 },{ width:35 },{ width:20 },{ width:45 },{ width:45 },{ width:35 },{ width:14 },{ width:18 }]
      title(ws2, `📖 DICTIONNAIRE WBS — ${pName}`, `Définitions détaillées | ${date}`, 9)
      ws2.addRow([])
      hdr(ws2, ws2.addRow(["Code","Niv.","Élément WBS","Responsable","Description","Livrable / Critères acceptation","Risques","Durée","Budget"]), "7C3AED")
      items.forEach((item: any, i: number) => {
        const lc = levelColors[item.level] ?? "64748B"
        const r = ws2.addRow([item.code, `N${item.level}`, item.name, item.responsible, item.description, item.acceptanceCriteria || item.deliverable, item.risks || "—", item.duration, item.budget])
        r.height = 40
        r.getCell(1).font = { bold:item.level<=2, color:{ argb:"FF"+lc } }
        r.getCell(3).font = { bold:item.level===1 }
        r.getCell(4).font = { color:{ argb:"FF1D4ED8" } }
        r.eachCell(c => {
          c.alignment = { wrapText:true, vertical:"top" }
          c.fill = { type:"pattern", pattern:"solid", fgColor:{ argb: i%2===0 ? "FFF8FAFC" : "FFFFFFFF" } }
          c.border = { bottom:{ style:"hair", color:{ argb:"FFE2E8F0" } } }
        })
        if (item.level===1) r.eachCell(c => c.fill = { type:"pattern", pattern:"solid", fgColor:{ argb:"FFE0E7FF" } })
        if (item.level===2) r.eachCell(c => c.fill = { type:"pattern", pattern:"solid", fgColor:{ argb:"FFF5F3FF" } })
      })

      // ── Onglet 3 : Calendrier
      const ws3 = wb.addWorksheet("📅 Calendrier", { properties: { tabColor: { argb: "FF059669" } } })
      ws3.columns = [{ width:12 },{ width:45 },{ width:8 },{ width:20 },{ width:14 },{ width:14 },{ width:12 },{ width:14 },{ width:18 }]
      title(ws3, `📅 CALENDRIER WBS — ${pName}`, `Planning détaillé | ${date}`, 9)
      ws3.addRow([])
      hdr(ws3, ws3.addRow(["Code","Livrable","Niv.","Responsable","Début","Fin","Durée","Avancement","Statut"]), "059669")
      items.forEach((item: any, i: number) => {
        const lc = levelColors[item.level] ?? "64748B"
        const prog = item.progress ?? 0
        const sc = statusColor(item.status ?? "")
        const r = ws3.addRow([item.code, item.name, `N${item.level}`, item.responsible, item.startDate || "—", item.endDate || "—", item.duration, `${prog}%`, item.status || "Non démarré"])
        r.height = 20
        r.getCell(1).font = { bold:item.level<=2, color:{ argb:"FF"+lc } }
        r.getCell(3).font = { bold:true, color:{ argb:"FF"+lc } }
        r.getCell(3).alignment = { horizontal:"center" }
        r.getCell(4).font = { color:{ argb:"FF1D4ED8" } }
        r.getCell(8).font = { bold:true, color:{ argb:"FF"+(prog>=100?GREEN:prog>0?YELLOW:"94A3B8") } }
        r.getCell(9).font = { bold:true, color:{ argb:"FF"+sc } }
        dataRow(r, i%2===0)
        if (item.level===1) r.eachCell(c => c.fill = { type:"pattern", pattern:"solid", fgColor:{ argb:"FFECFDF5" } })
      })
    }

    // ── RACI ──────────────────────────────────────────────────
    else if (toolType === "raci") {
      const rows = d.rows ?? []; const actors = d.actors ?? []
      const ws = wb.addWorksheet("👥 RACI", { properties: { tabColor: { argb: "FF7B5EFF" } } })
      ws.columns = [{ width: 8 }, { width: 40 }, { width: 15 }, ...actors.map(() => ({ width: 14 }))]
      title(ws, `👥 MATRICE RACI — ${pName}`, `${rows.length} tâches | ${actors.length} acteurs | ${date}`, 3 + actors.length)
      ws.addRow([])
      const h = ws.addRow(["#", "Tâche / Livrable", "Phase", ...actors])
      hdr(ws, h, PURPLE)
      const raciCfg: Record<string, {bg:string; fg:string}> = {
        R: { bg:"BFDBFE", fg:"1E3A8A" },
        A: { bg:"FECACA", fg:"991B1B" },
        C: { bg:"FDE68A", fg:"92400E" },
        I: { bg:"BBF7D0", fg:"14532D" },
        D: { bg:"DDD6FE", fg:"4C1D95" },
        "-": { bg:"F8FAFC", fg:"CBD5E1" },
      }
      // Helper : calcule la lettre RACI pour un acteur donné
      const getCell = (row: any, actor: string): string => {
        const split = (f: string) => (row[f] ?? "").split(",").map((s: string) => s.trim())
        if (split("driver").includes(actor))      return "D"
        if (split("accountable").includes(actor)) return "A"
        if (split("responsible").includes(actor)) return "R"
        if (split("consulted").includes(actor))   return "C"
        if (split("informed").includes(actor))    return "I"
        return "-"
      }
      rows.forEach((row: any, i: number) => {
        const vals = actors.map((a: string) => getCell(row, a))
        const r = ws.addRow([i + 1, row.activity ?? row.task ?? "-", row.phase ?? "-", ...vals])
        r.getCell(1).fill = { type:"pattern", pattern:"solid", fgColor:{ argb: i%2===0 ? "FFF8FAFC":"FFFFFFFF" } }
        r.getCell(2).fill = { type:"pattern", pattern:"solid", fgColor:{ argb: i%2===0 ? "FFF8FAFC":"FFFFFFFF" } }
        r.getCell(3).fill = { type:"pattern", pattern:"solid", fgColor:{ argb: i%2===0 ? "FFF8FAFC":"FFFFFFFF" } }
        r.getCell(2).font = { size:11, color:{ argb:"FF1F2937" } }
        r.getCell(3).font = { size:10, italic:true, color:{ argb:"FF6B7280" } }
        r.height = 20
        actors.forEach((_: string, ai: number) => {
          const cell = r.getCell(4 + ai)
          const v = cell.value as string
          const cfg = raciCfg[v] ?? raciCfg["-"]
          cell.fill = { type:"pattern", pattern:"solid", fgColor:{ argb:"FF"+cfg.bg } }
          cell.font = { bold: v !== "-", size:12, color:{ argb:"FF"+cfg.fg } }
          cell.alignment = { horizontal:"center", vertical:"middle" }
          cell.border = {
            top:   { style:"thin", color:{ argb:"FFFFFFFF" } },
            bottom:{ style:"thin", color:{ argb:"FFFFFFFF" } },
            left:  { style:"thin", color:{ argb:"FFFFFFFF" } },
            right: { style:"thin", color:{ argb:"FFFFFFFF" } },
          }
        })
      })
      // Légende
      ws.addRow([]); ws.addRow(["LÉGENDE"])
      ;[["R", "Responsible — Réalise la tâche", "1E3A8A"],
        ["A", "Accountable — Responsable final", "DC2626"],
        ["C", "Consulted — Consulté", "D97706"],
        ["I", "Informed — Informé", "16A34A"]
      ].forEach(([code, desc, color]) => {
        const r = ws.addRow([code, desc])
        r.getCell(1).font = { bold: true, color: { argb: "FF" + color } }
      })
    }

    // ── JALONS ────────────────────────────────────────────────
    else if (toolType === "jalons") {
      const items = d.jalons ?? []
      const ws = wb.addWorksheet("🏁 Jalons", { properties: { tabColor: { argb: "FF059669" } } })
      ws.columns = [{ width: 10 }, { width: 35 }, { width: 14 }, { width: 14 }, { width: 20 }, { width: 30 }, { width: 30 }]
      title(ws, `🏁 PLAN JALONS — ${pName}`, `${items.length} jalons | ${date}`, 7)
      ws.addRow([])
      const h = ws.addRow(["Code", "Jalon", "Date", "Statut", "Responsable", "Livrables", "Description"])
      hdr(ws, h, "059669")
      items.forEach((item: any, i: number) => {
        const r = ws.addRow([item.code, item.name, item.date, item.status, item.responsible, item.deliverables, item.description])
        dataRow(r, i % 2 === 0)
        const sc = statusColor(item.status)
        r.getCell(4).font = { bold: true, color: { argb: "FF" + sc } }
        const d2 = new Date(item.date)
        if (!isNaN(d2.getTime())) r.getCell(3).numFmt = "dd/mm/yyyy"
      })
    }

    // ── GANTT ──────────────────────────────────────────────────
    else if (toolType === "gantt") {
      const tasks = d.tasks ?? []
      const ws = wb.addWorksheet("📅 Gantt", { properties: { tabColor: { argb: "FF0891B2" } } })
      ws.columns = [{ width: 10 }, { width: 40 }, { width: 15 }, { width: 12 }, { width: 12 }, { width: 10 }, { width: 18 }, { width: 12 }, { width: 20 }, { width: 10 }]
      title(ws, `📅 PLANNING GANTT — ${pName}`, `${tasks.length} tâches | ${date}`, 10)
      ws.addRow([])
      const h = ws.addRow(["WBS", "Tâche", "Phase", "Début", "Fin", "Durée (j)", "Responsable", "Avancement", "Dépendances", "Critique"])
      hdr(ws, h, "0891B2")
      tasks.forEach((task: any, i: number) => {
        const r = ws.addRow([task.wbs, task.name, task.phase, task.start, task.end, task.duration, task.responsible, task.progress + "%", task.dependencies, task.critical ? "🔴 Oui" : "Non"])
        dataRow(r, i % 2 === 0)
        const pc = task.progress >= 100 ? GREEN : task.progress > 0 ? YELLOW : "94A3B8"
        r.getCell(8).font = { bold: true, color: { argb: "FF" + pc } }
        if (task.critical) r.getCell(10).font = { bold: true, color: { argb: "FFDC2626" } }
        if (task.type === "milestone") r.eachCell(c => c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFF7ED" } })
      })
    }

    // ── COMMUNICATION ─────────────────────────────────────────
    else if (toolType === "communication") {
      const items = d.items ?? []
      const ws = wb.addWorksheet("📢 Communication", { properties: { tabColor: { argb: "FFD97706" } } })
      ws.columns = [{ width: 8 }, { width: 25 }, { width: 18 }, { width: 12 }, { width: 10 }, { width: 30 }, { width: 18 }, { width: 14 }, { width: 16 }, { width: 18 }, { width: 12 }]
      title(ws, `📢 PLAN DE COMMUNICATION — ${pName}`, `${items.length} lignes | ${date}`, 11)
      ws.addRow([])
      const h = ws.addRow(["#", "Partie Prenante", "Rôle", "Influence", "Intérêt", "Message clé", "Canal", "Fréquence", "Format", "Responsable", "Statut"])
      hdr(ws, h, "D97706")
      items.forEach((item: any, i: number) => {
        const r = ws.addRow([i + 1, item.stakeholder, item.role, item.influence, item.interest, item.message, item.channel, item.frequency, item.format, item.owner, item.status])
        dataRow(r, i % 2 === 0)
        const ic = item.influence === "Élevée" ? RED : item.influence === "Moyenne" ? YELLOW : GREEN
        r.getCell(4).font = { bold: true, color: { argb: "FF" + ic } }
        const sc = statusColor(item.status)
        r.getCell(11).font = { bold: true, color: { argb: "FF" + sc } }
      })
    }

    // ── WORKPACKAGES ──────────────────────────────────────────
    else if (toolType === "workpackages") {
      const wps = d.workpackages ?? []
      const ws = wb.addWorksheet("📦 Work Packages", { properties: { tabColor: { argb: "FF6366F1" } } })
      ws.columns = [{ width: 8 }, { width: 12 }, { width: 35 }, { width: 15 }, { width: 18 }, { width: 12 }, { width: 12 }, { width: 12 }, { width: 25 }, { width: 30 }]
      title(ws, `📦 WORK PACKAGES — ${pName}`, `${wps.length} WPs | ${date}`, 10)
      ws.addRow([])
      const h = ws.addRow(["Code", "Phase", "Nom", "Responsable", "Lead", "Début", "Fin", "Budget (€)", "Livrables", "Statut"])
      hdr(ws, h, "6366F1")
      let totalBudget = 0
      wps.forEach((wp: any, i: number) => {
        totalBudget += wp.budget ?? 0
        const r = ws.addRow([wp.code, wp.phase, wp.name, wp.responsible, wp.lead_profile ?? "-", wp.start, wp.end, wp.budget ?? 0, wp.deliverables, wp.status])
        dataRow(r, i % 2 === 0)
        r.getCell(8).numFmt = "#,##0 €"
        const sc = statusColor(wp.status)
        r.getCell(10).font = { bold: true, color: { argb: "FF" + sc } }
      })
      // Ligne total
      const tot = ws.addRow(["TOTAL", "", "", "", "", "", "", totalBudget, "", ""])
      tot.getCell(1).font = { bold: true, color: { argb: "FF" + BLUE } }
      tot.getCell(8).font = { bold: true, color: { argb: "FF" + BLUE } }
      tot.getCell(8).numFmt = "#,##0 €"
      tot.eachCell(c => c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + BLUE_L } })
    }


    // -- OKR
    else if (toolType === "okr") {
      const objectives = d.objectives ?? []
      const ws = wb.addWorksheet("OKR", { properties: { tabColor: { argb: "FF7C3AED" } } })
      const CAT_COLORS: Record<string, string> = {
        "Strategique": "1E3A8A", "Strategique": "1E3A8A",
        "Client": "059669", "Qualite": "D97706",
        "Finance": "DC2626", "RH": "7C3AED", "Innovation": "0891B2",
        "Operationnel": "64748B",
      }
      const progColor = (p: number) => p >= 80 ? GREEN : p >= 60 ? YELLOW : p >= 40 ? "F59E0B" : RED
      ws.columns = [{ width:8 },{ width:35 },{ width:12 },{ width:14 },{ width:18 },{ width:40 },{ width:10 },{ width:10 },{ width:8 },{ width:12 }]
      title(ws, `OKR TRACKER -- ${pName}`, `${objectives.length} objectifs | ${date}`, 10)
      ws.addRow([])
      hdr(ws, ws.addRow(["#","Objectif","Trimestre","Categorie","Responsable","Key Result","Actuel","Cible","Poids","Progression"]), "7C3AED")
      let rowIdx = 0
      objectives.forEach((obj: any, i: number) => {
        const krs = obj.keyResults ?? []
        const totalW = krs.reduce((s: number, kr: any) => s + (kr.weight ?? 1), 0)
        const objProg = totalW > 0 ? Math.round(krs.reduce((s: number, kr: any) => {
          const p = kr.target > 0 ? Math.min(100, Math.round(kr.current / kr.target * 100)) : 0
          return s + p * (kr.weight ?? 1)
        }, 0) / totalW) : 0
        const cc = CAT_COLORS[obj.category] ?? "64748B"
        const rowsToAdd = krs.length > 0 ? krs : [null]
        rowsToAdd.forEach((kr: any, j: number) => {
          const krProg = kr && kr.target > 0 ? Math.min(100, Math.round(kr.current / kr.target * 100)) : 0
          const r = ws.addRow([
            j === 0 ? i + 1 : "",
            j === 0 ? obj.title : "",
            j === 0 ? obj.quarter : "",
            j === 0 ? obj.category : "",
            j === 0 ? obj.owner : "",
            kr ? kr.text : "Aucun KR",
            kr ? (kr.current ?? 0) : "",
            kr ? (kr.target ?? 100) : "",
            kr ? (kr.weight ?? 1) : "",
            `${kr ? krProg : objProg}%`
          ])
          r.height = 20
          const bg = j === 0 ? (rowIdx % 2 === 0 ? "FFF8FAFC" : "FFFFFFFF") : (rowIdx % 2 === 0 ? "FFEFF6FF" : "FFF0FDF4")
          r.eachCell(c => c.fill = { type:"pattern", pattern:"solid", fgColor:{ argb: bg } })
          if (j === 0) {
            r.getCell(2).font = { bold: true }
            r.getCell(4).font = { bold: true, color: { argb: "FF" + cc } }
          }
          r.getCell(10).font = { bold: true, color: { argb: "FF" + progColor(kr ? krProg : objProg) } }
          r.getCell(10).alignment = { horizontal: "center" }
          rowIdx++
        })
      })
    }

    // ── GÉNÉRIQUE (autres outils) ─────────────────────────────
    else {
      const ws = wb.addWorksheet(toolType, { properties: { tabColor: { argb: "FF1E3A8A" } } })
      // Détecter les données
      const dataArr = d.items ?? d.tasks ?? d.rows ?? d.jalons ?? d.workpackages ??
        (Array.isArray(d) ? d : Object.values(d).find(v => Array.isArray(v))) ?? []
      if (dataArr.length > 0) {
        const keys = Object.keys(dataArr[0]).filter(k => k !== "id")
        ws.columns = keys.map(k => ({ header: k, width: 20 }))
        title(ws, `${toolType.toUpperCase()} — ${pName}`, `${dataArr.length} éléments | ${date}`, keys.length)
        ws.addRow([])
        const h = ws.addRow(keys)
        hdr(ws, h, BLUE)
        dataArr.forEach((item: any, i: number) => {
          const r = ws.addRow(keys.map(k => item[k] ?? ""))
          dataRow(r, i % 2 === 0)
        })
      } else {
        title(ws, `${toolType.toUpperCase()} — ${pName}`, `Aucune donnée disponible`, 3)
      }
    }

    // Générer
    const buffer = await wb.xlsx.writeBuffer()
    const uint8 = new Uint8Array(buffer as ArrayBuffer)
    const filename = `${toolType}_${pName.replace(/[^a-zA-Z0-9]/g, "_")}_${date.replace(/\//g, "-")}`
    return new NextResponse(uint8, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}.xlsx"`,
      }
    })
  } catch (e: any) {
    console.error("Tool Excel error:", e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
