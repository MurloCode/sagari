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
  // ---- Saisons 1 à 8 de SG-1 + saison 1 d'Atlantis, épisode par
  // épisode (au lieu d'un simple bloc "Saison complète") : la modale
  // de bloc peut ainsi les déplier comme le tronc commun ci-dessous ----
  ["sg1", "01×01", "Enfants des dieux (1/2)"],
  ["sg1", "01×02", "Enfants des dieux (2/2)"],
  ["sg1", "01×03", "L’Ennemi intérieur"],
  ["sg1", "01×04", "Émancipation"],
  ["sg1", "01×05", "La Théorie de Broca"],
  ["sg1", "01×06", "Le Premier Commandement"],
  ["sg1", "01×07", "Double"],
  ["sg1", "01×08", "Les Nox"],
  ["sg1", "01×09", "Les Désignés"],
  ["sg1", "01×10", "Le Marteau de Thor"],
  ["sg1", "01×11", "Le Supplice de Tantale"],
  ["sg1", "01×12", "Retour sur Chulak"],
  ["sg1", "01×13", "Le Feu et l’Eau"],
  ["sg1", "01×14", "Hathor"],
  ["sg1", "01×15", "Cassandra"],
  ["sg1", "01×16", "Le Procès"],
  ["sg1", "01×17", "Les Réfugiés"],
  ["sg1", "01×18", "Portés disparus"],
  ["sg1", "01×19", "Les Doubles robotiques"],
  ["sg1", "01×20", "Une dimension trop réelle"],
  ["sg1", "01×21", "Décision politique"],
  ["sg1", "01×22", "Dans le nid du serpent"],
  ["sg1", "02×01", "La Morsure du serpent"],
  ["sg1", "02×02", "La Tête à l’envers"],
  ["sg1", "02×03", "Perpétuité"],
  ["sg1", "02×04", "Le Maître du jeu"],
  ["sg1", "02×05", "La Princesse Shyla"],
  ["sg1", "02×06", "L’Œil de pierre"],
  ["sg1", "02×07", "Message dans une bouteille"],
  ["sg1", "02×08", "Conseil de famille"],
  ["sg1", "02×09", "Secrets"],
  ["sg1", "02×10", "Le Fléau"],
  ["sg1", "02×11", "La Tok’ra (1/2)"],
  ["sg1", "02×12", "La Tok’ra (2/2)"],
  ["sg1", "02×13", "Les Esprits"],
  ["sg1", "02×14", "La Clef de voûte"],
  ["sg1", "02×15", "La Cinquième Race"],
  ["sg1", "02×16", "Une question de temps"],
  ["sg1", "02×17", "Transfert"],
  ["sg1", "02×18", "La Colère des dieux"],
  ["sg1", "02×19", "Le Faux Pas"],
  ["sg1", "02×20", "L’Ennemi invisible"],
  ["sg1", "02×21", "1969"],
  ["sg1", "02×22", "Après un long sommeil"],
  ["sg1", "03×01", "Dans l’antre des Goa’uld"],
  ["sg1", "03×02", "Seth"],
  ["sg1", "03×03", "Diplomatie"],
  ["sg1", "03×04", "Héritage"],
  ["sg1", "03×05", "Méthode d’apprentissage"],
  ["sg1", "03×06", "De l’autre coté du miroir"],
  ["sg1", "03×07", "Le Chasseur de prime"],
  ["sg1", "03×08", "Les Démons"],
  ["sg1", "03×09", "Règles de combat"],
  ["sg1", "03×10", "Le Jour sans fin"],
  ["sg1", "03×11", "Le Passé oublié"],
  ["sg1", "03×12", "Les Flammes de l’enfer (1/2)"],
  ["sg1", "03×13", "Les Flammes de l’enfer (2/2)"],
  ["sg1", "03×14", "Invasion"],
  ["sg1", "03×15", "Simulation"],
  ["sg1", "03×16", "Un étrange compagnon"],
  ["sg1", "03×17", "La Pluie de feu"],
  ["sg1", "03×18", "Trahisons"],
  ["sg1", "03×19", "Un nouveau monde"],
  ["sg1", "03×20", "Instinct maternel"],
  ["sg1", "03×21", "Le Crâne de cristal"],
  ["sg1", "03×22", "Némésis"],
  ["sg1", "04×01", "Victoires illusoires"],
  ["sg1", "04×02", "L’Autre Côté"],
  ["sg1", "04×03", "Expérimentation hasardeuse"],
  ["sg1", "04×04", "Destins croisés"],
  ["sg1", "04×05", "Diviser pour conquérir"],
  ["sg1", "04×06", "L’Histoire sans fin"],
  ["sg1", "04×07", "Eaux troubles"],
  ["sg1", "04×08", "Primitifs"],
  ["sg1", "04×09", "Terre brûlée"],
  ["sg1", "04×10", "Sous la glace"],
  ["sg1", "04×11", "Point de non-retour"],
  ["sg1", "04×12", "Perdus dans l’espace"],
  ["sg1", "04×13", "La Malédiction"],
  ["sg1", "04×14", "Le Venin du serpent"],
  ["sg1", "04×15", "Réactions en chaîne"],
  ["sg1", "04×16", "2010"],
  ["sg1", "04×17", "Pouvoir absolu"],
  ["sg1", "04×18", "La Lumière"],
  ["sg1", "04×19", "Prodige"],
  ["sg1", "04×20", "Entité"],
  ["sg1", "04×21", "Répliques"],
  ["sg1", "04×22", "Exode"],
  ["sg1", "05×01", "Ennemis jurés"],
  ["sg1", "05×02", "Le Seuil"],
  ["sg1", "05×03", "Ascension"],
  ["sg1", "05×04", "Le Cinquième Homme"],
  ["sg1", "05×05", "Mission soleil rouge"],
  ["sg1", "05×06", "Rite initiatique"],
  ["sg1", "05×07", "Maîtres et serviteurs"],
  ["sg1", "05×08", "La Tombe"],
  ["sg1", "05×09", "Traquenard"],
  ["sg1", "05×10", "Les Faux Amis"],
  ["sg1", "05×11", "Ultime recours"],
  ["sg1", "05×12", "Wormhole X-Treme"],
  ["sg1", "05×13", "L’Épreuve du feu"],
  ["sg1", "05×14", "48 heures"],
  ["sg1", "05×15", "Sans issue (1/2)"],
  ["sg1", "05×16", "Sans issue (2/2)"],
  ["sg1", "05×17", "Impact"],
  ["sg1", "05×18", "Le Guerrier"],
  ["sg1", "05×19", "Menace"],
  ["sg1", "05×20", "Sentinelle"],
  ["sg1", "05×21", "Zénith"],
  ["sg1", "05×22", "Révélations"],
  ["sg1", "06×01", "Rédemption (1/2)"],
  ["sg1", "06×02", "Rédemption (2/2)"],
  ["sg1", "06×03", "Réunion"],
  ["sg1", "06×04", "Prisonnière des glaces"],
  ["sg1", "06×05", "L’Expérience secrète"],
  ["sg1", "06×06", "Abysse"],
  ["sg1", "06×07", "Résistance"],
  ["sg1", "06×08", "Acte de bravoure"],
  ["sg1", "06×09", "L’Union fait la force"],
  ["sg1", "06×10", "La Reine"],
  ["sg1", "06×11", "Prométhée"],
  ["sg1", "06×12", "Évolution"],
  ["sg1", "06×13", "Hallucinations"],
  ["sg1", "06×14", "Écrans de fumée"],
  ["sg1", "06×15", "Paradis perdu"],
  ["sg1", "06×16", "Métamorphose"],
  ["sg1", "06×17", "Secret d’État"],
  ["sg1", "06×18", "Les Rescapés"],
  ["sg1", "06×19", "La Porte des rêves"],
  ["sg1", "06×20", "En quête du passé"],
  ["sg1", "06×21", "La Prophétie"],
  ["sg1", "06×22", "Pacte avec le diable"],
  ["sg1", "07×01", "Retour aux sources (1/2)"],
  ["sg1", "07×02", "Retour aux sources (2/2)"],
  ["sg1", "07×03", "L’Apprenti sorcier"],
  ["sg1", "07×04", "Les Esclaves d’Erebus"],
  ["sg1", "07×05", "Le Réseau"],
  ["sg1", "07×06", "Vaisseau fantôme"],
  ["sg1", "07×07", "Les Envahisseurs"],
  ["sg1", "07×08", "La Grande Épreuve"],
  ["sg1", "07×09", "Le Vengeur"],
  ["sg1", "07×10", "Les Amazones"],
  ["sg1", "07×11", "La Fontaine de jouvence (1/2)"],
  ["sg1", "07×12", "La Fontaine de jouvence (2/2)"],
  ["sg1", "07×13", "Le Voyage intérieur"],
  ["sg1", "07×14", "Dangereuse alliance"],
  ["sg1", "07×15", "Chimères"],
  ["sg1", "07×16", "La Fin de l’union"],
  ["sg1", "07×17", "Héros (1/2)"],
  ["sg1", "07×18", "Héros (2/2)"],
  ["sg1", "07×19", "Résurrection"],
  ["sg1", "07×20", "Lutte de pouvoir"],
  ["sg1", "07×21", "La Cité perdue (1/2)"],
  ["sg1", "07×22", "La Cité perdue (2/2)"],
  ["sg1", "08×01", "Mésalliance (1/2)"],
  ["sg1", "08×02", "Mésalliance (2/2)"],
  ["sg1", "08×03", "Quarantaine"],
  ["sg1", "08×04", "Heure H"],
  ["sg1", "08×05", "Le Feu aux poudres"],
  ["sg1", "08×06", "Avatar"],
  ["sg1", "08×07", "Monde cruel"],
  ["sg1", "08×08", "Aux yeux du monde"],
  ["sg1", "08×09", "Discordes"],
  ["sg1", "08×10", "Sans pitié"],
  ["sg1", "08×11", "Vulnérable"],
  ["sg1", "08×12", "En détresse"],
  ["sg1", "08×13", "Une Vieille Connaissance"],
  ["sg1", "08×14", "Alerte maximum"],
  ["sg1", "08×15", "Rien à perdre"],
  ["sg1", "08×16", "La Dernière Chance (1/2)"],
  ["sg1", "08×17", "La Dernière Chance (2/2)"],
  ["sg1", "08×18", "Pour la vie"],
  ["sg1", "08×19", "Retour vers le futur (1/2)"],
  ["sg1", "08×20", "Retour vers le futur (2/2)"],
  ["atl", "01×01", "Une nouvelle ère (1)"],
  ["atl", "01×02", "Une nouvelle ère (2)"],
  ["atl", "01×03", "Invulnérable"],
  ["atl", "01×04", "38 minutes"],
  ["atl", "01×05", "Soupçons"],
  ["atl", "01×06", "La Fin de l’innocence"],
  ["atl", "01×07", "Sérum"],
  ["atl", "01×08", "Apparences"],
  ["atl", "01×09", "Retour sur Terre"],
  ["atl", "01×10", "En pleine tempête (1)"],
  ["atl", "01×11", "En pleine tempête (2)"],
  ["atl", "01×12", "Duel"],
  ["atl", "01×13", "Virus"],
  ["atl", "01×14", "Hors d’atteinte"],
  ["atl", "01×15", "Le Grand Sommeil"],
  ["atl", "01×16", "La Communauté des quinze"],
  ["atl", "01×17", "Derniers messages"],
  ["atl", "01×18", "Sous hypnose"],
  ["atl", "01×19", "Assiégés (1)"],
  ["atl", "01×20", "Assiégés (2)"],
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
    "sg1-01": 1997,
    "sg1-02": 1998,
    "sg1-03": 1999,
    "sg1-04": 2000,
    "sg1-05": 2001,
    "sg1-06": 2002,
    "sg1-07": 2003,
    "sg1-08": 2004,
    "sg1-09": 2005,
    "sg1-10": 2006,
    "atl-01": 2004,
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
  const base = table[`${key}-${code.slice(0, 2)}`] ?? table[`${key}-${code}`] ?? 2005;

  // Certaines saisons chevauchent 2 années civiles (pause hivernale entre
  // les deux moitiés de diffusion) : dates réelles vérifiées sur TMDb.
  const shift = MID_SEASON_YEAR_SHIFT[`${key}-${code.slice(0, 2)}`];
  if (shift) {
    const { episode } = parseCode(code);
    if (episode !== undefined && episode >= shift.fromEpisode) return shift.year;
  }

  return base;
}

