// ---------------------------------------------------------------
// FAUSSE API — simule les 2 endpoints de la doc §7.1.
// Nouveaux endpoints pour le multi-sagas : liste des sagas,
// contenus d'UNE saga, et résumé d'un contenu précis.
// ---------------------------------------------------------------
import { sagas, summaries, details } from "../data/sagaData";
import { fetchTmdbDetails, hasTmdbKey } from "./tmdb";
import type { Saga, ContentSummary, ContentDetails } from "../types";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Liste des sagas disponibles (écran d'accueil). */
export async function fetchSagas(): Promise<Saga[]> {
  await delay(200);
  return sagas;
}

/** Une saga précise (nom, couleur, tri par défaut…). */
export async function fetchSaga(id: string): Promise<Saga | null> {
  await delay(150);
  return sagas.find((s) => s.id === id) ?? null;
}

/**
 * Endpoint NIVEAU 1 (léger) : tous les contenus d'UNE saga.
 * .filter() côté "serveur" : le client ne reçoit que ce qui le concerne.
 */
export async function fetchSagaSummaries(
  sagaId: string
): Promise<ContentSummary[]> {
  await delay(300);
  return summaries.filter((s) => s.sagaId === sagaId);
}

/** Résumé d'un seul contenu (utilisé par la fiche détail). */
export async function fetchContentSummary(
  id: string
): Promise<ContentSummary | null> {
  await delay(200);
  return summaries.find((s) => s.id === id) ?? null;
}

/**
 * Fausse authentification : accepte n'importe quel email avec un mot
 * de passe d'au moins 4 caractères. Avec Supabase, cette fonction
 * deviendra un vrai appel réseau — signature identique.
 */
export async function fakeLogin(
  email: string,
  password: string
): Promise<{ id: string; name: string; email: string }> {
  await delay(600);
  if (!email.includes("@")) {
    throw new Error("Adresse email invalide");
  }
  if (password.length < 4) {
    throw new Error("Mot de passe trop court (4 caractères minimum)");
  }
  return {
    id: email.toLowerCase(),
    name: email.split("@")[0],
    email,
  };
}

/**
 * Endpoint NIVEAU 2 (enrichissement) — ordre de priorité :
 *  1. fiche écrite à la main dans nos données (Star Wars, exemples…)
 *  2. TMDb, si la clé API est configurée (épisodes Stargate & co)
 *  3. fiche générique de repli — JAMAIS d'erreur bloquante (doc §7.2)
 * (La panne simulée des débuts a été retirée : le réseau réel de TMDb
 * fournit désormais de vraies conditions d'échec à gérer.)
 */
export async function fetchContentDetails(id: string): Promise<ContentDetails> {
  // 1. Fiche locale écrite à la main ?
  const local = details[id];
  if (local) {
    await delay(600); // latence simulée, comme avant
    return local;
  }

  // 2. TMDb — le try/catch protège : toute erreur (réseau coupé,
  // contenu introuvable, quota) bascule sur le repli au lieu de casser.
  const summary = summaries.find((s) => s.id === id);
  if (summary && hasTmdbKey) {
    try {
      return await fetchTmdbDetails(summary);
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
