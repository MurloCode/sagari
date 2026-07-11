// ---------------------------------------------------------------
// SOURCE UNIQUE DE VÉRITÉ pour les types de médias :
// libellés + code couleur, utilisés partout (cartes, timeline,
// filtres, fiche). Ajouter un média (ex: "bd") dans types.ts ?
// TS exigera de compléter CET objet, et tout le reste suivra.
//
// ⚠️ Piège Tailwind : les classes doivent être des chaînes COMPLÈTES.
// Tailwind scanne le code source ; `text-${couleur}-300` ne serait
// jamais détecté et la classe n'existerait pas dans le CSS final.
//
// À ne pas confondre avec seriesPalette.ts : ici, la couleur dépend du
// TYPE de média (film/série/livre…), la même partout dans l'app. Là-bas,
// la couleur dépend de la SOUS-SÉRIE au sein d'une saga (ex: SG-1 vs
// Atlantis). Les deux palettes sont choisies pour ne jamais se ressembler.
// ---------------------------------------------------------------
import type { MediaType } from "./types";

interface MediaTypeConfig {
  label: string; // singulier (badge d'une carte)
  plural: string; // pluriel (bouton de filtre)
  icon: string; // emoji : zéro dépendance. (Alternative pro : lucide-react)
  /** Badge coloré sur les cartes et dans les popovers */
  badge: string;
  /** Nœud sur la ligne de vie */
  node: string;
  /** Bouton de filtre à l'état actif */
  chipOn: string;
}

export const MEDIA_CONFIG: Record<MediaType, MediaTypeConfig> = {
  film: {
    label: "Film",
    plural: "Films",
    icon: "🎬",
    badge: "bg-cyan-400/10 text-cyan-300 ring-1 ring-cyan-400/30",
    node: "border-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.7)]",
    chipOn:
      "border-cyan-400/60 bg-cyan-400/10 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.25)]",
  },
  serie: {
    label: "Série",
    plural: "Séries",
    icon: "📺",
    badge: "bg-fuchsia-400/10 text-fuchsia-300 ring-1 ring-fuchsia-400/30",
    node: "border-fuchsia-400 shadow-[0_0_12px_rgba(232,121,249,0.7)]",
    chipOn:
      "border-fuchsia-400/60 bg-fuchsia-400/10 text-fuchsia-300 shadow-[0_0_10px_rgba(232,121,249,0.25)]",
  },
  livre: {
    label: "Livre",
    plural: "Livres",
    icon: "📖",
    badge: "bg-emerald-400/10 text-emerald-300 ring-1 ring-emerald-400/30",
    node: "border-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.7)]",
    chipOn:
      "border-emerald-400/60 bg-emerald-400/10 text-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.25)]",
  },
  "serie-animee": {
    label: "Série animée",
    plural: "Séries animées",
    icon: "🎨",
    badge: "bg-violet-400/10 text-violet-300 ring-1 ring-violet-400/30",
    node: "border-violet-400 shadow-[0_0_12px_rgba(167,139,250,0.7)]",
    chipOn:
      "border-violet-400/60 bg-violet-400/10 text-violet-300 shadow-[0_0_10px_rgba(167,139,250,0.25)]",
  },
  bd: {
    label: "BD",
    plural: "BD",
    icon: "📘",
    badge: "bg-rose-400/10 text-rose-300 ring-1 ring-rose-400/30",
    node: "border-rose-400 shadow-[0_0_12px_rgba(251,113,133,0.7)]",
    chipOn:
      "border-rose-400/60 bg-rose-400/10 text-rose-300 shadow-[0_0_10px_rgba(251,113,133,0.25)]",
  },
  comics: {
    label: "Comics",
    plural: "Comics",
    icon: "💥",
    badge: "bg-sky-400/10 text-sky-300 ring-1 ring-sky-400/30",
    node: "border-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.7)]",
    chipOn:
      "border-sky-400/60 bg-sky-400/10 text-sky-300 shadow-[0_0_10px_rgba(56,189,248,0.25)]",
  },
  "jeu-video": {
    label: "Jeu vidéo",
    plural: "Jeux vidéo",
    icon: "🎮",
    badge: "bg-lime-400/10 text-lime-300 ring-1 ring-lime-400/30",
    node: "border-lime-400 shadow-[0_0_12px_rgba(163,230,53,0.7)]",
    chipOn:
      "border-lime-400/60 bg-lime-400/10 text-lime-300 shadow-[0_0_10px_rgba(163,230,53,0.25)]",
  },
};
