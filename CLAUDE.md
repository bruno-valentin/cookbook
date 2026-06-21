# Cookbook — CLAUDE.md

## Contexte projet
Application web personnelle de gestion de recettes avec génération AI.
URL prod : https://cookbook-three-ruby.vercel.app
GitHub : bruno-valentin/cookbook

## Stack technique
- Next.js 14 (App Router, pas de src/)
- TypeScript
- Supabase (base de données + auth)
- Anthropic API — modèle : claude-opus-4-5 (utilisé par toutes les routes API ; le Dev réutilise ce modèle pour toute nouvelle route)
- Vercel (déploiement)

## Structure des dossiers
/app → pages et routes (App Router)
/lib → utilitaires, clients Supabase et Anthropic
/public → assets statiques
AGENTS.md → définition des agents AI
CLAUDE.md → ce fichier

## Table Supabase : `recipes`
| Colonne | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| title | text | |
| description | text | Nullable |
| servings | int4 | Nullable |
| prep_time_min | int4 | Nullable |
| cook_time_min | int4 | Nullable |
| ingredients | jsonb | Nullable |
| steps_mise_en_place | jsonb | Nullable |
| steps_cooking | jsonb | Nullable |
| nutrition | jsonb | Nullable |
| yuka_score | numeric | Nullable |
| price_per_portion | numeric | Nullable |
| created_at | timestamptz | Nullable |

## Agents AI existants
Voir AGENTS.md pour le détail. Les 3 agents actuels :
- Génération de recette
- Analyse nutritionnelle
- Score Yuka

## Gotchas connus
- Les pages qui lisent Supabase nécessitent `export const dynamic = 'force-dynamic'`
- Next.js 14+ : les params de routes dynamiques sont async → toujours `await params`
- Parser les réponses AI : stripper les fences markdown (```json) avant JSON.parse()
- Supabase API keys : "Publishable key" (ex-anon) et "Secret key" (ex-service_role)
- Ne jamais committer les clés → elles sont dans .env.local (non versionné)

## Zones interdites
- Ne pas modifier le schéma Supabase sans validation explicite préalable
- Ne pas toucher à .env.local
- Ne pas changer la structure des agents sans discussion préalable

## Commandes utiles
npm run dev → lancer en local
npm run build → vérifier que ça build avant de pusher
git push → via SSH (github-cookbook alias)

## Méthodologie de développement
Toutes les nouvelles features sont développées avec le framework BMAD.
Pipeline complet : Analyst → PM → PO → Architect → UX Designer → Developer → QA → Tech Writer
- PO (Sarah) : affine les épics en stories testables avec critères d'acceptation
- QA (Quinn) : test architect — stratégie de test, edge cases, review qualité avant ship
Pour les features simples : PM → Architect → Developer suffit.
- Toujours produire le plan complet et attendre validation avant d'implémenter
- Développer étape par étape, montrer les fichiers modifiés avant d'écrire
- Une étape à la fois, pas de surprise

### Agent parallèle (non séquentiel)
`user-persona` incarne une persona utilisateur réelle et peut être invoqué à tout moment,
sans bloquer le pipeline. Voir `bmad-agent/README.md`.
- Analyst → mode `interview` (discovery)
- PM → mode `feature-reaction` (validation de features)
- PO → mode `friction-scan` (review de flows)

## Style de collaboration
- Propose un plan d'implémentation AVANT d'écrire du code
- Montre les fichiers que tu vas modifier et pourquoi
- Attends une validation explicite avant chaque étape
- Si tu as un doute sur une décision technique, pose la question

## Sécurité — règles non négociables
- Les clés API (Anthropic, Supabase secret key) sont UNIQUEMENT dans .env.local, jamais dans le code
- Préfixe NEXT_PUBLIC_ interdit pour les clés sensibles (Anthropic, Supabase service_role)
- Les appels Anthropic API se font uniquement côté serveur (Server Components ou Route Handlers)
- Utiliser la publishable key Supabase côté client, la secret key uniquement côté serveur
- RLS activé sur la table recipes ✅ — policies ouvertes au rôle anon (acceptable pour usage perso solo)
- Ne pas ouvrir l'URL Supabase publiquement
- Toujours valider et sanitiser les inputs utilisateur avant de les passer à l'API Anthropic
- Ne jamais committer .env.local — vérifier qu'il est dans .gitignore avant chaque session
- SSH activé ✅ (alias github-cookbook dans ~/.ssh/config)

## Feature en cours
En tant qu'utilisateur, je peux voir où acheter en off-line les ingrédients dont j'ai besoin pour une recette donnée.
Statut : en cours de spécification BMAD.@AGENTS.md

## Context maintenance
`context.md` is the source of truth for BMAD agents.
Update it when: schema changes, new AI agent added, backlog status changes,
new gotcha identified, or architecture evolves.
Do NOT update it for bugfixes or style changes.

## Agent Instructions

After fixing any bug or resolving any non-obvious technical constraint,
update CLAUDE.md and project-context.md with a concise rule in the
"Critical Patterns" or "Anti-Patterns" section.
Format: `Always [rule]` or `Never [rule]` + one-line explanation of why.