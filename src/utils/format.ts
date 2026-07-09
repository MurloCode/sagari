// Petites fonctions d'affichage réutilisables ("utilitaires").
// Les garder hors des composants = testables et partageables.

/** 3, 7 → "S03E07" ; 4, undefined → "Saison 4" ; rien → "" */
export function formatEpisodeCode(
  season?: number,
  episode?: number
): string {
  if (season === undefined) return "";
  if (episode === undefined) return `Saison ${season}`;
  // padStart(2, "0") : "7" → "07", pour un alignement propre
  const s = String(season).padStart(2, "0");
  const e = String(episode).padStart(2, "0");
  return `S${s}E${e}`;
}
