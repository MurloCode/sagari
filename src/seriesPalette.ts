// ---------------------------------------------------------------
// PALETTE PARTAGÉE pour distinguer les SOUS-SÉRIES au sein d'une
// même saga (ex: SG-1 / Atlantis / Universe dans Stargate, ou plus
// tard Clone Wars / Mandalorian / Ahsoka dans Star Wars).
//
// À ne pas confondre avec mediaConfig.ts : ici on distingue "quelle
// série", là-bas "quel type de média" (film/série/livre…) — deux
// systèmes de couleur INDÉPENDANTS mais qui se croisent visuellement
// dans l'UI. Les teintes ci-dessous excluent donc volontairement
// celles déjà prises par MEDIA_CONFIG (cyan, fuchsia, émeraude,
// violet, rose, sky, lime) et par l'ambre (contenu épinglé/masqué) —
// sinon on retombe dans le même piège que "Film Stargate" en fuchsia.
//
// Utilisation : assigner SERIES_PALETTE[0], [1], [2]... aux séries
// d'une saga dans l'ordre où elles apparaissent (voir stargateData.ts).
// ---------------------------------------------------------------
export const SERIES_PALETTE: string[] = [
  "#60a5fa", // bleu
  "#f87171", // rouge
  "#2dd4bf", // turquoise
  "#fb923c", // orange
  "#c084fc", // violet clair (distinct du violet de serie-animee, plus pâle)
  "#facc15", // jaune
  "#f472b6", // rose bonbon (distinct du rose de bd, plus vif)
  "#4ade80", // vert
  "#818cf8", // indigo
];

/** Couleur à assigner à la N-ième série d'une saga (boucle si une
 *  saga a plus de séries que de couleurs dans la palette). */
export function seriesColorAt(index: number): string {
  return SERIES_PALETTE[index % SERIES_PALETTE.length];
}
