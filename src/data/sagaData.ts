// Données d'exemple. Désormais : 2 sagas, avec films ET livres,
// pour illustrer les points de contenu masqué sur la timeline.
// (Ex : le roman "Les Ombres de l'Empire" se situe entre l'Empire
// contre-attaque et le Retour du Jedi.)
import type { Saga, ContentSummary, ContentDetails } from "../types";
import { stargateSummaries } from "./stargateData";

export const sagas: Saga[] = [
  {
    id: "stargate",
    name: "Stargate",
    description:
      "SG-1, Atlantis et Universe — le tronc commun épisode par épisode établi par la communauté",
    color: "#7ba3c9",
    // Tout l'intérêt de cette saga EST l'ordre communautaire → on
    // l'ouvre directement dessus
    defaultSort: "recommended",
  },
  {
    id: "starwars",
    name: "Star Wars",
    description: "Films et romans de la galaxie très lointaine",
    color: "#c8a24a",
  },
  {
    id: "middleearth",
    name: "Terre du Milieu",
    description: "Le Seigneur des Anneaux, Le Hobbit et le roman d'origine",
    color: "#6fae7c",
  },
];

export const summaries: ContentSummary[] = [
  // ---------- STARGATE (281 entrées générées, voir stargateData.ts) ----------
  // L'opérateur "spread" (...) déplie un tableau dans un autre.
  ...stargateSummaries,

  // ---------- STAR WARS ----------
  {
    id: "sw4",
    sagaId: "starwars",
    title: "Star Wars : Un nouvel espoir",
    year: 1977,
    type: "film",
    orders: { release: 1, chronological: 5, recommended: 1 },
  },
  {
    id: "sw5",
    sagaId: "starwars",
    title: "L'Empire contre-attaque",
    year: 1980,
    type: "film",
    orders: { release: 2, chronological: 6, recommended: 2 },
  },
  {
    id: "sw6",
    sagaId: "starwars",
    title: "Le Retour du Jedi",
    year: 1983,
    type: "film",
    orders: { release: 3, chronological: 8, recommended: 6 },
  },
  {
    id: "ombres",
    sagaId: "starwars",
    title: "Les Ombres de l'Empire (roman)",
    year: 1996,
    type: "livre",
    // Se situe entre l'Empire contre-attaque et le Retour du Jedi
    orders: { release: 4, chronological: 7, recommended: 5 },
  },
  {
    id: "sw1",
    sagaId: "starwars",
    title: "La Menace fantôme",
    year: 1999,
    type: "film",
    orders: { release: 5, chronological: 1, recommended: 8 },
  },
  {
    id: "sw2",
    sagaId: "starwars",
    title: "L'Attaque des clones",
    year: 2002,
    type: "film",
    orders: { release: 6, chronological: 2, recommended: 3 },
  },
  {
    id: "sw3",
    sagaId: "starwars",
    title: "La Revanche des Sith",
    year: 2005,
    type: "film",
    orders: { release: 7, chronological: 3, recommended: 4 },
  },
  {
    id: "rogueone",
    sagaId: "starwars",
    title: "Rogue One",
    year: 2016,
    type: "film",
    orders: { release: 8, chronological: 4, recommended: 7 },
  },
  // ---------- TERRE DU MILIEU ----------
  {
    id: "bilbo",
    sagaId: "middleearth",
    title: "Bilbo le Hobbit (roman)",
    year: 1937,
    type: "livre",
    orders: { release: 1, chronological: 1, recommended: 7 },
  },
  {
    id: "lotr1",
    sagaId: "middleearth",
    title: "La Communauté de l'anneau",
    year: 2001,
    type: "film",
    orders: { release: 2, chronological: 5, recommended: 1 },
  },
  {
    id: "lotr2",
    sagaId: "middleearth",
    title: "Les Deux Tours",
    year: 2002,
    type: "film",
    orders: { release: 3, chronological: 6, recommended: 2 },
  },
  {
    id: "lotr3",
    sagaId: "middleearth",
    title: "Le Retour du roi",
    year: 2003,
    type: "film",
    orders: { release: 4, chronological: 7, recommended: 3 },
  },
  {
    id: "hobbit1",
    sagaId: "middleearth",
    title: "Le Hobbit : Un voyage inattendu",
    year: 2012,
    type: "film",
    orders: { release: 5, chronological: 2, recommended: 4 },
  },
  {
    id: "hobbit2",
    sagaId: "middleearth",
    title: "Le Hobbit : La Désolation de Smaug",
    year: 2013,
    type: "film",
    orders: { release: 6, chronological: 3, recommended: 5 },
  },
  {
    id: "hobbit3",
    sagaId: "middleearth",
    title: "Le Hobbit : La Bataille des Cinq Armées",
    year: 2014,
    type: "film",
    orders: { release: 7, chronological: 4, recommended: 6 },
  },
];

