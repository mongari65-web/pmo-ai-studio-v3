"use client"
import AppLayout from "@/components/layout/AppLayout"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useState, useRef } from "react"
import { Clock, ArrowLeft, ArrowRight, BookOpen, Tag, Edit3, Save, X, Check, Upload, Share2, Copy, ExternalLink } from "lucide-react"
import { ARTICLES, CATEGORIES } from "@/lib/blog-data"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

// ── Profil auteur ────────────────────────────────────────────────────────────
const AUTHOR_PROFILE = {
  name: "Abdelhafid TOUIL",
  title: "Chef de Projet Senior · PMP® · SAFe® 6 · DevOps Leader",
  company: "Atos France",
  linkedin: "https://www.linkedin.com/in/abdelhafid-touil",
  twitter: "https://twitter.com/AbdelhafidTouil",
  youtube: "https://youtube.com/@pmp-en-action",
  bio: "22 ans d'expérience en gestion de projets IT dans des organisations critiques (CEA, BNP Paribas, SNCF, Orange). Certifié PMP®, SAFe® 6, PRINCE2, DevOps Leader. Créateur de PMO AI Studio et de la chaîne YouTube 'PMP en Action'.",
  avatar: "AT",
  color: "#7B5EFF"
}

// ── Boutons de partage social ────────────────────────────────────────────────
function ShareButtons({ title, slug }: { title: string; slug: string }) {
  const [copied, setCopied] = useState(false)
  const url = `https://pmo-ai-studio-v3.vercel.app/blog/${slug}`
  const text = encodeURIComponent(`📊 ${title} — Par Abdelhafid TOUIL, PMP® #PMO #GestionProjet #PMBOK #PMP`)
  const urlEnc = encodeURIComponent(url)

  const SOCIALS = [
    { label:"LinkedIn",  color:"#0A66C2", bg:"rgba(10,102,194,0.12)",  icon:"in", href:`https://www.linkedin.com/sharing/share-offsite/?url=${urlEnc}` },
    { label:"X",         color:"#f1f5f9", bg:"rgba(241,245,249,0.1)",  icon:"𝕏",  href:`https://twitter.com/intent/tweet?text=${text}&url=${urlEnc}` },
    { label:"WhatsApp",  color:"#25D366", bg:"rgba(37,211,102,0.12)",  icon:"💬", href:`https://wa.me/?text=${text}%20${urlEnc}` },
    { label:"Telegram",  color:"#229ED9", bg:"rgba(34,158,217,0.12)",  icon:"✈️", href:`https://t.me/share/url?url=${urlEnc}&text=${text}` },
    { label:"Instagram", color:"#E1306C", bg:"rgba(225,48,108,0.12)",  icon:"📸", href:`https://www.instagram.com/` },
    { label:"Gmail",     color:"#EA4335", bg:"rgba(234,67,53,0.12)",   icon:"✉️", href:`https://mail.google.com/mail/?view=cm&su=${encodeURIComponent(title)}&body=${urlEnc}` },
    { label:"Facebook",  color:"#1877F2", bg:"rgba(24,119,242,0.12)",  icon:"f",  href:`https://www.facebook.com/sharer/sharer.php?u=${urlEnc}` },
  ]

  const copy = () => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
    toast.success("Lien copié !")
  }

  return (
    <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, padding:"14px 16px" }}>
      <div style={{ fontSize:12, fontWeight:700, color:"var(--text-1)", marginBottom:10, display:"flex", alignItems:"center", gap:6 }}>
        <Share2 size={13}/> Partager cet article
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
        {SOCIALS.map(s => (
          <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
            style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 10px", background:s.bg, border:`1px solid ${s.color}33`, borderRadius:8, textDecoration:"none", fontSize:12, fontWeight:600, color:s.color, transition:"opacity 0.15s" }}
            onMouseEnter={e=>(e.currentTarget as any).style.opacity="0.8"}
            onMouseLeave={e=>(e.currentTarget as any).style.opacity="1"}>
            <span style={{ width:20, textAlign:"center", fontWeight:900 }}>{s.icon}</span>
            {s.label}
          </a>
        ))}
        <button onClick={copy}
          style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 10px", background:copied?"rgba(34,197,94,0.1)":"var(--bg)", border:`1px solid ${copied?"#22c55e":"var(--border)"}`, borderRadius:8, fontSize:12, fontWeight:600, color:copied?"#22c55e":"var(--text-2)", cursor:"pointer", transition:"all 0.15s" }}>
          {copied ? <><Check size={13}/> Lien copié !</> : <><Copy size={13}/> Copier le lien</>}
        </button>
      </div>
    </div>
  )
}

