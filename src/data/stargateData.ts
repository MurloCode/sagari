// ---------------------------------------------------------------
// UNIVERS STARGATE — chronologie crossover SG-1 × Atlantis × Universe
// (tronc commun établi par la communauté, fourni par Corentin).
//
// LEÇON IMPORTANTE : on n'écrit PAS 85 objets ContentSummary à la
// main. On stocke la chronologie comme une simple liste ordonnée de
// tuples compacts, et on GÉNÈRE les objets avec .map(). Avantages :
// zéro duplication, zéro erreur de numérotation (l'index du tableau
// EST l'ordre), et ajouter un épisode = insérer une ligne.
// ---------------------------------------------------------------
import type { ContentSummary } from "../types";

// Clé de série → infos d'affichage, priorité de l'ordre "parution",
// et couleur d'accent pour distinguer les séries dans la timeline
const SERIES = {
  sg1: { name: "Stargate SG-1", releaseGroup: 0, color: "#60a5fa" }, // bleu
  film: { name: "Film Stargate", releaseGroup: 1, color: "#e879f9" }, // fuchsia
  atl: { name: "Stargate Atlantis", releaseGroup: 2, color: "#2dd4bf" }, // turquoise
  uni: { name: "Stargate Universe", releaseGroup: 3, color: "#fb923c" }, // orange
} as const;

type SeriesKey = keyof typeof SERIES;

// Un tuple par entrée : [série, code, titre].
// L'ORDRE DU TABLEAU = l'ordre de visionnage conseillé. C'est tout.
const CROSSOVER_ORDER: Array<[SeriesKey, string, string]> = [
  // ---- AVANT le tronc commun : tout ce que la liste du forum
  // suppose déjà vu (film de 1994, SG-1 S1-S8, Atlantis S1) ----
  ["film", "porte", "Stargate, la Porte des Étoiles"],
  ["sg1", "S1", "Saison complète"],
  ["sg1", "S2", "Saison complète"],
  ["sg1", "S3", "Saison complète"],
  ["sg1", "S4", "Saison complète"],
  ["sg1", "S5", "Saison complète"],
  ["sg1", "S6", "Saison complète"],
  ["sg1", "S7", "Saison complète"],
  ["sg1", "S8", "Saison complète"],
  ["atl", "S1", "Saison complète"],
  // ---- TRONC COMMUN épisode par épisode (liste du forum) ----
  ["sg1", "09×01", "Le Trésor d'Avalon (1/2)"],
  ["atl", "02×01", "Le Siège (3/3)"],
  ["sg1", "09×02", "Le Trésor d'Avalon (2/2)"],
  ["sg1", "09×03", "Le Livre des Origines"],
  ["atl", "02×02", "I.A."],
  ["sg1", "09×04", "Ce Lien qui nous unit…"],
  ["atl", "02×03", "Chasse à l'Homme"],
  ["sg1", "09×05", "Prosélytisme"],
  ["atl", "02×04", "À Corps Perdu"],
  ["sg1", "09×06", "Le Piège"],
  ["atl", "02×05", "Les Condamnés"],
  ["sg1", "09×07", "Terre d'Asile"],
  ["atl", "02×06", "L'Expérience Interdite"],
  ["sg1", "09×08", "Pour l'Honneur"],
  ["atl", "02×07", "Instinct"],
  ["atl", "02×08", "Mutation"],
  ["sg1", "09×09", "Prototype"],
  ["atl", "02×09", "L'Aurore"],
  ["sg1", "09×10", "Le 4ème Cavalier de l'Apocalypse (1/2)"],
  ["sg1", "09×11", "Le 4ème Cavalier de l'Apocalypse (2/2)"],
  ["atl", "02×10", "L'Union fait la Force (1/2)"],
  ["atl", "02×11", "L'Union fait la Force (2/2)"],
  ["sg1", "09×12", "Dommage Collatéral"],
  ["atl", "02×12", "Tempus Fugit"],
  ["sg1", "09×13", "Effet Domino"],
  ["atl", "02×13", "Masse Critique"],
  ["sg1", "09×14", "Prise de Contrôle"],
  ["atl", "02×14", "L'Ivresse des Profondeurs"],
  ["sg1", "09×15", "Ingérence"],
  ["atl", "02×15", "La Tour"],
  ["sg1", "09×16", "Hors Limites"],
  ["atl", "02×16", "Possédés"],
  ["sg1", "09×17", "Le Châtiment"],
  ["atl", "02×17", "Coup d'État"],
  ["sg1", "09×18", "Le Manteau d'Arthur"],
  ["atl", "02×18", "Traitement de Choc"],
  ["atl", "02×19", "Inferno"],
  ["sg1", "09×19", "La Grande Croisade"],
  ["sg1", "09×20", "La Première Vague"],
  ["sg1", "10×01", "L'Oricy"],
  ["atl", "02×20", "Les Alliés"],
  ["atl", "03×01", "Menace sur la Terre"],
  ["atl", "03×02", "Transformation"],
  ["sg1", "10×02", "Dans les Bras de Morphée"],
  ["sg1", "10×03", "Chassé-Croisé"],
  ["atl", "03×03", "Irrésistible"],
  ["sg1", "10×04", "La Guerre des Clones"],
  ["atl", "03×04", "Face à Face"],
  ["sg1", "10×05", "La Créature"],
  ["atl", "03×05", "Copies Conformes"],
  ["atl", "03×06", "Le Monde Réel"],
  ["sg1", "10×06", "Wormhole X-Treme"],
  ["atl", "03×07", "Intérêts Communs"],
  ["sg1", "10×07", "La Riposte"],
  ["atl", "03×08", "La Guerre des Génies"],
  ["sg1", "10×08", "Amnésie"],
  ["atl", "03×09", "La Machine Infernale"],
  ["sg1", "10×09", "Aux Mains des Rebelles"],
  ["atl", "03×10", "Exil Forcé (1/2)"],
  ["atl", "03×11", "Exil Forcé (2/2)"],
  ["sg1", "10×10", "La Quête du Graal (1/2)"],
  ["sg1", "10×11", "La Quête du Graal (2/2)"],
  ["atl", "03×12", "Le Chant des Baleines"],
  ["sg1", "10×12", "La Grande Illusion"],
  ["atl", "03×13", "Invincible"],
  ["sg1", "10×13", "Dimension Parallèle"],
  ["atl", "03×14", "Le Péril de la Sagesse"],
  ["sg1", "10×14", "Question de Confiance"],
  ["atl", "03×15", "Les Jeux sont faits"],
  ["sg1", "10×15", "Morts ou Vifs"],
  ["atl", "03×16", "Âmes en détresse"],
  ["sg1", "10×16", "Prise d'Otages"],
  ["atl", "03×17", "Une Question d'éthique"],
  ["sg1", "10×17", "La Loi du Talion"],
  ["atl", "03×18", "Immersion"],
  ["sg1", "10×18", "Un Air de Famille"],
  ["atl", "03×19", "L'Équilibre Parfait"],
  ["sg1", "10×19", "La Symbiose du Mal"],
  ["sg1", "10×20", "Le Temps d'une Vie"],
  ["film", "arche", "L'Arche de Vérité"],
  ["atl", "03×20", "Nom de Code : Horizon"],
  ["atl", "S4", "Saison complète"],
  ["film", "continuum", "Stargate Continuum"],
  ["atl", "S5", "Saison complète"],
  ["uni", "S1", "Saison complète"],
  ["uni", "S2", "Saison complète"],
];

