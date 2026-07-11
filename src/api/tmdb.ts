// ---------------------------------------------------------------
// CLIENT TMDb — notre première VRAIE API externe !
// The Movie Database (themoviedb.org) fournit gratuitement synopsis,
// notes et images, en français, pour films / séries / épisodes.
//
// Principes appliqués ici :
//  1. La clé API vit dans un fichier .env (jamais dans le code, jamais
//     dans git). Vite expose au navigateur les variables préfixées
//     VITE_ via import.meta.env.
//  2. Un CACHE en mémoire évite de re-demander ce qu'on a déjà reçu
//     (doc §7.1 : "cache local des ressources déjà chargées").
//  3. Ce fichier ne connaît QUE TMDb : le reste de l'app passe par
//     fakeApi, qui décide quand l'appeler.
// ---------------------------------------------------------------
import type { ContentDetails, ContentSummary } from "../types";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY as string | undefined;
const BASE = "https://api.themoviedb.org/3";
// w500 = largeur 500px, suffisant pour nos fiches
const IMG = "https://image.tmdb.org/t/p/w500";

/** L'app peut vérifier si la clé est configurée avant d'appeler TMDb */
export const hasTmdbKey = Boolean(API_KEY);

/** GET générique vers TMDb : construit l'URL avec clé + langue FR */
async function tmdbGet<T>(
  path: string,
  params: Record<string, string> = {}
): Promise<T> {
  const url = new URL(BASE + path);
  url.searchParams.set("api_key", API_KEY ?? "");
  url.searchParams.set("language", "fr-FR");
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  const res = await fetch(url); // le vrai fetch(), enfin !
  if (!res.ok) {
    throw new Error(`TMDb a répondu ${res.status} sur ${path}`);
  }
  return res.json() as Promise<T>;
}

// ---- Caches en mémoire (des Map simples suffisent) ----
const seriesIdCache = new Map<string, number>();
const detailsCache = new Map<string, ContentDetails>();

/** Trouve l'id TMDb d'une série à partir de son nom (1 seule fois).
 *  Prend le PREMIER résultat de recherche — voir searchTmdb plus bas
 *  pour un choix manuel et sans ambiguïté depuis l'admin. */
async function resolveSeriesId(name: string): Promise<number> {
  const cached = seriesIdCache.get(name);
  if (cached !== undefined) return cached;

  const data = await tmdbGet<{ results: Array<{ id: number }> }>(
    "/search/tv",
    { query: name }
  );
  const id = data.results[0]?.id;
  if (!id) throw new Error(`Série introuvable sur TMDb : ${name}`);
  seriesIdCache.set(name, id);
  return id;
}

// Certains titres français de nos données ne matchent pas la recherche
// TMDb : table de correspondance id → requête qui fonctionne.
const FILM_QUERIES: Record<string, string> = {
  "film-porte": "Stargate",
  "film-arche": "Stargate: The Ark of Truth",
  "film-continuum": "Stargate: Continuum",
};

/** Détails d'un épisode précis (ou d'une saison entière si `episode`
 *  est absent) d'une série DONT ON CONNAÎT DÉJÀ l'id TMDb. */
async function fetchEpisodeOrSeason(
  tvId: number,
  season: number,
  episode?: number
): Promise<Omit<ContentDetails, "id">> {
  if (episode !== undefined) {
    const ep = await tmdbGet<{
      overview: string;
      vote_average: number;
      still_path: string | null;
    }>(`/tv/${tvId}/season/${season}/episode/${episode}`);
    return {
      synopsis: ep.overview || "Pas de synopsis français disponible.",
      rating: ep.vote_average ? Math.round(ep.vote_average * 10) / 10 : null,
      posterColor: "#334155",
      posterUrl: ep.still_path ? IMG + ep.still_path : undefined,
      platforms: [],
    };
  }
  const s = await tmdbGet<{ overview: string; poster_path: string | null }>(
    `/tv/${tvId}/season/${season}`
  );
  return {
    synopsis: s.overview || `Intégrale de la saison ${season}.`,
    rating: null,
    posterColor: "#334155",
    posterUrl: s.poster_path ? IMG + s.poster_path : undefined,
    platforms: [],
  };
}

/**
 * Enrichit un contenu via TMDb, selon sa nature :
 *  - épisode  → /tv/{id}/season/{s}/episode/{e}
 *  - saison   → /tv/{id}/season/{s}
 *  - film     → /search/movie
 * Recherche AUTOMATIQUE (premier résultat) : c'est le chemin emprunté
 * par la fiche publique quand rien n'a été enrichi à la main dans
 * l'admin. Voir searchTmdb + fetchTmdbDetailsById pour un choix manuel.
 */
