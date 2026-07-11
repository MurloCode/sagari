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

/** Trouve l'id TMDb d'une série à partir de son nom (1 seule fois). */
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

/**
 * Enrichit un contenu via TMDb, selon sa nature :
 *  - épisode  → /tv/{id}/season/{s}/episode/{e}
 *  - saison   → /tv/{id}/season/{s}
 *  - film     → /search/movie
 */
export async function fetchTmdbDetails(
  summary: Pick<ContentSummary, "id" | "title" | "series" | "season" | "episode">
): Promise<ContentDetails> {
  // Cache d'abord : déjà vu → réponse immédiate, zéro réseau
  const cached = detailsCache.get(summary.id);
  if (cached) return cached;

  let details: ContentDetails;

  if (summary.series && summary.season !== undefined) {
    const tvId = await resolveSeriesId(summary.series);

    if (summary.episode !== undefined) {
      // ---- UN ÉPISODE PRÉCIS ----
      const ep = await tmdbGet<{
        overview: string;
        vote_average: number;
        still_path: string | null;
      }>(`/tv/${tvId}/season/${summary.season}/episode/${summary.episode}`);

      details = {
        id: summary.id,
        synopsis: ep.overview || "Pas de synopsis français disponible.",
        rating: ep.vote_average ? Math.round(ep.vote_average * 10) / 10 : null,
        posterColor: "#334155",
        posterUrl: ep.still_path ? IMG + ep.still_path : undefined,
        platforms: [],
      };
    } else {
      // ---- UNE SAISON ENTIÈRE ----
      const season = await tmdbGet<{
        overview: string;
        poster_path: string | null;
      }>(`/tv/${tvId}/season/${summary.season}`);

      details = {
        id: summary.id,
        synopsis:
          season.overview ||
          `Intégrale de la saison ${summary.season} de ${summary.series}.`,
        rating: null,
        posterColor: "#334155",
        posterUrl: season.poster_path ? IMG + season.poster_path : undefined,
        platforms: [],
      };
    }
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
      id: summary.id,
      synopsis: movie.overview || "Pas de synopsis français disponible.",
      rating: movie.vote_average
        ? Math.round(movie.vote_average * 10) / 10
        : null,
      posterColor: "#334155",
      posterUrl: movie.poster_path ? IMG + movie.poster_path : undefined,
      platforms: [],
    };
  }

  detailsCache.set(summary.id, details);
  return details;
}
