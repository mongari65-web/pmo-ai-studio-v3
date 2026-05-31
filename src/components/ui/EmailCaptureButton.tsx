"use client"
import { useState } from "react"
import { Mail, Send, X, Loader2 } from "lucide-react"

interface Props {
  captureId: string
  title: string
  projectName?: string
}

export default function EmailCaptureButton({ captureId, title, projectName }: Props) {
  const [open, setOpen]       = useState(false)
  const [to, setTo]           = useState("")
  const [step, setStep]       = useState<"form"|"capturing"|"sending"|"success"|"error">("form")
  const [error, setError]     = useState("")

  const handleSend = async () => {
    if (!to.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to.trim())) {
      setError("Email invalide"); return
    }
    setError("")
    setStep("capturing")

    try {
      const el = document.getElementById(captureId)
      if (!el) throw new Error("Élément non trouvé: " + captureId)

      const html2canvas = (await import("html2canvas")).default
      // Masquer temporairement la modal pendant la capture
      const modal = document.querySelector('[data-capture-modal]') as HTMLElement
      if (modal) modal.style.display = "none"
      const canvas = await html2canvas(el, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#0f172a",
        logging: false,
        windowWidth: el.scrollWidth,
        windowHeight: el.scrollHeight,
      })

      // Réafficher la modal
      if (modal) modal.style.display = ""
      const base64 = canvas.toDataURL("image/png").split(",")[1]
      const filename = `${title}${projectName ? "_" + projectName : ""}_${new Date().toLocaleDateString("fr-FR").replace(/\//g, "-")}.png`

      setStep("sending")

      const res = await fetch("/api/email/send-export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: to.trim(),
          subject: `${title}${projectName ? " — " + projectName : ""} | PMO AI Studio`,
          message: `Bonjour,\n\nVeuillez trouver ci-joint la capture "${title}"${projectName ? ` du projet "${projectName}"` : ""}.\n\nCe document a été généré par PMO AI Studio.\n\nCordialement`,
          filename,
          fileBase64: base64,
          mimeType: "image/png",
          toolType: title.toLowerCase().replace(/[^a-z]/g, ""),
          projectName,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Erreur envoi")
      setStep("success")
    } catch(e: any) {
      setError(e.message)
      setStep("error")
    }
  }

  const reset = () => { setOpen(false); setStep("form"); setError(""); setTo("") }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "9px 12px", borderRadius: 8,
    border: "1px solid var(--border)", background: "var(--bg)",
    color: "var(--text-1)", fontSize: 13, outline: "none",
    boxSizing: "border-box", fontFamily: "inherit",
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="no-print"
        style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:8, fontSize:12, color:"var(--primary-light)", cursor:"pointer" }}>
        <Mail size={13}/> Envoyer par email
      </button>

      {open && (
        <div data-capture-modal style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
          <div style={{ background:"var(--bg-card)", borderRadius:16, border:"1px solid var(--border)", width:"100%", maxWidth:460, boxShadow:"0 32px 80px rgba(0,0,0,0.6)", overflow:"hidden" }}>

            {/* Header */}
            <div style={{ padding:"18px 22px 14px", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:34, height:34, borderRadius:9, background:"linear-gradient(135deg,#1e40af,#3b82f6)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <Mail size={15} color="#fff"/>
                </div>
                <div>
                  <h3 style={{ fontSize:14, fontWeight:800, color:"var(--text-1)", margin:0 }}>Envoyer par email</h3>
                  <p style={{ fontSize:11, color:"var(--text-3)", margin:0 }}>{title}{projectName ? ` — ${projectName}` : ""}</p>
                </div>
              </div>
              <button onClick={reset} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--text-3)", padding:4 }}>
                <X size={15}/>
              </button>
            </div>

            <div style={{ padding:"18px 22px 22px" }}>
              {step === "success" && (
                <div style={{ textAlign:"center", padding:"20px 0" }}>
                  <div style={{ fontSize:48, marginBottom:12 }}>✅</div>
                  <h3 style={{ fontSize:16, fontWeight:800, color:"var(--text-1)", margin:"0 0 8px" }}>Email envoyé !</h3>
                  <p style={{ fontSize:13, color:"var(--text-2)", margin:"0 0 20px" }}>Capture envoyée à <strong>{to}</strong></p>
                  <button onClick={reset} style={{ padding:"8px 24px", borderRadius:8, background:"var(--primary)", color:"#fff", border:"none", fontSize:13, fontWeight:700, cursor:"pointer" }}>Fermer</button>
                </div>
              )}

              {(step === "capturing" || step === "sending") && (
                <div style={{ textAlign:"center", padding:"28px 0" }}>
                  <Loader2 size={36} color="var(--primary-light)" style={{ animation:"spin 1s linear infinite", marginBottom:14 }}/>
                  <p style={{ fontSize:14, fontWeight:600, color:"var(--text-1)", margin:"0 0 4px" }}>
                    {step === "capturing" ? "Capture en cours..." : "Envoi en cours..."}
                  </p>
                  <p style={{ fontSize:12, color:"var(--text-3)", margin:0 }}>
                    {step === "capturing" ? "Génération de la capture WYSIWYG" : "Envoi par email"}
                  </p>
                  <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
                </div>
              )}

              {(step === "form" || step === "error") && (
                <>
                  <div style={{ marginBottom:14 }}>
                    <label style={{ fontSize:12, fontWeight:600, color:"var(--text-2)", display:"block", marginBottom:5 }}>
                      Destinataire <span style={{ color:"#ef4444" }}>*</span>
                    </label>
                    <input
                      type="email" value={to}
                      onChange={e=>{ setTo(e.target.value); setError("") }}
                      onKeyDown={e=>e.key==="Enter"&&handleSend()}
                      placeholder="prenom.nom@entreprise.com"
                      style={inputStyle}
                      autoFocus
                    />
                  </div>

                  <div style={{ background:"rgba(59,130,246,0.08)", border:"1px solid rgba(59,130,246,0.2)", borderRadius:8, padding:"10px 14px", marginBottom:14, fontSize:12, color:"var(--text-2)" }}>
                    📸 Une capture WYSIWYG de la page sera envoyée en pièce jointe (PNG)
                  </div>

                  {step === "error" && error && (
                    <div style={{ background:"rgba(220,38,38,0.08)", border:"1px solid rgba(220,38,38,0.25)", borderRadius:8, padding:"9px 12px", fontSize:12, color:"#dc2626", marginBottom:14 }}>
                      ❌ {error}
                    </div>
                  )}

                  <div style={{ display:"flex", gap:10 }}>
                    <button onClick={reset} style={{ flex:1, padding:"10px", borderRadius:8, border:"1px solid var(--border)", background:"transparent", color:"var(--text-2)", fontSize:13, cursor:"pointer" }}>
                      Annuler
                    </button>
                    <button onClick={handleSend} style={{ flex:2, padding:"10px", borderRadius:8, border:"none", background:"linear-gradient(135deg,#1e40af,#3b82f6)", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                      <Send size={13}/> Envoyer la capture
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
