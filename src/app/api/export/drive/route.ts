import { NextRequest, NextResponse } from "next/server"
export async function POST(req: NextRequest) {
  const { content, filename } = await req.json()
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type":"application/json","x-api-key":process.env.ANTHROPIC_API_KEY!,"anthropic-version":"2023-06-01","anthropic-beta":"mcp-client-2025-04-04" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514", max_tokens: 512,
        mcp_servers: [{ type:"url", url:"https://drivemcp.googleapis.com/mcp/v1", name:"gdrive" }],
        messages: [{ role:"user", content:`Crée un fichier Google Drive nommé "${filename}" avec ce contenu:\n${content}\nRéponds uniquement JSON: {"url":"https://..."}` }]
      })
    })
    const data = await res.json()
    const text = data.content?.find((b:any)=>b.type==="text")?.text ?? ""
    try { return NextResponse.json(JSON.parse(text)) } catch { return NextResponse.json({url:null,message:text}) }
  } catch(e:any) { return NextResponse.json({url:null,error:e.message},{status:500}) }
}
