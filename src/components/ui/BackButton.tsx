"use client"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight } from "lucide-react"

interface NavButtonsProps {
  backHref?: string
  backLabel?: string
  nextHref?: string
  nextLabel?: string
}

export function NavButtons({ backHref, backLabel = "Retour", nextHref, nextLabel = "Suivant" }: NavButtonsProps) {
  const router = useRouter()
  const btnBase: React.CSSProperties = {
    display:"inline-flex", alignItems:"center", gap:7,
    padding:"8px 16px",
    borderRadius:"var(--r8)", fontSize:13, fontWeight:600,
    cursor:"pointer", transition:"all 0.15s",
    border:"1px solid var(--border)",
  }
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
      <button onClick={() => backHref ? router.push(backHref) : router.back()}
        style={{ ...btnBase, background:"var(--bg-card)", color:"var(--text-1)" }}
        onMouseEnter={e=>{ (e.currentTarget as any).style.borderColor="var(--primary)"; (e.currentTarget as any).style.color="var(--primary-light)" }}
        onMouseLeave={e=>{ (e.currentTarget as any).style.borderColor="var(--border)"; (e.currentTarget as any).style.color="var(--text-1)" }}>
        <ArrowLeft size={14}/> {backLabel}
      </button>
      {nextHref && (
        <button onClick={() => router.push(nextHref)}
          style={{ ...btnBase, background:"var(--primary-bg)", color:"var(--primary-light)", borderColor:"rgba(123,94,255,0.3)" }}
          onMouseEnter={e=>{ (e.currentTarget as any).style.background="var(--primary)"; (e.currentTarget as any).style.color="#fff" }}
          onMouseLeave={e=>{ (e.currentTarget as any).style.background="var(--primary-bg)"; (e.currentTarget as any).style.color="var(--primary-light)" }}>
          {nextLabel} <ArrowRight size={14}/>
        </button>
      )}
    </div>
  )
}

// Backward compat
export default function BackButton({ href, label = "← Retour" }: { href?: string; label?: string }) {
  const router = useRouter()
  return (
    <button onClick={() => href ? router.push(href) : router.back()}
      style={{ display:"inline-flex", alignItems:"center", gap:7, padding:"8px 16px",
        background:"var(--bg-card)", border:"1px solid var(--border)",
        borderRadius:"var(--r8)", fontSize:13, fontWeight:600,
        color:"var(--text-1)", cursor:"pointer", marginBottom:20, transition:"all 0.15s" }}
      onMouseEnter={e=>{ (e.currentTarget as any).style.borderColor="var(--primary)"; (e.currentTarget as any).style.color="var(--primary-light)" }}
      onMouseLeave={e=>{ (e.currentTarget as any).style.borderColor="var(--border)"; (e.currentTarget as any).style.color="var(--text-1)" }}>
      <ArrowLeft size={14}/> {label}
    </button>
  )
}