// ── Profil auteur card ────────────────────────────────────────────────────────
function AuthorCard() {
  return (
    <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, padding:"14px 16px" }}>
      <div style={{ display:"flex", gap:10, marginBottom:10 }}>
        <img src="/author-avatar.jpg" alt="Abdelhafid TOUIL"
          style={{ width:44, height:44, borderRadius:"50%", border:`2px solid ${AUTHOR_PROFILE.color}66`, objectFit:"cover", flexShrink:0 }}
          onError={e => { (e.target as HTMLImageElement).style.display="none" }}/>
        <div>
          <div style={{ fontSize:13, fontWeight:700, color:"var(--text-1)" }}>{AUTHOR_PROFILE.name}</div>
          <div style={{ fontSize:10, color:"var(--text-3)", lineHeight:1.4 }}>{AUTHOR_PROFILE.title}</div>
        </div>
      </div>
      <p style={{ fontSize:11, color:"var(--text-3)", lineHeight:1.5, margin:"0 0 10px" }}>{AUTHOR_PROFILE.bio.slice(0,120)}...</p>
      <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
        <a href={AUTHOR_PROFILE.linkedin} target="_blank" rel="noopener noreferrer"
          style={{ display:"flex", alignItems:"center", gap:4, padding:"4px 10px", background:"rgba(10,102,194,0.1)", border:"1px solid rgba(10,102,194,0.3)", borderRadius:6, fontSize:10, fontWeight:600, color:"#0A66C2", textDecoration:"none" }}>
          in LinkedIn
        </a>
        <a href={AUTHOR_PROFILE.twitter} target="_blank" rel="noopener noreferrer"
          style={{ display:"flex", alignItems:"center", gap:4, padding:"4px 10px", background:"rgba(0,0,0,0.06)", border:"1px solid rgba(0,0,0,0.15)", borderRadius:6, fontSize:10, fontWeight:600, color:"var(--text-1)", textDecoration:"none" }}>
          𝕏 Twitter
        </a>
        <a href={AUTHOR_PROFILE.youtube} target="_blank" rel="noopener noreferrer"
          style={{ display:"flex", alignItems:"center", gap:4, padding:"4px 10px", background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.25)", borderRadius:6, fontSize:10, fontWeight:600, color:"#ef4444", textDecoration:"none" }}>
          ▶️ YouTube
        </a>
      </div>
    </div>
  )
}

// ── Éditeur d'image ───────────────────────────────────────────────────────────
function ImageEditor({ src, alt, caption, onUpdate }: { src:string; alt:string; caption:string; onUpdate:(src:string,caption:string)=>void }) {
  const [editing, setEditing] = useState(false)
  const [newCaption, setNewCaption] = useState(caption)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      onUpdate(ev.target?.result as string, newCaption)
      toast.success("Image mise à jour")
      setEditing(false)
    }
    reader.readAsDataURL(file)
  }

  if (!editing) return (
    <div style={{ margin:"20px 0", borderRadius:12, overflow:"hidden", border:"1px solid var(--border)", position:"relative", cursor:"pointer" }}
      onClick={() => setEditing(true)}>
      <img src={src} alt={alt} style={{ width:"100%", display:"block" }}
        onError={e => { (e.target as HTMLImageElement).style.display="none" }}/>
      <p style={{ fontSize:11, color:"var(--text-3)", textAlign:"center", padding:"8px 12px", background:"var(--bg-card)", margin:0 }}>{caption}</p>
      <div style={{ position:"absolute", top:8, right:8, background:"rgba(0,0,0,0.6)", borderRadius:6, padding:"4px 8px", fontSize:10, color:"#fff", display:"flex", alignItems:"center", gap:4 }}>
        <Edit3 size={10}/> Modifier
      </div>
    </div>
  )

  return (
    <div style={{ margin:"20px 0", border:"2px dashed rgba(123,94,255,0.4)", borderRadius:12, padding:16, background:"rgba(123,94,255,0.04)" }}>
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display:"none" }}/>
      <div style={{ display:"flex", gap:8, marginBottom:10 }}>
        <button onClick={() => fileRef.current?.click()}
          style={{ display:"flex", alignItems:"center", gap:5, padding:"7px 14px", background:"var(--primary)", color:"#fff", border:"none", borderRadius:7, fontSize:12, fontWeight:600, cursor:"pointer" }}>
          <Upload size={12}/> Changer l'image
        </button>
        <button onClick={() => setEditing(false)}
          style={{ padding:"7px 10px", background:"transparent", border:"1px solid var(--border)", borderRadius:7, cursor:"pointer", color:"var(--text-3)" }}>
          <X size={12}/>
        </button>
      </div>
      <div>
        <div style={{ fontSize:10, color:"var(--text-3)", marginBottom:4 }}>Légende</div>
        <input value={newCaption} onChange={e=>setNewCaption(e.target.value)}
          style={{ width:"100%", fontSize:11, border:"1px solid var(--border)", borderRadius:6, padding:"6px 8px", background:"var(--bg)", color:"var(--text-1)", boxSizing:"border-box" }}/>
      </div>
      <button onClick={() => { onUpdate(src, newCaption); setEditing(false) }}
        style={{ marginTop:8, padding:"6px 14px", background:"var(--primary)", color:"#fff", border:"none", borderRadius:6, fontSize:11, fontWeight:600, cursor:"pointer" }}>
        <Check size={11}/> Sauvegarder
      </button>
    </div>
  )
}

