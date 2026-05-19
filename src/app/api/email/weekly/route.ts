import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })

    const { projectId, projectName, stats } = await req.json()

    // Vérifier si Resend est configuré
    const resendKey = process.env.RESEND_API_KEY
    if (!resendKey) {
      // Mode simulation sans Resend
      console.log("[Email] Simulation — RESEND_API_KEY non configuré")
      return NextResponse.json({ success: true, simulated: true, message: "Email simulé (configurez RESEND_API_KEY pour l'envoi réel)" })
    }

    const { Resend } = await import("resend")
    const resend = new Resend(resendKey)

    const today = new Date().toLocaleDateString("fr-FR", { weekday:"long", day:"numeric", month:"long", year:"numeric" })

    const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif">
  <div style="max-width:600px;margin:0 auto;padding:24px 16px">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#1e3a5f,#7B5EFF);border-radius:12px;padding:24px;margin-bottom:20px;text-align:center">
      <div style="font-size:28px;margin-bottom:8px">📊</div>
      <h1 style="color:#fff;font-size:20px;font-weight:800;margin:0 0 4px">Résumé hebdomadaire</h1>
      <p style="color:rgba(255,255,255,0.8);font-size:13px;margin:0">${projectName}</p>
      <p style="color:rgba(255,255,255,0.6);font-size:11px;margin:6px 0 0">${today}</p>
    </div>

    <!-- RAG Status -->
    <div style="background:#fff;border-radius:10px;padding:16px;margin-bottom:16px;border:1px solid #e2e8f0;text-align:center">
      <div style="font-size:32px;margin-bottom:6px">${stats.rag==="G"?"🟢":stats.rag==="A"?"🟡":"🔴"}</div>
      <div style="font-size:16px;font-weight:800;color:${stats.rag==="G"?"#22c55e":stats.rag==="A"?"#f59e0b":"#ef4444"}">
        Statut ${stats.rag==="G"?"VERT — Projet sain":stats.rag==="A"?"AMBRE — Points d'attention":"ROUGE — Action requise"}
      </div>
      <div style="font-size:12px;color:#64748b;margin-top:4px">Score santé : ${stats.score}/100</div>
    </div>

    <!-- KPIs -->
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:16px">
      ${[
        { label:"Avancement", value:(stats.completion||0)+"%", color:"#7B5EFF" },
        { label:"CPI", value:stats.cpi||"N/A", color:stats.cpi>=1?"#22c55e":"#ef4444" },
        { label:"SPI", value:stats.spi||"N/A", color:stats.spi>=1?"#22c55e":"#ef4444" },
      ].map(k=>`
      <div style="background:#fff;border-radius:8px;padding:12px;text-align:center;border:1px solid #e2e8f0">
        <div style="font-size:20px;font-weight:800;color:${k.color}">${k.value}</div>
        <div style="font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px">${k.label}</div>
      </div>`).join("")}
    </div>

    <!-- Alertes -->
    ${stats.alerts?.length > 0 ? `
    <div style="background:#fef2f2;border-radius:10px;padding:14px;margin-bottom:16px;border:1px solid #fecaca">
      <div style="font-size:12px;font-weight:700;color:#ef4444;margin-bottom:8px">⚠️ ${stats.alerts.length} alerte(s) à traiter</div>
      ${stats.alerts.slice(0,3).map((a:string)=>`<div style="font-size:11px;color:#374151;padding:4px 0;border-bottom:1px solid #fee2e2">• ${a}</div>`).join("")}
    </div>` : `
    <div style="background:#f0fdf4;border-radius:10px;padding:14px;margin-bottom:16px;border:1px solid #bbf7d0;text-align:center">
      <div style="font-size:12px;font-weight:600;color:#22c55e">✅ Aucune alerte — projet sain</div>
    </div>`}

    <!-- Jalons -->
    ${stats.jalonsNext?.length > 0 ? `
    <div style="background:#fff;border-radius:10px;padding:14px;margin-bottom:16px;border:1px solid #e2e8f0">
      <div style="font-size:12px;font-weight:700;color:#374151;margin-bottom:8px">⏱️ Jalons à venir (30 jours)</div>
      ${stats.jalonsNext.slice(0,3).map((j:any)=>`
      <div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #f1f5f9;font-size:11px">
        <span style="color:#374151">${j.name}</span>
        <span style="color:${j.daysLeft<=7?"#ef4444":"#3b82f6"};font-weight:700">${j.daysLeft}j</span>
      </div>`).join("")}
    </div>` : ""}

    <!-- CTA -->
    <div style="text-align:center;margin-bottom:20px">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/projects/${projectId}"
        style="display:inline-block;background:linear-gradient(135deg,#7B5EFF,#185FA5);color:#fff;padding:12px 28px;border-radius:8px;font-size:13px;font-weight:700;text-decoration:none">
        Ouvrir le projet →
      </a>
    </div>

    <!-- Footer -->
    <div style="text-align:center;font-size:10px;color:#94a3b8;padding-top:16px;border-top:1px solid #e2e8f0">
      PMO AI Studio · <a href="${process.env.NEXT_PUBLIC_APP_URL}/settings" style="color:#7B5EFF">Gérer mes notifications</a>
    </div>
  </div>
</body>
</html>`

    const { data, error } = await resend.emails.send({
      from: "PMO AI Studio <notifications@pmoai.studio>",
      to:   user.email!,
      subject: `📊 Résumé hebdo — ${projectName} · ${stats.rag==="G"?"🟢":stats.rag==="A"?"🟡":"🔴"} Score ${stats.score}/100`,
      html,
    })

    if (error) throw new Error(error.message)

    // Logger l'envoi
    await supabase.from("notifications").insert({
      user_id: user.id,
      title: "Résumé hebdomadaire envoyé",
      message: `Rapport du projet ${projectName} envoyé à ${user.email}`,
      type: "info", read: false
    })

    return NextResponse.json({ success: true, emailId: data?.id })
  } catch(e:any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
