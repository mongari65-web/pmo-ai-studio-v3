"use client"
import { useParams } from "next/navigation"
import { useProject } from "@/hooks/useProject"
import AppLayout from "@/components/layout/AppLayout"
import Link from "next/link"
import { ArrowLeft, Users, Calendar, DollarSign, Tag, UserPlus, FileText } from "lucide-react"

const TOOLS = [
  { key:"wbs",          label:"WBS Dict",      icon:"🗂️",  desc:"Structure découpage",  color:"#185FA5" },
  { key:"workpackages", label:"Work Packages",  icon:"📦",  desc:"Lots de travaux",       color:"#3C3489" },
  { key:"gantt",        label:"Gantt",          icon:"📅",  desc:"Planning visuel",       color:"#639922" },
  { key:"jalons",       label:"Jalons",         icon:"🏁",  desc:"Étapes clés",           color:"#854F0B" },
  { key:"raid",         label:"RAID",           icon:"⚠️",  desc:"Risques & Actions",     color:"#A32D2D" },
  { key:"budget",       label:"Budget EVM",     icon:"💰",  desc:"Earned Value",          color:"#27500A" },
  { key:"mindmap",      label:"Mind Map",       icon:"🧠",  desc:"Carte mentale",         color:"#185FA5" },
  { key:"documents",    label:"Documents",      icon:"📄",  desc:"Bibliothèque",          color:"#475569" },
  { key:"pert",         label:"PERT",           icon:"🔀",  desc:"Chemin critique",       color:"#3C3489" },
]

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>()
  const { project, loading } = useProject(id)

  if (loading) return <AppLayout><div style={{ padding:40, color:"var(--text-3)", textAlign:"center" }}>Chargement...</div></AppLayout>
  if (!project) return <AppLayout><div style={{ padding:40, color:"var(--text-2)" }}>Projet introuvable.</div></AppLayout>

  const color = project.color ?? "#185FA5"

  return (
    <AppLayout>
      <div style={{ background:"var(--bg)", minHeight:"100%" }}>

        {/* Bannière projet */}
        <div style={{ position:"relative", background:`linear-gradient(135deg, ${color}22 0%, ${color}10 100%)`, borderBottom:"1px solid var(--border)", padding:"20px 28px 16px", overflow:"hidden" }}>
          <div style={{ position:"absolute", right:-20, top:-20, width:120, height:120, borderRadius:"50%", background:`${color}08` }}/>
          <div style={{ position:"absolute", right:80, bottom:-40, width:80, height:80, borderRadius:"50%", background:`${color}06` }}/>

          <Link href="/dashboard" style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:11, color:"var(--text-2)", textDecoration:"none", marginBottom:12 }}>
            <ArrowLeft size={12}/> Tableau de bord
          </Link>

          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
            <div style={{ display:"flex", alignItems:"center", gap:14 }}>
              {/* Icône projet */}
              <div style={{ width:52, height:52, borderRadius:12, background:`${color}22`, border:`1.5px solid ${color}44`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, flexShrink:0 }}>
                {project.icon ?? "📋"}
              </div>
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                  <h1 style={{ fontSize:18, fontWeight:700, color:"var(--text-1)", margin:0 }}>{project.name}</h1>
                  <span style={{ fontSize:10, padding:"2px 8px", background:`${color}18`, color, border:`1px solid ${color}33`, borderRadius:20, fontWeight:600 }}>
                    {project.methodology ?? "PMI/PMBOK"}
                  </span>
                  <span style={{ fontSize:10, padding:"2px 8px", background:"#EAF3DE", color:"#27500A", border:"1px solid #C0DD97", borderRadius:20, fontWeight:600 }}>
                    ● En ligne
                  </span>
                </div>
                {project.description && (
                  <p style={{ fontSize:12, color:"var(--text-2)", margin:"0 0 8px", maxWidth:600, lineHeight:1.5 }}>{project.description}</p>
                )}
                <div style={{ display:"flex", gap:14, flexWrap:"wrap" }}>
                  {project.client && <span style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, color:"var(--text-2)" }}><Tag size={11}/> {project.client}</span>}
                  {project.start_date && <span style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, color:"var(--text-2)" }}><Calendar size={11}/> {new Date(project.start_date).toLocaleDateString("fr-FR")} → {project.end_date?new Date(project.end_date).toLocaleDateString("fr-FR"):"?"}</span>}
                  {project.budget>0 && <span style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, color:"#27500A", fontWeight:500 }}><DollarSign size={11}/> {parseFloat(project.budget).toLocaleString("fr-FR")} €</span>}
                  {project.team?.length>0 && <span style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, color:"var(--text-2)" }}><Users size={11}/> {project.team.length} membres</span>}
                </div>
              </div>
            </div>

            {/* Progress */}
            <div style={{ flexShrink:0, textAlign:"center" }}>
              <div style={{ position:"relative", width:64, height:64 }}>
                <svg viewBox="0 0 64 64" style={{ width:"100%", height:"100%", transform:"rotate(-90deg)" }}>
                  <circle cx="32" cy="32" r="26" fill="none" stroke="#e2e8f0" strokeWidth="5"/>
                  <circle cx="32" cy="32" r="26" fill="none" stroke={color} strokeWidth="5"
                    strokeDasharray={`${(project.completion??0)*1.633} 163.3`} strokeLinecap="round"/>
                </svg>
                <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:"var(--text-1)" }}>
                  {project.completion??0}%
                </div>
              </div>
              <p style={{ fontSize:10, color:"var(--text-3)", marginTop:4 }}>Avancement</p>
            </div>
          </div>
        </div>

        <div style={{ padding:"20px 28px" }}>
          {/* Actions */}
          <div style={{ display:"flex", justifyContent:"flex-end", gap:8, marginBottom:16 }}>
            <Link href={`/projects/${id}/report`} style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", background:"var(--primary-bg)", border:"1px solid #B5D4F4", borderRadius:"var(--r8)", fontSize:12, color:"var(--primary-t)", textDecoration:"none", fontWeight:500 }}>
              <FileText size={13}/> Rapport PDF
            </Link>
            <Link href={`/projects/${id}/members`} style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", background:"#fff", border:"1px solid var(--border)", borderRadius:"var(--r8)", fontSize:12, color:"var(--text-1)", textDecoration:"none" }}>
              <UserPlus size={13}/> Gérer les membres
            </Link>
          </div>

          {/* Tools grid */}
          <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:"var(--r12)", padding:20, marginBottom:16 }}>
            <p style={{ fontSize:11, fontWeight:600, color:"var(--text-2)", textTransform:"uppercase", letterSpacing:"0.8px", margin:"0 0 14px" }}>Outils PMO</p>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
              {TOOLS.map(tool => (
                <Link key={tool.key} href={`/projects/${id}/${tool.key}`} style={{ display:"block", textDecoration:"none", padding:"14px", background:"var(--bg)", border:"1px solid var(--border)", borderRadius:"var(--r8)", transition:"all 0.12s" }}
                  onMouseEnter={e=>{const el=e.currentTarget as any;el.style.borderColor=tool.color;el.style.background="#fff";el.style.boxShadow="var(--sh)"}}
                  onMouseLeave={e=>{const el=e.currentTarget as any;el.style.borderColor="var(--border)";el.style.background="var(--bg)";el.style.boxShadow="none"}}>
                  <div style={{ fontSize:22, marginBottom:8 }}>{tool.icon}</div>
                  <p style={{ fontSize:12, fontWeight:600, color:"var(--text-1)", margin:"0 0 2px" }}>{tool.label}</p>
                  <p style={{ fontSize:11, color:"var(--text-3)", margin:0 }}>{tool.desc}</p>
                </Link>
              ))}
            </div>
          </div>

          {/* Équipe */}
          {project.team?.length>0 && (
            <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:"var(--r12)", padding:"14px 20px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:10 }}>
                <Users size={13} style={{ color:"var(--text-2)" }}/>
                <p style={{ fontSize:11, fontWeight:600, color:"var(--text-2)", textTransform:"uppercase", letterSpacing:"0.8px", margin:0 }}>Équipe · {project.team.length} membres</p>
              </div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                {project.team.map((m:string) => (
                  <div key={m} style={{ display:"flex", alignItems:"center", gap:7, padding:"5px 10px", background:"var(--bg)", border:"1px solid var(--border)", borderRadius:20 }}>
                    <div style={{ width:22, height:22, borderRadius:"50%", background:"var(--primary-bg)", border:"1px solid #B5D4F4", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, color:"var(--primary-t)" }}>
                      {m.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontSize:11, color:"var(--text-1)" }}>{m}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
