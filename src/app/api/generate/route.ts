import { NextRequest, NextResponse } from "next/server"
import { generateTool } from "@/lib/generate"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { tool, projectId, ...options } = body

    if (!tool) {
      return NextResponse.json({ error: "tool requis" }, { status: 400 })
    }
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: "ANTHROPIC_API_KEY manquante dans .env.local" }, { status: 500 })
    }

    console.log(`[api/generate] tool=${tool} project=${options.projectName}`)
    const data = await generateTool({ tool, ...options })
    console.log(`[api/generate] done, keys=${Object.keys(data).join(",")} items=${JSON.stringify(data).length} chars`)

    return NextResponse.json({ success: true, data, tool })
  } catch (e: any) {
    console.error("[api/generate] error:", e.message)
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
