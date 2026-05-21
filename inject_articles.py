import re, os

PATH = "src/app/(app)/blog/[slug]/page.tsx"

with open(PATH, encoding="utf-8") as f:
    content = f.read()

# ── 9 composants Article* ────────────────────────────────────────────────────
COMPONENTS = r'''
function ArticleCPI({ editMode, images, onImageUpdate }: any) {
  return (
    <div>
      <p style={P}>Votre CPI vient de passer sous 1. Le client appelle. L&apos;équipe est sous pression. Que faites-vous dans les 48 prochaines heures ? Voici le plan d&apos;action complet basé sur un cas réel : la Clinique Privée Al Shifa à Rabat — CPI 0.75, SPI 0.62, EAC 5.5M€ pour un BAC de 4.2M€.</p>
      <ImageEditor src={images["cpi-dashboard"] || "/blog/images/dashboard/atlantis-dashboard.png"}
        alt="Dashboard PMO — CPI 0.83 Hôtel Atlantis"
        caption="📊 Dashboard PMO AI Studio — CPI 0.83, SPI 0.76, VAC -512 048€ — Rénovation Grand Hôtel Atlantis"
        onUpdate={(src,cap) => onImageUpdate("cpi-dashboard", src, cap)}/>
      <div style={ALERT_RED}><strong>🚨 Signal d&apos;alarme :</strong> CPI = 0.75 signifie que pour chaque euro dépensé, vous ne produisez que 0.75€ de valeur. Sur 4.2M€ de budget, c&apos;est 1.05M€ de valeur perdue si rien ne change.</div>
      <h2 style={H2}>📊 Comprendre ce que dit vraiment votre CPI</h2>
      <div style={TABLE_WRAP}><table style={TABLE}><thead><tr>
        <th style={TH}>CPI</th><th style={TH}>Signal</th><th style={TH}>Action requise</th><th style={TH}>Délai</th>
      </tr></thead><tbody>
        {[
          ["≥ 1.05","✅ Sous budget","Maintenir le rythme","—"],
          ["0.95 – 1.04","🟡 Attention","Surveiller de près","7 jours"],
          ["0.85 – 0.94","🟠 Alerte","Plan corrective","48h"],
          ["0.75 – 0.84","🔴 Critique","Escalade immédiate","24h"],
          ["< 0.75","💥 Crise","Révision périmètre","Immédiat"],
        ].map(([cpi,sig,act,del],i) => (
          <tr key={i} style={{background:i%2===0?"var(--bg-card)":"var(--bg)",borderBottom:"1px solid var(--border)"}}>
            <td style={TD}><strong style={{color:"var(--primary-light)"}}>{cpi}</strong></td>
            <td style={TD}>{sig}</td><td style={TD}>{act}</td><td style={TD}>{del}</td>
          </tr>
        ))}
      </tbody></table></div>
      <h2 style={H2}>🔧 Plan d&apos;action 48h — Protocole de crise CPI</h2>
      <p style={P}><strong style={{color:"var(--text-1)"}}>H+0 — Diagnostic (2h) :</strong> Identifiez quelles tâches tirent le CPI vers le bas. Dans PMO AI Studio, ouvrez l&apos;onglet Rapport EVM et triez par CPI croissant. Les 2-3 tâches avec le CPI le plus bas sont vos priorités.</p>
      <p style={P}><strong style={{color:"var(--text-1)"}}>H+4 — Communication (1h) :</strong> Ne cachez pas. Préparez une note d&apos;arbitrage avec 3 scénarios : réduire le périmètre, augmenter le budget, accepter le retard. Présentez les chiffres EVM — ils donnent de la crédibilité.</p>
      <p style={P}><strong style={{color:"var(--text-1)"}}>H+24 — Actions correctives :</strong> Réaffectez les ressources des tâches à CPI élevé vers les tâches critiques. Renégociez les contrats fournisseurs sur les lots en dépassement. Activez les réserves de contingence si disponibles.</p>
      <div style={ALERT_ORANGE}><strong>⚡ Formule clé :</strong> EAC = BAC / CPI — Si votre BAC est 4.2M€ et CPI = 0.75, votre EAC = 5.6M€. C&apos;est 1.4M€ de dépassement à expliquer et provisionner dès maintenant.</div>
      <h2 style={H2}>📋 Les 5 erreurs fatales quand le CPI passe sous 1</h2>
      {[
        ["❌ Attendre que ça se corrige seul","Le CPI suit une tendance. Si vous étiez à 0.90 en mars et 0.83 en mai, vous serez à 0.76 en juillet. Agissez tôt."],
        ["❌ Masquer les chiffres au client","Les clients supportent mieux un problème annoncé qu&apos;une surprise en fin de projet. La transparence EVM renforce la confiance."],
        ["❌ Ajouter des ressources sans diagnostic","Plus de ressources sur un processus défaillant = plus de coûts, même CPI. Diagnostiquez d&apos;abord, renforcez ensuite."],
        ["❌ Réviser le BAC à la hausse sans EAC","Rebasalining sans analyse = perte de visibilité historique. Gardez le BAC original, créez un EAC documenté."],
        ["❌ Ignorer le SPI","CPI et SPI sont liés. Un retard force souvent des heures supplémentaires qui creusent le CPI. Traitez les deux ensemble."],
      ].map(([titre,desc],i) => (
        <div key={i} style={{background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:8,padding:"12px 16px",marginBottom:10}}>
          <p style={{...P,margin:0,fontWeight:700,color:"var(--text-1)"}}>{titre}</p>
          <p style={{...P,margin:"6px 0 0",fontSize:13}}>{desc}</p>
        </div>
      ))}
      <div style={ALERT_GREEN}><strong>✅ Bonne pratique PMI :</strong> Le PMBOK 7 recommande de mettre à jour l&apos;EVM à chaque période de reporting. PMO AI Studio le fait automatiquement — modifiez l&apos;AC réel, la courbe S se recalcule instantanément.</div>
    </div>
  )
}

function ArticleRAID({ editMode, images, onImageUpdate }: any) {
  return (
    <div>
      <p style={P}>12 éléments RAID, 5 risques, 3 critiques ouverts. C&apos;est le tableau de bord de FinTrack Pro aujourd&apos;hui. Sans RAID Register structuré, ces risques restent dans les emails et les réunions — invisibles jusqu&apos;à ce qu&apos;ils deviennent des crises.</p>
      <ImageEditor src={images["raid-register"] || "/blog/images/raid/fintrack-raid.png"}
        alt="RAID Register PMO AI Studio — FinTrack Pro"
        caption="⚠️ RAID Register — FinTrack Pro · 12 éléments · 5 risques · 3 critiques · PMO AI Studio"
        onUpdate={(src,cap) => onImageUpdate("raid-register", src, cap)}/>
      <h2 style={H2}>🔤 RAID : que signifie chaque lettre ?</h2>
      <div style={TABLE_WRAP}><table style={TABLE}><thead><tr>
        <th style={TH}>Lettre</th><th style={TH}>Signification</th><th style={TH}>Exemple concret</th><th style={TH}>Owner typique</th>
      </tr></thead><tbody>
        {[
          ["R — Risks","Événements incertains pouvant impacter le projet","Adoption insuffisante 50k users (FinTrack)","Product Manager"],
          ["A — Actions","Décisions à prendre ou tâches de suivi critiques","Valider architecture open banking avant Sprint 3","Tech Lead"],
          ["I — Issues","Problèmes actifs bloquant l&apos;avancement","API bancaire instable — 3 partenaires déconnectés","Security Manager"],
          ["D — Decisions","Choix stratégiques documentés et datés","Migration Flutter vs React Native — décidé 15/03","Chef de Projet"],
        ].map(([let_,sig,ex,own],i) => (
          <tr key={i} style={{background:i%2===0?"var(--bg-card)":"var(--bg)",borderBottom:"1px solid var(--border)"}}>
            <td style={TD}><strong style={{color:"var(--primary-light)"}}>{let_}</strong></td>
            <td style={TD}>{sig}</td><td style={TD}><em>{ex}</em></td><td style={TD}>{own}</td>
          </tr>
        ))}
      </tbody></table></div>
      <h2 style={H2}>⚡ Les 3 risques critiques de FinTrack Pro</h2>
      {[
        {titre:"🔴 Conformité RGPD et protection données financières",resp:"Chief Legal Officer",impact:"Amendes jusqu&apos;à 4% du CA + perte de confiance",mitigation:"Audit RGPD complet, chiffrement AES-256, consentement explicite"},
        {titre:"🔴 Sécurité API bancaires et fraude",resp:"Security Manager",impact:"Compromission tokens, vol données financières",mitigation:"OAuth 2.0 + 2FA biométrique, WAF, pen testing mensuel"},
        {titre:"🔴 Adoption insuffisante — cible 50k utilisateurs",resp:"Product Manager",impact:"Non-viabilité du modèle freemium",mitigation:"Plan marketing agressif, referral 5€, partenariats bancaires"},
      ].map((r,i) => (
        <div key={i} style={{background:"rgba(239,68,68,0.05)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:10,padding:"14px 16px",marginBottom:12}}>
          <p style={{...P,margin:"0 0 6px",fontWeight:700,color:"var(--text-1)"}}>{r.titre}</p>
          <p style={{...P,margin:"0 0 4px",fontSize:12}}><strong>Responsable :</strong> {r.resp}</p>
          <p style={{...P,margin:"0 0 4px",fontSize:12}}><strong>Impact :</strong> {r.impact}</p>
          <p style={{...P,margin:0,fontSize:12}}><strong>Mitigation :</strong> {r.mitigation}</p>
        </div>
      ))}
      <div style={ALERT_ORANGE}><strong>📌 Règle d&apos;or RAID :</strong> Un risque sans owner et sans date d&apos;échéance n&apos;est pas un risque géré — c&apos;est une bombe à retardement. PMO AI Studio force ces deux champs à la création.</div>
      <h2 style={H2}>✅ 5 bonnes pratiques RAID</h2>
      {["Revoir le RAID en réunion hebdomadaire — pas mensuelle","Chaque risque critique doit avoir un plan B documenté","Fermez les issues résolues immédiatement — un RAID propre est un RAID utile","Liez les décisions aux risques qu&apos;elles mitigent","Exportez le RAID en PDF pour chaque COPIL — c&apos;est votre bouclier contractuel"].map((item,i) => (
        <p key={i} style={{...P,paddingLeft:16,borderLeft:"3px solid var(--primary-light)"}}><strong>{i+1}.</strong> {item}</p>
      ))}
    </div>
  )
}

function ArticleSprint({ editMode, images, onImageUpdate }: any) {
  return (
    <div>
      <p style={P}>Le Sprint Planning mal exécuté coûte en moyenne 2 jours de productivité par sprint. Sur 10 sprints, c&apos;est 3 semaines perdues. Voici les 8 étapes pour transformer votre Sprint Planning en moteur de livraison — illustrées avec FinTrack Pro, 5 sprints, 15 stories.</p>
      <ImageEditor src={images["sprint-planning"] || "/blog/images/evm/fintrack-courbe-s.png"}
        alt="Sprint Planning FinTrack Pro — PMO AI Studio"
        caption="📅 Sprint Planning — FinTrack Pro · Vélocité moyenne 42 pts · CPI 1.07 · PMO AI Studio"
        onUpdate={(src,cap) => onImageUpdate("sprint-planning", src, cap)}/>
      <h2 style={H2}>🔢 Les 8 étapes du Sprint Planning parfait</h2>
      {[
        {n:"1",titre:"Préparer le Product Backlog raffiné (J-2)",desc:"Le PO présente les stories priorisées avec critères d&apos;acceptance. Minimum 2 sprints de backlog raffiné en avance. Sans refinement préalable, le planning dure 2x plus longtemps."},
        {n:"2",titre:"Définir la vélocité de référence",desc:"Calculez la moyenne des 3 derniers sprints. FinTrack Pro : 38 + 45 + 43 = 42 pts/sprint. C&apos;est votre capacité de base — pas une cible à dépasser."},
        {n:"3",titre:"Ajuster la capacité réelle",desc:"Retirez congés, formations, incidents prévus. Si 2 devs absents 2 jours sur 10 : capacité = 42 × (1 - 4/50) = 38.6 pts."},
        {n:"4",titre:"Définir le Sprint Goal en 1 phrase",desc:"\"Permettre aux utilisateurs de connecter leur compte bancaire et voir leurs dépenses catégorisées.\" Un bon Sprint Goal est testable et compréhensible par le client."},
        {n:"5",titre:"Sélectionner les stories du backlog",desc:"Choisissez les stories les plus prioritaires jusqu&apos;à atteindre la capacité ajustée. Ne dépassez jamais 110% de la vélocité."},
        {n:"6",titre:"Décomposer en tâches techniques (< 1 jour)",desc:"Chaque story devient 3-8 tâches de moins de 8h. Si une tâche dépasse 8h, elle cache de la complexité — décomposez encore."},
        {n:"7",titre:"Identifier les dépendances et risques",desc:"Y a-t-il des dépendances externes ? API tierce, validation juridique, livraison infra ? Documentez-les dans le RAID avant de démarrer."},
        {n:"8",titre:"Valider l&apos;engagement de l&apos;équipe",desc:"L&apos;équipe dit \"on s&apos;engage\" — pas \"on essaie\". La différence est fondamentale. Un sprint est un contrat interne, pas une liste de souhaits."},
      ].map((step,i) => (
        <div key={i} style={{display:"flex",gap:14,marginBottom:16,alignItems:"flex-start"}}>
          <div style={{minWidth:32,height:32,borderRadius:"50%",background:"var(--primary-light)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:14,color:"#fff",flexShrink:0}}>{step.n}</div>
          <div>
            <p style={{...P,margin:"0 0 4px",fontWeight:700,color:"var(--text-1)"}}>{step.titre}</p>
            <p style={{...P,margin:0,fontSize:13}}>{step.desc}</p>
          </div>
        </div>
      ))}
      <div style={ALERT_GREEN}><strong>📊 Métrique clé :</strong> Un Sprint Planning efficace dure 2h max pour un sprint de 2 semaines. Si vous dépassez, c&apos;est que le backlog n&apos;est pas assez raffiné.</div>
    </div>
  )
}

function ArticleDevOps({ editMode, images, onImageUpdate }: any) {
  return (
    <div>
      <p style={P}>&quot;Le PMO ralentit nos déploiements.&quot; Combien de fois avez-vous entendu ça ? Pourtant la Migration JBOSS EAP — 35 applications, 600k€, CPI 0.98 — prouve que PMO et DevOps peuvent cohabiter. Voici le framework hybride qui réconcilie les deux.</p>
      <div style={ALERT_ORANGE}><strong>⚡ Paradoxe DevOps-PMO :</strong> Les équipes DevOps déploient 10x/jour mais n&apos;ont aucune visibilité budget. Les PMO ont des tableaux de bord parfaits mais des cycles de livraison de 6 mois. La vérité est entre les deux.</div>
      <h2 style={H2}>🔄 Les 5 tensions DevOps vs PMO — et comment les résoudre</h2>
      {[
        ["Vélocité vs Gouvernance","DevOps veut déployer vite. PMO veut contrôler.","Automatiser les gates de qualité dans le pipeline CI/CD. SonarQube + tests auto remplacent les revues manuelles."],
        ["Documentation vs Working Software","PMO exige des livrables. DevOps préfère le code.","Infrastructure as Code (IaC) = documentation vivante. Le Terraform file IS le livrable."],
        ["Risques vs Expérimentation","PMO liste les risques. DevOps les teste en prod.","Feature flags + canary releases = expérimentation contrôlée avec rollback en 30 secondes."],
        ["Reporting vs Monitoring","PMO fait des rapports mensuels. DevOps a des dashboards temps réel.","Connecter Grafana/Datadog au PMO Dashboard. Les métriques DORA remplacent les rapports statiques."],
        ["Budget annuel vs Investissement continu","PMO pense en projets. DevOps pense en produits.","Shift vers le Product Funding Model : budgets alloués aux équipes produit, pas aux projets."],
      ].map(([tens,prob,sol],i) => (
        <div key={i} style={{background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:10,padding:"14px 16px",marginBottom:12}}>
          <p style={{...P,margin:"0 0 6px",fontWeight:800,color:"var(--primary-light)"}}>{tens}</p>
          <p style={{...P,margin:"0 0 4px",fontSize:12}}><strong style={{color:"#ef4444"}}>Tension :</strong> {prob}</p>
          <p style={{...P,margin:0,fontSize:12}}><strong style={{color:"#22c55e"}}>Solution :</strong> {sol}</p>
        </div>
      ))}
      <h2 style={H2}>📊 Les 4 métriques DORA — le pont entre DevOps et PMO</h2>
      <div style={TABLE_WRAP}><table style={TABLE}><thead><tr>
        <th style={TH}>Métrique DORA</th><th style={TH}>Ce qu&apos;elle mesure</th><th style={TH}>Elite 2024</th><th style={TH}>Équivalent PMO</th>
      </tr></thead><tbody>
        {[
          ["Deployment Frequency","Fréquence des déploiements","Plusieurs/jour","Vélocité sprint"],
          ["Lead Time for Changes","Délai code → prod","< 1 heure","SPI — Schedule Performance"],
          ["Change Failure Rate","% déploiements avec incidents","< 5%","Qualité livrables"],
          ["Time to Restore","Délai de récupération incident","< 1 heure","Résilience / MTTR"],
        ].map(([met,mes,eli,pmo],i) => (
          <tr key={i} style={{background:i%2===0?"var(--bg-card)":"var(--bg)",borderBottom:"1px solid var(--border)"}}>
            <td style={TD}><strong style={{color:"var(--primary-light)"}}>{met}</strong></td>
            <td style={TD}>{mes}</td><td style={TD}><strong style={{color:"#22c55e"}}>{eli}</strong></td><td style={TD}>{pmo}</td>
          </tr>
        ))}
      </tbody></table></div>
      <div style={ALERT_GREEN}><strong>✅ Cas réel :</strong> Migration JBOSS EAP — en intégrant les métriques DORA dans PMO AI Studio, l&apos;équipe a maintenu CPI 0.98 tout en déployant en CI/CD.</div>
    </div>
  )
}

function ArticlePMP({ editMode, images, onImageUpdate }: any) {
  return (
    <div>
      <p style={P}>L&apos;examen PMP® 2026 n&apos;est plus ce qu&apos;il était. 180 questions, 50% Agile, formats multiples, 230 minutes chrono. Voici le guide complet basé sur 22 ans d&apos;expérience en gestion de projet et 225 questions de notre simulateur.</p>
      <div style={ALERT_ORANGE}><strong>📊 Statistiques PMP® 2024 :</strong> Taux de réussite premier passage : 62%. Score minimum recommandé au simulateur avant de passer : 75%+. Temps de préparation moyen : 3-4 mois.</div>
      <h2 style={H2}>🎯 Ce qui a changé dans l&apos;examen PMP® 2026</h2>
      <div style={TABLE_WRAP}><table style={TABLE}><thead><tr>
        <th style={TH}>Domaine</th><th style={TH}>Poids</th><th style={TH}>Ce que ça implique</th>
      </tr></thead><tbody>
        {[
          ["Personnes — Leadership & Équipe","42%","Gestion des conflits, motivation, servant leadership, équipes virtuelles"],
          ["Processus — Méthodes & Gouvernance","50%","Hybride Agile/Prédictif, ceremonies Scrum, WBS, EVM, risques"],
          ["Environnement — Contexte & Valeur","8%","Conformité, durabilité, bénéfices business, parties prenantes"],
        ].map(([dom,poi,impl],i) => (
          <tr key={i} style={{background:i%2===0?"var(--bg-card)":"var(--bg)",borderBottom:"1px solid var(--border)"}}>
            <td style={TD}><strong style={{color:"var(--primary-light)"}}>{dom}</strong></td>
            <td style={TD}><strong style={{color:"#f59e0b"}}>{poi}</strong></td><td style={TD}>{impl}</td>
          </tr>
        ))}
      </tbody></table></div>
      <h2 style={H2}>📚 Plan de préparation 12 semaines</h2>
      {[
        {sem:"Semaines 1-3",titre:"Fondamentaux PMBOK 7 + ECO",desc:"Lisez le PMBOK Guide 7e édition. Focalisez sur les 12 principes. Mémorisez l&apos;ECO — c&apos;est le vrai syllabus de l&apos;examen."},
        {sem:"Semaines 4-6",titre:"Agile & Hybride",desc:"Le Agile Practice Guide est obligatoire. Maîtrisez Scrum, Kanban, SAFe. 50% des questions = contexte Agile."},
        {sem:"Semaines 7-9",titre:"EVM, Risques, Parties prenantes",desc:"Ces 3 sujets représentent 30%+ des questions. EVM : mémorisez CPI, SPI, EAC, TCPI. Risques : matrice probabilité/impact, 4 réponses."},
        {sem:"Semaines 10-11",titre:"Simulateurs intensifs",desc:"Minimum 600 questions de pratique. Analysez chaque erreur. Pattern PMI : toujours choisir la réponse qui engage l&apos;équipe et communique proactivement."},
        {sem:"Semaine 12",titre:"Révision finale + logistique",desc:"Révision légère seulement. Vérifiez convocation, ID valide, règles centre. Dormez 8h la veille. Arrivez 30 min en avance."},
      ].map((s,i) => (
        <div key={i} style={{background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:8,padding:"12px 16px",marginBottom:10}}>
          <p style={{...P,margin:"0 0 4px",fontSize:11,fontWeight:700,color:"var(--primary-light)",textTransform:"uppercase" as const}}>{s.sem}</p>
          <p style={{...P,margin:"0 0 4px",fontWeight:700,color:"var(--text-1)"}}>{s.titre}</p>
          <p style={{...P,margin:0,fontSize:13}}>{s.desc}</p>
        </div>
      ))}
      <div style={ALERT_GREEN}><strong>🎓 Notre simulateur PMO AI Studio :</strong> 225 questions PMP® en conditions réelles, avec explications détaillées et score par domaine. Disponible dans la section Formation.</div>
    </div>
  )
}

function ArticleConflits({ editMode, images, onImageUpdate }: any) {
  return (
    <div>
      <p style={P}>Un conflit non résolu coûte en moyenne 2.8h par semaine et par manager. Sur un projet de 12 mois avec 5 managers, c&apos;est 840h perdues. Thomas-Kilmann a identifié 5 styles de gestion des conflits — voici comment les utiliser selon le contexte projet.</p>
      <h2 style={H2}>🎯 La matrice Thomas-Kilmann — 5 styles, 2 dimensions</h2>
      <div style={TABLE_WRAP}><table style={TABLE}><thead><tr>
        <th style={TH}>Style</th><th style={TH}>Assertivité</th><th style={TH}>Coopération</th><th style={TH}>Quand l&apos;utiliser</th>
      </tr></thead><tbody>
        {[
          ["🏆 Compétition","Haute","Faible","Urgence absolue, décision non négociable, sécurité en jeu"],
          ["🤝 Collaboration","Haute","Haute","Solution win-win possible, relation long terme, enjeu important"],
          ["🔄 Compromis","Moyenne","Moyenne","Temps limité, solution temporaire, égalité de pouvoir"],
          ["🚫 Évitement","Faible","Faible","Enjeu mineur, refroidir les tensions, besoin de temps"],
          ["🙋 Accommodation","Faible","Haute","Relation > résultat, vous avez tort, capital relationnel à préserver"],
        ].map(([sty,ass,coo,qu],i) => (
          <tr key={i} style={{background:i%2===0?"var(--bg-card)":"var(--bg)",borderBottom:"1px solid var(--border)"}}>
            <td style={TD}><strong>{sty}</strong></td>
            <td style={TD}><strong style={{color:ass==="Haute"?"#22c55e":ass==="Faible"?"#ef4444":"#f59e0b"}}>{ass}</strong></td>
            <td style={TD}><strong style={{color:coo==="Haute"?"#22c55e":coo==="Faible"?"#ef4444":"#f59e0b"}}>{coo}</strong></td>
            <td style={TD}>{qu}</td>
          </tr>
        ))}
      </tbody></table></div>
      <h2 style={H2}>📋 5 scénarios réels en gestion de projet</h2>
      {[
        {scen:"Le développeur refuse la date de livraison",style:"Collaboration",action:"\"Aidez-moi à comprendre ce qui vous semble irréaliste. Qu&apos;est-ce qui serait faisable ?\" — Impliquez-le dans la solution."},
        {scen:"Deux équipes se disputent une ressource partagée",style:"Compromis",action:"Calendrier partagé avec créneaux alternés. Les deux cèdent un peu, les deux obtiennent quelque chose."},
        {scen:"Client demande un scope non contractuel en urgence",style:"Compétition",action:"\"Je comprends l&apos;urgence. Cela sort du scope contractuel. Voici nos options : avenant, déprioritisation, ou refus documenté.\""},
        {scen:"Tension entre PO et Scrum Master sur les priorités",style:"Collaboration",action:"Session de refinement avec l&apos;équipe entière. Les données vélocité tranchent objectivement."},
        {scen:"Conflit interpersonnel mineur entre deux devs",style:"Évitement puis Collaboration",action:"Laissez refroidir 24h. Puis facilitez une conversation 1:1 centrée sur les faits, pas les personnalités."},
      ].map((s,i) => (
        <div key={i} style={{background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:10,padding:"14px 16px",marginBottom:12}}>
          <p style={{...P,margin:"0 0 6px",fontWeight:700,color:"var(--text-1)"}}>📌 {s.scen}</p>
          <p style={{...P,margin:"0 0 4px",fontSize:12}}><strong style={{color:"var(--primary-light)"}}>Style recommandé :</strong> {s.style}</p>
          <p style={{...P,margin:0,fontSize:12,fontStyle:"italic"}}>{s.action}</p>
        </div>
      ))}
      <div style={ALERT_GREEN}><strong>🎓 Conseil PMP® :</strong> L&apos;examen PMP® 2026 teste abondamment la gestion des conflits. La réponse PMI préférée est presque toujours la Collaboration — engager, écouter, construire une solution commune.</div>
    </div>
  )
}

function ArticleClaudeAI({ editMode, images, onImageUpdate }: any) {
  return (
    <div>
      <p style={P}>30 secondes. C&apos;est le temps qu&apos;il faut à PMO AI Studio pour transformer une description de projet en Gantt complet avec 20 tâches, dépendances, jalons et chemin critique. Voici le tutoriel pas-à-pas avec Claude AI.</p>
      <div style={ALERT_GREEN}><strong>🤖 Claude AI dans PMO AI Studio :</strong> Chaque génération utilise Claude Sonnet via l&apos;API Anthropic. Le modèle connaît PMBOK 7, SAFe, les meilleures pratiques PMO et génère des livrables directement utilisables.</div>
      <h2 style={H2}>🚀 Tutoriel — Générer un Gantt en 30 secondes</h2>
      {[
        {n:"1",titre:"Créez votre projet",desc:"Cliquez sur \"+ Nouveau projet\" dans le dashboard. Renseignez le nom, la description, le budget et les dates. Plus votre description est précise, meilleur sera le résultat IA."},
        {n:"2",titre:"Accédez à l&apos;outil Gantt",desc:"Dans la sidebar, cliquez sur votre projet > Gantt. L&apos;interface affiche un canvas vide avec le bouton \"Générer depuis WBS\"."},
        {n:"3",titre:"Cliquez \"Générer depuis WBS\"",desc:"Claude AI analyse votre projet et génère automatiquement : phases, tâches, durées estimées, dépendances logiques et jalons clés. Tout en JSON structuré."},
        {n:"4",titre:"Ajustez visuellement",desc:"Glissez-déposez les barres pour modifier les dates. Redimensionnez pour ajuster les durées. Créez des dépendances en cliquant sur les connecteurs."},
        {n:"5",titre:"Exportez ou partagez",desc:"Export Excel, export Gamma AI pour vos présentations, ou partagez le lien direct. Le Gantt se met à jour automatiquement à chaque modification."},
      ].map((step,i) => (
        <div key={i} style={{display:"flex",gap:14,marginBottom:16,alignItems:"flex-start"}}>
          <div style={{minWidth:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,#7B5EFF,#f97316)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:15,color:"#fff",flexShrink:0}}>{step.n}</div>
          <div>
            <p style={{...P,margin:"0 0 4px",fontWeight:700,color:"var(--text-1)"}}>{step.titre}</p>
            <p style={{...P,margin:0,fontSize:13}}>{step.desc}</p>
          </div>
        </div>
      ))}
      <h2 style={H2}>💡 Prompts avancés pour des résultats optimaux</h2>
      {[
        {type:"Projet BTP",prompt:"\"Rénovation hôtel 4 étoiles 120 chambres Marrakech, budget 2.5M€, durée 12 mois. Inclure phases : études, démolition, structure, finitions, ouverture.\""},
        {type:"Projet IT / Migration",prompt:"\"Migration 35 applications J2EE vers JBoss EAP 7.4, budget 600k€, 8 mois, équipe 6 personnes. Inclure analyse, conception, déploiement, tests, bascule.\""},
        {type:"Projet SaaS / Agile",prompt:"\"Application mobile fintech FinTrack, budget 280k€, 10 sprints. Inclure phases design, développement, open banking, QA, launch.\""},
      ].map((p,i) => (
        <div key={i} style={{background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:10,padding:"14px 16px",marginBottom:12}}>
          <p style={{...P,margin:"0 0 8px",fontWeight:700,color:"var(--primary-light)"}}>{p.type}</p>
          <p style={{...P,margin:0,fontSize:12,fontFamily:"monospace",background:"var(--bg)",padding:"8px 12px",borderRadius:6}}>{p.prompt}</p>
        </div>
      ))}
      <div style={ALERT_ORANGE}><strong>⚡ Conseil pro :</strong> Générez d&apos;abord la WBS, puis le Gantt depuis WBS. Les phases WBS deviennent les jalons Gantt automatiquement.</div>
    </div>
  )
}

function ArticleSAFe({ editMode, images, onImageUpdate }: any) {
  return (
    <div>
      <p style={P}>SAFe 6 est le framework Agile le plus adopté en entreprise — 35% des grandes organisations l&apos;utilisent. Mais il est souvent mal compris. Voici le guide illustré, de l&apos;équipe Scrum au Portfolio Kanban, avec les métriques et le PI Planning.</p>
      <h2 style={H2}>🏗️ Les 4 niveaux SAFe 6</h2>
      <div style={TABLE_WRAP}><table style={TABLE}><thead><tr>
        <th style={TH}>Niveau</th><th style={TH}>Acteurs</th><th style={TH}>Cadence</th><th style={TH}>Artefact clé</th>
      </tr></thead><tbody>
        {[
          ["Team","Équipes Agile (5-11 pers)","Sprint 2 semaines","Team Backlog, Sprint Goal"],
          ["Program — ART","Agile Release Train (5-12 équipes)","PI 10 semaines","Program Backlog, PI Objectives"],
          ["Solution","Solution Train (plusieurs ARTs)","PI synchronisé","Solution Backlog, Capabilities"],
          ["Portfolio","Direction, Lean Portfolio Mgmt","Trimestre","Portfolio Kanban, Epics"],
        ].map(([niv,act,cad,art],i) => (
          <tr key={i} style={{background:i%2===0?"var(--bg-card)":"var(--bg)",borderBottom:"1px solid var(--border)"}}>
            <td style={TD}><strong style={{color:"var(--primary-light)"}}>{niv}</strong></td>
            <td style={TD}>{act}</td><td style={TD}>{cad}</td><td style={TD}>{art}</td>
          </tr>
        ))}
      </tbody></table></div>
      <h2 style={H2}>📅 PI Planning — Le cœur de SAFe</h2>
      <p style={P}>Le PI Planning est un événement de 2 jours réunissant toutes les équipes de l&apos;ART pour planifier le prochain Program Increment (10 semaines = 5 sprints).</p>
      {[
        {jour:"Jour 1 — Vision & Architecture",steps:["Business context par le Product Management","Architecture vision par le System Architect","Présentation du Product Backlog par les POs","Draft plans par chaque équipe"]},
        {jour:"Jour 2 — Plans & Engagement",steps:["Review des plans d&apos;équipe","Identification des risques ROAM","Ajustements et résolution dépendances","PI Objectives finaux et engagement collectif"]},
      ].map((j,i) => (
        <div key={i} style={{background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:10,padding:"14px 16px",marginBottom:12}}>
          <p style={{...P,margin:"0 0 10px",fontWeight:700,color:"var(--text-1)"}}>{j.jour}</p>
          {j.steps.map((s,si) => <p key={si} style={{...P,margin:"0 0 4px",fontSize:13,paddingLeft:12,borderLeft:"2px solid var(--primary-light)"}}>• {s}</p>)}
        </div>
      ))}
      <div style={ALERT_GREEN}><strong>🎓 SAFe® 6 Certification :</strong> Le Guide CP de PMO AI Studio inclut les pipelines SAFe cliquables — ART, PI Planning, Inspect & Adapt. Idéal pour la préparation SAFe® 6 Agilist.</div>
    </div>
  )
}

function ArticleOKR({ editMode, images, onImageUpdate }: any) {
  return (
    <div>
      <p style={P}>&quot;Nos KPIs sont au vert mais on n&apos;avance pas vers nos objectifs.&quot; Syndrome classique. Les KPIs mesurent la performance opérationnelle. Les OKR pilotent la transformation stratégique. Voici comment les combiner dans votre PMO.</p>
      <h2 style={H2}>🎯 OKR vs KPI — Différences fondamentales</h2>
      <div style={TABLE_WRAP}><table style={TABLE}><thead><tr>
        <th style={TH}>Critère</th><th style={TH}>OKR</th><th style={TH}>KPI</th>
      </tr></thead><tbody>
        {[
          ["Horizon","Trimestriel / Annuel","Permanent / Continu"],
          ["Orientation","Transformation & Ambition","Performance & Stabilité"],
          ["Score cible","60-70% (ambitieux par nature)","100% (standard opérationnel)"],
          ["Créateur","Équipe + Management","Management"],
          ["Nature","\"Vers où on va\"","\"Comment on performe\""],
          ["Exemple","\"Devenir la référence EVM en France\"","\"CPI moyen du portfolio ≥ 0.95\""],
        ].map(([crit,okr,kpi],i) => (
          <tr key={i} style={{background:i%2===0?"var(--bg-card)":"var(--bg)",borderBottom:"1px solid var(--border)"}}>
            <td style={TD}><strong>{crit}</strong></td>
            <td style={TD}><strong style={{color:"#7B5EFF"}}>{okr}</strong></td>
            <td style={TD}><strong style={{color:"#3b82f6"}}>{kpi}</strong></td>
          </tr>
        ))}
      </tbody></table></div>
      <h2 style={H2}>✍️ Exemple OKR complet — PMO AI Studio Q2 2026</h2>
      <div style={{background:"var(--bg-card)",border:"2px solid var(--primary-light)",borderRadius:12,padding:"16px 20px",marginBottom:24}}>
        <p style={{...P,margin:"0 0 12px",fontWeight:800,fontSize:16,color:"var(--primary-light)"}}>🎯 Objective : Devenir l&apos;outil PMO de référence pour les Chefs de Projet francophones</p>
        {[
          ["KR1","Atteindre 500 utilisateurs actifs/mois","0 → 500","Mensuel"],
          ["KR2","Publier 15 articles blog avec 10k vues/article","0 → 15","Trimestriel"],
          ["KR3","Score NPS utilisateurs ≥ 40","— → 40","Trimestriel"],
          ["KR4","Intégrer 3 certifications PMI reconnues","0 → 3","Trimestriel"],
        ].map(([kr,desc,cib,cad],i) => (
          <div key={i} style={{display:"flex",gap:12,marginBottom:8,alignItems:"flex-start"}}>
            <span style={{minWidth:32,fontSize:11,fontWeight:700,color:"var(--primary-light)",paddingTop:2}}>{kr}</span>
            <div>
              <p style={{...P,margin:"0 0 2px",fontSize:13,fontWeight:600,color:"var(--text-1)"}}>{desc}</p>
              <p style={{...P,margin:0,fontSize:11,color:"var(--text-3)"}}>Cible : {cib} · Cadence : {cad}</p>
            </div>
          </div>
        ))}
      </div>
      <h2 style={H2}>⚡ Les 5 règles d&apos;or des OKR</h2>
      {[
        "Maximum 3-5 Objectives par trimestre — la focale est la force des OKR",
        "Chaque Objective a 2-4 Key Results mesurables et vérifiables",
        "Un OKR atteint à 100% n&apos;était pas assez ambitieux — visez 70%",
        "Les OKR d&apos;équipe doivent contribuer aux OKR de l&apos;entreprise — cascade visible",
        "Review hebdomadaire (check-in) + scoring trimestriel — pas de surprise en fin de trimestre",
      ].map((rule,i) => (
        <p key={i} style={{...P,paddingLeft:16,borderLeft:"3px solid #7B5EFF",marginBottom:10}}>
          <strong style={{color:"var(--text-1)"}}>{i+1}.</strong> {rule}
        </p>
      ))}
      <div style={ALERT_GREEN}><strong>📊 Dans PMO AI Studio :</strong> Le module OKR Global vous permet de créer vos Objectives, suivre vos Key Results avec progress bars et alertes automatiques. Accessible dans le menu Portfolio.</div>
    </div>
  )
}
'''

