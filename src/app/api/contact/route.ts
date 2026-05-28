import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json()

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "Tous les champs sont requis" }, { status: 400 })
    }

    // Email à l'équipe PMO AI Studio
    await resend.emails.send({
      from: process.env.RESEND_FROM ?? "PMO AI Studio <noreply@pmoai.studio>",
      to: ["contact@pmoai.studio"],
      replyTo: email,
      subject: `[Contact] ${subject} — ${name}`,
      html: `
        <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
          <div style="background:linear-gradient(135deg,#1e40af,#7B5EFF);padding:24px 32px;">
            <h1 style="color:#fff;margin:0;font-size:20px;font-weight:800;">📬 Nouveau message de contact</h1>
            <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:13px;">PMO AI Studio — Formulaire de contact</p>
          </div>
          <div style="padding:28px 32px;">
            <table style="width:100%;border-collapse:collapse;">
              <tr>
                <td style="padding:8px 0;font-size:13px;color:#64748b;font-weight:600;width:120px;">Nom</td>
                <td style="padding:8px 0;font-size:14px;color:#0f172a;font-weight:700;">${name}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;font-size:13px;color:#64748b;font-weight:600;">Email</td>
                <td style="padding:8px 0;font-size:14px;color:#3b82f6;"><a href="mailto:${email}" style="color:#3b82f6;">${email}</a></td>
              </tr>
              <tr>
                <td style="padding:8px 0;font-size:13px;color:#64748b;font-weight:600;">Sujet</td>
                <td style="padding:8px 0;font-size:14px;color:#0f172a;">${subject}</td>
              </tr>
            </table>
            <div style="margin-top:20px;padding:16px;background:#f8fafc;border-radius:10px;border:1px solid #f1f5f9;">
              <p style="font-size:13px;color:#64748b;font-weight:600;margin:0 0 8px;">Message :</p>
              <p style="font-size:14px;color:#374151;margin:0;line-height:1.7;white-space:pre-wrap;">${message}</p>
            </div>
            <div style="margin-top:20px;text-align:center;">
              <a href="mailto:${email}?subject=Re: ${subject}" 
                style="display:inline-block;padding:10px 24px;background:linear-gradient(135deg,#1e40af,#3b82f6);color:#fff;border-radius:8px;font-size:13px;font-weight:700;text-decoration:none;">
                Répondre à ${name} →
              </a>
            </div>
          </div>
          <div style="padding:16px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
            <p style="font-size:11px;color:#94a3b8;margin:0;">PMO AI Studio · pmoai.studio</p>
          </div>
        </div>
      `,
    })

    // Email de confirmation à l'expéditeur
    await resend.emails.send({
      from: process.env.RESEND_FROM ?? "PMO AI Studio <noreply@pmoai.studio>",
      to: [email],
      subject: "✅ Votre message a bien été reçu — PMO AI Studio",
      html: `
        <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
          <div style="background:linear-gradient(135deg,#1e40af,#7B5EFF);padding:24px 32px;">
            <h1 style="color:#fff;margin:0;font-size:20px;font-weight:800;">✅ Message bien reçu !</h1>
          </div>
          <div style="padding:28px 32px;">
            <p style="font-size:15px;color:#374151;margin:0 0 16px;">Bonjour <strong>${name}</strong>,</p>
            <p style="font-size:14px;color:#64748b;line-height:1.7;margin:0 0 16px;">
              Nous avons bien reçu votre message concernant <strong>${subject}</strong>. 
              Notre équipe vous répondra dans les <strong>24 heures</strong>.
            </p>
            <div style="background:#f8fafc;border-radius:10px;padding:16px;border:1px solid #f1f5f9;margin:0 0 24px;">
              <p style="font-size:12px;color:#94a3b8;margin:0 0 6px;">Votre message :</p>
              <p style="font-size:13px;color:#374151;margin:0;line-height:1.6;white-space:pre-wrap;">${message}</p>
            </div>
            <a href="https://pmoai.studio" style="display:inline-block;padding:10px 24px;background:linear-gradient(135deg,#1e40af,#3b82f6);color:#fff;border-radius:8px;font-size:13px;font-weight:700;text-decoration:none;">
              Retour à PMO AI Studio →
            </a>
          </div>
          <div style="padding:16px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
            <p style="font-size:11px;color:#94a3b8;margin:0;">PMO AI Studio · pmoai.studio · contact@pmoai.studio</p>
          </div>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error("Contact form error:", e)
    return NextResponse.json({ error: e.message || "Erreur serveur" }, { status: 500 })
  }
}