// ── Éditeur de texte bloc ─────────────────────────────────────────────────────
function EditableBlock({ content, onSave, style: blockStyle }: { content:string; onSave:(v:string)=>void; style?:React.CSSProperties }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(content)

  if (!editing) return (
    <div style={{ position:"relative", cursor:"text" }} onDoubleClick={() => setEditing(true)}>
      <div style={blockStyle}>{val}</div>
      <div style={{ position:"absolute", top:0, right:0, background:"rgba(123,94,255,0.1)", borderRadius:4, padding:"2px 6px", fontSize:9, color:"var(--primary-light)", opacity:0, transition:"opacity 0.15s" }}
        className="edit-hint">✏️ Double-clic pour modifier</div>
    </div>
  )

  return (
    <div>
      <textarea value={val} onChange={e=>setVal(e.target.value)} rows={4}
        style={{ width:"100%", fontSize:14, border:"2px solid var(--primary)", borderRadius:8, padding:"8px 10px", background:"var(--bg)", color:"var(--text-1)", resize:"vertical", boxSizing:"border-box", lineHeight:1.6, outline:"none" }}/>
      <div style={{ display:"flex", gap:6, marginTop:4 }}>
        <button onClick={() => { onSave(val); setEditing(false) }}
          style={{ display:"flex", alignItems:"center", gap:4, padding:"4px 12px", background:"var(--primary)", color:"#fff", border:"none", borderRadius:6, fontSize:11, fontWeight:600, cursor:"pointer" }}>
          <Check size={11}/> Sauvegarder
        </button>
        <button onClick={() => { setVal(content); setEditing(false) }}
          style={{ padding:"4px 8px", background:"transparent", border:"1px solid var(--border)", borderRadius:6, cursor:"pointer", color:"var(--text-3)", fontSize:11 }}>
          Annuler
        </button>
      </div>
    </div>
  )
}

// ── Contenu articles ──────────────────────────────────────────────────────────
const P: React.CSSProperties = { fontSize:14, color:"var(--text-2)", lineHeight:1.8, margin:"0 0 16px" }
const H2: React.CSSProperties = { fontSize:20, fontWeight:800, color:"var(--text-1)", margin:"32px 0 12px", paddingBottom:8, borderBottom:"2px solid var(--border)" }
const IMG_WRAP: React.CSSProperties = { margin:"20px 0", borderRadius:12, overflow:"hidden", border:"1px solid var(--border)" }
const IMG: React.CSSProperties = { width:"100%", display:"block" }
const IMG_CAP: React.CSSProperties = { fontSize:11, color:"var(--text-3)", textAlign:"center", padding:"8px 12px", background:"var(--bg-card)", margin:0 }
const ALERT_RED: React.CSSProperties = { background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:10, padding:"12px 16px", margin:"16px 0", fontSize:13, color:"var(--text-1)", lineHeight:1.6 }
const ALERT_GREEN: React.CSSProperties = { background:"rgba(34,197,94,0.08)", border:"1px solid rgba(34,197,94,0.3)", borderRadius:10, padding:"12px 16px", margin:"16px 0", fontSize:13, color:"var(--text-1)", lineHeight:1.6 }
const ALERT_ORANGE: React.CSSProperties = { background:"rgba(245,158,11,0.08)", border:"1px solid rgba(245,158,11,0.3)", borderRadius:10, padding:"12px 16px", margin:"16px 0", fontSize:13, color:"var(--text-1)", lineHeight:1.6 }
const TABLE_WRAP: React.CSSProperties = { margin:"16px 0 24px", borderRadius:10, overflow:"hidden", border:"1px solid var(--border)" }
const TABLE: React.CSSProperties = { width:"100%", borderCollapse:"collapse" }
const TH: React.CSSProperties = { padding:"10px 14px", textAlign:"left", fontSize:11, fontWeight:700, color:"var(--text-3)", textTransform:"uppercase", letterSpacing:"0.5px", borderBottom:"2px solid var(--border)", background:"var(--bg)" }
const TD: React.CSSProperties = { padding:"10px 14px", fontSize:12, color:"var(--text-2)", verticalAlign:"top" }

