"use client"
import { useEffect, useState, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { BarChart3, FolderKanban, TrendingUp, AlertTriangle, Plus, ArrowRight, Target } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

const STATUS_COLORS: Record<string,string> = {
  active: "#36B37E", completed: "#7B5EFF", archived: "#5A5F80", on_hold: "#FF991F"
}

export default function PortfolioPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [raids,    setRaids]    = useState<any[]>([])
  const [loading,  setLoading]  = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const [{ data: ps }, { data: rs }] = await Promise.all([
        supabase.from("projects").select("*").eq("user_id", user.id),
        supabase.from("raid_items").select("*").eq("user_id", user.id),
      ])
      setProjects(ps ?? [])
      setRaids(rs ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const stats = useMemo(() => ({
    total:       projects.length,
    active:      projects.filter(p=>p.status==="active").length,
    completed:   projects.filter(p=>p.status==="completed").length,
    totalBudget: projects.reduce((a,p)=>a+(p.budget??0),0),
    avgProgress: projects.length ? Math.round(projects.reduce((a,p)=>a+(p.progress??0),0)/projects.length) : 0,
    criticalRisks: raids.filter(r=>r.category==="Risk"&&r.priority==="Critique"&&r.status==="Ouvert").length,
    cpi: projects.length ? (projects.reduce((a,p)=>a+(p.cpi??1),0)/projects.length).toFixed(2) : "—",
  }), [projects, raids])

  const chartData = projects.map(p=>({
    name: p.name?.substring(0,12)+"..." || "Projet",
    avancement: p.progress ?? 0,
  }))

  const pieData = [
    { name:"Actifs",    value:stats.active,    color:"#36B37E" },
    { name:"Terminés",  value:stats.completed,  color:"#7B5EFF" },
    { name:"Archivés",  value:projects.filter(p=>p.status==="archived").length, color:"#5A5F80" },
  ].filter(d=>d.value>0)

  if (loading) return (
    <div style={{padding:28,background:"var(--bg)",minHeight:"100%",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <p style={{color:"var(--text-3)"}}>Chargement du portfolio...</p>
    </div>
  )

  return (
    <div style={{padding:"24px 28px",background:"var(--bg)",minHeight:"100%"}}>

      {/* Header */}
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:20}}>
        <div>
          <p style={{fontSize:10,color:"var(--text-3)",textTransform:"uppercase",letterSpacing:"1.5px",margin:"0 0 6px",display:"flex",alignItems:"center",gap:6}}>
            <span style={{width:16,height:1,background:"var(--primary)",display:"inline-block"}}/>
            // PORTFOLIO
          </p>
          <h1 style={{fontSize:22,fontWeight:800,color:"var(--text-1)",margin:"0 0 4px",display:"flex",alignItems:"center",gap:10}}>
            <BarChart3 size={22} style={{color:"var(--primary)"}}/>
            Portfolio Projets
          </h1>
          <p style={{fontSize:13,color:"var(--text-3)",margin:0}}>
            {stats.total} projet{stats.total>1?"s":""} · Vue globale
          </p>
        </div>
        <Link href="/guide"
          style={{display:"flex",alignItems:"center",gap:7,padding:"9px 18px",
            background:"linear-gradient(135deg,var(--primary),var(--primary-dark))",
            borderRadius:"var(--r8)",fontSize:13,fontWeight:600,color:"#fff",
            textDecoration:"none",boxShadow:"0 0 20px var(--primary-glow)"}}>
          <Plus size={14}/> Nouveau projet
        </Link>
      </div>

      {/* KPIs */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
        {[
          {label:"Projets actifs",  value:stats.active,    icon:FolderKanban, color:"var(--primary)", note:`sur ${stats.total}`},
          {label:"Avancement moyen",value:`${stats.avgProgress}%`, icon:Target, color:"#36B37E", note:"tous projets"},
          {label:"Budget portfolio",value:`${(stats.totalBudget/1000).toFixed(0)}k€`, icon:TrendingUp, color:"#FF991F", note:"engagé"},
          {label:"Alertes actives", value:stats.criticalRisks, icon:AlertTriangle, color:"#E24B4A", note:"risques critiques"},
        ].map(k=>{
          const Icon = k.icon
          return (
            <div key={k.label} style={{background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:"var(--r12)",padding:"16px 18px"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                <span style={{fontSize:12,color:"var(--text-2)"}}>{k.label.toUpperCase()}</span>
                <div style={{width:32,height:32,borderRadius:"var(--r8)",background:`${k.color}18`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <Icon size={16} style={{color:k.color}}/>
                </div>
              </div>
              <p style={{fontSize:28,fontWeight:800,color:k.color,margin:"0 0 4px",lineHeight:1}}>{k.value}</p>
              <p style={{fontSize:11,color:"var(--text-3)",margin:0}}>{k.note}</p>
            </div>
          )
        })}
      </div>

      {/* Charts */}
      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:14,marginBottom:20}}>

        {/* Bar chart avancement */}
        <div style={{background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:"var(--r12)",padding:20}}>
          <h3 style={{fontSize:13,fontWeight:700,color:"var(--text-1)",margin:"0 0 16px",display:"flex",alignItems:"center",gap:8}}>
            📊 Avancement par projet
          </h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                <XAxis dataKey="name" tick={{fontSize:11,fill:"#5A5F80"}} axisLine={false} tickLine={false}/>
                <YAxis domain={[0,100]} tick={{fontSize:11,fill:"#5A5F80"}} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{background:"#111320",border:"1px solid rgba(255,255,255,0.08)",borderRadius:8,color:"#F0F2FF"}}/>
                <Bar dataKey="avancement" fill="#7B5EFF" radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{height:200,display:"flex",alignItems:"center",justifyContent:"center",color:"var(--text-3)",fontSize:13}}>
              Aucun projet à afficher
            </div>
          )}
        </div>

        {/* Pie statuts */}
        <div style={{background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:"var(--r12)",padding:20}}>
          <h3 style={{fontSize:13,fontWeight:700,color:"var(--text-1)",margin:"0 0 16px",display:"flex",alignItems:"center",gap:8}}>
            🥧 Statuts
          </h3>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value">
                    {pieData.map((entry,i)=><Cell key={i} fill={entry.color}/>)}
                  </Pie>
                  <Tooltip contentStyle={{background:"#111320",border:"1px solid rgba(255,255,255,0.08)",borderRadius:8,color:"#F0F2FF"}}/>
                </PieChart>
              </ResponsiveContainer>
              <div style={{display:"flex",flexDirection:"column",gap:6,marginTop:10}}>
                {pieData.map(d=>(
                  <div key={d.name} style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:10,height:10,borderRadius:"50%",background:d.color,flexShrink:0}}/>
                    <span style={{fontSize:11,color:"var(--text-2)"}}>{d.name}</span>
                    <span style={{fontSize:11,fontWeight:600,color:"var(--text-1)",marginLeft:"auto"}}>{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{height:160,display:"flex",alignItems:"center",justifyContent:"center",color:"var(--text-3)",fontSize:13}}>
              Aucun projet
            </div>
          )}
        </div>
      </div>

      {/* Alertes risques */}
      {stats.criticalRisks > 0 && (
        <div style={{background:"rgba(226,75,74,0.08)",border:"1px solid rgba(226,75,74,0.25)",borderRadius:"var(--r12)",padding:"14px 18px",marginBottom:20}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <AlertTriangle size={18} style={{color:"#E24B4A"}}/>
              <div>
                <p style={{fontSize:13,fontWeight:700,color:"#E24B4A",margin:0}}>
                  {stats.criticalRisks} risque{stats.criticalRisks>1?"s":""} critique{stats.criticalRisks>1?"s":""} ouvert{stats.criticalRisks>1?"s":""}
                </p>
                <p style={{fontSize:11,color:"#E24B4A",opacity:0.7,margin:0}}>Nécessite une action immédiate</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Liste projets récents */}
      <div style={{background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:"var(--r12)",overflow:"hidden"}}>
        <div style={{padding:"14px 18px",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <h3 style={{fontSize:13,fontWeight:700,color:"var(--text-1)",margin:0}}>📁 Projets récents</h3>
          <Link href="/projects" style={{fontSize:12,color:"var(--primary-light)",textDecoration:"none",fontWeight:500}}>
            Voir tous →
          </Link>
        </div>
        {projects.length === 0 ? (
          <div style={{padding:"32px 18px",textAlign:"center"}}>
            <p style={{fontSize:13,color:"var(--text-3)",margin:"0 0 12px"}}>Aucun projet pour l'instant</p>
            <Link href="/guide" style={{fontSize:13,color:"var(--primary-light)",textDecoration:"none",fontWeight:500}}>
              + Créer votre premier projet
            </Link>
          </div>
        ) : projects.slice(0,5).map((p,i)=>{
          const s = STATUS_COLORS[p.status] ?? "#5A5F80"
          return (
            <div key={p.id} style={{padding:"12px 18px",
              borderBottom:i<projects.length-1?"1px solid rgba(255,255,255,0.04)":"none",
              display:"flex",alignItems:"center",gap:14,
              background:i%2===0?"transparent":"rgba(255,255,255,0.01)"}}>
              <span style={{fontSize:20,flexShrink:0}}>{p.icon??"🔧"}</span>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                  <p style={{fontSize:13,fontWeight:600,color:"var(--text-1)",margin:0,
                    whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{p.name}</p>
                  <span style={{fontSize:10,padding:"1px 7px",borderRadius:20,flexShrink:0,
                    background:`${s}18`,color:s,fontWeight:600}}>
                    {p.status==="active"?"Actif":p.status==="completed"?"Terminé":"Archivé"}
                  </span>
                </div>
                <div style={{height:4,background:"var(--border)",borderRadius:2,overflow:"hidden"}}>
                  <div style={{height:"100%",borderRadius:2,background:s,width:`${p.progress??0}%`}}/>
                </div>
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <p style={{fontSize:13,fontWeight:700,color:"var(--text-2)",margin:0}}>{p.progress??0}%</p>
                {p.budget && <p style={{fontSize:11,color:"var(--text-3)",margin:0}}>{(p.budget/1000).toFixed(0)}k€</p>}
              </div>
              <Link href={`/projects/${p.id}`}
                style={{padding:"6px 12px",background:"var(--primary-bg)",
                  border:"1px solid rgba(123,94,255,0.3)",borderRadius:"var(--r6)",
                  fontSize:11,fontWeight:600,color:"var(--primary-light)",textDecoration:"none"}}>
                Ouvrir
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}
