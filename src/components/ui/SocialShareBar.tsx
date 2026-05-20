"use client"
import { Copy, Check } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

const BASE = "https://pmo-ai-studio-v3.vercel.app"

export default function SocialShareBar({ slug, title, excerpt }: { slug:string; title:string; excerpt:string }) {
  const [copied, setCopied] = useState(false)
  const url = BASE+"/blog/"+slug
  const txt = encodeURIComponent("📊 "+title+" #PMO #PMP #PMBOK")
  const urlE = encodeURIComponent(url)
  const msgWA = encodeURIComponent("📊 "+title+" — "+excerpt.slice(0,100)+"... "+url)
  const msgTG = encodeURIComponent("📊 "+title)
  const mailSu = encodeURIComponent("📊 "+title)
  const mailBody = encodeURIComponent("Article PMO : "+title+" — Lire : "+url)

  const copy = () => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(()=>setCopied(false),2000)
    toast.success("Lien copié !")
  }

  const LINKS = [
    { title:"LinkedIn",  bg:"#0A66C2", href:"https://www.linkedin.com/sharing/share-offsite/?url="+urlE,
      icon:<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20"><path fill="#fff" d="M6.5 8.5H3v11h3.5v-11zm-1.75-1.5a2 2 0 110-4 2 2 0 010 4zM21 19.5h-3.5v-5.5c0-1.3-.9-2-1.8-2-1 0-1.7.8-1.7 2v5.5H10.5v-11H14v1.5c.5-.9 1.7-1.8 3-1.8 2.5 0 4 1.7 4 4.5v6.8z"/></svg> },
    { title:"X/Twitter", bg:"#000",    href:"https://twitter.com/intent/tweet?text="+txt+"&url="+urlE,
      icon:<svg viewBox="0 0 24 24" width="20" height="20" fill="#fff"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
    { title:"WhatsApp",  bg:"#25D366", href:"https://wa.me/?text="+msgWA,
      icon:<svg viewBox="0 0 24 24" width="20" height="20" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg> },
    { title:"Telegram",  bg:"#229ED9", href:"https://t.me/share/url?url="+urlE+"&text="+msgTG,
      icon:<svg viewBox="0 0 24 24" width="20" height="20" fill="#fff"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg> },
    { title:"Instagram",  bg:"linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)", href:"https://www.instagram.com/",
      icon:<svg viewBox="0 0 24 24" width="20" height="20" fill="#fff"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg> },
    { title:"Gmail", bg:"#EA4335", href:"https://mail.google.com/mail/?view=cm&su="+mailSu+"&body="+mailBody,
      icon:<svg viewBox="0 0 24 24" width="20" height="20" fill="#fff"><path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 010 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/></svg> },
  ]

  return (
    <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
      {LINKS.map(s => (
        <a key={s.title} href={s.href} target="_blank" rel="noopener noreferrer" title={s.title}
          style={{ width:42, height:42, borderRadius:"50%", background:s.bg, display:"flex", alignItems:"center", justifyContent:"center", textDecoration:"none", flexShrink:0, boxShadow:"0 2px 8px rgba(0,0,0,0.25)", transition:"transform 0.15s" }}
          onMouseEnter={e=>(e.currentTarget as any).style.transform="scale(1.15)"}
          onMouseLeave={e=>(e.currentTarget as any).style.transform="scale(1)"}>
          {s.icon}
        </a>
      ))}
      <button onClick={copy} title="Copier le lien"
        style={{ width:42, height:42, borderRadius:"50%", background:copied?"#22c55e":"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0, transition:"all 0.15s" }}>
        {copied ? <Check size={18} color="#fff"/> : <Copy size={18} color="#94a3b8"/>}
      </button>
    </div>
  )
}