function ArticleEVM({ editMode, images, onImageUpdate }: any) {
  return (
    <div>
      <p style={P}>Imaginez : votre projet de rénovation de l'Hôtel Atlantis à Marrakech avance. Nous sommes en mai 2026. Le client vous demande un rapport. Vous ouvrez PMO AI Studio et vous voyez :</p>

      <ImageEditor src={images["evm-courbe-s"] || "/blog/images/evm-courbe-s.png"}
        alt="Courbe S EVM — Budget EVM Hôtel Atlantis"
        caption="📊 Courbe S EVM réelle — Rénovation Grand Hôtel Atlantis · PMO AI Studio — CPI 0.93, SPI 0.85, EAC 2.7M€"
        onUpdate={(src,cap) => onImageUpdate("evm-courbe-s", src, cap)}/>

      <div style={ALERT_RED}>
        <strong>⚠️ Alerte :</strong> CPI = 0.93 · SPI = 0.85 · EAC = 2.7M€ pour un BAC de 2.5M€ · CV = -70 700€ · SV = -172 500€
      </div>

      <h2 style={H2}>🔢 Les 6 indicateurs EVM que tout CP doit maîtriser</h2>

      <div style={TABLE_WRAP}>
        <table style={TABLE}>
          <thead>
            <tr>
              <th style={TH}>Indicateur</th><th style={TH}>Formule</th><th style={TH}>Interprétation</th><th style={TH}>Notre projet</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["CPI — Cost Perf. Index","EV / AC","< 1 = dépassement budget","0.93 🟡"],
              ["SPI — Schedule Perf. Index","EV / PV","< 1 = retard planning","0.85 🔴"],
              ["CV — Cost Variance","EV - AC","Négatif = surcoût","-70 700€ 🔴"],
              ["SV — Schedule Variance","EV - PV","Négatif = retard","-172 500€ 🔴"],
              ["EAC — Estimate at Completion","BAC / CPI","Prévision coût final","2.7M€ 🔴"],
              ["TCPI","(BAC-EV)/(BAC-AC)","Perf. nécessaire","1.05 🟡"],
            ].map(([ind,form,interp,val],i) => (
              <tr key={i} style={{ background:i%2===0?"var(--bg-card)":"var(--bg)", borderBottom:"1px solid var(--border)" }}>
                <td style={TD}><strong style={{ color:"var(--primary-light)" }}>{ind}</strong></td>
                <td style={TD}><code style={{ background:"rgba(123,94,255,0.1)", padding:"2px 6px", borderRadius:4, fontSize:12 }}>{form}</code></td>
                <td style={TD}>{interp}</td>
                <td style={TD}><strong>{val}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 style={H2}>📈 La Courbe S — Visualiser la performance en un coup d'œil</h2>
      <p style={P}>La courbe S est le graphique le plus puissant du management de projet. Elle affiche PV (planifié), EV (acquis) et AC (réel) sur la même timeline. L'écart entre les courbes révèle instantanément les problèmes.</p>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, margin:"16px 0 24px" }}>
        {[
          { color:"#3b82f6", label:"PV — Planned Value", desc:"Ce qui était prévu d'être fait. La baseline de référence." },
          { color:"#7B5EFF", label:"EV — Earned Value", desc:"La valeur du travail réellement accompli. Votre performance réelle." },
          { color:"#f59e0b", label:"AC — Actual Cost", desc:"Ce qui a été réellement dépensé. Supérieur à EV si CPI < 1." },
        ].map(k => (
          <div key={k.label} style={{ background:`${k.color}11`, border:`1px solid ${k.color}33`, borderRadius:10, padding:"12px 14px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
              <div style={{ width:20, height:4, borderRadius:2, background:k.color }}/>
              <strong style={{ fontSize:12, color:k.color }}>{k.label}</strong>
            </div>
            <p style={{ fontSize:11, color:"var(--text-3)", margin:0, lineHeight:1.5 }}>{k.desc}</p>
          </div>
        ))}
      </div>

      <h2 style={H2}>🎯 Les seuils d'alerte selon le PMI</h2>
      <div style={{ display:"flex", flexDirection:"column", gap:8, margin:"16px 0 24px" }}>
        {[
          { seuil:"CPI ≥ 1.0 et SPI ≥ 1.0", statut:"✅ VERT", desc:"Projet sous contrôle. Continuer le suivi normal.", color:"#22c55e" },
          { seuil:"0.9 ≤ CPI < 1.0 ou 0.9 ≤ SPI < 1.0", statut:"🟡 AMBRE", desc:"Attention requise. Analyser les causes et préparer un plan d'action.", color:"#f59e0b" },
          { seuil:"CPI < 0.9 ou SPI < 0.9", statut:"🔴 ROUGE", desc:"Action immédiate. Convoquer le CODIR, préparer un avenant.", color:"#ef4444" },
        ].map(r => (
          <div key={r.seuil} style={{ display:"flex", gap:12, padding:"12px 16px", background:`${r.color}11`, borderRadius:10, borderLeft:`4px solid ${r.color}` }}>
            <div style={{ flex:1 }}>
              <code style={{ fontSize:12, color:r.color, fontWeight:700 }}>{r.seuil}</code>
              <div style={{ fontSize:11, color:"var(--text-2)", marginTop:4 }}>{r.desc}</div>
            </div>
            <strong style={{ color:r.color, fontSize:13 }}>{r.statut}</strong>
          </div>
        ))}
      </div>

      <h2 style={H2}>💡 Cas réel : Hôtel Atlantis Marrakech — Mai 2026</h2>
      <ImageEditor src={images["evm-budget-detail"] || "/blog/images/evm-budget-detail.png"}
        alt="Dashboard Budget EVM détaillé" caption="💰 Budget EVM Hôtel Atlantis — Tous les indicateurs periode Mai 2026"
        onUpdate={(src,cap) => onImageUpdate("evm-budget-detail", src, cap)}/>

      {/* Schéma SVG diagnostic */}
      <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, padding:20, margin:"16px 0 24px", overflow:"auto" }}>
        <svg viewBox="0 0 600 180" style={{ width:"100%", maxWidth:600, display:"block", margin:"0 auto" }}>
          <text x="300" y="20" textAnchor="middle" fontFamily="Arial" fontSize="13" fontWeight="700" fill="#f1f5f9">Diagnostic EVM — Mai 2026 · Hôtel Atlantis 2.5M€</text>
          <line x1="60" y1="140" x2="560" y2="140" stroke="#1e293b" strokeWidth="1"/>
          {[
            { label:"BAC", val:2500000, max:2700000, color:"#64748b", x:80 },
            { label:"PV", val:1200000, max:2700000, color:"#3b82f6", x:180 },
            { label:"EV", val:985000, max:2700000, color:"#7B5EFF", x:280 },
            { label:"AC", val:1100000, max:2700000, color:"#f59e0b", x:380 },
            { label:"EAC", val:2700000, max:2700000, color:"#ef4444", x:480 },
          ].map(b => {
            const h = Math.max(4, Math.round((b.val/b.max)*100))
            return (
              <g key={b.label}>
                <rect x={b.x-20} y={140-h} width="40" height={h} rx="4" fill={b.color} opacity="0.8"/>
                <text x={b.x} y={135-h} textAnchor="middle" fontFamily="Arial" fontSize="10" fontWeight="700" fill={b.color}>
                  {b.val>=1000000?(b.val/1000000).toFixed(1)+"M€":(b.val/1000).toFixed(0)+"k€"}
                </text>
                <text x={b.x} y="155" textAnchor="middle" fontFamily="Arial" fontSize="11" fontWeight="600" fill="#94a3b8">{b.label}</text>
              </g>
            )
          })}
        </svg>
      </div>

      <div style={ALERT_ORANGE}>
        <strong>📋 Analyse :</strong> L'EAC dépasse le BAC de 200 000€. Le TCPI = 1.05 signifie que l'équipe doit être 5% plus efficace que prévu pour finir dans le budget.
      </div>

      <h2 style={H2}>🎯 5 actions concrètes quand CPI {"<"} 1</h2>
      {[
        { num:"1", icon:"🔍", title:"Analyser les causes racines", desc:"Identifier les WPs en dépassement via l'outil Work Packages. Chercher les écarts de productivité." },
        { num:"2", icon:"📊", title:"Recalculer l'EAC et préparer un avenant", desc:"EAC = BAC / CPI. Présenter les scénarios au commanditaire et documenter l'impact sur le VAC." },
        { num:"3", icon:"⚠️", title:"Mettre à jour le RAID", desc:"Transformer les causes de dépassement en risques formels avec plans de mitigation concrets." },
        { num:"4", icon:"📋", title:"Convoquer un CODIR d'urgence", desc:"Préparer le rapport CODIR avec PMO AI Studio. Présenter KPIs, risques critiques, décisions demandées." },
        { num:"5", icon:"🚀", title:"Plan de rattrapage — Crashing ou Fast-Tracking", desc:"Définir des jalons de contrôle intermédiaires. Appliquer le Crashing sur le chemin critique." },
      ].map(a => (
        <div key={a.num} style={{ display:"flex", gap:14, padding:"14px 0", borderBottom:"1px solid var(--border)" }}>
          <div style={{ width:36, height:36, borderRadius:"50%", background:"rgba(123,94,255,0.2)", border:"1px solid rgba(123,94,255,0.4)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>{a.icon}</div>
          <div>
            <strong style={{ fontSize:13, color:"var(--text-1)" }}>Étape {a.num} : {a.title}</strong>
            <p style={{ fontSize:12, color:"var(--text-3)", margin:"4px 0 0", lineHeight:1.5 }}>{a.desc}</p>
          </div>
        </div>
      ))}

      <div style={{ ...ALERT_GREEN, marginTop:24 }}>
        <strong>🤖 PMO AI Studio :</strong> Génère automatiquement CPI, SPI, EAC, TCPI et la courbe S dès que vous saisissez vos données budgétaires. Export rapport CODIR en 30 secondes.
      </div>
    </div>
  )
}

function ArticleDefault() {
  return (
    <div>
      <p style={P}>Cet article est en cours de rédaction. Revenez bientôt !</p>
      <div style={ALERT_GREEN}><strong>🚀 En attendant :</strong> Découvrez PMO AI Studio — 15 outils PMO générés par Claude AI en 30 secondes.</div>
    </div>
  )
}

// ── Page principale ───────────────────────────────────────────────────────────
export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>()
  const article = ARTICLES.find(a => a.slug === slug)
  const [editMode, setEditMode] = useState(false)
  const [images, setImages] = useState<Record<string,string>>({})
  const [saved, setSaved] = useState(false)

  if (!article) return (
    <AppLayout>
      <div style={{ padding:40, textAlign:"center" }}>
        <p style={{ color:"var(--text-2)" }}>Article introuvable</p>
        <Link href="/blog" style={{ color:"var(--primary-light)" }}>← Retour au blog</Link>
      </div>
    </AppLayout>
  )

  const cat     = CATEGORIES.find(c => c.id === article.category)
  const related = ARTICLES.filter(a => a.category === article.category && a.slug !== slug).slice(0,3)

  const onImageUpdate = (key:string, src:string, _cap:string) => {
    setImages(p => ({ ...p, [key]:src }))
    toast.success("Image mise à jour — cliquez Sauvegarder pour confirmer")
  }

  const saveChanges = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    toast.success("Modifications sauvegardées !")
    setEditMode(false)
  }

  const renderContent = () => {
    switch(slug) {
      case "evm-5-minutes-cpi-spi-eac-tcpi": return <ArticleEVM editMode={editMode} images={images} onImageUpdate={onImageUpdate}/>
      default: return <ArticleDefault/>
    }
  }

  return (
    <AppLayout>
      <div style={{ background:"var(--bg)", minHeight:"100%" }}>

        {/* Hero */}
        <div style={{ background:`linear-gradient(135deg,${article.color}15,${article.color}08)`, borderBottom:`1px solid ${article.color}30`, padding:"32px 24px 28px" }}>
          <div style={{ maxWidth:800, margin:"0 auto" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
              <Link href="/blog" style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:12, color:"var(--text-3)", textDecoration:"none" }}>
                <ArrowLeft size={13}/> Retour au blog
              </Link>
              {/* Bouton mode édition */}
              <div style={{ display:"flex", gap:6 }}>
                {editMode ? (
                  <>
                    <button onClick={saveChanges}
                      style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 14px", background:"#22c55e", color:"#fff", border:"none", borderRadius:7, fontSize:12, fontWeight:600, cursor:"pointer" }}>
                      <Save size={12}/> {saved?"Sauvegardé !":"Sauvegarder"}
                    </button>
                    <button onClick={() => setEditMode(false)}
                      style={{ padding:"6px 10px", background:"transparent", border:"1px solid var(--border)", borderRadius:7, cursor:"pointer", color:"var(--text-3)" }}>
                      <X size={12}/>
                    </button>
                  </>
                ) : (
                  <button onClick={() => setEditMode(true)}
                    style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 14px", background:"rgba(123,94,255,0.12)", border:"1px solid rgba(123,94,255,0.3)", borderRadius:7, fontSize:12, fontWeight:600, color:"var(--primary-light)", cursor:"pointer" }}>
                    <Edit3 size={12}/> Modifier l'article
                  </button>
                )}
              </div>
            </div>

            {editMode && (
              <div style={{ background:"rgba(123,94,255,0.08)", border:"1px solid rgba(123,94,255,0.2)", borderRadius:8, padding:"8px 12px", marginBottom:14, fontSize:11, color:"var(--primary-light)" }}>
                ✏️ Mode édition actif — Cliquez sur les images pour les remplacer · Double-cliquez sur le texte pour modifier
              </div>
            )}

            <div style={{ display:"flex", gap:8, marginBottom:14, flexWrap:"wrap" }}>
              <span style={{ fontSize:10, padding:"3px 10px", borderRadius:20, background:article.color, color:"#fff", fontWeight:700 }}>
                {cat?.emoji} {cat?.label}
              </span>
              {article.featured && <span style={{ fontSize:10, padding:"3px 10px", borderRadius:20, background:"rgba(245,158,11,0.2)", color:"#f59e0b", fontWeight:700 }}>⭐ À la une</span>}
              <span style={{ fontSize:10, padding:"3px 10px", borderRadius:20, background:"var(--bg-card)", color:"var(--text-3)", border:"1px solid var(--border)", display:"flex", alignItems:"center", gap:4 }}>
                <Clock size={10}/> {article.readTime} min
              </span>
            </div>
            <h1 style={{ fontSize:28, fontWeight:900, color:"var(--text-1)", margin:"0 0 12px", lineHeight:1.3 }}>
              <span style={{ fontSize:32, marginRight:10 }}>{article.emoji}</span>{article.title}
            </h1>
            <p style={{ fontSize:14, color:"var(--text-3)", margin:"0 0 16px", lineHeight:1.6 }}>{article.excerpt}</p>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, fontSize:12, color:"var(--text-3)", flexWrap:"wrap" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <img src="/author-avatar.jpg" alt="Abdelhafid TOUIL"
                  style={{ width:36, height:36, borderRadius:"50%", border:`2px solid ${article.color}66`, objectFit:"cover", flexShrink:0 }}
                  onError={e => { (e.target as HTMLImageElement).style.display="none" }}/>
                <div>
                  <div style={{ fontWeight:700, color:"var(--text-1)", fontSize:13 }}>{article.author}</div>
                  <div style={{ fontSize:11 }}>{new Date(article.date).toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"})}</div>
                </div>
                <a href={AUTHOR_PROFILE.linkedin} target="_blank" rel="noopener noreferrer"
                  style={{ padding:"3px 10px", background:"rgba(10,102,194,0.1)", border:"1px solid rgba(10,102,194,0.3)", borderRadius:20, fontSize:10, fontWeight:700, color:"#0A66C2", textDecoration:"none" }}>
                  in LinkedIn
                </a>
              </div>
              {/* Barre de partage inline dans le header */}
              <div style={{ display:"flex", alignItems:"center", gap:5, flexWrap:"wrap" }}>
                <span style={{ fontSize:10, color:"var(--text-3)", marginRight:2 }}>Partager :</span>
                {[
                  { bg:"#0A66C2", href:`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent("https://pmo-ai-studio-v3.vercel.app/blog/"+slug)}`, label:"LinkedIn",
                    svg:<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20"><path fill="#fff" d="M6.5 8.5H3v11h3.5v-11zm-1.75-1.5a2 2 0 110-4 2 2 0 010 4zM21 19.5h-3.5v-5.5c0-1.3-.9-2-1.8-2-1 0-1.7.8-1.7 2v5.5H10.5v-11H14v1.5c.5-.9 1.7-1.8 3-1.8 2.5 0 4 1.7 4 4.5v6.8z"/></svg> },
                  { bg:"#000000", href:`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title+" #PMO #PMP")}&url=${encodeURIComponent("https://pmo-ai-studio-v3.vercel.app/blog/"+slug)}`, label:"X/Twitter",
                    svg:<svg viewBox="0 0 24 24" width="20" height="20" fill="#fff"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
                  { bg:"#25D366", href:`https://wa.me/?text=${encodeURIComponent(article.title+" https://pmo-ai-studio-v3.vercel.app/blog/"+slug)}`, label:"WhatsApp",
                    svg:<svg viewBox="0 0 24 24" width="16" height="16" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg> },
                  { bg:"#229ED9", href:`https://t.me/share/url?url=${encodeURIComponent("https://pmo-ai-studio-v3.vercel.app/blog/"+slug)}&text=${encodeURIComponent(article.title)}`, label:"Telegram",
                    svg:<svg viewBox="0 0 24 24" width="16" height="16" fill="#fff"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg> },
                  { bg:"linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)", href:"https://www.instagram.com/", label:"Instagram",
                    svg:<svg viewBox="0 0 24 24" width="16" height="16" fill="#fff"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg> },
                  { bg:"#EA4335", href:`https://mail.google.com/mail/?view=cm&su=${encodeURIComponent(article.title)}&body=${encodeURIComponent("https://pmo-ai-studio-v3.vercel.app/blog/"+slug)}`, label:"Gmail",
                    svg:<svg viewBox="0 0 24 24" width="16" height="16"><path fill="#fff" d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 010 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/></svg> },
                ].map(s => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" title={s.label}
                    style={{ width:42, height:42, borderRadius:"50%", background:s.bg, display:"flex", alignItems:"center", justifyContent:"center", textDecoration:"none", transition:"transform 0.15s, box-shadow 0.15s", boxShadow:"0 2px 8px rgba(0,0,0,0.3)" }}
                    onMouseEnter={e=>{(e.currentTarget as any).style.transform="scale(1.2)";(e.currentTarget as any).style.boxShadow="0 4px 16px rgba(0,0,0,0.4)"}}
                    onMouseLeave={e=>{(e.currentTarget as any).style.transform="scale(1)";(e.currentTarget as any).style.boxShadow="0 2px 8px rgba(0,0,0,0.3)"}}>
                    {s.svg}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Contenu + Sidebar */}
        <div style={{ maxWidth:1100, margin:"0 auto", padding:"32px 24px", display:"grid", gridTemplateColumns:"1fr 280px", gap:32 }}>

          <article>
            {renderContent()}

            {/* CTA */}
            <div style={{ marginTop:40, background:"linear-gradient(135deg,rgba(123,94,255,0.12),rgba(34,197,94,0.08))", border:"1px solid rgba(123,94,255,0.3)", borderRadius:16, padding:"24px", textAlign:"center" }}>
              <div style={{ fontSize:28, marginBottom:10 }}>🚀</div>
              <h3 style={{ fontSize:18, fontWeight:800, color:"var(--text-1)", margin:"0 0 8px" }}>Pratiquez avec PMO AI Studio</h3>
              <p style={{ fontSize:13, color:"var(--text-3)", margin:"0 0 16px" }}>Générez votre EVM, RAID et Rapport CODIR en 30 secondes avec Claude AI</p>
              <Link href="/projects" style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"10px 24px", background:"var(--primary)", color:"#fff", borderRadius:9, textDecoration:"none", fontSize:13, fontWeight:700 }}>
                Essayer gratuitement <ArrowRight size={13}/>
              </Link>
            </div>

            {/* Tags */}
            <div style={{ marginTop:24, display:"flex", gap:6, flexWrap:"wrap" }}>
              {article.tags.map(t => (
                <span key={t} style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, padding:"4px 10px", borderRadius:8, background:"var(--bg-card)", color:"var(--text-3)", border:"1px solid var(--border)" }}>
                  <Tag size={10}/> {t}
                </span>
              ))}
            </div>

            {/* Partage bas de page */}
            <div style={{ marginTop:28, padding:"16px 20px", background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12 }}>
              <div style={{ fontSize:13, fontWeight:700, color:"var(--text-1)", marginBottom:12, display:"flex", alignItems:"center", gap:6 }}>
                <Share2 size={14}/> Cet article vous a plu ? Partagez-le !
              </div>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
                {/* LinkedIn */}
                <a href={"https://www.linkedin.com/sharing/share-offsite/?url="+encodeURIComponent("https://pmo-ai-studio-v3.vercel.app/blog/"+slug)} target="_blank" rel="noopener noreferrer" title="LinkedIn" style={{ width:42,height:42,borderRadius:"50%",background:"#0A66C2",display:"flex",alignItems:"center",justifyContent:"center",textDecoration:"none" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20"><path fill="#fff" d="M6.5 8.5H3v11h3.5v-11zm-1.75-1.5a2 2 0 110-4 2 2 0 010 4zM21 19.5h-3.5v-5.5c0-1.3-.9-2-1.8-2-1 0-1.7.8-1.7 2v5.5H10.5v-11H14v1.5c.5-.9 1.7-1.8 3-1.8 2.5 0 4 1.7 4 4.5v6.8z"/></svg>
                </a>
                {/* Twitter/X */}
                <a href={"https://twitter.com/intent/tweet?text="+encodeURIComponent("📊 "+article.title+" #PMO #PMP")+"&url="+encodeURIComponent("https://pmo-ai-studio-v3.vercel.app/blog/"+slug)} target="_blank" rel="noopener noreferrer" title="X/Twitter" style={{ width:42,height:42,borderRadius:"50%",background:"#000",display:"flex",alignItems:"center",justifyContent:"center",textDecoration:"none" }}>
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="#fff"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                {/* WhatsApp */}
                <a href={"https://wa.me/?text="+encodeURIComponent("📊 "+article.title+" — "+article.excerpt+" https://pmo-ai-studio-v3.vercel.app/blog/"+slug)} target="_blank" rel="noopener noreferrer" title="WhatsApp" style={{ width:42,height:42,borderRadius:"50%",background:"#25D366",display:"flex",alignItems:"center",justifyContent:"center",textDecoration:"none" }}>
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </a>
                {/* Telegram */}
                <a href={"https://t.me/share/url?url="+encodeURIComponent("https://pmo-ai-studio-v3.vercel.app/blog/"+slug)+"&text="+encodeURIComponent("📊 "+article.title+"

"+article.excerpt)} target="_blank" rel="noopener noreferrer" title="Telegram" style={{ width:42,height:42,borderRadius:"50%",background:"#229ED9",display:"flex",alignItems:"center",justifyContent:"center",textDecoration:"none" }}>
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="#fff"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                </a>
                {/* Instagram */}
                <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" title="Instagram" style={{ width:42,height:42,borderRadius:"50%",background:"linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)",display:"flex",alignItems:"center",justifyContent:"center",textDecoration:"none" }}>
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="#fff"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
                {/* Gmail */}
                <a href={"https://mail.google.com/mail/?view=cm&su="+encodeURIComponent("📊 "+article.title)+"&body="+encodeURIComponent("Bonjour,

Je partage avec vous cet article :

"+article.title+"

"+article.excerpt+"

Lire : https://pmo-ai-studio-v3.vercel.app/blog/"+slug+"

Cordialement,
Abdelhafid TOUIL, PMP®")} target="_blank" rel="noopener noreferrer" title="Gmail" style={{ width:42,height:42,borderRadius:"50%",background:"#EA4335",display:"flex",alignItems:"center",justifyContent:"center",textDecoration:"none" }}>
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="#fff"><path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 010 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/></svg>
                </a>
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside style={{ display:"flex", flexDirection:"column", gap:14 }}>

            {/* Sommaire */}
            <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, padding:"14px 16px", position:"sticky", top:20 }}>
              <h4 style={{ fontSize:12, fontWeight:700, color:"var(--text-1)", margin:"0 0 10px", display:"flex", alignItems:"center", gap:6 }}>
                <BookOpen size={13}/> Sommaire
              </h4>
              {["Les 6 indicateurs EVM","La Courbe S","Seuils d'alerte","Cas réel Hôtel Atlantis","5 actions concrètes","PMO AI Studio"].map((item,i) => (
                <div key={i} style={{ padding:"5px 0", borderBottom:"1px solid var(--border)", fontSize:11, color:"var(--text-3)", display:"flex", alignItems:"center", gap:6 }}>
                  <div style={{ width:16, height:16, borderRadius:"50%", background:"var(--primary-bg)", border:"1px solid rgba(123,94,255,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, color:"var(--primary-light)", flexShrink:0 }}>{i+1}</div>
                  {item}
                </div>
              ))}
            </div>

            {/* Partage social */}
            <ShareButtons title={article.title} slug={slug}/>

            {/* Auteur */}
            <AuthorCard/>

            {/* Articles liés */}
            {related.length > 0 && (
              <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, padding:"14px 16px" }}>
                <h4 style={{ fontSize:12, fontWeight:700, color:"var(--text-1)", margin:"0 0 10px" }}>📚 Articles liés</h4>
                {related.map(r => (
                  <Link key={r.slug} href={`/blog/${r.slug}`} style={{ textDecoration:"none", display:"block", padding:"8px 0", borderBottom:"1px solid var(--border)" }}>
                    <div style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
                      <span style={{ fontSize:16, flexShrink:0 }}>{r.emoji}</span>
                      <div>
                        <div style={{ fontSize:11, fontWeight:600, color:"var(--text-1)", lineHeight:1.3 }}>{r.title.slice(0,55)}...</div>
                        <div style={{ fontSize:10, color:"var(--text-3)", marginTop:2 }}>{r.readTime} min · {r.date}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* YouTube */}
            <div style={{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.25)", borderRadius:12, padding:"14px 16px", textAlign:"center" }}>
              <div style={{ fontSize:24, marginBottom:6 }}>▶️</div>
              <div style={{ fontSize:12, fontWeight:700, color:"var(--text-1)", marginBottom:4 }}>PMP en Action</div>
              <div style={{ fontSize:11, color:"var(--text-3)", marginBottom:10 }}>Tutoriels, Quiz PMP, Tips Agile</div>
              <a href={AUTHOR_PROFILE.youtube} target="_blank" rel="noopener noreferrer"
                style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"6px 14px", background:"#ef4444", color:"#fff", borderRadius:7, textDecoration:"none", fontSize:11, fontWeight:600 }}>
                ▶️ S'abonner
              </a>
            </div>
          </aside>
        </div>
      </div>
    </AppLayout>
  )
}