/**
 * Découpe un code d'épisode en NOMBRES.
 * "03×07" → { season: 3, episode: 7 }  (03 = saison, 07 = épisode)
 * "S4"    → { season: 4 }              (saison entière)
 * "arche" → {}                          (téléfilm : ni l'un ni l'autre)
 */
function parseCode(code: string): { season?: number; episode?: number } {
  const episodeMatch = code.match(/^(\d+)×(\d+)$/); // regex : "chiffres×chiffres"
  if (episodeMatch) {
    return { season: Number(episodeMatch[1]), episode: Number(episodeMatch[2]) };
  }
  const seasonMatch = code.match(/^S(\d+)$/);
  if (seasonMatch) {
    return { season: Number(seasonMatch[1]) };
  }
  return {};
}

/** Année de diffusion approximative, déduite de la saison */
function yearOf(key: SeriesKey, code: string): number {
  const table: Record<string, number> = {
    "sg1-S1": 1997,
    "sg1-S2": 1998,
    "sg1-S3": 1999,
    "sg1-S4": 2000,
    "sg1-S5": 2001,
    "sg1-S6": 2002,
    "sg1-S7": 2003,
    "sg1-S8": 2004,
    "sg1-09": 2005,
    "sg1-10": 2006,
    "atl-S1": 2004,
    "atl-02": 2005,
    "atl-03": 2006,
    "atl-S4": 2007,
    "atl-S5": 2008,
    "uni-S1": 2009,
    "uni-S2": 2010,
    "film-porte": 1994,
    "film-arche": 2008,
    "film-continuum": 2008,
  };
  return table[`${key}-${code.slice(0, 2)}`] ?? table[`${key}-${code}`] ?? 2005;
}

// ---- GÉNÉRATION des 85 ContentSummary à partir des tuples ----

// Ordre "parution" simplifié : série par série (regarder SG-1 en entier,
// puis les téléfilms, puis Atlantis, puis Universe). On compte la
// position de chaque entrée AU SEIN de sa série.
const releaseCounters: Record<SeriesKey, number> = {
  sg1: 0,
  film: 0,
  atl: 0,
  uni: 0,
};

// Exceptions à la règle de groupe : le film de 1994 est sorti AVANT
// tout le reste → clé de tri 0, devant les autres.
const RELEASE_OVERRIDES: Record<string, number> = {
  "film-porte": 0,
};

export const stargateSummaries: ContentSummary[] = CROSSOVER_ORDER.map(
  ([key, code, title], index) => {
    releaseCounters[key] += 1;
    const { season, episode } = parseCode(code);
    // id unique et stable : "sg1-09x01" (le × devient x)
    const id = `${key}-${code.replace("×", "x").toLowerCase()}`;
    return {
      id,
      sagaId: "stargate",
      // Le titre est désormais PUR : saison/épisode sont des champs
      // à part, l'affichage les formate comme il veut (S09E01…)
      title,
      year: yearOf(key, code),
      type: key === "film" ? "film" : "serie",
      series: SERIES[key].name,
      seriesColor: SERIES[key].color,
      season,
      episode,
      orders: {
        // groupe * 1000 + position interne → SG-1 avant Atlantis, etc.
        // (sauf exception : ?? = "si pas d'override, calcul normal")
        release:
          RELEASE_OVERRIDES[id] ??
          SERIES[key].releaseGroup * 1000 + releaseCounters[key],
        // L'index du tableau EST la chronologie du forum
        chronological: index + 1,
        recommended: index + 1,
      },
    };
  }
);
