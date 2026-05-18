"use client"
import { useState } from "react"
import AppLayout from "@/components/layout/AppLayout"
import BackButton from "@/components/ui/BackButton"
import { Briefcase, Zap, Loader2, Download, Copy, FileText } from "lucide-react"

const MISSION_TYPES = [
  "Chef de Projet","PMO","Scrum Master","Product Owner",
  "Architecte Solution","Architecte Technique","Expert Cloud",
  "DevOps / SRE","Data Engineer","Expert Sécurité","Consultant IT","Directeur de Projet",
]
const DURATIONS = ["1 mois","2 mois","3 mois","6 mois","9 mois","12 mois","18 mois","24 mois"]
const DOC_TYPES = [
  { key:"propale", icon:"📄", label:"Proposition commerciale", desc:"Offre complète avec contexte, approche et budget" },
  { key:"contrat", icon:"📝", label:"Contrat de prestation", desc:"Contrat de service freelance avec clauses juridiques" },
  { key:"lettre",  icon:"✉️",  label:"Lettre de mission",     desc:"Lettre formelle de cadrage de mission" },
  { key:"sow",     icon:"📋", label:"Statement of Work (SoW)", desc:"Document de périmètre détaillé style PMI" },
]

export default function PropalePage() {
  const [form, setForm] = useState({
    client:"", mission:MISSION_TYPES[0], tjm:"700", duration:DURATIONS[3],
    context:"", consultant:"", certifications:"PMP®, SAFe® 6", docType:"propale",
  })
  const [result, setResult] = useState("")
  const [loading, setLoading] = useState(false)

  const upd = (k: string, v: string) => setForm(p => ({...p, [k]: v}))

  const generate = async () => {
    setLoading(true); setResult("")
    const doc = DOC_TYPES.find(d => d.key === form.docType)

    const prompt = `Tu es expert en rédaction commerciale IT et juridique. Génère un(e) ${doc?.label} professionnel(le) en français.

Paramètres :
- Client : ${form.client || "Client à définir"}
- Type de mission : ${form.mission}
- Consultant : ${form.consultant || "Consultant Senior"}
- Certifications : ${form.certifications}
- TJM : ${form.tjm}€/jour HT
- Durée : ${form.duration}
- Contexte : ${form.context || "Mission de conseil IT en transformation digitale"}

Génère un document complet, professionnel, directement utilisable. Format Markdown structuré avec tous les éléments standards (en-tête, clauses, signatures le cas échéant).`

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514", max_tokens:1000,
          system:"Tu es expert en rédaction commerciale et juridique IT. Rédige des documents professionnels en français, complets et immédiatement utilisables.",
          messages:[{role:"user",content:prompt}]
        })
      })
      const data = await res.json()
      setResult(data.content?.[0]?.text ?? "Erreur lors de la génération")
    } catch(e:any) { setResult("Erreur : "+e.message) }
    finally { setLoading(false) }
  }

  const inp: React.CSSProperties = {
    width:"100%", padding:"10px 14px", background:"var(--bg-card2)",
    border:"1px solid var(--border)", borderRadius:"var(--r8)",
    color:"var(--text-1)", fontSize:13, outline:"none", boxSizing:"border-box",
  }
  const lbl = (t:string) => (
    <label style={{display:"block",fontSize:11,fontWeight:600,color:"var(--text-2)",
      marginBottom:6,textTransform:"uppercase",letterSpacing:"0.05em"}}>{t}</label>
  )

  return (
    <AppLayout>
      <div style={{padding:"24px 28px",background:"var(--bg)",minHeight:"100%"}}>
        <BackButton href="/dashboard" label="Dashboard"/>

        <div style={{marginBottom:24}}>
          <p style={{fontSize:10,color:"var(--text-3)",textTransform:"uppercase",letterSpacing:"1.5px",margin:"0 0 6px",display:"flex",alignItems:"center",gap:6}}>
            <span style={{width:16,height:1,background:"var(--primary)",display:"inline-block"}}/>
            // COMMERCIAL
          </p>
          <h1 style={{fontSize:22,fontWeight:800,color:"var(--text-1)",margin:"0 0 4px",display:"flex",alignItems:"center",gap:10}}>
            <Briefcase size={22} style={{color:"var(--primary)"}}/> Propale / Contrat
          </h1>
          <p style={{fontSize:13,color:"var(--text-2)",margin:0}}>
            Générez vos propositions commerciales, contrats et lettres de mission avec l'IA
          </p>
        </div>

        {/* Type de document */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:20}}>
          {DOC_TYPES.map(doc=>(
            <button key={doc.key} onClick={()=>upd("docType",doc.key)}
              style={{padding:"14px 12px",background:"var(--bg-card)",
                border:`1.5px solid ${form.docType===doc.key?"var(--primary)":"var(--border)"}`,
                borderRadius:"var(--r12)",cursor:"pointer",textAlign:"left" as const}}>
              <div style={{fontSize:22,marginBottom:6}}>{doc.icon}</div>
              <p style={{fontSize:12,fontWeight:700,color:form.docType===doc.key?"var(--primary-light)":"var(--text-1)",margin:"0 0 3px"}}>{doc.label}</p>
              <p style={{fontSize:11,color:"var(--text-3)",margin:0,lineHeight:1.4}}>{doc.desc}</p>
            </button>
          ))}
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>

          {/* Formulaire */}
          <div style={{background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:"var(--r12)",padding:20}}>
            <h3 style={{fontSize:14,fontWeight:700,color:"var(--text-1)",margin:"0 0 16px",display:"flex",alignItems:"center",gap:8}}>
              🎯 Paramètres
            </h3>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div>{lbl("Client")}<input value={form.client} onChange={e=>upd("client",e.target.value)} placeholder="Nom du client..." style={inp} onFocus={e=>e.target.style.borderColor="#7B5EFF"} onBlur={e=>e.target.style.borderColor="var(--border)"}/></div>
              <div>{lbl("Consultant")}<input value={form.consultant} onChange={e=>upd("consultant",e.target.value)} placeholder="Votre nom..." style={inp} onFocus={e=>e.target.style.borderColor="#7B5EFF"} onBlur={e=>e.target.style.borderColor="var(--border)"}/></div>
              <div>{lbl("Type de mission")}
                <select value={form.mission} onChange={e=>upd("mission",e.target.value)} style={inp}>
                  {MISSION_TYPES.map(m=><option key={m}>{m}</option>)}
                </select>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div>{lbl("TJM (€/jour)")} <input type="number" value={form.tjm} onChange={e=>upd("tjm",e.target.value)} style={inp} onFocus={e=>e.target.style.borderColor="#7B5EFF"} onBlur={e=>e.target.style.borderColor="var(--border)"}/></div>
                <div>{lbl("Durée")}
                  <select value={form.duration} onChange={e=>upd("duration",e.target.value)} style={inp}>
                    {DURATIONS.map(d=><option key={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div>{lbl("Certifications")}<input value={form.certifications} onChange={e=>upd("certifications",e.target.value)} placeholder="PMP®, SAFe® 6..." style={inp} onFocus={e=>e.target.style.borderColor="#7B5EFF"} onBlur={e=>e.target.style.borderColor="var(--border)"}/></div>
              <div>{lbl("Contexte de la mission")}
                <textarea value={form.context} onChange={e=>upd("context",e.target.value)}
                  placeholder="Décrire le contexte, les enjeux, les objectifs..."
                  rows={4} style={{...inp,resize:"vertical"}}
                  onFocus={e=>(e.target as any).style.borderColor="#7B5EFF"}
                  onBlur={e=>(e.target as any).style.borderColor="var(--border)"}/>
              </div>
              <button onClick={generate} disabled={loading}
                style={{padding:"12px",background:"linear-gradient(135deg,#FF991F,#E67E00)",
                  border:"none",borderRadius:"var(--r8)",fontSize:13,fontWeight:700,
                  color:"#fff",cursor:loading?"wait":"pointer",
                  display:"flex",alignItems:"center",justifyContent:"center",gap:8,
                  boxShadow:"0 0 20px rgba(255,153,31,0.3)",opacity:loading?0.7:1}}>
                {loading?<><Loader2 size={14} style={{animation:"spin 1s linear infinite"}}/>Génération...</>
                        :<><Zap size={14}/>Générer {DOC_TYPES.find(d=>d.key===form.docType)?.label}</>}
              </button>
            </div>
          </div>

          {/* Résultat */}
          <div style={{background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:"var(--r12)",overflow:"hidden",display:"flex",flexDirection:"column",minHeight:500}}>
            <div style={{padding:"14px 18px",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <p style={{fontSize:13,fontWeight:600,color:"var(--text-1)",margin:0}}>📄 Document généré</p>
              {result && (
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>navigator.clipboard.writeText(result)}
                    style={{display:"flex",alignItems:"center",gap:5,padding:"5px 10px",background:"var(--bg)",border:"1px solid var(--border)",borderRadius:"var(--r6)",fontSize:11,color:"var(--text-2)",cursor:"pointer"}}>
                    <Copy size={11}/> Copier
                  </button>
                  <button onClick={()=>{const b=new Blob([result],{type:"text/plain"});const u=URL.createObjectURL(b);const a=document.createElement("a");a.href=u;a.download="document.md";a.click()}}
                    style={{display:"flex",alignItems:"center",gap:5,padding:"5px 10px",background:"var(--primary-bg)",border:"1px solid rgba(123,94,255,0.3)",borderRadius:"var(--r6)",fontSize:11,color:"var(--primary-light)",cursor:"pointer"}}>
                    <Download size={11}/> .md
                  </button>
                </div>
              )}
            </div>
            <div style={{flex:1,overflowY:"auto",padding:18}}>
              {loading ? (
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",gap:12}}>
                  <Loader2 size={32} style={{color:"var(--primary)",animation:"spin 1s linear infinite"}}/>
                  <p style={{fontSize:13,color:"var(--text-2)"}}>Génération en cours...</p>
                </div>
              ) : result ? (
                <pre style={{fontSize:12,color:"var(--text-1)",lineHeight:1.7,whiteSpace:"pre-wrap",fontFamily:"var(--font-body)",margin:0}}>{result}</pre>
              ) : (
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",gap:10}}>
                  <Briefcase size={40} style={{color:"var(--text-3)",opacity:0.3}}/>
                  <p style={{fontSize:13,color:"var(--text-3)"}}>Remplissez les paramètres et cliquez sur Générer</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </div>
    </AppLayout>
  )
}
