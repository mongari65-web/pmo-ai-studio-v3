'use client'

import { useState } from 'react'
import Link from 'next/link'

// ── Données démo ─────────────────────────────────────────────

const PROJECT = {
  name: 'MigrateCloud Pro — Migration Azure',
  client: 'Banque Régionale du Maghreb',
  budget: '850 000€', start: 'Jan 2026', end: 'Jun 2027',
  duration: '18 mois', team: 12, progress: 34,
  cpi: '0.94', spi: '0.87', eac: '903 000€', bac: '850 000€',
  cv: '-18 000€', sv: '-38 000€', tcpi: '1.02',
}

const GANTT = [
  { phase:'Init',     task:'Charte & gouvernance',          start:1,  dur:2,  pct:100, color:'#7B5EFF', cp:false },
  { phase:'Init',     task:'Audit infrastructure',          start:2,  dur:3,  pct:100, color:'#7B5EFF', cp:false },
  { phase:'Conception',task:'Architecture cible Azure',     start:4,  dur:4,  pct:85,  color:'#3b82f6', cp:true  },
  { phase:'Conception',task:'Plan migration par vagues',    start:5,  dur:3,  pct:80,  color:'#3b82f6', cp:false },
  { phase:'Infra',    task:'Landing Zone Azure',            start:7,  dur:5,  pct:60,  color:'#22c55e', cp:true  },
  { phase:'Infra',    task:'Réseau & Sécurité cloud',       start:9,  dur:4,  pct:45,  color:'#22c55e', cp:true  },
  { phase:'Migration',task:'Vague 1 — Apps critiques',      start:11, dur:6,  pct:30,  color:'#f59e0b', cp:true  },
  { phase:'Migration',task:'Vague 2 — Apps secondaires',   start:14, dur:5,  pct:10,  color:'#f59e0b', cp:false },
  { phase:'Tests',    task:'Tests perf & sécurité',         start:16, dur:3,  pct:5,   color:'#ef4444', cp:true  },
  { phase:'Clôture',  task:'Formation & Go-Live',           start:17, dur:2,  pct:0,   color:'#64748b', cp:false },
]

const EVM_MONTHS = [
  { m:'Jan', pv:42,  ev:38,  ac:41,  eac:903 },
  { m:'Fév', pv:89,  ev:82,  ac:88,  eac:903 },
  { m:'Mar', pv:145, ev:131, ac:142, eac:903 },
  { m:'Avr', pv:210, ev:188, ac:201, eac:903 },
  { m:'Mai', pv:289, ev:251, ac:269, eac:903 },
  { m:'Jun', pv:375, ev:0,   ac:0,   eac:903 },
  { m:'Jul', pv:460, ev:0,   ac:0,   eac:903 },
  { m:'Aoû', pv:545, ev:0,   ac:0,   eac:903 },
  { m:'Sep', pv:620, ev:0,   ac:0,   eac:903 },
  { m:'Oct', pv:695, ev:0,   ac:0,   eac:903 },
  { m:'Nov', pv:760, ev:0,   ac:0,   eac:903 },
  { m:'Déc', pv:820, ev:0,   ac:0,   eac:903 },
]

const RAID = [
  { type:'R', title:'Indisponibilité migration AS400',     prio:'Critique', status:'Ouvert',    color:'#ef4444', resp:'DSI',      ech:'2026-06-30', mitigation:'Dual-run + tests failover hebdo' },
  { type:'R', title:'Non-conformité DORA/NIS2',           prio:'Critique', status:'En cours',  color:'#ef4444', resp:'RSSI',     ech:'2026-03-15', mitigation:'Audit ISO 27001 + certification' },
  { type:'R', title:'Résistance au changement',           prio:'Haute',    status:'Ouvert',    color:'#f59e0b', resp:'RH',       ech:'2026-04-01', mitigation:'Programme change mgmt 3 mois' },
  { type:'R', title:'Dépassement budget +15%',            prio:'Haute',    status:'Surveillé', color:'#f59e0b', resp:'Chef',     ech:'2026-12-31', mitigation:'Réserve contingente 128k€' },
  { type:'A', title:'Valider architecture avec RSSI',     prio:'Haute',    status:'En cours',  color:'#3b82f6', resp:'Chef',     ech:'2026-02-28', mitigation:'Réunion RSSI planifiée S12' },
  { type:'A', title:'Commander licences Azure EA',        prio:'Moyen',    status:'Terminé',   color:'#22c55e', resp:'DSI',      ech:'2026-01-31', mitigation:'Contrat signé — 120k€/an' },
  { type:'I', title:'Retard connecteurs legacy',          prio:'Haute',    status:'Ouvert',    color:'#ef4444', resp:'Tech',     ech:'2026-05-15', mitigation:'Dev connecteur custom en backup' },
  { type:'D', title:'Région Azure : France Central',      prio:'Info',     status:'Clos',      color:'#22c55e', resp:'COMEX',    ech:'2026-01-15', mitigation:'Décision COMEX validée' },
]

