'use client'
import { useState } from 'react'
import Link from 'next/link'
import PublicLayout from '@/components/public/PublicLayout'

const GANTT = [
  { task:'Charte & gouvernance',       start:1,  dur:2,  pct:100, color:'#7B5EFF', cp:false },
  { task:'Audit infrastructure',       start:2,  dur:3,  pct:100, color:'#7B5EFF', cp:false },
  { task:'Architecture cible Azure',   start:4,  dur:4,  pct:85,  color:'#3b82f6', cp:true  },
  { task:'Plan migration par vagues',  start:5,  dur:3,  pct:80,  color:'#3b82f6', cp:false },
  { task:'Landing Zone Azure',         start:7,  dur:5,  pct:60,  color:'#22c55e', cp:true  },
  { task:'Réseau & Sécurité cloud',    start:9,  dur:4,  pct:45,  color:'#22c55e', cp:true  },
  { task:'Vague 1 — Apps critiques',   start:11, dur:6,  pct:30,  color:'#f59e0b', cp:true  },
  { task:'Vague 2 — Apps secondaires', start:14, dur:5,  pct:10,  color:'#f59e0b', cp:false },
  { task:'Tests perf & sécurité',      start:16, dur:3,  pct:5,   color:'#ef4444', cp:true  },
  { task:'Formation & Go-Live',        start:17, dur:2,  pct:0,   color:'#64748b', cp:false },
]

const EVM = [
  { m:'Jan', pv:42,  ev:38,  ac:41  },
  { m:'Fév', pv:89,  ev:82,  ac:88  },
  { m:'Mar', pv:145, ev:131, ac:142 },
  { m:'Avr', pv:210, ev:188, ac:201 },
  { m:'Mai', pv:289, ev:251, ac:269 },
  { m:'Jun', pv:375, ev:0,   ac:0   },
  { m:'Jul', pv:460, ev:0,   ac:0   },
  { m:'Aoû', pv:545, ev:0,   ac:0   },
  { m:'Sep', pv:620, ev:0,   ac:0   },
  { m:'Oct', pv:695, ev:0,   ac:0   },
  { m:'Nov', pv:760, ev:0,   ac:0   },
  { m:'Déc', pv:820, ev:0,   ac:0   },
]

const RAID = [
  { t:'R', title:'Indisponibilité migration AS400',  prio:'Critique', status:'Ouvert',    c:'#ef4444', resp:'DSI',   mit:'Dual-run + tests failover' },
  { t:'R', title:'Non-conformité DORA/NIS2',         prio:'Critique', status:'En cours',  c:'#ef4444', resp:'RSSI',  mit:'Audit ISO 27001' },
  { t:'R', title:'Résistance au changement',         prio:'Haute',    status:'Ouvert',    c:'#f59e0b', resp:'RH',    mit:'Change mgmt 3 mois' },
  { t:'R', title:'Dépassement budget +15%',          prio:'Haute',    status:'Surveillé', c:'#f59e0b', resp:'Chef',  mit:'Réserve contingente 128k€' },
  { t:'A', title:'Valider architecture avec RSSI',   prio:'Haute',    status:'En cours',  c:'#3b82f6', resp:'Chef',  mit:'Réunion RSSI S12' },
  { t:'A', title:'Commander licences Azure EA',      prio:'Moyen',    status:'Terminé',   c:'#22c55e', resp:'DSI',   mit:'Contrat signé 120k€/an' },
  { t:'I', title:'Retard connecteurs legacy',        prio:'Haute',    status:'Ouvert',    c:'#ef4444', resp:'Tech',  mit:'Connecteur custom backup' },
  { t:'D', title:'Région Azure : France Central',   prio:'Info',     status:'Clos',      c:'#22c55e', resp:'COMEX', mit:'Décision COMEX validée' },
]

