"use client"
import { useState, useEffect } from "react"
import AppLayout from "@/components/layout/AppLayout"
import { createClient } from "@/lib/supabase/client"
import { Users, Plus, Search, Star, Mail, Phone, Calendar,
         BarChart2, ChevronDown, Loader2, Edit2, Trash2, X, Check } from "lucide-react"

type Ressource = {
  id: string
  nom: string
  prenom: string
  role: string
  email: string
  telephone?: string
  competences: string[]
  disponibilite: number // % dispo
  taux_journalier?: number
  statut: "disponible"|"occupe"|"conge"
  projet_actuel?: string
  note?: number // 1-5
}

const COMPETENCES_LIST = [
  "Chef de Projet","PMO","Architecte","Développeur","DevOps",
  "Data Engineer","UX/UI","Scrum Master","Business Analyst",
  "Expert Sécurité","Admin Système","Expert Cloud","Testeur QA"
]

const STATUT_CFG = {
  disponible: { label:"Disponible", color:"#36B37E", bg:"rgba(54,179,126,0.12)" },
  occupe:     { label:"Occupé",     color:"#FF991F", bg:"rgba(255,153,31,0.12)" },
  conge:      { label:"Congé",      color:"#E24B4A", bg:"rgba(226,75,74,0.12)" },
}

const MOCK: Ressource[] = [
  { id:"1", nom:"Touil", prenom:"Abdelhafid", role:"Chef de Projet Senior", email:"a.touil@atos.fr",
    telephone:"+33 6 XX XX XX XX", competences:["Chef de Projet","PMO","Scrum Master"],
    disponibilite:50, taux_journalier:650, statut:"occupe", projet_actuel:"Migration JBOSS EAP", note:5 },
  { id:"2", nom:"Martin", prenom:"Sophie", role:"Architecte Technique", email:"s.martin@client.fr",
    competences:["Architecte","Expert Cloud","DevOps"],
    disponibilite:100, taux_journalier:750, statut:"disponible", note:4 },
  { id:"3", nom:"Benali", prenom:"Karim", role:"Expert Sécurité", email:"k.benali@client.fr",
    competences:["Expert Sécurité","Admin Système"],
    disponibilite:0, taux_journalier:700, statut:"conge", note:4 },
  { id:"4", nom:"Dubois", prenom:"Marie", role:"Business Analyst", email:"m.dubois@client.fr",
    competences:["Business Analyst","UX/UI"],
    disponibilite:75, taux_journalier:580, statut:"disponible", projet_actuel:"Migration JBOSS EAP", note:3 },
]