const WBS = [
  { l:0, code:'1.0',   label:'MigrateCloud Pro',              color:'#0078D4', budget:'850k€' },
  { l:1, code:'1.1',   label:'Initialisation & Gouvernance',  color:'#7B5EFF', budget:'45k€'  },
  { l:2, code:'1.1.1', label:'Charte de projet',              color:'#94a3b8', budget:'8k€'   },
  { l:2, code:'1.1.2', label:'Comité de pilotage',            color:'#94a3b8', budget:'12k€'  },
  { l:2, code:'1.1.3', label:'Plan de communication',         color:'#94a3b8', budget:'25k€'  },
  { l:1, code:'1.2',   label:'Architecture & Sécurité',       color:'#3b82f6', budget:'120k€' },
  { l:2, code:'1.2.1', label:'Architecture cible Azure',      color:'#94a3b8', budget:'55k€'  },
  { l:2, code:'1.2.2', label:'Sécurité & Conformité DORA',    color:'#94a3b8', budget:'65k€'  },
  { l:1, code:'1.3',   label:'Infrastructure Cloud',          color:'#22c55e', budget:'280k€' },
  { l:2, code:'1.3.1', label:'Landing Zone Azure',            color:'#94a3b8', budget:'95k€'  },
  { l:2, code:'1.3.2', label:'Réseau, VPN & ExpressRoute',    color:'#94a3b8', budget:'85k€'  },
  { l:2, code:'1.3.3', label:'IAM & Zero Trust Security',     color:'#94a3b8', budget:'100k€' },
  { l:1, code:'1.4',   label:'Migration Applications',        color:'#f59e0b', budget:'320k€' },
  { l:2, code:'1.4.1', label:'Vague 1 — 4 apps critiques',   color:'#94a3b8', budget:'180k€' },
  { l:2, code:'1.4.2', label:'Vague 2 — 8 apps secondaires', color:'#94a3b8', budget:'140k€' },
  { l:1, code:'1.5',   label:'Tests & Recette',               color:'#ef4444', budget:'55k€'  },
  { l:1, code:'1.6',   label:'Formation & Go-Live',           color:'#64748b', budget:'30k€'  },
]

const RACI_TASKS = [
  { task:'Architecture Azure',      DSI:'A', Chef:'R', Archi:'R', Metier:'C', RSSI:'C', DG:'I' },
  { task:'Migration données',       DSI:'A', Chef:'R', Archi:'C', Metier:'I', RSSI:'C', DG:'I' },
  { task:'Tests sécurité',          DSI:'C', Chef:'A', Archi:'C', Metier:'I', RSSI:'R', DG:'I' },
  { task:'Formation utilisateurs',  DSI:'I', Chef:'A', Archi:'I', Metier:'R', RSSI:'I', DG:'C' },
  { task:'Go-Live décision finale', DSI:'C', Chef:'R', Archi:'C', Metier:'C', RSSI:'C', DG:'A' },
  { task:'Budget & finances',       DSI:'C', Chef:'R', Archi:'I', Metier:'I', RSSI:'I', DG:'A' },
]

const RESOURCES = [
  { name:'Karim Benali',  role:'Chef de Projet',    dispo:100, status:'Occupé',  skills:['PMO','Azure','Gouvernance'], rate:850, stars:5 },
  { name:'Sophie Martin', role:'Architecte Cloud',  dispo:80,  status:'Partiel', skills:['Azure','DevOps','Sécurité'], rate:950, stars:5 },
  { name:'Mehdi Alaoui',  role:'Expert Migration',  dispo:100, status:'Occupé',  skills:['Azure Migrate','SQL','AS400'], rate:800, stars:4 },
  { name:'Fatima Zahra',  role:'RSSI / Sécurité',   dispo:50,  status:'Partiel', skills:['ISO27001','DORA','NIS2'], rate:900, stars:5 },
  { name:'Thomas Dupont', role:'Dev / Intégration', dispo:100, status:'Occupé',  skills:['API','Python','Terraform'], rate:720, stars:4 },
  { name:'Leila Bennis',  role:'Change Management', dispo:60,  status:'Partiel', skills:['Formation','Communication'], rate:650, stars:4 },
]

const BUDGET_WP = [
  { wp:'WP1 — Init & Gov',    budget:45,  reel:42,  color:'#7B5EFF' },
  { wp:'WP2 — Architecture',  budget:120, reel:115, color:'#3b82f6' },
  { wp:'WP3 — Infra Cloud',   budget:280, reel:112, color:'#22c55e' },
  { wp:'WP4 — Migration',     budget:320, reel:0,   color:'#f59e0b' },
  { wp:'WP5 — Tests',         budget:55,  reel:0,   color:'#ef4444' },
  { wp:'WP6 — Formation',     budget:30,  reel:0,   color:'#64748b' },
]

const TABS = [
  { id:'dashboard',   label:'📊 Dashboard',    },
  { id:'gantt',       label:'📅 Gantt'         },
  { id:'evm',         label:'💰 EVM'           },
  { id:'raid',        label:'⚠️ RAID'          },
  { id:'wbs',         label:'🗂️ WBS'           },
  { id:'raci',        label:'👥 RACI'          },
  { id:'budget',      label:'💼 Budget WP'     },
  { id:'ressources',  label:'🧑‍💼 Ressources'  },
]

const RACI_COLORS: Record<string, string> = { R:'#7B5EFF', A:'#ef4444', C:'#f59e0b', I:'#22c55e' }
const maxEVM = 920

