import { NextRequest, NextResponse } from "next/server"
import * as XLSX from "xlsx"

const MONTHS = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"]

// Helpers style
const hdr = (v: any) => ({ v, t: "s", s: { font: { bold: true, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "1E3A8A" } }, alignment: { horizontal: "center" }, border: { bottom: { style: "thin", color: { rgb: "FFFFFF" } } } } })
const hdr2 = (v: any) => ({ v, t: "s", s: { font: { bold: true, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "7B5EFF" } }, alignment: { horizontal: "center" } } })
const num = (v: any) => ({ v: v ?? 0, t: "n", s: { numFmt: "#,##0", alignment: { horizontal: "right" } } })
const pct2 = (v: any) => ({ v: v ?? 0, t: "n", s: { numFmt: "0.00", alignment: { horizontal: "right" } } })
const neg = (v: any) => ({ v: v ?? 0, t: "n", s: { numFmt: "#,##0", alignment: { horizontal: "right" }, font: { color: { rgb: (v ?? 0) < 0 ? "DC2626" : "16A34A" } } } })
const lbl = (v: any) => ({ v, t: "s", s: { font: { bold: true }, fill: { fgColor: { rgb: "EFF6FF" } } } })
const txt = (v: any) => ({ v: v ?? "", t: "s" })
const total = (v: any) => ({ v: v ?? 0, t: "n", s: { numFmt: "#,##0", font: { bold: true }, fill: { fgColor: { rgb: "DBEAFE" } }, alignment: { horizontal: "right" } } })

function setColWidths(ws: any, widths: number[]) {
  ws["!cols"] = widths.map(w => ({ wch: w }))
}

