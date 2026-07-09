// Carte d'un contenu dans la timeline. Composant de PRÉSENTATION.
// Style "glassmorphism" : fond translucide + backdrop-blur + fine
// bordure qui s'illumine au survol.
import { Link } from "react-router-dom";
import { MEDIA_CONFIG } from "../mediaConfig";
import type { ContentSummary } from "../types";

/** "07" : petit zéro devant pour un alignement propre */
const pad = (n: number) => String(n).padStart(2, "0");

interface ContentCardProps {
  content: ContentSummary;
  /** Numéro à afficher : position dans la chronologie active (1, 2, 3…) */
  position: number;
  isWatched: boolean;
  onToggleWatched: (id: string) => void;
  /** Contenu affiché via un point (type normalement filtré) */
  isForced?: boolean;
  /** Retire l'épingle → le contenu redevient un point */
  onUnpin?: (id: string) => void;
}

export function ContentCard({
  content,
  position,
  isWatched,
  onToggleWatched,
  isForced,
  onUnpin,
}: ContentCardProps) {
  return (
    <div
      className={`rounded-xl border bg-slate-900/70 p-3 backdrop-blur transition-all hover:border-cyan-400/50 hover:shadow-[0_0_18px_rgba(34,211,238,0.12)] ${
        isForced ? "border-amber-400/40" : "border-slate-700/60"
      } ${isWatched ? "opacity-50" : ""}`}
    >
      <div className="flex items-center gap-3">
        {/* LA PASTILLE. Deux cas :
            - épisode/saison de série → Saison au-dessus, Épisode en dessous,
              aux couleurs de SA série (seriesColor)
            - sinon → position dans la chronologie active.
            Couleur dynamique (vient des données) → style inline, pas de
            classe Tailwind (cf. le piège documenté dans mediaConfig.ts). */}
        {content.season !== undefined ? (
          <span
            className="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold leading-tight"
            style={{
              color: content.seriesColor ?? "#22d3ee",
              border: `1px solid ${content.seriesColor ?? "#22d3ee"}66`,
            }}
            title={`${content.series} — saison ${content.season}${
              content.episode !== undefined ? `, épisode ${content.episode}` : ""
            }`}
          >
            <span>S{pad(content.season)}</span>
            {content.episode !== undefined && <span>E{pad(content.episode)}</span>}
          </span>
        ) : (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-800 text-sm font-bold text-cyan-300 ring-1 ring-cyan-500/30">
            {position}
          </span>
        )}
        <Link to={`/content/${content.id}`} className="min-w-0 flex-1">
          {/* Nom de la série, dans sa couleur d'accent */}
          {content.series && (
            <p
              className="truncate text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: content.seriesColor ?? "#64748b" }}
            >
              {content.series}
            </p>
          )}
          <p className="truncate font-medium text-slate-100">{content.title}</p>
          <p className="flex items-center gap-2 text-sm text-slate-400">
            {content.year}
            {/* Badge coloré selon le type (couleurs dans mediaConfig.ts) */}
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${MEDIA_CONFIG[content.type].badge}`}
            >
              {MEDIA_CONFIG[content.type].icon} {MEDIA_CONFIG[content.type].label}
            </span>
          </p>
        </Link>

        <button
          onClick={() => onToggleWatched(content.id)}
          aria-label={isWatched ? "Marquer comme non vu" : "Marquer comme vu"}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-lg transition-all ${
            isWatched
              ? "border-emerald-400 bg-emerald-400/15 text-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.4)]"
              : "border-slate-600 text-transparent hover:border-cyan-400"
          }`}
        >
          ✓
        </button>
      </div>

      {/* Badge "épinglé" : rendu conditionnel — n'existe que si isForced.
          && en JSX : si la condition est fausse, React n'affiche rien. */}
      {isForced && onUnpin && (
        <button
          onClick={() => onUnpin(content.id)}
          className="mt-2 flex items-center gap-1 text-xs text-amber-300/90 transition-colors hover:text-amber-200"
          title="Retirer de la timeline (redevient un point)"
        >
          📌 épinglé · retirer ✕
        </button>
      )}
    </div>
  );
}
