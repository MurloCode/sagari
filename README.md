# Sagari — v0.1

Plateforme de découverte et de gestion de contenus multimédias (voir le cahier de bord).
Cette première version couvre le MVP : **liste triable par chronologie**, **checklist de visionnage** et **fiche contenu** avec chargement à 2 niveaux.

## Démarrer

```bash
npm install     # une seule fois : télécharge les dépendances dans node_modules/
npm run dev     # lance le serveur de développement → http://localhost:5173
```

Autres commandes : `npm run build` (version de production dans `dist/`), `npm run preview` (teste le build).

## Enrichissement TMDb (synopsis, notes, images)

Les fiches des épisodes/films sont remplies automatiquement via l'API
[The Movie Database](https://www.themoviedb.org). Pour l'activer :

1. Crée un compte gratuit sur themoviedb.org
2. Va dans Paramètres → API et demande une clé (usage personnel/développeur)
3. Copie `.env.example` en `.env` et colle ta clé : `VITE_TMDB_API_KEY=ta_clé`
4. Relance `npm run dev` (les variables d'environnement sont lues au démarrage)

Sans clé, l'app fonctionne normalement avec des fiches "Synopsis à venir".

## Structure du projet

```
index.html            page unique, React s'injecte dans <div id="root">
vite.config.ts        config de l'outil de build (plugins React + Tailwind)
src/
  main.tsx            point d'entrée : branche React sur le DOM
  App.tsx             composant racine : header + routes
  types.ts            les formes de données (le "contrat" TypeScript)
  data/sagaData.ts    données d'exemple (Star Wars)
  api/fakeApi.ts      fausse API : simule les 2 endpoints de la doc §7.1
  hooks/useWatched.ts checklist + persistance localStorage (custom hook)
  components/         composants réutilisables "bêtes" (props in, JSX out)
  pages/              un composant par écran (Home = liste, Detail = fiche)
```

## Pourquoi ces choix

- **Vite** : le standard actuel pour créer un projet React (CRA est abandonné). Serveur de dev instantané.
- **TypeScript** : les erreurs de données se voient dans l'éditeur, pas en production. Regarde `src/types.ts` en premier : tout le reste en découle.
- **Tailwind v4** : styles écrits en classes utilitaires dans le JSX. Mobile-first natif : les classes sans préfixe ciblent le mobile, `sm:` et plus s'ajoutent pour les grands écrans — exactement l'approche de la doc §4.1.
- **fakeApi** : les composants ne savent pas que les données sont fausses. Le jour du vrai backend, seul `fakeApi.ts` change.
- **Pas de Redux/Zustand** : à cette taille, `useState` + un custom hook suffisent. On ajoutera un vrai state manager quand le besoin se fera sentir (pas avant).

## Concepts React à repérer dans le code

Chaque fichier contient des commentaires détaillés. Dans l'ordre de lecture conseillé :

1. `types.ts` — interfaces et unions de littéraux
2. `App.tsx` — routing (URL → composant)
3. `HomePage.tsx` — useState, useEffect, données dérivées avec useMemo
4. `SortSelector.tsx` — composant contrôlé, "lifting state up"
5. `ContentCard.tsx` — composant de présentation, props typées
6. `useWatched.ts` — custom hook, immutabilité du state, localStorage
7. `DetailPage.tsx` — useParams, chargements parallèles, skeleton, contenu de repli

## Feuille de route (fonctionnalités décidées, à venir)

- **Authentification réelle** : remplacer fakeLogin par Supabase (auth + PostgreSQL)
- **Chronologies personnalisées** (inscrits) : créer sa propre timeline en réordonnant
  les contenus par glisser-déposer (librairie pressentie : dnd-kit)
- **Ajout de contenu** par l'utilisateur dans sa chronologie personnalisée
- **Granularité épisode** : descendre au niveau épisode pour gérer les crossovers
  entre séries d'un même univers (ex. Arrowverse)
- **Partage communautaire** des chronologies personnalisées + modération (long terme, doc §7.3)

## Exercices pour la suite (par difficulté)

1. Ajouter un bouton "tout marquer comme vu" sur la HomePage
2. Ajouter un filtre "masquer les contenus vus"
3. Afficher le titre du contenu suivant à regarder selon le tri actif
4. Ajouter une 2ᵉ saga et un écran de choix de saga (nouvelle route `/saga/:id`)
5. Recherche avec debounce (doc §7.3 MVP)
6. Remplacer fakeApi par l'API TMDb (vraies jaquettes !)