export async function fetchTmdbDetails(
  summary: Pick<ContentSummary, "id" | "title" | "series" | "season" | "episode">
): Promise<ContentDetails> {
  // Cache d'abord : déjà vu → réponse immédiate, zéro réseau
  const cached = detailsCache.get(summary.id);
  if (cached) return cached;

  let details: Omit<ContentDetails, "id">;

  if (summary.series && summary.season !== undefined) {
    const tvId = await resolveSeriesId(summary.series);
    details = await fetchEpisodeOrSeason(tvId, summary.season, summary.episode);
  } else {
    // ---- UN FILM ----
    const query = FILM_QUERIES[summary.id] ?? summary.title;
    const data = await tmdbGet<{
      results: Array<{
        overview: string;
        vote_average: number;
        poster_path: string | null;
      }>;
    }>("/search/movie", { query });

    const movie = data.results[0];
    if (!movie) throw new Error(`Film introuvable sur TMDb : ${query}`);

    details = {
      synopsis: movie.overview || "Pas de synopsis français disponible.",
      rating: movie.vote_average
        ? Math.round(movie.vote_average * 10) / 10
        : null,
      posterColor: "#334155",
      posterUrl: movie.poster_path ? IMG + movie.poster_path : undefined,
      platforms: [],
    };
  }

  const full: ContentDetails = { id: summary.id, ...details };
  detailsCache.set(summary.id, full);
  return full;
}

// ---------------------------------------------------------------
// RECHERCHE MANUELLE (interface d'admin) — plutôt que de deviner via
// le premier résultat d'une recherche par titre (source d'erreurs en
// cas d'homonymie), l'admin choisit LUI-MÊME le bon résultat parmi
// plusieurs candidats affichés (titre + année + affiche). Une fois
// choisi, l'id TMDb est connu avec certitude pour ce contenu.
// ---------------------------------------------------------------

export interface TmdbSearchResult {
  tmdbId: number;
  title: string;
  year: number | null;
  posterUrl: string | null;
  overview: string;
  rating: number | null;
}

interface TmdbRawResult {
  id: number;
  title?: string; // présent pour un film
  name?: string; // présent pour une série
  release_date?: string; // présent pour un film
  first_air_date?: string; // présent pour une série
  overview: string;
  vote_average: number;
  poster_path: string | null;
}

function toSearchResult(kind: "movie" | "tv", raw: TmdbRawResult): TmdbSearchResult {
  const dateStr = kind === "movie" ? raw.release_date : raw.first_air_date;
  return {
    tmdbId: raw.id,
    title: (kind === "movie" ? raw.title : raw.name) ?? "",
    year: dateStr ? Number(dateStr.slice(0, 4)) : null,
    posterUrl: raw.poster_path ? IMG + raw.poster_path : null,
    overview: raw.overview || "",
    rating: raw.vote_average ? Math.round(raw.vote_average * 10) / 10 : null,
  };
}

/** Recherche TMDb par mot-clé — jusqu'à 6 résultats, à faire choisir à
 *  l'utilisateur (voir AdminContentFormPage.tsx). */
export async function searchTmdb(
  query: string,
  kind: "movie" | "tv"
): Promise<TmdbSearchResult[]> {
  const path = kind === "movie" ? "/search/movie" : "/search/tv";
  const data = await tmdbGet<{ results: TmdbRawResult[] }>(path, { query });
  return data.results.slice(0, 6).map((r) => toSearchResult(kind, r));
}

/**
 * Détails pour un résultat CONFIRMÉ par l'utilisateur (id TMDb connu —
 * aucune recherche par nom, donc aucune ambiguïté). `season`/`episode`
 * optionnels : pour un film ou une série sans saison précisée, les
 * infos déjà présentes dans le résultat de recherche suffisent
 * (overview/affiche/note y sont déjà inclus, zéro appel réseau de plus).
 */
export async function fetchTmdbDetailsById(
  kind: "movie" | "tv",
  fallback: TmdbSearchResult,
  season?: number,
  episode?: number
): Promise<Omit<ContentDetails, "id">> {
  if (kind === "tv" && season !== undefined) {
    return fetchEpisodeOrSeason(fallback.tmdbId, season, episode);
  }
  return {
    synopsis: fallback.overview || "Pas de synopsis français disponible.",
    rating: fallback.rating,
    posterColor: "#334155",
    posterUrl: fallback.posterUrl ?? undefined,
    platforms: [],
  };
}