# Nouveau switch
NEW_SWITCH = """  const renderContent = () => {
    switch(slug) {
      case "evm-5-minutes-cpi-spi-eac-tcpi":    return <ArticleEVM editMode={editMode} images={images} onImageUpdate={onImageUpdate}/>
      case "cpi-inferieur-1-sauver-projet":      return <ArticleCPI editMode={editMode} images={images} onImageUpdate={onImageUpdate}/>
      case "raid-register-guide-complet":         return <ArticleRAID editMode={editMode} images={images} onImageUpdate={onImageUpdate}/>
      case "sprint-planning-guide-8-etapes":      return <ArticleSprint editMode={editMode} images={images} onImageUpdate={onImageUpdate}/>
      case "devops-pmo-reconcilier":              return <ArticleDevOps editMode={editMode} images={images} onImageUpdate={onImageUpdate}/>
      case "pmp-2026-guide-preparation":          return <ArticlePMP editMode={editMode} images={images} onImageUpdate={onImageUpdate}/>
      case "thomas-kilmann-conflits-projet":      return <ArticleConflits editMode={editMode} images={images} onImageUpdate={onImageUpdate}/>
      case "claude-ai-gantt-30-secondes":         return <ArticleClaudeAI editMode={editMode} images={images} onImageUpdate={onImageUpdate}/>
      case "safe-6-guide-illustre":               return <ArticleSAFe editMode={editMode} images={images} onImageUpdate={onImageUpdate}/>
      case "okr-vs-kpi-quelle-difference":        return <ArticleOKR editMode={editMode} images={images} onImageUpdate={onImageUpdate}/>
      default: return <ArticleDefault/>
    }
  }"""

