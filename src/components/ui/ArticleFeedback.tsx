"use client"
import { useState } from "react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"

export default function ArticleFeedback({ slug }: { slug: string }) {
  const [rating, setRating]   = useState(0)
  const [hover, setHover]     = useState(0)
  const [comment, setComment] = useState("")
  const [sent, setSent]       = useState(false)
  const [sending, setSending] = useState(false)
  const supabase = createClient()

  const submit = async () => {
    if (!rating) { toast.error("Choisissez une note !"); return }
    setSending(true)
    try {
      await supabase.from("article_feedback").insert({
        slug, rating, comment: comment.trim() || null,
        created_at: new Date().toISOString()
      })
      setSent(true)
      toast.success("Merci pour votre retour ! ⭐")
    } catch {
      toast.success("Merci pour votre retour ! ⭐")
      setSent(true)
    } finally { setSending(false) }
  }

  const LABELS = ["","Décevant","Peut mieux faire","Bien","Très bien","Excellent !"]
  const COLORS = ["","#ef4444","#f97316","#f59e0b","#22c55e","#7B5EFF"]

  if (sent) return (
    <div style={{ marginTop:24, padding:"24px", background:"rgba(34,197,94,0.08)", border:"1px solid rgba(34,197,94,0.3)", borderRadius:14, textAlign:"center" }}>
      <div style={{ fontSize:40, marginBottom:8 }}>🎉</div>
      <div style={{ fontSize:16, fontWeight:700, color:"#22c55e", marginBottom:4 }}>Merci pour votre feedback !</div>
      <div style={{ fontSize:12, color:"var(--text-3)" }}>Votre avis nous aide à améliorer nos articles.</div>
      <div style={{ marginTop:12, display:"flex", justifyContent:"center", gap:4 }}>
        {[1,2,3,4,5].map(i => (
          <span key={i} style={{ fontSize:24, color:i<=rating?"#f59e0b":"#334155" }}>★</span>
        ))}
      </div>
    </div>
  )

  return (
    <div style={{ marginTop:24, padding:"20px 24px", background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:14 }}>
      <div style={{ fontSize:15, fontWeight:700, color:"var(--text-1)", marginBottom:4 }}>
        📝 Cet article vous a été utile ?
      </div>
      <div style={{ fontSize:12, color:"var(--text-3)", marginBottom:16 }}>
        Votre avis nous aide à améliorer le contenu PMO AI Studio
      </div>

      {/* Étoiles */}
      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:12 }}>
        {[1,2,3,4,5].map(i => (
          <button key={i}
            onClick={() => setRating(i)}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(0)}
            style={{ background:"none", border:"none", cursor:"pointer", padding:2, transition:"transform 0.1s", transform:(hover||rating)>=i?"scale(1.2)":"scale(1)" }}>
            <span style={{ fontSize:32, color:(hover||rating)>=i?"#f59e0b":"#334155", transition:"color 0.15s" }}>★</span>
          </button>
        ))}
        {(hover||rating) > 0 && (
          <span style={{ fontSize:13, fontWeight:600, color:COLORS[hover||rating], marginLeft:6 }}>
            {LABELS[hover||rating]}
          </span>
        )}
      </div>

      {/* Commentaire */}
      {rating > 0 && (
        <div style={{ marginBottom:12 }}>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Un commentaire ? Une suggestion d'amélioration ? (optionnel)"
            rows={3}
            style={{ width:"100%", fontSize:12, border:"1px solid var(--border)", borderRadius:8, padding:"8px 12px", background:"var(--bg)", color:"var(--text-1)", resize:"vertical", outline:"none", boxSizing:"border-box", lineHeight:1.5 }}/>
        </div>
      )}

      {rating > 0 && (
        <button onClick={submit} disabled={sending}
          style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 20px", background:"var(--primary)", color:"#fff", border:"none", borderRadius:8, fontSize:13, fontWeight:600, cursor:"pointer", opacity:sending?0.7:1 }}>
          {sending ? "Envoi..." : "✓ Envoyer mon avis"}
        </button>
      )}
    </div>
  )
}
