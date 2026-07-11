// ---------------------------------------------------------------
// API — parle à Supabase (tables sagas/contents, cf. supabase/schema.sql).
// Le nom "fakeApi" reste par habitude de lecture du code (voir
// CLAUDE.md) mais ce n'est plus une fausse API : les données viennent
// vraiment de la base.
// ---------------------------------------------------------------
import { supabase } from "./supabaseClient";
import { fetchTmdbDetails, hasTmdbKey } from "./tmdb";
import type { Saga, ContentSummary, ContentDetails, MediaType, SortMode } from "../types";

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

// ---------------------------------------------------------------
// ÉCRITURE (interface d'admin) — au-delà de ce point, tout exige un
// utilisateur connecté (policies RLS : voir supabase/schema.sql).
// ---------------------------------------------------------------

/** Traduit une erreur Postgres brute en message compréhensible. Code
 *  23505 = violation de contrainte UNIQUE (id déjà pris). */
function toFriendlyError(error: { code?: string; message: string }): Error {
  if (error.code === "23505") {
    return new Error("Cet identifiant existe déjà — choisis-en un autre.");
  }
  return new Error(error.message);
}

export interface SagaInput {
  id: string;
  name: string;
  description: string;
  color: string;
  defaultSort: SortMode | null;
}

function sagaColumns(input: Omit<SagaInput, "id">) {
  return {
    name: input.name,
    description: input.description,
    color: input.color,
    default_sort: input.defaultSort,
  };
}

export async function createSaga(input: SagaInput): Promise<void> {
  const { error } = await supabase
    .from("sagas")
    .insert({ id: input.id, ...sagaColumns(input) });
  if (error) throw toFriendlyError(error);
}

export async function updateSaga(
  id: string,
  input: Omit<SagaInput, "id">
): Promise<void> {
  const { error } = await supabase.from("sagas").update(sagaColumns(input)).eq("id", id);
  if (error) throw toFriendlyError(error);
}

/** Supprime la saga ET tout son contenu (cascade en base, cf. schema.sql).
 *  IRRÉVERSIBLE : l'appelant doit confirmer avant d'appeler ceci. */
export async function deleteSaga(id: string): Promise<void> {
  const { error } = await supabase.from("sagas").delete().eq("id", id);
  if (error) throw error;
}

/** Nombre de contenus par saga (liste des sagas de l'admin). */
export async function fetchContentCounts(): Promise<Record<string, number>> {
  const { data, error } = await supabase.from("contents").select("saga_id");
  if (error) throw error;
  const counts: Record<string, number> = {};
  for (const row of data) {
    counts[row.saga_id] = (counts[row.saga_id] ?? 0) + 1;
  }
  return counts;
}

/**
 * Forme "à plat" d'un contenu utilisée par l'admin : fusionne
 * ContentSummary + ContentDetails (une seule ligne en base, cf.
 * supabase/schema.sql), avec des `null` explicites plutôt que des
 * `undefined` — plus pratique pour des champs de formulaire contrôlés.
 */
export interface ContentInput {
  id: string;
  sagaId: string;
  title: string;
  year: number;
  type: MediaType;
  series: string | null;
  season: number | null;
  episode: number | null;
  seriesColor: string | null;
  orders: { release: number; chronological: number; recommended: number };
  synopsis: string | null;
  rating: number | null;
  posterColor: string;
  posterUrl: string | null;
  platforms: string[];
}

/**
 * Lecture BRUTE d'un contenu pour le formulaire d'édition admin — à ne
 * JAMAIS remplacer par fetchContentDetails, qui elle applique la
 * priorité DB → TMDb → repli générique. Pré-remplir un formulaire avec
 * du texte TMDb ou de repli, puis l'enregistrer tel quel, écrirait ce
 * texte fabriqué dans la base et casserait la détection "pas encore
 * enrichi" (qui teste synopsis IS NULL).
 */
export async function fetchContentForAdmin(id: string): Promise<ContentInput | null> {
  const { data, error } = await supabase.from("contents").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    id: data.id,
    sagaId: data.saga_id,
    title: data.title,
    year: data.year,
    type: data.type,
    series: data.series,
    season: data.season,
    episode: data.episode,
    seriesColor: data.series_color,
    orders: data.orders,
    synopsis: data.synopsis,
    rating: data.rating,
    posterColor: data.poster_color,
    posterUrl: data.poster_url,
    platforms: data.platforms ?? [],
  };
}

function contentColumns(input: Omit<ContentInput, "id" | "sagaId">) {
  return {
    title: input.title,
    year: input.year,
    type: input.type,
    series: input.series,
    season: input.season,
    episode: input.episode,
    series_color: input.seriesColor,
    orders: input.orders,
    synopsis: input.synopsis,
    rating: input.rating,
    // NOT NULL en base (défaut "#334155") : jamais de chaîne vide.
    poster_color: input.posterColor || "#334155",
    poster_url: input.posterUrl,
    platforms: input.platforms,
  };
}

export async function createContent(input: ContentInput): Promise<void> {
  const { error } = await supabase.from("contents").insert({
    id: input.id,
    saga_id: input.sagaId,
    ...contentColumns(input),
  });
  if (error) throw toFriendlyError(error);
}

/** sagaId n'est volontairement PAS modifiable ici : le formulaire admin
 *  ne propose pas de déplacer un contenu d'une saga à une autre. */
export async function updateContent(
  id: string,
  input: Omit<ContentInput, "id" | "sagaId">
): Promise<void> {
  const { error } = await supabase.from("contents").update(contentColumns(input)).eq("id", id);
  if (error) throw toFriendlyError(error);
}

/** Supprime aussi la progression des utilisateurs sur ce contenu
 *  (cascade en base). IRRÉVERSIBLE : à confirmer avant d'appeler ceci. */
export async function deleteContent(id: string): Promise<void> {
  const { error } = await supabase.from("contents").delete().eq("id", id);
  if (error) throw error;
}
