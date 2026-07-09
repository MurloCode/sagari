# Sagari — contexte du projet pour Claude

## Qui est l'utilisateur

Corentin, développeur React **junior** qui apprend en pratiquant. Règles de collaboration :

- Répondre **en français**, expliquer les concepts au fur et à mesure (le "pourquoi", pas juste le "comment")
- Commenter le code en français, façon pédagogique (voir les fichiers existants pour le style)
- Il code peu lui-même pour l'instant : il préfère que Claude code puis explique
- Ses messages viennent souvent de dictée vocale → reformuler pour valider la compréhension si c'est ambigu

## Le produit

Sagari (cahier de bord v0.4) : plateforme de chronologies de visionnage multi-médias.
La promesse : **"dans quel ordre regarder ta saga ?"** — films, séries (granularité épisode),
livres, plus tard BD/comics/jeux vidéo. Mobile-first. Domaine : sagari.io.

Concepts clés du produit :

- 3 tris : conseillé (défaut global, la promesse du site), histoire, parution ; `defaultSort` optionnel par saga
- Timeline "ligne de vie" : verticale mobile / horizontale desktop (molette → scroll, scrollbar masquée)
- Points ambrés = contenu masqué par le filtre de types ; popover pour "épingler" (afficher quand même)
- Blocs : suites consécutives ≥ 3 épisodes d'une même série regroupées ; modale accordéon saisons → épisodes, cochage individuel ou par saison
- Checklist "vu / à voir" réservée aux inscrits (invités redirigés vers /login), progression par utilisateur
- Chargement 2 niveaux (doc §7.1) : données critiques d'abord, enrichissement ensuite, repli gracieux

## Stack et architecture

Vite + React 19 + TypeScript strict + Tailwind v4 (plugin Vite) + react-router-dom v6.
Pas de state manager (useState + hooks custom suffisent à cette taille).

```
src/
  types.ts            ← COMMENCER ICI pour toute évolution (le contrat)
  mediaConfig.ts      source unique de vérité types de médias (label/icône/couleurs)
  data/sagaData.ts    sagas + contenus + fiches enrichies (mock)
  data/stargateData.ts 281 entrées GÉNÉRÉES depuis des tuples (l'index = l'ordre)
  api/fakeApi.ts      fausse API (latence simulée) — SEUL fichier à changer pour Supabase/TMDb
  auth/AuthContext.tsx Context React, faux login (email + mdp ≥ 4 car.)
  hooks/useWatched.ts  checklist par utilisateur, localStorage
  utils/format.ts      formatEpisodeCode etc.
  components/          Header, Timeline (le gros morceau), ContentCard, SortSelector,
                       MediaTypeFilter, DemoTimeline (landing)
  pages/               HomePage (landing), SagaPage (état central), DetailPage, LoginPage
```

Conventions établies (à respecter) :

- Clé de tri ≠ numéro affiché (`orders[mode]` sert à trier ; `position` = index+1 après tri)
- Jamais de classes Tailwind construites dynamiquement ; couleur issue des données → style inline
- Données dérivées calculées (useMemo), pas stockées en state
- Immutabilité stricte des Set/objets de state
- saison/épisode = champs numériques (`season`, `episode`), jamais dans le titre

## État : mock + TMDb branché (aucun backend)

`npm run dev` → http://localhost:5173. Vérifier avec `npm run build` (tsc strict).

TMDb fonctionne (clé dans `.env`, non versionnée) : `src/api/tmdb.ts` enrichit
épisodes/saisons/films à la volée, avec cache mémoire et repli gracieux.
Les fiches écrites à la main dans `sagaData.ts` gardent la priorité sur TMDb.
Note : la clé est visible côté navigateur (normal en front pur) — on la
déplacera derrière Supabase (Edge Function) quand le backend arrivera.

## Feuille de route (ordre suggéré)

1. ~~**TMDb**~~ ✅ fait (vérifié le 09/07/2026 : épisodes SG-1/Atlantis, saisons Universe, films)
2. **Supabase** : vraie auth + progression en base (ne toucher que fakeApi/AuthContext/useWatched)
3. **Interface d'admin** : gérer sagas/contenus/defaultSort à la main (Corentin y tient)
4. Bouton "Reprendre" (premier non-vu), virtualisation si listes longues (doc §7.3)
5. Chronologies personnalisées drag & drop (dnd-kit) + partage communautaire (long terme)
