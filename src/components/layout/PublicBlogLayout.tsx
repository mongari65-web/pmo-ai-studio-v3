"use client"
import Link from "next/link"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export default function PublicBlogLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", color:"var(--text-1)" }}>
      {/* Navbar publique */}
      <nav style={{ position:"sticky", top:0, zIndex:100, background:"rgba(15,23,42,0.95)", backdropFilter:"blur(12px)", borderBottom:"1px solid var(--border)", padding:"0 24px", height:56, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <Link href="/" style={{ display:"flex", alignItems:"center", gap:10, textDecoration:"none" }}>
          <svg viewBox="0 0 32 32" width="32" height="32">
            <rect width="32" height="32" rx="7" fill="#0F172A"/>
            <circle cx="16" cy="13" r="6" fill="#7B5EFF"/>
            <text x="16" y="15.5" textAnchor="middle" fontFamily="Arial" fontSize="5" fontWeight="900" fill="#fff">PMO</text>
            <circle cx="7" cy="6" r="3" fill="#1e40af"/>
            <circle cx="25" cy="6" r="3" fill="#166534"/>
            <circle cx="6" cy="20" r="3" fill="#92400e"/>
            <circle cx="26" cy="20" r="3" fill="#991b1b"/>
            <circle cx="16" cy="26" r="3" fill="#5b21b6"/>
            <line x1="11" y1="9" x2="9" y2="8" stroke="#3b82f6" strokeWidth="1"/>
            <line x1="21" y1="9" x2="23" y2="8" stroke="#22c55e" strokeWidth="1"/>
            <line x1="11" y1="17" x2="8" y2="19" stroke="#f59e0b" strokeWidth="1"/>
            <line x1="21" y1="17" x2="24" y2="19" stroke="#ef4444" strokeWidth="1"/>
            <line x1="16" y1="19" x2="16" y2="23" stroke="#8b5cf6" strokeWidth="1"/>
          </svg>
          <span style={{ fontSize:15, fontWeight:800, color:"var(--text-1)" }}>PMO AI Studio</span>
          <span style={{ fontSize:10, padding:"2px 7px", borderRadius:20, background:"rgba(123,94,255,0.2)", color:"#a78bfa", fontWeight:700 }}>Blog</span>
        </Link>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <Link href="/blog" style={{ fontSize:13, color:"var(--text-3)", textDecoration:"none" }}>Articles</Link>
          {user ? (
            <Link href="/dashboard" style={{ padding:"6px 16px", background:"var(--primary)", color:"#fff", borderRadius:8, fontSize:12, fontWeight:600, textDecoration:"none" }}>
              Mon Dashboard →
            </Link>
          ) : (
            <>
              <Link href="/auth/login" style={{ fontSize:13, color:"var(--text-2)", textDecoration:"none" }}>Connexion</Link>
              <Link href="/auth/register" style={{ padding:"6px 16px", background:"var(--primary)", color:"#fff", borderRadius:8, fontSize:12, fontWeight:700, textDecoration:"none" }}>
                Essai gratuit →
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Bannière CTA pour visiteurs non connectés */}
      {!user && (
        <div style={{ background:"linear-gradient(135deg,rgba(123,94,255,0.15),rgba(34,197,94,0.1))", borderBottom:"1px solid rgba(123,94,255,0.2)", padding:"10px 24px", display:"flex", alignItems:"center", justifyContent:"center", gap:16, flexWrap:"wrap" }}>
          <span style={{ fontSize:12, color:"var(--text-2)" }}>🚀 <strong style={{ color:"var(--text-1)" }}>PMO AI Studio</strong> — Générez Gantt, RAID, Budget EVM en 30 secondes avec Claude AI</span>
          <Link href="/auth/register" style={{ padding:"5px 14px", background:"var(--primary)", color:"#fff", borderRadius:7, fontSize:11, fontWeight:700, textDecoration:"none", whiteSpace:"nowrap" }}>
            Démarrer gratuitement →
          </Link>
        </div>
      )}

      {/* Contenu */}
      <main>{children}</main>

      {/* Footer */}
      <footer style={{ borderTop:"1px solid var(--border)", padding:"24px", textAlign:"center", marginTop:40 }}>
        <div style={{ fontSize:12, color:"var(--text-3)", marginBottom:8 }}>
          © 2026 PMO AI Studio · Propulsé par Claude AI · standards de gestion de projet
        </div>
        <div style={{ display:"flex", gap:16, justifyContent:"center", flexWrap:"wrap" }}>
          {[["Blog","/blog"],["Dashboard","/dashboard"],["Tarifs","/#pricing"],["Contact","mailto:contact@pmoai.studio"]].map(([label,href]) => (
            <Link key={label} href={href} style={{ fontSize:11, color:"var(--text-3)", textDecoration:"none" }}>{label}</Link>
          ))}
        </div>
      </footer>
    </div>
  )
}
