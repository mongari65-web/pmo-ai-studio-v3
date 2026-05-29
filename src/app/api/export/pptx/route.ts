import { NextRequest, NextResponse } from "next/server"

const PHASE_COLORS = ["6366f1","7c3aed","059669","d97706","dc2626","0891b2","db2777"]
const STATUS_COLORS: Record<string, string> = {
  "Terminé": "22c55e", "En cours": "f59e0b", "Planifié": "3b82f6",
  "À démarrer": "3b82f6", "En retard": "ef4444"
}
const CRIT_COLORS: Record<string, string> = {
  "Critique": "ef4444", "Haute": "f59e0b", "Moyenne": "3b82f6", "Faible": "22c55e"
}

function clean(s: any): string {
  if (!s) return ""
  return String(s)
    .replace(/\u2014/g, "-").replace(/\u2013/g, "-")
    .replace(/\u2019/g, "'").replace(/\u2018/g, "'")
    .replace(/\u00e9/g, "e").replace(/\u00e8/g, "e").replace(/\u00ea/g, "e")
    .replace(/\u00e0/g, "a").replace(/\u00e2/g, "a").replace(/\u00f4/g, "o")
    .replace(/\u00fb/g, "u").replace(/\u00f9/g, "u").replace(/\u00ee/g, "i")
    .replace(/\u00ef/g, "i").replace(/\u00e7/g, "c").replace(/\u00c9/g, "E")
    .replace(/\u00c0/g, "A").replace(/\u00d4/g, "O").replace(/\u00ce/g, "I")
    .replace(/[^\x00-\xFF]/g, "")
}

function phaseColor(phase: string, wpColor?: string): string {
  if (wpColor) return wpColor.replace("#", "")
  const phases = ["Initialisation","Planification","Execution","Tests","Validation","Deploiement","Cloture"]
  const idx = phases.findIndex(p => phase?.toLowerCase().includes(p.toLowerCase()))
  return PHASE_COLORS[Math.max(0, idx) % PHASE_COLORS.length]
}

