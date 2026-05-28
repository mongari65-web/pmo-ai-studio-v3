import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { title, slides, filename } = await req.json()
    const PptxGenJS = (await import("pptxgenjs")).default
    const pptx = new PptxGenJS()

    // Thème PMO AI Studio
    pptx.layout = "LAYOUT_WIDE"
    pptx.author = "PMO AI Studio"
    pptx.subject = title

    // Slide de titre
    const titleSlide = pptx.addSlide()
    titleSlide.background = { color: "0F172A" }
    titleSlide.addText("PMO AI Studio", {
      x: 0.5, y: 1.5, w: "90%", h: 0.8,
      fontSize: 14, color: "7B5EFF", bold: true, align: "center"
    })
    titleSlide.addText(title, {
      x: 0.5, y: 2.5, w: "90%", h: 1.2,
      fontSize: 28, color: "F0F2FF", bold: true, align: "center"
    })
    titleSlide.addText(new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }), {
      x: 0.5, y: 4.2, w: "90%", h: 0.5,
      fontSize: 12, color: "64748B", align: "center"
    })

    // Slides de contenu
    slides.forEach((slide: { title: string; content: string[] }) => {
      const s = pptx.addSlide()
      s.background = { color: "0F172A" }

      // Barre de titre
      s.addShape(pptx.ShapeType.rect, {
        x: 0, y: 0, w: "100%", h: 1.2,
        fill: { color: "1E3A8A" }, line: { color: "1E3A8A" }
      })
      s.addText(slide.title, {
        x: 0.4, y: 0.15, w: "90%", h: 0.9,
        fontSize: 18, color: "FFFFFF", bold: true
      })
      s.addText("PMO AI Studio", {
        x: 8.5, y: 0.35, w: 1.5, h: 0.4,
        fontSize: 9, color: "93C5FD", align: "right"
      })

      // Contenu
      if (slide.content?.length) {
        const rows = slide.content.map(line => {
          const parts = line.split(" | ")
          return parts.map(p => ({
            text: p,
            options: { fontSize: 10, color: "E2E8F0" }
          }))
        })

        if (rows.length > 0 && rows[0].length > 1) {
          // Tableau
          s.addTable(rows, {
            x: 0.4, y: 1.4, w: 9.2,
            colW: Array(rows[0].length).fill(9.2 / rows[0].length),
            border: { type: "solid", color: "1E293B", pt: 1 },
            fill: { color: "111827" },
            rowH: 0.35,
          })
        } else {
          // Liste bullets
          const bulletText = slide.content.map(line => ({
            text: "• " + line,
            options: { fontSize: 11, color: "CBD5E1", bullet: false, paraSpaceAfter: 4 }
          }))
          s.addText(bulletText, {
            x: 0.4, y: 1.4, w: 9.2, h: 4.5,
            valign: "top"
          })
        }
      }

      // Footer
      s.addText("© " + new Date().getFullYear() + " PMO AI Studio — pmoai.studio", {
        x: 0, y: 5.1, w: "100%", h: 0.35,
        fontSize: 8, color: "334155", align: "center",
        fill: { color: "0A0B14" }
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
