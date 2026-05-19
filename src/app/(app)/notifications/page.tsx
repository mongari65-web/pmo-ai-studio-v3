"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import AppLayout from "@/components/layout/AppLayout"
import { Bell, Mail, Send, Check, Trash2, RefreshCw, ToggleLeft, ToggleRight } from "lucide-react"
import { toast } from "sonner"

interface Notif { id:string; title:string; message:string; type:string; read:boolean; created_at:string }
interface Project { id:string; name:string; icon:string; notifEnabled:boolean }

const TYPE_CFG: Record<string, { color:string; bg:string; emoji:string }> = {
  info:    { color:"#3b82f6", bg:"rgba(59,130,246,0.1)",  emoji:"ℹ️" },
  success: { color:"#22c55e", bg:"rgba(34,197,94,0.1)",   emoji:"✅" },
  warning: { color:"#f59e0b", bg:"rgba(245,158,11,0.1)",  emoji:"⚠️" },
  promo:   { color:"#7B5EFF", bg:"rgba(123,94,255,0.1)",  emoji:"🎁" },
  error:   { color:"#ef4444", bg:"rgba(239,68,68,0.1)",   emoji:"🔴" },
}

export default function NotificationsPage() {
  const [notifs, setNotifs]     = useState<Notif[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading]   = useState(true)
  const [sending, setSending]   = useState<string|null>(null)
  const [tab, setTab]           = useState<"inbox"|"email">("inbox")
  const [emailEnabled, setEmailEnabled] = useState(true)
  const [weeklyEnabled, setWeeklyEnabled] = useState(true)
  const supabase = createClient()

  useEffect(() => { loadAll() }, [])

  const loadAll = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [{ data: ns }, { data: ps }] = await Promise.all([
      supabase.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending:false }).limit(50),
      supabase.from("projects").select("id, name, icon").order("updated_at", { ascending:false }),
    ])

    setNotifs(ns ?? [])
    setProjects((ps??[]).map(p => ({ ...p, notifEnabled:true })))
    setLoading(false)
  }

  const markRead = async (id:string) => {
    await supabase.from("notifications").update({ read:true }).eq("id", id)
    setNotifs(prev => prev.map(n => n.id===id ? { ...n, read:true } : n))
  }

  const markAllRead = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from("notifications").update({ read:true }).eq("user_id", user.id)
    setNotifs(prev => prev.map(n => ({ ...n, read:true })))
    toast.success("Toutes les notifications lues")
  }

  const deleteNotif = async (id:string) => {
    await supabase.from("notifications").delete().eq("id", id)
    setNotifs(prev => prev.filter(n => n.id!==id))
  }

  const sendWeeklyEmail = async (projectId:string, projectName:string) => {
    setSending(projectId)
    try {
      // Récupérer les données du projet pour le résumé
      const { data: tools } = await supabase.from("project_tools").select("tool_type,data").eq("project_id", projectId)
      const { data: proj  } = await supabase.from("projects").select("*").eq("id", projectId).single()

      const cp = new Date().getMonth()
      const today = new Date().toISOString().split("T")[0]
      const budgetTool = tools?.find(t=>t.tool_type==="budget")
      const raidTool   = tools?.find(t=>t.tool_type==="raid")
      const jalonsTool = tools?.find(t=>t.tool_type==="jalons")

      let cpi:number|null = null, spi:number|null = null
      if (budgetTool?.data?.tasks) {
        const tasks = budgetTool.data.tasks
        const pv = tasks.reduce((s:number,t:any)=>s+(t.pv?.[cp]??0),0)
        const ev = tasks.reduce((s:number,t:any)=>s+(t.ev?.[cp]??0),0)
        const ac = tasks.reduce((s:number,t:any)=>s+(t.ac?.[cp]??0),0)
        if (ac>0) cpi = Math.round(ev/ac*100)/100
        if (pv>0) spi = Math.round(ev/pv*100)/100
      }

      const raidCrit = raidTool?.data?.items?.filter((i:any)=>i.priority==="Critique"&&i.status==="Ouvert")?.length??0
      const alerts: string[] = []
      if (cpi!==null&&cpi<0.9) alerts.push("CPI="+cpi.toFixed(2)+" — dépassement budget")
      if (spi!==null&&spi<0.9) alerts.push("SPI="+spi.toFixed(2)+" — retard planning")
      if (raidCrit>0) alerts.push(raidCrit+" risque(s) critique(s) RAID")

      const jalonsNext = (jalonsTool?.data?.jalons??[])
        .filter((j:any)=>j.date>=today&&j.status!=="Atteint")
        .map((j:any)=>({ name:j.name, daysLeft:Math.round((new Date(j.date).getTime()-Date.now())/86400000) }))
        .slice(0,3)

      let score = 100
      if (cpi!==null&&cpi<1) score-=20
      if (spi!==null&&spi<1) score-=20
      score -= raidCrit*10
      score = Math.max(0,Math.min(100,score))
      const rag = score>=75?"G":score>=50?"A":"R"

      const res = await fetch("/api/email/weekly", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          projectId, projectName,
          stats: { completion:proj?.completion??0, cpi, spi, rag, score, alerts, jalonsNext }
        })
      })
      const json = await res.json()
      if (json.error) throw new Error(json.error)

      if (json.simulated) {
        toast.info("Email simulé — configurez RESEND_API_KEY dans .env.local pour l'envoi réel")
      } else {
        toast.success("Résumé hebdo envoyé pour "+projectName)
      }
      await loadAll()
    } catch(e:any) {
      toast.error("Erreur : "+e.message)
    } finally {
      setSending(null)
    }
  }

  const unread = notifs.filter(n => !n.read).length

  return (
    <AppLayout>
      <div style={{ padding:"20px 24px", background:"var(--bg)", minHeight:"100%", display:"flex", flexDirection:"column", gap:14 }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <p style={{ fontSize:10, color:"var(--text-3)", textTransform:"uppercase", letterSpacing:"1px", margin:"0 0 4px" }}>// NOTIFICATIONS</p>
            <h1 style={{ fontSize:22, fontWeight:800, color:"var(--text-1)", margin:0 }}>Centre de notifications</h1>
          </div>
          <button onClick={loadAll} style={{ display:"flex", alignItems:"center", gap:5, padding:"7px 12px", border:"1px solid var(--border)", borderRadius:8, background:"transparent", color:"var(--text-2)", fontSize:12, cursor:"pointer" }}>
            <RefreshCw size={13}/> Actualiser
          </button>
        </div>

        {/* KPIs */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
          {[
            { label:"Total",       value:notifs.length,   color:"var(--primary)" },
            { label:"Non lues",    value:unread,          color:unread>0?"#ef4444":"#22c55e" },
            { label:"Aujourd'hui", value:notifs.filter(n=>n.created_at?.startsWith(new Date().toISOString().split("T")[0])).length, color:"#3b82f6" },
            { label:"Projets",     value:projects.length, color:"#f59e0b" },
          ].map(k => (
            <div key={k.label} style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:10, padding:"10px 14px", textAlign:"center" }}>
              <div style={{ fontSize:20, fontWeight:800, color:k.color }}>{k.value}</div>
              <div style={{ fontSize:10, color:"var(--text-3)", marginTop:2 }}>{k.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", gap:4, background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:10, padding:4, width:"fit-content" }}>
          {([["inbox","🔔 Inbox"+(unread>0?" ("+unread+")":"")],["email","📧 Email hebdo"]] as const).map(([v,l]) => (
            <button key={v} onClick={() => setTab(v as any)}
              style={{ padding:"6px 16px", borderRadius:7, fontSize:12, fontWeight:500, cursor:"pointer", border:"none", background:tab===v?"var(--primary-bg)":"transparent", color:tab===v?"var(--primary-light)":"var(--text-2)" }}>
              {l}
            </button>
          ))}
        </div>

        {/* ── Inbox ── */}
        {tab === "inbox" && (
          <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, overflow:"hidden" }}>
            <div style={{ padding:"10px 16px", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <span style={{ fontSize:13, fontWeight:700, color:"var(--text-1)" }}>Notifications</span>
              {unread > 0 && (
                <button onClick={markAllRead} style={{ fontSize:11, color:"var(--primary-light)", background:"transparent", border:"1px solid rgba(123,94,255,0.3)", borderRadius:6, padding:"3px 10px", cursor:"pointer" }}>
                  Tout marquer lu
                </button>
              )}
            </div>
            {loading ? (
              <div style={{ padding:"40px", textAlign:"center", color:"var(--text-3)" }}>Chargement...</div>
            ) : notifs.length === 0 ? (
              <div style={{ padding:"40px", textAlign:"center" }}>
                <Bell size={28} style={{ color:"var(--text-3)", margin:"0 auto 8px", display:"block", opacity:0.4 }}/>
                <p style={{ fontSize:12, color:"var(--text-3)", margin:0 }}>Aucune notification</p>
              </div>
            ) : notifs.map((n, idx) => {
              const cfg = TYPE_CFG[n.type] ?? TYPE_CFG.info
              return (
                <div key={n.id} onClick={() => !n.read && markRead(n.id)}
                  style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"12px 16px", borderBottom:idx<notifs.length-1?"1px solid var(--border)":"none", background:n.read?"transparent":"rgba(123,94,255,0.04)", cursor:n.read?"default":"pointer", transition:"background 0.15s" }}>
                  <div style={{ width:36, height:36, borderRadius:10, background:cfg.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>
                    {cfg.emoji}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:2 }}>
                      <span style={{ fontSize:12, fontWeight:n.read?500:700, color:"var(--text-1)" }}>{n.title}</span>
                      {!n.read && <span style={{ width:6, height:6, borderRadius:"50%", background:"var(--primary)", flexShrink:0 }}/>}
                    </div>
                    <p style={{ fontSize:11, color:"var(--text-2)", margin:0, lineHeight:1.4 }}>{n.message}</p>
                    <p style={{ fontSize:10, color:"var(--text-3)", margin:"4px 0 0" }}>
                      {new Date(n.created_at).toLocaleDateString("fr-FR", { day:"numeric", month:"short", hour:"2-digit", minute:"2-digit" })}
                    </p>
                  </div>
                  <button onClick={e => { e.stopPropagation(); deleteNotif(n.id) }}
                    style={{ padding:"4px 6px", background:"transparent", border:"1px solid rgba(239,68,68,0.2)", borderRadius:5, cursor:"pointer", color:"#ef4444", flexShrink:0 }}>
                    <Trash2 size={11}/>
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {/* ── Email hebdo ── */}
        {tab === "email" && (
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {/* Préférences globales */}
            <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, padding:"16px" }}>
              <h3 style={{ fontSize:13, fontWeight:700, color:"var(--text-1)", margin:"0 0 14px" }}>⚙️ Préférences email</h3>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {[
                  { label:"Notifications email activées", desc:"Recevoir des emails de PMO AI Studio", key:"email", val:emailEnabled, set:setEmailEnabled },
                  { label:"Résumé hebdomadaire",          desc:"Rapport automatique chaque lundi matin", key:"weekly", val:weeklyEnabled, set:setWeeklyEnabled },
                ].map(p => (
                  <div key={p.key} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 14px", background:"var(--bg)", borderRadius:8, border:"1px solid var(--border)" }}>
                    <div>
                      <div style={{ fontSize:12, fontWeight:600, color:"var(--text-1)" }}>{p.label}</div>
                      <div style={{ fontSize:10, color:"var(--text-3)" }}>{p.desc}</div>
                    </div>
                    <button onClick={() => p.set(!p.val)}
                      style={{ display:"flex", alignItems:"center", gap:5, padding:"4px 12px", border:"1px solid "+(p.val?"#22c55e":"var(--border)"), borderRadius:20, background:p.val?"rgba(34,197,94,0.1)":"transparent", color:p.val?"#22c55e":"var(--text-3)", fontSize:12, fontWeight:600, cursor:"pointer" }}>
                      {p.val ? <><ToggleRight size={14}/> Activé</> : <><ToggleLeft size={14}/> Désactivé</>}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Envoi manuel par projet */}
            <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, overflow:"hidden" }}>
              <div style={{ padding:"12px 16px", borderBottom:"1px solid var(--border)" }}>
                <h3 style={{ fontSize:13, fontWeight:700, color:"var(--text-1)", margin:0 }}>📧 Envoyer un résumé maintenant</h3>
                <p style={{ fontSize:11, color:"var(--text-3)", margin:"4px 0 0" }}>Envoie immédiatement un email de résumé pour le projet sélectionné</p>
              </div>
              {projects.length === 0 ? (
                <div style={{ padding:"30px", textAlign:"center", color:"var(--text-3)", fontSize:12 }}>Aucun projet trouvé</div>
              ) : projects.map((proj, idx) => (
                <div key={proj.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 16px", borderBottom:idx<projects.length-1?"1px solid var(--border)":"none", background:idx%2===0?"var(--bg-card)":"var(--bg)" }}>
                  <span style={{ fontSize:20, flexShrink:0 }}>{proj.icon||"📁"}</span>
                  <span style={{ flex:1, fontSize:12, fontWeight:600, color:"var(--text-1)" }}>{proj.name}</span>
                  <button onClick={() => sendWeeklyEmail(proj.id, proj.name)}
                    disabled={sending===proj.id}
                    style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 14px", background:sending===proj.id?"#22c55e":"var(--primary)", color:"#fff", border:"none", borderRadius:7, fontSize:11, fontWeight:600, cursor:sending===proj.id?"not-allowed":"pointer", opacity:sending===proj.id?0.8:1, whiteSpace:"nowrap" }}>
                    {sending===proj.id ? <><Check size={11}/> Envoyé !</> : <><Send size={11}/> Envoyer résumé</>}
                  </button>
                </div>
              ))}
            </div>

            {/* Info setup */}
            <div style={{ background:"rgba(59,130,246,0.06)", border:"1px solid rgba(59,130,246,0.2)", borderRadius:10, padding:"12px 16px" }}>
              <p style={{ fontSize:12, fontWeight:600, color:"#3b82f6", margin:"0 0 6px" }}>📋 Configuration requise</p>
              <p style={{ fontSize:11, color:"var(--text-2)", margin:"0 0 4px", lineHeight:1.5 }}>Pour activer l'envoi d'emails, ajoutez dans <code style={{ background:"var(--bg)", padding:"1px 5px", borderRadius:3, fontFamily:"monospace" }}>.env.local</code> :</p>
              <code style={{ display:"block", background:"var(--bg)", padding:"8px 10px", borderRadius:6, fontSize:11, fontFamily:"monospace", color:"var(--text-1)" }}>
                RESEND_API_KEY=re_votre_cle_api
              </code>
              <p style={{ fontSize:10, color:"var(--text-3)", margin:"6px 0 0" }}>Obtenez une clé gratuite sur <a href="https://resend.com" target="_blank" rel="noopener noreferrer" style={{ color:"#3b82f6" }}>resend.com</a> (3 000 emails/mois gratuits)</p>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