export async function POST(req: NextRequest) {
  try {
    const { tasks = [], currentPeriod = 0, projectName = "Projet", cpName = "Chef de Projet" } = await req.json()
    const cp = currentPeriod
    const wb = XLSX.utils.book_new()
    const date = new Date().toLocaleDateString("fr-FR")

    // ── Calculs globaux ───────────────────────────────────────
    const totalBAC = tasks.reduce((s: number, t: any) => s + (t.bac ?? 0), 0)
    const totalPV  = tasks.reduce((s: number, t: any) => s + (t.pv?.[cp] ?? 0), 0)
    const totalEV  = tasks.reduce((s: number, t: any) => s + (t.ev?.[cp] ?? 0), 0)
    const totalAC  = tasks.reduce((s: number, t: any) => s + (t.ac?.[cp] ?? 0), 0)
    const totalCV  = totalEV - totalAC
    const totalSV  = totalEV - totalPV
    const CPI      = totalAC > 0 ? totalEV / totalAC : 0
    const SPI      = totalPV > 0 ? totalEV / totalPV : 0
    const EAC      = CPI > 0 ? totalBAC / CPI : totalBAC
    const ETC      = EAC - totalAC
    const TCPI     = (totalBAC - totalAC) > 0 ? (totalBAC - totalEV) / (totalBAC - totalAC) : 0

    // ════════════════════════════════════════════════════════
    // ONGLET 1 — Paramètres
    // ════════════════════════════════════════════════════════
    const wsP: any[][] = [
      [{ v: "⚙️ PARAMÈTRES DU PROJET — Budget EVM", t: "s", s: { font: { bold: true, sz: 14, color: { rgb: "1E3A8A" } }, fill: { fgColor: { rgb: "DBEAFE" } } } }],
      [],
      [lbl("Nom du projet"), txt(projectName)],
      [lbl("Chef de Projet"), txt(cpName)],
      [lbl("Date d'export"), txt(date)],
      [lbl("Période courante"), txt(MONTHS[cp] + " " + new Date().getFullYear())],
      [lbl("Nombre de tâches"), num(tasks.length)],
      [lbl("Devise"), txt("€")],
      [lbl("Méthodologie"), txt("PMBOK 7 / EVM")],
      [],
      [{ v: "📊 INDICATEURS CLÉS", t: "s", s: { font: { bold: true, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "1E3A8A" } } } }],
      [lbl("BAC — Budget à Complétion"), num(totalBAC)],
      [lbl("PV — Valeur Planifiée"), num(totalPV)],
      [lbl("EV — Valeur Acquise"), num(totalEV)],
      [lbl("AC — Coût Réel"), num(totalAC)],
      [lbl("CV — Écart Coût"), neg(totalCV)],
      [lbl("SV — Écart Délai"), neg(totalSV)],
      [lbl("CPI — Indice Perf Coût"), pct2(Math.round(CPI*100)/100)],
      [lbl("SPI — Indice Perf Délai"), pct2(Math.round(SPI*100)/100)],
      [lbl("EAC — Estimation à Complétion"), num(Math.round(EAC))],
      [lbl("ETC — Coût Restant Estimé"), num(Math.round(ETC))],
      [lbl("TCPI — Indice Perf Requis"), pct2(Math.round(TCPI*100)/100)],
    ]
    const ws1 = XLSX.utils.aoa_to_sheet(wsP)
    setColWidths(ws1, [35, 30])
    XLSX.utils.book_append_sheet(wb, ws1, "⚙️ Paramètres")

    // ════════════════════════════════════════════════════════
    // ONGLET 2 — Rapport EVM
    // ════════════════════════════════════════════════════════
    const rHeaders = [hdr("WBS"), hdr("Tâche"), hdr("BAC"), hdr("PV"), hdr("EV"), hdr("AC"), hdr("CV"), hdr("SV"), hdr("CPI"), hdr("SPI"), hdr("EAC"), hdr("Statut")]
    const rRows = tasks.map((t: any) => {
      const pv = t.pv?.[cp]??0, ev = t.ev?.[cp]??0, ac = t.ac?.[cp]??0
      const cv = ev-ac, sv = ev-pv
      const cpi = ac > 0 ? ev/ac : 0
      const spi = pv > 0 ? ev/pv : 0
      const eac = cpi > 0 ? t.bac/cpi : t.bac
      const statut = cpi >= 1 && spi >= 1 ? "✅ OK" : cpi < 1 && spi < 1 ? "🔴 Critique" : cpi < 1 ? "⚠️ Coût" : "⚠️ Délai"
      return [txt(t.wbs), txt(t.name), num(t.bac), num(pv), num(ev), num(ac), neg(cv), neg(sv), pct2(Math.round(cpi*100)/100), pct2(Math.round(spi*100)/100), num(Math.round(eac)), txt(statut)]
    })
    const rTotal = [lbl("TOTAL"), lbl(""), total(totalBAC), total(totalPV), total(totalEV), total(totalAC), neg(totalCV), neg(totalSV), pct2(Math.round(CPI*100)/100), pct2(Math.round(SPI*100)/100), total(Math.round(EAC)), txt("")]
    const ws2 = XLSX.utils.aoa_to_sheet([
      [{ v: `📋 RAPPORT EVM — ${projectName} — Période : ${MONTHS[cp]}`, t:"s", s:{font:{bold:true,sz:13,color:{rgb:"1E3A8A"}}}}],
      [{ v: `Généré le ${date} | PMO AI Studio`, t:"s", s:{font:{color:{rgb:"64748B"}}}}],
      [],
      rHeaders,
      ...rRows,
      rTotal
    ])
    setColWidths(ws2, [8, 45, 12, 12, 12, 12, 12, 12, 8, 8, 12, 12])
    XLSX.utils.book_append_sheet(wb, ws2, "📋 Rapport EVM")

    // ════════════════════════════════════════════════════════
    // ONGLET 3 — Feuille PV (12 mois)
    // ════════════════════════════════════════════════════════
    const pvHeaders = [hdr("WBS"), hdr("Tâche"), hdr("BAC"), ...MONTHS.map(m => hdr(m)), hdr("TOTAL")]
    const pvRows = tasks.map((t: any) => {
      const monthVals = MONTHS.map((_, m) => num(t.pv?.[m]??0))
      const rowTotal = MONTHS.reduce((s: number, _, m) => s + (t.pv?.[m]??0), 0)
      return [txt(t.wbs), txt(t.name), num(t.bac), ...monthVals, total(rowTotal)]
    })
    const pvTotals = MONTHS.map((_, m) => total(tasks.reduce((s: number, t: any) => s + (t.pv?.[m]??0), 0)))
    const pvGrand = total(tasks.reduce((s: number, t: any) => s + MONTHS.reduce((ss: number, _, m) => ss + (t.pv?.[m]??0), 0), 0))
    const ws3 = XLSX.utils.aoa_to_sheet([
      [{ v: `📅 VALEUR PLANIFIÉE (PV) — ${projectName}`, t:"s", s:{font:{bold:true,sz:13,color:{rgb:"1E3A8A"}}}}],
      [],
      pvHeaders,
      ...pvRows,
      [lbl("TOTAL"), lbl(""), total(totalBAC), ...pvTotals, pvGrand]
    ])
    setColWidths(ws3, [8, 45, 12, ...MONTHS.map(() => 9), 12])
    XLSX.utils.book_append_sheet(wb, ws3, "📅 Feuille PV")

    // ════════════════════════════════════════════════════════
    // ONGLET 4 — Feuille EV
    // ════════════════════════════════════════════════════════
    const evRows2 = tasks.map((t: any) => {
      const monthVals = MONTHS.map((_, m) => num(t.ev?.[m]??0))
      const rowTotal = MONTHS.reduce((s: number, _, m) => s + (t.ev?.[m]??0), 0)
      return [txt(t.wbs), txt(t.name), num(t.bac), ...monthVals, total(rowTotal)]
    })
    const evTotals = MONTHS.map((_, m) => total(tasks.reduce((s: number, t: any) => s + (t.ev?.[m]??0), 0)))
    const ws4 = XLSX.utils.aoa_to_sheet([
      [{ v: `📥 VALEUR ACQUISE (EV) — ${projectName}`, t:"s", s:{font:{bold:true,sz:13,color:{rgb:"1E3A8A"}}}}],
      [],
      [hdr("WBS"), hdr("Tâche"), hdr("BAC"), ...MONTHS.map(m => hdr(m)), hdr("TOTAL")],
      ...evRows2,
      [lbl("TOTAL"), lbl(""), total(totalBAC), ...evTotals, total(totalEV)]
    ])
    setColWidths(ws4, [8, 45, 12, ...MONTHS.map(() => 9), 12])
    XLSX.utils.book_append_sheet(wb, ws4, "📥 Feuille EV")

    // ════════════════════════════════════════════════════════
    // ONGLET 5 — Feuille AC
    // ════════════════════════════════════════════════════════
    const acRows2 = tasks.map((t: any) => {
      const monthVals = MONTHS.map((_, m) => num(t.ac?.[m]??0))
      const rowTotal = MONTHS.reduce((s: number, _, m) => s + (t.ac?.[m]??0), 0)
      return [txt(t.wbs), txt(t.name), num(t.bac), ...monthVals, total(rowTotal)]
    })
    const acTotals = MONTHS.map((_, m) => total(tasks.reduce((s: number, t: any) => s + (t.ac?.[m]??0), 0)))
    const ws5 = XLSX.utils.aoa_to_sheet([
      [{ v: `💰 COÛT RÉEL (AC) — ${projectName}`, t:"s", s:{font:{bold:true,sz:13,color:{rgb:"1E3A8A"}}}}],
      [],
      [hdr("WBS"), hdr("Tâche"), hdr("BAC"), ...MONTHS.map(m => hdr(m)), hdr("TOTAL")],
      ...acRows2,
      [lbl("TOTAL"), lbl(""), total(totalBAC), ...acTotals, total(totalAC)]
    ])
    setColWidths(ws5, [8, 45, 12, ...MONTHS.map(() => 9), 12])
    XLSX.utils.book_append_sheet(wb, ws5, "💰 Feuille AC")

    // ════════════════════════════════════════════════════════
    // ONGLET 6 — Courbe S (données cumulées)
    // ════════════════════════════════════════════════════════
    let pvCum = 0, evCum = 0, acCum = 0
    const curveRows = MONTHS.map((m, i) => {
      const pvM = tasks.reduce((s: number, t: any) => s + (t.pv?.[i]??0), 0)
      const evM = tasks.reduce((s: number, t: any) => s + (t.ev?.[i]??0), 0)
      const acM = tasks.reduce((s: number, t: any) => s + (t.ac?.[i]??0), 0)
      pvCum += pvM; evCum += evM; acCum += acM
      const cpiM = acCum > 0 ? evCum/acCum : 0
      const spiM = pvCum > 0 ? evCum/pvCum : 0
      const statut = i <= cp ? "● Réalisé" : "○ Prévu"
      return [
        txt(m),
        num(pvM), num(pvCum),
        num(evM), num(evCum),
        num(acM), num(acCum),
        pct2(Math.round(cpiM*100)/100),
        pct2(Math.round(spiM*100)/100),
        txt(statut)
      ]
    })
    const ws6 = XLSX.utils.aoa_to_sheet([
      [{ v: `📈 COURBE S — ${projectName}`, t:"s", s:{font:{bold:true,sz:13,color:{rgb:"1E3A8A"}}}}],
      [{ v: "Évolution cumulée PV / EV / AC sur 12 mois", t:"s", s:{font:{color:{rgb:"64748B"}}}}],
      [],
      [hdr("Mois"), hdr("PV Mois"), hdr("PV Cumulé"), hdr("EV Mois"), hdr("EV Cumulé"), hdr("AC Mois"), hdr("AC Cumulé"), hdr("CPI"), hdr("SPI"), hdr("Statut")],
      ...curveRows,
    ])
    setColWidths(ws6, [8, 12, 12, 12, 12, 12, 12, 8, 8, 12])
    XLSX.utils.book_append_sheet(wb, ws6, "📈 Courbe S")

    // ════════════════════════════════════════════════════════
    // ONGLET 7 — Dashboard KPIs
    // ════════════════════════════════════════════════════════
    const kpiColor = (v: number) => v >= 1 ? "16A34A" : v >= 0.9 ? "CA8A04" : "DC2626"
    const kpiCell = (label: string, value: number, unit: string, isGood: boolean) => [
      lbl(label),
      { v: value, t: "n", s: { numFmt: unit === "€" ? "#,##0 €" : "0.00", font: { bold: true, color: { rgb: isGood ? "16A34A" : "DC2626" } } } },
      txt(isGood ? "✅" : "⚠️")
    ]
    const ws7 = XLSX.utils.aoa_to_sheet([
      [{ v: `📊 DASHBOARD EVM — ${projectName}`, t:"s", s:{font:{bold:true,sz:14,color:{rgb:"1E3A8A"}}}}],
      [{ v: `Période : ${MONTHS[cp]} | Généré le ${date}`, t:"s", s:{font:{color:{rgb:"64748B"}}}}],
      [],
      [hdr2("Indicateur"), hdr2("Valeur"), hdr2("Statut")],
      [lbl("BAC — Budget à Complétion"), num(totalBAC), txt("")],
      [lbl("PV — Valeur Planifiée"), num(totalPV), txt("")],
      [lbl("EV — Valeur Acquise"), num(totalEV), txt("")],
      [lbl("AC — Coût Réel"), num(totalAC), txt("")],
      kpiCell("CV — Écart Coût", totalCV, "€", totalCV >= 0),
      kpiCell("SV — Écart Délai", totalSV, "€", totalSV >= 0),
      kpiCell("CPI — Indice Perf Coût", Math.round(CPI*100)/100, "", CPI >= 1),
      kpiCell("SPI — Indice Perf Délai", Math.round(SPI*100)/100, "", SPI >= 1),
      [lbl("EAC — Estimation à Complétion"), num(Math.round(EAC)), txt("")],
      [lbl("ETC — Coût Restant Estimé"), num(Math.round(ETC)), txt("")],
      kpiCell("TCPI — Indice Perf Requis", Math.round(TCPI*100)/100, "", TCPI <= 1),
      [],
      [{ v: "Interprétation", t:"s", s:{font:{bold:true,color:{rgb:"1E3A8A"}}}}],
      [txt(`CPI ${Math.round(CPI*100)/100} → ${CPI >= 1 ? "Budget maîtrisé ✅" : CPI >= 0.9 ? "Légère dérive ⚠️" : "Dépassement significatif 🔴"}`)],
      [txt(`SPI ${Math.round(SPI*100)/100} → ${SPI >= 1 ? "En avance sur le planning ✅" : SPI >= 0.9 ? "Léger retard ⚠️" : "Retard significatif 🔴"}`)],
      [txt(`EAC ${Math.round(EAC).toLocaleString("fr-FR")} € → Coût final estimé du projet`)],
    ])
    setColWidths(ws7, [40, 20, 10])
    XLSX.utils.book_append_sheet(wb, ws7, "📊 Dashboard")

    // Générer le fichier
    const output = XLSX.write(wb, { type: "buffer", bookType: "xlsx", bookSST: false })
    const filename = `BudgetEVM_${(projectName).replace(/[^a-zA-Z0-9]/g, "_")}`

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
