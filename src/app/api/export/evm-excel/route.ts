import { NextRequest, NextResponse } from "next/server"
import ExcelJS from "exceljs"
import { ChartJSNodeCanvas } from "chartjs-node-canvas"

const MONTHS = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"]

// Couleurs PMO AI Studio
const BLUE_DARK  = "1E3A8A"
const BLUE_MED   = "2563EB"
const BLUE_LIGHT = "DBEAFE"
const PURPLE     = "7B5EFF"
const GREEN      = "16A34A"
const RED        = "DC2626"
const YELLOW     = "CA8A04"
const GRAY_LIGHT = "F8FAFC"
const GRAY_HDR   = "E2E8F0"
const WHITE      = "FFFFFF"

function styleHeader(cell: ExcelJS.Cell, bgColor = BLUE_DARK) {
  cell.font = { bold: true, color: { argb: "FF" + WHITE }, size: 11 }
  cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + bgColor } }
  cell.alignment = { horizontal: "center", vertical: "middle" }
  cell.border = {
    bottom: { style: "thin", color: { argb: "FF" + WHITE } },
    right: { style: "thin", color: { argb: "FF" + WHITE } }
  }
}

function styleTotal(cell: ExcelJS.Cell) {
  cell.font = { bold: true, color: { argb: "FF" + BLUE_DARK } }
  cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + BLUE_LIGHT } }
  cell.border = { top: { style: "double", color: { argb: "FF" + BLUE_DARK } } }
  if (typeof cell.value === "number") {
    cell.numFmt = "#,##0"
    cell.alignment = { horizontal: "right" }
  }
}

function styleKPI(cell: ExcelJS.Cell, value: number, isGood: boolean) {
  cell.font = { bold: true, size: 12, color: { argb: "FF" + (isGood ? GREEN : RED) } }
  cell.numFmt = typeof cell.value === "number" && Math.abs(value) > 10 ? "#,##0" : "0.00"
  cell.alignment = { horizontal: "center", vertical: "middle" }
}

function styleData(cell: ExcelJS.Cell, isEven: boolean) {
  cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: isEven ? "FFF8FAFC" : "FFFFFFFF" } }
  cell.border = { bottom: { style: "hair", color: { argb: "FFE2E8F0" } } }
  if (typeof cell.value === "number") {
    cell.numFmt = "#,##0"
    cell.alignment = { horizontal: "right" }
  }
}