export default function DemoPage() {
  const [tab, setTab] = useState('dashboard')

  const card = (extra?: React.CSSProperties): React.CSSProperties => ({
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 16, padding: 24, ...extra,
  })

  return (
    <div style={{ fontFamily:"'Inter','Segoe UI',Arial,sans-serif", background:'#0f172a', minHeight:'100vh', color:'#e2e8f0' }}>

      {/* Bannière */}
      <div style={{ background:'linear-gradient(135deg,#7B5EFF,#3b82f6)', padding:'10px 5%', textAlign:'center', position:'sticky', top:0, zIndex:100 }}>
        <p style={{ margin:0, fontSize:13, color:'#fff', fontWeight:600 }}>
          👁️ Mode lecture seule — Projet de démonstration &nbsp;·&nbsp;
          <Link href="/auth/inscription" style={{ color:'#fde68a', fontWeight:800, textDecoration:'none' }}>
            Créez votre projet gratuitement →
          </Link>
        </p>
      </div>

      {/* Header projet */}
      <div style={{ background:'linear-gradient(135deg,#1e293b,#0f172a)', borderBottom:'1px solid rgba(255,255,255,0.08)', padding:'20px 5%' }}>
        <div style={{ maxWidth:1400, margin:'0 auto' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16, flexWrap:'wrap', gap:12 }}>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:44, height:44, borderRadius:12, background:'rgba(0,120,212,0.2)', border:'1px solid rgba(0,120,212,0.4)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>☁️</div>
              <div>
                <h1 style={{ fontSize:18, fontWeight:800, margin:0, color:'#f1f5f9' }}>{PROJECT.name}</h1>
                <p style={{ fontSize:12, color:'#64748b', margin:'2px 0 0' }}>Client : {PROJECT.client} · {PROJECT.start} → {PROJECT.end} · {PROJECT.team} personnes</p>
              </div>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <span style={{ fontSize:11, padding:'4px 12px', borderRadius:20, background:'rgba(34,197,94,0.15)', color:'#22c55e', border:'1px solid rgba(34,197,94,0.3)', fontWeight:600 }}>🟢 En cours</span>
              <span style={{ fontSize:11, padding:'4px 12px', borderRadius:20, background:'rgba(255,255,255,0.05)', color:'#94a3b8', border:'1px solid rgba(255,255,255,0.1)' }}>👁️ Lecture seule</span>
            </div>
          </div>
          {/* KPIs */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(8,1fr)', gap:8 }}>
            {[
              { l:'Avancement', v:`${PROJECT.progress}%`, c:'#7B5EFF' },
              { l:'Budget BAC', v:PROJECT.bac,            c:'#3b82f6' },
              { l:'CPI',        v:PROJECT.cpi,            c:'#f59e0b' },
              { l:'SPI',        v:PROJECT.spi,            c:'#ef4444' },
              { l:'EAC',        v:PROJECT.eac,            c:'#f97316' },
              { l:'CV',         v:PROJECT.cv,             c:'#ef4444' },
              { l:'TCPI',       v:PROJECT.tcpi,           c:'#22c55e' },
              { l:'Équipe',     v:`${PROJECT.team} pers.`,c:'#06b6d4' },
            ].map(k => (
              <div key={k.l} style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:8, padding:'8px 10px', textAlign:'center' }}>
                <p style={{ fontSize:9, color:'#64748b', margin:'0 0 3px', textTransform:'uppercase', letterSpacing:'0.05em' }}>{k.l}</p>
                <p style={{ fontSize:14, fontWeight:800, color:k.c, margin:0 }}>{k.v}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div style={{ background:'#1e293b', borderBottom:'1px solid rgba(255,255,255,0.08)', padding:'0 5%', position:'sticky', top:41, zIndex:90, overflowX:'auto' }}>
        <div style={{ maxWidth:1400, margin:'0 auto', display:'flex', gap:2 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ padding:'13px 16px', fontSize:13, fontWeight:600, border:'none', cursor:'pointer', background:'transparent',
                color: tab === t.id ? '#7B5EFF' : '#64748b',
                borderBottom: tab === t.id ? '2px solid #7B5EFF' : '2px solid transparent',
                whiteSpace:'nowrap', transition:'all 0.15s' }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth:1400, margin:'0 auto', padding:'28px 5%' }}>

        {/* ── DASHBOARD ── */}
        {tab === 'dashboard' && (
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
              {/* Avancement global */}
              <div style={card()}>
                <p style={{ fontSize:13, fontWeight:700, color:'#f1f5f9', margin:'0 0 16px' }}>📈 Avancement global</p>
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {[
                    { label:'Initialisation',  pct:100, color:'#7B5EFF' },
                    { label:'Architecture',    pct:82,  color:'#3b82f6' },
                    { label:'Infrastructure',  pct:52,  color:'#22c55e' },
                    { label:'Migration',       pct:20,  color:'#f59e0b' },
                    { label:'Tests',           pct:3,   color:'#ef4444' },
                    { label:'Clôture',         pct:0,   color:'#64748b' },
                  ].map(p => (
                    <div key={p.label}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                        <span style={{ fontSize:12, color:'#94a3b8' }}>{p.label}</span>
                        <span style={{ fontSize:12, fontWeight:700, color:p.color }}>{p.pct}%</span>
                      </div>
                      <div style={{ height:6, background:'rgba(255,255,255,0.07)', borderRadius:3 }}>
                        <div style={{ width:`${p.pct}%`, height:'100%', background:p.color, borderRadius:3, transition:'width 0.5s' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Santé projet */}
              <div style={card()}>
                <p style={{ fontSize:13, fontWeight:700, color:'#f1f5f9', margin:'0 0 16px' }}>🏥 Santé projet</p>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  {[
                    { label:'Score santé', value:'72/100', color:'#f59e0b', bg:'rgba(245,158,11,0.1)', icon:'⚠️' },
                    { label:'Budget',      value:'-2.1%',  color:'#f59e0b', bg:'rgba(245,158,11,0.1)', icon:'💰' },
                    { label:'Planning',    value:'-13%',   color:'#ef4444', bg:'rgba(239,68,68,0.1)',  icon:'📅' },
                    { label:'Scope',       value:'100%',   color:'#22c55e', bg:'rgba(34,197,94,0.1)',  icon:'✅' },
                    { label:'Qualité',     value:'88%',    color:'#22c55e', bg:'rgba(34,197,94,0.1)',  icon:'⭐' },
                    { label:'Risques',     value:'3 crit', color:'#ef4444', bg:'rgba(239,68,68,0.1)',  icon:'⚠️' },
                  ].map(k => (
                    <div key={k.label} style={{ background:k.bg, border:`1px solid ${k.color}33`, borderRadius:10, padding:'12px', textAlign:'center' }}>
                      <p style={{ fontSize:18, margin:'0 0 4px' }}>{k.icon}</p>
                      <p style={{ fontSize:10, color:'#64748b', margin:'0 0 3px', textTransform:'uppercase' }}>{k.label}</p>
                      <p style={{ fontSize:16, fontWeight:800, color:k.color, margin:0 }}>{k.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Jalons */}
            <div style={card()}>
              <p style={{ fontSize:13, fontWeight:700, color:'#f1f5f9', margin:'0 0 16px' }}>🎯 Jalons clés</p>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {[
                  { date:'2026-03-15', label:'Fin architecture validée',     status:'done',    color:'#22c55e' },
                  { date:'2026-06-30', label:'Landing Zone Azure opérable',  status:'current', color:'#f59e0b' },
                  { date:'2026-10-31', label:'Vague 1 migrée & testée',      status:'todo',    color:'#3b82f6' },
                  { date:'2027-03-15', label:'Vague 2 migrée & testée',      status:'todo',    color:'#3b82f6' },
                  { date:'2027-06-30', label:'Go-Live final & clôture',      status:'todo',    color:'#64748b' },
                ].map((j, i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', background:'rgba(255,255,255,0.03)', borderRadius:8 }}>
                    <div style={{ width:10, height:10, borderRadius:'50%', background:j.color, flexShrink:0, boxShadow: j.status === 'current' ? `0 0 8px ${j.color}` : 'none' }} />
                    <span style={{ fontSize:11, color:'#475569', fontFamily:'monospace', minWidth:80 }}>{j.date}</span>
                    <span style={{ fontSize:13, color: j.status === 'done' ? '#64748b' : '#e2e8f0', textDecoration: j.status === 'done' ? 'line-through' : 'none', flex:1 }}>{j.label}</span>
                    <span style={{ fontSize:10, fontWeight:600, padding:'2px 8px', borderRadius:10, background:`${j.color}22`, color:j.color }}>
                      {j.status === 'done' ? '✓ Atteint' : j.status === 'current' ? '⏳ En cours' : '○ À venir'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── GANTT ── */}
        {tab === 'gantt' && (
          <div style={card()}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
              <h2 style={{ fontSize:15, fontWeight:700, color:'#f1f5f9', margin:0 }}>📅 Planning Gantt — 10 tâches · 18 mois</h2>
              <div style={{ display:'flex', gap:8 }}>
                <span style={{ fontSize:10, padding:'3px 8px', borderRadius:4, background:'rgba(239,68,68,0.15)', color:'#ef4444' }}>🔴 Chemin critique</span>
              </div>
            </div>
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11 }}>
                <thead>
                  <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.1)' }}>
                    <th style={{ textAlign:'left', padding:'8px 12px', color:'#64748b', fontWeight:600, minWidth:220 }}>Tâche</th>
                    <th style={{ textAlign:'left', padding:'8px 12px', color:'#64748b', fontWeight:600, width:90 }}>Phase</th>
                    <th style={{ padding:'8px 8px', color:'#64748b', fontWeight:600, width:60, textAlign:'center' }}>Avmt</th>
                    {Array.from({length:18}, (_,i) => (
                      <th key={i} style={{ padding:'8px 3px', color:'#475569', fontWeight:500, fontSize:9, textAlign:'center', minWidth:28 }}>M{i+1}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {GANTT.map((t, i) => (
                    <tr key={i} style={{ borderBottom:'1px solid rgba(255,255,255,0.04)', background: t.cp ? 'rgba(239,68,68,0.03)' : 'transparent' }}>
                      <td style={{ padding:'8px 12px', color:'#e2e8f0', fontSize:12 }}>
                        {t.cp && <span style={{ color:'#ef4444', marginRight:4, fontSize:9 }}>●</span>}
                        {t.task}
                      </td>
                      <td style={{ padding:'8px 12px' }}>
                        <span style={{ fontSize:9, fontWeight:700, padding:'2px 7px', borderRadius:10, background:`${t.color}22`, color:t.color }}>{t.phase}</span>
                      </td>
                      <td style={{ padding:'8px 8px', textAlign:'center' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:4, justifyContent:'center' }}>
                          <div style={{ width:32, height:4, background:'rgba(255,255,255,0.08)', borderRadius:2 }}>
                            <div style={{ width:`${t.pct}%`, height:'100%', background:t.color, borderRadius:2 }} />
                          </div>
                          <span style={{ fontSize:9, color:'#64748b' }}>{t.pct}%</span>
                        </div>
                      </td>
                      {Array.from({length:18}, (_,m) => {
                        const inTask = m >= t.start-1 && m < t.start-1+t.dur
                        const done   = inTask && t.pct === 100
                        return (
                          <td key={m} style={{ padding:'5px 2px' }}>
                            {inTask && <div style={{ height:14, borderRadius:3, background: done ? t.color : `${t.color}44`, border:`1px solid ${t.color}66` }} />}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop:14, padding:'10px 14px', background:'rgba(255,255,255,0.02)', borderRadius:8, display:'flex', gap:16, flexWrap:'wrap' }}>
              {[['#7B5EFF','Initiation'],['#3b82f6','Conception'],['#22c55e','Infrastructure'],['#f59e0b','Migration'],['#ef4444','Tests'],['#64748b','Clôture']].map(([c,l]) => (
                <span key={l as string} style={{ fontSize:10, color:c as string, fontWeight:600 }}>■ {l}</span>
              ))}
            </div>
          </div>
        )}

        {/* ── EVM ── */}
        {tab === 'evm' && (
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            {/* KPIs */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
              {[
                { l:'PV — Valeur Planifiée',  v:'289 000€', c:'#3b82f6', sub:'Budget prévu à ce jour' },
                { l:'EV — Valeur Acquise',    v:'251 000€', c:'#7B5EFF', sub:'Travail réellement accompli' },
                { l:'AC — Coût Réel',         v:'269 000€', c:'#f59e0b', sub:'Dépenses engagées à ce jour' },
                { l:'BAC — Budget Total',     v:'850 000€', c:'#94a3b8', sub:'Budget à complétion initial' },
                { l:'CV — Écart Coût',        v:'-18 000€', c:'#ef4444', sub:'Négatif = sur budget' },
                { l:'SV — Écart Délai',       v:'-38 000€', c:'#ef4444', sub:'Négatif = en retard' },
                { l:'EAC — Prévision Finale', v:'903 000€', c:'#f97316', sub:'Coût estimé à fin' },
                { l:'TCPI',                   v:'1.02',     c:'#f59e0b', sub:'Efficacité requise pour finir' },
              ].map(k => (
                <div key={k.l} style={{ ...card({ padding:'14px 16px' }), borderLeft:`3px solid ${k.c}` }}>
                  <p style={{ fontSize:10, color:'#64748b', margin:'0 0 3px', textTransform:'uppercase', letterSpacing:'0.05em' }}>{k.l}</p>
                  <p style={{ fontSize:20, fontWeight:800, color:k.c, margin:'0 0 3px' }}>{k.v}</p>
                  <p style={{ fontSize:10, color:'#475569', margin:0 }}>{k.sub}</p>
                </div>
              ))}
            </div>

            {/* Courbe S */}
            <div style={card()}>
              <p style={{ fontSize:13, fontWeight:700, color:'#f1f5f9', margin:'0 0 20px' }}>📈 Courbe S — Évolution cumulée (k€) · PV / EV / AC / EAC</p>
              <div style={{ position:'relative', height:220 }}>
                {/* Grille horizontale */}
                {[0,25,50,75,100].map(pct => (
                  <div key={pct} style={{ position:'absolute', left:0, right:0, bottom:`${pct*2.1}px`, borderTop:'1px solid rgba(255,255,255,0.05)', display:'flex', alignItems:'center' }}>
                    <span style={{ fontSize:9, color:'#475569', marginLeft:4, transform:'translateY(-50%)' }}>{Math.round(pct * maxEVM / 100)}k</span>
                  </div>
                ))}
                {/* Lignes de courbe SVG */}
                <svg width="100%" height="220" style={{ position:'absolute', inset:0 }} viewBox="0 0 800 220" preserveAspectRatio="none">
                  {/* EAC ligne pointillée */}
                  <line x1="0" y1={220 - (903/maxEVM)*200} x2="800" y2={220 - (903/maxEVM)*200} stroke="#f97316" strokeWidth="1.5" strokeDasharray="6,4" opacity="0.6" />
                  {/* PV */}
                  <polyline fill="none" stroke="#3b82f6" strokeWidth="2.5"
                    points={EVM_MONTHS.map((d,i) => `${i*(800/11)},${220-(d.pv/maxEVM)*200}`).join(' ')} />
                  {/* EV */}
                  <polyline fill="none" stroke="#7B5EFF" strokeWidth="2.5"
                    points={EVM_MONTHS.filter(d=>d.ev>0).map((d,i) => `${i*(800/11)},${220-(d.ev/maxEVM)*200}`).join(' ')} />
                  {/* AC */}
                  <polyline fill="none" stroke="#f59e0b" strokeWidth="2.5"
                    points={EVM_MONTHS.filter(d=>d.ac>0).map((d,i) => `${i*(800/11)},${220-(d.ac/maxEVM)*200}`).join(' ')} />
                  {/* Points PV */}
                  {EVM_MONTHS.slice(0,5).map((d,i) => (
                    <circle key={i} cx={i*(800/11)} cy={220-(d.pv/maxEVM)*200} r="4" fill="#3b82f6" />
                  ))}
                  {/* Points EV */}
                  {EVM_MONTHS.filter(d=>d.ev>0).map((d,i) => (
                    <circle key={i} cx={i*(800/11)} cy={220-(d.ev/maxEVM)*200} r="4" fill="#7B5EFF" />
                  ))}
                  {/* Ligne aujourd'hui */}
                  <line x1={4*(800/11)} y1="0" x2={4*(800/11)} y2="220" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="4,3" />
                  <text x={4*(800/11)+6} y="14" fill="rgba(255,255,255,0.4)" fontSize="10">Aujourd&apos;hui</text>
                </svg>
                {/* Labels mois */}
                <div style={{ position:'absolute', bottom:-20, left:0, right:0, display:'flex', justifyContent:'space-between' }}>
                  {EVM_MONTHS.map(d => (
                    <span key={d.m} style={{ fontSize:9, color:'#475569', textAlign:'center' }}>{d.m}</span>
                  ))}
                </div>
              </div>
              <div style={{ display:'flex', gap:20, marginTop:28, justifyContent:'center', flexWrap:'wrap' }}>
                {[['#3b82f6','PV — Valeur Planifiée'],['#7B5EFF','EV — Valeur Acquise'],['#f59e0b','AC — Coût Réel'],['#f97316','EAC — Prévision (pointillé)']].map(([c,l]) => (
                  <span key={l as string} style={{ fontSize:11, color:c as string, fontWeight:600, display:'flex', alignItems:'center', gap:6 }}>
                    <span style={{ width:20, height:2, background:c as string, display:'inline-block' }} />{l}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── RAID ── */}
        {tab === 'raid' && (
          <div style={card()}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20, flexWrap:'wrap', gap:10 }}>
              <h2 style={{ fontSize:15, fontWeight:700, color:'#f1f5f9', margin:0 }}>⚠️ RAID Register — 8 entrées</h2>
              <div style={{ display:'flex', gap:8 }}>
                {[['R','Risques','#ef4444'],['A','Actions','#3b82f6'],['I','Issues','#f59e0b'],['D','Décisions','#22c55e']].map(([t,l,c]) => (
                  <span key={t as string} style={{ fontSize:10, fontWeight:700, padding:'3px 10px', borderRadius:20, background:`${c}22`, color:c as string, border:`1px solid ${c}44` }}>{t as string} — {l}</span>
                ))}
              </div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {RAID.map((r, i) => (
                <div key={i} style={{ display:'grid', gridTemplateColumns:'30px 1fr 70px 80px 80px 80px 180px', gap:10, alignItems:'center', padding:'12px 16px', background:'rgba(255,255,255,0.03)', borderRadius:10, borderLeft:`3px solid ${r.color}` }}>
                  <span style={{ fontSize:11, fontWeight:800, color:r.color, background:`${r.color}22`, width:22, height:22, borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center' }}>{r.type}</span>
                  <p style={{ fontSize:12, color:'#e2e8f0', margin:0, fontWeight:500 }}>{r.title}</p>
                  <span style={{ fontSize:9, fontWeight:700, padding:'2px 6px', borderRadius:10, background:`${r.color}22`, color:r.color, textAlign:'center' }}>{r.prio}</span>
                  <span style={{ fontSize:10, color: r.status === 'Terminé' || r.status === 'Clos' ? '#22c55e' : r.status === 'En cours' ? '#f59e0b' : '#94a3b8', fontWeight:600 }}>{r.status}</span>
                  <span style={{ fontSize:10, color:'#64748b' }}>{r.resp}</span>
                  <span style={{ fontSize:9, color:'#475569', fontFamily:'monospace' }}>{r.ech}</span>
                  <p style={{ fontSize:10, color:'#64748b', margin:0 }}>{r.mitigation}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── WBS ── */}
        {tab === 'wbs' && (
          <div style={card()}>
            <h2 style={{ fontSize:15, fontWeight:700, color:'#f1f5f9', margin:'0 0 20px' }}>🗂️ Work Breakdown Structure — {WBS.length} éléments</h2>
            <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
              {WBS.map((w, i) => (
                <div key={i} style={{
                  display:'flex', alignItems:'center', justifyContent:'space-between',
                  padding:`7px 12px 7px ${w.l===0?12:w.l===1?28:52}px`,
                  background: w.l===0 ? 'rgba(0,120,212,0.12)' : w.l===1 ? 'rgba(255,255,255,0.04)' : 'transparent',
                  borderRadius:7,
                  borderLeft: w.l>0 ? `2px solid ${w.color}44` : 'none',
                  marginLeft: w.l===1?10:w.l===2?24:0,
                }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <span style={{ fontSize:10, color:'#475569', fontFamily:'monospace', minWidth:48 }}>{w.code}</span>
                    <span style={{ fontSize:w.l===0?14:w.l===1?13:12, fontWeight:w.l===0?800:w.l===1?700:400, color:w.l===0?'#60a5fa':w.l===1?w.color:'#94a3b8' }}>{w.label}</span>
                  </div>
                  <span style={{ fontSize:11, fontWeight:600, color:w.color, background:`${w.color}15`, padding:'2px 10px', borderRadius:6 }}>{w.budget}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop:16, padding:'12px 16px', background:'rgba(255,255,255,0.02)', borderRadius:8, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:12, color:'#64748b' }}>Budget total alloué</span>
              <span style={{ fontSize:16, fontWeight:800, color:'#0078D4' }}>850 000€</span>
            </div>
          </div>
        )}

        {/* ── RACI ── */}
        {tab === 'raci' && (
          <div style={card()}>
            <h2 style={{ fontSize:15, fontWeight:700, color:'#f1f5f9', margin:'0 0 20px' }}>👥 Matrice RACI — 6 activités × 6 rôles</h2>
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
                <thead>
                  <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.1)' }}>
                    <th style={{ textAlign:'left', padding:'10px 14px', color:'#64748b', fontWeight:600, minWidth:200 }}>Activité</th>
                    {['DSI','Chef Projet','Architecte','Métier','RSSI','DG'].map(r => (
                      <th key={r} style={{ padding:'10px 14px', color:'#64748b', fontWeight:600, textAlign:'center', fontSize:11 }}>{r}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {RACI_TASKS.map((row, i) => {
                    const vals = [row.DSI, row.Chef, row.Archi, row.Metier, row.RSSI, row.DG]
                    return (
                      <tr key={i} style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding:'10px 14px', color:'#e2e8f0', fontSize:13 }}>{row.task}</td>
                        {vals.map((v, j) => (
                          <td key={j} style={{ padding:'10px 14px', textAlign:'center' }}>
                            <span style={{ fontSize:12, fontWeight:800, width:28, height:28, borderRadius:8, background:`${RACI_COLORS[v]}22`, color:RACI_COLORS[v], border:`1px solid ${RACI_COLORS[v]}44`, display:'inline-flex', alignItems:'center', justifyContent:'center' }}>{v}</span>
                          </td>
                        ))}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div style={{ display:'flex', gap:20, marginTop:16, padding:'10px 14px', background:'rgba(255,255,255,0.02)', borderRadius:8, flexWrap:'wrap' }}>
              {[['#7B5EFF','R — Responsable (fait le travail)'],['#ef4444','A — Approbateur (valide)'],['#f59e0b','C — Consulté (donne avis)'],['#22c55e','I — Informé (reçoit info)']].map(([c,l]) => (
                <span key={l as string} style={{ fontSize:11, color:c as string, fontWeight:600 }}>■ {l}</span>
              ))}
            </div>
          </div>
        )}

        {/* ── BUDGET WP ── */}
        {tab === 'budget' && (
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            <div style={card()}>
              <h2 style={{ fontSize:15, fontWeight:700, color:'#f1f5f9', margin:'0 0 20px' }}>💼 Budget par Work Package</h2>
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {BUDGET_WP.map((b, i) => {
                  const pct = b.reel > 0 ? Math.round(b.reel/b.budget*100) : 0
                  const over = b.reel > b.budget
                  return (
                    <div key={i} style={{ padding:'14px 16px', background:'rgba(255,255,255,0.03)', borderRadius:10, borderLeft:`3px solid ${b.color}` }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8, flexWrap:'wrap', gap:6 }}>
                        <span style={{ fontSize:13, fontWeight:600, color:'#e2e8f0' }}>{b.wp}</span>
                        <div style={{ display:'flex', gap:12 }}>
                          <span style={{ fontSize:11, color:'#64748b' }}>Budget : <strong style={{ color:'#94a3b8' }}>{b.budget}k€</strong></span>
                          <span style={{ fontSize:11, color: over ? '#ef4444' : '#22c55e' }}>Réel : <strong>{b.reel}k€</strong></span>
                          {b.reel > 0 && <span style={{ fontSize:11, fontWeight:700, color: over ? '#ef4444' : '#22c55e' }}>{pct}%</span>}
                        </div>
                      </div>
                      <div style={{ display:'flex', gap:4, alignItems:'center' }}>
                        <div style={{ flex:1, height:8, background:'rgba(255,255,255,0.06)', borderRadius:4, position:'relative', overflow:'hidden' }}>
                          <div style={{ width:`${Math.min(b.budget/8.5, 100)}%`, height:'100%', background:`${b.color}33`, borderRadius:4 }} />
                          {b.reel > 0 && <div style={{ position:'absolute', top:0, left:0, width:`${Math.min(b.reel/8.5, 100)}%`, height:'100%', background:b.color, borderRadius:4 }} />}
                        </div>
                        <span style={{ fontSize:10, color:'#475569', minWidth:60, textAlign:'right' }}>
                          {b.reel > 0 ? `${b.reel}/${b.budget}k€` : 'Non démarré'}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div style={{ marginTop:16, padding:'12px 16px', background:'rgba(255,255,255,0.03)', borderRadius:8, display:'flex', justifyContent:'space-between' }}>
                <span style={{ fontSize:12, color:'#64748b' }}>Dépensé à ce jour</span>
                <span style={{ fontSize:14, fontWeight:800, color:'#f59e0b' }}>269 000€ / 850 000€ (31.6%)</span>
              </div>
            </div>
          </div>
        )}

        {/* ── RESSOURCES ── */}
        {tab === 'ressources' && (
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
              {[
                { l:'Total ressources', v:'6', c:'#3b82f6' },
                { l:'Occupées',         v:'3', c:'#ef4444' },
                { l:'Partielles',       v:'3', c:'#f59e0b' },
                { l:'Taux moyen',       v:'82%', c:'#22c55e' },
              ].map(k => (
                <div key={k.l} style={{ ...card({ padding:'14px' }), textAlign:'center' }}>
                  <p style={{ fontSize:10, color:'#64748b', margin:'0 0 4px', textTransform:'uppercase' }}>{k.l}</p>
                  <p style={{ fontSize:22, fontWeight:800, color:k.c, margin:0 }}>{k.v}</p>
                </div>
              ))}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:12 }}>
              {RESOURCES.map((r, i) => (
                <div key={i} style={card({ padding:'16px' })}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                    <div style={{ width:40, height:40, borderRadius:'50%', background:'linear-gradient(135deg,#7B5EFF,#3b82f6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, color:'#fff', flexShrink:0 }}>
                      {r.name.split(' ').map(n=>n[0]).join('')}
                    </div>
                    <div style={{ flex:1 }}>
                      <p style={{ fontSize:13, fontWeight:700, color:'#f1f5f9', margin:0 }}>{r.name}</p>
                      <p style={{ fontSize:11, color:'#64748b', margin:'2px 0 0' }}>{r.role} · {r.rate}€/j</p>
                    </div>
                    <span style={{ fontSize:10, fontWeight:600, padding:'3px 8px', borderRadius:20, background: r.dispo===100?'rgba(239,68,68,0.15)':'rgba(245,158,11,0.15)', color:r.dispo===100?'#ef4444':'#f59e0b' }}>
                      {r.status}
                    </span>
                  </div>
                  <div style={{ marginBottom:10 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                      <span style={{ fontSize:10, color:'#64748b' }}>Charge</span>
                      <span style={{ fontSize:10, fontWeight:700, color: r.dispo>80?'#ef4444':'#f59e0b' }}>{r.dispo}%</span>
                    </div>
                    <div style={{ height:5, background:'rgba(255,255,255,0.06)', borderRadius:3 }}>
                      <div style={{ width:`${r.dispo}%`, height:'100%', background:r.dispo>80?'#ef4444':'#f59e0b', borderRadius:3 }} />
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginBottom:8 }}>
                    {r.skills.map(s => (
                      <span key={s} style={{ fontSize:10, padding:'2px 7px', borderRadius:4, background:'rgba(123,94,255,0.12)', color:'#a78bfa', border:'1px solid rgba(123,94,255,0.2)' }}>{s}</span>
                    ))}
                  </div>
                  <div style={{ display:'flex', gap:2 }}>
                    {Array.from({length:5},(_,j) => (
                      <span key={j} style={{ color: j<r.stars?'#f59e0b':'#374151', fontSize:12 }}>★</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── CTA FINAL ── */}
        <div style={{ textAlign:'center', padding:'48px 20px', background:'linear-gradient(135deg,rgba(123,94,255,0.08),rgba(59,130,246,0.08))', borderRadius:20, border:'1px solid rgba(123,94,255,0.15)', marginTop:16 }}>
          <p style={{ fontSize:13, color:'#7B5EFF', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', margin:'0 0 12px' }}>Vous venez de voir PMO AI Studio en action</p>
          <h2 style={{ fontSize:28, fontWeight:900, color:'#f1f5f9', margin:'0 0 12px', letterSpacing:'-0.5px' }}>Créez votre projet en 2 minutes</h2>
          <p style={{ fontSize:16, color:'#94a3b8', margin:'0 0 32px' }}>Gantt · EVM · RAID · WBS · RACI · Ressources · IA Claude — pour vos vrais projets.</p>
          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
            <Link href="/auth/inscription" style={{ display:'inline-block', padding:'14px 32px', borderRadius:12, fontSize:16, fontWeight:800, background:'linear-gradient(135deg,#7B5EFF,#3b82f6)', color:'#fff', textDecoration:'none', boxShadow:'0 4px 20px rgba(123,94,255,0.4)' }}>
              Commencer gratuitement →
            </Link>
            <Link href="/pricing" style={{ display:'inline-block', padding:'14px 32px', borderRadius:12, fontSize:16, fontWeight:600, background:'rgba(255,255,255,0.05)', color:'#e2e8f0', textDecoration:'none', border:'1px solid rgba(255,255,255,0.12)' }}>
              Voir les plans →
            </Link>
          </div>
          <p style={{ fontSize:12, color:'#475569', marginTop:14 }}>✓ Sans carte bancaire · ✓ Accès immédiat · ✓ Support inclus</p>
        </div>

      </div>
    </div>
  )
}
