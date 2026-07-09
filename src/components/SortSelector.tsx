// Composant "contrôlé" : il ne possède PAS le mode de tri choisi.
// C'est le parent (HomePage) qui détient le state et le passe en props.
// Principe React : l'état vit au plus haut niveau qui en a besoin
// ("lifting state up").
import type { SortMode } from "../types";

// On type les props : le parent DOIT fournir exactement ça.
interface SortSelectorProps {
  value: SortMode;
  onChange: (mode: SortMode) => void; // fonction "callback" fournie par le parent
  /** Tri recommandé pour la saga affichée → petite étoile sur ce bouton */
  starred?: SortMode;
}

// Objet de correspondance clé → libellé affiché.
// L'ORDRE des clés = l'ordre des boutons : le tri "Conseillé" (la
// promesse du site) passe en premier.
const LABELS: Record<SortMode, string> = {
  recommended: "Conseillé",
  chronological: "Histoire",
  release: "Parution",
};

export function SortSelector({ value, onChange, starred }: SortSelectorProps) {
  return (
    <div className="flex gap-2" role="radiogroup" aria-label="Ordre de tri">
      {/* Object.keys renvoie string[] : le "as" précise le type exact */}
      {(Object.keys(LABELS) as SortMode[]).map((mode) => (
        <button
          key={mode} // React exige une "key" unique dans toute liste .map()
          role="radio"
          aria-checked={value === mode}
          onClick={() => onChange(mode)}
          // Tailwind : classes conditionnelles selon que le bouton est actif.
          // Mobile-first : px-3/text-sm par défaut, sm: pour écran plus large.
          className={`rounded-full px-3 py-1.5 text-sm font-medium transition-all sm:px-4 ${
            value === mode
              ? "bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-[0_0_14px_rgba(99,102,241,0.5)]"
              : "bg-slate-800/70 text-slate-300 ring-1 ring-slate-700/60 hover:bg-slate-700/70"
          }`}
        >
          {/* ★ = l'ordre suggéré pour cette saga */}
          {starred === mode && (
            <span
              className="mr-1 text-amber-300"
              title="Ordre suggéré pour cette saga"
            >
              ★
            </span>
          )}
          {LABELS[mode]}
        </button>
      ))}
    </div>
  );
}
