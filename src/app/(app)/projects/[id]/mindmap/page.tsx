'use client'
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import AppLayout from "@/components/layout/AppLayout"
import ToolLayout from "@/components/tools/ToolLayout"
import { useProject, useToolData } from "@/hooks/useProject"
import { toast } from "sonner"

interface Branch {
  id: string; label: string; color: string
  children: { id: string; label: string }[]
}
interface MindMapData { center: string; branches: Branch[] }

function MindMapSVG({ data }: { data: MindMapData }) {
  const [hoveredBranch, setHoveredBranch] = useState<string | null>(null)
  const cx = 500; const cy = 350
  const branchR = 200; const childR = 320
  const n = data.branches.length

  return (
    <svg viewBox="0 0 1000 700" className="w-full" style={{ maxHeight: 600 }}>
      {/* Background grid */}
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5"/>
        </pattern>
      </defs>
      <rect width="1000" height="700" fill="url(#grid)" opacity="0.5"/>

      {data.branches.map((branch, i) => {
        const angle = (i / n) * 2 * Math.PI - Math.PI / 2
        const bx = cx + branchR * Math.cos(angle)
        const by = cy + branchR * Math.sin(angle)
        const isHovered = hoveredBranch === branch.id
        const nc = branch.children.length

        return (
          <g key={branch.id}>
            {/* Main branch line */}
            <line x1={cx} y1={cy} x2={bx} y2={by}
              stroke={branch.color} strokeWidth={isHovered ? 3 : 2}
              strokeOpacity={isHovered ? 1 : 0.7}
              style={{ transition: "all 0.2s" }}/>

            {/* Children */}
            {branch.children.map((child, j) => {
              const spread = 0.35
              const childAngle = angle + (j - (nc - 1) / 2) * spread
              const chx = cx + childR * Math.cos(childAngle)
              const chy = cy + childR * Math.sin(childAngle)

              return (
                <g key={child.id}>
                  <line x1={bx} y1={by} x2={chx} y2={chy}
                    stroke={branch.color} strokeWidth={1}
                    strokeOpacity={0.4} strokeDasharray="4 3"/>
                  <circle cx={chx} cy={chy} r={28} fill="#0f172a" stroke={branch.color} strokeWidth={1} strokeOpacity={0.5}/>
                  <text x={chx} y={chy} textAnchor="middle" dominantBaseline="middle"
                    fill={branch.color} fontSize="9" fontWeight="500" opacity={0.9}>
                    {child.label.length > 12 ? child.label.slice(0,11)+"…" : child.label}
                  </text>
                </g>
              )
            })}

            {/* Branch node */}
            <g onMouseEnter={() => setHoveredBranch(branch.id)}
               onMouseLeave={() => setHoveredBranch(null)}
               style={{ cursor: "pointer" }}>
              <circle cx={bx} cy={by} r={isHovered ? 46 : 42}
                fill={branch.color + "22"} stroke={branch.color}
                strokeWidth={isHovered ? 2.5 : 1.5}
                style={{ transition: "all 0.2s" }}>
                {isHovered && (
                  <animate attributeName="r" values="42;46;42" dur="1.5s" repeatCount="indefinite"/>
                )}
              </circle>
              <text x={bx} y={by - 6} textAnchor="middle" fill={branch.color}
                fontSize="18" dominantBaseline="middle">
                {["🎯","📅","💰","⚠️","👥","📡","✅","🏁"][data.branches.indexOf(branch)] ?? "●"}
              </text>
              <text x={bx} y={by + 14} textAnchor="middle" fill="#e2e8f0"
                fontSize="10" fontWeight="600">
                {branch.label.length > 14 ? branch.label.slice(0,13)+"…" : branch.label}
              </text>
            </g>
          </g>
        )
      })}

      {/* Center node */}
      <circle cx={cx} cy={cy} r={68} fill="#1e293b" stroke="#2563eb" strokeWidth={2}/>
      <circle cx={cx} cy={cy} r={62} fill="#0f172a" stroke="#2563eb" strokeWidth={1} strokeOpacity={0.4}/>
      <text x={cx} y={cy - 10} textAnchor="middle" fill="#60a5fa"
        fontSize="13" fontWeight="700">
        {data.center.length > 16 ? data.center.slice(0,15)+"…" : data.center}
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="#475569" fontSize="9">
        Mind Map
      </text>
    </svg>
  )
}

export default function MindMapPage() {
  const { id } = useParams<{ id: string }>()
  const { project } = useProject(id)
  const { data, history, loading, setLoading, save, loadHistory } = useToolData(id, "mindmap")
  const [mmData, setMmData] = useState<MindMapData | null>(null)

  useEffect(() => {
    if (data?.center) setMmData(data as MindMapData)
    else if (data?.branches) setMmData(data as MindMapData)
  }, [data])

  const generate = async () => {
    if (!project) return
    setLoading(true); toast.info("Génération Mind Map...")
    try {
      const res = await fetch("/api/generate", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ tool:"mindmap", projectName: project.name, projectDescription: project.description })
      })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      const newData = json.data
      setMmData(newData); await save(newData)
      toast.success("Mind Map généré")
    } catch(e:any) { toast.error(e.message) }
    finally { setLoading(false) }
  }

  return (
    <AppLayout>
      <ToolLayout title="Mind Map" icon="🧠" subtitle="// VISUALISATION"
        history={history}
        onLoadHistory={(e) => { loadHistory(e); if(e.data?.center || e.data?.branches) setMmData(e.data) }}
        onGenerate={generate} generateLabel="Générer Mind Map" generating={loading}
        projectName={project?.name}>

        {!mmData && !loading && (
          <div className="bg-card border border-dashed border-border rounded-xl p-16 text-center">
            <div className="text-5xl mb-3">🧠</div>
            <p className="font-semibold text-foreground mb-1">Aucun Mind Map</p>
            <p className="text-sm text-muted-foreground">Cliquez sur "Générer Mind Map"</p>
          </div>
        )}

        {loading && (
          <div className="bg-card border border-border rounded-xl p-16 text-center text-primary">
            <div className="text-4xl mb-3 animate-pulse">🧠</div>
            <p>Génération du Mind Map...</p>
          </div>
        )}

        {mmData && !loading && (
          <div className="space-y-4">
            {/* Legend */}
            <div className="flex flex-wrap gap-2">
              {mmData.branches?.map(b => (
                <div key={b.id} className="flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium" style={{ borderColor: b.color+"44", background: b.color+"11", color: b.color }}>
                  {b.label}
                </div>
              ))}
            </div>
            {/* SVG */}
            <div className="bg-card border border-border rounded-xl p-4">
              <MindMapSVG data={mmData}/>
            </div>
          </div>
        )}
      </ToolLayout>
    </AppLayout>
  )
}
