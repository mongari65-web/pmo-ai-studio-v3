"use client"
import { useState } from "react"
import AppLayout from "@/components/layout/AppLayout"
import BackButton from "@/components/ui/BackButton"
import { Settings, CheckCircle, XCircle, Save } from "lucide-react"

const MODELS = [
  "claude-sonnet-4-20250514 (recommandé)",
  "claude-haiku-4-5-20251001 (rapide)",
  "claude-opus-4-6 (puissant)",
]
const LANGS = ["Français","English","Español","Deutsch"]

const CONNECTORS = [
  { name:"Notion",          key:"notion",   status:"connected" },
  { name:"Gmail",           key:"gmail",    status:"connected" },
  { name:"Google Drive",    key:"gdrive",   status:"connected" },
  { name:"Google Calendar", key:"gcal",     status:"connected" },
  { name:"Stripe",          key:"stripe",   status:"disconnected" },
  { name:"Slack",           key:"slack",    status:"disconnected" },
  { name:"Jira",            key:"jira",     status:"disconnected" },
  { name:"GitHub",          key:"github",   status:"disconnected" },
]

export default function ConfigurationPage() {
  const [model, setModel] = useState(MODELS[0])
  const [lang,  setLang]  = useState(LANGS[0])
  const [saved, setSaved] = useState(false)

  const save = () => {
    setSaved(true)
    setTimeout(()=>setSaved(false), 2000)
  }

  const inp:React.CSSProperties={width:"100%",padding:"10px 14px",background:"var(--bg-card2)",border:"1px solid var(--border)",borderRadius:"var(--r8)",color:"var(--text-1)",fontSize:13,outline:"none"}

  return (
    <AppLayout>
      <div style={{padding:"24px 28px",background:"var(--bg)",minHeight:"100%"}}>
        <BackButton href="/dashboard" label="Dashboard"/>

        <div style={{marginBottom:24}}>
          <p style={{fontSize:10,color:"var(--text-3)",textTransform:"uppercase",letterSpacing:"1.5px",margin:"0 0 6px",display:"flex",alignItems:"center",gap:6}}>
            <span style={{width:16,height:1,background:"var(--primary)",display:"inline-block"}}/>// PARAMÈTRES
          </p>
          <h1 style={{fontSize:22,fontWeight:800,color:"var(--text-1)",margin:"0 0 4px",display:"flex",alignItems:"center",gap:10}}>
            <Settings size={22} style={{color:"var(--primary)"}}/> Configuration
          </h1>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>

          {/* Modèle IA */}
          <div style={{background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:"var(--r12)",padding:20}}>
            <h3 style={{fontSize:14,fontWeight:700,color:"var(--text-1)",margin:"0 0 16px",display:"flex",alignItems:"center",gap:8}}>
              🤖 Modèle IA
            </h3>
            <div style={{marginBottom:14}}>
              <label style={{display:"block",fontSize:11,fontWeight:600,color:"var(--text-2)",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.05em"}}>MODÈLE CLAUDE</label>
              <select value={model} onChange={e=>setModel(e.target.value)} style={inp}>
                {MODELS.map(m=><option key={m}>{m}</option>)}
              </select>
            </div>
            <div style={{marginBottom:16}}>
              <label style={{display:"block",fontSize:11,fontWeight:600,color:"var(--text-2)",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.05em"}}>LANGUE</label>
              <select value={lang} onChange={e=>setLang(e.target.value)} style={inp}>
                {LANGS.map(l=><option key={l}>{l}</option>)}
              </select>
            </div>
            <div style={{padding:"10px 14px",background:"rgba(54,179,126,0.1)",border:"1px solid rgba(54,179,126,0.3)",borderRadius:"var(--r8)",marginBottom:16}}>
              <p style={{fontSize:12,color:"#36B37E",margin:0,display:"flex",alignItems:"center",gap:6}}>
                <CheckCircle size={13}/> API Claude connectée et opérationnelle
              </p>
            </div>
            <button onClick={save}
              style={{display:"flex",alignItems:"center",gap:7,padding:"10px 18px",background:saved?"#36B37E":"var(--primary)",border:"none",borderRadius:"var(--r8)",fontSize:13,fontWeight:600,color:"#fff",cursor:"pointer",transition:"background 0.3s"}}>
              <Save size={13}/>{saved?"Sauvegardé !":"Sauvegarder"}
            </button>
          </div>

          {/* Connecteurs */}
          <div style={{background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:"var(--r12)",padding:20}}>
            <h3 style={{fontSize:14,fontWeight:700,color:"var(--text-1)",margin:"0 0 16px",display:"flex",alignItems:"center",gap:8}}>
              🔗 Connecteurs MCP
            </h3>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {CONNECTORS.map(c=>(
                <div key={c.key} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",background:"var(--bg)",border:"1px solid var(--border)",borderRadius:"var(--r8)"}}>
                  <span style={{fontSize:13,color:"var(--text-1)",fontWeight:500}}>{c.name}</span>
                  <div style={{display:"flex",alignItems:"center",gap:5}}>
                    {c.status==="connected"
                      ?<><CheckCircle size={13} style={{color:"#36B37E"}}/><span style={{fontSize:11,color:"#36B37E",fontWeight:600}}>Connecté</span></>
                      :<><XCircle size={13} style={{color:"var(--text-3)"}}/><span style={{fontSize:11,color:"var(--text-3)"}}>Non configuré</span></>
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
