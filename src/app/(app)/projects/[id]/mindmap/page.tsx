"use client"
import { NavButtons } from "@/components/ui/BackButton"
import { useState, useEffect, useRef, useCallback } from "react"
import { useParams } from "next/navigation"
import AppLayout from "@/components/layout/AppLayout"
import ToolLayout from "@/components/tools/ToolLayout"
import { useProject, useToolData } from "@/hooks/useProject"
import { toast } from "sonner"
import { ZoomIn, ZoomOut, Maximize2, RotateCcw } from "lucide-react"
import { exportSVGasPNG } from "@/lib/exportAll"

interface Branch { id: string; label: string; color: string; children: { id: string; label: string }[] }
interface MindMapData { center: string; branches: Branch[] }

const EMOJIS = ["🎯","📅","💰","⚠️","👥","📡","✅","🏁","🔧","💡","📊","🔬"]

function MindMapSVG({ data, svgRef }: { data: MindMapData; svgRef: React.RefObject<SVGSVGElement> }) {
  const [hovered, setHovered] = useState<string | null>(null)
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 })
  const [dragging, setDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  const cx = 500; const cy = 380
  const branchR = 210; const childR = 340
  const n = data.branches?.length ?? 0

  // Wheel zoom
  const onWheel = useCallback((e: WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setTransform(t => ({ ...t, scale: Math.min(3, Math.max(0.3, t.scale * delta)) }))
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (el) { el.addEventListener("wheel", onWheel, { passive: false }); return () => el.removeEventListener("wheel", onWheel) }
  }, [onWheel])

  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return
    setDragging(true)
    setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y })
  }
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return
    setTransform(t => ({ ...t, x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }))
  }
  const onMouseUp = () => setDragging(false)

  const zoom = (d: number) => setTransform(t => ({ ...t, scale: Math.min(3, Math.max(0.3, t.scale * d)) }))
  const reset = () => setTransform({ x: 0, y: 0, scale: 1 })
  const fit = () => { reset() }

  return (
    <div style={{border:"1px solid var(--border)"}} style={{ height: 620 }}>
      {/* Controls */}
      <div className="absolute top-3 right-3 z-10 flex gap-1.5">
        <button onClick={() => zoom(1.2)} style={{border:"1px solid var(--border)"}} title="Zoom +">
          <ZoomIn size={14}/>
        </button>
        <button onClick={() => zoom(0.8)} style={{border:"1px solid var(--border)"}} title="Zoom -">
          <ZoomOut size={14}/>
        </button>
        <button onClick={fit} style={{border:"1px solid var(--border)"}} title="Ajuster">
          <Maximize2 size={14}/>
        </button>
        <button onClick={reset} style={{border:"1px solid var(--border)"}} title="Réinitialiser">
          <RotateCcw size={14}/>
        </button>
      </div>

      {/* Zoom level */}
      <div className="absolute bottom-3 left-3 z-10">
        <span style={{border:"1px solid var(--border)"}}>
          {Math.round(transform.scale * 100)}% · Molette pour zoomer · Clic+glisser pour déplacer
        </span>
      </div>

      <div ref={containerRef} style={{ width: "100%", height: "100%", cursor: dragging ? "grabbing" : "grab" }}
        onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}>
        <svg ref={svgRef} viewBox="0 0 1000 760" width="100%" height="100%"
          style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`, transformOrigin: "center", transition: dragging ? "none" : "transform 0.1s" }}>

          {/* Background */}
          <defs>
            <pattern id="mmgrid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#1e293b" strokeWidth="0.5"/>
            </pattern>
            <radialGradient id="centerGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1e3a5f"/>
              <stop offset="100%" stopColor="#0f172a"/>
            </radialGradient>
          </defs>
          <rect width="1000" height="760" fill="url(#mmgrid)" opacity="0.6"/>

          {/* Branches */}
          {data.branches?.map((branch, i) => {
            const angle = (i / n) * 2 * Math.PI - Math.PI / 2
            const bx = cx + branchR * Math.cos(angle)
            const by = cy + branchR * Math.sin(angle)
            const isH = hovered === branch.id
            const nc = branch.children?.length ?? 0
            const emoji = EMOJIS[i % EMOJIS.length]

            return (
              <g key={branch.id}>
                {/* Main line */}
                <line x1={cx} y1={cy} x2={bx} y2={by}
                  stroke={branch.color} strokeWidth={isH ? 3 : 2} strokeOpacity={isH ? 1 : 0.6}
                  style={{ transition: "all 0.2s" }}/>

                {/* Children */}
                {branch.children?.map((child, j) => {
                  const spread = Math.min(0.4, 1.2 / nc)
                  const ca = angle + (j - (nc - 1) / 2) * spread
                  const chx = cx + childR * Math.cos(ca)
                  const chy = cy + childR * Math.sin(ca)
                  return (
                    <g key={child.id}>
                      <line x1={bx} y1={by} x2={chx} y2={chy}
                        stroke={branch.color} strokeWidth={1} strokeOpacity={0.35} strokeDasharray="4 3"/>
                      <circle cx={chx} cy={chy} r={30} fill="#0f172a" stroke={branch.color} strokeWidth={1} strokeOpacity={0.5}/>
                      <text x={chx} y={chy} textAnchor="middle" dominantBaseline="middle"
                        fill={branch.color} fontSize="9" fontWeight="500" opacity={0.9}>
                        {child.label?.length > 13 ? child.label.slice(0,12)+"…" : child.label}
                      </text>
                    </g>
                  )
                })}

                {/* Branch circle */}
                <g onMouseEnter={() => setHovered(branch.id)} onMouseLeave={() => setHovered(null)}
                   style={{ cursor: "pointer" }}>
                  <circle cx={bx} cy={by} r={isH ? 50 : 46}
                    fill={branch.color + "1a"} stroke={branch.color} strokeWidth={isH ? 2.5 : 1.5}
                    style={{ transition: "all 0.2s", filter: isH ? `drop-shadow(0 0 8px ${branch.color}88)` : "none" }}/>
                  <text x={bx} y={by - 8} textAnchor="middle" fontSize="20" dominantBaseline="middle">{emoji}</text>
                  <text x={bx} y={by + 16} textAnchor="middle" fill="#f1f5f9" fontSize="10" fontWeight="700">
                    {branch.label?.length > 13 ? branch.label.slice(0,12)+"…" : branch.label}
                  </text>
                </g>
              </g>
            )
          })}

          {/* Center */}
          <circle cx={cx} cy={cy} r={75} fill="url(#centerGrad)" stroke="var(--primary)" strokeWidth={2}/>
          <circle cx={cx} cy={cy} r={68} fill="none" stroke="var(--primary)" strokeWidth={1} strokeOpacity={0.3}/>
          <text x={cx} y={cy - 12} textAnchor="middle" fill="#60a5fa" fontSize="12" fontWeight="700">
            {data.center?.length > 18 ? data.center.slice(0,17)+"…" : data.center}
          </text>
          <text x={cx} y={cy + 8} textAnchor="middle" fill="#475569" fontSize="9">Mind Map</text>
          <text x={cx} y={cy + 22} textAnchor="middle" fill="#334155" fontSize="8">PMO AI Studio</text>
        </svg>
      </div>
    </div>
  )
}

export default function MindMapPage() {
  const { id } = useParams<{ id: string }>()
  const { project } = useProject(id)
  const { data, history, loading, setLoading, save, loadHistory } = useToolData(id, "mindmap")
  const [mmData, setMmData] = useState<MindMapData | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (data?.center || data?.branches) setMmData(data as MindMapData)
  }, [data])

  const generate = async () => {
    if (!project) return
    setLoading(true); toast.info("Génération Mind Map...")
    try {
      const res = await fetch("/api/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool: "mindmap", projectName: project.name, projectDescription: project.description })
      })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setMmData(json.data); await save(json.data)
      toast.success("Mind Map généré")
    } catch (e: any) { toast.error(e.message) }
    finally { setLoading(false) }
  }

  return (
    <AppLayout>
      <ToolLayout title="Mind Map" icon="🧠" subtitle="// VISUALISATION"
        history={history}
        onLoadHistory={(e) => { loadHistory(e); if (e.data?.center || e.data?.branches) setMmData(e.data) }}
        onGenerate={generate} generateLabel="Générer Mind Map" generating={loading}
        projectName={project?.name}
        svgRef={svgRef as any}
        jsonData={mmData}
        exportFilename={`MindMap_${project?.name ?? ""}`}>

        {!mmData && !loading && (
          <div style={{border:"1px solid var(--border)"}}>
            <div className="text-5xl mb-3">🧠</div>
            <p className="font-semibold text-foreground mb-1">Aucun Mind Map</p>
            <p className="text-sm text-muted-foreground">Cliquez sur "Générer Mind Map"</p>
          </div>
        )}

        {loading && (
          <div style={{border:"1px solid var(--border)"}}>
            <div className="text-5xl mb-3 animate-pulse">🧠</div>
            <p>Génération du Mind Map...</p>
          </div>
        )}

        {mmData && !loading && (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {mmData.branches?.map(b => (
                <div key={b.id} className="flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium"
                  style={{ borderColor: b.color + "44", background: b.color + "11", color: b.color }}>
                  {b.label}
                </div>
              ))}
              <button onClick={() => { if (svgRef.current) exportSVGasPNG(svgRef.current as any, `MindMap_${project?.name ?? "projet"}`) }}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors ml-auto">
                📸 Export PNG
              </button>
            </div>
            <MindMapSVG data={mmData} svgRef={svgRef as any}/>
          </div>
        )}
      </ToolLayout>
    </AppLayout>
  )
}