export async function POST(req: NextRequest) {
  try {
    const { slides: rawSlides, filename: rawFilename, title: rawTitle, projectName: rawProject } = await req.json()
    const PptxGenJS = (await import("pptxgenjs")).default
    const pptx = new PptxGenJS()
    pptx.layout = "LAYOUT_WIDE"
    pptx.author = "PMO AI Studio"
    pptx.subject = clean(rawTitle)
    pptx.title = clean(rawTitle)

    const filename = clean(rawFilename ?? rawTitle ?? "export")
    const projectName = clean(rawProject ?? "")
    const totalWP = rawSlides?.length ?? 0

    // ── Slide de couverture ─────────────────────────────────────
    const cover = pptx.addSlide()
    cover.background = { color: "0F172A" }
    cover.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.18, h: "100%", fill: { color: "7B5EFF" }, line: { color: "7B5EFF" } })
    cover.addShape(pptx.ShapeType.rect, { x: 0.18, y: 2.5, w: 9.62, h: 0.04, fill: { color: "1E3A8A" }, line: { color: "1E3A8A" } })
    cover.addText("PMO AI STUDIO", { x: 0.5, y: 1.0, w: 9, h: 0.5, fontSize: 11, color: "7B5EFF", bold: true, charSpacing: 4 })
    cover.addText(clean(rawTitle), { x: 0.5, y: 1.7, w: 8.5, h: 1.2, fontSize: 34, color: "F0F2FF", bold: true })
    cover.addText(projectName, { x: 0.5, y: 3.0, w: 9, h: 0.5, fontSize: 16, color: "94A3B8" })
    cover.addText(totalWP + " Work Packages | " + new Date().toLocaleDateString("en-GB"), { x: 0.5, y: 3.6, w: 9, h: 0.4, fontSize: 12, color: "64748B" })
    cover.addText("Confidentiel - Diffusion restreinte", { x: 0.5, y: 5.3, w: 9, h: 0.3, fontSize: 9, color: "334155" })

    // ── Sommaire ────────────────────────────────────────────────
    const summary = pptx.addSlide()
    summary.background = { color: "0F172A" }
    summary.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: "100%", h: 1.1, fill: { color: "1E3A8A" }, line: { color: "1E3A8A" } })
    summary.addText("SOMMAIRE", { x: 0.4, y: 0.2, w: 9, h: 0.55, fontSize: 22, color: "FFFFFF", bold: true })
    summary.addText(projectName + " - " + totalWP + " Work Packages", { x: 0.4, y: 0.72, w: 9, h: 0.28, fontSize: 10, color: "93C5FD" })

    const cols = 3
    rawSlides?.forEach((wp: any, i: number) => {
      const col = i % cols
      const row = Math.floor(i / cols)
      const x = 0.25 + col * 3.25
      const y = 1.2 + row * 0.85
      const pc = phaseColor(wp.phase ?? "", wp.color)
      summary.addShape(pptx.ShapeType.rect, { x, y, w: 3.1, h: 0.75, fill: { color: "111827" }, line: { color: pc, pt: 2 } })
      summary.addShape(pptx.ShapeType.rect, { x, y, w: 0.6, h: 0.75, fill: { color: pc + "33" }, line: { color: pc, pt: 2 } })
      summary.addText(clean(wp.code ?? `WP${i+1}`), { x: x + 0.02, y: y + 0.22, w: 0.56, h: 0.3, fontSize: 10, color: pc, bold: true, align: "center" })
      summary.addText(clean(wp.name), { x: x + 0.66, y: y + 0.05, w: 2.35, h: 0.35, fontSize: 9, color: "F0F2FF", bold: true })
      const sc = STATUS_COLORS[wp.status ?? ""] ?? "64748b"
      summary.addText(clean(wp.status ?? ""), { x: x + 0.66, y: y + 0.42, w: 1.3, h: 0.22, fontSize: 8, color: sc })
      summary.addText(clean(wp.phase ?? ""), { x: x + 1.7, y: y + 0.42, w: 1.3, h: 0.22, fontSize: 8, color: "64748B", align: "right" })
    })

    // ── Slides WP ────────────────────────────────────────────────
    rawSlides?.forEach((wp: any, idx: number) => {
      const s = pptx.addSlide()
      s.background = { color: "0A0B14" }
      const pc = phaseColor(wp.phase ?? "", wp.color)
      const sc = STATUS_COLORS[wp.status ?? ""] ?? "64748b"
      const completion = wp.completion ?? 0

      // ══ HEADER ════════════════════════════════════════════════
      s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: "100%", h: 1.4, fill: { color: pc }, line: { color: pc } })
      // Badge CODE
      s.addShape(pptx.ShapeType.rect, { x: 0.2, y: 0.1, w: 1.0, h: 0.65, fill: { color: "00000035" }, line: { color: "00000000" } })
      s.addText("CODE", { x: 0.2, y: 0.12, w: 1.0, h: 0.22, fontSize: 7, color: "FFFFFF99", align: "center", bold: true, charSpacing: 2 })
      s.addText(clean(wp.code ?? `WP${idx+1}`), { x: 0.2, y: 0.3, w: 1.0, h: 0.4, fontSize: 20, color: "FFFFFF", align: "center", bold: true })
      // Nom
      s.addText(clean(wp.name), { x: 1.35, y: 0.08, w: 6.3, h: 0.6, fontSize: 20, color: "FFFFFF", bold: true })
      s.addText(clean(wp.start ?? "") + "  ->  " + clean(wp.end ?? ""), { x: 1.35, y: 0.68, w: 5, h: 0.28, fontSize: 10, color: "FFFFFFCC" })
      // Phase + statut
      s.addShape(pptx.ShapeType.rect, { x: 8.0, y: 0.08, w: 1.8, h: 0.3, fill: { color: "00000030" }, line: { color: "00000000" } })
      s.addText("Phase : " + clean(wp.phase ?? ""), { x: 8.0, y: 0.08, w: 1.8, h: 0.3, fontSize: 9, color: "FFFFFF", align: "center" })
      s.addShape(pptx.ShapeType.rect, { x: 8.0, y: 0.44, w: 1.8, h: 0.28, fill: { color: sc + "33" }, line: { color: sc, pt: 1 } })
      s.addText(clean(wp.status ?? ""), { x: 8.0, y: 0.44, w: 1.8, h: 0.28, fontSize: 9, color: sc, align: "center", bold: true })
      // Barre progression
      s.addShape(pptx.ShapeType.rect, { x: 1.35, y: 1.04, w: 6.6, h: 0.14, fill: { color: "FFFFFF22" }, line: { color: "00000000" } })
      if (completion > 0) s.addShape(pptx.ShapeType.rect, { x: 1.35, y: 1.04, w: 6.6 * completion / 100, h: 0.14, fill: { color: "FFFFFF" }, line: { color: "00000000" } })
      s.addText(completion + "%", { x: 8.0, y: 1.0, w: 0.7, h: 0.22, fontSize: 9, color: "FFFFFF", bold: true, align: "center" })
      // Numéro
      s.addText((idx+3) + " / " + (totalWP+2), { x: 9.1, y: 0.1, w: 0.7, h: 0.25, fontSize: 8, color: "FFFFFF88", align: "right" })

      // ══ COLONNE GAUCHE (activités + objectif) ═════════════════
      const LX = 0.2
      const LW = 5.6

      // Objectif
      s.addShape(pptx.ShapeType.rect, { x: LX, y: 1.48, w: LW, h: 0.3, fill: { color: pc + "25" }, line: { color: pc + "60", pt: 1 } })
      s.addText("OBJECTIF", { x: LX + 0.12, y: 1.48, w: LW - 0.2, h: 0.3, fontSize: 9, color: pc, bold: true, charSpacing: 1 })
      s.addText(clean(wp.objective ?? wp.description ?? ""), {
        x: LX + 0.12, y: 1.82, w: LW - 0.2, h: 0.62,
        fontSize: 10, color: "CBD5E1", wrap: true, lineSpacingMultiple: 1.1
      })

      // Activités
      s.addShape(pptx.ShapeType.rect, { x: LX, y: 2.5, w: LW, h: 0.3, fill: { color: pc + "25" }, line: { color: pc + "60", pt: 1 } })
      s.addText("ACTIVITES", { x: LX + 0.12, y: 2.5, w: LW - 0.2, h: 0.3, fontSize: 9, color: pc, bold: true, charSpacing: 1 })
      const activities = wp.activities ?? []
      const maxAct = Math.min(activities.length, 5)
      activities.slice(0, maxAct).forEach((a: string, i: number) => {
        const ay = 2.85 + i * 0.38
        s.addShape(pptx.ShapeType.ellipse, { x: LX + 0.1, y: ay + 0.1, w: 0.12, h: 0.12, fill: { color: pc }, line: { color: pc } })
        s.addText(clean(a), {
          x: LX + 0.3, y: ay, w: LW - 0.4, h: 0.36,
          fontSize: 10, color: "E2E8F0", wrap: true, lineSpacingMultiple: 1.1
        })
      })
      if (activities.length > 5) {
        s.addText("+ " + (activities.length - 5) + " autres...", {
          x: LX + 0.3, y: 2.85 + 5 * 0.38, w: LW - 0.4, h: 0.28,
          fontSize: 9, color: "64748B", italic: true
        })
      }

      // Livrables
      const livrY = 2.85 + maxAct * 0.38 + 0.1
      s.addShape(pptx.ShapeType.rect, { x: LX, y: livrY, w: LW, h: 0.3, fill: { color: "111827" }, line: { color: pc + "50", pt: 1 } })
      s.addText("LIVRABLES", { x: LX + 0.12, y: livrY, w: LW - 0.2, h: 0.3, fontSize: 9, color: pc, bold: true, charSpacing: 1 })
      s.addText(clean(wp.deliverables ?? "A definir"), {
        x: LX + 0.12, y: livrY + 0.33, w: LW - 0.2, h: 0.6,
        fontSize: 10, color: "94A3B8", wrap: true, italic: true, lineSpacingMultiple: 1.2
      })

      // ══ COLONNE DROITE ════════════════════════════════════════
      const RX = 6.1
      const RW = 3.65

      // Budget — grande boîte visuelle
      s.addShape(pptx.ShapeType.rect, { x: RX, y: 1.48, w: RW, h: 1.0, fill: { color: "111827" }, line: { color: pc, pt: 2 } })
      s.addShape(pptx.ShapeType.rect, { x: RX, y: 1.48, w: RW, h: 0.28, fill: { color: pc + "30" }, line: { color: "00000000" } })
      s.addText("BUDGET", { x: RX + 0.15, y: 1.5, w: RW - 0.3, h: 0.24, fontSize: 8, color: "94A3B8", bold: true, charSpacing: 2 })
      s.addText((wp.budget ?? 0).toLocaleString("fr-FR") + " EUR", {
        x: RX + 0.15, y: 1.76, w: RW - 0.3, h: 0.65,
        fontSize: 22, color: pc, bold: true
      })

      // Responsable
      s.addShape(pptx.ShapeType.rect, { x: RX, y: 2.55, w: RW, h: 0.78, fill: { color: "111827" }, line: { color: "1E293B", pt: 1 } })
      s.addShape(pptx.ShapeType.rect, { x: RX, y: 2.55, w: RW, h: 0.26, fill: { color: "1E293B" }, line: { color: "00000000" } })
      s.addText("RESPONSABLE", { x: RX + 0.15, y: 2.57, w: RW - 0.3, h: 0.22, fontSize: 8, color: "64748B", bold: true, charSpacing: 1 })
      s.addText(clean(wp.responsible ?? ""), { x: RX + 0.15, y: 2.82, w: RW - 0.3, h: 0.42, fontSize: 13, color: "F0F2FF", bold: true })

      // Lead
      if (wp.lead_profile) {
        s.addShape(pptx.ShapeType.rect, { x: RX, y: 3.4, w: RW, h: 0.78, fill: { color: pc + "12" }, line: { color: pc + "40", pt: 1 } })
        s.addShape(pptx.ShapeType.rect, { x: RX, y: 3.4, w: RW, h: 0.26, fill: { color: pc + "25" }, line: { color: "00000000" } })
        s.addText("LEAD", { x: RX + 0.15, y: 3.42, w: RW - 0.3, h: 0.22, fontSize: 8, color: pc, bold: true, charSpacing: 1 })
        s.addText(clean(wp.lead_profile), { x: RX + 0.15, y: 3.67, w: RW - 0.3, h: 0.3, fontSize: 12, color: "F0F2FF", bold: true })
        if (wp.lead_etp) s.addText("ETP : " + clean(String(wp.lead_etp)), { x: RX + 0.15, y: 3.93, w: RW - 0.3, h: 0.2, fontSize: 9, color: "94A3B8" })
      }

      // Contributeurs
      const contributors = wp.contributors ?? []
      const ctStartY = wp.lead_profile ? 4.25 : 3.4
      if (contributors.length > 0) {
        s.addShape(pptx.ShapeType.rect, { x: RX, y: ctStartY, w: RW, h: 0.26, fill: { color: "1E293B" }, line: { color: "1E293B" } })
        s.addText("CONTRIBUTEURS", { x: RX + 0.15, y: ctStartY + 0.02, w: RW - 0.3, h: 0.22, fontSize: 8, color: "64748B", bold: true, charSpacing: 1 })
        contributors.slice(0, 3).forEach((ct: any, ci: number) => {
          const cy = ctStartY + 0.28 + ci * 0.38
          const crit = ct.criticite ?? ct.criticality ?? ""
          const cc = CRIT_COLORS[crit] ?? "64748b"
          s.addShape(pptx.ShapeType.rect, { x: RX, y: cy, w: RW, h: 0.35, fill: { color: ci % 2 === 0 ? "111827" : "0F172A" }, line: { color: "1E293B", pt: 1 } })
          s.addText(clean(ct.profile ?? ct.nom ?? ""), { x: RX + 0.12, y: cy + 0.02, w: RW - 0.75, h: 0.18, fontSize: 9, color: "CBD5E1", bold: true })
          s.addText(clean(ct.nom ?? ""), { x: RX + 0.12, y: cy + 0.18, w: RW - 0.75, h: 0.15, fontSize: 8, color: "64748B", italic: true })
          if (crit) {
            s.addShape(pptx.ShapeType.rect, { x: RX + RW - 0.62, y: cy + 0.05, w: 0.55, h: 0.24, fill: { color: cc + "30" }, line: { color: cc, pt: 1 } })
            s.addText(crit, { x: RX + RW - 0.62, y: cy + 0.05, w: 0.55, h: 0.24, fontSize: 7, color: cc, align: "center", bold: true })
          }
        })
      }

      // Critères d'acceptation — pleine largeur en bas
      if (wp.acceptance) {
        s.addShape(pptx.ShapeType.rect, { x: RX, y: 5.15, w: RW, h: 0.55, fill: { color: "0F172A" }, line: { color: "334155", pt: 1 } })
        s.addShape(pptx.ShapeType.rect, { x: RX, y: 5.15, w: RW, h: 0.22, fill: { color: "1E293B" }, line: { color: "00000000" } })
        s.addText("CRITERES D'ACCEPTATION", { x: RX + 0.12, y: 5.17, w: RW - 0.2, h: 0.18, fontSize: 7, color: "64748B", bold: true, charSpacing: 1 })
        s.addText(clean(wp.acceptance), { x: RX + 0.12, y: 5.37, w: RW - 0.2, h: 0.3, fontSize: 9, color: "94A3B8", wrap: true })
      }

      // ══ FOOTER ════════════════════════════════════════════════
      s.addShape(pptx.ShapeType.rect, { x: 0, y: 5.72, w: "100%", h: 0.28, fill: { color: "060810" }, line: { color: "060810" } })
      s.addShape(pptx.ShapeType.rect, { x: 0, y: 5.72, w: 0.06, h: 0.28, fill: { color: pc }, line: { color: pc } })
      s.addText(projectName, { x: 0.12, y: 5.74, w: 5, h: 0.24, fontSize: 8, color: "475569" })
      s.addText("(c) " + new Date().getFullYear() + " PMO AI Studio - pmoai.studio", {
        x: 5.5, y: 5.74, w: 4.3, h: 0.24, fontSize: 8, color: "334155", align: "right"
      })
    })

    const buffer = await pptx.write({ outputType: "nodebuffer" }) as Buffer
    const uint8 = new Uint8Array(buffer)
    return new NextResponse(uint8, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": `attachment; filename="${filename}.pptx"`,
      }
    })
  } catch (e: any) {
    console.error("PPTX export error:", e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
