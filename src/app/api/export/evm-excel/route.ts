import { NextRequest, NextResponse } from "next/server"
import * as XLSX from "xlsx"
import { readFileSync } from "fs"
import { join } from "path"

const MONTHS = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"]

export async function POST(req: NextRequest) {
  try {
    const { tasks, currentPeriod, projectName, cpName } = await req.json()

    // Charger le template
    const templatePath = join(process.cwd(), "public/templates/01_Budget_EVM_Complet.xlsx")
    const templateBuffer = readFileSync(templatePath)
    const wb = XLSX.read(templateBuffer, { type: "buffer", cellStyles: true })

    // ── 1. Onglet Paramètres ──────────────────────────────────
    const wsParam = wb.Sheets["⚙️ Paramètres"]
    if (wsParam) {
      XLSX.utils.sheet_add_aoa(wsParam, [
        [projectName ?? "Projet PMO AI Studio"],
      ], { origin: "B3" })
      XLSX.utils.sheet_add_aoa(wsParam, [[cpName ?? "Chef de Projet"]], { origin: "B4" })
      XLSX.utils.sheet_add_aoa(wsParam, [[new Date().toISOString().split("T")[0]]], { origin: "B6" })
      XLSX.utils.sheet_add_aoa(wsParam, [[(currentPeriod ?? 0) + 1]], { origin: "B8" })
    }

    // ── 2. Onglet Work Packages & PV ─────────────────────────
    const wsWP = wb.Sheets["📋 Work Packages & PV"]
    if (wsWP && tasks?.length) {
      const wpRows = tasks.map((t: any, i: number) => [
        t.wbs ?? `WP${i+1}`,
        "",
        t.name,
        t.owner ?? "—",
        t.bac ?? 0,
        ...MONTHS.map((_, m) => t.pv?.[m] ?? 0)
      ])
      XLSX.utils.sheet_add_aoa(wsWP, wpRows, { origin: "A4" })
    }

    // ── 3. Onglet EV & AC ────────────────────────────────────
    const wsEV = wb.Sheets["📥 EV & AC (Réalisé)"]
    if (wsEV && tasks?.length) {
      // EV
      const evRows = tasks.map((t: any, i: number) => [
        t.wbs ?? `WP${i+1}`,
        t.name,
        t.bac ?? 0,
        ...MONTHS.map((_, m) => t.ev?.[m] ?? 0)
      ])
      XLSX.utils.sheet_add_aoa(wsEV, [["WBS","Tâche","BAC",...MONTHS]], { origin: "A3" })
      XLSX.utils.sheet_add_aoa(wsEV, evRows, { origin: "A4" })

      // AC
      const acStartRow = tasks.length + 7
      const acRows = tasks.map((t: any, i: number) => [
        t.wbs ?? `WP${i+1}`,
        t.name,
        t.bac ?? 0,
        ...MONTHS.map((_, m) => t.ac?.[m] ?? 0)
      ])
      XLSX.utils.sheet_add_aoa(wsEV, [["", "AC (Coût Réel)"]], { origin: `A${acStartRow - 1}` })
      XLSX.utils.sheet_add_aoa(wsEV, [["WBS","Tâche","BAC",...MONTHS]], { origin: `A${acStartRow}` })
      XLSX.utils.sheet_add_aoa(wsEV, acRows, { origin: `A${acStartRow + 1}` })
    }

    // ── 4. Onglet Dashboard EVM ──────────────────────────────
    const wsDash = wb.Sheets["📊 Dashboard EVM"]
    if (wsDash && tasks?.length) {
      const cp = currentPeriod ?? 0
      const totalBAC = tasks.reduce((s: number, t: any) => s + (t.bac ?? 0), 0)
      const totalPV  = tasks.reduce((s: number, t: any) => s + (t.pv?.[cp] ?? 0), 0)
      const totalEV  = tasks.reduce((s: number, t: any) => s + (t.ev?.[cp] ?? 0), 0)
      const totalAC  = tasks.reduce((s: number, t: any) => s + (t.ac?.[cp] ?? 0), 0)
      const cv = totalEV - totalAC
      const sv = totalEV - totalPV
      const cpi = totalAC > 0 ? totalEV / totalAC : 0
      const spi = totalPV > 0 ? totalEV / totalPV : 0
      const eac = cpi > 0 ? totalBAC / cpi : totalBAC

      const dashRows = [
        ["Indicateur", "Valeur", "Statut"],
        ["BAC — Budget à Complétion", totalBAC, ""],
        ["PV — Valeur Planifiée", totalPV, ""],
        ["EV — Valeur Acquise", totalEV, ""],
        ["AC — Coût Réel", totalAC, ""],
        ["CV — Écart Coût", cv, cv >= 0 ? "✅ Dans le budget" : "⚠️ Dépassement"],
        ["SV — Écart Délai", sv, sv >= 0 ? "✅ En avance" : "⚠️ En retard"],
        ["CPI — Indice Perf Coût", Math.round(cpi * 100) / 100, cpi >= 1 ? "✅ Efficace" : "⚠️ Inefficace"],
        ["SPI — Indice Perf Délai", Math.round(spi * 100) / 100, spi >= 1 ? "✅ En avance" : "⚠️ En retard"],
        ["EAC — Estimation à Complétion", Math.round(eac), ""],
        ["TCPI — Indice Perf Requis", totalAC > 0 ? Math.round((totalBAC - totalEV) / (totalBAC - totalAC) * 100) / 100 : 0, ""],
      ]
      XLSX.utils.sheet_add_aoa(wsDash, dashRows, { origin: "A3" })

      // Tableau par tâche
      const taskRows = tasks.map((t: any) => {
        const pv = t.pv?.[cp] ?? 0; const ev = t.ev?.[cp] ?? 0; const ac = t.ac?.[cp] ?? 0
        return [
          t.wbs, t.name, t.bac,
          pv, ev, ac,
          ev - ac, ev - pv,
          ac > 0 ? Math.round(ev/ac*100)/100 : 0,
          pv > 0 ? Math.round(ev/pv*100)/100 : 0,
          ac > 0 ? Math.round(t.bac/(ev/ac)) : t.bac
        ]
      })
      XLSX.utils.sheet_add_aoa(wsDash, [
        ["WBS","Tâche","BAC","PV","EV","AC","CV","SV","CPI","SPI","EAC"]
      ], { origin: "A16" })
      XLSX.utils.sheet_add_aoa(wsDash, taskRows, { origin: "A17" })
    }

    // ── 5. Onglet Courbe S ───────────────────────────────────
    const wsS = wb.Sheets["📈 Courbe S"]
    if (wsS && tasks?.length) {
      const curveRows = MONTHS.map((m, i) => {
        const pv = tasks.reduce((s: number, t: any) => s + (t.pv?.[i] ?? 0), 0)
        const ev = tasks.reduce((s: number, t: any) => s + (t.ev?.[i] ?? 0), 0)
        const ac = tasks.reduce((s: number, t: any) => s + (t.ac?.[i] ?? 0), 0)
        return [m, pv, ev, ac, i <= (currentPeriod ?? 0) ? "●" : "○"]
      })
      XLSX.utils.sheet_add_aoa(wsS, [["Mois","PV Cumulé","EV Cumulé","AC Cumulé","Statut"]], { origin: "A3" })
      XLSX.utils.sheet_add_aoa(wsS, curveRows, { origin: "A4" })
    }

    // Générer le fichier
    const filename = `BudgetEVM_${(projectName ?? "Projet").replace(/[^a-zA-Z0-9]/g, "_")}`
    const output = XLSX.write(wb, { type: "buffer", bookType: "xlsx" })

    return new NextResponse(output, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}.xlsx"`,
      }
    })
  } catch (e: any) {
    console.error("EVM Excel export error:", e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
