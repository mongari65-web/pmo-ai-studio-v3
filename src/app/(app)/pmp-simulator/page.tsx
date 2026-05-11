"use client"
import { useState, useEffect, useMemo } from "react"
import AppLayout from "@/components/layout/AppLayout"
import Link from "next/link"
import { Clock, RotateCcw, ChevronRight, ChevronLeft, Trophy, Star, Zap, Flame } from "lucide-react"

// ════════════════════════════════════════════════════════════════
// BANQUE DE 75 QUESTIONS — 3 niveaux × 5 lots × 5 questions
// ════════════════════════════════════════════════════════════════
const ALL_QUESTIONS = [

// ── LOT 1 FACILE ─────────────────────────────────────────────
{ id:1, lot:1, level:"facile", domain:"Processus", pmbok:"PMBOK 7",
  q:"Quelle est la première étape du cycle de vie d'un projet ?",
  opts:["Planification","Initiation","Exécution","Clôture"], correct:1,
  expl:"L'initiation est la première phase. Elle définit les objectifs, nomme le chef de projet et produit la charte de projet." },
{ id:2, lot:1, level:"facile", domain:"Processus", pmbok:"PMBOK 7",
  q:"Qu'est-ce que la Charte de Projet (Project Charter) ?",
  opts:["Le planning détaillé du projet","Le document qui autorise officiellement le projet et nomme le chef de projet","Le contrat signé avec le client","Le registre des risques"],
  correct:1, expl:"La charte de projet autorise officiellement le projet, définit les objectifs de haut niveau et donne l'autorité au chef de projet." },
{ id:3, lot:1, level:"facile", domain:"Personnes", pmbok:"PMBOK 7",
  q:"Qui est responsable de la réussite globale du projet ?",
  opts:["Le sponsor","Le chef de projet","L'équipe de développement","Le client"],
  correct:1, expl:"Le chef de projet est responsable de la réussite du projet. Il coordonne l'équipe, gère les risques et communique avec les parties prenantes." },
{ id:4, lot:1, level:"facile", domain:"Processus", pmbok:"Agile",
  q:"Dans Scrum, combien de rôles officiels existe-t-il ?",
  opts:["2","3","4","5"], correct:1,
  expl:"Scrum définit 3 rôles : Product Owner, Scrum Master, et Developers (équipe de développement)." },
{ id:5, lot:1, level:"facile", domain:"Environnement", pmbok:"PMBOK 7",
  q:"Qu'est-ce que le WBS (Work Breakdown Structure) ?",
  opts:["Un diagramme de Gantt","Une décomposition hiérarchique du travail en livrables","Un registre des risques","Un tableau de bord"],
  correct:1, expl:"Le WBS est une décomposition hiérarchique du scope en livrables plus petits et gérables. Il constitue la base de toute planification." },

// ── LOT 2 FACILE ─────────────────────────────────────────────
{ id:6, lot:2, level:"facile", domain:"Processus", pmbok:"PMBOK 7",
  q:"Quel document décrit comment le projet sera exécuté, surveillé et contrôlé ?",
  opts:["La charte de projet","Le Plan de Management du Projet (PMP)","Le registre RAID","La matrice RACI"],
  correct:1, expl:"Le Plan de Management du Projet est le document de référence qui décrit comment le projet sera planifié, exécuté, surveillé et clôturé." },
{ id:7, lot:2, level:"facile", domain:"Personnes", pmbok:"PMBOK 7",
  q:"Qu'est-ce qu'une partie prenante (stakeholder) ?",
  opts:["Uniquement les membres de l'équipe projet","Toute personne ou organisation impactée par le projet ou pouvant l'influencer","Le client uniquement","Le sponsor financier uniquement"],
  correct:1, expl:"Un stakeholder est toute personne, groupe ou organisation qui peut affecter ou être affecté par le projet. Cela inclut l'équipe, le client, le sponsor, les utilisateurs finaux, etc." },
{ id:8, lot:2, level:"facile", domain:"Processus", pmbok:"Agile",
  q:"Qu'est-ce que le Product Backlog en Scrum ?",
  opts:["La liste des bugs à corriger","La liste ordonnée de tout ce que le produit doit faire","Le plan de sprint","Le rapport d'avancement"],
  correct:1, expl:"Le Product Backlog est une liste ordonnée par priorité de tout ce qui est nécessaire dans le produit. Il est géré et priorisé par le Product Owner." },
{ id:9, lot:2, level:"facile", domain:"Environnement", pmbok:"PMBOK 7",
  q:"Que signifie RACI dans une matrice de responsabilités ?",
  opts:["Risk, Assumption, Constraint, Issue","Responsible, Accountable, Consulted, Informed","Resources, Activities, Costs, Indicators","Review, Approve, Control, Implement"],
  correct:1, expl:"RACI : Responsible (exécute), Accountable (responsable final), Consulted (consulté), Informed (informé). C'est un outil essentiel pour clarifier les rôles." },
{ id:10, lot:2, level:"facile", domain:"Processus", pmbok:"PMBOK 7",
  q:"Qu'est-ce qu'un livrable (deliverable) ?",
  opts:["Une réunion de projet","Un résultat ou produit unique et vérifiable requis pour terminer une tâche","Un membre de l'équipe","Un risque identifié"],
  correct:1, expl:"Un livrable est tout résultat, document ou composant unique et vérifiable qui doit être produit pour terminer un processus, une phase ou un projet." },

// ── LOT 3 FACILE ─────────────────────────────────────────────
{ id:11, lot:3, level:"facile", domain:"Personnes", pmbok:"PMBOK 7",
  q:"Qu'est-ce qu'un conflit d'intérêt selon le Code d'Éthique PMI ?",
  opts:["Un désaccord entre deux membres de l'équipe","Une situation où les intérêts personnels peuvent influencer les décisions professionnelles","Un conflit de planning entre deux projets","Un désaccord avec le client"],
  correct:1, expl:"Un conflit d'intérêt survient quand les intérêts personnels pourraient influencer les décisions professionnelles. PMI exige de les divulguer et de se récuser si nécessaire." },
{ id:12, lot:3, level:"facile", domain:"Processus", pmbok:"PMBOK 7",
  q:"Quel est le rôle principal du sponsor de projet ?",
  opts:["Gérer l'équipe quotidiennement","Fournir les ressources et le soutien organisationnel, et lever les obstacles","Rédiger le code de l'application","Gérer les risques techniques"],
  correct:1, expl:"Le sponsor fournit les ressources financières, soutient le projet au niveau organisationnel, aide à résoudre les problèmes qui dépassent l'autorité du chef de projet." },
{ id:13, lot:3, level:"facile", domain:"Processus", pmbok:"Agile",
  q:"Quelle est la durée maximale d'un Daily Scrum ?",
  opts:["5 minutes","15 minutes","30 minutes","1 heure"],
  correct:1, expl:"Le Daily Scrum est limité à 15 minutes (time-boxed). L'équipe y répond : qu'ai-je fait hier, que vais-je faire aujourd'hui, y a-t-il des obstacles ?" },
{ id:14, lot:3, level:"facile", domain:"Environnement", pmbok:"PMBOK 7",
  q:"Qu'est-ce que la valeur acquise (Earned Value - EV) ?",
  opts:["Le coût réel du travail effectué","La valeur monétaire du travail réellement accompli","Le budget total du projet","La valeur planifiée du travail prévu"],
  correct:1, expl:"L'EV est la valeur du travail réellement accompli, exprimée en termes budgétaires. EV = % d'avancement × BAC." },
{ id:15, lot:3, level:"facile", domain:"Personnes", pmbok:"PMBOK 7",
  q:"Selon Herzberg, quels sont les facteurs de motivation intrinsèques ?",
  opts:["Salaire, conditions de travail, sécurité de l'emploi","Accomplissement, reconnaissance, responsabilité, évolution","Le statut et les avantages sociaux","L'environnement de travail physique"],
  correct:1, expl:"Herzberg distingue les facteurs d'hygiène (salaire, conditions) qui évitent l'insatisfaction, des facteurs de motivation (accomplissement, reconnaissance) qui créent la satisfaction." },

// ── LOT 4 FACILE ─────────────────────────────────────────────
{ id:16, lot:4, level:"facile", domain:"Processus", pmbok:"PMBOK 7",
  q:"Qu'est-ce que le Scope Creep ?",
  opts:["Une technique d'estimation","L'expansion non contrôlée du périmètre sans ajustement des délais/coûts","Une méthode agile","Un type de risque financier"],
  correct:1, expl:"Le Scope Creep est l'ajout non contrôlé de fonctionnalités sans passer par le processus de contrôle des changements. C'est l'une des principales causes d'échec de projet." },
{ id:17, lot:4, level:"facile", domain:"Processus", pmbok:"Agile",
  q:"Qu'est-ce qu'une User Story ?",
  opts:["Un rapport de projet","Une description d'une fonctionnalité du point de vue de l'utilisateur","Un document technique","Un plan de test"],
  correct:1, expl:"Une User Story décrit une fonctionnalité du point de vue de l'utilisateur : 'En tant que [rôle], je veux [action] afin de [bénéfice]'." },
{ id:18, lot:4, level:"facile", domain:"Environnement", pmbok:"PMBOK 7",
  q:"Quel est l'objectif d'une réunion rétrospective ?",
  opts:["Planifier le prochain sprint","Réfléchir sur le processus pour l'améliorer continuellement","Présenter les livrables au client","Identifier les risques du projet"],
  correct:1, expl:"La rétrospective vise l'amélioration continue du processus de l'équipe. On identifie ce qui a bien fonctionné, ce qui peut être amélioré et on définit des actions concrètes." },
{ id:19, lot:4, level:"facile", domain:"Personnes", pmbok:"PMBOK 7",
  q:"Qu'est-ce que la communication active dans le management de projet ?",
  opts:["Envoyer beaucoup d'emails","S'assurer que le message envoyé est bien reçu et compris par le destinataire","Organiser de nombreuses réunions","Utiliser des outils de collaboration modernes"],
  correct:1, expl:"La communication active implique de confirmer que le message est bien reçu et compris, pas seulement envoyé. Elle inclut l'écoute active et la vérification de la compréhension." },
{ id:20, lot:4, level:"facile", domain:"Processus", pmbok:"PMBOK 7",
  q:"Qu'est-ce qu'un jalon (milestone) dans un projet ?",
  opts:["Une tâche critique du projet","Un point significatif ou un événement important dans le projet, généralement de durée zéro","Un membre clé de l'équipe","Un livrable intermédiaire"],
  correct:1, expl:"Un jalon est un point remarquable du planning, de durée zéro, qui marque l'achèvement d'une phase importante ou d'un livrable clé du projet." },

// ── LOT 5 FACILE ─────────────────────────────────────────────
{ id:21, lot:5, level:"facile", domain:"Processus", pmbok:"PMBOK 7",
  q:"Qu'est-ce que le registre des risques ?",
  opts:["La liste des assurances du projet","Un document qui identifie, analyse et planifie les réponses aux risques","Le budget de contingence","La liste des problèmes survenus"],
  correct:1, expl:"Le registre des risques documente les risques identifiés, leur probabilité, leur impact, leur priorité et les stratégies de réponse planifiées." },
{ id:22, lot:5, level:"facile", domain:"Personnes", pmbok:"Agile",
  q:"Quel est le rôle du Scrum Master ?",
  opts:["Décider des fonctionnalités à développer","Faciliter l'adoption de Scrum et aider l'équipe à supprimer les obstacles","Gérer le budget du projet","Diriger techniquement l'équipe"],
  correct:1, expl:"Le Scrum Master est un servant leader qui aide l'équipe à appliquer Scrum, facilitie les cérémonies et aide à supprimer les impediments. Il ne dirige pas l'équipe." },
{ id:23, lot:5, level:"facile", domain:"Environnement", pmbok:"PMBOK 7",
  q:"Que mesure le SPI (Schedule Performance Index) ?",
  opts:["L'efficacité des coûts","L'efficacité du planning — ratio EV/PV","Le nombre de tâches terminées","La satisfaction du client"],
  correct:1, expl:"SPI = EV/PV. SPI > 1 : en avance sur le planning. SPI < 1 : en retard. SPI = 1 : dans les délais." },
{ id:24, lot:5, level:"facile", domain:"Processus", pmbok:"PMBOK 7",
  q:"Qu'est-ce que la clôture de projet inclut ?",
  opts:["Uniquement la livraison du produit final","Les leçons apprises, l'archivage des documents, la libération des ressources et l'acceptation formelle","La signature du contrat initial","La nomination de la nouvelle équipe"],
  correct:1, expl:"La clôture inclut : acceptation formelle des livrables, documentation des leçons apprises, archivage, libération des ressources et dissolution de l'équipe." },
{ id:25, lot:5, level:"facile", domain:"Personnes", pmbok:"PMBOK 7",
  q:"Que signifie 'servant leadership' dans le contexte PMI ?",
  opts:["Le chef de projet fait tout le travail à la place de l'équipe","Le leader se met au service de l'équipe pour la faire réussir","Le leader impose ses décisions","Le leader évite de prendre des responsabilités"],
  correct:1, expl:"Le servant leadership place les besoins de l'équipe en premier. Le leader facilite, soutient et lève les obstacles pour permettre à l'équipe de donner le meilleur d'elle-même." },

// ── LOT 6 DIFFICILE ──────────────────────────────────────────
{ id:26, lot:6, level:"difficile", domain:"Environnement", pmbok:"PMBOK 7",
  q:"Votre projet a BAC=500k€, EV=300k€, AC=380k€, PV=320k€. Quel est l'EAC en utilisant la formule EAC=BAC/CPI ?",
  opts:["450k€","500k€","633k€","580k€"], correct:2,
  expl:"CPI = EV/AC = 300/380 = 0.789. EAC = BAC/CPI = 500/0.789 = 633k€. Le projet dépassera son budget de 133k€ si la tendance continue." },
{ id:27, lot:6, level:"difficile", domain:"Processus", pmbok:"PMBOK 7",
  q:"Un changement urgent est demandé en phase d'exécution. Le sponsor demande de bypasser le CCB. Que faites-vous ?",
  opts:["Implémenter le changement immédiatement, le sponsor a l'autorité","Refuser catégoriquement tout changement","Implémenter le changement mais documenter la décision du sponsor et les impacts","Arrêter le projet jusqu'à décision formelle"],
  correct:2, expl:"Même en urgence, il faut documenter l'approbation du sponsor, évaluer les impacts sur le triple contrainte et notifier les parties prenantes. Bypasser complètement le processus crée des risques." },
{ id:28, lot:6, level:"difficile", domain:"Personnes", pmbok:"PMBOK 7",
  q:"Vous découvrez qu'un fournisseur a soudoyé un membre de votre équipe pour obtenir un avantage. Quelle est la première action ?",
  opts:["Ignorer si le contrat est déjà signé","Licencier immédiatement le membre de l'équipe","Rapporter aux autorités compétentes selon les politiques de l'organisation et les lois applicables","Renégocier le contrat avec le fournisseur"],
  correct:2, expl:"Selon le code d'éthique PMI, la corruption doit être signalée aux autorités compétentes. L'honnêteté et la responsabilité sont des valeurs fondamentales non négociables." },
{ id:29, lot:6, level:"difficile", domain:"Processus", pmbok:"Agile",
  q:"Dans SAFe, qu'est-ce qu'un PI Planning ?",
  opts:["Un sprint de 2 semaines","Un événement de planification trimestriel alignant plusieurs équipes Agile sur des objectifs communs","Une réunion quotidienne de 15 minutes","Un outil de suivi des User Stories"],
  correct:1, expl:"Le Program Increment (PI) Planning est un événement de 2 jours dans SAFe qui aligne toutes les équipes d'un Agile Release Train (ART) sur des objectifs communs pour les 8-12 prochaines semaines." },
{ id:30, lot:6, level:"difficile", domain:"Environnement", pmbok:"PMBOK 7",
  q:"Quel est le TCPI si BAC=400k€, EV=200k€, AC=180k€ et que vous voulez finir dans le budget original ?",
  opts:["1.0","0.91","1.11","0.95"], correct:2,
  expl:"TCPI = (BAC-EV)/(BAC-AC) = (400-200)/(400-180) = 200/220 = 0.909... Non, TCPI = (BAC-EV)/(BAC-AC) = 200/220 = 0.91. <1 = plus facile que prévu." },

// ── LOT 7 DIFFICILE ──────────────────────────────────────────
{ id:31, lot:7, level:"difficile", domain:"Processus", pmbok:"PMBOK 7",
  q:"Quelle stratégie de réponse aux risques consiste à transférer l'impact négatif à un tiers ?",
  opts:["Éviter","Accepter","Transférer","Atténuer"], correct:2,
  expl:"Le transfert (Transfer) déplace la responsabilité du risque à un tiers (ex: assurance, clause contractuelle). Le risque existe toujours mais la responsabilité financière est partagée." },
{ id:32, lot:7, level:"difficile", domain:"Personnes", pmbok:"PMBOK 7",
  q:"Selon le modèle de Tuckman, dans quelle phase l'équipe est-elle la plus productive ?",
  opts:["Forming (constitution)","Storming (confrontation)","Norming (normalisation)","Performing (performance)"], correct:3,
  expl:"Les 5 phases de Tuckman : Forming → Storming → Norming → Performing → Adjourning. La phase Performing est celle où l'équipe fonctionne de manière autonome et efficace." },
{ id:33, lot:7, level:"difficile", domain:"Processus", pmbok:"PMBOK 7",
  q:"Quelle est la différence entre Fast Tracking et Crashing ?",
  opts:["Ce sont des synonymes","Fast Tracking parallélise des tâches séquentielles (+ risque), Crashing ajoute des ressources sur le chemin critique (+ coût)","Fast Tracking réduit les coûts, Crashing réduit les délais","Les deux augmentent la qualité"],
  correct:1, expl:"Fast Tracking : faire des tâches en parallèle = risque accru. Crashing : ajouter des ressources sur le chemin critique = coût accru. Les deux réduisent la durée mais avec des compromis différents." },
{ id:34, lot:7, level:"difficile", domain:"Environnement", pmbok:"PMBOK 7",
  q:"Dans une analyse quantitative des risques, qu'est-ce que la simulation Monte Carlo ?",
  opts:["Une technique de jeu de rôle pour l'équipe","Une simulation statistique qui génère de nombreux scénarios pour estimer les probabilités d'atteindre les objectifs","Un outil de planification agile","Une technique d'analyse des parties prenantes"],
  correct:1, expl:"Monte Carlo exécute des milliers de simulations avec des valeurs aléatoires dans les fourchettes d'estimation pour produire une distribution de probabilité des résultats (délai, coût)." },
{ id:35, lot:7, level:"difficile", domain:"Processus", pmbok:"Agile",
  q:"Qu'est-ce que la vélocité en Agile et comment l'utiliser pour planifier ?",
  opts:["Le nombre de membres de l'équipe","La quantité de Story Points livrés par Sprint — utilisée pour prédire les futurs Sprints","La vitesse de déploiement des releases","La satisfaction de l'équipe mesurée en points"],
  correct:1, expl:"La vélocité = SP livrés par Sprint. En divisant le backlog total par la vélocité moyenne, on obtient une estimation du nombre de Sprints. Elle s'améliore avec l'expérience de l'équipe." },

// ── LOT 8 DIFFICILE ──────────────────────────────────────────
{ id:36, lot:8, level:"difficile", domain:"Processus", pmbok:"PMBOK 7",
  q:"Quelle approche de développement est la plus appropriée pour un projet avec des exigences changeantes et une haute valeur business ?",
  opts:["Prédictive (Waterfall)","Agile (itératif)","Séquentielle","Aucune approche n'est adaptée"],
  correct:1, expl:"Agile est optimal quand les exigences évoluent fréquemment et que la valeur business doit être livrée rapidement. L'approche prédictive convient mieux aux projets stables et bien définis." },
{ id:37, lot:8, level:"difficile", domain:"Personnes", pmbok:"PMBOK 7",
  q:"Un membre de l'équipe est régulièrement en retard sur ses tâches malgré plusieurs conversations. Quelle est la prochaine étape PMI ?",
  opts:["Le licencier immédiatement","Faire une réunion d'équipe pour le montrer du doigt","Escalader au management RH avec documentation des faits et des actions déjà prises","Ignorer et redistribuer son travail"],
  correct:2, expl:"PMI recommande une approche progressive : conversation directe → plan d'amélioration → escalade RH documentée. La documentation est essentielle pour protéger toutes les parties." },
{ id:38, lot:8, level:"difficile", domain:"Environnement", pmbok:"PMBOK 7",
  q:"Quelle est la différence entre la réserve pour aléas et la réserve de management ?",
  opts:["Il n'y a pas de différence","La réserve pour aléas couvre les risques identifiés (known unknowns), la réserve de management couvre les risques non identifiés (unknown unknowns)","La réserve pour aléas est toujours plus grande","La réserve de management est gérée par le chef de projet"],
  correct:1, expl:"Réserve pour aléas (contingency) : pour les risques identifiés, gérée par le CP. Réserve de management : pour les inattendus, gérée par le management. Seule la contingency est dans la baseline." },
{ id:39, lot:8, level:"difficile", domain:"Processus", pmbok:"PMBOK 7",
  q:"Dans quel ordre devrait-on idéalement identifier les parties prenantes ?",
  opts:["Après l'exécution","Pendant la clôture","Le plus tôt possible, dès l'initiation du projet","Uniquement pendant la planification"],
  correct:2, expl:"L'identification des stakeholders doit commencer dès l'initiation et se poursuivre tout au long du projet. Plus tard on les identifie, plus les impacts négatifs sont difficiles à gérer." },
{ id:40, lot:8, level:"difficile", domain:"Processus", pmbok:"Agile",
  q:"Quelle est la principale différence entre Scrum et Kanban ?",
  opts:["Scrum n'a pas de backlog","Scrum utilise des Sprints time-boxés, Kanban est un flux continu sans itérations fixes","Kanban est plus rapide que Scrum","Scrum est pour les petites équipes uniquement"],
  correct:1, expl:"Scrum : itérations fixes (Sprints), rôles définis, cérémonies formelles. Kanban : flux continu, limite du WIP, pas de rôles imposés. Kanban est plus adapté aux flux de travail continus (support, ops)." },

// ── LOT 9 DIFFICILE ──────────────────────────────────────────
{ id:41, lot:9, level:"difficile", domain:"Processus", pmbok:"PMBOK 7",
  q:"Qu'est-ce que le chemin critique (Critical Path) ?",
  opts:["Le chemin le plus court du projet","La séquence de tâches dont la durée totale est la plus longue et qui détermine la durée minimale du projet","Les tâches les plus risquées","Les tâches gérées par le chef de projet"],
  correct:1, expl:"Le chemin critique est la séquence de tâches qui détermine la durée la plus courte possible du projet. Tout retard sur le chemin critique retarde le projet entier. La marge est zéro." },
{ id:42, lot:9, level:"difficile", domain:"Personnes", pmbok:"PMBOK 7",
  q:"Selon le modèle de McClelland, un manager qui aime convaincre les autres et établir des relations est motivé par quel besoin ?",
  opts:["Besoin d'accomplissement","Besoin de pouvoir","Besoin d'affiliation","Besoin de sécurité"],
  correct:2, expl:"McClelland : accomplissement (atteindre des objectifs), pouvoir (influencer les autres), affiliation (relations sociales). Le besoin d'affiliation correspond à la recherche de relations harmonieuses." },
{ id:43, lot:9, level:"difficile", domain:"Environnement", pmbok:"PMBOK 7",
  q:"Votre projet a SPI=0.8 et CPI=1.1. Quelle est la situation ?",
  opts:["En retard et au-dessus du budget","En retard mais sous le budget (efficace en coûts)","En avance et sous le budget","En avance mais au-dessus du budget"],
  correct:1, expl:"SPI=0.8 < 1 : en retard (20%). CPI=1.1 > 1 : sous budget (10% d'économie). L'équipe est productive mais tarde à avancer. Il faut analyser les causes du retard sans dégrader l'efficacité." },
{ id:44, lot:9, level:"difficile", domain:"Processus", pmbok:"PMBOK 7",
  q:"Dans PMBOK 7, quel principe stipule que le chef de projet doit 'naviguer dans la complexité' ?",
  opts:["Principle of Stewardship","Principle of Navigating Complexity","Principle of Stakeholder Engagement","Principle of Adaptability"],
  correct:1, expl:"PMBOK 7 inclut 12 principes dont 'Navigate Complexity'. La complexité émerge des comportements humains, des interactions systémiques et de l'ambiguïté. Le CP doit l'anticiper et l'adresser." },
{ id:45, lot:9, level:"difficile", domain:"Processus", pmbok:"Agile",
  q:"Qu'est-ce qu'un 'Definition of Ready' (DoR) en Agile ?",
  opts:["Les critères pour qu'une User Story soit considérée terminée","Les critères pour qu'une User Story puisse entrer dans un Sprint","La liste des fonctionnalités prêtes à livrer","Le document de clôture du Sprint"],
  correct:1, expl:"La DoR définit les critères qu'une User Story doit remplir avant de pouvoir être prise dans un Sprint Planning. Ex: bien définie, estimée, testable, sans dépendances bloquantes." },

// ── LOT 10 DIFFICILE ─────────────────────────────────────────
{ id:46, lot:10, level:"difficile", domain:"Environnement", pmbok:"PMBOK 7",
  q:"Si BAC=600k€, CPI=0.75, quelle est l'estimation à l'achèvement (EAC) ?",
  opts:["600k€","800k€","450k€","750k€"], correct:1,
  expl:"EAC = BAC/CPI = 600/0.75 = 800k€. Le projet devrait coûter 800k€ au lieu de 600k€, soit un dépassement de 200k€ (33% de dépassement)." },
{ id:47, lot:10, level:"difficile", domain:"Processus", pmbok:"PMBOK 7",
  q:"La technique Delphi est utilisée pour ?",
  opts:["Estimer les coûts","Atteindre un consensus d'experts de manière anonyme et itérative","Analyser les parties prenantes","Calculer le chemin critique"],
  correct:1, expl:"La technique Delphi utilise des questionnaires itératifs auprès d'experts anonymes pour atteindre un consensus. L'anonymat évite les biais de groupe et la pression sociale." },
{ id:48, lot:10, level:"difficile", domain:"Personnes", pmbok:"PMBOK 7",
  q:"Quelle est la différence entre la gestion des conflits par 'compromis' et par 'collaboration' ?",
  opts:["Ce sont des synonymes","Le compromis donne partiellement raison aux deux parties (lose-lose), la collaboration trouve une solution satisfaisante pour tous (win-win)","Le compromis est toujours préférable","La collaboration prend moins de temps"],
  correct:1, expl:"Compromis : chacun cède sur certains points, résultat partiel. Collaboration/confrontation : PMI préfère cette approche car elle cherche une solution gagnant-gagnant qui traite les causes réelles." },
{ id:49, lot:10, level:"difficile", domain:"Processus", pmbok:"Agile",
  q:"Dans un projet hybride, quand est-il approprié d'utiliser une approche prédictive pour certains composants ?",
  opts:["Jamais, il faut choisir une seule approche","Quand les exigences sont stables, les réglementations l'imposent, ou les risques techniques sont faibles","Uniquement pour les projets de construction","Quand l'équipe n'est pas formée à l'Agile"],
  correct:1, expl:"L'approche hybride combine prédictive (exigences stables, compliance réglementaire) et agile (exigences évolutives, haute valeur). PMBOK 7 encourage de choisir selon le contexte." },
{ id:50, lot:10, level:"difficile", domain:"Environnement", pmbok:"PMBOK 7",
  q:"Qu'est-ce que la matrice probabilité-impact ?",
  opts:["Un outil pour calculer le CPI","Un outil qui classe les risques selon leur probabilité d'occurrence et leur impact sur les objectifs","Un tableau de bord de projet","Une technique d'estimation des coûts"],
  correct:1, expl:"La matrice probabilité-impact aide à prioriser les risques. Les risques à haute probabilité ET fort impact sont prioritaires. Elle permet de concentrer les efforts de réponse aux risques." },

// ── LOT 11 TRÈS DIFFICILE ────────────────────────────────────
{ id:51, lot:11, level:"tres-difficile", domain:"Environnement", pmbok:"PMBOK 7",
  q:"Votre projet a EV=250k€, PV=300k€, AC=275k€, BAC=500k€. Quelle est la variance à l'achèvement (VAC) si vous utilisez EAC = AC + (BAC-EV)/CPI ?",
  opts:["-50k€","-100k€","-48k€","+50k€"], correct:2,
  expl:"CPI=EV/AC=250/275=0.909. ETC=(BAC-EV)/CPI=(500-250)/0.909=275k€. EAC=AC+ETC=275+275=550k€. VAC=BAC-EAC=500-550=-50k€. Donc -50k€ de dépassement." },
{ id:52, lot:11, level:"tres-difficile", domain:"Processus", pmbok:"PMBOK 7",
  q:"Dans la théorie des contraintes (TOC), quel est le 'goulet d'étranglement' (bottleneck) dans un projet ?",
  opts:["Le budget du projet","La ressource ou processus qui limite la capacité totale du système et détermine le débit global","Le risk avec le plus fort impact","La tâche la plus longue du planning"],
  correct:1, expl:"La TOC identifie la contrainte principale (bottleneck) qui limite le débit du système. En projet : une ressource sur-allouée, une décision en attente, ou un processus lent. Optimiser le goulet maximise la performance globale." },
{ id:53, lot:11, level:"tres-difficile", domain:"Personnes", pmbok:"PMBOK 7",
  q:"Dans la grille de Blake et Mouton, quel style correspond à un manager avec haute préoccupation pour les personnes ET haute préoccupation pour la production ?",
  opts:["Autocratique (9,1)","Laisser-faire (1,1)","Club social (1,9)","Management en équipe (9,9)"],
  correct:3, expl:"La grille Blake-Mouton : (9,9) Team Management = fort intérêt pour les personnes ET pour la production. C'est le style idéal selon les auteurs, créant engagement et performance." },
{ id:54, lot:11, level:"tres-difficile", domain:"Processus", pmbok:"Agile",
  q:"Dans le scaled Agile (SAFe), quelle est la différence entre un Epic, une Feature et une User Story ?",
  opts:["Ce sont des synonymes pour la même chose","Epic = grande initiative business (mois/trimestres), Feature = fonctionnalité livrable (Sprint/PI), User Story = petit incrément de valeur (jours)","User Story > Feature > Epic en taille","Feature est uniquement technique"],
  correct:1, expl:"La hiérarchie SAFe : Epic (Portfolio) → Feature (Program) → User Story (Team). Les Epics se décomposent en Features qui se décomposent en User Stories. Chaque niveau a ses propres critères d'acceptance." },
{ id:55, lot:11, level:"tres-difficile", domain:"Environnement", pmbok:"PMBOK 7",
  q:"Qu'est-ce que la gestion de la valeur acquise (EVM) ne peut pas mesurer ?",
  opts:["L'efficacité des coûts","L'efficacité du planning","La qualité des livrables et la satisfaction des parties prenantes","Le coût estimé pour terminer"],
  correct:2, expl:"L'EVM mesure performance coût et délai mais ne mesure pas la qualité, la satisfaction client, les risques ou la valeur business réelle. C'est une vue quantitative qui doit être complétée par d'autres mesures." },

// ── LOT 12 TRÈS DIFFICILE ────────────────────────────────────
{ id:56, lot:12, level:"tres-difficile", domain:"Processus", pmbok:"PMBOK 7",
  q:"Un chef de projet dans une organisation matricielle forte rencontre des conflits de ressources avec un manager fonctionnel. Quelle est la meilleure approche ?",
  opts:["Escalader directement au PDG","Négocier directement avec le manager fonctionnel en s'appuyant sur les priorités business documentées","Accepter et ajuster le planning","Menacer de retards pour forcer la main"],
  correct:1, expl:"Dans une matrice forte, le CP a plus d'autorité mais doit négocier avec les managers fonctionnels. La négociation basée sur les faits (priorités business, impacts documentés) est l'approche PMI préférée." },
{ id:57, lot:12, level:"tres-difficile", domain:"Personnes", pmbok:"PMBOK 7",
  q:"Votre équipe est démoralisée après un audit négatif. Selon la théorie de l'Expectancy de Vroom, comment motiveriez-vous l'équipe ?",
  opts:["Augmenter les salaires","Renforcer le lien entre effort→performance→récompense en montrant que leurs actions peuvent améliorer les résultats","Les surveiller de plus près","Menacer de conséquences négatives"],
  correct:1, expl:"Vroom : motivation = Expectancy (effort→performance) × Instrumentality (performance→récompense) × Valence (valeur de la récompense). Il faut rétablir la confiance que l'effort produit des résultats positifs." },
{ id:58, lot:12, level:"tres-difficile", domain:"Processus", pmbok:"PMBOK 7",
  q:"Dans une situation d'escalade de projet, quand faut-il informer le sponsor AVANT d'avoir une solution ?",
  opts:["Jamais, il faut toujours avoir une solution avant d'escalader","Quand l'impact dépasse l'autorité ou le budget du CP, ou quand le sponsor est directement impacté","Uniquement pour les problèmes techniques","Uniquement en fin de projet"],
  correct:1, expl:"Il faut escalader sans solution quand : l'impact dépasse votre autorité/budget, le sponsor est directement affecté, ou un délai d'escalade causerait plus de dommages. Attendre une solution peut aggraver la situation." },
{ id:59, lot:12, level:"tres-difficile", domain:"Processus", pmbok:"Agile",
  q:"Qu'est-ce que le 'Innovation Accounting' dans le contexte Lean Startup appliqué aux projets Agile ?",
  opts:["La comptabilité standard appliquée aux startups","Des mesures intermédiaires d'apprentissage (leading indicators) pour évaluer la progression vers les objectifs à long terme","Une technique d'estimation des User Stories","L'audit financier des projets Agile"],
  correct:1, expl:"L'Innovation Accounting (Eric Ries) utilise des métriques d'apprentissage (ex: taux d'activation, rétention) comme indicateurs avancés de la valeur future. Utile pour les projets produits en environnement incertain." },
{ id:60, lot:12, level:"tres-difficile", domain:"Environnement", pmbok:"PMBOK 7",
  q:"Dans l'analyse des parties prenantes, la grille 'Pouvoir/Intérêt' classe un stakeholder avec haut pouvoir et faible intérêt dans quelle catégorie ?",
  opts:["Gérer de près","À surveiller","Tenir informé","Satisfaire (Keep Satisfied)"],
  correct:3, expl:"Grille Power/Interest : Haut pouvoir + faible intérêt = 'Keep Satisfied' (satisfaire). Ils peuvent avoir un impact majeur s'ils s'impliquent. Il faut les satisfaire sans les surcharger d'informations." },

// ── LOT 13 TRÈS DIFFICILE ────────────────────────────────────
{ id:61, lot:13, level:"tres-difficile", domain:"Processus", pmbok:"PMBOK 7",
  q:"Quelle est la différence entre un 'Assumption Log' et un 'Risk Register' dans PMBOK 7 ?",
  opts:["Ce sont le même document","L'Assumption Log documente les hypothèses et contraintes (qui peuvent devenir des risques), le Risk Register gère les risques identifiés avec leurs réponses","Le Risk Register est plus formel","L'Assumption Log est uniquement pour les phases initiales"],
  correct:1, expl:"L'Assumption Log documente les hypothèses de planification. Quand une hypothèse est menacée, elle peut être promue en risque dans le Risk Register. Les deux se complètent dans la gestion de l'incertitude." },
{ id:62, lot:13, level:"tres-difficile", domain:"Personnes", pmbok:"PMBOK 7",
  q:"Dans un contexte multiculturel, un chef de projet français manage une équipe distribuée en Inde et au Japon. Quel est le principal risque de communication ?",
  opts:["Les fuseaux horaires uniquement","Les styles de communication à contexte élevé (Japon/Inde) vs faible (France) créant des malentendus sur le sens réel des messages","Les différences de langues techniques","Le coût des outils de visioconférence"],
  correct:1, expl:"Hall distingue cultures à haut contexte (Japon, Inde : sens implicite, non-verbal important) et bas contexte (France, USA : sens explicite et direct). Un 'oui' peut signifier 'j'ai entendu' et non 'j'accepte'." },
{ id:63, lot:13, level:"tres-difficile", domain:"Processus", pmbok:"PMBOK 7",
  q:"Qu'est-ce que le 'Benefits Realization Management' dans PMBOK 7 ?",
  opts:["La gestion du budget du projet","Le processus d'identification, définition, planification, suivi et réalisation des bénéfices business attendus du projet","La gestion des bénéfices sociaux de l'équipe","Le calcul de la valeur acquise (EVM)"],
  correct:1, expl:"PMBOK 7 met l'accent sur la réalisation des bénéfices au-delà de la livraison technique. Le CP doit s'assurer que les livrables génèrent réellement la valeur business attendue, même après la clôture du projet." },
{ id:64, lot:13, level:"tres-difficile", domain:"Processus", pmbok:"Agile",
  q:"Dans l'Agile Release Train (ART) SAFe, qu'est-ce que le 'System Demo' ?",
  opts:["Une démonstration à des clients potentiels","Un événement end-of-PI où toutes les équipes présentent l'incrément intégré et testé de tout le PI","Une démo de l'architecture technique","Une revue de sprint individuelle"],
  correct:1, expl:"Le System Demo (ou PI System Demo) est tenu à la fin de chaque PI dans SAFe. Toutes les équipes de l'ART présentent l'incrément intégré, permettant aux stakeholders de voir la valeur agrégée et de donner du feedback." },
{ id:65, lot:13, level:"tres-difficile", domain:"Environnement", pmbok:"PMBOK 7",
  q:"Dans une analyse de sensibilité (Tornado Diagram), quelle variable correspond à la barre la plus longue ?",
  opts:["La variable avec le moins d'impact","La variable avec le plus grand impact sur les objectifs du projet — la plus critique","La variable avec la plus haute probabilité","La variable la plus facile à contrôler"],
  correct:1, expl:"Le Tornado Diagram classe les variables de risque par ordre d'impact décroissant. La barre la plus longue = la variable qui a le plus grand effet sur l'objectif (coût/délai). C'est elle qu'il faut surveiller en priorité." },

// ── LOT 14 TRÈS DIFFICILE ────────────────────────────────────
{ id:66, lot:14, level:"tres-difficile", domain:"Processus", pmbok:"PMBOK 7",
  q:"Quelle est la technique des '5 Pourquoi' (5 Whys) et dans quel contexte s'applique-t-elle en gestion de projet ?",
  opts:["Une technique d'estimation","Une analyse causale itérative pour identifier la cause racine d'un problème ou défaut","Une méthode de priorisation des risques","Une technique de conduite d'entretien des parties prenantes"],
  correct:1, expl:"Les 5 Whys (Ishikawa/Toyota) posent 'pourquoi ?' 5 fois pour remonter à la cause racine. En PM : analyse d'incidents, résolution de problèmes, amélioration continue. Évite de traiter les symptômes plutôt que les causes." },
{ id:67, lot:14, level:"tres-difficile", domain:"Personnes", pmbok:"PMBOK 7",
  q:"Un chef de projet doit influencer un directeur qui n'est pas dans sa hiérarchie directe. Quelle approche est la plus efficace selon PMI ?",
  opts:["Contourner ce directeur","Utiliser le pouvoir de référence (personal power) en construisant des relations et en démontrant sa valeur","Menacer d'escalader au PDG","Ignorer ce directeur et avancer sans son accord"],
  correct:1, expl:"PMI valorise le pouvoir de référence (expert, charisme, réseau) vs le pouvoir positionnel (hiérarchie). Construire des relations basées sur la confiance et démontrer sa valeur est l'approche la plus durable." },
{ id:68, lot:14, level:"tres-difficile", domain:"Processus", pmbok:"PMBOK 7",
  q:"Qu'est-ce que la 'Progressive Elaboration' dans PMBOK 7 ?",
  opts:["Une technique de décomposition du WBS","Le processus de détail croissant du plan projet au fur et à mesure que l'information devient disponible","Une méthode d'estimation agile","Un processus de gestion des changements"],
  correct:1, expl:"La Progressive Elaboration (ou Rolling Wave Planning) consiste à planifier en détail le travail proche et à un niveau moins détaillé le travail futur. C'est une adaptation naturelle à l'incertitude, surtout en début de projet." },
{ id:69, lot:14, level:"tres-difficile", domain:"Environnement", pmbok:"PMBOK 7",
  q:"Dans l'analyse des options stratégiques, qu'est-ce que la valeur actualisée nette (VAN/NPV) indique ?",
  opts:["Le profit brut du projet","La valeur actuelle des flux de trésorerie futurs moins l'investissement initial — VAN>0 = projet rentable","Le temps de retour sur investissement","Le budget maximum du projet"],
  correct:1, expl:"NPV = Σ(CF_t / (1+r)^t) - Investissement. Si NPV > 0, le projet génère plus de valeur qu'il ne coûte. Utilisée pour comparer des projets et justifier les investissements. Prend en compte la valeur temps de l'argent." },
{ id:70, lot:14, level:"tres-difficile", domain:"Processus", pmbok:"Agile",
  q:"Qu'est-ce que l'Event Storming et comment s'intègre-t-il dans une approche DDD (Domain-Driven Design) Agile ?",
  opts:["Une technique météo pour les projets outdoor","Un atelier collaboratif de modélisation des domaines métier en identifiant les événements business pour aligner technique et métier","Une technique de gestion de crise","Un outil de planification de Sprint"],
  correct:1, expl:"L'Event Storming (Alberto Brandolini) est un atelier réunissant développeurs et experts métier pour modéliser les domaines en identifiant les events, commands et aggregates. Aligne la compréhension métier/technique en DDD/Agile." },

// ── LOT 15 TRÈS DIFFICILE ────────────────────────────────────
{ id:71, lot:15, level:"tres-difficile", domain:"Processus", pmbok:"PMBOK 7",
  q:"Votre projet est à 60% d'avancement. EV=300k€, AC=350k€, BAC=500k€. Le client demande une re-estimation. Quelle formule EAC reflète le mieux l'hypothèse que les performances actuelles continueront ?",
  opts:["EAC = BAC = 500k€","EAC = AC + (BAC-EV) = 350+(500-300) = 550k€","EAC = BAC/CPI = 500/(300/350) = 583k€","EAC = EV/SPI"],
  correct:2, expl:"Pour l'hypothèse 'tendance actuelle continue' : EAC=BAC/CPI. CPI=300/350=0.857. EAC=500/0.857=583k€. L'option B suppose que le reste sera réalisé au budget (optimiste). L'option C est la plus réaliste et PMI-standard." },
{ id:72, lot:15, level:"tres-difficile", domain:"Personnes", pmbok:"PMBOK 7",
  q:"Dans le modèle ADKAR de gestion du changement, qu'est-ce que 'K' représente et pourquoi est-il critique ?",
  opts:["Knowledge — la connaissance de comment changer, critique car sans savoir-faire les gens ne peuvent pas adopter le changement","Kinetics — la vitesse du changement","Key Performance — les indicateurs de succès","Keep — la rétention des équipes"],
  correct:0, expl:"ADKAR : Awareness (conscientisation), Desire (désir), Knowledge (connaissance), Ability (capacité), Reinforcement (renforcement). K est critique car même en voulant changer, sans les compétences nécessaires, le changement échoue." },
{ id:73, lot:15, level:"tres-difficile", domain:"Environnement", pmbok:"PMBOK 7",
  q:"Dans une organisation Agile at Scale, comment mesure-t-on la 'Business Agility' selon SAFe ?",
  opts:["Par le nombre de Sprints complétés","Par la capacité à détecter et répondre rapidement aux opportunités et menaces du marché — mesurée par le Time-to-Market, qualité et satisfaction client","Par le budget Agile alloué","Par la vélocité cumulée de toutes les équipes"],
  correct:1, expl:"La Business Agility SAFe se mesure par : Time-to-Market (rapidité de livraison de valeur), qualité (défauts, satisfaction), flow metrics (WIP, lead time), et réponse aux opportunités de marché. C'est une mesure systémique." },
{ id:74, lot:15, level:"tres-difficile", domain:"Processus", pmbok:"PMBOK 7",
  q:"Qu'est-ce que la 'Disciplined Agile Delivery' (DAD) apporte par rapport à Scrum ?",
  opts:["DAD est une version simplifiée de Scrum","DAD est un cadre hybride qui couvre le cycle de vie complet, de l'inception à la production, intégrant Scrum, Kanban, Lean et autres pratiques selon le contexte","DAD remplace complètement PMBOK","DAD est uniquement pour les grandes entreprises"],
  correct:1, expl:"DAD (Scott Ambler/PMI) est un framework de décision qui guide le choix des pratiques selon le contexte. Contrairement à Scrum qui est prescriptif, DAD est descriptif et couvre tout le cycle de vie incluant les phases d'inception et de transition." },
{ id:75, lot:15, level:"tres-difficile", domain:"Personnes", pmbok:"PMBOK 7",
  q:"Selon le modèle Cynefin de Dave Snowden, dans quel domaine se situe un projet IT innovant avec des exigences émergentes et des solutions inconnues ?",
  opts:["Obvious (Simple)","Complicated","Complex","Chaotic"],
  correct:2, expl:"Cynefin : Simple (cause-effet clair), Complicated (expertise requise), Complex (émergent, pas de solution prédéfinie, expérimenter), Chaotic (crise, agir d'abord). Les projets innovants sont dans le domaine Complex, justifiant une approche Agile itérative." },
]

