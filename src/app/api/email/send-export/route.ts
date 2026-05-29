import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { to, subject, message, filename, fileBase64, mimeType } = await req.json()

    if (!to || !fileBase64 || !filename) {
      return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 })
    }

    const attachments = [{
      filename: filename,
      content: fileBase64,
      type: mimeType ?? "application/octet-stream",
    }]

    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM ?? "PMO AI Studio <noreply@pmoai.studio>",
      to: [to],
      subject: subject ?? `Export PMO AI Studio — ${filename}`,
      html: `
        <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
          <div style="background:linear-gradient(135deg,#1e40af,#7B5EFF);padding:24px 32px;">
            <img src="https://pmoai.studio/logo-pmoai.png" width="40" height="40" style="border-radius:10px;margin-bottom:10px;" alt="PMO AI Studio"/>
            <h1 style="color:#fff;margin:0;font-size:20px;font-weight:800;">PMO AI Studio</h1>
            <p style="color:rgba(255,255,255,0.8);margin:4px 0 0;font-size:12px;">L'outil PMO qui transforme vos projets en succès</p>
          </div>
          <div style="padding:28px 32px;">
            <p style="font-size:14px;color:#374151;line-height:1.7;margin:0 0 16px;">
              ${message ? message.replace(/\n/g, "<br>") : "Veuillez trouver ci-joint votre export PMO AI Studio."}
            </p>
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px 16px;margin:16px 0;">
              <p style="margin:0;font-size:13px;color:#374151;">
                📎 <strong>${filename}</strong>
              </p>
            </div>
            <a href="https://pmoai.studio/dashboard" 
              style="display:inline-block;padding:10px 24px;background:linear-gradient(135deg,#1e40af,#3b82f6);color:#fff;border-radius:8px;font-size:13px;font-weight:700;text-decoration:none;margin-top:8px;">
              Accéder à PMO AI Studio →
            </a>
          </div>
          <div style="padding:16px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
            <p style="font-size:11px;color:#94a3b8;margin:0;">PMO AI Studio · pmoai.studio</p>
          </div>
        </div>
      `,
      attachments,
    })

    if (error) throw new Error(error.message)
    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error("Send export error:", e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
