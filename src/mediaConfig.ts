// ---------------------------------------------------------------
// SOURCE UNIQUE DE VÉRITÉ pour les types de médias :
// libellés + code couleur, utilisés partout (cartes, timeline,
// filtres, fiche). Ajouter un média (ex: "bd") dans types.ts ?
// TS exigera de compléter CET objet, et tout le reste suivra.
//
// ⚠️ Piège Tailwind : les classes doivent être des chaînes COMPLÈTES.
// Tailwind scanne le code source ; `text-${couleur}-300` ne serait
// jamais détecté et la classe n'existerait pas dans le CSS final.
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
};
