"use client"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LoginPage() {
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState("")
  const supabase = createClient()
  const router   = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError("")
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false) }
    else router.push("/dashboard")
  }

  const fieldStyle: React.CSSProperties = {
    width: "100%", padding: "11px 14px",
    background: "#0F1022",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 8,
    color: "#F0F2FF",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
    WebkitTextFillColor: "#F0F2FF",
  }

  return (
    <div style={{ minHeight:"100vh", background:"#0A0B14", display:"flex",
      flexDirection:"column", alignItems:"center", justifyContent:"center",
      padding:24, fontFamily:"'DM Sans',sans-serif", position:"relative", overflow:"hidden" }}>

      {/* Glows */}
      <div style={{ position:"absolute", top:"20%", left:"50%", transform:"translateX(-50%)",
        width:500, height:400, background:"radial-gradient(ellipse,rgba(123,94,255,0.12),transparent 70%)",
        pointerEvents:"none" }}/>
      <div style={{ position:"absolute", bottom:"15%", right:"25%", width:300, height:300,
        background:"radial-gradient(ellipse,rgba(78,168,255,0.06),transparent 70%)",
        pointerEvents:"none" }}/>

      {/* Logo */}
      <div style={{ textAlign:"center", marginBottom:36, position:"relative" }}>
        <div style={{ width:56, height:56, borderRadius:14,
          background:"linear-gradient(135deg,#7B5EFF,#5B3EDF)",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:26, fontWeight:800, color:"#fff", margin:"0 auto 16px",
          boxShadow:"0 0 40px rgba(123,94,255,0.35)" }}>P</div>
        <h1 style={{ fontSize:22, fontWeight:800, color:"#F0F2FF", margin:"0 0 6px" }}>PMO AI Studio</h1>
        <p style={{ fontSize:13, color:"#5A5F80", margin:0 }}>Le copilote IA des Chefs de Projet</p>
      </div>

      {/* Card */}
      <div style={{ width:"100%", maxWidth:420, background:"#111320",
        border:"1px solid rgba(255,255,255,0.08)", borderRadius:16,
        padding:"28px 32px", position:"relative" }}>
        <h2 style={{ fontSize:18, fontWeight:700, color:"#F0F2FF", margin:"0 0 24px" }}>Connexion</h2>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom:16 }}>
            <label style={{ display:"block", fontSize:12, fontWeight:600, color:"#9499C0",
              marginBottom:7, textTransform:"uppercase", letterSpacing:"0.05em" }}>Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
              required placeholder="votre@email.com" style={fieldStyle}
              onFocus={e=>e.target.style.borderColor="#7B5EFF"}
              onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.12)"}/>
          </div>

          <div style={{ marginBottom:20 }}>
            <label style={{ display:"block", fontSize:12, fontWeight:600, color:"#9499C0",
              marginBottom:7, textTransform:"uppercase", letterSpacing:"0.05em" }}>Mot de passe</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)}
              required placeholder="••••••••" style={fieldStyle}
              onFocus={e=>e.target.style.borderColor="#7B5EFF"}
              onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.12)"}/>
          </div>

          {error && (
            <div style={{ background:"rgba(226,75,74,0.1)", border:"1px solid rgba(226,75,74,0.3)",
              borderRadius:8, padding:"10px 14px", marginBottom:16,
              fontSize:13, color:"#E24B4A" }}>{error}</div>
          )}

          <button type="submit" disabled={loading}
            style={{ width:"100%", padding:"12px",
              background:"linear-gradient(135deg,#7B5EFF,#5B3EDF)", color:"#fff",
              border:"none", borderRadius:8, fontSize:14, fontWeight:600,
              cursor:loading?"wait":"pointer",
              boxShadow:"0 0 24px rgba(123,94,255,0.35)", opacity:loading?0.7:1 }}>
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <p style={{ textAlign:"center", marginTop:20, paddingTop:20,
          borderTop:"1px solid rgba(255,255,255,0.08)",
          fontSize:13, color:"#5A5F80", margin:"20px 0 0" }}>
          Pas de compte ?{" "}
          <Link href="/auth/register" style={{ color:"#9B84FF", fontWeight:600, textDecoration:"none" }}>
            Créer un compte
          </Link>
        </p>
      </div>

      <p style={{ marginTop:24, fontSize:12, color:"#5A5F80" }}>
        PMO AI Studio · PMBOK 7 · Propulsé par Claude AI
      </p>
    </div>
  )
}