const WBS = [
  { l:0, code:'1.0',   label:'MigrateCloud Pro',             color:'#0078D4', budget:'850k€' },
  { l:1, code:'1.1',   label:'Initialisation & Gouvernance', color:'#7B5EFF', budget:'45k€'  },
  { l:2, code:'1.1.1', label:'Charte de projet',             color:'#94a3b8', budget:'8k€'   },
  { l:2, code:'1.1.2', label:'Comité de pilotage',           color:'#94a3b8', budget:'12k€'  },
  { l:2, code:'1.1.3', label:'Plan de communication',        color:'#94a3b8', budget:'25k€'  },
  { l:1, code:'1.2',   label:'Architecture & Sécurité',      color:'#3b82f6', budget:'120k€' },
  { l:2, code:'1.2.1', label:'Architecture cible Azure',     color:'#94a3b8', budget:'55k€'  },
  { l:2, code:'1.2.2', label:'Sécurité & Conformité DORA',   color:'#94a3b8', budget:'65k€'  },
  { l:1, code:'1.3',   label:'Infrastructure Cloud',         color:'#22c55e', budget:'280k€' },
  { l:2, code:'1.3.1', label:'Landing Zone Azure',           color:'#94a3b8', budget:'95k€'  },
  { l:2, code:'1.3.2', label:'Réseau, VPN & ExpressRoute',   color:'#94a3b8', budget:'85k€'  },
  { l:2, code:'1.3.3', label:'IAM & Zero Trust Security',    color:'#94a3b8', budget:'100k€' },
  { l:1, code:'1.4',   label:'Migration Applications',       color:'#f59e0b', budget:'320k€' },
  { l:2, code:'1.4.1', label:'Vague 1 — 4 apps critiques',  color:'#94a3b8', budget:'180k€' },
  { l:2, code:'1.4.2', label:'Vague 2 — 8 apps secondaires',color:'#94a3b8', budget:'140k€' },
  { l:1, code:'1.5',   label:'Tests & Recette',              color:'#ef4444', budget:'55k€'  },
  { l:1, code:'1.6',   label:'Formation & Go-Live',          color:'#64748b', budget:'30k€'  },
]

const RACI = [
  { task:'Architecture Azure',      v:['A','R','R','C','C','I'] },
  { task:'Migration données',       v:['A','R','C','I','C','I'] },
  { task:'Tests sécurité',          v:['C','A','C','I','R','I'] },
  { task:'Formation utilisateurs',  v:['I','A','I','R','I','C'] },
  { task:'Go-Live décision',        v:['C','R','C','C','C','A'] },
  { task:'Budget & finances',       v:['C','R','I','I','I','A'] },
]
const RACI_ROLES = ['DSI','Chef Projet','Architecte','Métier','RSSI','DG']
const RACI_C: Record<string,string> = { R:'#7B5EFF', A:'#ef4444', C:'#f59e0b', I:'#22c55e' }

const BUDGET = [
  { wp:'WP1 — Init & Gov',    b:45,  r:42,  c:'#7B5EFF' },
  { wp:'WP2 — Architecture',  b:120, r:115, c:'#3b82f6' },
  { wp:'WP3 — Infra Cloud',   b:280, r:112, c:'#22c55e' },
  { wp:'WP4 — Migration',     b:320, r:0,   c:'#f59e0b' },
  { wp:'WP5 — Tests',         b:55,  r:0,   c:'#ef4444' },
  { wp:'WP6 — Formation',     b:30,  r:0,   c:'#64748b' },
]

const RES = [
  { name:'Karim Benali',  role:'Chef de Projet',    d:100, s:'Occupé',  sk:['PMO','Azure','Gouvernance'], rate:850, stars:5 },
  { name:'Sophie Martin', role:'Architecte Cloud',  d:80,  s:'Partiel', sk:['Azure','DevOps','Sécurité'], rate:950, stars:5 },
  { name:'Mehdi Alaoui',  role:'Expert Migration',  d:100, s:'Occupé',  sk:['Azure Migrate','SQL'],        rate:800, stars:4 },
  { name:'Fatima Zahra',  role:'RSSI / Sécurité',   d:50,  s:'Partiel', sk:['ISO27001','DORA','NIS2'],     rate:900, stars:5 },
  { name:'Thomas Dupont', role:'Dev / Intégration', d:100, s:'Occupé',  sk:['API','Python','Terraform'],   rate:720, stars:4 },
  { name:'Leila Bennis',  role:'Change Management', d:60,  s:'Partiel', sk:['Formation','Communication'],  rate:650, stars:4 },
]

