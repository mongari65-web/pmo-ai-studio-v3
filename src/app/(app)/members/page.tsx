"use client"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import AppLayout from "@/components/layout/AppLayout"
import { Users, Share2, Crown, Eye, Edit3, Search, Mail, FolderOpen } from "lucide-react"
import Link from "next/link"

interface Member { id:string; email:string; full_name?:string; plan?:string; created_at:string }
interface SP { project_id:string; role:string; status:string; project?:{ name:string; icon?:string; color?:string } }

export default function MembersPage() {
  const [members,  setMembers]  = useState<Member[]>([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState("")
  const [sel, setSel]           = useState<Member|null>(null)
  const [sps, setSps]           = useState<SP[]>([])
  const [loadSps, setLoadSps]   = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetch("/api/share-projects").then(r=>r.json()).then(d=>{ setMembers(d.members??[]); setLoading(false) })
  }, [])

  const loadProjects = async (m: Member) => {
    setSel(m); setLoadSps(true)
    const { data } = await supabase.from("project_members").select("project_id,role,status").eq("email", m.email)
    if (data?.length) {
      const ids = data.map((d:any)=>d.project_id)
      const { data: projs } = await supabase.from("projects").select("id,name,icon,color").in("id",ids)
      setSps(data.map((d:any)=>({ ...d, project: projs?.find((p:any)=>p.id===d.project_id) })))
    } else setSps([])
    setLoadSps(false)
  }

  const revoke = async (projectId: string) => {
    if (!sel) return
    await supabase.from("project_members").delete().eq("project_id",projectId).eq("email",sel.email)
    setSps(prev=>prev.filter(p=>p.project_id!==projectId))
  }

  const planColor: Record<string,string> = { free:"#64748b", starter:"#3b82f6", pro:"#8b5cf6", premium:"#f59e0b" }
  const roleColor: Record<string,string> = { owner:"#f59e0b", editor:"#3b82f6", viewer:"#64748b" }
  const filtered = members.filter(m=>(m.full_name??m.email).toLowerCase().includes(search.toLowerCase())||m.email.toLowerCase().includes(search.toLowerCase()))

  return (
    <AppLayout>
      <div style={{ padding:"20px 24px 32px", background:"var(--bg)", minHeight:"100%", display:"flex", flexDirection:"column", gap:20 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <p style={{ fontSize:10, color:"var(--text-3)", textTransform:"uppercase", letterSpacing:"1px", margin:"0 0 4px" }}>// GESTION</p>
            <h1 style={{ fontSize:22, fontWeight:800, color:"var(--text-1)", margin:0 }}>Membres inscrits</h1>
            <p style={{ fontSize:13, color:"var(--text-3)", margin:"4px 0 0" }}>Gérez les accès et les partages de projets</p>
          </div>
          <Link href="/share" style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 18px", borderRadius:10, background:"linear-gradient(135deg,#1e40af,#3b82f6)", color:"#fff", textDecoration:"none", fontSize:13, fontWeight:700 }}>
            <Share2 size={14}/> Partager des projets
          </Link>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
          {[["Total",members.length,"var(--primary)"],["Premium",members.filter(m=>m.plan==="premium").length,"#f59e0b"],["Gratuit",members.filter(m=>!m.plan||m.plan==="free").length,"#64748b"]].map(([l,v,c]:any,i)=>(
            <div key={i} style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, padding:"14px 16px", textAlign:"center" }}>
              <div style={{ fontSize:28, fontWeight:900, color:c }}>{v}</div>
              <div style={{ fontSize:11, color:"var(--text-3)", marginTop:2 }}>{l}</div>
            </div>
          ))}
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
          <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:14, padding:"18px 20px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
              <Users size={16} color="var(--primary-light)"/>
              <h3 style={{ fontSize:14, fontWeight:700, color:"var(--text-1)", margin:0 }}>{filtered.length} membre(s)</h3>
            </div>
            <div style={{ position:"relative", marginBottom:12 }}>
              <Search size={13} style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"var(--text-3)" }}/>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher..."
                style={{ width:"100%", padding:"8px 10px 8px 30px", borderRadius:8, border:"1px solid var(--border)", background:"var(--bg)", color:"var(--text-1)", fontSize:13, outline:"none", boxSizing:"border-box" }}/>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:6, maxHeight:400, overflowY:"auto" }}>
              {loading && <p style={{ fontSize:12, color:"var(--text-3)", textAlign:"center", padding:"20px 0" }}>Chargement...</p>}
              {filtered.map(m=>(
                <button key={m.id} onClick={()=>loadProjects(m)}
                  style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:10, border:`1px solid ${sel?.id===m.id?"var(--primary)":"var(--border)"}`, background:sel?.id===m.id?"var(--primary-bg)":"transparent", cursor:"pointer", textAlign:"left" }}>
                  <div style={{ width:36, height:36, borderRadius:"50%", background:"linear-gradient(135deg,#1e40af,#3b82f6)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <span style={{ fontSize:14, fontWeight:700, color:"#fff" }}>{(m.full_name??m.email)[0].toUpperCase()}</span>
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:"var(--text-1)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{m.full_name??m.email}</div>
                    <div style={{ fontSize:11, color:"var(--text-3)" }}>{m.email}</div>
                  </div>
                  <span style={{ fontSize:10, padding:"2px 7px", borderRadius:5, background:(planColor[m.plan??"free"]??"#64748b")+"22", color:planColor[m.plan??"free"]??"#64748b", fontWeight:600, flexShrink:0 }}>
                    {m.plan??"free"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:14, padding:"18px 20px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
              <FolderOpen size={16} color="var(--primary-light)"/>
              <h3 style={{ fontSize:14, fontWeight:700, color:"var(--text-1)", margin:0 }}>
                {sel ? `Projets — ${sel.full_name??sel.email}` : "Sélectionnez un membre"}
              </h3>
            </div>
            {!sel && <div style={{ textAlign:"center", padding:"40px 20px", color:"var(--text-3)" }}><Users size={40} style={{ marginBottom:12, opacity:0.3 }}/><p style={{ fontSize:13 }}>Cliquez sur un membre</p></div>}
            {sel && loadSps && <p style={{ fontSize:12, color:"var(--text-3)", textAlign:"center", padding:"20px 0" }}>Chargement...</p>}
            {sel && !loadSps && sps.length===0 && (
              <div style={{ textAlign:"center", padding:"40px 20px", color:"var(--text-3)" }}>
                <FolderOpen size={36} style={{ marginBottom:12, opacity:0.3 }}/><p style={{ fontSize:13 }}>Aucun projet partagé</p>
                <Link href="/share" style={{ fontSize:12, color:"var(--primary-light)", textDecoration:"none" }}>+ Partager →</Link>
              </div>
            )}
            {sel && !loadSps && sps.length>0 && (
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {sps.map(sp=>(
                  <div key={sp.project_id} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:10, border:"1px solid var(--border)", background:"var(--bg)" }}>
                    <div style={{ width:32, height:32, borderRadius:8, background:sp.project?.color??"var(--primary)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:16 }}>{sp.project?.icon??"📁"}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13, fontWeight:600, color:"var(--text-1)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{sp.project?.name??sp.project_id}</div>
                      <div style={{ fontSize:11, color:roleColor[sp.role]??"#64748b", fontWeight:600 }}>{sp.role} • {sp.status}</div>
                    </div>
                    <button onClick={()=>revoke(sp.project_id)} style={{ padding:"4px 10px", borderRadius:6, border:"1px solid #ef444444", background:"rgba(239,68,68,0.08)", color:"#ef4444", fontSize:11, cursor:"pointer" }}>Révoquer</button>
                  </div>
                ))}
                <Link href="/share" style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"8px", borderRadius:8, border:"1px dashed var(--border)", color:"var(--text-3)", textDecoration:"none", fontSize:12, marginTop:4 }}>
                  <Share2 size={12}/> Partager plus
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
