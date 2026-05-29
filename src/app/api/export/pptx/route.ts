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
    .replace(/\u00e0/g, "a").replace(/\u00e2/g, "a")
    .replace(/\u00f4/g, "o").replace(/\u00fb/g, "u").replace(/\u00f9/g, "u")
    .replace(/\u00ee/g, "i").replace(/\u00ef/g, "i")
    .replace(/\u00e7/g, "c").replace(/\u00c9/g, "E").replace(/\u00c0/g, "A")
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
    // Bande de couleur gauche
    cover.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.15, h: "100%", fill: { color: "7B5EFF" }, line: { color: "7B5EFF" } })
    cover.addText("PMO AI STUDIO", { x: 0.4, y: 1.2, w: 9, h: 0.5, fontSize: 11, color: "7B5EFF", bold: true, charSpacing: 4 })
    cover.addText(clean(rawTitle), { x: 0.4, y: 2.0, w: 9, h: 1.2, fontSize: 32, color: "F0F2FF", bold: true })
    cover.addText(projectName, { x: 0.4, y: 3.3, w: 9, h: 0.5, fontSize: 16, color: "94A3B8" })
    cover.addText(totalWP + " Work Packages", { x: 0.4, y: 3.9, w: 4, h: 0.4, fontSize: 13, color: "7B5EFF" })
    cover.addText(new Date().toLocaleDateString("en-GB"), { x: 0.4, y: 5.0, w: 9, h: 0.4, fontSize: 10, color: "475569" })
    cover.addText("Confidentiel - Diffusion restreinte", { x: 0.4, y: 5.5, w: 9, h: 0.3, fontSize: 9, color: "334155", align: "left" })

    // ── Sommaire ────────────────────────────────────────────────
    const summary = pptx.addSlide()
    summary.background = { color: "0F172A" }
    summary.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: "100%", h: 1.0, fill: { color: "1E3A8A" }, line: { color: "1E3A8A" } })
    summary.addText("SOMMAIRE", { x: 0.4, y: 0.2, w: 9, h: 0.6, fontSize: 20, color: "FFFFFF", bold: true })
    summary.addText(projectName, { x: 0.4, y: 0.65, w: 9, h: 0.3, fontSize: 10, color: "93C5FD" })

    const cols = 3
    rawSlides?.forEach((wp: any, i: number) => {
      const col = i % cols
      const row = Math.floor(i / cols)
      const x = 0.3 + col * 3.3
      const y = 1.2 + row * 0.75
      const pc = phaseColor(wp.phase ?? "", wp.color)
      summary.addShape(pptx.ShapeType.rect, { x, y, w: 3.0, h: 0.6, fill: { color: "111827" }, line: { color: pc, pt: 1 } })
      summary.addText(clean(wp.code ?? `WP${i+1}`), { x: x + 0.08, y: y + 0.05, w: 0.6, h: 0.25, fontSize: 9, color: pc, bold: true })
      summary.addText(clean(wp.name), { x: x + 0.08, y: y + 0.28, w: 2.8, h: 0.25, fontSize: 8, color: "CBD5E1" })
      const sc = STATUS_COLORS[wp.status ?? ""] ?? "64748b"
      summary.addText(clean(wp.status ?? ""), { x: x + 0.08, y: y + 0.02, w: 2.8, h: 0.22, fontSize: 7, color: sc, align: "right" })
    })

    // ── Slides WP ────────────────────────────────────────────────
    rawSlides?.forEach((wp: any, idx: number) => {
      const s = pptx.addSlide()
      s.background = { color: "0A0B14" }
      const pc = phaseColor(wp.phase ?? "", wp.color)
      const sc = STATUS_COLORS[wp.status ?? ""] ?? "64748b"

      // ── Header coloré ─────────────────────────────────────────
      s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: "100%", h: 1.35, fill: { color: pc }, line: { color: pc } })

      // Badge CODE
      s.addShape(pptx.ShapeType.rect, { x: 0.25, y: 0.12, w: 0.9, h: 0.55, fill: { color: "00000040" }, line: { color: "00000000" } })
      s.addText("CODE", { x: 0.25, y: 0.13, w: 0.9, h: 0.2, fontSize: 7, color: "FFFFFF99", align: "center", bold: true, charSpacing: 2 })
      s.addText(clean(wp.code ?? `WP${idx+1}`), { x: 0.25, y: 0.3, w: 0.9, h: 0.35, fontSize: 18, color: "FFFFFF", align: "center", bold: true })

      // Nom + dates
      s.addText(clean(wp.name), { x: 1.3, y: 0.1, w: 6.5, h: 0.55, fontSize: 18, color: "FFFFFF", bold: true })
      s.addText(clean(wp.start ?? "") + "  ->  " + clean(wp.end ?? ""), { x: 1.3, y: 0.65, w: 5, h: 0.3, fontSize: 10, color: "FFFFFFCC" })

      // Phase badge
      s.addShape(pptx.ShapeType.rect, { x: 7.9, y: 0.1, w: 1.9, h: 0.3, fill: { color: "00000030" }, line: { color: "00000000" } })
      s.addText("Phase : " + clean(wp.phase ?? ""), { x: 7.9, y: 0.1, w: 1.9, h: 0.3, fontSize: 9, color: "FFFFFF", align: "center" })

      // Statut badge
      s.addShape(pptx.ShapeType.rect, { x: 7.9, y: 0.45, w: 1.9, h: 0.28, fill: { color: sc + "33" }, line: { color: sc, pt: 1 } })
      s.addText(clean(wp.status ?? ""), { x: 7.9, y: 0.45, w: 1.9, h: 0.28, fontSize: 9, color: sc, align: "center", bold: true })

      // Avancement
      const completion = wp.completion ?? 0
      s.addShape(pptx.ShapeType.rect, { x: 1.3, y: 0.98, w: 6.5, h: 0.12, fill: { color: "FFFFFF22" }, line: { color: "00000000" } })
      if (completion > 0) {
        s.addShape(pptx.ShapeType.rect, { x: 1.3, y: 0.98, w: 6.5 * completion / 100, h: 0.12, fill: { color: "FFFFFF" }, line: { color: "00000000" } })
      }
      s.addText(completion + "%", { x: 7.85, y: 0.95, w: 0.7, h: 0.2, fontSize: 9, color: "FFFFFF", bold: true, align: "right" })

      // Numéro slide
      s.addText((idx+3) + "/" + (totalWP+2), { x: 9.3, y: 0.1, w: 0.5, h: 0.3, fontSize: 8, color: "FFFFFF88", align: "right" })

      // ── Colonne gauche ─────────────────────────────────────────
      const COL1_X = 0.2
      const COL1_W = 5.8

      // Objectif
      s.addShape(pptx.ShapeType.rect, { x: COL1_X, y: 1.45, w: COL1_W, h: 0.28, fill: { color: pc + "22" }, line: { color: pc + "55", pt: 1 } })
      s.addText("OBJECTIF", { x: COL1_X + 0.1, y: 1.45, w: COL1_W - 0.2, h: 0.28, fontSize: 8, color: pc, bold: true, charSpacing: 1 })
      s.addText(clean(wp.objective ?? wp.description ?? ""), {
        x: COL1_X + 0.1, y: 1.76, w: COL1_W - 0.1, h: 0.7,
        fontSize: 10, color: "CBD5E1", wrap: true
      })

      // Activités
      s.addShape(pptx.ShapeType.rect, { x: COL1_X, y: 2.52, w: COL1_W, h: 0.28, fill: { color: pc + "22" }, line: { color: pc + "55", pt: 1 } })
      s.addText("ACTIVITES", { x: COL1_X + 0.1, y: 2.52, w: COL1_W - 0.2, h: 0.28, fontSize: 8, color: pc, bold: true, charSpacing: 1 })
      const activities = wp.activities ?? []
      activities.slice(0, 5).forEach((a: string, i: number) => {
        const ay = 2.85 + i * 0.38
        s.addShape(pptx.ShapeType.ellipse, { x: COL1_X + 0.1, y: ay + 0.08, w: 0.14, h: 0.14, fill: { color: pc }, line: { color: pc } })
        s.addText((i+1) + ". " + clean(a), {
          x: COL1_X + 0.32, y: ay, w: COL1_W - 0.42, h: 0.35,
          fontSize: 10, color: "E2E8F0", wrap: true
        })
      })
      if (activities.length > 5) {
        s.addText("+ " + (activities.length - 5) + " autres activites...", {
          x: COL1_X + 0.32, y: 2.85 + 5 * 0.38, w: COL1_W - 0.42, h: 0.3,
          fontSize: 8, color: "64748B", italic: true
        })
      }

      // Livrables
      const livrY = Math.min(4.8, 2.85 + Math.min(activities.length, 5) * 0.38 + 0.15)
      s.addShape(pptx.ShapeType.rect, { x: COL1_X, y: livrY, w: COL1_W, h: 0.28, fill: { color: "111827" }, line: { color: pc + "55", pt: 1 } })
      s.addText("LIVRABLES", { x: COL1_X + 0.1, y: livrY, w: COL1_W - 0.2, h: 0.28, fontSize: 8, color: pc, bold: true, charSpacing: 1 })
      s.addText(clean(wp.deliverables ?? "A definir"), {
        x: COL1_X + 0.1, y: livrY + 0.3, w: COL1_W - 0.1, h: 0.55,
        fontSize: 10, color: "94A3B8", wrap: true, italic: true
      })

      // ── Colonne droite ─────────────────────────────────────────
      const COL2_X = 6.3
      const COL2_W = 3.5

      // Budget
      s.addShape(pptx.ShapeType.rect, { x: COL2_X, y: 1.45, w: COL2_W, h: 0.9, fill: { color: "111827" }, line: { color: pc, pt: 2 } })
      s.addText("BUDGET", { x: COL2_X + 0.15, y: 1.52, w: COL2_W - 0.3, h: 0.25, fontSize: 8, color: "94A3B8", bold: true, charSpacing: 1 })
      s.addText((wp.budget ?? 0).toLocaleString("fr-FR") + " EUR", { x: COL2_X + 0.15, y: 1.75, w: COL2_W - 0.3, h: 0.45, fontSize: 20, color: pc, bold: true })

      // Responsable
      s.addShape(pptx.ShapeType.rect, { x: COL2_X, y: 2.45, w: COL2_W, h: 0.7, fill: { color: "111827" }, line: { color: "1E293B", pt: 1 } })
      s.addText("RESPONSABLE", { x: COL2_X + 0.15, y: 2.5, w: COL2_W - 0.3, h: 0.22, fontSize: 7, color: "64748B", bold: true, charSpacing: 1 })
      s.addText(clean(wp.responsible ?? ""), { x: COL2_X + 0.15, y: 2.7, w: COL2_W - 0.3, h: 0.35, fontSize: 13, color: "F0F2FF", bold: true })

      // Lead
      if (wp.lead_profile) {
        s.addShape(pptx.ShapeType.rect, { x: COL2_X, y: 3.25, w: COL2_W, h: 0.75, fill: { color: pc + "15" }, line: { color: pc + "44", pt: 1 } })
        s.addText("LEAD", { x: COL2_X + 0.15, y: 3.3, w: COL2_W - 0.3, h: 0.22, fontSize: 7, color: pc, bold: true, charSpacing: 1 })
        s.addText(clean(wp.lead_profile), { x: COL2_X + 0.15, y: 3.5, w: COL2_W - 0.3, h: 0.25, fontSize: 12, color: "F0F2FF", bold: true })
        if (wp.lead_etp) s.addText("ETP : " + clean(wp.lead_etp), { x: COL2_X + 0.15, y: 3.72, w: COL2_W - 0.3, h: 0.2, fontSize: 10, color: "94A3B8" })
      }

      // Contributeurs
      const contributors = wp.contributors ?? []
      if (contributors.length > 0) {
        const ctY = wp.lead_profile ? 4.1 : 3.25
        s.addShape(pptx.ShapeType.rect, { x: COL2_X, y: ctY, w: COL2_W, h: 0.28, fill: { color: "111827" }, line: { color: "1E293B", pt: 1 } })
        s.addText("CONTRIBUTEURS", { x: COL2_X + 0.15, y: ctY, w: COL2_W - 0.3, h: 0.28, fontSize: 7, color: "64748B", bold: true, charSpacing: 1 })
        contributors.slice(0, 3).forEach((c: any, ci: number) => {
          const cy = ctY + 0.32 + ci * 0.38
          const crit = c.criticite ?? c.criticality ?? ""
          const cc = CRIT_COLORS[crit] ?? "64748b"
          s.addShape(pptx.ShapeType.rect, { x: COL2_X, y: cy, w: COL2_W, h: 0.35, fill: { color: "111827" }, line: { color: "1E293B", pt: 1 } })
          s.addText(clean(c.profile ?? c.nom ?? ""), { x: COL2_X + 0.1, y: cy + 0.03, w: COL2_W - 0.5, h: 0.18, fontSize: 10, color: "CBD5E1" })
          s.addText(clean(c.nom ?? ""), { x: COL2_X + 0.1, y: cy + 0.18, w: COL2_W - 0.7, h: 0.16, fontSize: 9, color: "64748B", italic: true })
          if (crit) s.addShape(pptx.ShapeType.rect, { x: COL2_X + COL2_W - 0.6, y: cy + 0.05, w: 0.5, h: 0.22, fill: { color: cc + "33" }, line: { color: cc, pt: 1 } })
          if (crit) s.addText(crit, { x: COL2_X + COL2_W - 0.6, y: cy + 0.05, w: 0.5, h: 0.22, fontSize: 6, color: cc, align: "center", bold: true })
        })
      }

      // Critères d'acceptation
      if (wp.acceptance) {
        s.addShape(pptx.ShapeType.rect, { x: COL2_X, y: 5.1, w: COL2_W, h: 0.6, fill: { color: "0F172A" }, line: { color: "334155", pt: 1 } })
        s.addText("CRITERES D'ACCEPTATION", { x: COL2_X + 0.1, y: 5.12, w: COL2_W - 0.2, h: 0.2, fontSize: 6, color: "64748B", bold: true, charSpacing: 1 })
        s.addText(clean(wp.acceptance), { x: COL2_X + 0.1, y: 5.3, w: COL2_W - 0.2, h: 0.35, fontSize: 9, color: "94A3B8", wrap: true })
      }

      // ── Footer ─────────────────────────────────────────────────
      s.addShape(pptx.ShapeType.rect, { x: 0, y: 5.6, w: "100%", h: 0.4, fill: { color: "0A0B14" }, line: { color: "0A0B14" } })
      s.addShape(pptx.ShapeType.rect, { x: 0, y: 5.6, w: 0.08, h: 0.4, fill: { color: pc }, line: { color: pc } })
      s.addText(projectName, { x: 0.15, y: 5.65, w: 5, h: 0.28, fontSize: 8, color: "475569" })
      s.addText("(c) " + new Date().getFullYear() + " PMO AI Studio - pmoai.studio", { x: 5.5, y: 5.65, w: 4.3, h: 0.28, fontSize: 8, color: "334155", align: "right" })
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
