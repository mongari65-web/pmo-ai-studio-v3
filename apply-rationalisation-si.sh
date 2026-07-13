#!/usr/bin/env bash
# ============================================================
# Application de la brique "Rationalisation SI" à PMO AI Studio V3
# ============================================================
# Prérequis : à exécuter depuis la racine du repo pmo-ai-studio-v3
# (celui qui contient package.json, src/, etc.)
#
# Ce que ça fait :
#   1. Vérifie que tu es bien à la racine du repo
#   2. Vérifie que l'arbre de travail est propre (sinon stash proposé)
#   3. Applique le patch rationalisation-si.patch
#   4. Lance un tsc --noEmit pour valider
#
# Usage :
#   chmod +x apply-rationalisation-si.sh
#   ./apply-rationalisation-si.sh
# ============================================================

set -e

if [ ! -f "package.json" ] || [ ! -d "src/app" ]; then
  echo "❌ Ce script doit être lancé depuis la racine du repo pmo-ai-studio-v3."
  exit 1
fi

if [ -n "$(git status --porcelain)" ]; then
  echo "⚠️  Ton arbre de travail n'est pas propre."
  read -p "Stash les changements en cours avant d'appliquer le patch ? (o/N) " ans
  if [ "$ans" = "o" ] || [ "$ans" = "O" ]; then
    git stash push -m "avant rationalisation-si"
    echo "✅ Changements stashés (git stash pop pour les récupérer)."
  else
    echo "❌ Abandon. Committe ou stash tes changements d'abord."
    exit 1
  fi
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "📦 Application du patch..."
git apply --check "$SCRIPT_DIR/rationalisation-si.patch" 2>/dev/null || {
  echo "⚠️  git apply --check a échoué (souvent bénin si les fichiers n'existent pas encore)."
}
git apply "$SCRIPT_DIR/rationalisation-si.patch"

echo "✅ Patch appliqué. Fichiers modifiés/créés :"
git diff --stat HEAD

echo ""
echo "🔍 Vérification TypeScript..."
if command -v npx &> /dev/null; then
  npx tsc --noEmit -p . && echo "✅ TypeScript OK" || echo "⚠️  Erreurs TypeScript à vérifier (voir ci-dessus)"
else
  echo "⚠️  npx introuvable, vérification TypeScript sautée."
fi

echo ""
echo "📋 Prochaines étapes :"
echo "  1. git diff pour relire les changements"
echo "  2. npm run dev pour tester en local (/guide → 5e carte 'Rationalisation SI')"
echo "  3. git add -A && git commit -m 'feat: brique Rationalisation SI (cartographie, TIME, backlog WSJF, roadmap N/N/L)'"
echo "  4. git push"
