"use client"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const register = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setLoading(true)
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: name } }
    })
    if (error) { setError(error.message); setLoading(false) }
    else setDone(true)
  }

  const inputStyle = { width:"100%", padding:"9px 12px", border:"1px solid var(--border)", borderRadius:"var(--r8)", fontSize:13, color:"var(--text-1)", background:"#fff", outline:"none", transition:"border-color 0.15s" }

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Inter',-apple-system,sans-serif" }}>
      <div style={{ width:420 }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ width:56, height:56, borderRadius:14, background:"linear-gradient(135deg,#185FA5,#3C3489)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, fontWeight:800, color:"#fff", margin:"0 auto 14px" }}>P</div>
          <h1 style={{ fontSize:22, fontWeight:700, color:"var(--text-1)", margin:"0 0 6px" }}>PMO AI Studio</h1>
          <p style={{ fontSize:13, color:"var(--text-2)" }}>Créez votre compte gratuitement</p>
        </div>
        <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:"var(--r16)", padding:"32px", boxShadow:"var(--sh-md)" }}>
          {done ? (
            <div style={{ textAlign:"center", padding:"20px 0" }}>
              <div style={{ fontSize:40, marginBottom:16 }}>📧</div>
              <h2 style={{ fontSize:18, fontWeight:600, color:"var(--text-1)", margin:"0 0 10px" }}>Vérifiez votre email</h2>
              <p style={{ fontSize:13, color:"var(--text-2)", lineHeight:1.6 }}>Un email de confirmation a été envoyé à <strong>{email}</strong>. Cliquez sur le lien pour activer votre compte.</p>
              <Link href="/auth/login" style={{ display:"inline-block", marginTop:20, color:"var(--primary)", fontSize:13, fontWeight:500 }}>← Retour à la connexion</Link>
            </div>
          ) : (
            <>
              <h2 style={{ fontSize:18, fontWeight:600, color:"var(--text-1)", margin:"0 0 24px" }}>Créer un compte</h2>
              <form onSubmit={register}>
                {[
                  { label:"Nom complet", type:"text", val:name, set:setName, ph:"Abdelhafid Touil" },
                  { label:"Email",       type:"email", val:email, set:setEmail, ph:"vous@exemple.com" },
                  { label:"Mot de passe",type:"password", val:password, set:setPassword, ph:"8 caractères min." },
                ].map(f => (
                  <div key={f.label} style={{ marginBottom:16 }}>
                    <label style={{ display:"block", fontSize:12, fontWeight:500, color:"var(--text-2)", marginBottom:6 }}>{f.label}</label>
                    <input type={f.type} value={f.val} onChange={e=>f.set(e.target.value)} required placeholder={f.ph}
                      style={inputStyle}
                      onFocus={e=>(e.target as any).style.borderColor="var(--primary)"}
                      onBlur={e=>(e.target as any).style.borderColor="var(--border)"}/>
                  </div>
                ))}
                {error && <div style={{ background:"var(--danger-bg)", border:"1px solid #fca5a5", borderRadius:"var(--r8)", padding:"10px 12px", fontSize:12, color:"var(--danger)", marginBottom:16 }}>{error}</div>}
                <button type="submit" disabled={loading}
                  style={{ width:"100%", padding:"10px", background:"var(--primary)", color:"#fff", border:"none", borderRadius:"var(--r8)", fontSize:14, fontWeight:600, cursor:"pointer", opacity:loading?0.7:1 }}>
                  {loading ? "Création..." : "Créer mon compte"}
                </button>
              </form>
              <p style={{ textAlign:"center", marginTop:20, fontSize:12, color:"var(--text-3)" }}>
                Déjà un compte ?{" "}
                <Link href="/auth/login" style={{ color:"var(--primary)", fontWeight:500, textDecoration:"none" }}>Se connecter</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
