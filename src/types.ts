// ---------------------------------------------------------------
// Les TYPES : le contrat de données de toute l'application.
// On commence TOUJOURS par ici quand on ajoute une fonctionnalité :
// TypeScript signale ensuite en rouge tous les endroits à adapter.
// ---------------------------------------------------------------

/** Les types de médias gérés. En ajouter un ici suffit à le faire
 *  exister partout — TS montrera où le gérer (ex: mediaConfig.ts). */
export type MediaType =
  | "film"
  | "serie"
  | "serie-animee"
  | "livre"
  | "bd"
  | "comics"
  | "jeu-video";

/** Une saga / un univers narratif (Star Wars, Le Seigneur des Anneaux…) */
export interface Saga {
  id: string;
  name: string;
  description: string;
  color: string; // couleur d'accent de la carte saga
  /** Tri proposé par défaut pour CETTE saga (réglé à la main, plus tard
   *  via l'interface d'admin). Absent → tri global par défaut (parution). */
  defaultSort?: SortMode;
}

/**
 * NIVEAU 1 — Données critiques (cf. cahier de bord §7.1).
 * `sagaId` relie le contenu à sa saga (comme une clé étrangère en BDD) :
 * l'endpoint léger reste plat et simple, on ne charge jamais une saga
 * entière imbriquée.
 */
export interface ContentSummary {
  id: string;
  sagaId: string;
  title: string;
  year: number;
  type: MediaType;
  /** Pour un ÉPISODE : nom de la série d'appartenance (granularité
   *  épisode = nécessaire aux crossovers entre séries d'un univers).
   *  Le `?` = champ optionnel : les films/livres n'en ont pas. */
  series?: string;
  /** Numéro de saison (ex: 3 pour "03×07"). En NOMBRE, pas en texte :
   *  on pourra trier et filtrer dessus. */
  season?: number;
  /** Numéro d'épisode (ex: 7 pour "03×07"). Absent pour une saison
   *  entière (ex: "Atlantis Saison 4 intégrale"). */
  episode?: number;
  /** Couleur d'accent de la série (hexadécimal), pour distinguer
   *  visuellement SG-1 / Atlantis / Universe dans une même timeline. */
  seriesColor?: string;
  /** Position de l'œuvre dans chaque chronologie (au sein de sa saga) */
  orders: {
    release: number; // ordre de parution
    chronological: number; // ordre de l'histoire
    recommended: number; // ordre conseillé
  };
}

/** NIVEAU 2 — Données d'enrichissement, chargées en second plan. */
export interface ContentDetails {
  id: string;
  synopsis: string;
  rating: number | null; // null = pas encore de note (fiche non enrichie)
  posterColor: string; // couleur de repli si pas d'image
  /** Vraie image (TMDb) : jaquette de film ou photo d'épisode */
  posterUrl?: string;
  platforms: string[]; // où regarder / lire le contenu
}

/** Les 3 modes de tri — mêmes clés que ContentSummary.orders.
 *  (Déclaré AVANT Saga qui l'utilise ? Pas grave : les types n'ont pas
 *  d'ordre d'exécution, TS lit tout le fichier.) */
export type SortMode = keyof ContentSummary["orders"];

/**
 * Entrée de la timeline : UNION DISCRIMINÉE, un pattern TS très puissant.
 * Le champ `kind` permet à TS de savoir quels autres champs existent :
 * dans un `if (entry.kind === "gap")`, TS sait que `hidden` est présent.
 */
export type TimelineEntry =
  | {
      kind: "item";
      content: ContentSummary;
      /** Position AFFICHÉE (1, 2, 3…) dans la chronologie active.
       *  ≠ orders[sortMode], qui est une CLÉ DE TRI interne et peut
       *  contenir des valeurs arbitraires (1001, 2001…). */
      position: number;
      /** true si affiché via la checkbox d'un point (donc "épinglé",
       *  car son type de média est normalement filtré) */
      isForced?: boolean;
    }
  | { kind: "gap"; hidden: ContentSummary[] };