const MID_SEASON_YEAR_SHIFT: Record<string, { fromEpisode: number; year: number }> = {
  "sg1-01": { fromEpisode: 16, year: 1998 }, // pause avant l'épisode diffusé le 23/01/1998
  "sg1-02": { fromEpisode: 15, year: 1999 }, // pause avant l'épisode diffusé le 22/01/1999
  "sg1-03": { fromEpisode: 15, year: 2000 }, // pause avant l'épisode diffusé le 21/01/2000
  "sg1-04": { fromEpisode: 15, year: 2001 }, // pause avant l'épisode diffusé le 05/01/2001
  "sg1-05": { fromEpisode: 13, year: 2002 }, // pause avant l'épisode diffusé le 08/03/2002
  "sg1-06": { fromEpisode: 12, year: 2003 }, // pause avant l'épisode diffusé le 10/01/2003
  "sg1-07": { fromEpisode: 12, year: 2004 }, // pause avant l'épisode diffusé le 09/01/2004
  "sg1-08": { fromEpisode: 11, year: 2005 }, // pause avant l'épisode diffusé le 21/01/2005
  "sg1-09": { fromEpisode: 11, year: 2006 }, // pause du 16/09/2005 au 06/01/2006
  "sg1-10": { fromEpisode: 11, year: 2007 }, // pause du 22/09/2006 au 13/04/2007
  "atl-01": { fromEpisode: 16, year: 2005 }, // pause avant l'épisode diffusé le 03/01/2005
  "atl-02": { fromEpisode: 16, year: 2006 }, // pause du 19/12/2005 au 02/01/2006
  "atl-03": { fromEpisode: 16, year: 2007 }, // pause du 17/12/2006 au 07/01/2007
};

// ---- GÉNÉRATION des 281 ContentSummary à partir des tuples ----

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