const LEVELS = [
  { key:"facile",        label:"Facile",        icon:"⭐",  color:"#27500A", bg:"#EAF3DE", border:"#C0DD97", lots:[1,2,3,4,5] },
  { key:"difficile",     label:"Difficile",     icon:"⭐⭐", color:"#854F0B", bg:"#FAEEDA", border:"#EF9F27", lots:[6,7,8,9,10] },
  { key:"tres-difficile",label:"Très Difficile",icon:"⭐⭐⭐",color:"#A32D2D", bg:"#FCEBEB", border:"#E24B4A", lots:[11,12,13,14,15] },
]

export default function PMPSimulatorPage() {
  const [selectedLevel, setSelectedLevel] = useState<string|null>(null)
  const [selectedLot, setSelectedLot] = useState<number|null>(null)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<number,number>>({})
  const [showExpl, setShowExpl] = useState(false)
  const [finished, setFinished] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [started, setStarted] = useState(false)

  const questions = useMemo(() =>
    selectedLot ? ALL_QUESTIONS.filter(q => q.lot === selectedLot) : [],
    [selectedLot]
  )
  const current = questions[currentIdx]
  const levelCfg = LEVELS.find(l => l.key === selectedLevel)

  useEffect(() => {
    if (!started || finished || !current) return
    if (timeLeft <= 0) { setFinished(true); return }
    const t = setTimeout(() => setTimeLeft(s => s-1), 1000)
    return () => clearTimeout(t)
  }, [started, finished, timeLeft, current])

  const startLot = (lot: number, level: string) => {
    setSelectedLot(lot); setSelectedLevel(level)
    setCurrentIdx(0); setAnswers({}); setShowExpl(false)
    setFinished(false); setTimeLeft(questions.length * 90 || 450)
    setStarted(true)
  }

  const answer = (i: number) => {
    if (answers[current.id] !== undefined) return
    setAnswers(p => ({ ...p, [current.id]: i }))
    setShowExpl(true)
  }

  const next = () => {
    if (currentIdx + 1 >= questions.length) setFinished(true)
    else { setCurrentIdx(c => c+1); setShowExpl(false) }
  }

  const score = questions.filter(q => answers[q.id] === q.correct).length
  const pct = questions.length > 0 ? Math.round(score/questions.length*100) : 0
  const passed = pct >= 61
  const mm = Math.floor(timeLeft/60)
  const ss = timeLeft % 60

  // Reset
  const reset = () => {
    setSelectedLevel(null); setSelectedLot(null); setStarted(false)
    setFinished(false); setAnswers({}); setCurrentIdx(0)
  }

  return (
    <AppLayout>
      <div style={{ padding:"24px 28px", background:"var(--bg)", minHeight:"100%" }}>
        <div style={{ marginBottom:24 }}>
          <p style={{ fontSize:11, color:"var(--text-3)", textTransform:"uppercase", letterSpacing:"1px", margin:"0 0 4px" }}>// PRÉPARATION PMP</p>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <h1 style={{ fontSize:22, fontWeight:700, color:"var(--text-1)", margin:0 }}>🎯 Simulateur Examen PMP</h1>
            <div style={{ display:"flex", gap:8 }}>
              {started && <button onClick={reset} style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", background:"#fff", border:"1px solid var(--border)", borderRadius:"var(--r8)", fontSize:12, cursor:"pointer" }}><RotateCcw size={13}/> Changer de lot</button>}
              <Link href="/pmp-conseils" style={{ padding:"7px 14px", background:"var(--primary-bg)", border:"1px solid #B5D4F4", borderRadius:"var(--r8)", fontSize:12, color:"var(--primary-t)", textDecoration:"none", fontWeight:500 }}>📖 Guide conseils</Link>
            </div>
          </div>
          <p style={{ fontSize:13, color:"var(--text-2)", margin:"4px 0 0" }}>75 questions · 3 niveaux · 15 lots de 5 questions · PMBOK 7 + Agile</p>
        </div>

        {/* Sélection lot */}
        {!started && (
          <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
            {LEVELS.map(lv => (
              <div key={lv.key} style={{ background:"var(--card)", border:`1px solid ${lv.border}`, borderRadius:"var(--r12)", overflow:"hidden" }}>
                <div style={{ padding:"14px 20px", background:lv.bg, display:"flex", alignItems:"center", gap:12 }}>
                  <span style={{ fontSize:22 }}>{lv.icon}</span>
                  <div>
                    <h2 style={{ fontSize:15, fontWeight:700, color:lv.color, margin:0 }}>Niveau {lv.label}</h2>
                    <p style={{ fontSize:12, color:lv.color, opacity:0.7, margin:0 }}>5 lots de 5 questions · {lv.lots.length * 5} questions au total</p>
                  </div>
                </div>
                <div style={{ padding:16, display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10 }}>
                  {lv.lots.map(lot => {
                    const lotQ = ALL_QUESTIONS.filter(q => q.lot === lot)
                    return (
                      <button key={lot} onClick={() => startLot(lot, lv.key)}
                        style={{ padding:"14px 10px", background:"var(--bg)", border:`1px solid ${lv.border}`, borderRadius:"var(--r8)", cursor:"pointer", textAlign:"center", transition:"all 0.15s" }}
                        onMouseEnter={e => { (e.currentTarget as any).style.background = lv.bg; (e.currentTarget as any).style.transform = "translateY(-2px)" }}
                        onMouseLeave={e => { (e.currentTarget as any).style.background = "var(--bg)"; (e.currentTarget as any).style.transform = "none" }}>
                        <div style={{ fontSize:20, marginBottom:6 }}>{lv.icon}</div>
                        <div style={{ fontSize:13, fontWeight:700, color:lv.color }}>Lot {lot}</div>
                        <div style={{ fontSize:11, color:"var(--text-3)", marginTop:3 }}>{lotQ.length} questions</div>
                        <div style={{ fontSize:10, color:"var(--text-3)", marginTop:2 }}>
                          {lotQ.map(q => q.domain).filter((v,i,a)=>a.indexOf(v)===i).join(", ").slice(0,20)}...
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quiz */}
        {started && !finished && current && (
          <div style={{ maxWidth:760, margin:"0 auto" }}>
            {/* Header quiz */}
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"var(--text-3)", marginBottom:4 }}>
                  <span>Lot {selectedLot} · {levelCfg?.label} · Q{currentIdx+1}/{questions.length}</span>
                  <span>{pct}% correct</span>
                </div>
                <div style={{ height:5, background:"var(--border)", borderRadius:3, overflow:"hidden" }}>
                  <div style={{ height:"100%", borderRadius:3, background:levelCfg?.color, width:`${((currentIdx)/questions.length)*100}%`, transition:"width 0.3s" }}/>
                </div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 12px", background:timeLeft<30?"#FCEBEB":"var(--bg)", border:`1px solid ${timeLeft<30?"#E24B4A":"var(--border)"}`, borderRadius:"var(--r8)" }}>
                <Clock size={13} style={{ color:timeLeft<30?"#A32D2D":"var(--text-2)" }}/>
                <span style={{ fontSize:13, fontWeight:700, fontFamily:"monospace", color:timeLeft<30?"#A32D2D":"var(--text-1)" }}>{String(mm).padStart(2,"0")}:{String(ss).padStart(2,"0")}</span>
              </div>
            </div>

            <div style={{ background:"var(--card)", border:`1px solid ${levelCfg?.border}`, borderRadius:"var(--r12)", padding:24 }}>
              <div style={{ display:"flex", gap:8, marginBottom:14 }}>
                <span style={{ padding:"3px 10px", background:levelCfg?.bg, color:levelCfg?.color, borderRadius:20, fontSize:11, fontWeight:600 }}>{levelCfg?.icon} {levelCfg?.label}</span>
                <span style={{ padding:"3px 10px", background:"#E6F1FB", color:"#185FA5", borderRadius:20, fontSize:11, fontWeight:600 }}>{current.domain}</span>
                <span style={{ padding:"3px 10px", background:"#EEEDFE", color:"#3C3489", borderRadius:20, fontSize:11, fontWeight:600 }}>{current.pmbok}</span>
              </div>
              <p style={{ fontSize:15, fontWeight:500, color:"var(--text-1)", lineHeight:1.7, margin:"0 0 20px" }}>{current.q}</p>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {current.opts.map((opt, i) => {
                  const done = answers[current.id] !== undefined
                  const sel = answers[current.id] === i
                  const ok = i === current.correct
                  return (
                    <button key={i} onClick={() => answer(i)} disabled={done}
                      style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"12px 14px",
                        background: done ? (ok?"#EAF3DE":sel?"#FCEBEB":"#fff") : "#fff",
                        border: `1.5px solid ${done ? (ok?"#639922":sel?"#E24B4A":"var(--border)") : "var(--border)"}`,
                        borderRadius:"var(--r8)", cursor:done?"default":"pointer", textAlign:"left", transition:"all 0.12s" }}
                      onMouseEnter={e=>{ if(!done)(e.currentTarget as any).style.borderColor=levelCfg?.color }}
                      onMouseLeave={e=>{ if(!done)(e.currentTarget as any).style.borderColor="var(--border)" }}>
                      <div style={{ width:24, height:24, borderRadius:"50%", border:"2px solid currentColor", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, flexShrink:0, color:done?(ok?"#27500A":sel?"#A32D2D":"var(--text-3)"):"var(--text-3)" }}>
                        {done&&ok?"✓":done&&sel?"✗":String.fromCharCode(65+i)}
                      </div>
                      <span style={{ fontSize:13, lineHeight:1.5, color:done?(ok?"#27500A":sel?"#A32D2D":"var(--text-2)"):"var(--text-1)" }}>{opt}</span>
                    </button>
                  )
                })}
              </div>
              {showExpl && (
                <div style={{ marginTop:16, background:"#E6F1FB", border:"1px solid #B5D4F4", borderLeft:"4px solid #185FA5", borderRadius:"var(--r8)", padding:"12px 14px" }}>
                  <p style={{ fontSize:12, fontWeight:600, color:"#0C447C", margin:"0 0 4px" }}>💡 Explication</p>
                  <p style={{ fontSize:12, color:"#185FA5", margin:0, lineHeight:1.6 }}>{current.expl}</p>
                </div>
              )}
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", marginTop:12 }}>
              <button onClick={() => { setCurrentIdx(c=>Math.max(0,c-1)); setShowExpl(false) }} disabled={currentIdx===0}
                style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", background:"#fff", border:"1px solid var(--border)", borderRadius:"var(--r8)", fontSize:13, color:"var(--text-2)", cursor:currentIdx===0?"not-allowed":"pointer", opacity:currentIdx===0?0.4:1 }}>
                <ChevronLeft size={14}/> Précédente
              </button>
              {answers[current?.id] !== undefined ? (
                <button onClick={next}
                  style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", background:levelCfg?.color, color:"#fff", border:"none", borderRadius:"var(--r8)", fontSize:13, fontWeight:600, cursor:"pointer" }}>
                  {currentIdx===questions.length-1?"Résultats 🏆":"Suivante"} <ChevronRight size={14}/>
                </button>
              ) : (
                <div style={{ padding:"8px 16px", background:"var(--bg)", border:"1px solid var(--border)", borderRadius:"var(--r8)", fontSize:12, color:"var(--text-3)" }}>Sélectionnez une réponse</div>
              )}
            </div>
          </div>
        )}

        {/* Résultat */}
        {finished && (
          <div style={{ maxWidth:600, margin:"0 auto", background:"var(--card)", border:"1px solid var(--border)", borderRadius:"var(--r12)", padding:32, textAlign:"center" }}>
            <div style={{ fontSize:56, marginBottom:16 }}>{passed?"🏆":"📚"}</div>
            <h2 style={{ fontSize:22, fontWeight:700, color:"var(--text-1)", margin:"0 0 6px" }}>{passed?"Excellent !" : "Révisez encore !"}</h2>
            <p style={{ fontSize:14, color:"var(--text-2)", margin:"0 0 24px" }}>
              Lot {selectedLot} · Niveau {levelCfg?.label} · Score : <strong style={{ fontSize:28, color:passed?"#27500A":"#A32D2D" }}>{pct}%</strong>
            </p>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:20 }}>
              {[{l:"Correctes",v:score,c:"#27500A",bg:"#EAF3DE"},{l:"Incorrectes",v:questions.length-score,c:"#A32D2D",bg:"#FCEBEB"},{l:"Score",v:`${pct}%`,c:passed?"#27500A":"#A32D2D",bg:passed?"#EAF3DE":"#FCEBEB"}].map(k=>(
                <div key={k.l} style={{ background:k.bg, borderRadius:"var(--r8)", padding:12 }}>
                  <p style={{ fontSize:10, color:"var(--text-3)", margin:"0 0 4px", textTransform:"uppercase" }}>{k.l}</p>
                  <p style={{ fontSize:22, fontWeight:700, color:k.c, margin:0 }}>{k.v}</p>
                </div>
              ))}
            </div>
            <div style={{ background:passed?"#EAF3DE":"#FAEEDA", border:`1px solid ${passed?"#C0DD97":"#EF9F27"}`, borderRadius:"var(--r8)", padding:"12px 16px", marginBottom:20 }}>
              <p style={{ fontSize:13, color:passed?"#27500A":"#854F0B", margin:0 }}>
                {passed ? "✅ Seuil PMI (61%) atteint sur ce lot !" : "⚠️ Seuil PMI non atteint. Révisez les explications et retentez ce lot."}
              </p>
            </div>
            <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
              <button onClick={() => startLot(selectedLot!, selectedLevel!)}
                style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 18px", background:levelCfg?.color, color:"#fff", border:"none", borderRadius:"var(--r8)", fontSize:13, fontWeight:600, cursor:"pointer" }}>
                <RotateCcw size={14}/> Reprendre ce lot
              </button>
              <button onClick={reset}
                style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 18px", background:"#fff", border:"1px solid var(--border)", borderRadius:"var(--r8)", fontSize:13, cursor:"pointer" }}>
                Choisir un autre lot
              </button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