function addSheetTitle(ws: ExcelJS.Worksheet, title: string, subtitle: string, colCount: number) {
  ws.mergeCells(1, 1, 1, colCount)
  const t = ws.getCell("A1")
  t.value = title
  t.font = { bold: true, size: 14, color: { argb: "FF" + BLUE_DARK } }
  t.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + BLUE_LIGHT } }
  t.alignment = { horizontal: "left", vertical: "middle" }
  ws.getRow(1).height = 30

  if (subtitle) {
    ws.mergeCells(2, 1, 2, colCount)
    const s = ws.getCell("A2")
    s.value = subtitle
    s.font = { size: 10, italic: true, color: { argb: "FF64748B" } }
    s.alignment = { horizontal: "left" }
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    let { tasks = [], currentPeriod = 0, projectName = "Projet", cpName = "Chef de Projet" } = body

    // Si projectId fourni — lire depuis Supabase
    if (body.projectId && tasks.length === 0) {
      const { createAdminClient } = await import("@/lib/supabase/admin")
      const supabase = createAdminClient()
      const { data: toolData } = await supabase
        .from("project_tools")
        .select("data")
        .eq("project_id", body.projectId)
        .eq("tool_type", "budget")
        .maybeSingle()
      if (toolData?.data) {
        tasks = toolData.data.tasks ?? []
        currentPeriod = toolData.data.currentPeriod ?? 0
        if (!body.projectName) {
          const { data: proj } = await supabase
            .from("projects")
            .select("name")
            .eq("id", body.projectId)
            .maybeSingle()
          projectName = proj?.name ?? "Projet"
        }
      }
    }
    const cp = currentPeriod
    const date = new Date().toLocaleDateString("fr-FR")
    const wb = new ExcelJS.Workbook()
    wb.creator = "PMO AI Studio"
    wb.created = new Date()

    // ── Calculs globaux ───────────────────────────────────
    const totalBAC = tasks.reduce((s: number, t: any) => s + (t.bac ?? 0), 0)
    const totalPV  = tasks.reduce((s: number, t: any) => s + (t.pv?.[cp] ?? 0), 0)
    const totalEV  = tasks.reduce((s: number, t: any) => s + (t.ev?.[cp] ?? 0), 0)
    const totalAC  = tasks.reduce((s: number, t: any) => s + (t.ac?.[cp] ?? 0), 0)
    const totalCV  = totalEV - totalAC
    const totalSV  = totalEV - totalPV
    const CPI      = totalAC > 0 ? Math.round(totalEV / totalAC * 100) / 100 : 0
    const SPI      = totalPV > 0 ? Math.round(totalEV / totalPV * 100) / 100 : 0
    const EAC      = CPI > 0 ? Math.round(totalBAC / CPI) : totalBAC
    const ETC      = EAC - totalAC
    const TCPI     = (totalBAC - totalAC) > 0 ? Math.round((totalBAC - totalEV) / (totalBAC - totalAC) * 100) / 100 : 0

    // ════════════════════════════════════════════════════
    // ONGLET 1 — Dashboard
    // ════════════════════════════════════════════════════
    const ws1 = wb.addWorksheet("📊 Dashboard", { properties: { tabColor: { argb: "FF" + BLUE_DARK } } })
    ws1.columns = [{ width: 35 }, { width: 20 }, { width: 15 }, { width: 20 }]
    addSheetTitle(ws1, `📊 DASHBOARD EVM — ${projectName}`, `Période : ${MONTHS[cp]} ${new Date().getFullYear()} | Généré le ${date} | PMO AI Studio`, 4)

    // KPIs en 2 colonnes
    ws1.addRow([])
    const kpiData = [
      ["BAC — Budget à Complétion", totalBAC, "PV — Valeur Planifiée", totalPV],
      ["EV — Valeur Acquise", totalEV, "AC — Coût Réel", totalAC],
      ["CV — Écart Coût", totalCV, "SV — Écart Délai", totalSV],
      ["CPI — Indice Perf Coût", CPI, "SPI — Indice Perf Délai", SPI],
      ["EAC — Estimation finale", EAC, "ETC — Coût restant", ETC],
      ["TCPI — Perf Requise", TCPI, "", ""],
    ]
    kpiData.forEach(([l1, v1, l2, v2]) => {
      const row = ws1.addRow([l1, v1, l2, v2])
      row.height = 22
      const c1 = row.getCell(1); c1.font = { bold: true }; c1.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + GRAY_LIGHT } }
      const c2 = row.getCell(2)
      if (typeof v1 === "number") {
        const isGood = ["CV","SV"].some(k => String(l1).includes(k)) ? v1 >= 0 : ["CPI","SPI","TCPI"].some(k => String(l1).includes(k)) ? v1 >= 1 : true
        styleKPI(c2, v1 as number, isGood)
        c2.numFmt = Math.abs(v1 as number) > 10 ? "#,##0 €" : "0.00"
      }
      const c3 = row.getCell(3); if(l2) { c3.font = { bold: true }; c3.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + GRAY_LIGHT } } }
      const c4 = row.getCell(4)
      if (typeof v2 === "number" && v2 !== 0) {
        const isGood2 = ["SV"].some(k => String(l2).includes(k)) ? v2 >= 0 : ["SPI"].some(k => String(l2).includes(k)) ? v2 >= 1 : true
        styleKPI(c4, v2 as number, isGood2)
        c4.numFmt = Math.abs(v2 as number) > 10 ? "#,##0 €" : "0.00"
      }
    })

    // Tableau récapitulatif par tâche
    ws1.addRow([])
    const rHdr = ws1.addRow(["WBS", "Tâche", "BAC", "PV", "EV", "AC", "CV", "SV", "CPI", "SPI", "EAC", "Statut"])
    rHdr.height = 20
    ws1.columns = [
      { width: 8 }, { width: 42 }, { width: 14 }, { width: 12 }, { width: 12 }, { width: 12 },
      { width: 12 }, { width: 12 }, { width: 8 }, { width: 8 }, { width: 14 }, { width: 12 }
    ]
    rHdr.eachCell(c => styleHeader(c))

    tasks.forEach((t: any, i: number) => {
      const pv = t.pv?.[cp]??0, ev = t.ev?.[cp]??0, ac = t.ac?.[cp]??0
      const cv = ev-ac, sv = ev-pv
      const cpi = ac > 0 ? Math.round(ev/ac*100)/100 : 0
      const spi = pv > 0 ? Math.round(ev/pv*100)/100 : 0
      const eac = cpi > 0 ? Math.round(t.bac/cpi) : t.bac
      const statut = cpi >= 1 && spi >= 1 ? "✅ OK" : cpi < 1 && spi < 1 ? "🔴 Critique" : cpi < 1 ? "⚠️ Coût" : "⚠️ Délai"
      const row = ws1.addRow([t.wbs, t.name, t.bac, pv, ev, ac, cv, sv, cpi, spi, eac, statut])
      row.height = 18
      row.eachCell((c, ci) => {
        styleData(c, i % 2 === 0)
        if (ci >= 3) { c.numFmt = ci <= 6 || ci === 11 ? "#,##0" : "0.00" }
        if (ci === 7 || ci === 8) { c.font = { color: { argb: "FF" + (c.value as number >= 0 ? GREEN : RED) } } }
      })
    })
    const totRow = ws1.addRow(["TOTAL", "", totalBAC, totalPV, totalEV, totalAC, totalCV, totalSV, CPI, SPI, EAC, ""])
    totRow.eachCell((c, ci) => { styleTotal(c); if(ci >= 3) c.numFmt = ci <= 6 || ci === 11 ? "#,##0" : "0.00" })

    // ════════════════════════════════════════════════════
    // ONGLET 2 — Rapport EVM (alias du Dashboard)
    // ════════════════════════════════════════════════════
    const ws2 = wb.addWorksheet("📋 Rapport EVM", { properties: { tabColor: { argb: "FF" + BLUE_MED } } })
    ws2.columns = [{ width: 8 }, { width: 42 }, { width: 14 }, { width: 12 }, { width: 12 }, { width: 12 }, { width: 12 }, { width: 12 }, { width: 8 }, { width: 8 }, { width: 14 }, { width: 12 }]
    addSheetTitle(ws2, `📋 RAPPORT EVM COMPLET — ${projectName}`, `Période courante : ${MONTHS[cp]} | BAC Total : ${totalBAC.toLocaleString("fr-FR")} €`, 12)
    ws2.addRow([])
    const r2Hdr = ws2.addRow(["WBS", "Tâche", "BAC (€)", "PV (€)", "EV (€)", "AC (€)", "CV (€)", "SV (€)", "CPI", "SPI", "EAC (€)", "Statut"])
    r2Hdr.height = 22; r2Hdr.eachCell(c => styleHeader(c))

    tasks.forEach((t: any, i: number) => {
      const pv = t.pv?.[cp]??0, ev = t.ev?.[cp]??0, ac = t.ac?.[cp]??0
      const cv = ev-ac, sv = ev-pv
      const cpi = ac > 0 ? Math.round(ev/ac*100)/100 : 0
      const spi = pv > 0 ? Math.round(ev/pv*100)/100 : 0
      const eac = cpi > 0 ? Math.round(t.bac/cpi) : t.bac
      const statut = cpi >= 1 && spi >= 1 ? "✅ OK" : cpi < 1 && spi < 1 ? "🔴 Critique" : cpi < 1 ? "⚠️ Coût" : "⚠️ Délai"
      const row = ws2.addRow([t.wbs, t.name, t.bac, pv, ev, ac, cv, sv, cpi, spi, eac, statut])
      row.height = 18
      row.eachCell((c, ci) => {
        styleData(c, i % 2 === 0)
        if (ci >= 3 && ci <= 11) c.numFmt = (ci <= 6 || ci === 11) ? "#,##0" : "0.00"
        if (ci === 7 || ci === 8) c.font = { ...c.font, color: { argb: "FF" + ((c.value as number) >= 0 ? GREEN : RED) } }
      })
    })
    const t2Row = ws2.addRow(["TOTAL", "", totalBAC, totalPV, totalEV, totalAC, totalCV, totalSV, CPI, SPI, EAC, ""])
    t2Row.eachCell((c, ci) => { styleTotal(c); if(ci >= 3) c.numFmt = (ci <= 6||ci===11) ? "#,##0" : "0.00" })

    // ════════════════════════════════════════════════════
    // Helper: onglets mensuels PV/EV/AC
    // ════════════════════════════════════════════════════
    const addMonthlySheet = (name: string, color: string, key: "pv"|"ev"|"ac", label: string) => {
      const ws = wb.addWorksheet(name, { properties: { tabColor: { argb: "FF" + color } } })
      ws.columns = [{ width: 8 }, { width: 42 }, { width: 14 }, ...MONTHS.map(() => ({ width: 9 })), { width: 14 }]
      addSheetTitle(ws, `${label} — ${projectName}`, `Valeurs mensuelles | ${date}`, MONTHS.length + 4)
      ws.addRow([])
      const hRow = ws.addRow(["WBS", "Tâche", "BAC", ...MONTHS, "TOTAL"])
      hRow.height = 22; hRow.eachCell(c => styleHeader(c, color))

      const monthTotals = new Array(12).fill(0)
      tasks.forEach((t: any, i: number) => {
        const vals = MONTHS.map((_, m) => { const v = t[key]?.[m]??0; monthTotals[m] += v; return v })
        const rowTotal = vals.reduce((s: number, v: number) => s + v, 0)
        const row = ws.addRow([t.wbs, t.name, t.bac, ...vals, rowTotal])
        row.height = 18
        row.eachCell((c, ci) => {
          styleData(c, i % 2 === 0)
          if (ci >= 3) { c.numFmt = "#,##0"; c.alignment = { horizontal: "right" } }
        })
      })
      const grandTotal = monthTotals.reduce((s, v) => s + v, 0)
      const totR = ws.addRow(["TOTAL", "", totalBAC, ...monthTotals, grandTotal])
      totR.eachCell(c => { styleTotal(c); c.numFmt = "#,##0" })
      return ws
    }

    addMonthlySheet("📅 Feuille PV", BLUE_MED, "pv", "📅 VALEUR PLANIFIÉE (PV)")
    addMonthlySheet("📥 Feuille EV", "059669", "ev", "📥 VALEUR ACQUISE (EV)")
    addMonthlySheet("💰 Feuille AC", "DC2626", "ac", "💰 COÛT RÉEL (AC)")

    // ════════════════════════════════════════════════════
    // ONGLET — Courbe S
    // ════════════════════════════════════════════════════
    const wsS = wb.addWorksheet("📈 Courbe S", { properties: { tabColor: { argb: "FF" + PURPLE } } })
    wsS.columns = [{ width: 8 }, { width: 12 }, { width: 14 }, { width: 12 }, { width: 14 }, { width: 12 }, { width: 14 }, { width: 8 }, { width: 8 }, { width: 12 }]
    addSheetTitle(wsS, `📈 COURBE S — ${projectName}`, "Évolution cumulée PV / EV / AC sur 12 mois", 10)
    wsS.addRow([])
    const sHdr = wsS.addRow(["Mois", "PV Mois", "PV Cumulé", "EV Mois", "EV Cumulé", "AC Mois", "AC Cumulé", "CPI", "SPI", "Statut"])
    sHdr.height = 22; sHdr.eachCell(c => styleHeader(c, PURPLE))

    let pvC = 0, evC = 0, acC = 0
    MONTHS.forEach((m, i) => {
      const pvM = tasks.reduce((s: number, t: any) => s + (t.pv?.[i]??0), 0)
      const evM = tasks.reduce((s: number, t: any) => s + (t.ev?.[i]??0), 0)
      const acM = tasks.reduce((s: number, t: any) => s + (t.ac?.[i]??0), 0)
      pvC += pvM; evC += evM; acC += acM
      const cpiM = acC > 0 ? Math.round(evC/acC*100)/100 : 0
      const spiM = pvC > 0 ? Math.round(evC/pvC*100)/100 : 0
      const isPast = i <= cp
      const row = wsS.addRow([m, pvM, pvC, evM, evC, acM, acC, cpiM, spiM, isPast ? "● Réalisé" : "○ Prévu"])
      row.height = 18
      row.eachCell((c, ci) => {
        c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: isPast ? "FFF0FDF4" : "FFFFF7ED" } }
        c.border = { bottom: { style: "hair", color: { argb: "FFE2E8F0" } } }
        if (ci >= 2 && ci <= 7) { c.numFmt = "#,##0"; c.alignment = { horizontal: "right" } }
        if (ci === 8 || ci === 9) {
          c.numFmt = "0.00"; c.alignment = { horizontal: "center" }
          c.font = { color: { argb: "FF" + ((c.value as number) >= 1 ? GREEN : RED) } }
        }
        if (ci === 1) c.font = { bold: true }
        if (ci === 10) c.alignment = { horizontal: "center" }
      })
    })

    // Générer graphique Courbe S avec chartjs-node-canvas
    try {
      const chartCanvas = new ChartJSNodeCanvas({ width: 900, height: 400, backgroundColour: "#0f172a" })
      const pvCum: number[] = [], evCum: number[] = [], acCum: number[] = []
      let pvC2 = 0, evC2 = 0, acC2 = 0
      MONTHS.forEach((_, i) => {
        pvC2 += tasks.reduce((s: number, t: any) => s + (t.pv?.[i]??0), 0)
        evC2 += tasks.reduce((s: number, t: any) => s + (t.ev?.[i]??0), 0)
        acC2 += tasks.reduce((s: number, t: any) => s + (t.ac?.[i]??0), 0)
        pvCum.push(pvC2); evCum.push(evC2); acCum.push(acC2)
      })
      const chartImg = await chartCanvas.renderToBuffer({
        type: "line",
        data: {
          labels: MONTHS,
          datasets: [
            { label: "PV — Planifié",  data: pvCum, borderColor: "#3b82f6", backgroundColor: "rgba(59,130,246,0.1)", borderWidth: 2.5, pointRadius: 3, tension: 0.3, fill: false },
            { label: "EV — Acquis",    data: evCum, borderColor: "#22c55e", backgroundColor: "rgba(34,197,94,0.1)",  borderWidth: 2.5, pointRadius: 3, tension: 0.3, fill: false },
            { label: "AC — Réel",      data: acCum, borderColor: "#f59e0b", backgroundColor: "rgba(245,158,11,0.1)", borderWidth: 2.5, pointRadius: 3, tension: 0.3, fill: false },
          ]
        },
        options: {
          responsive: false,
          plugins: {
            legend: { labels: { color: "#e2e8f0", font: { size: 12 } } },
            title: { display: true, text: `Courbe S EVM — ${projectName}`, color: "#f1f5f9", font: { size: 14, weight: "bold" } }
          },
          scales: {
            x: { ticks: { color: "#94a3b8" }, grid: { color: "rgba(255,255,255,0.05)" } },
            y: { ticks: { color: "#94a3b8", callback: (v: any) => v >= 1000 ? (v/1000).toFixed(0)+"k€" : v+"€" }, grid: { color: "rgba(255,255,255,0.08)" } }
          }
        }
      })
      const imgId = wb.addImage({ buffer: chartImg, extension: "png" })
      wsS.addRow([])
      wsS.addRow([])
      wsS.addImage(imgId, { tl: { col: 0, row: wsS.rowCount }, ext: { width: 860, height: 380 } })
      // Ajouter des lignes vides pour l'espace du graphique
      for (let i = 0; i < 22; i++) wsS.addRow([])
    } catch(chartErr) {
      console.error("[evm-excel] chart error:", chartErr)
      wsS.addRow([])
      wsS.addRow(["📊 Graphique non disponible — utilisez les données ci-dessus pour créer le graphique manuellement"])
    }

    // ════════════════════════════════════════════════════
    // ONGLET — Paramètres
    // ════════════════════════════════════════════════════
    const wsParam = wb.addWorksheet("⚙️ Paramètres", { properties: { tabColor: { argb: "FF64748B" } } })
    wsParam.columns = [{ width: 35 }, { width: 30 }]
    addSheetTitle(wsParam, "⚙️ PARAMÈTRES DU PROJET", "Budget EVM — PMO AI Studio", 2)
    wsParam.addRow([])
    const paramRows = [
      ["Nom du projet", projectName],
      ["Chef de Projet", cpName],
      ["Date d'export", date],
      ["Période courante", MONTHS[cp] + " " + new Date().getFullYear()],
      ["Nombre de tâches", tasks.length],
      ["Devise", "€"],
      ["Méthodologie", "PMBOK 7 / EVM"],
    ]
    paramRows.forEach(([k, v]) => {
      const row = wsParam.addRow([k, v])
      row.getCell(1).font = { bold: true }
      row.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + GRAY_LIGHT } }
      row.height = 18
    })

    // Générer le buffer
    const buffer = await wb.xlsx.writeBuffer()
    const uint8 = new Uint8Array(buffer as ArrayBuffer)
    const filename = `BudgetEVM_${projectName.replace(/[^a-zA-Z0-9]/g, "_")}`
    return new NextResponse(uint8, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}.xlsx"`,
      }
    })
  } catch (e: any) {
    console.error("EVM Excel ExcelJS error:", e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
