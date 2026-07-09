// Filtre des types de médias affichés. Composant contrôlé, sélection
// multiple (Set). Les couleurs viennent de mediaConfig.ts : chaque
// bouton actif prend la couleur de SON type — même code couleur que
// les badges des cartes et les nœuds de la timeline.
import { MEDIA_CONFIG } from "../mediaConfig";
import type { MediaType } from "../types";

interface MediaTypeFilterProps {
  /** Types réellement présents dans la saga */
  available: MediaType[];
  selected: Set<MediaType>;
  onToggle: (type: MediaType) => void;
}

export function MediaTypeFilter({
  available,
  selected,
  onToggle,
}: MediaTypeFilterProps) {
  return (
    <div className="flex gap-2" role="group" aria-label="Types de médias affichés">
      {available.map((type) => {
        const isOn = selected.has(type);
        return (
          <button
            key={type}
            aria-pressed={isOn}
            onClick={() => onToggle(type)}
            className={`rounded-full border px-3 py-1 text-sm transition-all ${
              isOn
                ? MEDIA_CONFIG[type].chipOn
                : "border-slate-700 text-slate-500 hover:border-slate-500"
            }`}
          >
            {/* Icône toujours visible ; l'état actif est signalé par la couleur */}
            {MEDIA_CONFIG[type].icon} {MEDIA_CONFIG[type].plural}
          </button>
        );
      })}
    </div>
  );
}
