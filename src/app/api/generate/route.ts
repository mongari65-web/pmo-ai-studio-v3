import { NextRequest, NextResponse } from "next/server"
import { generateTool } from "@/lib/generate"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { tool, projectId, ...options } = body
    if (!tool) return NextResponse.json({ error: "tool required" }, { status: 400 })

    const data = await generateTool({ tool, ...options })
    return NextResponse.json({ success: true, data, tool })
  } catch (e: any) {
    console.error("Generate error:", e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
