import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { sections } = await req.json()
    const { id: projectId } = await params

    // Charger le projet
    const { data: project } = await supabase
      .from("projects").select("*").eq("id", projectId).single()
    if (!project) return NextResponse.json({ error: "Projet introuvable" }, { status: 404 })

    // Charger tous les outils
    const { data: tools } = await supabase
      .from("project_tools").select("*").eq("project_id", projectId)
    const toolMap: Record<string, any> = {}
    tools?.forEach(t => { toolMap[t.tool_type] = t.data })

    const html = generateReportHTML(project, toolMap, sections ?? ["all"])

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "X-Report-Project": project.name,
      }
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

function generateReportHTML(project: any, tools: Record<string, any>, sections: string[]): string {
  const all = sections.includes("all")
  const date = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })

  const wbs = tools.wbs?.items ?? []
  const gantt = tools.gantt?.tasks ?? []
  const raid = tools.raid?.items ?? []
  const budget = tools.budget
  const jalons = tools.jalons?.jalons ?? []
  const wps = tools.workpackages?.workpackages ?? []

  // KPIs EVM
  const cp = new Date().getMonth()
  const totalBAC = budget?.tasks?.reduce((s: number, t: any) => s + (t.bac ?? 0), 0) ?? 0
  const totalEV  = budget?.tasks?.reduce((s: number, t: any) => s + (t.ev?.[cp] ?? 0), 0) ?? 0
  const totalAC  = budget?.tasks?.reduce((s: number, t: any) => s + (t.ac?.[cp] ?? 0), 0) ?? 0
  const CPI = totalAC > 0 ? (totalEV / totalAC).toFixed(2) : "N/A"
  const SPI = budget?.tasks?.reduce((s: number, t: any) => s + (t.pv?.[cp] ?? 0), 0) > 0
    ? (totalEV / budget.tasks.reduce((s: number, t: any) => s + (t.pv?.[cp] ?? 0), 0)).toFixed(2) : "N/A"

  const criticalRisks = raid.filter((r: any) => r.priority === "Critique" && r.category === "Risk")
  const criticalPath = gantt.filter((t: any) => t.critical).map((t: any) => t.name).join(" → ")

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Rapport — ${project.name}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', Arial, sans-serif; color: #1e293b; background: #fff; font-size: 11pt; }

    /* Cover page */
    .cover { min-height: 100vh; background: linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%); display: flex; flex-direction: column; justify-content: center; padding: 80px; page-break-after: always; }
    .cover-logo { width: 60px; height: 60px; background: linear-gradient(135deg,#2563eb,#7c3aed); border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 800; color: white; margin-bottom: 60px; }
    .cover-badge { display: inline-block; padding: 6px 16px; background: rgba(37,99,235,0.3); border: 1px solid rgba(37,99,235,0.5); border-radius: 30px; color: #60a5fa; font-size: 12px; font-weight: 600; letter-spacing: 1px; margin-bottom: 32px; }
    .cover h1 { font-size: 42px; font-weight: 800; color: #f1f5f9; line-height: 1.1; margin-bottom: 16px; }
    .cover-sub { font-size: 18px; color: #64748b; margin-bottom: 48px; }
    .cover-meta { display: grid; grid-template-columns: repeat(3,1fr); gap: 24px; margin-top: 60px; padding-top: 40px; border-top: 1px solid #1e293b; }
    .cover-meta-item label { font-size: 10px; color: #475569; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 6px; }
    .cover-meta-item value { font-size: 16px; font-weight: 600; color: #e2e8f0; display: block; }

    /* Layout */
    .page { padding: 40px 50px; max-width: 210mm; margin: 0 auto; }
    .page-break { page-break-before: always; padding-top: 40px; }

    /* Section header */
    .section-header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 3px solid #2563eb; }
    .section-icon { width: 36px; height: 36px; background: #eff6ff; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 18px; }
    .section-title { font-size: 20px; font-weight: 700; color: #1e3a5f; }
    .section-sub { font-size: 12px; color: #64748b; margin-top: 2px; }

    /* KPI cards */
    .kpi-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; margin-bottom: 24px; }
    .kpi-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; border-top: 3px solid; }
    .kpi-label { font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
    .kpi-value { font-size: 22px; font-weight: 700; }
    .kpi-sub { font-size: 10px; color: #94a3b8; margin-top: 4px; }

    /* Tables */
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 10pt; }
    thead tr { background: #1e40af; color: white; }
    th { padding: 8px 10px; text-align: left; font-weight: 600; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
    td { padding: 7px 10px; border-bottom: 1px solid #f1f5f9; }
    tr:nth-child(even) td { background: #f8fafc; }
    tr:hover td { background: #eff6ff; }

    /* Badges */
    .badge { display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 9px; font-weight: 600; }
    .badge-red { background: #fee2e2; color: #991b1b; }
    .badge-amber { background: #fef3c7; color: #92400e; }
    .badge-green { background: #dcfce7; color: #166534; }
    .badge-blue { background: #dbeafe; color: #1e40af; }
    .badge-gray { background: #f1f5f9; color: #475569; }

    /* Summary box */
    .summary-box { background: #eff6ff; border: 1px solid #bfdbfe; border-left: 4px solid #2563eb; border-radius: 8px; padding: 16px 20px; margin-bottom: 20px; }
    .summary-box h4 { font-size: 13px; font-weight: 600; color: #1e40af; margin-bottom: 8px; }
    .summary-box p { font-size: 11px; color: #3b82f6; line-height: 1.6; }

    /* Alert box */
    .alert-box { background: #fef2f2; border: 1px solid #fecaca; border-left: 4px solid #dc2626; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; }
    .alert-box p { font-size: 11px; color: #991b1b; }

    /* Gantt mini */
    .gantt-bar-container { height: 12px; background: #f1f5f9; border-radius: 6px; overflow: hidden; display: inline-block; width: 120px; vertical-align: middle; }
    .gantt-bar { height: 100%; border-radius: 6px; display: inline-block; }

    /* Page number */
    @page { margin: 0; size: A4; }
    @media print {
      .cover { min-height: 100vh; }
      .no-print { display: none; }
    }

    /* TOC */
    .toc-item { display: flex; align-items: center; padding: 8px 0; border-bottom: 1px dotted #e2e8f0; }
    .toc-num { width: 24px; height: 24px; background: #2563eb; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: white; flex-shrink: 0; margin-right: 12px; }
    .toc-title { flex: 1; font-size: 13px; color: #334155; }
    .toc-page { font-size: 12px; color: #94a3b8; }

    /* Print button */
    .print-btn { position: fixed; bottom: 24px; right: 24px; background: #2563eb; color: white; border: none; border-radius: 12px; padding: 12px 24px; font-size: 14px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 20px rgba(37,99,235,0.4); z-index: 999; display: flex; align-items: center; gap: 8px; }
    .print-btn:hover { background: #1d4ed8; }
  </style>
</head>
<body>

<!-- Print button -->
<button class="print-btn no-print" onclick="window.print()">
  🖨️ Imprimer / Enregistrer PDF
</button>

<!-- ══ PAGE DE COUVERTURE ══ -->
<div class="cover">
  <div class="cover-logo">P</div>
  <div class="cover-badge">PMO AI STUDIO · RAPPORT DE PROJET</div>
  <h1>${project.name}</h1>
  <div class="cover-sub">${project.description ?? "Rapport de suivi projet"}</div>

  <div style="display:flex; gap:16px; flex-wrap:wrap;">
    ${project.client ? `<span style="padding:8px 16px;background:rgba(37,99,235,0.2);border:1px solid rgba(37,99,235,0.4);border-radius:8px;color:#60a5fa;font-size:13px;">📌 ${project.client}</span>` : ""}
    ${project.methodology ? `<span style="padding:8px 16px;background:rgba(124,58,237,0.2);border:1px solid rgba(124,58,237,0.4);border-radius:8px;color:#a78bfa;font-size:13px;">🏷️ ${project.methodology}</span>` : ""}
    <span style="padding:8px 16px;background:rgba(5,150,105,0.2);border:1px solid rgba(5,150,105,0.4);border-radius:8px;color:#34d399;font-size:13px;">● Actif</span>
  </div>

  <div class="cover-meta">
    <div class="cover-meta-item">
      <label>Date de génération</label>
      <value>${date}</value>
    </div>
    ${project.start_date ? `<div class="cover-meta-item"><label>Période</label><value>${new Date(project.start_date).toLocaleDateString("fr-FR")} → ${project.end_date ? new Date(project.end_date).toLocaleDateString("fr-FR") : "?"}</value></div>` : ""}
    ${project.budget ? `<div class="cover-meta-item"><label>Budget total</label><value>${parseFloat(project.budget).toLocaleString("fr-FR")} €</value></div>` : ""}
    ${project.team?.length ? `<div class="cover-meta-item"><label>Équipe</label><value>${project.team.length} membres</value></div>` : ""}
    <div class="cover-meta-item"><label>Avancement</label><value>${project.completion ?? 0}%</value></div>
    <div class="cover-meta-item"><label>Généré par</label><value>PMO AI Studio</value></div>
  </div>
</div>

<!-- ══ SOMMAIRE ══ -->
<div class="page">
  <div class="section-header">
    <div class="section-icon">📋</div>
    <div><div class="section-title">Sommaire</div></div>
  </div>
  <div style="margin-top:16px;">
    ${[
      ["1", "Synthèse exécutive", "3"],
      wbs.length ? ["2", "Structure de découpage (WBS)", "4"] : "",
      gantt.length ? ["3", "Planning Gantt", "5"] : "",
      raid.length ? ["4", "Registre RAID", "6"] : "",
      jalons.length ? ["5", "Jalons du projet", "7"] : "",
      totalBAC > 0 ? ["6", "Budget EVM", "8"] : "",
      wps.length ? ["7", "Work Packages", "9"] : "",
    ].filter(Boolean).map(([num, title, page]) => `
      <div class="toc-item">
        <div class="toc-num">${num}</div>
        <div class="toc-title">${title}</div>
        <div class="toc-page">${page}</div>
      </div>
    `).join("")}
  </div>
</div>

<!-- ══ SYNTHÈSE EXÉCUTIVE ══ -->
<div class="page page-break">
  <div class="section-header">
    <div class="section-icon">📊</div>
    <div><div class="section-title">Synthèse exécutive</div><div class="section-sub">Vue d'ensemble du projet au ${date}</div></div>
  </div>

  <div class="kpi-grid">
    <div class="kpi-card" style="border-top-color:#2563eb">
      <div class="kpi-label">Avancement global</div>
      <div class="kpi-value" style="color:#2563eb">${project.completion ?? 0}%</div>
      <div class="kpi-sub">Progression générale</div>
    </div>
    ${totalBAC > 0 ? `
    <div class="kpi-card" style="border-top-color:${parseFloat(CPI) >= 1 ? "#059669" : "#dc2626"}">
      <div class="kpi-label">CPI (coût)</div>
      <div class="kpi-value" style="color:${parseFloat(CPI) >= 1 ? "#059669" : "#dc2626"}">${CPI}</div>
      <div class="kpi-sub">${parseFloat(CPI) >= 1 ? "Sous budget" : "Dépassement"}</div>
    </div>
    <div class="kpi-card" style="border-top-color:${parseFloat(SPI as string) >= 1 ? "#059669" : "#dc2626"}">
      <div class="kpi-label">SPI (délai)</div>
      <div class="kpi-value" style="color:${parseFloat(SPI as string) >= 1 ? "#059669" : "#dc2626"}">${SPI}</div>
      <div class="kpi-sub">${parseFloat(SPI as string) >= 1 ? "En avance" : "En retard"}</div>
    </div>
    ` : ""}
    <div class="kpi-card" style="border-top-color:${criticalRisks.length > 0 ? "#dc2626" : "#059669"}">
      <div class="kpi-label">Risques critiques</div>
      <div class="kpi-value" style="color:${criticalRisks.length > 0 ? "#dc2626" : "#059669"}">${criticalRisks.length}</div>
      <div class="kpi-sub">${criticalRisks.length > 0 ? "À surveiller" : "Sous contrôle"}</div>
    </div>
  </div>

  ${criticalPath ? `
  <div class="summary-box">
    <h4>🔴 Chemin critique</h4>
    <p>${criticalPath}</p>
  </div>` : ""}

  ${criticalRisks.length > 0 ? `
  <div style="margin-bottom:20px;">
    <h3 style="font-size:14px;font-weight:600;color:#991b1b;margin-bottom:12px;">⚠️ Risques critiques ouverts</h3>
    ${criticalRisks.map((r: any) => `
      <div class="alert-box">
        <p><strong>${r.title}</strong> — ${r.description} · Responsable: ${r.owner} · Échéance: ${r.due_date}</p>
      </div>
    `).join("")}
  </div>` : ""}

  <table>
    <thead><tr>
      <th>Indicateur</th><th>Valeur</th><th>Statut</th>
    </tr></thead>
    <tbody>
      <tr><td>Tâches Gantt</td><td>${gantt.length}</td><td><span class="badge badge-blue">${gantt.length} tâches</span></td></tr>
      <tr><td>Tâches critiques</td><td>${gantt.filter((t: any) => t.critical).length}</td><td><span class="badge badge-${gantt.filter((t: any) => t.critical).length > 3 ? "red" : "amber"}">${gantt.filter((t: any) => t.critical).length} critiques</span></td></tr>
      <tr><td>Éléments RAID</td><td>${raid.length}</td><td><span class="badge badge-amber">${raid.length} éléments</span></td></tr>
      <tr><td>Jalons</td><td>${jalons.length}</td><td><span class="badge badge-blue">${jalons.filter((j: any) => j.status === "Atteint").length}/${jalons.length} atteints</span></td></tr>
      <tr><td>Budget BAC</td><td>${totalBAC > 0 ? totalBAC.toLocaleString("fr-FR") + " €" : "Non défini"}</td><td><span class="badge badge-${totalBAC > 0 ? "green" : "gray"}">${totalBAC > 0 ? "Défini" : "À définir"}</span></td></tr>
    </tbody>
  </table>
</div>

<!-- ══ WBS ══ -->
${wbs.length ? `
<div class="page page-break">
  <div class="section-header">
    <div class="section-icon">🗂️</div>
    <div><div class="section-title">Structure de découpage du travail (WBS)</div><div class="section-sub">${wbs.length} éléments</div></div>
  </div>
  <table>
    <thead><tr><th>Code</th><th>Élément WBS</th><th>Niv.</th><th>Livrable</th><th>Responsable</th><th>Durée</th><th>Budget</th></tr></thead>
    <tbody>
      ${wbs.map((item: any) => `
        <tr>
          <td style="font-family:monospace;font-size:10px;color:#64748b">${item.code}</td>
          <td style="padding-left:${8 + (item.level-1)*16}px;font-weight:${item.level <= 2 ? "600" : "400"};color:${item.level === 1 ? "#1e40af" : "#334155"}">${item.name}</td>
          <td><span class="badge badge-blue">N${item.level}</span></td>
          <td style="color:#64748b;font-size:10px">${item.deliverable ?? ""}</td>
          <td style="color:#2563eb;font-size:10px">${item.responsible ?? ""}</td>
          <td style="color:#059669;font-size:10px">${item.duration ?? ""}</td>
          <td style="color:#d97706;font-size:10px">${item.budget ?? ""}</td>
        </tr>
      `).join("")}
    </tbody>
  </table>
</div>` : ""}

<!-- ══ GANTT ══ -->
${gantt.length ? `
<div class="page page-break">
  <div class="section-header">
    <div class="section-icon">📅</div>
    <div><div class="section-title">Planning Gantt</div><div class="section-sub">${gantt.length} tâches · ${gantt.filter((t: any) => t.critical).length} sur le chemin critique</div></div>
  </div>
  <table>
    <thead><tr><th>WBS</th><th>Tâche</th><th>Phase</th><th>Début</th><th>Fin</th><th>Durée</th><th>Resp.</th><th>Avanc.</th><th>Critique</th></tr></thead>
    <tbody>
      ${gantt.map((task: any) => `
        <tr style="${task.critical ? "background:#fff5f5;" : ""}">
          <td style="font-family:monospace;font-size:9px;color:#64748b">${task.wbs}</td>
          <td style="font-weight:500;color:${task.critical ? "#dc2626" : "#334155"}">${task.name}</td>
          <td style="font-size:10px;color:#7c3aed">${task.phase}</td>
          <td style="font-size:10px;color:#64748b">${task.start}</td>
          <td style="font-size:10px;color:#64748b">${task.end}</td>
          <td style="font-size:10px">${task.duration}j</td>
          <td style="font-size:10px;color:#2563eb">${task.responsible}</td>
          <td>
            <div class="gantt-bar-container">
              <div class="gantt-bar" style="width:${task.progress}%;background:${task.progress === 100 ? "#059669" : task.critical ? "#dc2626" : "#2563eb"}"></div>
            </div>
            <span style="font-size:9px;color:#64748b;margin-left:4px">${task.progress}%</span>
          </td>
          <td>${task.critical ? '<span class="badge badge-red">Critique</span>' : ""}</td>
        </tr>
      `).join("")}
    </tbody>
  </table>
</div>` : ""}

<!-- ══ RAID ══ -->
${raid.length ? `
<div class="page page-break">
  <div class="section-header">
    <div class="section-icon">⚠️</div>
    <div><div class="section-title">Registre RAID</div><div class="section-sub">${raid.length} éléments · ${raid.filter((r: any) => r.category === "Risk").length} risques · ${raid.filter((r: any) => r.category === "Action").length} actions</div></div>
  </div>
  <table>
    <thead><tr><th>ID</th><th>Catégorie</th><th>Titre</th><th>Priorité</th><th>Responsable</th><th>Échéance</th><th>Statut</th></tr></thead>
    <tbody>
      ${raid.map((item: any) => `
        <tr>
          <td style="font-family:monospace;font-size:9px;color:#64748b">${item.id}</td>
          <td><span class="badge badge-${item.category === "Risk" ? "red" : item.category === "Action" ? "blue" : item.category === "Issue" ? "amber" : "green"}">${item.category}</span></td>
          <td style="font-weight:500">${item.title}</td>
          <td><span class="badge badge-${item.priority === "Critique" ? "red" : item.priority === "Élevé" ? "amber" : "blue"}">${item.priority}</span></td>
          <td style="font-size:10px;color:#2563eb">${item.owner}</td>
          <td style="font-size:10px;color:#64748b">${item.due_date}</td>
          <td><span class="badge badge-${item.status === "Fermé" ? "green" : item.status === "En cours" ? "blue" : "gray"}">${item.status}</span></td>
        </tr>
      `).join("")}
    </tbody>
  </table>
</div>` : ""}

<!-- ══ JALONS ══ -->
${jalons.length ? `
<div class="page page-break">
  <div class="section-header">
    <div class="section-icon">🏁</div>
    <div><div class="section-title">Jalons du projet</div><div class="section-sub">${jalons.filter((j: any) => j.status === "Atteint").length}/${jalons.length} atteints</div></div>
  </div>
  <table>
    <thead><tr><th>Code</th><th>Jalon</th><th>Date</th><th>Statut</th><th>Livrables</th><th>Responsable</th></tr></thead>
    <tbody>
      ${jalons.map((j: any) => `
        <tr>
          <td style="font-family:monospace;font-size:9px;color:#64748b">${j.code}</td>
          <td style="font-weight:600">${j.name}</td>
          <td style="font-size:10px;color:#64748b">${j.date}</td>
          <td><span class="badge badge-${j.status === "Atteint" ? "green" : j.status === "En cours" ? "blue" : j.status === "En retard" ? "red" : "gray"}">${j.status}</span></td>
          <td style="font-size:10px;color:#64748b">${j.deliverables}</td>
          <td style="font-size:10px;color:#2563eb">${j.responsible}</td>
        </tr>
      `).join("")}
    </tbody>
  </table>
</div>` : ""}

<!-- ══ BUDGET EVM ══ -->
${totalBAC > 0 ? `
<div class="page page-break">
  <div class="section-header">
    <div class="section-icon">💰</div>
    <div><div class="section-title">Budget EVM</div><div class="section-sub">Earned Value Management — Période courante : ${["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"][cp]}</div></div>
  </div>
  <div class="kpi-grid">
    <div class="kpi-card" style="border-top-color:#2563eb"><div class="kpi-label">BAC Total</div><div class="kpi-value" style="color:#2563eb">${(totalBAC/1000).toFixed(0)}k€</div><div class="kpi-sub">Budget at Completion</div></div>
    <div class="kpi-card" style="border-top-color:#7c3aed"><div class="kpi-label">EV Acquis</div><div class="kpi-value" style="color:#7c3aed">${(totalEV/1000).toFixed(0)}k€</div><div class="kpi-sub">Earned Value</div></div>
    <div class="kpi-card" style="border-top-color:#d97706"><div class="kpi-label">AC Réel</div><div class="kpi-value" style="color:#d97706">${(totalAC/1000).toFixed(0)}k€</div><div class="kpi-sub">Actual Cost</div></div>
    <div class="kpi-card" style="border-top-color:${parseFloat(CPI) >= 1 ? "#059669" : "#dc2626"}"><div class="kpi-label">CPI</div><div class="kpi-value" style="color:${parseFloat(CPI) >= 1 ? "#059669" : "#dc2626"}">${CPI}</div><div class="kpi-sub">${parseFloat(CPI) >= 1 ? "Sous budget ✓" : "Dépassement !"}</div></div>
  </div>
  <table>
    <thead><tr><th>Phase</th><th>Work Package</th><th>BAC</th><th>PV</th><th>EV</th><th>AC</th><th>CPI</th><th>SPI</th><th>Statut</th></tr></thead>
    <tbody>
      ${budget.tasks?.map((t: any) => {
        const pv = t.pv?.[cp] ?? 0, ev = t.ev?.[cp] ?? 0, ac = t.ac?.[cp] ?? 0
        const cpi = ac > 0 ? (ev/ac).toFixed(2) : "—"
        const spi = pv > 0 ? (ev/pv).toFixed(2) : "—"
        return `
        <tr>
          <td style="font-size:10px;color:#7c3aed">${t.phase}</td>
          <td style="font-weight:500">${t.name}</td>
          <td style="color:#2563eb;font-size:10px">${t.bac?.toLocaleString("fr-FR")}</td>
          <td style="font-size:10px">${pv.toLocaleString("fr-FR")}</td>
          <td style="color:#7c3aed;font-size:10px">${ev.toLocaleString("fr-FR")}</td>
          <td style="color:#d97706;font-size:10px">${ac.toLocaleString("fr-FR")}</td>
          <td style="font-weight:700;color:${parseFloat(cpi) >= 1 ? "#059669" : "#dc2626"}">${cpi}</td>
          <td style="font-weight:700;color:${parseFloat(spi) >= 1 ? "#059669" : "#dc2626"}">${spi}</td>
          <td><span class="badge badge-${t.status?.includes("cours") ? "blue" : t.status?.includes("Terminé") ? "green" : "gray"}">${t.status ?? "—"}</span></td>
        </tr>`
      }).join("") ?? ""}
    </tbody>
  </table>
</div>` : ""}

<!-- ══ WORK PACKAGES ══ -->
${wps.length ? `
<div class="page page-break">
  <div class="section-header">
    <div class="section-icon">📦</div>
    <div><div class="section-title">Work Packages</div><div class="section-sub">${wps.length} lots de travaux</div></div>
  </div>
  <table>
    <thead><tr><th>Code</th><th>Work Package</th><th>Phase</th><th>Responsable</th><th>Budget</th><th>Début</th><th>Fin</th><th>Avanc.</th><th>Statut</th></tr></thead>
    <tbody>
      ${wps.map((wp: any) => `
        <tr>
          <td style="font-family:monospace;font-size:9px;color:#64748b">${wp.code}</td>
          <td style="font-weight:600">${wp.name}</td>
          <td style="font-size:10px;color:#7c3aed">${wp.phase}</td>
          <td style="font-size:10px;color:#2563eb">${wp.responsible}</td>
          <td style="font-size:10px;color:#d97706">${wp.budget?.toLocaleString("fr-FR")} €</td>
          <td style="font-size:10px;color:#64748b">${wp.start}</td>
          <td style="font-size:10px;color:#64748b">${wp.end}</td>
          <td>
            <div class="gantt-bar-container">
              <div class="gantt-bar" style="width:${wp.completion}%;background:${wp.completion === 100 ? "#059669" : "#2563eb"}"></div>
            </div>
            <span style="font-size:9px;margin-left:4px">${wp.completion}%</span>
          </td>
          <td><span class="badge badge-${wp.status?.includes("cours") ? "blue" : wp.status?.includes("Terminé") ? "green" : "gray"}">${wp.status}</span></td>
        </tr>
      `).join("")}
    </tbody>
  </table>
</div>` : ""}

<!-- ══ FOOTER ══ -->
<div class="page" style="padding-top:20px;border-top:2px solid #e2e8f0;margin-top:20px;">
  <div style="display:flex;justify-content:space-between;align-items:center;">
    <div style="display:flex;align-items:center;gap:10px;">
      <div style="width:28px;height:28px;background:linear-gradient(135deg,#2563eb,#7c3aed);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:white;">P</div>
      <span style="font-size:12px;color:#64748b;">PMO AI Studio · Rapport généré le ${date}</span>
    </div>
    <span style="font-size:11px;color:#94a3b8;">Conforme PMBOK 7 · Propulsé par Claude AI</span>
  </div>
</div>

</body>
</html>`
}
