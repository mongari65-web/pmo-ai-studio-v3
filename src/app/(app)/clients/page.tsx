"use client"
import { useState } from "react"
import AppLayout from "@/components/layout/AppLayout"
import BackButton from "@/components/ui/BackButton"
import { Users, Plus, Search, Building2, Mail, Phone, X, Check, Edit2, Trash2 } from "lucide-react"

type Client = {
  id:string; nom:string; secteur:string; contact:string;
  email:string; telephone:string; projets:number; ca:number; statut:"actif"|"inactif"
}

const SECTEURS = ["IT / Cloud","Finance","Industrie","Santé","Energie","Transport","Retail","Autre"]

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [search, setSearch] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [selected, setSelected] = useState<Client|null>(null)
  const [form, setForm] = useState<Partial<Client>>({statut:"actif",projets:0,ca:0})

  const filtered = clients.filter(c =>
    search===""||`${c.nom} ${c.secteur} ${c.contact}`.toLowerCase().includes(search.toLowerCase())
  )

  const save = () => {
    if (!form.nom) return
    if (selected) {
      setClients(p=>p.map(c=>c.id===selected.id?{...c,...form}as Client:c))
    } else {
      setClients(p=>[...p,{...form,id:Date.now().toString()}as Client])
    }
    setShowModal(false); setForm({statut:"actif",projets:0,ca:0}); setSelected(null)
  }

  const inp:React.CSSProperties={width:"100%",padding:"10px 14px",background:"var(--bg-card2)",border:"1px solid var(--border)",borderRadius:"var(--r8)",color:"var(--text-1)",fontSize:13,outline:"none",boxSizing:"border-box"}
  const lbl=(t:string)=><label style={{display:"block",fontSize:11,fontWeight:600,color:"var(--text-2)",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.05em"}}>{t}</label>

  return (
    <AppLayout>
      <div style={{padding:"24px 28px",background:"var(--bg)",minHeight:"100%"}}>
        <BackButton href="/dashboard" label="Dashboard"/>

        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:20}}>
          <div>
            <p style={{fontSize:10,color:"var(--text-3)",textTransform:"uppercase",letterSpacing:"1.5px",margin:"0 0 6px",display:"flex",alignItems:"center",gap:6}}>
              <span style={{width:16,height:1,background:"var(--primary)",display:"inline-block"}}/>// PORTFOLIO
            </p>
            <h1 style={{fontSize:22,fontWeight:800,color:"var(--text-1)",margin:"0 0 4px",display:"flex",alignItems:"center",gap:10}}>
              <Building2 size={22} style={{color:"var(--primary)"}}/> Clients ({clients.length})
            </h1>
            <p style={{fontSize:13,color:"var(--text-2)",margin:0}}>Gérez vos clients et associez-les à vos projets</p>
          </div>
          <button onClick={()=>{setSelected(null);setForm({statut:"actif",projets:0,ca:0});setShowModal(true)}}
            style={{display:"flex",alignItems:"center",gap:7,padding:"9px 18px",background:"linear-gradient(135deg,var(--primary),var(--primary-dark))",border:"none",borderRadius:"var(--r8)",fontSize:13,fontWeight:600,color:"#fff",cursor:"pointer",boxShadow:"0 0 20px var(--primary-glow)"}}>
            <Plus size={14}/> Ajouter un client
          </button>
        </div>

        {/* KPIs */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
          {[
            {label:"Total clients",value:clients.length,color:"var(--primary)"},
            {label:"Clients actifs",value:clients.filter(c=>c.statut==="actif").length,color:"#36B37E"},
            {label:"CA total",value:`${clients.reduce((a,c)=>a+c.ca,0).toLocaleString()}€`,color:"#FF991F"},
          ].map(k=>(
            <div key={k.label} style={{background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:"var(--r12)",padding:"16px 18px"}}>
              <p style={{fontSize:12,color:"var(--text-2)",margin:"0 0 6px"}}>{k.label}</p>
              <p style={{fontSize:28,fontWeight:800,color:k.color,margin:0}}>{k.value}</p>
            </div>
          ))}
        </div>

        {/* Recherche */}
        <div style={{position:"relative",maxWidth:360,marginBottom:16}}>
          <Search size={13} style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:"var(--text-3)"}}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher un client..."
            style={{width:"100%",paddingLeft:32,height:36,background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:"var(--r8)",fontSize:13,color:"var(--text-1)",outline:"none"}}/>
        </div>

        {/* Liste ou état vide */}
        {clients.length===0?(
          <div style={{textAlign:"center",padding:"80px 0"}}>
            <Building2 size={48} style={{color:"var(--text-3)",margin:"0 auto 16px",display:"block",opacity:0.3}}/>
            <p style={{fontSize:16,fontWeight:600,color:"var(--text-2)",margin:"0 0 8px"}}>Aucun client</p>
            <p style={{fontSize:13,color:"var(--text-3)",margin:"0 0 20px"}}>Ajoutez vos clients pour les associer à vos projets.</p>
            <button onClick={()=>setShowModal(true)}
              style={{padding:"10px 20px",background:"var(--primary)",border:"none",borderRadius:"var(--r8)",fontSize:13,fontWeight:600,color:"#fff",cursor:"pointer"}}>
              + Ajouter un client
            </button>
          </div>
        ):(
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
            {filtered.map(c=>(
              <div key={c.id} style={{background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:"var(--r12)",padding:18,transition:"border-color 0.15s"}}
                onMouseEnter={e=>(e.currentTarget as any).style.borderColor="var(--border-hover)"}
                onMouseLeave={e=>(e.currentTarget as any).style.borderColor="var(--border)"}>
                <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:12}}>
                  <div style={{width:44,height:44,borderRadius:"var(--r8)",background:"var(--primary-bg)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:700,color:"var(--primary-light)"}}>
                    {c.nom[0]}
                  </div>
                  <div style={{display:"flex",gap:5}}>
                    <button onClick={()=>{setSelected(c);setForm(c);setShowModal(true)}}
                      style={{padding:"4px 6px",background:"var(--bg)",border:"1px solid var(--border)",borderRadius:6,cursor:"pointer",color:"var(--text-3)"}}>
                      <Edit2 size={11}/>
                    </button>
                    <button onClick={()=>setClients(p=>p.filter(cl=>cl.id!==c.id))}
                      style={{padding:"4px 6px",background:"var(--bg)",border:"1px solid var(--border)",borderRadius:6,cursor:"pointer",color:"var(--danger)"}}>
                      <Trash2 size={11}/>
                    </button>
                  </div>
                </div>
                <h3 style={{fontSize:14,fontWeight:700,color:"var(--text-1)",margin:"0 0 4px"}}>{c.nom}</h3>
                <p style={{fontSize:12,color:"var(--text-3)",margin:"0 0 10px"}}>{c.secteur}</p>
                <div style={{display:"flex",flexDirection:"column",gap:5,marginBottom:12}}>
                  {c.contact&&<div style={{display:"flex",alignItems:"center",gap:6}}><Users size={11} style={{color:"var(--text-3)"}}/><span style={{fontSize:11,color:"var(--text-2)"}}>{c.contact}</span></div>}
                  {c.email&&<div style={{display:"flex",alignItems:"center",gap:6}}><Mail size={11} style={{color:"var(--text-3)"}}/><span style={{fontSize:11,color:"var(--text-2)"}}>{c.email}</span></div>}
                  {c.telephone&&<div style={{display:"flex",alignItems:"center",gap:6}}><Phone size={11} style={{color:"var(--text-3)"}}/><span style={{fontSize:11,color:"var(--text-2)"}}>{c.telephone}</span></div>}
                </div>
                <div style={{display:"flex",gap:8,paddingTop:10,borderTop:"1px solid var(--border)"}}>
                  <span style={{fontSize:11,color:"var(--text-3)"}}>{c.projets} projet{c.projets>1?"s":""}</span>
                  <span style={{fontSize:11,color:"#FF991F",fontWeight:600}}>{c.ca.toLocaleString()}€ CA</span>
                  <span style={{marginLeft:"auto",fontSize:10,padding:"1px 8px",borderRadius:20,background:c.statut==="actif"?"rgba(54,179,126,0.12)":"rgba(90,95,128,0.12)",color:c.statut==="actif"?"#36B37E":"var(--text-3)",fontWeight:600}}>
                    {c.statut==="actif"?"Actif":"Inactif"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal&&(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
            <div style={{background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:16,padding:28,width:"100%",maxWidth:460}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
                <h2 style={{fontSize:16,fontWeight:700,color:"var(--text-1)",margin:0}}>{selected?"Modifier":"Ajouter"} un client</h2>
                <button onClick={()=>setShowModal(false)} style={{background:"none",border:"none",color:"var(--text-3)",cursor:"pointer"}}><X size={18}/></button>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:13}}>
                <div>{lbl("Nom du client *")}<input value={form.nom??""} onChange={e=>setForm(p=>({...p,nom:e.target.value}))} placeholder="Acme Corp" style={inp} onFocus={e=>e.target.style.borderColor="#7B5EFF"} onBlur={e=>e.target.style.borderColor="var(--border)"}/></div>
                <div>{lbl("Secteur")}<select value={form.secteur??""} onChange={e=>setForm(p=>({...p,secteur:e.target.value}))} style={inp}><option value="">Sélectionner...</option>{SECTEURS.map(s=><option key={s}>{s}</option>)}</select></div>
                <div>{lbl("Contact principal")}<input value={form.contact??""} onChange={e=>setForm(p=>({...p,contact:e.target.value}))} placeholder="Prénom Nom" style={inp} onFocus={e=>e.target.style.borderColor="#7B5EFF"} onBlur={e=>e.target.style.borderColor="var(--border)"}/></div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                  <div>{lbl("Email")}<input type="email" value={form.email??""} onChange={e=>setForm(p=>({...p,email:e.target.value}))} style={inp} onFocus={e=>e.target.style.borderColor="#7B5EFF"} onBlur={e=>e.target.style.borderColor="var(--border)"}/></div>
                  <div>{lbl("Téléphone")}<input value={form.telephone??""} onChange={e=>setForm(p=>({...p,telephone:e.target.value}))} style={inp} onFocus={e=>e.target.style.borderColor="#7B5EFF"} onBlur={e=>e.target.style.borderColor="var(--border)"}/></div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                  <div>{lbl("Nb projets")}<input type="number" value={form.projets??0} onChange={e=>setForm(p=>({...p,projets:+e.target.value}))} style={inp}/></div>
                  <div>{lbl("CA (€)")}<input type="number" value={form.ca??0} onChange={e=>setForm(p=>({...p,ca:+e.target.value}))} style={inp}/></div>
                </div>
                <button onClick={save} style={{padding:"11px",background:"linear-gradient(135deg,var(--primary),var(--primary-dark))",color:"#fff",border:"none",borderRadius:"var(--r8)",fontSize:14,fontWeight:600,cursor:"pointer",boxShadow:"0 0 20px var(--primary-glow)"}}>
                  <Check size={14} style={{display:"inline",marginRight:6}}/>{selected?"Enregistrer":"Ajouter le client"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
