"use client"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import AppLayout from "@/components/layout/AppLayout"
import Link from "next/link"
import { Plus, FolderKanban, Target, DollarSign, Bell, AlertTriangle, Clock, CheckCircle2, Wand2, ArrowRight, TrendingUp } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"

interface Alert { type:string; message:string; project:string; projectId:string; href:string; severity:string }

const SEV = {
  danger:  { bg:"#FCEBEB", border:"#E24B4A", icon:AlertTriangle, color:"#A32D2D" },
  warning: { bg:"#FAEEDA", border:"#EF9F27", icon:Clock,         color:"#854F0B" },
  info:    { bg:"#E6F1FB", border:"#378ADD", icon:CheckCircle2,  color:"var(--primary-light)" },
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({data})=>setUser(data.user))
    loadData()
  }, [])

  const loadData = async () => {
    const {data:projs} = await supabase.from("projects").select("*").order("created_at",{ascending:false})
    setProjects(projs??[])
    const {data:tools} = await supabase.from("project_tools").select("project_id,tool_type,data")
    if (tools && projs) {
      const newAlerts: Alert[] = []
      tools.forEach(t => {
        const proj = (projs as any[]).find(p=>p.id===t.project_id)
        if (!proj) return
        if (t.tool_type==="raid"&&t.data?.items) {
          const crit = t.data.items.filter((i:any)=>i.priority==="Critique"&&i.status==="Ouvert")
          if (crit.length>0) newAlerts.push({type:"raid",message:`${crit.length} risque(s) critique(s) ouvert(s)`,project:proj.name,projectId:proj.id,href:`/projects/${proj.id}/raid`,severity:"danger"})
        }
        if (t.tool_type==="budget"&&t.data?.tasks) {
          const cp=new Date().getMonth()
          const ev=t.data.tasks.reduce((s:number,task:any)=>s+(task.ev?.[cp]??0),0)
          const ac=t.data.tasks.reduce((s:number,task:any)=>s+(task.ac?.[cp]??0),0)
          const cpi=ac>0?ev/ac:1
          if (cpi<0.9) newAlerts.push({type:"budget",message:`CPI = ${cpi.toFixed(2)} — dépassement budgétaire`,project:proj.name,projectId:proj.id,href:`/projects/${proj.id}/budget`,severity:"warning"})
        }
        if (t.tool_type==="jalons"&&t.data?.jalons) {
          const today=new Date().toISOString().split("T")[0]
          const retard=t.data.jalons.filter((j:any)=>j.date<today&&j.status!=="Atteint")
          if (retard.length>0) newAlerts.push({type:"jalon",message:`${retard.length} jalon(s) en retard`,project:proj.name,projectId:proj.id,href:`/projects/${proj.id}/jalons`,severity:"warning"})
        }
      })
      setAlerts(newAlerts)
    }
  }

  const active = projects.filter(p=>p.status==="active")
  const avg = projects.length>0?Math.round(projects.reduce((s,p)=>s+(p.completion??0),0)/projects.length):0
  const totalBudget = projects.reduce((s,p)=>s+(p.budget??0),0)

  const chartData = projects.slice(0,8).map(p=>({
    name:p.name.length>12?p.name.slice(0,11)+"…":p.name,
    v:p.completion??0, fill:p.color??"var(--primary-light)"
  }))

  const KPI = ({label,value,icon:Icon,color,bg,sub}:any) => (
    <div style={{ background:bg??"var(--card)", border:"1px solid var(--border)", borderRadius:"var(--r8)", padding:"16px 18px" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
        <span style={{ fontSize:11, fontWeight:500, color:"var(--text-2)", textTransform:"uppercase", letterSpacing:"0.6px" }}>{label}</span>
        <div style={{ width:32, height:32, borderRadius:"var(--r8)", background:color+"18", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <Icon size={15} style={{ color }}/>
        </div>
      </div>
      <div style={{ fontSize:24, fontWeight:700, color:color??"var(--text-1)" }}>{value}</div>
      {sub && <div style={{ fontSize:11, color:"var(--text-3)", marginTop:4 }}>{sub}</div>}
    </div>
  )

  return (
    <AppLayout>

      {/* Banner upgrade success */}
      {typeof window !== "undefined" && new URLSearchParams(window.location.search).get("upgrade") === "success" && (
        <div style={{ background:"#E3FCEF", border:"1px solid #ABF5D1", borderLeft:"4px solid #36B37E", borderRadius:"var(--r8)", padding:"12px 16px", marginBottom:16, display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:20 }}>🎉</span>
          <div>
            <p style={{ fontSize:13, fontWeight:600, color:"#006644", margin:0 }}>Bienvenue dans le plan Pro !</p>
            <p style={{ fontSize:12, color:"#006644", opacity:0.8, margin:0 }}>Votre abonnement est actif. Profitez de tous vos avantages.</p>
          </div>
        </div>
      )}
      <div style={{ padding:"24px 28px", background:"var(--bg)", minHeight:"100%" }}>
        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
          <div>
            <h1 style={{ fontSize:20, fontWeight:700, color:"var(--text-1)", margin:"0 0 4px" }}>
              Bonjour{user?.user_metadata?.full_name?`, ${user.user_metadata.full_name.split(" ")[0]}`:""} 👋
            </h1>
            <p style={{ fontSize:12, color:"var(--text-2)", margin:0 }}>
              {new Date().toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}
            </p>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <Link href="/guide" style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 14px", background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:"var(--r8)", fontSize:12, fontWeight:500, color:"#854F0B", textDecoration:"none" }}>
              <Wand2 size={14}/> Guide CP
            </Link>
            <Link href="/guide" style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 14px", background:"var(--primary)", borderRadius:"var(--r8)", fontSize:12, fontWeight:600, color:"#fff", textDecoration:"none" }}>
              <Plus size={14}/> Nouveau projet
            </Link>
          </div>
        </div>

        {/* KPIs */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:20 }}>
          <KPI label="Projets actifs"   value={active.length} icon={FolderKanban} color="var(--primary-light)" sub={`${projects.length} au total`}/>
          <KPI label="Avancement moyen" value={`${avg}%`}     icon={Target}       color="#639922" sub="tous projets confondus"/>
          <KPI label="Budget total"     value={totalBudget>0?`${(totalBudget/1000).toFixed(0)}k€`:"—"} icon={DollarSign} color="#27500A" sub="engagé"/>
          <KPI label="Alertes actives"  value={alerts.length}  icon={Bell}         color={alerts.length>0?"#A32D2D":"var(--primary-light)"} bg={alerts.length>0?"#FCEBEB":undefined} sub={alerts.length>0?"à traiter":"tout va bien"}/>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 2fr", gap:16, marginBottom:20 }}>
          {/* Alertes */}
          <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:"var(--r12)", padding:16 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
              <h2 style={{ fontSize:13, fontWeight:600, color:"var(--text-1)", margin:0 }}>🔔 Alertes</h2>
              <Link href="/notifications" style={{ fontSize:11, color:"var(--primary)", textDecoration:"none" }}>Voir tout →</Link>
            </div>
            {alerts.length===0 ? (
              <div style={{ textAlign:"center", padding:"24px 0" }}>
                <CheckCircle2 size={28} style={{ color:"#639922", margin:"0 auto 8px", display:"block" }}/>
                <p style={{ fontSize:12, color:"var(--text-2)", margin:0 }}>Aucune alerte</p>
                <p style={{ fontSize:11, color:"var(--text-3)", marginTop:4 }}>Tous les projets sont sains</p>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {alerts.slice(0,5).map((a,i)=>{
                  const cfg=SEV[a.severity as keyof typeof SEV]??SEV.info
                  const Icon=cfg.icon
                  return (
                    <Link key={i} href={a.href} style={{ display:"block", textDecoration:"none", padding:"10px 12px", borderRadius:"var(--r8)", background:cfg.bg, borderLeft:`3px solid ${cfg.border}` }}>
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                        <div style={{ display:"flex", alignItems:"flex-start", gap:8 }}>
                          <Icon size={14} style={{ color:cfg.color, flexShrink:0, marginTop:1 }}/>
                          <div>
                            <p style={{ fontSize:11, fontWeight:600, color:cfg.color, margin:"0 0 2px" }}>{a.project}</p>
                            <p style={{ fontSize:11, color:"var(--text-2)", margin:0 }}>{a.message}</p>
                          </div>
                        </div>
                        <span style={{ fontSize:10, color:cfg.color, fontWeight:600, flexShrink:0 }}>Voir →</span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          {/* Chart */}
          <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:"var(--r12)", padding:16 }}>
            <h2 style={{ fontSize:13, fontWeight:600, color:"var(--text-1)", margin:"0 0 14px" }}>📊 Avancement par projet</h2>
            {chartData.length>0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData} barSize={22}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                  <XAxis dataKey="name" tick={{fill:"#94a3b8",fontSize:10}} axisLine={false} tickLine={false}/>
                  <YAxis domain={[0,100]} tick={{fill:"#94a3b8",fontSize:10}} axisLine={false} tickLine={false} tickFormatter={v=>`${v}%`}/>
                  <Tooltip contentStyle={{background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:8,boxShadow:"0 4px 12px rgba(0,0,0,0.08)"}} formatter={(v:any)=>[`${v}%`,"Avancement"]} labelStyle={{color:"var(--text-1)",fontWeight:600}}/>
                  <Bar dataKey="v" radius={[4,4,0,0]}>
                    {chartData.map((d,i)=><Cell key={i} fill={d.fill}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height:180, display:"flex", alignItems:"center", justifyContent:"center", color:"var(--text-3)", fontSize:13 }}>
                Créez des projets pour voir les statistiques
              </div>
            )}
          </div>
        </div>

        {/* Projets récents */}
        <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:"var(--r12)", padding:16 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
            <h2 style={{ fontSize:13, fontWeight:600, color:"var(--text-1)", margin:0 }}>📁 Projets récents</h2>
            <Link href="/projects" style={{ fontSize:11, color:"var(--primary)", textDecoration:"none" }}>Voir tous →</Link>
          </div>
          {projects.length===0 ? (
            <div style={{ textAlign:"center", padding:"32px 0" }}>
              <FolderKanban size={36} style={{ color:"#cbd5e1", margin:"0 auto 12px", display:"block" }}/>
              <p style={{ fontSize:13, color:"var(--text-2)", margin:"0 0 16px" }}>Aucun projet. Créez-en un avec le Guide CP.</p>
              <Link href="/guide" style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"8px 16px", background:"var(--warning-bg)", border:"1px solid #EF9F27", borderRadius:"var(--r8)", fontSize:12, color:"var(--warning)", textDecoration:"none", fontWeight:500 }}>
                ✨ Guide CP
              </Link>
            </div>
          ) : (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
              {projects.slice(0,5).map(p=>(
                <Link key={p.id} href={`/projects/${p.id}`} style={{ display:"block", textDecoration:"none", padding:"14px", border:"1px solid var(--border)", borderRadius:"var(--r8)", background:"var(--bg)", transition:"all 0.12s" }}
                  onMouseEnter={e=>{(e.currentTarget as any).style.borderColor="var(--primary)";(e.currentTarget as any).style.background="#fff"}}
                  onMouseLeave={e=>{(e.currentTarget as any).style.borderColor="var(--border)";(e.currentTarget as any).style.background="var(--bg)"}}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ fontSize:18 }}>{p.icon}</span>
                      <div>
                        <p style={{ fontSize:12, fontWeight:600, color:"var(--text-1)", margin:0, maxWidth:120, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.name}</p>
                        <p style={{ fontSize:10, color:"var(--text-3)", margin:0 }}>{p.status}</p>
                      </div>
                    </div>
                    <ArrowRight size={13} style={{ color:"var(--text-3)" }}/>
                  </div>
                  <div>
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:"var(--text-3)", marginBottom:4 }}>
                      <span>Avancement</span><span style={{ fontWeight:600, color:"var(--text-1)" }}>{p.completion??0}%</span>
                    </div>
                    <div style={{ height:4, background:"var(--border)", borderRadius:2, overflow:"hidden" }}>
                      <div style={{ height:"100%", borderRadius:2, width:`${p.completion??0}%`, background:p.color??"var(--primary)" }}/>
                    </div>
                  </div>
                  {p.budget>0&&<p style={{ fontSize:10, color:"#639922", marginTop:8, fontWeight:500 }}>💰 {(p.budget/1000).toFixed(0)}k€</p>}
                </Link>
              ))}
              <Link href="/guide" style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"14px", border:"1px dashed var(--border)", borderRadius:"var(--r8)", textDecoration:"none", color:"var(--text-3)", fontSize:12, transition:"all 0.12s" }}
                onMouseEnter={e=>{(e.currentTarget as any).style.borderColor="var(--primary)";(e.currentTarget as any).style.color="var(--primary)"}}
                onMouseLeave={e=>{(e.currentTarget as any).style.borderColor="var(--border)";(e.currentTarget as any).style.color="var(--text-3)"}}>
                <Plus size={22} style={{ marginBottom:6 }}/> Nouveau projet
              </Link>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