const TABS = [
  { id:'dashboard', label:'📊 Dashboard'   },
  { id:'gantt',     label:'📅 Gantt'       },
  { id:'evm',       label:'💰 EVM'         },
  { id:'raid',      label:'⚠️ RAID'        },
  { id:'wbs',       label:'🗂️ WBS'         },
  { id:'raci',      label:'👥 RACI'        },
  { id:'budget',    label:'💼 Budget WP'   },
  { id:'res',       label:'🧑‍💼 Ressources' },
]

const MAX = 920

const card = (e?: React.CSSProperties): React.CSSProperties => ({
  background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:24, ...e,
})

export default function DemoPage() {
  const [tab, setTab] = useState('dashboard')

  return (
    <PublicLayout>
    <div style={{ fontFamily:"'Inter','Segoe UI',Arial,sans-serif", background:'#0f172a', minHeight:'100vh', color:'#e2e8f0' }}>

      {/* Bannière */}
      <div style={{ background:'linear-gradient(135deg,#7B5EFF,#3b82f6)', padding:'10px 5%', textAlign:'center', position:'sticky', top:0, zIndex:100 }}>
        <p style={{ margin:0, fontSize:13, color:'#fff', fontWeight:600 }}>
          👁️ Mode lecture seule — Projet démo &nbsp;·&nbsp;
          <Link href="/auth/inscription" style={{ color:'#fde68a', fontWeight:800, textDecoration:'none' }}>Créez votre projet gratuitement →</Link>
        </p>
      </div>

      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,#1e293b,#0f172a)', borderBottom:'1px solid rgba(255,255,255,0.08)', padding:'20px 5%' }}>
        <div style={{ maxWidth:1400, margin:'0 auto' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16, flexWrap:'wrap', gap:12 }}>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:44, height:44, borderRadius:12, background:'rgba(0,120,212,0.2)', border:'1px solid rgba(0,120,212,0.4)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>☁️</div>
              <div>
                <h1 style={{ fontSize:18, fontWeight:800, margin:0, color:'#f1f5f9' }}>MigrateCloud Pro — Migration Azure</h1>
                <p style={{ fontSize:12, color:'#64748b', margin:'2px 0 0' }}>Banque Régionale du Maghreb · Jan 2026 → Jun 2027 · 12 personnes · 850k€</p>
              </div>
            </div>
            <span style={{ fontSize:11, padding:'4px 12px', borderRadius:20, background:'rgba(34,197,94,0.15)', color:'#22c55e', border:'1px solid rgba(34,197,94,0.3)', fontWeight:600 }}>🟢 En cours · Lecture seule</span>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(8,1fr)', gap:8 }}>
            {[{l:'Avancement',v:'34%',c:'#7B5EFF'},{l:'Budget BAC',v:'850k€',c:'#3b82f6'},{l:'CPI',v:'0.94',c:'#f59e0b'},{l:'SPI',v:'0.87',c:'#ef4444'},{l:'EAC',v:'903k€',c:'#f97316'},{l:'CV',v:'-18k€',c:'#ef4444'},{l:'TCPI',v:'1.02',c:'#22c55e'},{l:'Équipe',v:'12 pers.',c:'#06b6d4'}].map(k => (
              <div key={k.l} style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:8, padding:'8px 10px', textAlign:'center' }}>
                <p style={{ fontSize:9, color:'#64748b', margin:'0 0 3px', textTransform:'uppercase' }}>{k.l}</p>
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
              style={{ padding:'13px 16px', fontSize:13, fontWeight:600, border:'none', cursor:'pointer', background:'transparent', whiteSpace:'nowrap', transition:'all 0.15s',
                color: tab===t.id ? '#7B5EFF' : '#64748b',
                borderBottom: tab===t.id ? '2px solid #7B5EFF' : '2px solid transparent' }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth:1400, margin:'0 auto', padding:'28px 5%' }}>

        {/* DASHBOARD */}
        {tab==='dashboard' && (
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
              <div style={card()}>
                <p style={{ fontSize:13, fontWeight:700, color:'#f1f5f9', margin:'0 0 16px' }}>📈 Avancement par phase</p>
                {[{l:'Initialisation',p:100,c:'#7B5EFF'},{l:'Architecture',p:82,c:'#3b82f6'},{l:'Infrastructure',p:52,c:'#22c55e'},{l:'Migration',p:20,c:'#f59e0b'},{l:'Tests',p:3,c:'#ef4444'},{l:'Clôture',p:0,c:'#64748b'}].map(x => (
                  <div key={x.l} style={{ marginBottom:10 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                      <span style={{ fontSize:12, color:'#94a3b8' }}>{x.l}</span>
                      <span style={{ fontSize:12, fontWeight:700, color:x.c }}>{x.p}%</span>
                    </div>
                    <div style={{ height:6, background:'rgba(255,255,255,0.07)', borderRadius:3 }}>
                      <div style={{ width:`${x.p}%`, height:'100%', background:x.c, borderRadius:3 }} />
                    </div>
                  </div>
                ))}
              </div>
              <div style={card()}>
                <p style={{ fontSize:13, fontWeight:700, color:'#f1f5f9', margin:'0 0 16px' }}>🎯 Jalons clés</p>
                {[
                  {date:'2026-03-15',label:'Architecture validée',     done:true },
                  {date:'2026-06-30',label:'Landing Zone opérable',    done:false, current:true},
                  {date:'2026-10-31',label:'Vague 1 migrée & testée',  done:false},
                  {date:'2027-03-15',label:'Vague 2 migrée & testée',  done:false},
                  {date:'2027-06-30',label:'Go-Live final & clôture',  done:false},
                ].map((j,i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px', background:'rgba(255,255,255,0.03)', borderRadius:8, marginBottom:6 }}>
                    <div style={{ width:9, height:9, borderRadius:'50%', background: j.done?'#22c55e':j.current?'#f59e0b':'#334155', flexShrink:0, boxShadow:j.current?'0 0 6px #f59e0b':'none' }} />
                    <span style={{ fontSize:10, color:'#475569', fontFamily:'monospace', minWidth:76 }}>{j.date}</span>
                    <span style={{ fontSize:12, color:j.done?'#64748b':'#e2e8f0', textDecoration:j.done?'line-through':'none', flex:1 }}>{j.label}</span>
                    <span style={{ fontSize:9, fontWeight:600, padding:'2px 7px', borderRadius:10, background:j.done?'rgba(34,197,94,0.12)':j.current?'rgba(245,158,11,0.12)':'rgba(255,255,255,0.05)', color:j.done?'#22c55e':j.current?'#f59e0b':'#64748b' }}>
                      {j.done?'✓ Atteint':j.current?'⏳ En cours':'○ À venir'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            {/* Screenshot courbe S */}
            <div style={{ borderRadius:14, overflow:'hidden', boxShadow:'0 16px 50px rgba(0,0,0,0.35)', border:'1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ padding:'8px 16px', background:'rgba(255,255,255,0.04)', borderBottom:'1px solid rgba(255,255,255,0.08)', display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ display:'flex', gap:5 }}>
                  <div style={{ width:10, height:10, borderRadius:'50%', background:'#ef4444' }} />
                  <div style={{ width:10, height:10, borderRadius:'50%', background:'#f59e0b' }} />
                  <div style={{ width:10, height:10, borderRadius:'50%', background:'#22c55e' }} />
                </div>
                <span style={{ fontSize:11, color:'#64748b', marginLeft:4 }}>Courbe S EVM — Aperçu de l&apos;application</span>
              </div>
              <img src="/screenshots/dashboard-evm.png" alt="Dashboard EVM courbe S" style={{ width:'100%', display:'block', maxHeight:440, objectFit:'cover', objectPosition:'top' }} />
            </div>
          </div>
        )}

        {/* GANTT */}
        {tab==='gantt' && (
          <div style={card()}>
            <h2 style={{ fontSize:15, fontWeight:700, color:'#f1f5f9', margin:'0 0 20px' }}>📅 Planning Gantt — 10 tâches · 18 mois
              <span style={{ marginLeft:10, fontSize:10, padding:'2px 8px', borderRadius:10, background:'rgba(239,68,68,0.15)', color:'#ef4444', fontWeight:500 }}>● Chemin critique</span>
            </h2>
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11 }}>
                <thead>
                  <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.1)' }}>
                    <th style={{ textAlign:'left', padding:'8px 12px', color:'#64748b', minWidth:220 }}>Tâche</th>
                    <th style={{ padding:'8px 8px', color:'#64748b', width:70, textAlign:'center' }}>Avmt</th>
                    {Array.from({length:18},(_,i) => <th key={i} style={{ padding:'6px 2px', color:'#475569', fontSize:9, textAlign:'center', minWidth:26 }}>M{i+1}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {GANTT.map((t,i) => (
                    <tr key={i} style={{ borderBottom:'1px solid rgba(255,255,255,0.04)', background:t.cp?'rgba(239,68,68,0.03)':'transparent' }}>
                      <td style={{ padding:'8px 12px', color:'#e2e8f0', fontSize:12 }}>
                        {t.cp && <span style={{ color:'#ef4444', marginRight:4, fontSize:9 }}>●</span>}{t.task}
                      </td>
                      <td style={{ padding:'8px', textAlign:'center' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:4, justifyContent:'center' }}>
                          <div style={{ width:30, height:4, background:'rgba(255,255,255,0.08)', borderRadius:2 }}>
                            <div style={{ width:`${t.pct}%`, height:'100%', background:t.color, borderRadius:2 }} />
                          </div>
                          <span style={{ fontSize:9, color:'#64748b' }}>{t.pct}%</span>
                        </div>
                      </td>
                      {Array.from({length:18},(_,m) => {
                        const inn = m>=t.start-1 && m<t.start-1+t.dur
                        return <td key={m} style={{ padding:'4px 2px' }}>{inn && <div style={{ height:13, borderRadius:2, background:t.pct===100?t.color:`${t.color}44`, border:`1px solid ${t.color}66` }} />}</td>
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* EVM */}
        {tab==='evm' && (
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
              {[{l:'PV Planifiée',v:'289k€',c:'#3b82f6',s:'Budget prévu'},{l:'EV Acquise',v:'251k€',c:'#7B5EFF',s:'Travail fait'},{l:'AC Coût Réel',v:'269k€',c:'#f59e0b',s:'Dépensé'},{l:'BAC Total',v:'850k€',c:'#94a3b8',s:'Budget initial'},{l:'CV Écart Coût',v:'-18k€',c:'#ef4444',s:'Sur budget'},{l:'SV Écart Délai',v:'-38k€',c:'#ef4444',s:'En retard'},{l:'EAC Prévision',v:'903k€',c:'#f97316',s:'Coût estimé fin'},{l:'TCPI',v:'1.02',c:'#f59e0b',s:'Efficacité requise'}].map(k => (
                <div key={k.l} style={{ ...card({padding:'14px 16px'}), borderLeft:`3px solid ${k.c}` }}>
                  <p style={{ fontSize:10, color:'#64748b', margin:'0 0 3px', textTransform:'uppercase' }}>{k.l}</p>
                  <p style={{ fontSize:20, fontWeight:800, color:k.c, margin:'0 0 3px' }}>{k.v}</p>
                  <p style={{ fontSize:10, color:'#475569', margin:0 }}>{k.s}</p>
                </div>
              ))}
            </div>
            <div style={card()}>
              <p style={{ fontSize:13, fontWeight:700, color:'#f1f5f9', margin:'0 0 20px' }}>📈 Courbe S — PV / EV / AC / EAC (k€)</p>
              <div style={{ position:'relative', height:220 }}>
                {[0,25,50,75,100].map(p => (
                  <div key={p} style={{ position:'absolute', left:40, right:0, bottom:`${p*2.1}px`, borderTop:'1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ fontSize:9, color:'#475569', position:'absolute', left:-38, top:-6 }}>{Math.round(p*MAX/100)}k</span>
                  </div>
                ))}
                <svg width="100%" height="220" style={{ position:'absolute', inset:0 }} viewBox="0 0 800 220" preserveAspectRatio="none">
                  <line x1="0" y1={220-(903/MAX)*200} x2="800" y2={220-(903/MAX)*200} stroke="#f97316" strokeWidth="1.5" strokeDasharray="6,4" opacity="0.6"/>
                  <polyline fill="none" stroke="#3b82f6" strokeWidth="2.5" points={EVM.map((d,i)=>`${i*(800/11)},${220-(d.pv/MAX)*200}`).join(' ')}/>
                  <polyline fill="none" stroke="#7B5EFF" strokeWidth="2.5" points={EVM.filter(d=>d.ev>0).map((d,i)=>`${i*(800/11)},${220-(d.ev/MAX)*200}`).join(' ')}/>
                  <polyline fill="none" stroke="#f59e0b" strokeWidth="2.5" points={EVM.filter(d=>d.ac>0).map((d,i)=>`${i*(800/11)},${220-(d.ac/MAX)*200}`).join(' ')}/>
                  {EVM.slice(0,5).map((d,i) => <circle key={i} cx={i*(800/11)} cy={220-(d.pv/MAX)*200} r="4" fill="#3b82f6"/>)}
                  {EVM.filter(d=>d.ev>0).map((d,i) => <circle key={i} cx={i*(800/11)} cy={220-(d.ev/MAX)*200} r="4" fill="#7B5EFF"/>)}
                  <line x1={4*(800/11)} y1="0" x2={4*(800/11)} y2="220" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="4,3"/>
                  <text x={4*(800/11)+6} y="14" fill="rgba(255,255,255,0.35)" fontSize="10">Aujourd&apos;hui</text>
                </svg>
                <div style={{ position:'absolute', bottom:-20, left:40, right:0, display:'flex', justifyContent:'space-between' }}>
                  {EVM.map(d=><span key={d.m} style={{ fontSize:9, color:'#475569' }}>{d.m}</span>)}
                </div>
              </div>
              <div style={{ display:'flex', gap:20, marginTop:28, justifyContent:'center', flexWrap:'wrap' }}>
                {[['#3b82f6','PV Planifiée'],['#7B5EFF','EV Acquise'],['#f59e0b','AC Coût Réel'],['#f97316','EAC Prévision (----)']].map(([c,l])=>(
                  <span key={l as string} style={{ fontSize:11, color:c as string, fontWeight:600, display:'flex', alignItems:'center', gap:6 }}>
                    <span style={{ width:18, height:2, background:c as string, display:'inline-block' }}/>{l}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* RAID */}
        {tab==='raid' && (
          <div style={card()}>
            <h2 style={{ fontSize:15, fontWeight:700, color:'#f1f5f9', margin:'0 0 20px' }}>⚠️ RAID Register — 8 entrées · 3 critiques</h2>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {RAID.map((r,i) => (
                <div key={i} style={{ display:'grid', gridTemplateColumns:'28px 1fr 72px 86px 70px 160px', gap:10, alignItems:'center', padding:'12px 14px', background:'rgba(255,255,255,0.03)', borderRadius:10, borderLeft:`3px solid ${r.c}` }}>
                  <span style={{ fontSize:11, fontWeight:800, color:r.c, background:`${r.c}22`, width:22, height:22, borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center' }}>{r.t}</span>
                  <p style={{ fontSize:12, color:'#e2e8f0', margin:0, fontWeight:500 }}>{r.title}</p>
                  <span style={{ fontSize:9, fontWeight:700, padding:'2px 7px', borderRadius:10, background:`${r.c}22`, color:r.c, textAlign:'center' }}>{r.prio}</span>
                  <span style={{ fontSize:10, color:r.status==='Terminé'||r.status==='Clos'?'#22c55e':r.status==='En cours'?'#f59e0b':'#94a3b8', fontWeight:600 }}>{r.status}</span>
                  <span style={{ fontSize:10, color:'#64748b' }}>{r.resp}</span>
                  <p style={{ fontSize:10, color:'#64748b', margin:0 }}>{r.mit}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* WBS */}
        {tab==='wbs' && (
          <div style={card()}>
            <h2 style={{ fontSize:15, fontWeight:700, color:'#f1f5f9', margin:'0 0 20px' }}>🗂️ WBS — {WBS.length} éléments</h2>
            <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
              {WBS.map((w,i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:`7px 12px 7px ${w.l===0?12:w.l===1?28:52}px`, background:w.l===0?'rgba(0,120,212,0.12)':w.l===1?'rgba(255,255,255,0.04)':'transparent', borderRadius:7, borderLeft:w.l>0?`2px solid ${w.color}44`:'none', marginLeft:w.l===1?10:w.l===2?24:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <span style={{ fontSize:10, color:'#475569', fontFamily:'monospace', minWidth:48 }}>{w.code}</span>
                    <span style={{ fontSize:w.l===0?14:w.l===1?13:12, fontWeight:w.l===0?800:w.l===1?700:400, color:w.l===0?'#60a5fa':w.l===1?w.color:'#94a3b8' }}>{w.label}</span>
                  </div>
                  <span style={{ fontSize:11, fontWeight:600, color:w.color, background:`${w.color}15`, padding:'2px 10px', borderRadius:6 }}>{w.budget}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RACI */}
        {tab==='raci' && (
          <div style={card()}>
            <h2 style={{ fontSize:15, fontWeight:700, color:'#f1f5f9', margin:'0 0 20px' }}>👥 Matrice RACI — 6 activités × 6 rôles</h2>
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
                <thead>
                  <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.1)' }}>
                    <th style={{ textAlign:'left', padding:'10px 14px', color:'#64748b', minWidth:200 }}>Activité</th>
                    {RACI_ROLES.map(r => <th key={r} style={{ padding:'10px 14px', color:'#64748b', textAlign:'center', fontSize:11 }}>{r}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {RACI.map((row,i) => (
                    <tr key={i} style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding:'10px 14px', color:'#e2e8f0' }}>{row.task}</td>
                      {row.v.map((v,j) => (
                        <td key={j} style={{ padding:'10px 14px', textAlign:'center' }}>
                          <span style={{ fontSize:12, fontWeight:800, width:28, height:28, borderRadius:8, background:`${RACI_C[v]}22`, color:RACI_C[v], border:`1px solid ${RACI_C[v]}44`, display:'inline-flex', alignItems:'center', justifyContent:'center' }}>{v}</span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ display:'flex', gap:20, marginTop:14, padding:'10px 14px', background:'rgba(255,255,255,0.02)', borderRadius:8, flexWrap:'wrap' }}>
              {[['#7B5EFF','R — Responsable'],['#ef4444','A — Approbateur'],['#f59e0b','C — Consulté'],['#22c55e','I — Informé']].map(([c,l]) => (
                <span key={l as string} style={{ fontSize:11, color:c as string, fontWeight:600 }}>■ {l}</span>
              ))}
            </div>
          </div>
        )}

        {/* BUDGET */}
        {tab==='budget' && (
          <div style={card()}>
            <h2 style={{ fontSize:15, fontWeight:700, color:'#f1f5f9', margin:'0 0 20px' }}>💼 Budget par Work Package</h2>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {BUDGET.map((b,i) => {
                const pct = b.r>0 ? Math.round(b.r/b.b*100) : 0
                return (
                  <div key={i} style={{ padding:'14px 16px', background:'rgba(255,255,255,0.03)', borderRadius:10, borderLeft:`3px solid ${b.c}` }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8, flexWrap:'wrap', gap:6 }}>
                      <span style={{ fontSize:13, fontWeight:600, color:'#e2e8f0' }}>{b.wp}</span>
                      <div style={{ display:'flex', gap:14 }}>
                        <span style={{ fontSize:11, color:'#64748b' }}>Budget : <strong style={{ color:'#94a3b8' }}>{b.b}k€</strong></span>
                        <span style={{ fontSize:11, color:b.r>0?'#22c55e':'#475569' }}>Réel : <strong>{b.r>0?`${b.r}k€`:'—'}</strong></span>
                        {b.r>0 && <span style={{ fontSize:11, fontWeight:700, color:'#22c55e' }}>{pct}%</span>}
                      </div>
                    </div>
                    <div style={{ height:8, background:'rgba(255,255,255,0.06)', borderRadius:4, overflow:'hidden' }}>
                      <div style={{ width:`${Math.min(b.b/8.5,100)}%`, height:'100%', background:`${b.c}33`, borderRadius:4, position:'relative' }}>
                        {b.r>0 && <div style={{ position:'absolute', top:0, left:0, width:`${Math.min(b.r/b.b*100,100)}%`, height:'100%', background:b.c, borderRadius:4 }} />}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div style={{ marginTop:16, padding:'12px 16px', background:'rgba(255,255,255,0.03)', borderRadius:8, display:'flex', justifyContent:'space-between' }}>
              <span style={{ fontSize:12, color:'#64748b' }}>Dépensé à ce jour</span>
              <span style={{ fontSize:14, fontWeight:800, color:'#f59e0b' }}>269k€ / 850k€ (31.6%)</span>
            </div>
          </div>
        )}

        {/* RESSOURCES */}
        {tab==='res' && (
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
              {[{l:'Total',v:'6',c:'#3b82f6'},{l:'Occupées',v:'3',c:'#ef4444'},{l:'Partielles',v:'3',c:'#f59e0b'},{l:'Taux moyen',v:'82%',c:'#22c55e'}].map(k => (
                <div key={k.l} style={{ ...card({padding:'14px'}), textAlign:'center' }}>
                  <p style={{ fontSize:10, color:'#64748b', margin:'0 0 4px', textTransform:'uppercase' }}>{k.l}</p>
                  <p style={{ fontSize:22, fontWeight:800, color:k.c, margin:0 }}>{k.v}</p>
                </div>
              ))}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:12 }}>
              {RES.map((r,i) => (
                <div key={i} style={card({padding:'16px'})}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                    <div style={{ width:40, height:40, borderRadius:'50%', background:'linear-gradient(135deg,#7B5EFF,#3b82f6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, color:'#fff', flexShrink:0 }}>
                      {r.name.split(' ').map(n=>n[0]).join('')}
                    </div>
                    <div style={{ flex:1 }}>
                      <p style={{ fontSize:13, fontWeight:700, color:'#f1f5f9', margin:0 }}>{r.name}</p>
                      <p style={{ fontSize:11, color:'#64748b', margin:'2px 0 0' }}>{r.role} · {r.rate}€/j</p>
                    </div>
                    <span style={{ fontSize:10, fontWeight:600, padding:'3px 8px', borderRadius:20, background:r.d===100?'rgba(239,68,68,0.15)':'rgba(245,158,11,0.15)', color:r.d===100?'#ef4444':'#f59e0b' }}>{r.s}</span>
                  </div>
                  <div style={{ marginBottom:10 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                      <span style={{ fontSize:10, color:'#64748b' }}>Charge</span>
                      <span style={{ fontSize:10, fontWeight:700, color:r.d>80?'#ef4444':'#f59e0b' }}>{r.d}%</span>
                    </div>
                    <div style={{ height:5, background:'rgba(255,255,255,0.06)', borderRadius:3 }}>
                      <div style={{ width:`${r.d}%`, height:'100%', background:r.d>80?'#ef4444':'#f59e0b', borderRadius:3 }} />
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginBottom:8 }}>
                    {r.sk.map(s => <span key={s} style={{ fontSize:10, padding:'2px 7px', borderRadius:4, background:'rgba(123,94,255,0.12)', color:'#a78bfa', border:'1px solid rgba(123,94,255,0.2)' }}>{s}</span>)}
                  </div>
                  <div style={{ display:'flex', gap:2 }}>
                    {Array.from({length:5},(_,j) => <span key={j} style={{ color:j<r.stars?'#f59e0b':'#374151', fontSize:12 }}>★</span>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div style={{ textAlign:'center', padding:'48px 20px', background:'linear-gradient(135deg,rgba(123,94,255,0.08),rgba(59,130,246,0.08))', borderRadius:20, border:'1px solid rgba(123,94,255,0.15)', marginTop:16 }}>
          <p style={{ fontSize:13, color:'#7B5EFF', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', margin:'0 0 12px' }}>Vous venez de voir PMO AI Studio en action</p>
          <h2 style={{ fontSize:26, fontWeight:900, color:'#f1f5f9', margin:'0 0 12px' }}>Créez votre projet en 2 minutes</h2>
          <p style={{ fontSize:15, color:'#94a3b8', margin:'0 0 32px' }}>Gantt · EVM · RAID · WBS · RACI · Ressources · IA Claude intégrée</p>
          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
            <Link href="/auth/inscription" style={{ display:'inline-block', padding:'14px 32px', borderRadius:12, fontSize:16, fontWeight:800, background:'linear-gradient(135deg,#7B5EFF,#3b82f6)', color:'#fff', textDecoration:'none', boxShadow:'0 4px 20px rgba(123,94,255,0.4)' }}>Commencer gratuitement →</Link>
            <Link href="/pricing" style={{ display:'inline-block', padding:'14px 32px', borderRadius:12, fontSize:15, fontWeight:600, background:'rgba(255,255,255,0.05)', color:'#e2e8f0', textDecoration:'none', border:'1px solid rgba(255,255,255,0.12)' }}>Voir les plans →</Link>
          </div>
          <p style={{ fontSize:12, color:'#475569', marginTop:14 }}>✓ Sans carte bancaire · ✓ Accès immédiat · ✓ Support inclus</p>
        </div>

      </div>
    </div>
  </PublicLayout>
  )
}