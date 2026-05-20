"use client"
import { useState } from "react"
import AppLayout from "@/components/layout/AppLayout"
import Link from "next/link"
import { Search, Clock, ArrowRight, Star, Zap } from "lucide-react"
import { ARTICLES, CATEGORIES } from "@/lib/blog-data"

export default function BlogPage() {
  const [search, setSearch]   = useState("")
  const [cat, setCat]         = useState("all")

  const filtered = ARTICLES.filter(a =>
    (cat === "all" || a.category === cat) &&
    (search === "" || a.title.toLowerCase().includes(search.toLowerCase()) || a.tags.some(t => t.toLowerCase().includes(search.toLowerCase())))
  )

  const featured = ARTICLES.filter(a => a.featured).slice(0, 3)

  return (
    <AppLayout>
      <div style={{ background:"var(--bg)", minHeight:"100%" }}>

        {/* Hero */}
        <div style={{ background:"linear-gradient(135deg,#0F172A 0%,#1e1b4b 50%,#0F172A 100%)", padding:"48px 24px 40px", position:"relative", overflow:"hidden" }}>
          {/* Cercles décoratifs */}
          <div style={{ position:"absolute", top:-80, right:-80, width:300, height:300, borderRadius:"50%", background:"rgba(123,94,255,0.08)", border:"1px solid rgba(123,94,255,0.15)" }}/>
          <div style={{ position:"absolute", bottom:-60, left:-60, width:200, height:200, borderRadius:"50%", background:"rgba(34,197,94,0.06)", border:"1px solid rgba(34,197,94,0.1)" }}/>
          <div style={{ maxWidth:800, margin:"0 auto", textAlign:"center", position:"relative", zIndex:1 }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"4px 14px", background:"rgba(123,94,255,0.15)", border:"1px solid rgba(123,94,255,0.3)", borderRadius:20, fontSize:11, fontWeight:700, color:"#a78bfa", marginBottom:16, letterSpacing:"1px" }}>
              <Zap size={11}/> BLOG PMO AI STUDIO
            </div>
            <h1 style={{ fontSize:36, fontWeight:900, color:"#f1f5f9", margin:"0 0 12px", lineHeight:1.2 }}>
              Maîtrisez la gestion de projet<br/>
              <span style={{ background:"linear-gradient(135deg,#7B5EFF,#22c55e)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>à l'ère de l'IA</span>
            </h1>
            <p style={{ fontSize:15, color:"#94a3b8", margin:"0 0 28px", lineHeight:1.7 }}>
              Pratiques PMO, Agile, DevOps, EVM, PMP® — Articles experts avec exemples réels
            </p>
            {/* Barre recherche */}
            <div style={{ position:"relative", maxWidth:480, margin:"0 auto" }}>
              <Search size={16} style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:"#64748b" }}/>
              <input value={search} onChange={e=>setSearch(e.target.value)}
                placeholder="Rechercher un article, tag, sujet..."
                style={{ width:"100%", padding:"12px 16px 12px 42px", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:12, fontSize:14, color:"#f1f5f9", outline:"none", boxSizing:"border-box" }}/>
            </div>
          </div>
        </div>

        <div style={{ maxWidth:1200, margin:"0 auto", padding:"32px 24px" }}>

          {/* Articles à la une */}
          {!search && cat === "all" && (
            <div style={{ marginBottom:40 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:20 }}>
                <Star size={16} style={{ color:"#f59e0b" }}/>
                <h2 style={{ fontSize:18, fontWeight:800, color:"var(--text-1)", margin:0 }}>À la une</h2>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr", gap:16 }}>
                {featured.map((a, i) => (
                  <Link key={a.slug} href={`/blog/${a.slug}`} style={{ textDecoration:"none", display:"block" }}>
                    <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:14, overflow:"hidden", height:"100%", transition:"transform 0.15s, border-color 0.15s", cursor:"pointer" }}
                      onMouseEnter={e=>{(e.currentTarget as any).style.transform="translateY(-3px)";(e.currentTarget as any).style.borderColor=a.color}}
                      onMouseLeave={e=>{(e.currentTarget as any).style.transform="translateY(0)";(e.currentTarget as any).style.borderColor="var(--border)"}}>
                      {/* Image placeholder colorée */}
                      <div style={{ height:i===0?180:120, background:`linear-gradient(135deg,${a.color}22,${a.color}44)`, display:"flex", alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden" }}>
                        <span style={{ fontSize:i===0?56:40 }}>{a.emoji}</span>
                        <div style={{ position:"absolute", bottom:8, left:12 }}>
                          <span style={{ fontSize:10, padding:"2px 8px", borderRadius:20, background:a.color, color:"#fff", fontWeight:700 }}>
                            {CATEGORIES.find(c=>c.id===a.category)?.emoji} {CATEGORIES.find(c=>c.id===a.category)?.label}
                          </span>
                        </div>
                      </div>
                      <div style={{ padding:i===0?"16px 20px":"12px 14px" }}>
                        <h3 style={{ fontSize:i===0?16:13, fontWeight:700, color:"var(--text-1)", margin:"0 0 8px", lineHeight:1.4 }}>{a.title}</h3>
                        {i===0 && <p style={{ fontSize:12, color:"var(--text-3)", margin:"0 0 10px", lineHeight:1.5 }}>{a.excerpt.slice(0,120)}...</p>}
                        <div style={{ display:"flex", alignItems:"center", gap:10, fontSize:10, color:"var(--text-3)" }}>
                          <Clock size={10}/> {a.readTime} min
                          <span>{a.date}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Filtres catégories */}
          <div style={{ display:"flex", gap:8, marginBottom:28, flexWrap:"wrap" }}>
            {CATEGORIES.map(c => (
              <button key={c.id} onClick={() => setCat(c.id)}
                style={{ display:"flex", alignItems:"center", gap:5, padding:"7px 16px", borderRadius:20, fontSize:12, fontWeight:600, cursor:"pointer", border:"1px solid "+(cat===c.id?c.color:"var(--border)"), background:cat===c.id?c.color+"22":"var(--bg-card)", color:cat===c.id?c.color:"var(--text-2)", transition:"all 0.15s" }}>
                <span>{c.emoji}</span> {c.label}
                <span style={{ fontSize:10, background:cat===c.id?c.color+"33":"var(--bg)", padding:"0 5px", borderRadius:8, color:cat===c.id?c.color:"var(--text-3)" }}>
                  {c.id==="all"?ARTICLES.length:ARTICLES.filter(a=>a.category===c.id).length}
                </span>
              </button>
            ))}
          </div>

          {/* Grille articles */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:20 }}>
            {filtered.map(article => (
              <Link key={article.slug} href={`/blog/${article.slug}`} style={{ textDecoration:"none" }}>
                <article style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:14, overflow:"hidden", height:"100%", display:"flex", flexDirection:"column", transition:"all 0.15s", cursor:"pointer" }}
                  onMouseEnter={e=>{(e.currentTarget as any).style.transform="translateY(-4px)";(e.currentTarget as any).style.borderColor=article.color;(e.currentTarget as any).style.boxShadow=`0 8px 32px ${article.color}22`}}
                  onMouseLeave={e=>{(e.currentTarget as any).style.transform="translateY(0)";(e.currentTarget as any).style.borderColor="var(--border)";(e.currentTarget as any).style.boxShadow="none"}}>

                  {/* Header coloré */}
                  <div style={{ height:100, background:`linear-gradient(135deg,${article.color}18,${article.color}35)`, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 20px", position:"relative", overflow:"hidden" }}>
                    <span style={{ fontSize:44, lineHeight:1 }}>{article.emoji}</span>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontSize:9, padding:"2px 8px", borderRadius:20, background:article.color, color:"#fff", fontWeight:700, marginBottom:4 }}>
                        {CATEGORIES.find(c=>c.id===article.category)?.label}
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:4, fontSize:10, color:article.color, justifyContent:"flex-end" }}>
                        <Clock size={10}/> {article.readTime} min
                      </div>
                    </div>
                    {/* Cercle déco */}
                    <div style={{ position:"absolute", bottom:-20, left:-20, width:80, height:80, borderRadius:"50%", background:article.color, opacity:0.08 }}/>
                  </div>

                  {/* Contenu */}
                  <div style={{ padding:"14px 16px", flex:1, display:"flex", flexDirection:"column" }}>
                    <h3 style={{ fontSize:13, fontWeight:700, color:"var(--text-1)", margin:"0 0 8px", lineHeight:1.4, flex:1 }}>{article.title}</h3>
                    <p style={{ fontSize:11, color:"var(--text-3)", margin:"0 0 12px", lineHeight:1.5 }}>{article.excerpt.slice(0,90)}...</p>

                    {/* Tags */}
                    <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginBottom:10 }}>
                      {article.tags.slice(0,3).map(t => (
                        <span key={t} style={{ fontSize:9, padding:"2px 7px", borderRadius:6, background:article.color+"15", color:article.color, fontWeight:600, border:`1px solid ${article.color}30` }}>
                          {t}
                        </span>
                      ))}
                    </div>

                    {/* Footer */}
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", paddingTop:10, borderTop:"1px solid var(--border)" }}>
                      <div>
                        <div style={{ fontSize:10, fontWeight:600, color:"var(--text-2)" }}>{article.author.split(",")[0]}</div>
                        <div style={{ fontSize:9, color:"var(--text-3)" }}>{new Date(article.date).toLocaleDateString("fr-FR",{day:"numeric",month:"short",year:"numeric"})}</div>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, fontWeight:600, color:article.color }}>
                        Lire <ArrowRight size={11}/>
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>

          {filtered.length === 0 && (
            <div style={{ textAlign:"center", padding:"60px 20px" }}>
              <div style={{ fontSize:40, marginBottom:12 }}>🔍</div>
              <p style={{ color:"var(--text-2)", fontSize:14 }}>Aucun article trouvé pour "{search}"</p>
            </div>
          )}

          {/* CTA Newsletter */}
          <div style={{ marginTop:48, background:"linear-gradient(135deg,rgba(123,94,255,0.1),rgba(34,197,94,0.08))", border:"1px solid rgba(123,94,255,0.2)", borderRadius:16, padding:"32px", textAlign:"center" }}>
            <div style={{ fontSize:32, marginBottom:12 }}>📧</div>
            <h3 style={{ fontSize:20, fontWeight:800, color:"var(--text-1)", margin:"0 0 8px" }}>Restez à jour sur les pratiques PMO</h3>
            <p style={{ fontSize:13, color:"var(--text-3)", margin:"0 0 20px" }}>Nouveaux articles chaque semaine · Formation PMP · Tips Agile · Tutoriels IA</p>
            <div style={{ display:"flex", gap:8, maxWidth:400, margin:"0 auto" }}>
              <input placeholder="votre@email.com" style={{ flex:1, padding:"10px 14px", background:"var(--bg)", border:"1px solid var(--border)", borderRadius:8, fontSize:13, color:"var(--text-1)", outline:"none" }}/>
              <button style={{ padding:"10px 20px", background:"var(--primary)", color:"#fff", border:"none", borderRadius:8, fontSize:13, fontWeight:700, cursor:"pointer" }}>S'abonner</button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
