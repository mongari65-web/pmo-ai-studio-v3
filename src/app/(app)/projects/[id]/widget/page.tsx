"use client"
import { useState } from "react"
import { useParams } from "next/navigation"
import AppLayout from "@/components/layout/AppLayout"
import ToolLayout from "@/components/tools/ToolLayout"
import { useProject, useToolData } from "@/hooks/useProject"
import { Copy, Check, Code, Monitor, ExternalLink } from "lucide-react"
import { toast } from "sonner"

export default function WidgetPage() {
  const { id } = useParams<{ id:string }>()
  const { project } = useProject(id)
  const { data, history, loading, save, loadHistory } = useToolData(id, "widget")

  const [copied, setCopied]   = useState<string|null>(null)
  const [preview, setPreview] = useState(false)
  const [size, setSize]       = useState({ w:400, h:320 })

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://pmo-ai-studio-v3.vercel.app"
  const embedUrl = `${baseUrl}/embed/${id}`

  const iframeCode = `<iframe
  src="${embedUrl}"
  width="${size.w}"
  height="${size.h}"
  frameborder="0"
  style="border-radius:12px;box-shadow:0 4px 24px rgba(0,0,0,0.3);"
  title="${project?.name||"Projet"} — PMO Dashboard"
></iframe>`

  const htmlCode = `<!-- Widget PMO AI Studio — ${project?.name||"Projet"} -->
<div style="max-width:${size.w}px">
  ${iframeCode}
  <p style="font-size:11px;color:#64748b;text-align:center;margin-top:4px">
    Propulsé par <a href="${baseUrl}" target="_blank">PMO AI Studio</a>
  </p>
</div>`

  const markdownCode = `[![PMO Dashboard](${embedUrl})](${baseUrl}/projects/${id})`

  const copy = (text:string, key:string) => {
    navigator.clipboard.writeText(text)
    setCopied(key); setTimeout(()=>setCopied(null),2000)
    toast.success("Code copié !")
  }

  const SIZES = [
    { label:"Compact",   w:320, h:260 },
    { label:"Standard",  w:400, h:320 },
    { label:"Large",     w:520, h:400 },
    { label:"Full",      w:640, h:480 },
  ]

  const CodeBlock = ({ code, id: blockId, lang }: { code:string; id:string; lang:string }) => (
    <div style={{ position:"relative" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"6px 12px", background:"#0f172a", borderRadius:"8px 8px 0 0", border:"1px solid #1e293b" }}>
        <span style={{ fontSize:10, color:"#64748b", fontFamily:"monospace" }}>{lang}</span>
        <button onClick={() => copy(code, blockId)}
          style={{ display:"flex", alignItems:"center", gap:4, padding:"3px 8px", background:"transparent", border:"1px solid #1e293b", borderRadius:5, cursor:"pointer", color:copied===blockId?"#22c55e":"#64748b", fontSize:10 }}>
          {copied===blockId ? <><Check size={10}/> Copié</> : <><Copy size={10}/> Copier</>}
        </button>
      </div>
      <pre style={{ background:"#0a0f1a", borderRadius:"0 0 8px 8px", border:"1px solid #1e293b", borderTop:"none", padding:"12px", fontSize:11, color:"#e2e8f0", overflowX:"auto", margin:0, fontFamily:"monospace", lineHeight:1.6 }}>{code}</pre>
    </div>
  )

  return (
    <AppLayout>
      <ToolLayout title="Widget Embarquable" icon="🖼️" subtitle="// INTÉGRATION EXTERNE"
        history={history} onLoadHistory={loadHistory}
        projectName={project?.name}>

        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          {/* Taille widget */}
          <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, padding:"14px 16px" }}>
            <h3 style={{ fontSize:13, fontWeight:700, color:"var(--text-1)", margin:"0 0 12px" }}>📐 Taille du widget</h3>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {SIZES.map(s => (
                <button key={s.label} onClick={() => setSize({ w:s.w, h:s.h })}
                  style={{ padding:"6px 14px", borderRadius:8, fontSize:11, fontWeight:500, cursor:"pointer", border:"1px solid "+(size.w===s.w?"var(--primary)":"var(--border)"), background:size.w===s.w?"var(--primary-bg)":"transparent", color:size.w===s.w?"var(--primary-light)":"var(--text-3)" }}>
                  {s.label} <span style={{ fontSize:10, opacity:0.7 }}>({s.w}×{s.h})</span>
                </button>
              ))}
              <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                <input type="number" value={size.w} onChange={e=>setSize(p=>({...p,w:+e.target.value}))} min={200} max={800}
                  style={{ width:70, fontSize:11, border:"1px solid var(--border)", borderRadius:6, padding:"5px 7px", background:"var(--bg)", color:"var(--text-1)", textAlign:"center" }}/>
                <span style={{ fontSize:11, color:"var(--text-3)" }}>×</span>
                <input type="number" value={size.h} onChange={e=>setSize(p=>({...p,h:+e.target.value}))} min={150} max={600}
                  style={{ width:70, fontSize:11, border:"1px solid var(--border)", borderRadius:6, padding:"5px 7px", background:"var(--bg)", color:"var(--text-1)", textAlign:"center" }}/>
              </div>
            </div>
          </div>

          {/* Aperçu */}
          <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, padding:"14px 16px" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
              <h3 style={{ fontSize:13, fontWeight:700, color:"var(--text-1)", margin:0 }}>👁️ Aperçu du widget</h3>
              <div style={{ display:"flex", gap:6 }}>
                <a href={embedUrl} target="_blank" rel="noopener noreferrer"
                  style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 10px", border:"1px solid var(--border)", borderRadius:7, fontSize:11, color:"var(--text-2)", textDecoration:"none" }}>
                  <ExternalLink size={11}/> Ouvrir
                </a>
                <button onClick={() => setPreview(!preview)}
                  style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 10px", border:"1px solid "+(preview?"var(--primary)":"var(--border)"), borderRadius:7, fontSize:11, color:preview?"var(--primary-light)":"var(--text-2)", background:preview?"var(--primary-bg)":"transparent", cursor:"pointer" }}>
                  <Monitor size={11}/> {preview?"Masquer":"Afficher"} l'aperçu
                </button>
              </div>
            </div>
            {preview && (
              <div style={{ display:"flex", justifyContent:"center", padding:"16px", background:"#f1f5f9", borderRadius:8 }}>
                <iframe src={embedUrl} width={size.w} height={size.h} frameBorder={0}
                  style={{ borderRadius:12, boxShadow:"0 4px 24px rgba(0,0,0,0.2)" }}
                  title={project?.name+" — PMO Dashboard"}/>
              </div>
            )}
            {!preview && (
              <div style={{ padding:"20px", background:"var(--bg)", borderRadius:8, textAlign:"center", border:"2px dashed var(--border)" }}>
                <Monitor size={24} style={{ color:"var(--text-3)", margin:"0 auto 8px", display:"block" }}/>
                <p style={{ fontSize:12, color:"var(--text-3)", margin:0 }}>Cliquez sur "Afficher l'aperçu" pour voir le widget</p>
                <p style={{ fontSize:10, color:"var(--text-3)", margin:"4px 0 0" }}>Taille : {size.w}×{size.h}px</p>
              </div>
            )}
          </div>

          {/* Codes d'intégration */}
          <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, padding:"14px 16px" }}>
            <h3 style={{ fontSize:13, fontWeight:700, color:"var(--text-1)", margin:"0 0 14px", display:"flex", alignItems:"center", gap:6 }}>
              <Code size={14}/> Codes d'intégration
            </h3>
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <div>
                <div style={{ fontSize:11, fontWeight:600, color:"var(--text-2)", marginBottom:6 }}>📄 HTML / SharePoint / Site web</div>
                <CodeBlock code={htmlCode} id="html" lang="html"/>
              </div>
              <div>
                <div style={{ fontSize:11, fontWeight:600, color:"var(--text-2)", marginBottom:6 }}>🔗 URL directe (PowerPoint / Teams)</div>
                <CodeBlock code={embedUrl} id="url" lang="url"/>
              </div>
              <div>
                <div style={{ fontSize:11, fontWeight:600, color:"var(--text-2)", marginBottom:6 }}>📝 Markdown (Notion / GitHub)</div>
                <CodeBlock code={markdownCode} id="md" lang="markdown"/>
              </div>
            </div>
          </div>

          {/* Guide */}
          <div style={{ background:"rgba(59,130,246,0.06)", border:"1px solid rgba(59,130,246,0.2)", borderRadius:10, padding:"12px 16px" }}>
            <p style={{ fontSize:12, fontWeight:700, color:"#3b82f6", margin:"0 0 8px" }}>📋 Comment l'utiliser ?</p>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
              {[
                { title:"PowerPoint / Teams", desc:"Collez l'URL dans Insertion → Contenu Web (Teams) ou comme lien dans un slide" },
                { title:"SharePoint / Intranet", desc:"Ajoutez un composant WebPart 'Contenu incorporé' et collez le code HTML" },
                { title:"Notion / GitHub", desc:"Collez le code Markdown ou utilisez le bloc /embed avec l'URL directe" },
              ].map(g => (
                <div key={g.title} style={{ fontSize:11, color:"var(--text-2)" }}>
                  <div style={{ fontWeight:700, color:"var(--text-1)", marginBottom:3 }}>{g.title}</div>
                  <div style={{ lineHeight:1.5, color:"var(--text-3)" }}>{g.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ToolLayout>
    </AppLayout>
  )
}