export const details: Record<string, ContentDetails> = {
  sw4: {
    id: "sw4",
    synopsis:
      "Luke Skywalker, jeune fermier de Tatooine, se retrouve embarqué dans la rébellion contre l'Empire galactique après avoir découvert un message caché dans un droïde.",
    rating: 8.6,
    posterColor: "#c8a24a",
    platforms: ["Disney+"],
  },
  sw5: {
    id: "sw5",
    synopsis:
      "L'Empire frappe fort : les rebelles fuient sur Hoth, Luke s'entraîne auprès de Yoda, et une révélation va bouleverser sa vie.",
    rating: 8.7,
    posterColor: "#7ba3c9",
    platforms: ["Disney+"],
  },
  sw6: {
    id: "sw6",
    synopsis:
      "La rébellion lance l'assaut final contre la seconde Étoile de la Mort pendant que Luke affronte Dark Vador et l'Empereur.",
    rating: 8.3,
    posterColor: "#6fae7c",
    platforms: ["Disney+"],
  },
  ombres: {
    id: "ombres",
    synopsis:
      "Entre l'Empire contre-attaque et le Retour du Jedi : pendant que Han Solo est figé dans la carbonite, le prince Xizor complote pour remplacer Vador auprès de l'Empereur.",
    rating: 7.1,
    posterColor: "#3d6b52",
    platforms: ["Librairies", "Kindle"],
  },
  sw1: {
    id: "sw1",
    synopsis:
      "Deux chevaliers Jedi découvrent un jeune esclave nommé Anakin Skywalker, dont le potentiel dans la Force est hors du commun.",
    rating: 6.5,
    posterColor: "#b0603f",
    platforms: ["Disney+"],
  },
  sw2: {
    id: "sw2",
    synopsis:
      "Dix ans plus tard, Anakin devenu Padawan protège la sénatrice Padmé tandis qu'une mystérieuse armée de clones apparaît.",
    rating: 6.6,
    posterColor: "#8e5a7e",
    platforms: ["Disney+"],
  },
  sw3: {
    id: "sw3",
    synopsis:
      "La guerre des clones s'achève. Déchiré entre loyauté et peur de perdre Padmé, Anakin bascule du côté obscur.",
    rating: 7.6,
    posterColor: "#a03a2e",
    platforms: ["Disney+"],
  },
  rogueone: {
    id: "rogueone",
    synopsis:
      "Un groupe de rebelles se lance dans une mission suicide : voler les plans de l'Étoile de la Mort.",
    rating: 7.8,
    posterColor: "#4b5d73",
    platforms: ["Disney+"],
  },
  bilbo: {
    id: "bilbo",
    synopsis:
      "Bilbo Sacquet, hobbit paisible, est entraîné par Gandalf et treize nains dans une quête pour reprendre le trésor gardé par le dragon Smaug.",
    rating: 7.9,
    posterColor: "#7a5c3e",
    platforms: ["Librairies", "Kindle"],
  },
  lotr1: {
    id: "lotr1",
    synopsis:
      "Frodon hérite d'un anneau au pouvoir terrifiant et quitte la Comté avec une communauté chargée de le détruire en Mordor.",
    rating: 8.9,
    posterColor: "#4a6741",
    platforms: ["Max", "Prime Video"],
  },
  lotr2: {
    id: "lotr2",
    synopsis:
      "La communauté dispersée, Frodon et Sam poursuivent leur route guidés par Gollum, tandis que la guerre embrase le Rohan.",
    rating: 8.8,
    posterColor: "#5d5a3c",
    platforms: ["Max", "Prime Video"],
  },
  lotr3: {
    id: "lotr3",
    synopsis:
      "La bataille finale pour la Terre du Milieu commence, pendant que Frodon approche de la Montagne du Destin.",
    rating: 9.0,
    posterColor: "#8c6d46",
    platforms: ["Max", "Prime Video"],
  },
  hobbit1: {
    id: "hobbit1",
    synopsis:
      "Soixante ans avant le Seigneur des Anneaux : Bilbo rejoint la compagnie de Thorin pour reconquérir Erebor.",
    rating: 7.8,
    posterColor: "#46654f",
    platforms: ["Max", "Prime Video"],
  },
  hobbit2: {
    id: "hobbit2",
    synopsis:
      "La compagnie affronte les araignées de la Forêt Noire et réveille le dragon Smaug au cœur de la Montagne Solitaire.",
    rating: 7.8,
    posterColor: "#7c4a35",
    platforms: ["Max", "Prime Video"],
  },
  hobbit3: {
    id: "hobbit3",
    synopsis:
      "La mort de Smaug déclenche une guerre pour le trésor d'Erebor entre nains, elfes, hommes et orques.",
    rating: 7.4,
    posterColor: "#5b4a6b",
    platforms: ["Max", "Prime Video"],
  },
};
