"use client"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

export default function BackButton({ href, label = "Retour" }: { href?: string; label?: string }) {
  const router = useRouter()
  return (
    <button onClick={() => href ? router.push(href) : router.back()}
      style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"6px 12px",
        background:"transparent", border:"1px solid var(--border)", borderRadius:"var(--r8)",
        fontSize:12, fontWeight:500, color:"var(--text-2)", cursor:"pointer", marginBottom:16 }}>
      <ArrowLeft size={13}/>
      {label}
    </button>
  )
}
