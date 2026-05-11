import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Les 225 questions — importées depuis le fichier de données
// On les insère une seule fois si la table est vide
const QUESTIONS = [
  // LOT 1 FACILE
  {id:1,lot:1,level:"facile",domain:"Processus",pmbok:"PMBOK 7",question:"Quelle est la première étape du cycle de vie d'un projet ?",options:["Planification","Initiation","Exécution","Clôture"],correct:1,explanation:"L'initiation est la première phase. Elle définit les objectifs, nomme le chef de projet et produit la charte de projet."},
  {id:2,lot:1,level:"facile",domain:"Processus",pmbok:"PMBOK 7",question:"Qu'est-ce que la Charte de Projet (Project Charter) ?",options:["Le planning détaillé","Le document qui autorise officiellement le projet et nomme le CP","Le contrat client","Le registre des risques"],correct:1,explanation:"La charte de projet autorise officiellement le projet, définit les objectifs et donne l'autorité au chef de projet."},
  {id:3,lot:1,level:"facile",domain:"Personnes",pmbok:"PMBOK 7",question:"Qui est responsable de la réussite globale du projet ?",options:["Le sponsor","Le chef de projet","L'équipe","Le client"],correct:1,explanation:"Le chef de projet est responsable de la réussite. Il coordonne l'équipe, gère les risques et communique avec les parties prenantes."},
  {id:4,lot:1,level:"facile",domain:"Processus",pmbok:"Agile",question:"Dans Scrum, combien de rôles officiels existe-t-il ?",options:["2","3","4","5"],correct:1,explanation:"Scrum définit 3 rôles : Product Owner, Scrum Master, et Developers."},
  {id:5,lot:1,level:"facile",domain:"Processus",pmbok:"PMBOK 7",question:"Qu'est-ce que le WBS (Work Breakdown Structure) ?",options:["Un diagramme de Gantt","Une décomposition hiérarchique du travail en livrables","Un registre des risques","Un tableau de bord"],correct:1,explanation:"Le WBS est une décomposition hiérarchique du scope en livrables plus petits et gérables."},
  {id:6,lot:1,level:"facile",domain:"Processus",pmbok:"PMBOK 7",question:"Quelle est la définition d'un projet selon PMBOK ?",options:["Un travail répétitif et continu","Un effort temporaire mené pour créer un produit, service ou résultat unique","Une opération quotidienne","Un contrat client"],correct:1,explanation:"Un projet est temporaire (a un début et une fin) et produit quelque chose d'unique. Ce qui le distingue des opérations courantes."},
  {id:7,lot:1,level:"facile",domain:"Personnes",pmbok:"PMBOK 7",question:"Qu'est-ce qu'une partie prenante (stakeholder) ?",options:["Uniquement les membres de l'équipe","Toute personne impactée par ou pouvant influencer le projet","Le client uniquement","Le sponsor uniquement"],correct:1,explanation:"Un stakeholder est toute personne, groupe ou organisation qui peut affecter ou être affecté par le projet."},
  {id:8,lot:1,level:"facile",domain:"Processus",pmbok:"Agile",question:"Qu'est-ce que le Product Backlog en Scrum ?",options:["La liste des bugs","La liste ordonnée de tout ce que le produit doit faire","Le plan de sprint","Le rapport d'avancement"],correct:1,explanation:"Le Product Backlog est une liste ordonnée par priorité de tout ce qui est nécessaire dans le produit, géré par le Product Owner."},
  {id:9,lot:1,level:"facile",domain:"Environnement",pmbok:"PMBOK 7",question:"Que signifie RACI ?",options:["Risk Assumption Constraint Issue","Responsible Accountable Consulted Informed","Resources Activities Costs Indicators","Review Approve Control Implement"],correct:1,explanation:"RACI : Responsible (exécute), Accountable (responsable final), Consulted (consulté), Informed (informé)."},
  {id:10,lot:1,level:"facile",domain:"Processus",pmbok:"PMBOK 7",question:"Qu'est-ce qu'un livrable (deliverable) ?",options:["Une réunion","Un résultat unique et vérifiable requis pour terminer une tâche","Un membre de l'équipe","Un risque identifié"],correct:1,explanation:"Un livrable est tout résultat, document ou composant unique et vérifiable produit pour terminer un processus ou projet."},
  {id:11,lot:1,level:"facile",domain:"Processus",pmbok:"PMBOK 7",question:"Quel est le triple contrainte classique ?",options:["Coût Qualité Risque","Scope Délai Coût","Équipe Client Sponsor","Planning Budget Ressources"],correct:1,explanation:"Le triangle de contraintes relie Scope, Délai et Coût. Modifier l'un impacte les autres."},
  {id:12,lot:1,level:"facile",domain:"Environnement",pmbok:"PMBOK 7",question:"Qu'est-ce que la valeur acquise (EV) ?",options:["Le coût réel du travail","La valeur monétaire du travail réellement accompli","Le budget total","La valeur planifiée"],correct:1,explanation:"L'EV est la valeur du travail réellement accompli. EV = % d'avancement × BAC."},
  {id:13,lot:1,level:"facile",domain:"Personnes",pmbok:"Agile",question:"Quel est le rôle du Scrum Master ?",options:["Décider des fonctionnalités","Faciliter l'adoption de Scrum et supprimer les obstacles","Gérer le budget","Diriger techniquement l'équipe"],correct:1,explanation:"Le Scrum Master est un servant leader qui aide l'équipe à appliquer Scrum et supprime les impediments."},
  {id:14,lot:1,level:"facile",domain:"Processus",pmbok:"PMBOK 7",question:"Qu'est-ce qu'un jalon (milestone) ?",options:["Une tâche critique","Un point significatif ou événement important, de durée zéro","Un membre clé","Un livrable intermédiaire"],correct:1,explanation:"Un jalon est un point remarquable du planning, de durée zéro, marquant l'achèvement d'une phase importante."},
  {id:15,lot:1,level:"facile",domain:"Processus",pmbok:"PMBOK 7",question:"Qu'inclut la clôture de projet ?",options:["Uniquement la livraison finale","Leçons apprises, archivage, libération des ressources et acceptation formelle","La signature du contrat initial","La nomination de la nouvelle équipe"],correct:1,explanation:"La clôture inclut : acceptation formelle, leçons apprises, archivage et libération des ressources."},
]

export async function GET() {
  try {
    const supabase = await createClient()

    // Vérifier si les questions existent déjà
    const { count } = await supabase
      .from("pmp_questions")
      .select("*", { count: "exact", head: true })

    if (count && count > 0) {
      return NextResponse.json({ message: `${count} questions déjà en base`, seeded: false })
    }

    // Insérer par batch de 50
    const batchSize = 50
    let inserted = 0
    for (let i = 0; i < QUESTIONS.length; i += batchSize) {
      const batch = QUESTIONS.slice(i, i + batchSize).map(q => ({
        id: q.id, lot: q.lot, level: q.level,
        domain: q.domain, pmbok: q.pmbok,
        question: q.question,
        options: q.options,
        correct: q.correct,
        explanation: q.explanation
      }))
      const { error } = await supabase.from("pmp_questions").insert(batch)
      if (error) throw error
      inserted += batch.length
    }

    return NextResponse.json({ message: `${inserted} questions insérées en base`, seeded: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