export default function RessourcesPage() {
  const [ressources, setRessources] = useState<Ressource[]>(MOCK)
  const [search, setSearch] = useState("")
  const [filterStatut, setFilterStatut] = useState<string>("tous")
  const [filterComp, setFilterComp] = useState<string>("tous")
  const [showModal, setShowModal] = useState(false)
  const [selected, setSelected] = useState<Ressource|null>(null)
  const [form, setForm] = useState<Partial<Ressource>>({})

  const filtered = ressources.filter(r => {
    const matchSearch = search===""
      || `${r.prenom} ${r.nom} ${r.role}`.toLowerCase().includes(search.toLowerCase())
    const matchStatut = filterStatut==="tous" || r.statut===filterStatut
    const matchComp = filterComp==="tous" || r.competences.includes(filterComp)
    return matchSearch && matchStatut && matchComp
  })

  const openAdd = () => {
    setForm({ statut:"disponible", competences:[], disponibilite:100 })
    setSelected(null)
    setShowModal(true)
  }

  const openEdit = (r: Ressource) => {
    setForm({ ...r })
    setSelected(r)
    setShowModal(true)
  }

  const save = () => {
    if (!form.nom || !form.prenom || !form.role) return
    if (selected) {
      setRessources(prev => prev.map(r => r.id===selected.id ? {...r,...form} as Ressource : r))
    } else {
      setRessources(prev => [...prev, { ...form, id: Date.now().toString() } as Ressource])
    }
    setShowModal(false)
  }

  const remove = (id: string) => {
    if (confirm("Supprimer cette ressource ?"))
      setRessources(prev => prev.filter(r => r.id!==id))
  }

  // KPIs
  const total = ressources.length
  const dispo = ressources.filter(r=>r.statut==="disponible").length
  const occupe = ressources.filter(r=>r.statut==="occupe").length
  const avgDispo = Math.round(ressources.reduce((a,r)=>a+r.disponibilite,0)/Math.max(total,1))

  return (
    <AppLayout>
      <div style={{padding:"24px 28px", background:"var(--bg)", minHeight:"100%"}}>

        {/* Header */}
        <div style={{display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:20}}>
          <div>
            <p style={{fontSize:10, color:"var(--text-3)", textTransform:"uppercase", letterSpacing:"1.5px",
              margin:"0 0 6px", display:"flex", alignItems:"center", gap:6}}>
              <span style={{width:16, height:1, background:"var(--primary)", display:"inline-block"}}/>
              // RESSOURCES PMO
            </p>
            <h1 style={{fontSize:22, fontWeight:800, color:"var(--text-1)", margin:"0 0 4px",
              display:"flex", alignItems:"center", gap:10}}>
              <Users size={22} style={{color:"var(--primary)"}}/>
              Gestion des Ressources
            </h1>
            <p style={{fontSize:13, color:"var(--text-3)", margin:0}}>
              Annuaire équipe · Plan de charge · Compétences · Disponibilités
            </p>
          </div>
          <button onClick={openAdd}
            style={{display:"flex", alignItems:"center", gap:7, padding:"9px 18px",
              background:"linear-gradient(135deg,var(--primary),var(--primary-dark))",
              border:"none", borderRadius:"var(--r8)", fontSize:13, fontWeight:600,
              color:"#fff", cursor:"pointer", boxShadow:"0 0 20px var(--primary-glow)"}}>
            <Plus size={14}/> Ajouter une ressource
          </button>
        </div>

        {/* KPIs */}
        <div style={{display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:20}}>
          {[
            {label:"Total ressources", value:total, icon:"👥", color:"var(--primary)"},
            {label:"Disponibles",      value:dispo,  icon:"✅", color:"#36B37E"},
            {label:"Occupées",         value:occupe, icon:"🔵", color:"#FF991F"},
            {label:"Dispo moyenne",    value:`${avgDispo}%`, icon:"📊", color:"var(--blue)"},
          ].map(kpi=>(
            <div key={kpi.label} style={{background:"var(--bg-card)", border:"1px solid var(--border)",
              borderRadius:"var(--r12)", padding:"16px 18px"}}>
              <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8}}>
                <span style={{fontSize:13, color:"var(--text-2)"}}>{kpi.label}</span>
                <span style={{fontSize:20}}>{kpi.icon}</span>
              </div>
              <p style={{fontSize:28, fontWeight:800, color:kpi.color, margin:0}}>{kpi.value}</p>
            </div>
          ))}
        </div>

        {/* Filtres */}
        <div style={{display:"flex", gap:10, marginBottom:16, flexWrap:"wrap"}}>
          <div style={{position:"relative", flex:1, minWidth:200}}>
            <Search size={13} style={{position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"var(--text-3)"}}/>
            <input value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Rechercher une ressource..."
              style={{width:"100%", paddingLeft:32, height:36, background:"var(--bg-card)",
                border:"1px solid var(--border)", borderRadius:"var(--r8)",
                fontSize:13, color:"var(--text-1)"}}/>
          </div>
          <select value={filterStatut} onChange={e=>setFilterStatut(e.target.value)}
            style={{height:36, background:"var(--bg-card)", border:"1px solid var(--border)",
              borderRadius:"var(--r8)", fontSize:12, color:"var(--text-2)", padding:"0 12px"}}>
            <option value="tous">Tous les statuts</option>
            <option value="disponible">Disponible</option>
            <option value="occupe">Occupé</option>
            <option value="conge">Congé</option>
          </select>
          <select value={filterComp} onChange={e=>setFilterComp(e.target.value)}
            style={{height:36, background:"var(--bg-card)", border:"1px solid var(--border)",
              borderRadius:"var(--r8)", fontSize:12, color:"var(--text-2)", padding:"0 12px"}}>
            <option value="tous">Toutes les compétences</option>
            {COMPETENCES_LIST.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Cards ressources */}
        <div style={{display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14}}>
          {filtered.map(r=>{
            const s = STATUT_CFG[r.statut]
            return (
              <div key={r.id} style={{background:"var(--bg-card)", border:"1px solid var(--border)",
                borderRadius:"var(--r12)", overflow:"hidden", transition:"border-color 0.15s"}}
                onMouseEnter={e=>(e.currentTarget as any).style.borderColor="var(--border-hover)"}
                onMouseLeave={e=>(e.currentTarget as any).style.borderColor="var(--border)"}>

                {/* Card header */}
                <div style={{padding:"16px 18px 12px",
                  borderBottom:"1px solid var(--border)", display:"flex", alignItems:"flex-start", gap:12}}>
                  {/* Avatar */}
                  <div style={{width:44, height:44, borderRadius:"50%", flexShrink:0,
                    background:"linear-gradient(135deg,var(--primary),var(--primary-dark))",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:16, fontWeight:700, color:"#fff"}}>
                    {r.prenom[0]}{r.nom[0]}
                  </div>
                  <div style={{flex:1, minWidth:0}}>
                    <p style={{fontSize:14, fontWeight:700, color:"var(--text-1)", margin:"0 0 2px",
                      whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>
                      {r.prenom} {r.nom}
                    </p>
                    <p style={{fontSize:12, color:"var(--text-2)", margin:"0 0 6px"}}>{r.role}</p>
                    <span style={{fontSize:11, fontWeight:600, padding:"2px 8px", borderRadius:20,
                      background:s.bg, color:s.color}}>● {s.label}</span>
                  </div>
                  <div style={{display:"flex", gap:4}}>
                    <button onClick={()=>openEdit(r)}
                      style={{padding:"4px 6px", background:"var(--bg)", border:"1px solid var(--border)",
                        borderRadius:6, cursor:"pointer", color:"var(--text-3)"}}>
                      <Edit2 size={12}/>
                    </button>
                    <button onClick={()=>remove(r.id)}
                      style={{padding:"4px 6px", background:"var(--bg)", border:"1px solid var(--border)",
                        borderRadius:6, cursor:"pointer", color:"var(--danger)"}}>
                      <Trash2 size={12}/>
                    </button>
                  </div>
                </div>

                {/* Card body */}
                <div style={{padding:"12px 18px"}}>
                  {/* Disponibilité */}
                  <div style={{marginBottom:10}}>
                    <div style={{display:"flex", justifyContent:"space-between", marginBottom:4}}>
                      <span style={{fontSize:11, color:"var(--text-3)"}}>Disponibilité</span>
                      <span style={{fontSize:11, fontWeight:600,
                        color: r.disponibilite>50?"#36B37E":r.disponibilite>0?"#FF991F":"#E24B4A"}}>
                        {r.disponibilite}%
                      </span>
                    </div>
                    <div style={{height:5, background:"var(--border)", borderRadius:3, overflow:"hidden"}}>
                      <div style={{height:"100%", borderRadius:3, transition:"width 0.4s",
                        width:`${r.disponibilite}%`,
                        background: r.disponibilite>50
                          ? "linear-gradient(90deg,#36B37E,#57D9A3)"
                          : r.disponibilite>0
                          ? "linear-gradient(90deg,#FF991F,#FFB84D)"
                          : "#E24B4A"}}/>
                    </div>
                  </div>

                  {/* Infos */}
                  <div style={{display:"flex", flexDirection:"column", gap:5, marginBottom:10}}>
                    <div style={{display:"flex", alignItems:"center", gap:7}}>
                      <Mail size={11} style={{color:"var(--text-3)", flexShrink:0}}/>
                      <span style={{fontSize:11, color:"var(--text-2)", overflow:"hidden",
                        textOverflow:"ellipsis", whiteSpace:"nowrap"}}>{r.email}</span>
                    </div>
                    {r.taux_journalier && (
                      <div style={{display:"flex", alignItems:"center", gap:7}}>
                        <span style={{fontSize:11, color:"var(--text-3)"}}>💰</span>
                        <span style={{fontSize:11, color:"var(--text-2)"}}>{r.taux_journalier}€/jour</span>
                      </div>
                    )}
                    {r.projet_actuel && (
                      <div style={{display:"flex", alignItems:"center", gap:7}}>
                        <span style={{fontSize:11, color:"var(--text-3)"}}>📁</span>
                        <span style={{fontSize:11, color:"var(--primary-light)",
                          overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>
                          {r.projet_actuel}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Compétences */}
                  <div style={{display:"flex", flexWrap:"wrap", gap:4}}>
                    {r.competences.slice(0,3).map(c=>(
                      <span key={c} style={{fontSize:10, padding:"2px 7px",
                        background:"var(--primary-bg)", color:"var(--primary-light)",
                        borderRadius:20, fontWeight:500,
                        border:"1px solid rgba(123,94,255,0.2)"}}>
                        {c}
                      </span>
                    ))}
                    {r.competences.length>3 && (
                      <span style={{fontSize:10, padding:"2px 7px",
                        background:"var(--bg)", color:"var(--text-3)",
                        borderRadius:20, border:"1px solid var(--border)"}}>
                        +{r.competences.length-3}
                      </span>
                    )}
                  </div>

                  {/* Note */}
                  {r.note && (
                    <div style={{display:"flex", alignItems:"center", gap:3, marginTop:10}}>
                      {Array.from({length:5}).map((_,i)=>(
                        <Star key={i} size={11}
                          fill={i<r.note! ? "#FF991F" : "transparent"}
                          style={{color: i<r.note! ? "#FF991F" : "var(--border)"}}/>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {filtered.length===0 && (
          <div style={{textAlign:"center", padding:"60px 0", color:"var(--text-3)"}}>
            <Users size={40} style={{margin:"0 auto 12px", display:"block", opacity:0.3}}/>
            <p style={{fontSize:14}}>Aucune ressource trouvée</p>
          </div>
        )}

        {/* Modal ajout/édition */}
        {showModal && (
          <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", zIndex:200,
            display:"flex", alignItems:"center", justifyContent:"center", padding:24}}>
            <div style={{background:"var(--bg-card)", border:"1px solid var(--border)",
              borderRadius:16, padding:28, width:"100%", maxWidth:500,
              maxHeight:"85vh", overflowY:"auto"}}>

              <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20}}>
                <h2 style={{fontSize:16, fontWeight:700, color:"var(--text-1)", margin:0}}>
                  {selected ? "Modifier la ressource" : "Ajouter une ressource"}
                </h2>
                <button onClick={()=>setShowModal(false)}
                  style={{background:"none", border:"none", color:"var(--text-3)", cursor:"pointer"}}>
                  <X size={18}/>
                </button>
              </div>

              <div style={{display:"flex", flexDirection:"column", gap:14}}>
                {[
                  {label:"Prénom *", key:"prenom", type:"text", ph:"Jean"},
                  {label:"Nom *", key:"nom", type:"text", ph:"Dupont"},
                  {label:"Rôle *", key:"role", type:"text", ph:"Chef de Projet"},
                  {label:"Email", key:"email", type:"email", ph:"jean.dupont@email.fr"},
                  {label:"Téléphone", key:"telephone", type:"text", ph:"+33 6 XX XX XX XX"},
                  {label:"Taux journalier (€)", key:"taux_journalier", type:"number", ph:"600"},
                  {label:"Projet actuel", key:"projet_actuel", type:"text", ph:"Nom du projet"},
                ].map(({label,key,type,ph})=>(
                  <div key={key}>
                    <label style={{display:"block", fontSize:11, fontWeight:600,
                      color:"var(--text-2)", marginBottom:5, textTransform:"uppercase", letterSpacing:"0.05em"}}>
                      {label}
                    </label>
                    <input type={type} placeholder={ph}
                      value={(form as any)[key] ?? ""}
                      onChange={e=>setForm(p=>({...p,[key]:e.target.value}))}
                      style={{width:"100%", padding:"9px 12px", background:"var(--bg-card2)",
                        border:"1px solid var(--border)", borderRadius:"var(--r8)",
                        fontSize:13, color:"var(--text-1)"}}/>
                  </div>
                ))}

                {/* Statut */}
                <div>
                  <label style={{display:"block", fontSize:11, fontWeight:600, color:"var(--text-2)",
                    marginBottom:5, textTransform:"uppercase", letterSpacing:"0.05em"}}>Statut</label>
                  <div style={{display:"flex", gap:8}}>
                    {(["disponible","occupe","conge"] as const).map(s=>{
                      const cfg = STATUT_CFG[s]
                      return (
                        <button key={s} onClick={()=>setForm(p=>({...p,statut:s}))}
                          style={{flex:1, padding:"7px 4px", borderRadius:"var(--r8)", fontSize:11,
                            fontWeight:600, cursor:"pointer",
                            background: form.statut===s ? cfg.bg : "var(--bg)",
                            border:`1px solid ${form.statut===s ? cfg.color : "var(--border)"}`,
                            color: form.statut===s ? cfg.color : "var(--text-3)"}}>
                          {cfg.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Disponibilité */}
                <div>
                  <label style={{display:"block", fontSize:11, fontWeight:600, color:"var(--text-2)",
                    marginBottom:5, textTransform:"uppercase", letterSpacing:"0.05em"}}>
                    Disponibilité : {form.disponibilite ?? 100}%
                  </label>
                  <input type="range" min={0} max={100} step={5}
                    value={form.disponibilite ?? 100}
                    onChange={e=>setForm(p=>({...p,disponibilite:+e.target.value}))}
                    style={{width:"100%", accentColor:"var(--primary)"}}/>
                </div>

                {/* Compétences */}
                <div>
                  <label style={{display:"block", fontSize:11, fontWeight:600, color:"var(--text-2)",
                    marginBottom:8, textTransform:"uppercase", letterSpacing:"0.05em"}}>Compétences</label>
                  <div style={{display:"flex", flexWrap:"wrap", gap:6}}>
                    {COMPETENCES_LIST.map(comp=>{
                      const sel = (form.competences??[]).includes(comp)
                      return (
                        <button key={comp}
                          onClick={()=>setForm(p=>({...p, competences: sel
                            ? (p.competences??[]).filter(c=>c!==comp)
                            : [...(p.competences??[]),comp]
                          }))}
                          style={{fontSize:11, padding:"3px 10px", borderRadius:20,
                            cursor:"pointer", fontWeight:500,
                            background: sel ? "var(--primary-bg)" : "var(--bg)",
                            border:`1px solid ${sel ? "var(--primary)" : "var(--border)"}`,
                            color: sel ? "var(--primary-light)" : "var(--text-3)"}}>
                          {comp}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <button onClick={save}
                  style={{padding:"11px", background:"linear-gradient(135deg,var(--primary),var(--primary-dark))",
                    color:"#fff", border:"none", borderRadius:"var(--r8)", fontSize:14,
                    fontWeight:600, cursor:"pointer", marginTop:4,
                    boxShadow:"0 0 20px var(--primary-glow)"}}>
                  <Check size={14} style={{display:"inline", marginRight:6}}/>
                  {selected ? "Enregistrer" : "Ajouter la ressource"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