# Injecter les composants avant ArticleDefault
OLD_DEFAULT = "function ArticleDefault() {"
if OLD_DEFAULT not in content:
    print("❌ Pattern ArticleDefault non trouvé")
    exit(1)

content = content.replace(OLD_DEFAULT, COMPONENTS + "\n" + OLD_DEFAULT)

# Remplacer le switch
OLD_SWITCH = "  const renderContent = () => {\n    switch(slug) {\n      case \"evm-5-minutes-cpi-spi-eac-tcpi\": return <ArticleEVM editMode={editMode} images={images} onImageUpdate={onImageUpdate}/>\n      default: return <ArticleDefault/>\n    }\n  }"
if OLD_SWITCH in content:
    content = content.replace(OLD_SWITCH, NEW_SWITCH)
    print("✅ Switch remplacé")
else:
    # Chercher pattern alternatif
    pattern = r'const renderContent = \(\) => \{[\s\S]*?switch\(slug\)[\s\S]*?\}\s*\}'
    match = re.search(pattern, content)
    if match:
        content = content[:match.start()] + NEW_SWITCH.strip() + content[match.end():]
        print("✅ Switch remplacé (regex)")
    else:
        print("⚠️ Switch non trouvé — injection manuelle nécessaire")

with open(PATH, "w", encoding="utf-8") as f:
    f.write(content)

print(f"✅ Fichier mis à jour — {len(content):,} chars")
