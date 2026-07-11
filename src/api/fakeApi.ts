// ---------------------------------------------------------------
// API — parle à Supabase (tables sagas/contents, cf. supabase/schema.sql).
// Le nom "fakeApi" reste par habitude de lecture du code (voir
// CLAUDE.md) mais ce n'est plus une fausse API : les données viennent
// vraiment de la base.
// ---------------------------------------------------------------
import { supabase } from "./supabaseClient";
import { fetchTmdbDetails, hasTmdbKey } from "./tmdb";
import type { Saga, ContentSummary, ContentDetails } from "../types";

function toSaga(row: any): Saga {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    color: row.color,
    defaultSort: row.default_sort ?? undefined,
  };
}

function toSummary(row: any): ContentSummary {
  return {
    id: row.id,
    sagaId: row.saga_id,
    title: row.title,
    year: row.year,
    type: row.type,
    series: row.series ?? undefined,
    season: row.season ?? undefined,
    episode: row.episode ?? undefined,
    seriesColor: row.series_color ?? undefined,
    orders: row.orders,
  };
}

const SUMMARY_COLUMNS =
  "id, saga_id, title, year, type, series, season, episode, series_color, orders";

/** Liste des sagas disponibles (écran d'accueil). */
export async function fetchSagas(): Promise<Saga[]> {
  const { data, error } = await supabase.from("sagas").select("*");
  if (error) throw error;
  return data.map(toSaga);
}

/** Une saga précise (nom, couleur, tri par défaut…). */
export async function fetchSaga(id: string): Promise<Saga | null> {
  const { data, error } = await supabase
    .from("sagas")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? toSaga(data) : null;
}

/**
 * Endpoint NIVEAU 1 (léger) : tous les contenus d'UNE saga.
 * On ne sélectionne QUE les colonnes résumé — synopsis/rating/poster
 * restent en base, chargés seulement par fetchContentDetails.
 */
export async function fetchSagaSummaries(
  sagaId: string
): Promise<ContentSummary[]> {
  const { data, error } = await supabase
    .from("contents")
    .select(SUMMARY_COLUMNS)
    .eq("saga_id", sagaId);
  if (error) throw error;
  return data.map(toSummary);
}

/** Résumé d'un seul contenu (utilisé par la fiche détail). */
export async function fetchContentSummary(
  id: string
): Promise<ContentSummary | null> {
  const { data, error } = await supabase
    .from("contents")
    .select(SUMMARY_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? toSummary(data) : null;
}

/**
 * Endpoint NIVEAU 2 (enrichissement) — ordre de priorité :
 *  1. fiche déjà enrichie en base (écrite à la main ou pré-remplie)
 *  2. TMDb, si la clé API est configurée (épisodes Stargate & co)
 *  3. fiche générique de repli — JAMAIS d'erreur bloquante (doc §7.2)
 */
export async function fetchContentDetails(id: string): Promise<ContentDetails> {
  const { data: row, error } = await supabase
    .from("contents")
    .select(
      "id, title, series, season, episode, synopsis, rating, poster_color, poster_url, platforms"
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;

  // 1. Fiche déjà enrichie en base ?
  if (row?.synopsis) {
    return {
      id: row.id,
      synopsis: row.synopsis,
      rating: row.rating,
      posterColor: row.poster_color,
      posterUrl: row.poster_url ?? undefined,
      platforms: row.platforms ?? [],
    };
  }

  // 2. TMDb — le try/catch protège : toute erreur (réseau coupé,
  // contenu introuvable, quota) bascule sur le repli au lieu de casser.
  if (row && hasTmdbKey) {
    try {
      return await fetchTmdbDetails(row);
    } catch (err) {
      console.warn("Enrichissement TMDb impossible :", err);
    }
  }

  // 3. Repli générique
  return {
    id,
    synopsis: hasTmdbKey
      ? "Détails momentanément indisponibles pour ce contenu."
      : "Synopsis à venir — ajoute une clé TMDb dans le fichier .env pour enrichir automatiquement cette fiche (voir README).",
    rating: null,
    posterColor: "#334155",
    platforms: [],
  };
}
