"use client"
import { useState, useEffect, useMemo } from "react"
import AppLayout from "@/components/layout/AppLayout"
import Link from "next/link"
import { Clock, RotateCcw, ChevronRight, ChevronLeft } from "lucide-react"


const ALL_QUESTIONS = [

// ════════════════════════════════════════════════════
// LOT 1 — FACILE (15 questions)
// ════════════════════════════════════════════════════
{id:1,lot:1,level:"facile",domain:"Processus",pmbok:"PMBOK 7",
q:"Quelle est la première étape du cycle de vie d'un projet ?",
opts:["Planification","Initiation","Exécution","Clôture"],correct:1,
expl:"L'initiation est la première phase. Elle définit les objectifs, nomme le chef de projet et produit la charte de projet."},
{id:2,lot:1,level:"facile",domain:"Processus",pmbok:"PMBOK 7",
q:"Qu'est-ce que la Charte de Projet (Project Charter) ?",
opts:["Le planning détaillé","Le document qui autorise officiellement le projet et nomme le CP","Le contrat client","Le registre des risques"],correct:1,
expl:"La charte de projet autorise officiellement le projet, définit les objectifs et donne l'autorité au chef de projet."},
{id:3,lot:1,level:"facile",domain:"Personnes",pmbok:"PMBOK 7",
q:"Qui est responsable de la réussite globale du projet ?",
opts:["Le sponsor","Le chef de projet","L'équipe","Le client"],correct:1,
expl:"Le chef de projet est responsable de la réussite. Il coordonne l'équipe, gère les risques et communique avec les parties prenantes."},
{id:4,lot:1,level:"facile",domain:"Processus",pmbok:"Agile",
q:"Dans Scrum, combien de rôles officiels existe-t-il ?",
opts:["2","3","4","5"],correct:1,
expl:"Scrum définit 3 rôles : Product Owner, Scrum Master, et Developers."},
{id:5,lot:1,level:"facile",domain:"Processus",pmbok:"PMBOK 7",
q:"Qu'est-ce que le WBS (Work Breakdown Structure) ?",
opts:["Un diagramme de Gantt","Une décomposition hiérarchique du travail en livrables","Un registre des risques","Un tableau de bord"],correct:1,
expl:"Le WBS est une décomposition hiérarchique du scope en livrables plus petits et gérables."},
{id:6,lot:1,level:"facile",domain:"Processus",pmbok:"PMBOK 7",
q:"Quelle est la définition d'un projet selon PMBOK ?",
opts:["Un travail répétitif et continu","Un effort temporaire mené pour créer un produit, service ou résultat unique","Une opération quotidienne de l'entreprise","Un contrat avec un client"],correct:1,
expl:"Un projet est temporaire (a un début et une fin définis) et produit quelque chose d'unique. Ce qui le distingue des opérations courantes."},
{id:7,lot:1,level:"facile",domain:"Personnes",pmbok:"PMBOK 7",
q:"Qu'est-ce qu'une partie prenante (stakeholder) ?",
opts:["Uniquement les membres de l'équipe","Toute personne impactée par ou pouvant influencer le projet","Le client uniquement","Le sponsor financier uniquement"],correct:1,
expl:"Un stakeholder est toute personne, groupe ou organisation qui peut affecter ou être affecté par le projet."},
{id:8,lot:1,level:"facile",domain:"Processus",pmbok:"Agile",
q:"Qu'est-ce que le Product Backlog en Scrum ?",
opts:["La liste des bugs","La liste ordonnée de tout ce que le produit doit faire","Le plan de sprint","Le rapport d'avancement"],correct:1,
expl:"Le Product Backlog est une liste ordonnée par priorité de tout ce qui est nécessaire dans le produit, géré par le Product Owner."},
{id:9,lot:1,level:"facile",domain:"Environnement",pmbok:"PMBOK 7",
q:"Que signifie RACI dans une matrice de responsabilités ?",
opts:["Risk Assumption Constraint Issue","Responsible Accountable Consulted Informed","Resources Activities Costs Indicators","Review Approve Control Implement"],correct:1,
expl:"RACI : Responsible (exécute), Accountable (responsable final), Consulted (consulté), Informed (informé)."},
{id:10,lot:1,level:"facile",domain:"Processus",pmbok:"PMBOK 7",
q:"Qu'est-ce qu'un livrable (deliverable) ?",
opts:["Une réunion","Un résultat unique et vérifiable requis pour terminer une tâche","Un membre de l'équipe","Un risque identifié"],correct:1,
expl:"Un livrable est tout résultat, document ou composant unique et vérifiable produit pour terminer un processus ou projet."},
{id:11,lot:1,level:"facile",domain:"Processus",pmbok:"PMBOK 7",
q:"Quel est le triple contrainte classique en gestion de projet ?",
opts:["Coût, Qualité, Risque","Scope, Délai, Coût","Équipe, Client, Sponsor","Planning, Budget, Ressources"],correct:1,
expl:"Le triangle de contraintes (Iron Triangle) relie Scope, Délai et Coût. Modifier l'un impacte les autres."},
{id:12,lot:1,level:"facile",domain:"Environnement",pmbok:"PMBOK 7",
q:"Qu'est-ce que la valeur acquise (Earned Value - EV) ?",
opts:["Le coût réel du travail","La valeur monétaire du travail réellement accompli","Le budget total","La valeur planifiée"],correct:1,
expl:"L'EV est la valeur du travail réellement accompli, exprimée en termes budgétaires. EV = % d'avancement × BAC."},
{id:13,lot:1,level:"facile",domain:"Personnes",pmbok:"Agile",
q:"Quel est le rôle du Scrum Master ?",
opts:["Décider des fonctionnalités","Faciliter l'adoption de Scrum et supprimer les obstacles","Gérer le budget","Diriger techniquement l'équipe"],correct:1,
expl:"Le Scrum Master est un servant leader qui aide l'équipe à appliquer Scrum et supprime les impediments."},
{id:14,lot:1,level:"facile",domain:"Processus",pmbok:"PMBOK 7",
q:"Qu'est-ce qu'un jalon (milestone) ?",
opts:["Une tâche critique","Un point significatif ou événement important, généralement de durée zéro","Un membre clé","Un livrable intermédiaire"],correct:1,
expl:"Un jalon est un point remarquable du planning, de durée zéro, qui marque l'achèvement d'une phase importante."},
{id:15,lot:1,level:"facile",domain:"Processus",pmbok:"PMBOK 7",
q:"Qu'est-ce que la clôture de projet inclut ?",
opts:["Uniquement la livraison finale","Leçons apprises, archivage, libération des ressources et acceptation formelle","La signature du contrat initial","La nomination de la nouvelle équipe"],correct:1,
expl:"La clôture inclut : acceptation formelle, leçons apprises, archivage, libération des ressources et dissolution de l'équipe."},

// ════════════════════════════════════════════════════
// LOT 2 — FACILE (15 questions)
// ════════════════════════════════════════════════════
{id:16,lot:2,level:"facile",domain:"Processus",pmbok:"PMBOK 7",
q:"Quel document décrit comment le projet sera exécuté, surveillé et contrôlé ?",
opts:["La charte de projet","Le Plan de Management du Projet","Le registre RAID","La matrice RACI"],correct:1,
expl:"Le Plan de Management du Projet décrit comment le projet sera planifié, exécuté, surveillé et clôturé."},
{id:17,lot:2,level:"facile",domain:"Personnes",pmbok:"PMBOK 7",
q:"Qu'est-ce que le 'servant leadership' dans le contexte PMI ?",
opts:["Le CP fait tout à la place de l'équipe","Le leader se met au service de l'équipe pour la faire réussir","Le leader impose ses décisions","Le leader évite les responsabilités"],correct:1,
expl:"Le servant leadership place les besoins de l'équipe en premier. Le leader facilite, soutient et lève les obstacles."},
{id:18,lot:2,level:"facile",domain:"Processus",pmbok:"Agile",
q:"Quelle est la durée recommandée d'un Sprint en Scrum ?",
opts:["1 semaine fixe","1 à 4 semaines selon le contexte","3 mois","6 mois"],correct:1,
expl:"Scrum recommande des Sprints de 1 à 4 semaines. La durée doit rester constante. 2 semaines est la plus courante."},
{id:19,lot:2,level:"facile",domain:"Environnement",pmbok:"PMBOK 7",
q:"Que mesure le CPI (Cost Performance Index) ?",
opts:["L'avancement du planning","L'efficacité des coûts = EV/AC","Le coût total prévu","La satisfaction du client"],correct:1,
expl:"CPI = EV/AC. CPI > 1 : sous budget. CPI < 1 : dépassement. CPI = 1 : dans le budget."},
{id:20,lot:2,level:"facile",domain:"Processus",pmbok:"PMBOK 7",
q:"Qu'est-ce que le registre des risques ?",
opts:["La liste des assurances","Un document qui identifie, analyse et planifie les réponses aux risques","Le budget de contingence","La liste des problèmes survenus"],correct:1,
expl:"Le registre des risques documente les risques identifiés, leur probabilité, impact, priorité et stratégies de réponse."},
{id:21,lot:2,level:"facile",domain:"Personnes",pmbok:"PMBOK 7",
q:"Quel est le rôle principal du sponsor de projet ?",
opts:["Gérer l'équipe quotidiennement","Fournir les ressources et lever les obstacles organisationnels","Rédiger le code","Gérer les risques techniques"],correct:1,
expl:"Le sponsor fournit les ressources, soutient au niveau organisationnel et aide à résoudre les problèmes dépassant l'autorité du CP."},
{id:22,lot:2,level:"facile",domain:"Processus",pmbok:"PMBOK 7",
q:"Qu'est-ce que la communication active dans le management de projet ?",
opts:["Envoyer beaucoup d'emails","S'assurer que le message est bien reçu et compris","Organiser de nombreuses réunions","Utiliser des outils modernes"],correct:1,
expl:"La communication active confirme que le message est bien reçu et compris, incluant l'écoute active et la vérification."},
{id:23,lot:2,level:"facile",domain:"Environnement",pmbok:"PMBOK 7",
q:"Que mesure le SPI (Schedule Performance Index) ?",
opts:["L'efficacité des coûts","L'efficacité du planning = EV/PV","Le nombre de tâches terminées","La satisfaction du client"],correct:1,
expl:"SPI = EV/PV. SPI > 1 : en avance. SPI < 1 : en retard. SPI = 1 : dans les délais."},
{id:24,lot:2,level:"facile",domain:"Processus",pmbok:"Agile",
q:"Qu'est-ce que la Definition of Done (DoD) ?",
opts:["La liste des fonctionnalités","L'ensemble des critères qu'un incrément doit satisfaire pour être terminé","Le contrat signé","La feuille de route du produit"],correct:1,
expl:"La DoD définit les critères de complétude (code, tests, documentation...). Elle assure qualité et transparence."},
{id:25,lot:2,level:"facile",domain:"Processus",pmbok:"PMBOK 7",
q:"Qu'est-ce que le Scope Creep ?",
opts:["Une technique d'estimation","L'expansion non contrôlée du périmètre sans ajustement délais/coûts","Une méthode agile","Un type de risque financier"],correct:1,
expl:"Le Scope Creep est l'ajout non contrôlé de fonctionnalités sans passer par le processus de contrôle des changements."},
{id:26,lot:2,level:"facile",domain:"Personnes",pmbok:"PMBOK 7",
q:"Selon Maslow, quel besoin doit être satisfait en priorité ?",
opts:["Estime de soi","Appartenance sociale","Besoins physiologiques et de sécurité","Accomplissement personnel"],correct:2,
expl:"La pyramide de Maslow place les besoins physiologiques et de sécurité à la base. Sans eux, les autres niveaux ne peuvent être atteints."},
{id:27,lot:2,level:"facile",domain:"Processus",pmbok:"PMBOK 7",
q:"Quel est l'objectif d'une réunion rétrospective ?",
opts:["Planifier le prochain sprint","Réfléchir sur le processus pour l'améliorer continuellement","Présenter les livrables au client","Identifier les risques"],correct:1,
expl:"La rétrospective vise l'amélioration continue du processus. On identifie ce qui a bien fonctionné et définit des actions concrètes."},
{id:28,lot:2,level:"facile",domain:"Environnement",pmbok:"PMBOK 7",
q:"Qu'est-ce que le BAC (Budget at Completion) ?",
opts:["Le coût réel actuel","Le budget total approuvé pour le projet","L'estimation révisée du coût final","La valeur planifiée à ce jour"],correct:1,
expl:"BAC est le budget total planifié pour le projet. C'est la valeur de référence pour les calculs EVM."},
{id:29,lot:2,level:"facile",domain:"Processus",pmbok:"Agile",
q:"Qu'est-ce qu'une User Story ?",
opts:["Un rapport de projet","Une description d'une fonctionnalité du point de vue de l'utilisateur","Un document technique","Un plan de test"],correct:1,
expl:"Une User Story : 'En tant que [rôle], je veux [action] afin de [bénéfice]'. Elle décrit la valeur pour l'utilisateur."},
{id:30,lot:2,level:"facile",domain:"Personnes",pmbok:"PMBOK 7",
q:"Qu'est-ce que la théorie X de McGregor suppose des employés ?",
opts:["Les employés aiment travailler et cherchent les responsabilités","Les employés sont paresseux et doivent être contrôlés","Les employés sont auto-motivés","Les employés ont besoin de défis"],correct:1,
expl:"McGregor : Théorie X = employés paresseux, besoin de contrôle. Théorie Y = employés motivés, cherchent responsabilités. PMI favorise la Théorie Y."},

// ════════════════════════════════════════════════════
// LOT 3 — FACILE (15 questions)
// ════════════════════════════════════════════════════
{id:31,lot:3,level:"facile",domain:"Processus",pmbok:"PMBOK 7",
q:"Qu'est-ce que la méthode du chemin critique (CPM) ?",
opts:["Une méthode de budgétisation","Une technique pour identifier la séquence de tâches la plus longue déterminant la durée minimale","Une méthode agile","Un outil de gestion des risques"],correct:1,
expl:"Le CPM identifie le chemin critique : séquence de tâches la plus longue, sans marge. Tout retard sur ce chemin retarde le projet."},
{id:32,lot:3,level:"facile",domain:"Personnes",pmbok:"PMBOK 7",
q:"Qu'est-ce qu'un conflit d'intérêt selon le Code d'Éthique PMI ?",
opts:["Un désaccord entre membres","Une situation où les intérêts personnels peuvent influencer les décisions professionnelles","Un conflit de planning","Un désaccord avec le client"],correct:1,
expl:"Un conflit d'intérêt survient quand les intérêts personnels pourraient influencer les décisions. PMI exige de les divulguer."},
{id:33,lot:3,level:"facile",domain:"Processus",pmbok:"PMBOK 7",
q:"Quelle est la durée maximale d'un Daily Scrum ?",
opts:["5 minutes","15 minutes","30 minutes","1 heure"],correct:1,
expl:"Le Daily Scrum est limité à 15 minutes. L'équipe y répond : qu'ai-je fait hier, que vais-je faire, y a-t-il des obstacles ?"},
{id:34,lot:3,level:"facile",domain:"Environnement",pmbok:"PMBOK 7",
q:"Selon PMBOK 7, combien de principes de gestion de projet y a-t-il ?",
opts:["5","8","10","12"],correct:3,
expl:"PMBOK 7 introduit 12 principes de gestion de projet, remplaçant l'approche par processus de PMBOK 6."},
{id:35,lot:3,level:"facile",domain:"Processus",pmbok:"PMBOK 7",
q:"Qu'est-ce que le Plan de Communication ?",
opts:["La liste des emails envoyés","Un document décrivant qui reçoit quoi, quand, comment et de qui","Le planning des réunions","Le contrat avec le client"],correct:1,
expl:"Le Plan de Communication définit les besoins d'information des parties prenantes : quoi, à qui, quand, comment, par qui."},
{id:36,lot:3,level:"facile",domain:"Personnes",pmbok:"Agile",
q:"Dans Scrum, qu'est-ce que le Sprint Review ?",
opts:["Une réunion interne de l'équipe","Une démonstration des livrables du Sprint aux parties prenantes pour obtenir du feedback","La rétrospective de l'équipe","La planification du prochain Sprint"],correct:1,
expl:"Le Sprint Review est un événement où l'équipe présente l'incrément aux parties prenantes. C'est un moment d'inspection et d'adaptation du Product Backlog."},
{id:37,lot:3,level:"facile",domain:"Processus",pmbok:"PMBOK 7",
q:"Qu'est-ce que la gestion des changements intégrée ?",
opts:["Accepter tous les changements demandés","Un processus formel pour évaluer, approuver et gérer les changements au plan de projet","Refuser tous les changements","Modifier le projet sans documentation"],correct:1,
expl:"La gestion intégrée des changements évalue l'impact de chaque changement sur le scope, délai, coût et qualité avant approbation."},
{id:38,lot:3,level:"facile",domain:"Environnement",pmbok:"PMBOK 7",
q:"Qu'est-ce que la variance de coût (CV) ?",
opts:["EV - PV","EV - AC","AC - PV","BAC - EAC"],correct:1,
expl:"CV = EV - AC. CV positif = sous budget. CV négatif = dépassement. Ex: CV = 100k - 120k = -20k → dépassement de 20k."},
{id:39,lot:3,level:"facile",domain:"Personnes",pmbok:"PMBOK 7",
q:"Selon Herzberg, qu'est-ce qu'un facteur d'hygiène ?",
opts:["Un facteur qui motive intrinsèquement","Un facteur dont l'absence crée de l'insatisfaction mais dont la présence ne motive pas (salaire, conditions)","La reconnaissance et l'accomplissement","La progression de carrière"],correct:1,
expl:"Herzberg : facteurs d'hygiène (salaire, conditions) évitent l'insatisfaction. Facteurs de motivation (accomplissement, responsabilité) créent la satisfaction."},
{id:40,lot:3,level:"facile",domain:"Processus",pmbok:"PMBOK 7",
q:"Qu'est-ce que la matrice des parties prenantes (Stakeholder Register) ?",
opts:["La liste du personnel RH","Un document identifiant les parties prenantes, leur intérêt, influence et stratégie d'engagement","Le registre des risques","Le plan de communication"],correct:1,
expl:"Le registre des parties prenantes documente l'identification, l'évaluation et la classification de chaque stakeholder pour guider l'engagement."},
{id:41,lot:3,level:"facile",domain:"Processus",pmbok:"Agile",
q:"Qu'est-ce que la vélocité en Agile ?",
opts:["La vitesse de déploiement","La quantité de Story Points livrés par Sprint","La satisfaction de l'équipe","Le nombre de membres de l'équipe"],correct:1,
expl:"La vélocité = SP livrés par Sprint. En divisant le backlog par la vélocité moyenne, on estime le nombre de Sprints nécessaires."},
{id:42,lot:3,level:"facile",domain:"Environnement",pmbok:"PMBOK 7",
q:"Qu'est-ce que le PV (Planned Value) ?",
opts:["Le coût réel engagé","La valeur du travail prévu d'être accompli à une date donnée","La valeur du travail réellement fait","Le budget total du projet"],correct:1,
expl:"PV (Valeur Planifiée) = portion du budget planifiée pour le travail devant être terminé à une date donnée. C'est la baseline."},
{id:43,lot:3,level:"facile",domain:"Personnes",pmbok:"PMBOK 7",
q:"Que signifie 'escalader' un problème dans le management de projet ?",
opts:["Rendre le problème plus difficile","Transmettre un problème à un niveau hiérarchique supérieur car il dépasse l'autorité du CP","Ignorer le problème","Résoudre le problème seul"],correct:1,
expl:"Escalader signifie transmettre un problème au management ou sponsor quand il dépasse l'autorité, le budget ou les compétences du chef de projet."},
{id:44,lot:3,level:"facile",domain:"Processus",pmbok:"PMBOK 7",
q:"Qu'est-ce que la liste d'activités (Activity List) ?",
opts:["Le planning du projet","Un document qui liste les activités nécessaires pour produire les livrables du WBS","Le registre des risques","La liste des membres d'équipe"],correct:1,
expl:"La liste d'activités décompose les éléments du WBS en actions spécifiques à réaliser. Chaque activité a un identifiant, nom et description."},
{id:45,lot:3,level:"facile",domain:"Processus",pmbok:"PMBOK 7",
q:"Qu'est-ce que la méthode MoSCoW en priorisation ?",
opts:["Must have, Should have, Could have, Won't have","Most Significant, Occasional, Sometimes, Canceled","Major, Standard, Complex, Workflow","None of the above"],correct:0,
expl:"MoSCoW : Must (obligatoire), Should (important), Could (souhaitable), Won't (pas maintenant). Très utilisée en Agile pour prioriser le backlog."},

// ════════════════════════════════════════════════════
// LOT 4 — FACILE (15 questions)
// ════════════════════════════════════════════════════
{id:46,lot:4,level:"facile",domain:"Processus",pmbok:"PMBOK 7",
q:"Qu'est-ce que l'estimation par analogie ?",
opts:["Estimer en utilisant des données de projets similaires passés","Estimer chaque tâche individuellement","Estimer avec des experts","Estimer par calcul mathématique"],correct:0,
expl:"L'estimation par analogie utilise l'expérience de projets similaires passés comme base. Elle est moins précise mais plus rapide."},
{id:47,lot:4,level:"facile",domain:"Personnes",pmbok:"PMBOK 7",
q:"Qu'est-ce que la résolution de conflits par 'compromis' ?",
opts:["Imposer sa solution","Chaque partie cède sur certains points pour trouver une solution acceptable","Ignorer le conflit","Demander à un tiers de décider"],correct:1,
expl:"Le compromis (Give and take) = chacun cède sur certains points. PMI préfère la collaboration (confrontation) qui cherche une solution gagnant-gagnant."},
{id:48,lot:4,level:"facile",domain:"Environnement",pmbok:"PMBOK 7",
q:"Qu'est-ce que la variance de délai (SV) ?",
opts:["EV - AC","EV - PV","PV - AC","BAC - EV"],correct:1,
expl:"SV = EV - PV. SV positif = en avance sur le planning. SV négatif = en retard. Ex: SV = 200k - 250k = -50k → en retard."},
{id:49,lot:4,level:"facile",domain:"Processus",pmbok:"Agile",
q:"Qu'est-ce qu'un Burndown Chart en Agile ?",
opts:["Un graphique montrant les coûts","Un graphique montrant le travail restant dans le Sprint (tendance descendante)","Un graphique de la satisfaction de l'équipe","Un diagramme de Gantt"],correct:1,
expl:"Le Burndown Chart montre le travail restant (en SP ou heures) sur l'axe Y et le temps sur l'axe X. Il doit descendre vers zéro à la fin du Sprint."},
{id:50,lot:4,level:"facile",domain:"Processus",pmbok:"PMBOK 7",
q:"Qu'est-ce que le diagramme de réseau (Network Diagram) en gestion de projet ?",
opts:["Un organigramme de l'équipe","Une représentation visuelle des activités et leurs dépendances logiques","Un diagramme de communication","Un organigramme des stakeholders"],correct:1,
expl:"Le diagramme de réseau montre les activités et leurs interdépendances (FS, FF, SS, SF). Il est la base pour calculer le chemin critique."},
{id:51,lot:4,level:"facile",domain:"Personnes",pmbok:"PMBOK 7",
q:"Selon le modèle de Tuckman, quelle est la première phase de développement d'une équipe ?",
opts:["Storming","Norming","Forming","Performing"],correct:2,
expl:"Les 5 phases de Tuckman : Forming (constitution) → Storming (confrontation) → Norming (normalisation) → Performing (performance) → Adjourning (dissolution)."},
{id:52,lot:4,level:"facile",domain:"Processus",pmbok:"PMBOK 7",
q:"Qu'est-ce que la réunion de lancement (Kick-off meeting) vise à accomplir ?",
opts:["Signer le contrat","Aligner tous les stakeholders sur les objectifs, rôles et attentes du projet","Finaliser le planning détaillé","Identifier tous les risques"],correct:1,
expl:"Le Kick-off aligne toutes les parties prenantes sur la vision, les objectifs, les rôles et les attentes. C'est le démarrage officiel."},
{id:53,lot:4,level:"facile",domain:"Environnement",pmbok:"PMBOK 7",
q:"Qu'est-ce que l'EAC (Estimate at Completion) ?",
opts:["Le budget initial du projet","La prévision du coût total final du projet","Le coût réel à ce jour","La valeur planifiée restante"],correct:1,
expl:"EAC est la prévision du coût total final. Formule la plus courante : EAC = BAC/CPI. Si CPI < 1, EAC > BAC = dépassement probable."},
{id:54,lot:4,level:"facile",domain:"Processus",pmbok:"Agile",
q:"Qu'est-ce que la Definition of Ready (DoR) ?",
opts:["Les critères pour qu'une US soit terminée","Les critères pour qu'une US puisse entrer dans un Sprint","La liste des features prêtes","Le document de clôture du Sprint"],correct:1,
expl:"La DoR définit les critères qu'une User Story doit remplir avant d'entrer dans un Sprint Planning. Ex: bien définie, estimée, testable."},
{id:55,lot:4,level:"facile",domain:"Personnes",pmbok:"PMBOK 7",
q:"Qu'est-ce que la méthode SMART pour définir des objectifs ?",
opts:["Simple Mesurable Agile Réaliste Temporel","Spécifique Mesurable Atteignable Réaliste Temporellement défini","Systémique Managé Agile Révolutionnaire Technique","Standard Modèle Agile Résultat Temps"],correct:1,
expl:"SMART : Spécifique, Mesurable, Atteignable (Achievable), Réaliste, Temporellement défini. Utilisé pour formuler des objectifs de projet clairs."},
{id:56,lot:4,level:"facile",domain:"Processus",pmbok:"PMBOK 7",
q:"Qu'est-ce qu'une hypothèse (assumption) en gestion de projet ?",
opts:["Un risque identifié","Un facteur considéré comme vrai sans preuve pour la planification","Une contrainte imposée","Un problème actuel"],correct:1,
expl:"Une hypothèse est un facteur supposé vrai pour la planification (ex: ressources disponibles). Elle doit être documentée et vérifiée."},
{id:57,lot:4,level:"facile",domain:"Environnement",pmbok:"PMBOK 7",
q:"Qu'est-ce que la réserve pour aléas (Contingency Reserve) ?",
opts:["Le budget total du projet","Une provision pour les risques identifiés, incluse dans la baseline de coûts","Un budget pour les risques inconnus","Le salaire du chef de projet"],correct:1,
expl:"La réserve pour aléas couvre les risques identifiés (known unknowns). Elle est dans la baseline de coûts et gérée par le chef de projet."},
{id:58,lot:4,level:"facile",domain:"Processus",pmbok:"PMBOK 7",
q:"Qu'est-ce que la décomposition progressive (Rolling Wave Planning) ?",
opts:["Planifier tout le projet en détail dès le début","Planifier en détail le travail proche et moins précisément le travail futur","Décomposer le WBS en sous-projets","Une méthode de Scrum"],correct:1,
expl:"Rolling Wave : on planifie en détail ce qui est proche et de façon macro ce qui est loin. Au fur et à mesure, on détaille le futur quand l'info est disponible."},
{id:59,lot:4,level:"facile",domain:"Personnes",pmbok:"PMBOK 7",
q:"Qu'est-ce que la matrice pouvoir/intérêt des parties prenantes ?",
opts:["Un outil RH","Une grille classant les stakeholders par niveau de pouvoir et d'intérêt pour guider l'engagement","Le registre des risques","La matrice RACI"],correct:1,
expl:"Grille Power/Interest : Haute puissance + Haut intérêt = gérer de près. Faible puissance + Faible intérêt = surveiller. Guide la stratégie d'engagement."},
{id:60,lot:4,level:"facile",domain:"Processus",pmbok:"Agile",
q:"Qu'est-ce que le Sprint Planning ?",
opts:["Une rétrospective","Un événement où l'équipe décide ce qu'elle va livrer et comment dans le prochain Sprint","La revue de fin de Sprint","Le daily standup"],correct:1,
expl:"Le Sprint Planning (time-boxé à 8h max pour Sprint de 1 mois) définit l'objectif du Sprint, sélectionne les items du backlog et planifie le travail."},

// ════════════════════════════════════════════════════
// LOT 5 — FACILE (15 questions)
// ════════════════════════════════════════════════════
{id:61,lot:5,level:"facile",domain:"Processus",pmbok:"PMBOK 7",
q:"Qu'est-ce que le diagramme de Gantt ?",
opts:["Un outil de gestion des risques","Une représentation visuelle des tâches sur un axe temporel","Un outil de budgétisation","Un organigramme d'équipe"],correct:1,
expl:"Le Gantt visualise les tâches, leur durée et leurs dates sur un calendrier. Il permet de suivre l'avancement et identifier les dépendances."},
{id:62,lot:5,level:"facile",domain:"Personnes",pmbok:"PMBOK 7",
q:"Qu'est-ce que l'intelligence émotionnelle (EQ) selon Goleman ?",
opts:["Le QI du chef de projet","La capacité à reconnaître et gérer ses propres émotions et celles des autres","La compétence technique","La capacité à négocier"],correct:1,
expl:"L'EQ inclut : conscience de soi, maîtrise de soi, motivation, empathie et compétences sociales. PMI considère l'EQ essentielle pour le leadership."},
{id:63,lot:5,level:"facile",domain:"Processus",pmbok:"PMBOK 7",
q:"Qu'est-ce que la technique d'estimation à 3 points (PERT) ?",
opts:["Estimer avec 3 experts différents","Moyenne pondérée de l'optimiste (O), probable (M) et pessimiste (P) : (O+4M+P)/6","3 rounds d'estimation","3 niveaux de WBS"],correct:1,
expl:"PERT = (O + 4M + P) / 6. Donne une estimation plus réaliste en tenant compte des incertitudes. L'écart type = (P-O)/6."},
{id:64,lot:5,level:"facile",domain:"Environnement",pmbok:"PMBOK 7",
q:"Qu'est-ce que l'ETC (Estimate to Complete) ?",
opts:["Le coût total estimé","Le coût estimé pour terminer le travail restant","Le coût réel à ce jour","La variance de coût"],correct:1,
expl:"ETC = EAC - AC. C'est le coût estimé pour terminer ce qui reste. ETC = (BAC - EV) / CPI si on suppose la tendance actuelle continue."},
{id:65,lot:5,level:"facile",domain:"Processus",pmbok:"Agile",
q:"Qu'est-ce que le Kanban Board ?",
opts:["Un outil de budgétisation","Un tableau visuel montrant le flux de travail avec colonnes (To Do, In Progress, Done)","Un planning de Sprint","Un registre des risques"],correct:1,
expl:"Le Kanban Board visualise le flux de travail. Les limites WIP (Work In Progress) évitent la surcharge. Il favorise le flux continu."},
{id:66,lot:5,level:"facile",domain:"Personnes",pmbok:"PMBOK 7",
q:"Qu'est-ce que la négociation distributive ?",
opts:["Une négociation gagnant-gagnant","Une négociation où les gains d'une partie sont les pertes de l'autre (ressources fixes)","Une négociation par médiation","Une négociation d'équipe"],correct:1,
expl:"Négociation distributive = somme nulle (fixed pie). Ex: négociation de prix. Différent de la négociation intégrative (win-win) qui crée de la valeur."},
{id:67,lot:5,level:"facile",domain:"Processus",pmbok:"PMBOK 7",
q:"Qu'est-ce que la loi de Brooks en gestion de projet ?",
opts:["Plus on ajoute de membres, plus le projet va vite","Ajouter des ressources humaines à un projet en retard l'accentue davantage","Les projets IT coûtent toujours 2x plus que prévu","Les délais doublent quand l'équipe double"],correct:1,
expl:"'Adding manpower to a late software project makes it later' (F.Brooks). Raisons : courbe d'apprentissage, coordination, communication complexifiée."},
{id:68,lot:5,level:"facile",domain:"Environnement",pmbok:"PMBOK 7",
q:"Qu'est-ce que la variance à l'achèvement (VAC) ?",
opts:["EV - PV","BAC - EAC","AC - EV","EAC - BAC"],correct:1,
expl:"VAC = BAC - EAC. VAC négatif = dépassement prévu. VAC positif = économie prévue. Ex: BAC=500k, EAC=600k → VAC=-100k."},
{id:69,lot:5,level:"facile",domain:"Personnes",pmbok:"Agile",
q:"Qu'est-ce qu'un Product Owner dans Scrum ?",
opts:["Le chef de projet traditionnel","La personne responsable de maximiser la valeur du produit en gérant le Product Backlog","Le développeur senior","Le représentant du client"],correct:1,
expl:"Le Product Owner (PO) représente les intérêts des stakeholders, priorise le backlog et accepte les livrables. Il est responsable du ROI du produit."},
{id:70,lot:5,level:"facile",domain:"Processus",pmbok:"PMBOK 7",
q:"Qu'est-ce que la technique des 5 Pourquoi (5 Whys) ?",
opts:["Une technique d'estimation","Une analyse causale pour identifier la cause racine d'un problème","Une méthode de priorisation","Une technique de négociation"],correct:1,
expl:"Les 5 Whys posent 'pourquoi ?' de façon itérative pour remonter à la cause racine. Évite de traiter les symptômes plutôt que les causes."},
{id:71,lot:5,level:"facile",domain:"Processus",pmbok:"PMBOK 7",
q:"Qu'est-ce que le registre des problèmes (Issue Log) ?",
opts:["Le registre des risques","Un document qui enregistre les problèmes survenus, leur statut et les actions correctives","La liste des changements","Le planning du projet"],correct:1,
expl:"L'Issue Log documente les problèmes actuels (vs risques = futurs), leur priorité, responsable de résolution et statut de traitement."},
{id:72,lot:5,level:"facile",domain:"Environnement",pmbok:"PMBOK 7",
q:"Qu'est-ce que le TCPI (To-Complete Performance Index) ?",
opts:["L'efficacité actuelle des coûts","L'efficacité requise sur le travail restant pour atteindre l'objectif budgétaire","Le total des coûts du projet","L'index de satisfaction"],correct:1,
expl:"TCPI = (BAC-EV)/(BAC-AC). >1 = doit être plus efficace. <1 = peut se permettre moins d'efficacité. Indique la 'difficulté' à terminer dans le budget."},
{id:73,lot:5,level:"facile",domain:"Personnes",pmbok:"PMBOK 7",
q:"Qu'est-ce que la technique de Nominal Group ?",
opts:["Un vote à main levée","Chaque participant écrit ses idées individuellement puis on vote pour prioriser — réduit le biais de groupe","Une discussion de groupe","Un sondage anonyme"],correct:1,
expl:"Le Nominal Group évite l'influence des leaders d'opinion. Chaque participant génère des idées seul puis l'équipe vote pour les prioriser ensemble."},
{id:74,lot:5,level:"facile",domain:"Processus",pmbok:"PMBOK 7",
q:"Qu'est-ce que la structure de gouvernance de projet ?",
opts:["L'organigramme RH","Le cadre définissant les décisions, l'autorité, la responsabilité et la surveillance du projet","Le plan de communication","Le registre des risques"],correct:1,
expl:"La gouvernance définit qui décide quoi, comment les décisions sont prises, qui surveille et comment les problèmes sont escaladés."},
{id:75,lot:5,level:"facile",domain:"Processus",pmbok:"Agile",
q:"Qu'est-ce que l'Extreme Programming (XP) ?",
opts:["Un jeu de programmation","Une méthode Agile avec des pratiques techniques comme TDD, pair programming, intégration continue","Un framework de management","Une variante de Scrum"],correct:1,
expl:"XP est une méthode Agile centrée sur la qualité technique : TDD, pair programming, intégration continue, refactoring. Complémentaire à Scrum."},

// ════════════════════════════════════════════════════
// LOT 6 — DIFFICILE (15 questions)
// ════════════════════════════════════════════════════
{id:76,lot:6,level:"difficile",domain:"Environnement",pmbok:"PMBOK 7",
q:"Votre projet a BAC=500k€, EV=300k€, AC=380k€. Quel est l'EAC via EAC=BAC/CPI ?",
opts:["450k€","500k€","633k€","580k€"],correct:2,
expl:"CPI=EV/AC=300/380=0.789. EAC=BAC/CPI=500/0.789≈633k€. Dépassement prévu de 133k€ si la tendance continue."},
{id:77,lot:6,level:"difficile",domain:"Processus",pmbok:"PMBOK 7",
q:"Un changement urgent est demandé. Le sponsor demande de bypasser le CCB. Que faites-vous ?",
opts:["Implémenter immédiatement","Refuser catégoriquement","Implémenter mais documenter la décision et les impacts","Arrêter le projet"],correct:2,
expl:"En urgence, documenter l'approbation du sponsor, évaluer les impacts et notifier les parties prenantes. Bypasser complètement le processus crée des risques."},
{id:78,lot:6,level:"difficile",domain:"Personnes",pmbok:"PMBOK 7",
q:"Vous découvrez qu'un fournisseur a soudoyé un membre de votre équipe. Première action ?",
opts:["Ignorer si le contrat est signé","Licencier immédiatement","Rapporter aux autorités selon les politiques et les lois applicables","Renégocier le contrat"],correct:2,
expl:"Le code d'éthique PMI exige de signaler la corruption aux autorités compétentes. Honnêteté et responsabilité sont non négociables."},
{id:79,lot:6,level:"difficile",domain:"Processus",pmbok:"Agile",
q:"Dans SAFe, qu'est-ce qu'un PI Planning ?",
opts:["Un sprint de 2 semaines","Un événement trimestriel alignant plusieurs équipes Agile sur des objectifs communs","Une réunion quotidienne","Un outil de tracking"],correct:1,
expl:"Le PI Planning est un événement de 2 jours dans SAFe qui aligne toutes les équipes d'un ART sur des objectifs communs pour 8-12 semaines."},
{id:80,lot:6,level:"difficile",domain:"Processus",pmbok:"PMBOK 7",
q:"Quelle est la différence entre Fast Tracking et Crashing ?",
opts:["Ce sont des synonymes","Fast Tracking parallélise des tâches séquentielles (+risque), Crashing ajoute des ressources (+coût)","Fast Tracking réduit les coûts","Les deux augmentent la qualité"],correct:1,
expl:"Fast Tracking : paralléliser = risque accru. Crashing : ajouter ressources = coût accru. Les deux réduisent la durée avec des compromis différents."},
{id:81,lot:6,level:"difficile",domain:"Personnes",pmbok:"PMBOK 7",
q:"Selon Tuckman, dans quelle phase l'équipe est-elle la plus productive ?",
opts:["Forming","Storming","Norming","Performing"],correct:3,
expl:"Performing = l'équipe fonctionne de manière autonome et efficace. C'est la phase maximale de productivité selon le modèle de Tuckman."},
{id:82,lot:6,level:"difficile",domain:"Processus",pmbok:"PMBOK 7",
q:"Quel est le TCPI si BAC=400k€, EV=200k€, AC=180k€ pour finir dans le budget ?",
opts:["1.0","0.91","1.11","0.95"],correct:1,
expl:"TCPI=(BAC-EV)/(BAC-AC)=(400-200)/(400-180)=200/220=0.91. <1 signifie qu'on peut se permettre moins d'efficacité que prévu pour terminer dans le budget."},
{id:83,lot:6,level:"difficile",domain:"Environnement",pmbok:"PMBOK 7",
q:"Quelle stratégie de réponse aux risques consiste à transférer l'impact à un tiers ?",
opts:["Éviter","Accepter","Transférer","Atténuer"],correct:2,
expl:"Le transfert déplace la responsabilité à un tiers (assurance, clause contractuelle). Le risque existe toujours mais l'impact financier est partagé."},
{id:84,lot:6,level:"difficile",domain:"Processus",pmbok:"PMBOK 7",
q:"Dans PMBOK 7, combien de domaines de performance du projet existe-t-il ?",
opts:["5","6","8","10"],correct:2,
expl:"PMBOK 7 définit 8 domaines de performance : Stakeholders, Team, Development Approach, Planning, Project Work, Delivery, Measurement, Uncertainty."},
{id:85,lot:6,level:"difficile",domain:"Personnes",pmbok:"PMBOK 7",
q:"Selon la théorie des besoins de McClelland, un manager qui aime convaincre les autres est motivé par ?",
opts:["Besoin d'accomplissement","Besoin de pouvoir","Besoin d'affiliation","Besoin de sécurité"],correct:1,
expl:"McClelland : accomplissement (atteindre objectifs), pouvoir (influencer), affiliation (relations). Aimer convaincre = besoin de pouvoir."},
{id:86,lot:6,level:"difficile",domain:"Processus",pmbok:"Agile",
q:"Quelle est la principale différence entre Scrum et Kanban ?",
opts:["Scrum n'a pas de backlog","Scrum : Sprints time-boxés, Kanban : flux continu sans itérations fixes","Kanban est plus rapide","Scrum est pour les petites équipes"],correct:1,
expl:"Scrum : itérations fixes, rôles définis, cérémonies. Kanban : flux continu, limite WIP, pas de rôles imposés. Kanban adapté aux flux de maintenance/support."},
{id:87,lot:6,level:"difficile",domain:"Environnement",pmbok:"PMBOK 7",
q:"Qu'est-ce que la simulation Monte Carlo en gestion de projet ?",
opts:["Un jeu de rôle","Une simulation statistique générant de nombreux scénarios pour estimer les probabilités d'atteindre les objectifs","Un outil Agile","Une technique d'analyse des stakeholders"],correct:1,
expl:"Monte Carlo exécute des milliers de simulations avec valeurs aléatoires dans les fourchettes d'estimation. Produit une distribution de probabilité des résultats."},
{id:88,lot:6,level:"difficile",domain:"Processus",pmbok:"PMBOK 7",
q:"Qu'est-ce que la technique Delphi ?",
opts:["Une estimation par analogie","Consensus d'experts de manière anonyme et itérative","Un vote à main levée","Une estimation paramétrique"],correct:1,
expl:"Delphi utilise des questionnaires itératifs auprès d'experts anonymes pour atteindre un consensus. L'anonymat évite les biais de groupe."},
{id:89,lot:6,level:"difficile",domain:"Personnes",pmbok:"PMBOK 7",
q:"Un stakeholder oppose fortement le projet. Quelle est la meilleure stratégie ?",
opts:["L'ignorer","L'engager activement pour comprendre ses préoccupations et trouver des solutions","Escalader au management","Changer le scope pour l'éviter"],correct:1,
expl:"L'engagement proactif des stakeholders opposés est essentiel. Comprendre leurs préoccupations permet souvent de les transformer en alliés."},
{id:90,lot:6,level:"difficile",domain:"Processus",pmbok:"PMBOK 7",
q:"Qu'est-ce que la matrice probabilité-impact ?",
opts:["Un outil pour calculer le CPI","Un outil classant les risques selon leur probabilité et impact sur les objectifs","Un tableau de bord","Une technique d'estimation des coûts"],correct:1,
expl:"La matrice probabilité-impact aide à prioriser les risques. Haute probabilité ET fort impact = priorité maximale. Guide les efforts de réponse aux risques."},

// ════════════════════════════════════════════════════
// LOT 7 — DIFFICILE (15 questions)
// ════════════════════════════════════════════════════
{id:91,lot:7,level:"difficile",domain:"Processus",pmbok:"PMBOK 7",
q:"Qu'est-ce que la théorie des contraintes (TOC) appliquée à un projet ?",
opts:["Gérer les contraintes légales","Identifier et optimiser le goulet d'étranglement qui limite le débit global du système","Réduire le scope","Ajouter des ressources partout"],correct:1,
expl:"La TOC identifie la contrainte principale (bottleneck). En projet : une ressource sur-allouée, une décision en attente. Optimiser le goulet maximise la performance."},
{id:92,lot:7,level:"difficile",domain:"Personnes",pmbok:"PMBOK 7",
q:"Selon la grille de Blake et Mouton, quel style correspond à (9,9) ?",
opts:["Autocratique","Laisser-faire","Club social","Management en équipe (Team Management)"],correct:3,
expl:"Blake-Mouton (9,9) = fort intérêt pour personnes ET production. Style idéal selon les auteurs, créant engagement et haute performance."},
{id:93,lot:7,level:"difficile",domain:"Processus",pmbok:"PMBOK 7",
q:"Quelle approche pour un projet avec exigences changeantes et haute valeur business ?",
opts:["Prédictive (Waterfall)","Agile (itératif)","Séquentielle","Aucune approche adaptée"],correct:1,
expl:"Agile est optimal pour exigences évolutives et valeur business à livrer rapidement. Prédictive convient mieux aux projets stables et bien définis."},
{id:94,lot:7,level:"difficile",domain:"Environnement",pmbok:"PMBOK 7",
q:"Votre projet a SPI=0.8 et CPI=1.1. Quelle est la situation ?",
opts:["En retard et au-dessus du budget","En retard mais sous le budget","En avance et sous le budget","En avance mais au-dessus du budget"],correct:1,
expl:"SPI=0.8 < 1 : en retard (20%). CPI=1.1 > 1 : sous budget (10% d'économie). L'équipe est efficace en coûts mais lente. Analyser les causes du retard."},
{id:95,lot:7,level:"difficile",domain:"Processus",pmbok:"Agile",
q:"Qu'est-ce que la vélocité en Agile et comment l'utiliser pour planifier ?",
opts:["Nombre de membres de l'équipe","SP livrés par Sprint — diviser le backlog par la vélocité moyenne pour estimer le nombre de Sprints","Vitesse de déploiement","Satisfaction de l'équipe en points"],correct:1,
expl:"Vélocité = SP/Sprint. Backlog total ÷ vélocité = nombre de Sprints. Elle s'améliore et se stabilise avec l'expérience. N'utilisez pas la vélocité d'autres équipes."},
{id:96,lot:7,level:"difficile",domain:"Personnes",pmbok:"PMBOK 7",
q:"Dans une organisation matricielle forte, qui a plus d'autorité sur les ressources ?",
opts:["Le manager fonctionnel","Le chef de projet","Le sponsor","Le client"],correct:1,
expl:"Dans une matrice forte, le chef de projet a plus d'autorité que dans une matrice faible. Dans une matrice équilibrée, l'autorité est partagée."},
{id:97,lot:7,level:"difficile",domain:"Processus",pmbok:"PMBOK 7",
q:"Qu'est-ce que la décomposition des risques (Risk Breakdown Structure - RBS) ?",
opts:["Le WBS des risques","Une hiérarchie des sources de risques organisées par catégories pour faciliter l'identification","La matrice des risques","La liste des risques priorisés"],correct:1,
expl:"Le RBS structure les risques par catégories (technique, externe, organisationnel, gestion de projet). Aide à une identification exhaustive et systématique."},
{id:98,lot:7,level:"difficile",domain:"Environnement",pmbok:"PMBOK 7",
q:"Qu'est-ce que la valeur monétaire attendue (EMV) d'un risque ?",
opts:["Le coût total du projet","Probabilité × Impact. Positive pour opportunités, négative pour menaces","Le budget de contingence","La réserve de management"],correct:1,
expl:"EMV = Probabilité × Impact. Ex: 30% de chance de perdre 100k€ → EMV = -30k€. Utilisé dans l'arbre de décision et pour calculer la réserve pour aléas."},
{id:99,lot:7,level:"difficile",domain:"Processus",pmbok:"PMBOK 7",
q:"Dans PMBOK 7, quel principe stipule que le CP doit 'navigate complexity' ?",
opts:["Stewardship","Navigate Complexity","Stakeholder Engagement","Adaptability"],correct:1,
expl:"PMBOK 7 inclut le principe 'Navigate Complexity'. La complexité émerge des comportements humains, interactions systémiques et ambiguïté. Le CP doit l'anticiper."},
{id:100,lot:7,level:"difficile",domain:"Personnes",pmbok:"Agile",
q:"Dans SAFe, qu'est-ce que l'Agile Release Train (ART) ?",
opts:["Un outil de planification","Une équipe virtuelle d'équipes Agile qui planifie, engage et livre ensemble","Un sprint de 6 mois","Un outil de monitoring"],correct:1,
expl:"L'ART est une équipe virtuelle de 50-125 personnes organisée en plusieurs équipes Agile qui s'alignent via le PI Planning pour livrer de la valeur ensemble."},
{id:101,lot:7,level:"difficile",domain:"Processus",pmbok:"PMBOK 7",
q:"Quelle est la différence entre une contrainte et une hypothèse ?",
opts:["Synonymes","Hypothèse : facteur supposé vrai sans preuve. Contrainte : limitation imposée non modifiable","Contrainte = risque","Hypothèse = facteur certain"],correct:1,
expl:"Hypothèse = facteur supposé vrai pour la planification (peut se révéler faux = risque). Contrainte = limitation réelle imposée (budget fixe, date imposée)."},
{id:102,lot:7,level:"difficile",domain:"Environnement",pmbok:"PMBOK 7",
q:"Qu'est-ce que la courbe S (S-Curve) en EVM ?",
opts:["Un outil de qualité","La représentation graphique de la valeur planifiée (PV), acquise (EV) et coût réel (AC) dans le temps","Un diagramme de réseau","Un outil de communication"],correct:1,
expl:"La courbe S visualise l'avancement EVM. La forme en S vient du démarrage lent, de l'accélération en milieu de projet et du ralentissement en fin."},
{id:103,lot:7,level:"difficile",domain:"Personnes",pmbok:"PMBOK 7",
q:"Qu'est-ce que la technique de communication par 'messagerie active' (active listening) ?",
opts:["Envoyer beaucoup de messages","Écouter pleinement, clarifier, synthétiser et confirmer la compréhension du message reçu","Utiliser des outils de messagerie instantanée","Prendre des notes pendant les réunions"],correct:1,
expl:"L'écoute active = écoute complète, questions clarificatrices, reformulation et confirmation. Réduit les malentendus et renforce la confiance."},
{id:104,lot:7,level:"difficile",domain:"Processus",pmbok:"Agile",
q:"Qu'est-ce que le 'Minimum Viable Product' (MVP) ?",
opts:["Le produit le moins cher","La version minimale d'un produit permettant de valider des hypothèses avec le minimum d'effort","Le prototype initial","Le premier sprint livré"],correct:1,
expl:"MVP (Lean Startup/Agile) = version minimale qui permet d'apprendre du marché avec le moins d'effort. Tester l'hypothèse centrale avant d'investir massivement."},
{id:105,lot:7,level:"difficile",domain:"Processus",pmbok:"PMBOK 7",
q:"Quelle est la différence entre QA (Quality Assurance) et QC (Quality Control) ?",
opts:["Synonymes","QA : processus proactifs pour prévenir les défauts. QC : inspection réactive pour trouver les défauts","QC est plus important","QA concerne uniquement les tests"],correct:1,
expl:"QA = amélioration des processus pour prévenir les défauts (proactif). QC = inspection des livrables pour identifier les défauts (réactif). Les deux sont nécessaires."},

// ════════════════════════════════════════════════════
// LOT 8 — DIFFICILE (15 questions)
// ════════════════════════════════════════════════════
{id:106,lot:8,level:"difficile",domain:"Processus",pmbok:"PMBOK 7",
q:"Un membre est régulièrement en retard malgré plusieurs conversations. Prochaine étape PMI ?",
opts:["Licencier immédiatement","Réunion d'équipe pour le montrer du doigt","Escalader au management RH avec documentation","Ignorer et redistribuer le travail"],correct:2,
expl:"PMI : approche progressive — conversation directe → plan d'amélioration → escalade RH documentée. La documentation est essentielle pour protéger toutes les parties."},
{id:107,lot:8,level:"difficile",domain:"Environnement",pmbok:"PMBOK 7",
q:"Différence entre réserve pour aléas et réserve de management ?",
opts:["Aucune différence","Aléas couvre les risques identifiés (known unknowns), Management couvre les risques non identifiés (unknown unknowns)","Aléas est toujours plus grande","Management gérée par le CP"],correct:1,
expl:"Réserve pour aléas = known unknowns, dans la baseline, gérée par le CP. Réserve de management = unknown unknowns, hors baseline, gérée par le management."},
{id:108,lot:8,level:"difficile",domain:"Processus",pmbok:"PMBOK 7",
q:"Quand faut-il escalader un problème au sponsor AVANT d'avoir une solution ?",
opts:["Jamais","Quand l'impact dépasse l'autorité/budget du CP ou quand le sponsor est directement impacté","Uniquement pour problèmes techniques","Uniquement en fin de projet"],correct:1,
expl:"Escalader sans solution quand : impact dépasse votre autorité, le sponsor est affecté, ou attendre causerait plus de dommages. Prévenir est une responsabilité."},
{id:109,lot:8,level:"difficile",domain:"Personnes",pmbok:"Agile",
q:"Dans un projet hybride, quand utiliser une approche prédictive pour certains composants ?",
opts:["Jamais","Quand les exigences sont stables, réglementation l'impose, ou risques techniques faibles","Uniquement pour construction","Quand l'équipe n'est pas formée à l'Agile"],correct:1,
expl:"L'approche hybride combine prédictive (stable, compliance) et agile (évolutif, haute valeur). PMBOK 7 encourage de choisir selon le contexte spécifique."},
{id:110,lot:8,level:"difficile",domain:"Processus",pmbok:"PMBOK 7",
q:"Qu'est-ce que le diagramme d'Ishikawa (ou en arête de poisson) ?",
opts:["Un diagramme de réseau","Un outil d'analyse causale identifiant les causes potentielles d'un problème (5M)","Un diagramme de Gantt","Un outil de communication"],correct:1,
expl:"L'Ishikawa (5M : Méthode, Machine, Matière, Main-d'œuvre, Milieu) organise les causes potentielles d'un effet indésirable. Outil de qualité et d'analyse de risques."},
{id:111,lot:8,level:"difficile",domain:"Environnement",pmbok:"PMBOK 7",
q:"Si BAC=600k€ et CPI=0.75, quelle est l'EAC ?",
opts:["600k€","800k€","450k€","750k€"],correct:1,
expl:"EAC=BAC/CPI=600/0.75=800k€. Le projet devrait coûter 800k€ au lieu de 600k€, soit un dépassement de 200k€ (33%)."},
{id:112,lot:8,level:"difficile",domain:"Personnes",pmbok:"PMBOK 7",
q:"Selon la théorie de l'Expectancy de Vroom, qu'est-ce qui motive les individus ?",
opts:["Le salaire uniquement","La conviction que l'effort mène à la performance, qui mène à une récompense valorisée","La sécurité de l'emploi","L'autorité hiérarchique"],correct:1,
expl:"Vroom : Motivation = Expectancy (effort→perf) × Instrumentality (perf→récompense) × Valence (valeur récompense). Les 3 facteurs doivent être forts."},
{id:113,lot:8,level:"difficile",domain:"Processus",pmbok:"PMBOK 7",
q:"Qu'est-ce que la gestion de la valeur acquise (EVM) ne peut pas mesurer ?",
opts:["L'efficacité des coûts","L'efficacité du planning","La qualité des livrables et satisfaction des parties prenantes","Le coût estimé pour terminer"],correct:2,
expl:"EVM mesure performance coût et délai mais pas la qualité, satisfaction client, risques ou valeur business réelle. Vue quantitative à compléter par d'autres mesures."},
{id:114,lot:8,level:"difficile",domain:"Processus",pmbok:"Agile",
q:"Qu'est-ce que le 'Technical Debt' en Agile ?",
opts:["Les dettes financières du projet","Le coût implicite des raccourcis techniques qui devront être corrigés ultérieurement","Les bugs non résolus","Le temps de formation technique"],correct:1,
expl:"La dette technique = compromis techniques rapides aujourd'hui qui créent du travail supplémentaire demain. Si non gérée, elle ralentit progressivement la vélocité."},
{id:115,lot:8,level:"difficile",domain:"Environnement",pmbok:"PMBOK 7",
q:"Qu'est-ce que le Tornado Diagram en analyse quantitative des risques ?",
opts:["Un outil météo","Un diagramme à barres horizontales classant les variables par ordre d'impact décroissant sur l'objectif","Un outil Agile","Un registre des risques visuel"],correct:1,
expl:"Le Tornado Diagram classe les variables de risque par impact décroissant. La barre la plus longue = variable la plus critique. Guide la priorité de gestion."},
{id:116,lot:8,level:"difficile",domain:"Processus",pmbok:"PMBOK 7",
q:"Qu'est-ce que la méthode Earned Schedule (ES) apporte par rapport au SPI classique ?",
opts:["Elle mesure les coûts","Elle exprime le retard/avance en unités de temps (semaines/mois) plutôt qu'en monnaie, plus intuitive en fin de projet","Elle remplace l'EVM","Elle concerne uniquement les projets Agile"],correct:1,
expl:"L'Earned Schedule convertit le SPI en unités de temps réelles. En fin de projet, SPI(coût) converge vers 1 même si le projet est en retard. ES est plus fiable."},
{id:117,lot:8,level:"difficile",domain:"Personnes",pmbok:"PMBOK 7",
q:"Qu'est-ce que le modèle ADKAR de gestion du changement ?",
opts:["Un framework Agile","Awareness, Desire, Knowledge, Ability, Reinforcement — 5 étapes pour une adoption réussie du changement","Un outil de communication","Un processus de clôture de projet"],correct:1,
expl:"ADKAR (Prosci) : A=Awareness (conscientisation), D=Desire (désir), K=Knowledge (savoir), A=Ability (capacité), R=Reinforcement (ancrage). Guide les interventions de changement."},
{id:118,lot:8,level:"difficile",domain:"Processus",pmbok:"PMBOK 7",
q:"Dans une organisation projet pure (projectized), qui gère les ressources ?",
opts:["Le manager fonctionnel","Le chef de projet — il a le contrôle total des ressources dédiées au projet","Le sponsor","La direction RH exclusivement"],correct:1,
expl:"Dans une structure projectisée, les ressources sont dédiées au projet et sous l'autorité du CP. Les membres n'ont pas de 'maison' fonctionnelle permanente."},
{id:119,lot:8,level:"difficile",domain:"Processus",pmbok:"PMBOK 7",
q:"Qu'est-ce que la technique PDCA (Plan-Do-Check-Act) en qualité ?",
opts:["Un outil de planification agile","Le cycle de Deming pour l'amélioration continue : planifier, exécuter, vérifier et agir","Un processus de gestion des risques","Un framework de communication"],correct:1,
expl:"PDCA (Deming) : Plan (identifier le problème et planifier), Do (tester la solution), Check (vérifier les résultats), Act (standardiser ou recommencer). Cycle d'amélioration continue."},
{id:120,lot:8,level:"difficile",domain:"Environnement",pmbok:"PMBOK 7",
q:"Qu'est-ce que l'analyse de la valeur (Value Engineering) ?",
opts:["L'évaluation financière du projet","Une technique systématique pour améliorer la valeur en optimisant le rapport fonction/coût","L'estimation de la valeur acquise","L'analyse du ROI"],correct:1,
expl:"Value Engineering analyse les fonctions d'un produit pour atteindre les performances requises au moindre coût total. Maximise le rapport valeur/coût."},

// ════════════════════════════════════════════════════
// LOT 9 — DIFFICILE (15 questions)
// ════════════════════════════════════════════════════
{id:121,lot:9,level:"difficile",domain:"Processus",pmbok:"PMBOK 7",
q:"Qu'est-ce que le chemin critique (Critical Path) ?",
opts:["Le chemin le plus court","La séquence de tâches la plus longue déterminant la durée minimale du projet","Les tâches les plus risquées","Les tâches du chef de projet"],correct:1,
expl:"Le chemin critique détermine la durée la plus courte possible du projet. La marge (float) est zéro. Tout retard retarde le projet entier."},
{id:122,lot:9,level:"difficile",domain:"Personnes",pmbok:"PMBOK 7",
q:"Selon la théorie de l'attribution, quand les managers attribuent les succès à la chance et les échecs à l'incompétence de l'équipe, cela s'appelle ?",
opts:["Leadership transformationnel","Biais fondamental d'attribution — attributer les résultats externes à des causes internes","Management par objectifs","Leadership situationnel"],correct:1,
expl:"Le biais d'attribution fondamental = tendance à sur-attribuer les comportements à des dispositions internes (compétence) plutôt qu'au contexte. Impacte l'équité managériale."},
{id:123,lot:9,level:"difficile",domain:"Environnement",pmbok:"PMBOK 7",
q:"Votre projet a SPI=0.8 et CPI=1.1. Quelle action prioritaire ?",
opts:["Augmenter le budget","Analyser les causes du retard et envisager du Fast Tracking ou Crashing sur le chemin critique","Réduire le scope","Changer l'équipe"],correct:1,
expl:"CPI>1 = pas de problème budget. SPI<1 = retard planning. Actions : Fast Tracking (paralléliser), Crashing (ajouter ressources sur chemin critique), ou réduire scope."},
{id:124,lot:9,level:"difficile",domain:"Processus",pmbok:"PMBOK 7",
q:"Qu'est-ce que le Benefits Realization Management dans PMBOK 7 ?",
opts:["La gestion du budget","Le processus d'identification, définition, planification et réalisation des bénéfices business du projet","La gestion des bénéfices sociaux","Le calcul EVM"],correct:1,
expl:"PMBOK 7 : le CP doit s'assurer que les livrables génèrent réellement la valeur business attendue, même après la clôture. La valeur > les livrables techniques."},
{id:125,lot:9,level:"difficile",domain:"Processus",pmbok:"Agile",
q:"Dans SAFe, qu'est-ce que le System Demo ?",
opts:["Démo à clients potentiels","Événement end-of-PI présentant l'incrément intégré et testé de tout le PI par toutes les équipes","Démo de l'architecture","Revue de sprint individuelle"],correct:1,
expl:"Le System Demo (fin de PI SAFe) présente l'incrément intégré de toutes les équipes de l'ART. Stakeholders voient la valeur agrégée et donnent du feedback."},
{id:126,lot:9,level:"difficile",domain:"Personnes",pmbok:"PMBOK 7",
q:"Un CP doit influencer un directeur hors hiérarchie. Approche PMI la plus efficace ?",
opts:["Contourner ce directeur","Utiliser le pouvoir de référence en construisant des relations et démontrant sa valeur","Menacer d'escalader","Ignorer ce directeur"],correct:1,
expl:"PMI valorise le pouvoir de référence (expertise, charisme, réseau) vs positionnel (hiérarchie). Construire des relations de confiance est l'approche la plus durable."},
{id:127,lot:9,level:"difficile",domain:"Processus",pmbok:"PMBOK 7",
q:"Qu'est-ce que l'analyse des parties prenantes par grille Pouvoir/Intérêt pour un stakeholder haute puissance, faible intérêt ?",
opts:["Gérer de près","Surveiller","Tenir informé","Satisfaire (Keep Satisfied)"],correct:3,
expl:"Pouvoir/Intérêt : Haute puissance + faible intérêt = Keep Satisfied. Ils peuvent impacter le projet s'ils s'impliquent. Satisfaire sans surcharger d'informations."},
{id:128,lot:9,level:"difficile",domain:"Environnement",pmbok:"PMBOK 7",
q:"Qu'est-ce que la VAN (Valeur Actuelle Nette / NPV) ?",
opts:["Le profit brut du projet","La valeur actuelle des flux futurs moins l'investissement initial. VAN > 0 = projet rentable","Le temps de ROI","Le budget maximum"],correct:1,
expl:"NPV = Σ(CF/(1+r)^t) - Investissement. NPV > 0 : valeur créée. Prend en compte la valeur temps de l'argent. Utilisée pour comparer et justifier des investissements."},
{id:129,lot:9,level:"difficile",domain:"Processus",pmbok:"PMBOK 7",
q:"Qu'est-ce que la méthode de la chaîne critique (CCPM) de Goldratt ?",
opts:["Une variante du CPM","Une méthode de planification basée sur la théorie des contraintes, utilisant des buffers plutôt que des marges individuelles","Une méthode agile","Un outil EVM"],correct:1,
expl:"CCPM (Goldratt) : identifie la chaîne critique (chemin + contraintes de ressources), supprime les marges individuelles et les consolide en buffers de projet/alimentation."},
{id:130,lot:9,level:"difficile",domain:"Personnes",pmbok:"Agile",
q:"Qu'est-ce que le 'Management 3.0' de Jurgen Appelo ?",
opts:["Un framework de management traditionnel","Une approche Agile du management : énergiser les personnes, donner du pouvoir aux équipes, aligner les contraintes","Un outil de Scrum","Un framework de gouvernance"],correct:1,
expl:"Management 3.0 traite l'organisation comme un système complexe adaptatif. Focus sur : motiver les personnes, déléguer aux équipes, aligner sur la vision, améliorer en continu."},
{id:131,lot:9,level:"difficile",domain:"Processus",pmbok:"PMBOK 7",
q:"Qu'est-ce que la loi d'Amdahl en gestion de performance de projet ?",
opts:["Plus de ressources = plus de vitesse indéfiniment","L'accélération d'une tâche par l'ajout de ressources est limitée par la portion séquentielle non parallélisable","Les coûts doublent avec l'équipe","Les projets finissent toujours en retard"],correct:1,
expl:"La loi d'Amdahl montre que le gain de performance par parallélisation est limité par la partie séquentielle incompressible. Justifie la prudence dans l'ajout de ressources."},
{id:132,lot:9,level:"difficile",domain:"Environnement",pmbok:"PMBOK 7",
q:"Dans l'analyse de la marge (Float/Slack), qu'est-ce que la 'free float' ?",
opts:["Temps total disponible sans retarder la fin du projet","Temps disponible pour retarder une activité sans retarder le démarrage le plus tôt de l'activité suivante","Le budget libre","La réserve de management"],correct:1,
expl:"Free Float = temps disponible sans impacter le successeur le plus proche. Total Float = temps disponible sans impacter la fin du projet. Free Float ≤ Total Float."},
{id:133,lot:9,level:"difficile",domain:"Personnes",pmbok:"PMBOK 7",
q:"Quelle est la différence entre leadership transactionnel et transformationnel ?",
opts:["Synonymes","Transactionnel : échange récompense/effort. Transformationnel : inspire, motive au-delà des intérêts personnels, crée une vision","Transactionnel est plus efficace","Transformationnel ignore les récompenses"],correct:1,
expl:"Transactionnel = motivation par échanges (bonus, punitions). Transformationnel = inspire une vision supérieure, développe les capacités, aligne sur les valeurs. PMI valorise les deux selon le contexte."},
{id:134,lot:9,level:"difficile",domain:"Processus",pmbok:"Agile",
q:"Qu'est-ce que le 'Continuous Delivery' dans DevOps/Agile ?",
opts:["Livrer une fois par an","La capacité à livrer des changements logiciels de manière fiable et à tout moment via une pipeline automatisée","Livrer uniquement quand le client le demande","Une pratique XP"],correct:1,
expl:"Continuous Delivery = chaque changement est automatiquement testé et prêt à être déployé en production. Réduit le risque de chaque déploiement et accélère le feedback."},
{id:135,lot:9,level:"difficile",domain:"Processus",pmbok:"PMBOK 7",
q:"Qu'est-ce que le 'Benefit-Cost Ratio' (BCR) ?",
opts:["EV/AC","Bénéfices attendus ÷ Coûts. BCR > 1 = projet justifié économiquement","Budget/Coûts réels","BAC/EAC"],correct:1,
expl:"BCR = Bénéfices/Coûts. BCR > 1 : les bénéfices dépassent les coûts. Ex: BCR = 2 signifie que pour 1€ investi, 2€ de valeur est générée. Outil de sélection de projets."},

// ════════════════════════════════════════════════════
// LOT 10 — DIFFICILE (15 questions)
// ════════════════════════════════════════════════════
{id:136,lot:10,level:"difficile",domain:"Processus",pmbok:"PMBOK 7",
q:"Qu'est-ce que la Disciplined Agile Delivery (DAD) apporte vs Scrum ?",
opts:["DAD est une version simplifiée de Scrum","DAD couvre le cycle de vie complet, intégrant Scrum, Kanban, Lean et autres selon le contexte","DAD remplace PMBOK","DAD est uniquement pour grandes entreprises"],correct:1,
expl:"DAD (PMI) est un framework de décision guidant le choix des pratiques selon le contexte. Contrairement à Scrum (prescriptif), DAD couvre tout le cycle de vie."},
{id:137,lot:10,level:"difficile",domain:"Personnes",pmbok:"PMBOK 7",
q:"Dans la gestion multiculturelle selon Hofstede, que mesure la 'distance hiérarchique' ?",
opts:["La distance géographique entre équipes","Le degré d'acceptation des inégalités de pouvoir dans une société","La différence de compétences","La hiérarchie organisationnelle"],correct:1,
expl:"Hofstede : Power Distance = acceptation des inégalités. Haute distance (certains pays asiatiques) : autorité respectée sans question. Faible distance (pays nordiques) : questionnement normal."},
{id:138,lot:10,level:"difficile",domain:"Environnement",pmbok:"PMBOK 7",
q:"Qu'est-ce que le 'Real Options' en gestion de projets d'investissement ?",
opts:["Des options d'achat boursières","Des choix flexibles sur des décisions futures (différer, abandonner, étendre) ayant une valeur économique réelle","Des options contractuelles","Des choix de ressources humaines"],correct:1,
expl:"Real Options applique la théorie des options financières aux projets : valeur de la flexibilité (attendre, agrandir, abandonner). Un projet peut avoir une VAN négative mais une valeur positive grâce à ses options."},
{id:139,lot:10,level:"difficile",domain:"Processus",pmbok:"Agile",
q:"Qu'est-ce que l'Event Storming en DDD Agile ?",
opts:["Une technique météo","Un atelier collaboratif modélisant les domaines métier en identifiant événements, commandes et agrégats","Une technique de gestion de crise","Un outil de Sprint Planning"],correct:1,
expl:"Event Storming (Brandolini) : atelier réunissant développeurs et experts métier pour modéliser les domaines. Aligne la compréhension métier/technique en DDD."},
{id:140,lot:10,level:"difficile",domain:"Personnes",pmbok:"PMBOK 7",
q:"Qu'est-ce que le 'Management by Walking Around' (MBWA) ?",
opts:["Éviter les réunions formelles","Se déplacer régulièrement sur le terrain pour observer, écouter et interagir informellement avec l'équipe","La gestion à distance","La gestion par objectifs"],correct:1,
expl:"MBWA (Peters & Waterman) = le manager se déplace sur le terrain. Bénéfices : détection précoce des problèmes, renforcement des relations, feedback direct, engagement accru."},
{id:141,lot:10,level:"difficile",domain:"Processus",pmbok:"PMBOK 7",
q:"Qu'est-ce que le 'Scope Verification' vs 'Scope Validation' ?",
opts:["Synonymes","Scope Verification = vérifier que le travail est correct (QC). Scope Validation = obtenir l'acceptation formelle des livrables par le client","Validation est technique","Vérification concerne le client"],correct:1,
expl:"Validate Scope = obtenir l'acceptation formelle du client (résultat: livrables acceptés). Control Scope = surveiller l'état du scope et gérer les changements. Deux processus distincts."},
{id:142,lot:10,level:"difficile",domain:"Environnement",pmbok:"PMBOK 7",
q:"Qu'est-ce que l'analyse de la sensibilité (Sensitivity Analysis) en gestion des risques ?",
opts:["Analyser la sensibilité de l'équipe au changement","Déterminer quel(s) risque(s) ont le plus grand impact potentiel sur les objectifs du projet","Mesurer la satisfaction des stakeholders","Analyser les variations de budget"],correct:1,
expl:"L'analyse de sensibilité examine comment la variation d'une variable de risque affecte l'objectif. Identifie les risques les plus influents (illustrée par le Tornado Diagram)."},
{id:143,lot:10,level:"difficile",domain:"Processus",pmbok:"PMBOK 7",
q:"Dans PMBOK 7, qu'est-ce que la 'tailoring' (adaptation) ?",
opts:["Un processus de couture","L'adaptation délibérée de l'approche, des processus et outils au contexte spécifique du projet","La réduction du scope","La personnalisation des livrables"],correct:1,
expl:"Tailoring = choisir délibérément les processus, méthodes et outils appropriés au contexte. PMBOK 7 insiste : il n'y a pas d'approche universelle, adapter est essentiel."},
{id:144,lot:10,level:"difficile",domain:"Personnes",pmbok:"Agile",
q:"Qu'est-ce que le 'Psychological Safety' et son importance dans les équipes Agile ?",
opts:["La sécurité physique du bureau","Un environnement où les membres se sentent en sécurité pour prendre des risques, exprimer des idées et admettre des erreurs","L'assurance maladie","La cybersécurité"],correct:1,
expl:"La sécurité psychologique (Google Project Aristotle) est le facteur #1 de performance des équipes. Elle permet l'innovation, l'apprentissage des erreurs et une communication ouverte."},
{id:145,lot:10,level:"difficile",domain:"Processus",pmbok:"PMBOK 7",
q:"Qu'est-ce que le 'Lessons Learned Register' et quand doit-il être mis à jour ?",
opts:["Un document final de clôture uniquement","Un registre mis à jour tout au long du projet (pas seulement en clôture) pour capitaliser sur les expériences positives et négatives","Le registre des risques","Le journal de bord du CP"],correct:1,
expl:"Les leçons apprises doivent être documentées TOUT AU LONG du projet, pas seulement en clôture. Elles alimentent la base de connaissances organisationnelle."},
{id:146,lot:10,level:"difficile",domain:"Processus",pmbok:"PMBOK 7",
q:"Qu'est-ce que la méthode des points de fonction (Function Points) en estimation ?",
opts:["Une estimation par analogie","Une technique mesurant la taille fonctionnelle d'un logiciel selon les fonctions qu'il réalise, indépendamment de la technologie","Une méthode agile","Un outil d'estimation budgétaire"],correct:1,
expl:"Les Function Points mesurent la taille du logiciel par ses fonctionnalités (entrées, sorties, requêtes, fichiers, interfaces). Indépendant du langage, utile pour les estimations initiales."},
{id:147,lot:10,level:"difficile",domain:"Environnement",pmbok:"PMBOK 7",
q:"Qu'est-ce que le TIR (Taux Interne de Rentabilité / IRR) ?",
opts:["Le taux d'inflation","Le taux d'actualisation qui rend la VAN égale à zéro — si IRR > taux de rendement requis, le projet est acceptable","Le taux de change","Le taux de dépassement budgétaire"],correct:1,
expl:"IRR = taux qui rend NPV = 0. Si IRR > coût du capital (WACC), le projet est rentable. Permet de comparer des projets de tailles différentes. Complémentaire à la NPV."},
{id:148,lot:10,level:"difficile",domain:"Personnes",pmbok:"PMBOK 7",
q:"Qu'est-ce que la gestion des conflits par 'accommodation' selon PMI ?",
opts:["Trouver une solution gagnant-gagnant","Mettre de côté ses propres intérêts pour satisfaire les besoins de l'autre partie (lose-win)","Imposer sa solution","Éviter le conflit"],correct:1,
expl:"Accommodation = se soumettre aux désirs de l'autre. Peut être approprié pour préserver une relation importante ou quand l'enjeu est faible pour vous. PMI la considère sous-optimale pour les conflits importants."},
{id:149,lot:10,level:"difficile",domain:"Processus",pmbok:"PMBOK 7",
q:"Qu'est-ce que la méthode Agile 'Shape Up' de Basecamp ?",
opts:["Une méthode de fitness pour développeurs","Un framework avec cycles de 6 semaines, mise en forme des projets (shaping) et paris sur l'appétit plutôt qu'estimations précises","Une variante de Scrum","Un framework SAFe"],correct:1,
expl:"Shape Up (Basecamp) : cycles fixes de 6 semaines, pas de backlog infini. Le shaping définit les projets en termes d'appétit (temps max acceptable) pas d'estimations. Équipes autonomes."},
{id:150,lot:10,level:"difficile",domain:"Environnement",pmbok:"PMBOK 7",
q:"Qu'est-ce que la méthode des scénarios (Scenario Planning) en gestion des risques ?",
opts:["Créer des histoires de projet","Développer des alternatives plausibles pour le futur (scénarios optimiste, probable, pessimiste) pour tester la robustesse de la stratégie","Planifier les contingences","Faire des jeux de rôle d'équipe"],correct:1,
expl:"Scenario Planning : identifier plusieurs futurs possibles et leurs implications. Teste la robustesse du plan de projet. Utile pour les environnements VUCA (volatils, incertains, complexes, ambigus)."},

// ════════════════════════════════════════════════════
// LOT 11 — TRÈS DIFFICILE (15 questions)
// ════════════════════════════════════════════════════
{id:151,lot:11,level:"tres-difficile",domain:"Environnement",pmbok:"PMBOK 7",
q:"Votre projet : EV=250k€, PV=300k€, AC=275k€, BAC=500k€. Calculez VAC avec EAC=AC+(BAC-EV)/CPI.",
opts:["-50k€","-45k€","-48k€","+50k€"],correct:0,
expl:"CPI=250/275=0.909. ETC=(BAC-EV)/CPI=250/0.909=275k€. EAC=AC+ETC=275+275=550k€. VAC=BAC-EAC=500-550=-50k€. Dépassement prévu de 50k€."},
{id:152,lot:11,level:"tres-difficile",domain:"Processus",pmbok:"PMBOK 7",
q:"Dans la TOC, qu'est-ce que le 'goulet d'étranglement' dans un projet ?",
opts:["Le budget","La ressource ou processus limitant la capacité totale et le débit global du système","Le risque au plus fort impact","La tâche la plus longue"],correct:1,
expl:"La TOC identifie la contrainte principale (bottleneck). En projet : ressource sur-allouée, décision en attente, processus lent. Optimiser le goulet maximise la performance globale."},
{id:153,lot:11,level:"tres-difficile",domain:"Personnes",pmbok:"PMBOK 7",
q:"Dans le modèle Cynefin, où se situe un projet IT innovant avec exigences émergentes ?",
opts:["Obvious (Simple)","Complicated","Complex","Chaotic"],correct:2,
expl:"Cynefin : Simple (cause-effet clair), Complicated (expertise), Complex (émergent, expérimenter), Chaotique (crise). Projets innovants = Complex, justifiant l'Agile itératif."},
{id:154,lot:11,level:"tres-difficile",domain:"Processus",pmbok:"Agile",
q:"Dans SAFe, quelle est la différence entre Epic, Feature et User Story ?",
opts:["Synonymes","Epic (mois/trimestres) → Feature (Sprint/PI) → User Story (jours) — hiérarchie de granularité","User Story > Feature > Epic","Feature est uniquement technique"],correct:1,
expl:"SAFe : Epic (Portfolio, grandes initiatives) → Feature (Program, fonctionnalités livrables) → User Story (Team, petits incréments). Chaque niveau a ses propres critères d'acceptation."},
{id:155,lot:11,level:"tres-difficile",domain:"Environnement",pmbok:"PMBOK 7",
q:"Qu'est-ce que l'Innovation Accounting dans Lean Startup appliqué aux projets Agile ?",
opts:["La comptabilité standard des startups","Des métriques d'apprentissage (leading indicators) pour évaluer la progression vers les objectifs à long terme","Une technique d'estimation","L'audit financier Agile"],correct:1,
expl:"Innovation Accounting (Eric Ries) : métriques d'apprentissage (activation, rétention) comme indicateurs avancés. Utile pour projets produits en environnement incertain."},
{id:156,lot:11,level:"tres-difficile",domain:"Processus",pmbok:"PMBOK 7",
q:"Quelle est la différence entre 'Assumption Log' et 'Risk Register' dans PMBOK 7 ?",
opts:["Même document","Assumption Log : hypothèses et contraintes (peuvent devenir risques). Risk Register : risques identifiés avec réponses","Risk Register plus formel","Assumption Log uniquement pour phases initiales"],correct:1,
expl:"Assumption Log → hypothèses de planification. Quand une hypothèse est menacée, elle devient un risque dans le Risk Register. Complémentaires dans la gestion de l'incertitude."},
{id:157,lot:11,level:"tres-difficile",domain:"Personnes",pmbok:"PMBOK 7",
q:"Dans un contexte multiculturel, quel est le principal risque pour une équipe distribuée France-Japon ?",
opts:["Fuseaux horaires uniquement","Styles de communication : haut contexte (Japon) vs bas contexte (France) créant des malentendus","Différences de langues techniques","Coûts des outils"],correct:1,
expl:"Hall : cultures haut contexte (Japon : sens implicite, non-verbal) vs bas contexte (France : sens explicite). Un 'oui' japonais peut signifier 'j'ai entendu' et non 'j'accepte'."},
{id:158,lot:11,level:"tres-difficile",domain:"Processus",pmbok:"PMBOK 7",
q:"Dans l'analyse Tornado, quelle variable correspond à la barre la plus longue ?",
opts:["Variable avec moins d'impact","Variable avec le plus grand impact sur les objectifs — la plus critique","Variable avec plus haute probabilité","Variable la plus facile à contrôler"],correct:1,
expl:"Tornado : barre la plus longue = variable qui a le plus grand effet sur l'objectif (coût/délai). C'est elle qu'il faut surveiller et gérer en priorité."},
{id:159,lot:11,level:"tres-difficile",domain:"Processus",pmbok:"PMBOK 7",
q:"Qu'est-ce que le 'Systems Thinking' en management de projet ?",
opts:["Penser à tous les systèmes informatiques","Comprendre les interactions et interdépendances entre les composants d'un projet comme un système global","La gestion des systèmes IT","L'analyse systémique des coûts"],correct:1,
expl:"Systems Thinking : voir le projet comme un système avec des éléments interdépendants. Les changements dans une partie affectent l'ensemble. Évite les solutions locales qui créent des problèmes globaux."},
{id:160,lot:11,level:"tres-difficile",domain:"Environnement",pmbok:"PMBOK 7",
q:"Comment la 'Business Agility' est-elle mesurée selon SAFe ?",
opts:["Nombre de Sprints","Capacité à détecter et répondre aux opportunités/menaces du marché — Time-to-Market, qualité, satisfaction client","Budget Agile alloué","Vélocité cumulée de toutes les équipes"],correct:1,
expl:"Business Agility SAFe : Time-to-Market, qualité (défauts, satisfaction), flow metrics (WIP, lead time), réponse aux opportunités. Mesure systémique, pas juste technique."},
{id:161,lot:11,level:"tres-difficile",domain:"Personnes",pmbok:"PMBOK 7",
q:"Dans ADKAR, pourquoi 'K' (Knowledge) est-il critique ?",
opts:["Knowledge = connaissance de comment changer. Sans savoir-faire, les gens ne peuvent adopter le changement même en le voulant","Kinetics = vitesse du changement","Key Performance = indicateurs succès","Keep = rétention équipes"],correct:0,
expl:"ADKAR : Awareness → Desire → Knowledge → Ability → Reinforcement. K est critique car même en voulant changer (D), sans les compétences (K+A), le changement échoue dans la pratique."},
{id:162,lot:11,level:"tres-difficile",domain:"Processus",pmbok:"Agile",
q:"Qu'est-ce que le 'Domain-Driven Design' (DDD) et son lien avec l'Agile ?",
opts:["Un design d'interface","Une approche de conception logicielle centrée sur le domaine métier, alignant modèle technique et expert métier via Ubiquitous Language","Un framework de management","Un outil de modélisation UML"],correct:1,
expl:"DDD (Eric Evans) : conception pilotée par le domaine. Bounded Contexts, Ubiquitous Language, collaboration experts métier/développeurs. S'intègre naturellement dans les processus Agile."},
{id:163,lot:11,level:"tres-difficile",domain:"Processus",pmbok:"PMBOK 7",
q:"Qu'est-ce que la 'Portfolio Management' selon PMBOK ?",
opts:["La gestion des photos du projet","La gestion centralisée d'un ou plusieurs portefeuilles pour atteindre les objectifs stratégiques en sélectionnant et priorisant les projets","La gestion des applications Portfolio","La gestion du budget global"],correct:1,
expl:"Portfolio Management = sélectionner, prioriser et contrôler les projets/programmes pour atteindre les objectifs stratégiques. Niveau supérieur au management de projet/programme."},
{id:164,lot:11,level:"tres-difficile",domain:"Environnement",pmbok:"PMBOK 7",
q:"Qu'est-ce que l'analyse de la valeur commerciale relative (Relative Value) en Agile ?",
opts:["La valeur de revente du projet","Une technique de priorisation du backlog basée sur la valeur business rapportée au coût/effort — optimise le ROI","Le retour sur investissement","La valeur monétaire des livrables"],correct:1,
expl:"Relative Value = valeur business / effort. Permet de prioriser les User Stories qui maximisent le ROI. Ex: US à haute valeur et faible effort = priorité maximale."},
{id:165,lot:11,level:"tres-difficile",domain:"Personnes",pmbok:"PMBOK 7",
q:"Selon Kotter, quelle est la première étape d'un processus de changement réussi ?",
opts:["Former une coalition","Créer un sentiment d'urgence suffisant pour mobiliser l'organisation","Développer une vision","Communiquer la vision"],correct:1,
expl:"Kotter (8 étapes) : 1-Urgence, 2-Coalition, 3-Vision, 4-Communication, 5-Éliminer les obstacles, 6-Victoires à court terme, 7-Consolider, 8-Ancrer. L'urgence est le fondement."},

// ════════════════════════════════════════════════════
// LOT 12 — TRÈS DIFFICILE (15 questions)
// ════════════════════════════════════════════════════
{id:166,lot:12,level:"tres-difficile",domain:"Processus",pmbok:"PMBOK 7",
q:"Dans une organisation matricielle forte, conflit de ressources avec un manager fonctionnel. Approche ?",
opts:["Escalader au PDG","Négocier en s'appuyant sur les priorités business documentées","Accepter et ajuster le planning","Menacer de retards"],correct:1,
expl:"Matrice forte : CP a plus d'autorité mais doit négocier avec les managers fonctionnels. Négociation basée sur les faits (priorités business, impacts documentés) est l'approche PMI préférée."},
{id:167,lot:12,level:"tres-difficile",domain:"Personnes",pmbok:"PMBOK 7",
q:"Selon Vroom, comment remotiver une équipe démoralisée après un audit négatif ?",
opts:["Augmenter les salaires","Renforcer effort→performance→récompense, montrer que leurs actions peuvent améliorer les résultats","Les surveiller davantage","Menacer de conséquences"],correct:1,
expl:"Vroom : rétablir la confiance que l'effort produit des résultats positifs (expectancy) et que ces résultats mènent à des récompenses valorisées (instrumentality + valence)."},
{id:168,lot:12,level:"tres-difficile",domain:"Processus",pmbok:"PMBOK 7",
q:"Votre projet : BAC=600k€, CPI=0.85, SPI=0.90. Quel est l'EAC et la durée estimée si durée planifiée = 24 mois ?",
opts:["EAC=510k€, Durée=21.6 mois","EAC=706k€, Durée=26.7 mois","EAC=600k€, Durée=24 mois","EAC=650k€, Durée=25 mois"],correct:1,
expl:"EAC=BAC/CPI=600/0.85=706k€. Durée estimée = 24/SPI = 24/0.90 = 26.7 mois. Les deux indicateurs montrent des dépassements. Actions correctives urgentes nécessaires."},
{id:169,lot:12,level:"tres-difficile",domain:"Processus",pmbok:"Agile",
q:"Qu'est-ce que le 'Kanban Flight Levels' de Klaus Leopold ?",
opts:["Un outil météo Agile","3 niveaux de flux (opérationnel, coordination, stratégie) pour aligner les améliorations Agile à l'échelle de l'organisation","Un outil de planning Scrum","Un framework SAFe"],correct:1,
expl:"Flight Levels : Niveau 1 (équipes), Niveau 2 (coordination entre équipes), Niveau 3 (stratégie portfolio). Aligner les niveaux pour une vraie Business Agility organisationnelle."},
{id:170,lot:12,level:"tres-difficile",domain:"Environnement",pmbok:"PMBOK 7",
q:"Dans l'analyse de décision (Decision Tree), comment calculer la valeur d'un nœud chance ?",
opts:["Prendre la valeur maximum","Somme des EMV pondérés par probabilité de chaque branche","Prendre la valeur minimum","Moyenne des valeurs des branches"],correct:1,
expl:"Nœud chance = Σ(Probabilité × Valeur) pour chaque branche. Représente l'EMV (Expected Monetary Value) de la décision dans un contexte incertain."},
{id:171,lot:12,level:"tres-difficile",domain:"Personnes",pmbok:"PMBOK 7",
q:"Qu'est-ce que le 'Servant Leader' fait différemment d'un manager traditionnel selon PMI ?",
opts:["Moins de travail","Priorise les besoins de l'équipe, facilite plutôt que contrôle, fait grandir les personnes","Plus de réunions","Moins d'autorité"],correct:1,
expl:"Servant Leadership : écouter, guider, développer l'équipe, supprimer les obstacles, créer les conditions du succès. Le leader est au service de l'équipe, pas l'inverse."},
{id:172,lot:12,level:"tres-difficile",domain:"Processus",pmbok:"PMBOK 7",
q:"Qu'est-ce que la 'Minimum Business Increment' (MBI) dans un contexte SAFe ?",
opts:["Le Sprint minimum","La plus petite tranche de valeur business livrable et déployable qui a de la valeur pour le client","Le MVP","Le PI minimum"],correct:1,
expl:"MBI = plus petite unité de valeur business livrable de façon autonome. Utilisé pour optimiser le flux de valeur et réduire le Time-to-Market. Plus petit qu'une Feature, plus grand qu'une User Story."},
{id:173,lot:12,level:"tres-difficile",domain:"Environnement",pmbok:"PMBOK 7",
q:"Dans la gestion des connaissances, qu'est-ce que la spirale SECI de Nonaka ?",
opts:["Un outil EVM","Le cycle de création des connaissances : Socialisation, Externalisation, Combinaison, Internalisation","Un processus de clôture","Un framework de communication"],correct:1,
expl:"SECI (Nonaka) : Socialisation (tacite→tacite), Externalisation (tacite→explicite), Combinaison (explicite→explicite), Internalisation (explicite→tacite). La connaissance organisationnelle se crée en spirale."},
{id:174,lot:12,level:"tres-difficile",domain:"Processus",pmbok:"Agile",
q:"Dans le flux Kanban, qu'est-ce que le 'Little's Law' et comment s'applique-t-il ?",
opts:["Une loi physique","Lead Time = WIP / Throughput. Réduire le WIP réduit le lead time et améliore la prévisibilité","Une loi de communication","Une règle de planification Scrum"],correct:1,
expl:"Loi de Little : LT = WIP/Throughput. Si WIP=10 items et throughput=2 items/semaine → LT=5 semaines. Réduire le WIP est le levier le plus efficace pour réduire le lead time."},
{id:175,lot:12,level:"tres-difficile",domain:"Personnes",pmbok:"PMBOK 7",
q:"Qu'est-ce que l'effet Dunning-Kruger et son impact sur les projets ?",
opts:["Un biais météo","Les personnes incompétentes surestiment leurs capacités; les expertes les sous-estiment. Impacte la qualité des estimations et l'auto-évaluation","Un biais de confirmation","L'effet de groupe"],correct:1,
expl:"Dunning-Kruger : peak of incompetence (sur-confiance des débutants), valley of despair (réalisation de l'incompréhension), slope of enlightenment (expertise réelle). Impacte les estimations et la sélection des ressources."},
{id:176,lot:12,level:"tres-difficile",domain:"Processus",pmbok:"PMBOK 7",
q:"Qu'est-ce que le 'Technical Debt Quadrant' de Martin Fowler ?",
opts:["Un outil budgétaire","4 types de dette : imprudente-délibérée, imprudente-accidentelle, prudente-délibérée, prudente-accidentelle","Un outil de tests","Un cadre de revue de code"],correct:1,
expl:"Fowler : dette délibérée-prudente (on sait, on décide), délibérée-imprudente (on s'en fout), accidentelle-prudente (on apprend), accidentelle-imprudente (incompétence). Chaque type requiert une réponse différente."},
{id:177,lot:12,level:"tres-difficile",domain:"Environnement",pmbok:"PMBOK 7",
q:"Qu'est-ce que le coefficient de variation (CV%) comme outil de risque en estimation ?",
opts:["EV-AC","Écart-type / Moyenne × 100. Mesure la dispersion relative d'une estimation — plus élevé = plus incertain","Coût total / Budget","Variance du projet"],correct:1,
expl:"CV% = (σ/μ)×100. Ex: estimée à 100k€ avec σ=20k€ → CV%=20%. Permet de comparer l'incertitude de différentes estimations sur un pied d'égalité, indépendamment de l'échelle."},
{id:178,lot:12,level:"tres-difficile",domain:"Processus",pmbok:"PMBOK 7",
q:"Qu'est-ce que la méthode 'Outcome-Based Roadmap' en Agile ?",
opts:["Une feuille de route de fonctionnalités","Une roadmap organisée par outcomes (résultats business mesurables) plutôt que par features, offrant plus de flexibilité","Un planning de Sprint","Un outil de gestion de portfolio"],correct:1,
expl:"Outcome-Based Roadmap : 'Améliorer la rétention de 20%' plutôt que 'livrer la feature X'. Donne à l'équipe la liberté de trouver la meilleure solution et s'adapte à l'évolution des besoins."},
{id:179,lot:12,level:"tres-difficile",domain:"Personnes",pmbok:"Agile",
q:"Qu'est-ce que la 'sociocracy' (Sociocratie) et son application dans les organisations Agile ?",
opts:["Une organisation politique","Un système de gouvernance basé sur le consentement (pas consensus), des cercles semi-autonomes et des double-liens","Un framework Agile","Un style de leadership"],correct:1,
expl:"Sociocracy : décisions par consentement (pas d'objection), cercles auto-organisés avec double-liens. Adoptée par de nombreuses organisations Agile pour allier autonomie et alignement."},
{id:180,lot:12,level:"tres-difficile",domain:"Processus",pmbok:"PMBOK 7",
q:"Dans la gestion de projet complexe, qu'est-ce que le 'Probe-Sense-Respond' selon Cynefin ?",
opts:["Analyser-Décider-Agir","Expérimenter de petites actions sûres, observer les résultats, adapter la réponse — approche adaptée aux systèmes complexes","Planifier-Exécuter-Contrôler","Identifier-Analyser-Résoudre"],correct:1,
expl:"Cynefin Complex : Probe (expérience sûre), Sense (observer émergence), Respond (amplifier ce qui marche, atténuer ce qui ne marche pas). Vs Sense-Analyse-Respond (Complicated) ou Sense-Categorize-Respond (Simple)."},

// ════════════════════════════════════════════════════
// LOT 13 — TRÈS DIFFICILE (15 questions)
// ════════════════════════════════════════════════════
{id:181,lot:13,level:"tres-difficile",domain:"Environnement",pmbok:"PMBOK 7",
q:"Votre projet : EV=300k€, PV=350k€, AC=280k€, BAC=700k€. Calculez ES (Earned Schedule) en mois si PV mensuel = 50k€/mois.",
opts:["5 mois","6 mois","6.5 mois","7 mois"],correct:1,
expl:"ES = nombre de périodes planifiées pour EV. PV à mois 6 = 300k€ (= EV). Donc ES = 6 mois. Le projet est équivalent à ce qui était planifié à 6 mois mais on en est à 7 mois (AT = 7). SV(t) = -1 mois de retard."},
{id:182,lot:13,level:"tres-difficile",domain:"Processus",pmbok:"PMBOK 7",
q:"Dans la gestion de programme (Program Management), qu'est-ce que la gouvernance de programme ?",
opts:["L'organigramme du programme","Le cadre qui assure l'alignement stratégique, la supervision des bénéfices et la prise de décisions cohérentes à travers tous les projets du programme","La charte du programme","Le budget consolidé"],correct:1,
expl:"Gouvernance de programme = structure, processus et décisions qui assurent que le programme réalise ses bénéfices stratégiques et que les projets restent alignés."},
{id:183,lot:13,level:"tres-difficile",domain:"Personnes",pmbok:"PMBOK 7",
q:"Qu'est-ce que le 'Situational Leadership' de Hersey et Blanchard ?",
opts:["Un style fixe de leadership","Le style de leadership doit s'adapter au niveau de maturité (compétence + engagement) du collaborateur","Un leadership en situation de crise","Le leadership Agile"],correct:1,
expl:"SL : S1-Directing (faible maturité), S2-Coaching (motivation mais peu compétent), S3-Supporting (compétent mais peu motivé), S4-Delegating (haute maturité). Le CP adapte son style."},
{id:184,lot:13,level:"tres-difficile",domain:"Processus",pmbok:"Agile",
q:"Dans l'Agile à l'échelle, qu'est-ce que le 'Scrum of Scrums' (SoS) ?",
opts:["Un sprint plus long","Une réunion de synchronisation entre ambassadeurs de plusieurs équipes Scrum pour gérer les interdépendances","Un framework de portfolio","Une variante de SAFe"],correct:1,
expl:"Scrum of Scrums : méta-Scrum où des ambassadeurs de chaque équipe se synchronisent sur les interdépendances, blocages et décisions inter-équipes. Plus léger que SAFe."},
{id:185,lot:13,level:"tres-difficile",domain:"Environnement",pmbok:"PMBOK 7",
q:"Qu'est-ce que le DSCR (Debt Service Coverage Ratio) dans la justification business d'un projet ?",
opts:["Un indicateur de performance EVM","Le ratio cash flows / service de la dette indiquant la capacité du projet à rembourser ses dettes : >1 = viable","Un indicateur de qualité","Un taux de satisfaction"],correct:1,
expl:"DSCR = EBITDA / (Principal + Intérêts). DSCR > 1.2 généralement requis par les banques. Pertinent pour les projets financés par dette (PPP, infrastructure)."},
{id:186,lot:186,level:"tres-difficile",domain:"Processus",pmbok:"PMBOK 7",
q:"Dans la gestion de la qualité, qu'est-ce que le Six Sigma DMAIC ?",
opts:["Un framework Agile","Define-Measure-Analyze-Improve-Control : méthodologie de réduction des défauts visant 3.4 défauts/million d'opportunités","Un processus de gestion des risques","Un outil de planification"],correct:1,
expl:"DMAIC : Définir le problème, Mesurer l'état actuel, Analyser les causes, Améliorer le processus, Contrôler pour maintenir. Six Sigma vise < 3.4 défauts/million (6σ = 99.99966% de qualité)."},
{id:187,lot:13,level:"tres-difficile",domain:"Personnes",pmbok:"PMBOK 7",
q:"Qu'est-ce que la 'Humble Inquiry' (Questionnement Modeste) d'Edgar Schein en leadership ?",
opts:["Poser des questions pour paraître modeste","L'art de poser des questions auxquelles on ne connaît pas la réponse, créant dépendance et curiosité — renforce les relations et la confiance","Une technique de négociation","Un style d'interrogatoire"],correct:1,
expl:"Humble Inquiry (Schein) : poser des questions genuines sans agenda caché. Crée la sécurité psychologique, encourage le partage d'informations critiques et renforce la relation."},
{id:188,lot:13,level:"tres-difficile",domain:"Processus",pmbok:"PMBOK 7",
q:"Qu'est-ce que la méthode 'Impact Mapping' d'Adzic ?",
opts:["Un outil de gestion des risques","Une technique de planification stratégique : Objectif → Acteurs → Impacts → Livrables — connecte les features à la valeur business","Un outil de test Agile","Un framework SAFe"],correct:1,
expl:"Impact Mapping : 1-Objectif (pourquoi), 2-Acteurs (qui peut l'atteindre), 3-Impacts (comportements à changer), 4-Livrables (comment y contribuer). Évite les features sans valeur business."},
{id:189,lot:13,level:"tres-difficile",domain:"Environnement",pmbok:"PMBOK 7",
q:"Dans l'EVM avancée, qu'est-ce que le 'IEAC(t)' (Independent Estimate at Completion for time) ?",
opts:["L'EAC en coûts","L'estimation indépendante de la durée finale = BAC(t) / SPI(t) ou AT + (BAC(t)-ES)/throughput prévu","Le temps total planifié","La durée restante estimée"],correct:1,
expl:"IEAC(t) = estimation de la durée finale basée sur la performance actuelle. Si SPI=0.8 et durée planifiée=12 mois → IEAC(t) = 12/0.8 = 15 mois. Complémentaire à l'EAC coût."},
{id:190,lot:13,level:"tres-difficile",domain:"Processus",pmbok:"Agile",
q:"Qu'est-ce que le 'Continuous Exploration' dans SAFe ?",
opts:["L'exploration technique","Un processus continu de compréhension du marché, des utilisateurs et des besoins pour alimenter le Program Backlog","Un sprint d'innovation","Un audit SAFe"],correct:1,
expl:"Continuous Exploration (CE) : écouter le marché, collaborer avec les clients, analyser les tendances pour générer des Epic et Feature hypotheses. Alimente le PI Planning avec des idées validées."},
{id:191,lot:13,level:"tres-difficile",domain:"Personnes",pmbok:"PMBOK 7",
q:"Dans la théorie U d'Otto Scharmer, qu'est-ce que le 'Presencing' ?",
opts:["La gestion des présences","Le point de bascule profond dans le processus de changement : connexion avec le futur émergent et transformation de la source de l'action","Une technique de méditation","Un outil de facilitation"],correct:1,
expl:"Theory U (Scharmer) : processus de changement transformationnel. Presencing = combinaison de 'presence' et 'sensing'. Le futur se révèle quand on lâche le passé pour accueillir le futur émergent."},
{id:192,lot:13,level:"tres-difficile",domain:"Processus",pmbok:"PMBOK 7",
q:"Qu'est-ce que le 'Project Business Case' selon PMBOK 7 et comment évolue-t-il ?",
opts:["Un document signé une seule fois","Un document vivant justifiant l'investissement, révisé à chaque phase majeure pour confirmer que le projet reste viable et aligné stratégiquement","Le contrat client","Le budget initial"],correct:1,
expl:"Le Business Case est un document évolutif (PMBOK 7) : initialement pour justifier le projet, puis révisé à chaque gate/phase pour confirmer la viabilité continue. Un projet peut être arrêté si le BC n'est plus valide."},
{id:193,lot:13,level:"tres-difficile",domain:"Environnement",pmbok:"PMBOK 7",
q:"Qu'est-ce que le 'Value Stream Mapping' (VSM) dans un contexte Agile/Lean ?",
opts:["Une carte des valeurs de l'équipe","Un outil visuel cartographiant le flux de valeur de bout en bout pour identifier les gaspillages (muda) et optimiser le lead time","Un outil de budgétisation","Une technique de tests"],correct:1,
expl:"VSM (Lean) : cartographie le flux complet de valeur depuis la demande client jusqu'à la livraison. Identifie les gaspillages (attente, surproduction, mouvements inutiles) pour optimiser le flux."},
{id:194,lot:13,level:"tres-difficile",domain:"Personnes",pmbok:"Agile",
q:"Qu'est-ce que la 'Liberating Structures' et leur utilisation dans les équipes Agile ?",
opts:["Des outils de restriction","Des micro-structures d'interaction (1-2-4-All, TRIZ, Fishbowl...) remplaçant les réunions traditionnelles pour libérer l'intelligence collective","Des outils de Scrum","Des techniques de management directif"],correct:1,
expl:"Liberating Structures (Lipmanowicz/McCandless) : 33 micro-structures facilitant la participation de tous. Ex: 1-2-4-All (individuel→pair→groupe→plenum) maximise l'engagement et l'émergence."},
{id:195,lot:13,level:"tres-difficile",domain:"Processus",pmbok:"PMBOK 7",
q:"Dans la gouvernance multi-projets, qu'est-ce que le 'Stage-Gate Process' ?",
opts:["Un processus de sécurité physique","Un système de points de décision (gates) séparant les phases du projet où la direction décide de continuer, modifier ou arrêter","Un processus de livraison Agile","Un outil de communication"],correct:1,
expl:"Stage-Gate (Cooper) : chaque phase se termine par un 'gate' où une équipe d'évaluateurs décide de passer à la phase suivante (go), modifier (conditional go) ou arrêter (kill). Standard dans R&D et développement produit."},

// ════════════════════════════════════════════════════
// LOT 14 — TRÈS DIFFICILE (15 questions)
// ════════════════════════════════════════════════════
{id:196,lot:14,level:"tres-difficile",domain:"Processus",pmbok:"PMBOK 7",
q:"Qu'est-ce que les '5 Why' et le diagramme d'Ishikawa ont en commun ?",
opts:["Rien","Les deux sont des outils d'analyse causale cherchant les causes racines d'un problème, complémentaires dans la résolution","Tous deux mesurent la qualité","Tous deux sont des outils Agile"],correct:1,
expl:"5 Whys = analyse linéaire en profondeur. Ishikawa = analyse multi-branches (5M). Combinés : Ishikawa identifie les catégories de causes, les 5 Whys approfondissent chaque branche pour trouver la cause racine."},
{id:197,lot:14,level:"tres-difficile",domain:"Personnes",pmbok:"PMBOK 7",
q:"Dans la psychologie positive appliquée au leadership, qu'est-ce que l'approche PERMA de Seligman ?",
opts:["Un outil de gestion des risques","Positive emotions, Engagement, Relationships, Meaning, Achievement — les 5 piliers du bien-être favorisant la performance","Un cadre de gouvernance","Un style de management"],correct:1,
expl:"PERMA (Seligman) : émotions positives, engagement (flow), relations positives, sens/meaning, accomplissement. Les leaders qui cultivent ces dimensions créent des équipes résilientes et performantes."},
{id:198,lot:14,level:"tres-difficile",domain:"Processus",pmbok:"Agile",
q:"Dans OKR (Objectives and Key Results), quelle est la différence avec les KPIs traditionnels ?",
opts:["OKR sont plus simples","OKR définissent des objectifs ambitieux ET les résultats clés mesurables qui prouvent l'atteinte. Focus sur l'alignement et l'ambition, pas seulement la mesure","OKR sont uniquement pour les startups","Les KPIs sont plus ambitieux"],correct:1,
expl:"KPIs : mesurer l'état actuel. OKR : fixer des objectifs ambitieux (60-70% d'atteinte = succès) et définir les résultats mesurables. OKR favorisent l'alignement vertical et horizontal."},
{id:199,lot:14,level:"tres-difficile",domain:"Environnement",pmbok:"PMBOK 7",
q:"Votre projet IT : BAC=1M€, à 40% d'avancement, EV=350k€, AC=420k€. Quel est le VAC et que conseillez-vous ?",
opts:["VAC=+200k€, continuer","VAC=-176k€, analyser les causes, mettre en place des actions correctives immédiates et rebaseline si nécessaire","VAC=0€, tout va bien","VAC=-50k€, attendre"],correct:1,
expl:"CPI=350/420=0.833. EAC=1000/0.833=1200k€. VAC=1000-1200=-200k€. À 40% d'avancement, il faut : analyser les causes du CPI<1, actions correctives (réduction coûts, ressources), communication sponsor, rebaseline si justifié."},
{id:200,lot:14,level:"tres-difficile",domain:"Processus",pmbok:"PMBOK 7",
q:"Qu'est-ce que le 'Weighted Shortest Job First' (WSJF) dans SAFe ?",
opts:["Un ordonnancement standard","Une technique de priorisation = Coût du délai / Durée. Maximise le flux de valeur en priorisant les items de haute valeur et courte durée","Un outil budgétaire","Un framework de qualité"],correct:1,
expl:"WSJF = Cost of Delay / Job Size (durée). Prioritise les features qui maximisent le flux de valeur business par unité de temps. Prend en compte : valeur business, urgence, réduction du risque, opportunité."},
{id:201,lot:14,level:"tres-difficile",domain:"Personnes",pmbok:"PMBOK 7",
q:"Dans la dynamique des groupes, qu'est-ce que le 'groupthink' et comment le prévenir ?",
opts:["La pensée collective positive","Un phénomène où le désir de consensus supprime la pensée critique, menant à des décisions irrationnelles. Prévention : devil's advocate, diversité, anonymat","Un outil de brainstorming","Un style de leadership collaboratif"],correct:1,
expl:"Groupthink (Janis) : pressé vers le consensus, le groupe ignore les signaux d'alerte. Exemples : Bay of Pigs, Challenger. Prévention : red teams, avocat du diable, rotation de rôles critiques."},
{id:202,lot:14,level:"tres-difficile",domain:"Processus",pmbok:"PMBOK 7",
q:"Qu'est-ce que la 'Progressive Elaboration' dans PMBOK 7 ?",
opts:["Une technique de décomposition du WBS","Le processus de détail croissant du plan projet au fur et à mesure que l'information devient disponible","Une méthode d'estimation agile","Un processus de gestion des changements"],correct:1,
expl:"Rolling Wave Planning / Progressive Elaboration : planifier en détail le travail proche, moins précisément le futur. Adaptation naturelle à l'incertitude, surtout en début de projet."},
{id:203,lot:14,level:"tres-difficile",domain:"Environnement",pmbok:"PMBOK 7",
q:"Dans l'EVM, quelle est la signification d'un TCPI > 1 et ses implications opérationnelles ?",
opts:["Le projet est facile à terminer dans le budget","Le projet doit être plus efficace que jusqu'à présent pour finir dans le budget. Implique : réduction des coûts, renegociation, ou rebaseline","Le projet est sous budget","Le TCPI n'a aucune implication"],correct:1,
expl:"TCPI > 1 : l'efficacité requise dépasse l'efficacité actuelle (CPI). Si TCPI > 1.1, terminer dans le budget original est très difficile. Décision : actions correctives agressives ou rebaseline justifié."},
{id:204,lot:14,level:"tres-difficile",domain:"Processus",pmbok:"Agile",
q:"Qu'est-ce que le 'Continuous Integration' (CI) et pourquoi est-il fondamental en Agile ?",
opts:["Intégrer l'équipe progressivement","Intégrer et tester automatiquement chaque changement de code dès qu'il est soumis, détectant les conflits immédiatement","Un outil de déploiement","Une pratique de management"],correct:1,
expl:"CI : chaque commit déclenche build + tests automatisés. Détecte les bugs immédiatement plutôt qu'en fin de Sprint. Réduit le risque d'intégration, maintient la vitesse et la qualité."},
{id:205,lot:14,level:"tres-difficile",domain:"Personnes",pmbok:"PMBOK 7",
q:"Selon la théorie de l'Autodétermination (SDT) de Deci et Ryan, quels sont les 3 besoins psychologiques fondamentaux ?",
opts:["Sécurité, salaire, statut","Autonomie (agir selon ses valeurs), Compétence (maîtrise), Appartenance (liens sociaux) — leur satisfaction crée la motivation intrinsèque","Objectifs, récompenses, punitions","Liberté, égalité, fraternité"],correct:1,
expl:"SDT : Autonomy (choisir ses actions), Competence (progresser et maîtriser), Relatedness (connexions significatives). Quand ces 3 besoins sont satisfaits, la motivation intrinsèque émerge naturellement."},
{id:206,lot:14,level:"tres-difficile",domain:"Processus",pmbok:"PMBOK 7",
q:"Dans la gouvernance adaptative d'un projet complexe, qu'est-ce que le 'Adaptive Leadership' ?",
opts:["Un leadership qui change de style chaque jour","La capacité à mobiliser les personnes pour faire face aux défis adaptatifs (pas techniques) qui requièrent des changements dans les valeurs, croyances ou comportements","Un leadership situationnel","Un framework Agile"],correct:1,
expl:"Heifetz : Technical challenges = expertise suffit. Adaptive challenges = nécessitent changement dans les mentalités/comportements. L'Adaptive Leader crée un 'holding environment' où ce travail difficile peut se faire."},
{id:207,lot:14,level:"tres-difficile",domain:"Environnement",pmbok:"PMBOK 7",
q:"Qu'est-ce que l'analyse de Monte Carlo peut modéliser dans un projet complexe ?",
opts:["Uniquement les coûts","Distributions de probabilité pour les durées, coûts, risques simultanément — produit une courbe S de probabilité d'achèvement à différentes dates/budgets","Uniquement les délais","Les performances de l'équipe"],correct:1,
expl:"Monte Carlo : simule des milliers de scénarios avec des distributions pour chaque variable (optimiste/probable/pessimiste). Résultat : P50 (50% de chances), P80, P90 pour la date ou le budget. Puissant outil de décision."},
{id:208,lot:14,level:"tres-difficile",domain:"Personnes",pmbok:"Agile",
q:"Qu'est-ce que la 'Radical Candor' de Kim Scott et son application en équipes Agile ?",
opts:["Une critique brutale sans empathie","Un style de feedback : Care personally (montrer qu'on tient à la personne) ET Challenge directly (dire la vérité difficile). Évite la ruinous empathy et l'obnoxious aggression","Un style de management autoritaire","Une technique de communication"],correct:1,
expl:"Radical Candor : l'opposé de l'empathie destructrice (ne pas dire la vérité pour éviter la douleur) et de l'agression grossière (critiquer sans empathie). Crée la culture de feedback qui fait grandir les équipes."},
{id:209,lot:14,level:"tres-difficile",domain:"Processus",pmbok:"PMBOK 7",
q:"Qu'est-ce que le 'Complexity Leadership Theory' (CLT) dans les organisations Agile ?",
opts:["Un leadership pour projets complexes","Un framework distinguant 3 types de leadership : administratif (ordre), adaptatif (changement), enabling (connexion). La valeur émerge de l'interaction entre les 3","Un framework SAFe","Un style de CP"],correct:1,
expl:"CLT (Uhl-Bien) : l'organisation est un Système Adaptatif Complexe. Leadership adaptatif (innove), administratif (structure) et enabling (crée conditions d'interaction). La valeur émerge des tensions créatives entre ces types."},
{id:210,lot:14,level:"tres-difficile",domain:"Environnement",pmbok:"PMBOK 7",
q:"Dans la gestion des risques de projet complexe, qu'est-ce que le 'Risk Appetite' vs 'Risk Tolerance' vs 'Risk Threshold' ?",
opts:["Synonymes","Appetite : niveau de risque souhaité (stratégie). Tolerance : variation acceptable autour de l'objectif (tactique). Threshold : niveau au-delà duquel une action est requise (opérationnel)","Tous concernent le budget","Ce sont des indicateurs EVM"],correct:1,
expl:"Trois niveaux différents : Appetite (stratégique, ex: 'nous acceptons les risques calculés'), Tolerance (tactique, ex: ±10% de variance), Threshold (opérationnel, ex: si risque > 50k€, escalader). Hiérarchie cohérente."},

// ════════════════════════════════════════════════════
// LOT 15 — TRÈS DIFFICILE (15 questions)
// ════════════════════════════════════════════════════
{id:211,lot:15,level:"tres-difficile",domain:"Environnement",pmbok:"PMBOK 7",
q:"Votre projet est à 60%. EV=300k€, AC=350k€, BAC=500k€. Client demande une re-estimation. EAC le plus réaliste ?",
opts:["EAC=BAC=500k€","EAC=AC+(BAC-EV)=350+200=550k€","EAC=BAC/CPI=500/(300/350)=583k€","EAC=EV/SPI"],correct:2,
expl:"Pour 'tendance actuelle continue' : EAC=BAC/CPI. CPI=300/350=0.857. EAC=500/0.857=583k€. L'option B assume que le reste sera réalisé au budget (optimiste). C est le plus réaliste et PMI-standard."},
{id:212,lot:15,level:"tres-difficile",domain:"Processus",pmbok:"PMBOK 7",
q:"Qu'est-ce que la 'Minimum Viable Architecture' (MVA) en Agile à l'échelle ?",
opts:["L'architecture minimale possible","L'ensemble minimal de décisions architecturales nécessaires pour permettre le développement sans sur-contraindre ni créer de dette technique excessive","Un MVP technique","La première version de l'architecture"],correct:1,
expl:"MVA : assez d'architecture pour permettre le développement (évite l'anarchie) sans sur-ingénierie (évite le Big Design Up Front). Équilibre agilité et structure technique dans les projets complexes."},
{id:213,lot:15,level:"tres-difficile",domain:"Personnes",pmbok:"PMBOK 7",
q:"Dans le modèle ADKAR, comment traiter un cas où 'D' (Desire) est faible malgré 'A' (Awareness) élevée ?",
opts:["Répéter la communication","Identifier et traiter les résistances personnelles spécifiques, impliquer les influenceurs, connecter le changement aux intérêts personnels","Former davantage","Imposer le changement"],correct:1,
expl:"A élevé + D faible = la personne comprend le changement mais ne veut pas changer. Solutions : comprendre les objections spécifiques, répondre aux 'WIIFM' (What's in it for me), impliquer des pairs influents."},
{id:214,lot:15,level:"tres-difficile",domain:"Processus",pmbok:"Agile",
q:"Dans SAFe 6.0, qu'est-ce que le 'Business Agility Value Stream' ?",
opts:["Le flux de valeur technique","Le flux de valeur qui connecte la stratégie aux équipes : Explorer (opportunités) → Integrate (solutions) → Deploy (clients) — mesure la vitesse de réponse au marché","Un outil de planification","Un workflow Kanban"],correct:1,
expl:"SAFe 6.0 : Business Agility Value Stream = capacité de l'organisation entière à détecter et répondre aux changements du marché. Dépasse les équipes pour inclure les processus business, culture et leadership."},
{id:215,lot:15,level:"tres-difficile",domain:"Environnement",pmbok:"PMBOK 7",
q:"Qu'est-ce que le concept de 'Antifragilité' de Nassim Taleb appliqué aux projets ?",
opts:["La résistance aux chocs","La capacité d'un système à s'améliorer et grandir face aux chocs, incertitudes et stresseurs — au-delà de la résilience","L'absence de risques","La gestion préventive"],correct:1,
expl:"Antifragilité (Taleb) : fragile (se casse), robuste (résiste), antifragile (se renforce). En PM : créer des projets qui bénéficient de la variabilité. Ex: optionalité, redondance intelligente, expérimentation."},
{id:216,lot:15,level:"tres-difficile",domain:"Personnes",pmbok:"PMBOK 7",
q:"Dans la gestion d'une crise projet, quelle est l'approche OODA loop de John Boyd ?",
opts:["Un outil EVM","Observe-Orient-Decide-Act : cycle de décision rapide permettant de battre l'adversaire (problème) en décidant et agissant plus vite que la situation n'évolue","Un framework Agile","Un outil de communication"],correct:1,
expl:"OODA Loop (Boyd) : Observer (collecter données), Orienter (analyser contexte), Décider (choisir action), Agir (implémenter). Le cycle le plus rapide gagne. Applicable aux crises projet pour dépasser l'entropie."},
{id:217,lot:15,level:"tres-difficile",domain:"Processus",pmbok:"PMBOK 7",
q:"Qu'est-ce que le 'Beyond Budgeting' et ses implications pour la gouvernance de projets Agile ?",
opts:["Un projet sans budget","Un modèle de management remplaçant les budgets fixes annuels par des cibles relatives et une allocation dynamique des ressources — favorise l'adaptabilité","Un outil d'estimation","Un framework SAFe"],correct:1,
expl:"Beyond Budgeting (Hope & Fraser) : remplace les budgets fixes (sources de jeux politiques) par des objectifs relatifs et une allocation de ressources dynamique. Aligné avec l'Agile : décisions au moment le plus informé."},
{id:218,lot:15,level:"tres-difficile",domain:"Environnement",pmbok:"PMBOK 7",
q:"Dans la gestion de portefeuille Agile, qu'est-ce que le 'Portfolio Kanban' dans SAFe ?",
opts:["Un tableau Kanban d'équipe","Un système visuel gérant le flux des Epics à travers les états (Funnel, Review, Analyzing, Portfolio Backlog, Implementing, Done) avec limite WIP","Un outil de budgétisation","Un framework de gouvernance"],correct:1,
expl:"Portfolio Kanban SAFe : visualise et limite le WIP au niveau Epic. États : Funnel (idées brutes) → Review → Analyzing (Lean Business Case) → Portfolio Backlog → Implementing → Done. Gère la capacité stratégique."},
{id:219,lot:15,level:"tres-difficile",domain:"Personnes",pmbok:"Agile",
q:"Qu'est-ce que le 'Network Leadership' dans les organisations distribuées Agile ?",
opts:["Un leader réseau informatique","Un style de leadership où l'influence s'exerce par des réseaux de relations informels plutôt que par la hiérarchie — essentiel pour les grandes transformations Agile","Un outil de communication","Le leadership d'une équipe distribuée"],correct:1,
expl:"Network Leadership : cartographier et activer les réseaux d'influence informels. Les vrais agents de changement ne sont pas toujours les managers. Essentiel pour les transformations Agile à grande échelle."},
{id:220,lot:15,level:"tres-difficile",domain:"Processus",pmbok:"PMBOK 7",
q:"Qu'est-ce que la 'Viable System Model' (VSM) de Stafford Beer appliquée aux organisations Agile ?",
opts:["Un modèle de gestion des systèmes IT","Un modèle cybernétique de l'organisation viable décrivant 5 systèmes interdépendants assurant l'autonomie locale et la cohérence globale","Un framework de qualité","Un outil de planification"],correct:1,
expl:"VSM Beer : S1 (opérations), S2 (coordination), S3 (contrôle), S4 (intelligence/adaptation), S5 (politique/identité). Chaque niveau est autonome mais coordonné. Inspiré les organisations Agile décentralisées."},
{id:221,lot:15,level:"tres-difficile",domain:"Processus",pmbok:"PMBOK 7",
q:"Dans la gestion de la complexité, qu'est-ce que le 'Double-Loop Learning' d'Argyris ?",
opts:["Apprendre deux fois la même chose","Single-loop = corriger les erreurs dans le cadre existant. Double-loop = remettre en question les hypothèses et valeurs fondamentales qui causent les erreurs","Un outil de formation","Un processus de qualité"],correct:1,
expl:"Argyris : Single-loop learning = thermostat (ajuste l'action). Double-loop = remet en question la consigne même (pourquoi cette température ?). Essentiel pour l'apprentissage organisationnel profond."},
{id:222,lot:15,level:"tres-difficile",domain:"Environnement",pmbok:"PMBOK 7",
q:"Qu'est-ce que le concept de 'Dark Matter' en architecture d'entreprise appliqué aux projets de transformation ?",
opts:["Des fonctionnalités cachées","Les hypothèses implicites, cultures, politiques et dynamiques organisationnelles non documentées qui influencent massivement le succès mais restent invisibles à l'architecture formelle","Des risques techniques","Des coûts cachés"],correct:1,
expl:"Dark Matter (Resmini) : la masse invisible de l'organisation (culture, politique, habitudes, relations informelles) représente souvent 90% de l'influence sur les résultats. Les projets qui l'ignorent échouent malgré une technique parfaite."},
{id:223,lot:15,level:"tres-difficile",domain:"Personnes",pmbok:"PMBOK 7",
q:"Dans la facilitation de réunions complexes, qu'est-ce que le 'Diverge-Converge' pattern ?",
opts:["Un problème de divergence d'opinion","Un pattern de facilitation alternant expansion (génération d'idées, exploration) et contraction (priorisation, décision) pour structurer le travail de groupe","Un outil de gestion de conflits","Un framework de communication"],correct:1,
expl:"Diverge-Converge (Double Diamond, Design Thinking) : d'abord explorer largement (diverger), puis sélectionner et approfondir (converger). Évite la convergence prématurée et l'exploration sans fin."},
{id:224,lot:15,level:"tres-difficile",domain:"Processus",pmbok:"Agile",
q:"Qu'est-ce que le 'Executable Specification' dans BDD (Behavior-Driven Development) ?",
opts:["Une spécification imprimée","Des scénarios rédigés en langage naturel (Gherkin: Given-When-Then) qui servent à la fois de documentation vivante et de tests automatisés","Un document de conception","Un plan de tests manuel"],correct:1,
expl:"BDD (Given-When-Then) : les scénarios d'acceptation en langage naturel deviennent des tests automatisés (Cucumber, SpecFlow). Documentation toujours à jour car synchronisée avec le code. Réduit le fossé métier-technique."},
{id:225,lot:15,level:"tres-difficile",domain:"Processus",pmbok:"PMBOK 7",
q:"Selon PMBOK 7, qu'est-ce que le principe 'Optimize for Value, Not Activity' implique pour un chef de projet ?",
opts:["Travailler le moins possible","Se concentrer sur la livraison de valeur réelle (outcomes) plutôt que sur les activités et livrables (outputs). Questionner constamment la valeur de chaque effort","Optimiser uniquement les coûts","Livrer le plus vite possible"],correct:1,
expl:"Outcomes > Outputs : livrer des fonctionnalités (output) ne crée pas automatiquement de la valeur (outcome). Un CP mature questionne continuellement : 'Est-ce que cela crée réellement de la valeur pour le client et l'organisation ?'"},

]  // fin ALL_QUESTIONS



