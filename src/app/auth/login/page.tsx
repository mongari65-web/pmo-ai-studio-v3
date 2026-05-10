"use client"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const login = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false) }
    else router.push("/dashboard")
  }

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Inter',-apple-system,sans-serif" }}>
      <div style={{ width:400 }}>
        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ width:56, height:56, borderRadius:14, background:"linear-gradient(135deg,#185FA5,#3C3489)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, fontWeight:800, color:"#fff", margin:"0 auto 14px" }}>P</div>
          <h1 style={{ fontSize:22, fontWeight:700, color:"var(--text-1)", margin:"0 0 6px" }}>PMO AI Studio</h1>
          <p style={{ fontSize:13, color:"var(--text-2)" }}>Le copilote IA des Chefs de Projet</p>
        </div>

        {/* Card */}
        <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:"var(--r16)", padding:"32px", boxShadow:"var(--sh-md)" }}>
          <h2 style={{ fontSize:18, fontWeight:600, color:"var(--text-1)", margin:"0 0 24px" }}>Connexion</h2>
          <form onSubmit={login}>
            <div style={{ marginBottom:16 }}>
              <label style={{ display:"block", fontSize:12, fontWeight:500, color:"var(--text-2)", marginBottom:6 }}>Email</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required
                placeholder="vous@exemple.com"
                style={{ width:"100%", padding:"9px 12px", border:"1px solid var(--border)", borderRadius:"var(--r8)", fontSize:13, color:"var(--text-1)", background:"#fff", outline:"none", transition:"border-color 0.15s" }}
                onFocus={e=>(e.target as any).style.borderColor="var(--primary)"}
                onBlur={e=>(e.target as any).style.borderColor="var(--border)"}/>
            </div>
            <div style={{ marginBottom:20 }}>
              <label style={{ display:"block", fontSize:12, fontWeight:500, color:"var(--text-2)", marginBottom:6 }}>Mot de passe</label>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required
                placeholder="••••••••"
                style={{ width:"100%", padding:"9px 12px", border:"1px solid var(--border)", borderRadius:"var(--r8)", fontSize:13, color:"var(--text-1)", background:"#fff", outline:"none", transition:"border-color 0.15s" }}
                onFocus={e=>(e.target as any).style.borderColor="var(--primary)"}
                onBlur={e=>(e.target as any).style.borderColor="var(--border)"}/>
            </div>
            {error && <div style={{ background:"var(--danger-bg)", border:"1px solid #fca5a5", borderRadius:"var(--r8)", padding:"10px 12px", fontSize:12, color:"var(--danger)", marginBottom:16 }}>{error}</div>}
            <button type="submit" disabled={loading}
              style={{ width:"100%", padding:"10px", background:"var(--primary)", color:"#fff", border:"none", borderRadius:"var(--r8)", fontSize:14, fontWeight:600, cursor:"pointer", transition:"background 0.15s", opacity:loading?0.7:1 }}
              onMouseEnter={e=>!loading&&((e.target as any).style.background="var(--primary-h)")}
              onMouseLeave={e=>((e.target as any).style.background="var(--primary)")}>
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>
          <p style={{ textAlign:"center", marginTop:20, fontSize:12, color:"var(--text-3)" }}>
            Pas de compte ?{" "}
            <Link href="/auth/register" style={{ color:"var(--primary)", fontWeight:500, textDecoration:"none" }}>Créer un compte</Link>
          </p>
        </div>
        <p style={{ textAlign:"center", marginTop:20, fontSize:11, color:"var(--text-3)" }}>
          PMO AI Studio · PMBOK 7 · Propulsé par Claude AI
        </p>
      </div>
    </div>
  )
}
