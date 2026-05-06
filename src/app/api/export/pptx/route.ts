import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { title, slides, filename } = await req.json()
    // Simple PPTX via XML (compatible sans dépendance)
    const pptxContent = generateSimplePPTX(title, slides)
    return new NextResponse(pptxContent, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": `attachment; filename="${filename}.pptx"`,
      }
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

function generateSimplePPTX(title: string, slides: any[]) {
  // Retourne un fichier texte simple en attendant pptxgenjs côté serveur
  const content = `PMO AI Studio — ${title}\n\n` +
    slides.map((s: any, i: number) => `Slide ${i+1}: ${s.title}\n${s.content?.join("\n") ?? ""}`).join("\n\n")
  return content
}