const LEVELS = [
  { key:"facile",        label:"Facile",        icon:"⭐",   color:"#27500A", bg:"#EAF3DE", border:"#C0DD97", lots:[1,2,3,4,5] },
  { key:"difficile",     label:"Difficile",     icon:"⭐⭐",  color:"#854F0B", bg:"#FAEEDA", border:"#EF9F27", lots:[6,7,8,9,10] },
  { key:"tres-difficile",label:"Très Difficile",icon:"⭐⭐⭐", color:"#A32D2D", bg:"#FCEBEB", border:"#E24B4A", lots:[11,12,13,14,15] },
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
    selectedLot ? ALL_QUESTIONS.filter((q: any) => q.lot === selectedLot) : [],
    [selectedLot]
  )
  const current = questions[currentIdx] as any
  const levelCfg = LEVELS.find(l => l.key === selectedLevel)

  useEffect(() => {
    if (!started || finished || !current) return
    if (timeLeft <= 0) { setFinished(true); return }
    const t = setTimeout(() => setTimeLeft((s: number) => s-1), 1000)
    return () => clearTimeout(t)
  }, [started, finished, timeLeft, current])

  const startLot = (lot: number, level: string) => {
    const qs = ALL_QUESTIONS.filter((q: any) => q.lot === lot)
    setSelectedLot(lot); setSelectedLevel(level)
    setCurrentIdx(0); setAnswers({}); setShowExpl(false)
    setFinished(false); setTimeLeft(qs.length * 90)
    setStarted(true)
  }

  const answer = (i: number) => {
    if (answers[current.id] !== undefined) return
    setAnswers((p: Record<number,number>) => ({ ...p, [current.id]: i }))
    setShowExpl(true)
  }

  const next = () => {
    if (currentIdx + 1 >= questions.length) setFinished(true)
    else { setCurrentIdx((c: number) => c+1); setShowExpl(false) }
  }

  const reset = () => {
    setSelectedLevel(null); setSelectedLot(null); setStarted(false)
    setFinished(false); setAnswers({}); setCurrentIdx(0)
  }

  const score = questions.filter((q: any) => answers[q.id] === q.correct).length
  const pct = questions.length > 0 ? Math.round(score/questions.length*100) : 0
  const passed = pct >= 61
  const mm = Math.floor(timeLeft/60)
  const ss = timeLeft % 60

  return (
    <AppLayout>
      <div style={{ padding:"24px 28px", background:"var(--bg)", minHeight:"100%" }}>
        <div style={{ marginBottom:20 }}>
          <p style={{ fontSize:11, color:"var(--text-3)", textTransform:"uppercase", letterSpacing:"1px", margin:"0 0 4px" }}>// PRÉPARATION PMP</p>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div>
              <h1 style={{ fontSize:22, fontWeight:700, color:"var(--text-1)", margin:0 }}>🎯 Simulateur Examen PMP</h1>
              <p style={{ fontSize:13, color:"var(--text-2)", margin:"4px 0 0" }}>225 questions · 3 niveaux · 15 lots de 15 questions · PMBOK 7 + Agile · Seuil : 61%</p>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              {started && <button onClick={reset} style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", background:"#fff", border:"1px solid var(--border)", borderRadius:"var(--r8)", fontSize:12, cursor:"pointer" }}><RotateCcw size={13}/> Changer de lot</button>}
              <Link href="/pmp-conseils" style={{ padding:"7px 14px", background:"var(--primary-bg)", border:"1px solid #B5D4F4", borderRadius:"var(--r8)", fontSize:12, color:"var(--primary-t)", textDecoration:"none", fontWeight:500 }}>📖 Guide conseils</Link>
            </div>
          </div>
        </div>

        {/* Sélection lot */}
        {!started && (
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {LEVELS.map(lv => (
              <div key={lv.key} style={{ background:"var(--card)", border:`1px solid ${lv.border}`, borderRadius:"var(--r12)", overflow:"hidden" }}>
                <div style={{ padding:"14px 20px", background:lv.bg, display:"flex", alignItems:"center", gap:12 }}>
                  <span style={{ fontSize:24 }}>{lv.icon}</span>
                  <div>
                    <h2 style={{ fontSize:15, fontWeight:700, color:lv.color, margin:0 }}>Niveau {lv.label}</h2>
                    <p style={{ fontSize:12, color:lv.color, opacity:0.7, margin:0 }}>5 lots × 15 questions · {lv.lots.length * 15} questions au total · ~22 min/lot</p>
                  </div>
                </div>
                <div style={{ padding:16, display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10 }}>
                  {lv.lots.map(lot => {
                    const lotQ = ALL_QUESTIONS.filter((q: any) => q.lot === lot)
                    const domains = [...new Set(lotQ.map((q: any) => q.domain))]
                    return (
                      <button key={lot} onClick={() => startLot(lot, lv.key)}
                        style={{ padding:"14px 10px", background:"var(--bg)", border:`1px solid ${lv.border}`, borderRadius:"var(--r8)", cursor:"pointer", textAlign:"center", transition:"all 0.15s" }}
                        onMouseEnter={e => { (e.currentTarget as any).style.background = lv.bg; (e.currentTarget as any).style.transform = "translateY(-2px)" }}
                        onMouseLeave={e => { (e.currentTarget as any).style.background = "var(--bg)"; (e.currentTarget as any).style.transform = "none" }}>
                        <div style={{ fontSize:20, marginBottom:6 }}>{lv.icon}</div>
                        <div style={{ fontSize:13, fontWeight:700, color:lv.color }}>Lot {lot}</div>
                        <div style={{ fontSize:11, color:"var(--text-3)", marginTop:3, fontWeight:600 }}>{lotQ.length} questions</div>
                        <div style={{ fontSize:10, color:"var(--text-3)", marginTop:4, lineHeight:1.4 }}>
                          {domains.join(" · ")}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quiz actif */}
        {started && !finished && current && (
          <div style={{ maxWidth:780, margin:"0 auto" }}>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"var(--text-3)", marginBottom:4 }}>
                  <span>Lot {selectedLot} · {levelCfg?.label} · Q{currentIdx+1}/{questions.length}</span>
                  <span>{score} correctes · {pct}%</span>
                </div>
                <div style={{ height:5, background:"var(--border)", borderRadius:3, overflow:"hidden" }}>
                  <div style={{ height:"100%", borderRadius:3, background:levelCfg?.color, width:`${((currentIdx)/questions.length)*100}%`, transition:"width 0.3s" }}/>
                </div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 12px", background:timeLeft<60?"#FCEBEB":"var(--bg)", border:`1px solid ${timeLeft<60?"#E24B4A":"var(--border)"}`, borderRadius:"var(--r8)", flexShrink:0 }}>
                <Clock size={13} style={{ color:timeLeft<60?"#A32D2D":"var(--text-2)" }}/>
                <span style={{ fontSize:13, fontWeight:700, fontFamily:"monospace", color:timeLeft<60?"#A32D2D":"var(--text-1)" }}>{String(mm).padStart(2,"0")}:{String(ss).padStart(2,"0")}</span>
              </div>
            </div>

            <div style={{ background:"var(--card)", border:`1px solid ${levelCfg?.border}`, borderRadius:"var(--r12)", padding:24 }}>
              <div style={{ display:"flex", gap:8, marginBottom:14, flexWrap:"wrap" }}>
                <span style={{ padding:"3px 10px", background:levelCfg?.bg, color:levelCfg?.color, borderRadius:20, fontSize:11, fontWeight:600 }}>{levelCfg?.icon} {levelCfg?.label}</span>
                <span style={{ padding:"3px 10px", background:"#E6F1FB", color:"#185FA5", borderRadius:20, fontSize:11, fontWeight:600 }}>{current.domain}</span>
                <span style={{ padding:"3px 10px", background:"#EEEDFE", color:"#3C3489", borderRadius:20, fontSize:11, fontWeight:600 }}>{current.pmbok}</span>
                <span style={{ fontSize:11, color:"var(--text-3)", marginLeft:"auto" }}>Q{current.id}</span>
              </div>
              <p style={{ fontSize:15, fontWeight:500, color:"var(--text-1)", lineHeight:1.7, margin:"0 0 20px" }}>{current.q}</p>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {current.opts.map((opt: string, i: number) => {
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
              <button onClick={() => { setCurrentIdx((c: number)=>Math.max(0,c-1)); setShowExpl(false) }} disabled={currentIdx===0}
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
            <h2 style={{ fontSize:22, fontWeight:700, color:"var(--text-1)", margin:"0 0 6px" }}>{passed?"Excellent !":"Révisez encore !"}</h2>
            <p style={{ fontSize:14, color:"var(--text-2)", margin:"0 0 24px" }}>
              Lot {selectedLot} · Niveau {levelCfg?.label} · <strong style={{ fontSize:28, color:passed?"#27500A":"#A32D2D" }}>{pct}%</strong> ({score}/{questions.length})
            </p>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:20 }}>
              {[
                {l:"Correctes",v:score,c:"#27500A",bg:"#EAF3DE"},
                {l:"Incorrectes",v:questions.length-score,c:"#A32D2D",bg:"#FCEBEB"},
                {l:"Score",v:`${pct}%`,c:passed?"#27500A":"#A32D2D",bg:passed?"#EAF3DE":"#FCEBEB"}
              ].map(k=>(
                <div key={k.l} style={{ background:k.bg, borderRadius:"var(--r8)", padding:12 }}>
                  <p style={{ fontSize:10, color:"var(--text-3)", margin:"0 0 4px", textTransform:"uppercase" }}>{k.l}</p>
                  <p style={{ fontSize:22, fontWeight:700, color:k.c, margin:0 }}>{k.v}</p>
                </div>
              ))}
            </div>
            <div style={{ background:passed?"#EAF3DE":"#FAEEDA", border:`1px solid ${passed?"#C0DD97":"#EF9F27"}`, borderRadius:"var(--r8)", padding:"12px 16px", marginBottom:20 }}>
              <p style={{ fontSize:13, color:passed?"#27500A":"#854F0B", margin:0 }}>
                {passed?"✅ Seuil PMI (61%) atteint sur ce lot !":"⚠️ Seuil non atteint. Révisez les explications et retentez ce lot."}
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
