// ---------------------------------------------------------------
// TIMELINE responsive — la "ligne de vie" de Sagari.
//  - mobile : verticale, ligne à gauche
//  - desktop (md:) : horizontale, molette → défilement, scrollbar masquée
//
// Les suites d'épisodes consécutifs d'une MÊME série sont regroupées
// en BLOC. Cliquer sur "Voir le détail" ouvre une MODALE : un
// accordéon des saisons, chaque saison dépliable révèle ses épisodes,
// cochables un à un ou toute la saison d'un coup.
// ---------------------------------------------------------------
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { TimelineEntry } from "../types";
import { ContentCard } from "./ContentCard";
import { MEDIA_CONFIG } from "../mediaConfig";
import { formatEpisodeCode } from "../utils/format";

// Extract<Union, Critère> : type utilitaire TS qui "extrait" une branche
// d'une union discriminée. Ici : uniquement la variante { kind: "item" }.
type ItemEntry = Extract<TimelineEntry, { kind: "item" }>;

// Ce que la timeline AFFICHE : les entrées d'origine + les blocs.
type DisplayEntry =
  | TimelineEntry
  | { kind: "block"; id: string; items: ItemEntry[] };

/** En dessous de 3 éléments consécutifs, regrouper ferait perdre plus
 *  d'information que ça n'en condense. */
const MIN_BLOCK_SIZE = 3;

/** Regroupe les items d'un bloc par numéro de saison, en préservant
 *  l'ordre (les Map gardent l'ordre d'insertion). */
function groupBySeason(items: ItemEntry[]): Array<[number, ItemEntry[]]> {
  const map = new Map<number, ItemEntry[]>();
  for (const item of items) {
    const season = item.content.season ?? 0;
    const existing = map.get(season);
    if (existing) {
      existing.push(item);
    } else {
      map.set(season, [item]);
    }
  }
  return [...map.entries()];
}

/** Popover ouvert : index du gap + coordonnées ÉCRAN du point cliqué */
interface OpenGap {
  index: number;
  x: number;
  y: number;
}

interface TimelineProps {
  entries: TimelineEntry[];
  watched: Set<string>;
  onToggleWatched: (id: string) => void;
  /** Coche/décoche plusieurs contenus d'un coup (toute une saison) */
  onToggleMany: (ids: string[], value: boolean) => void;
  /** Affiche un contenu masqué (checkbox du popover) */
  onForceVisible: (id: string) => void;
  /** Retire un contenu épinglé par erreur */
  onUnforceVisible: (id: string) => void;
}

export function Timeline({
  entries,
  watched,
  onToggleWatched,
  onToggleMany,
  onForceVisible,
  onUnforceVisible,
}: TimelineProps) {
  const [openGap, setOpenGap] = useState<OpenGap | null>(null);
  // Modale de bloc ouverte (id du bloc) + saisons dépliées dedans
  const [openBlock, setOpenBlock] = useState<string | null>(null);
  const [expandedSeasons, setExpandedSeasons] = useState<Set<number>>(
    new Set()
  );

  const scrollRef = useRef<HTMLDivElement>(null);

  // Molette verticale → défilement horizontal (desktop)
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (el.scrollWidth <= el.clientWidth) return;
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // Popover en position fixed → on le ferme si la page défile
  useEffect(() => {
    const close = () => setOpenGap(null);
    window.addEventListener("scroll", close, { passive: true });
    return () => window.removeEventListener("scroll", close);
  }, []);

  // La touche Échap ferme la modale — le réflexe UX que tout le monde a.
  useEffect(() => {
    if (!openBlock) return; // pas de modale → pas de listener
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenBlock(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openBlock]);

  // ---- REGROUPEMENT : suites consécutives de même série → blocs ----
  const displayEntries = useMemo<DisplayEntry[]>(() => {
    const out: DisplayEntry[] = [];
    let run: ItemEntry[] = [];

    const flush = () => {
      if (run.length >= MIN_BLOCK_SIZE) {
        out.push({ kind: "block", id: run[0].content.id, items: run });
      } else {
        out.push(...run);
      }
      run = [];
    };

    for (const entry of entries) {
      const groupable =
        entry.kind === "item" &&
        entry.content.series !== undefined &&
        entry.content.season !== undefined &&
        !entry.isForced;

      if (groupable) {
        if (
          run.length > 0 &&
          run[0].content.series !== (entry as ItemEntry).content.series
        ) {
          flush();
        }
        run.push(entry as ItemEntry);
      } else {
        flush();
        out.push(entry);
      }
    }
    flush();
    return out;
  }, [entries]);

  function openBlockModal(id: string) {
    setOpenBlock(id);
    setExpandedSeasons(new Set()); // modale toute repliée à l'ouverture
  }

  function toggleSeason(season: number) {
    setExpandedSeasons((prev) => {
      const next = new Set(prev);
      if (next.has(season)) {
        next.delete(season);
      } else {
        next.add(season);
      }
      return next;
    });
  }

  // Le bloc dont la modale est ouverte (donnée DÉRIVÉE de openBlock)
  const openBlockEntry = displayEntries.find(
    (e): e is Extract<DisplayEntry, { kind: "block" }> =>
      e.kind === "block" && e.id === openBlock
  );

  return (
    <div
      ref={scrollRef}
      onScroll={() => setOpenGap(null)}
      className="scrollbar-none md:overflow-x-auto md:pb-6"
    >
      <ol className="relative flex w-full flex-col gap-5 md:w-max md:min-w-full md:flex-row md:items-start md:gap-4 md:pt-1">
        <div
          aria-hidden
          className="absolute left-4 top-0 h-full w-0.5 bg-gradient-to-b from-cyan-500/80 via-indigo-500/80 to-fuchsia-500/80 md:left-0 md:top-4 md:h-0.5 md:w-full md:bg-gradient-to-r"
        />

        {displayEntries.map((entry, i) => {
          // ---------- BLOC : suite d'épisodes d'une même série ----------
          if (entry.kind === "block") {
            const first = entry.items[0].content;
            const last = entry.items[entry.items.length - 1].content;
            const watchedCount = entry.items.filter((e) =>
              watched.has(e.content.id)
            ).length;
            const color = first.seriesColor ?? "#22d3ee";

            return (
              <li
                key={`block-${entry.id}`}
                className="relative pl-10 md:w-56 md:shrink-0 md:pl-0 md:pt-8"
              >
                <span
                  className="absolute left-4 top-5 h-4 w-4 -translate-x-1/2 rounded-full border-[3px] bg-slate-950 md:left-1/2 md:top-4 md:-translate-y-[45%]"
                  style={{ borderColor: color, boxShadow: `0 0 12px ${color}aa` }}
                />

                <div
                  className="rounded-xl border bg-slate-900/70 p-3 backdrop-blur"
                  style={{ borderColor: `${color}55` }}
                >
                  <p
                    className="truncate text-[10px] font-semibold uppercase tracking-wider"
                    style={{ color }}
                  >
                    {first.series}
                  </p>
                  <p className="font-medium text-slate-100">
                    {formatEpisodeCode(first.season, first.episode)}
                    <span className="mx-1 text-slate-500">→</span>
                    {formatEpisodeCode(last.season, last.episode)}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {entry.items.length} contenus d'affilée · {watchedCount}/
                    {entry.items.length} vus
                  </p>
                  <button
                    onClick={() => openBlockModal(entry.id)}
                    className="mt-2 text-xs font-medium text-cyan-300 transition-colors hover:text-cyan-200"
                  >
                    Voir le détail ↗
                  </button>
                </div>
              </li>
            );
          }

          // ---------- CONTENU INDIVIDUEL ----------
          if (entry.kind === "item") {
            return (
              <li
                key={entry.content.id}
                className="relative pl-10 md:w-56 md:shrink-0 md:pl-0 md:pt-8"
              >
                <span
                  className={`absolute left-4 top-5 h-3.5 w-3.5 -translate-x-1/2 rounded-full border-2 bg-slate-950 md:left-1/2 md:top-4 md:-translate-y-[45%] ${
                    entry.isForced
                      ? "border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.7)]"
                      : MEDIA_CONFIG[entry.content.type].node
                  }`}
                />
                <ContentCard
                  content={entry.content}
                  position={entry.position}
                  isWatched={watched.has(entry.content.id)}
                  onToggleWatched={onToggleWatched}
                  isForced={entry.isForced}
                  onUnpin={onUnforceVisible}
                />
              </li>
            );
          }

          // ---------- GAP : petit point = contenu masqué ici ----------
          return (
            <li
              key={`gap-${i}`}
              className="relative h-6 pl-10 md:h-auto md:w-10 md:shrink-0 md:pl-0 md:pt-8"
            >
              <button
                onClick={(e) => {
                  if (openGap?.index === i) {
                    setOpenGap(null);
                    return;
                  }
                  const rect = e.currentTarget.getBoundingClientRect();
                  setOpenGap({
                    index: i,
                    x: rect.left + rect.width / 2,
                    y: rect.bottom,
                  });
                }}
                aria-label={`${entry.hidden.length} contenu(s) masqué(s) ici`}
                title="Du contenu existe ici"
                className="absolute left-4 top-3 -translate-x-1/2 md:left-1/2 md:top-4 md:-translate-y-[45%]"
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-60" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]" />
                </span>
              </button>

              {openGap?.index === i && (
                <div
                  style={{
                    left: Math.min(
                      Math.max(openGap.x, 136),
                      window.innerWidth - 136
                    ),
                    top: openGap.y + 10,
                  }}
                  className="fixed z-50 w-64 -translate-x-1/2 rounded-xl border border-cyan-500/30 bg-slate-900/95 p-3 shadow-[0_0_25px_rgba(34,211,238,0.15)] backdrop-blur"
                >
                  <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-amber-400">
                    Contenu disponible ici
                  </p>
                  <ul className="space-y-2">
                    {entry.hidden.map((c) => (
                      <li key={c.id} className="text-sm text-slate-200">
                        <p className="font-medium">{c.title}</p>
                        <p className="flex items-center gap-2 text-xs text-slate-400">
                          {c.year}
                          <span
                            className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${MEDIA_CONFIG[c.type].badge}`}
                          >
                            {MEDIA_CONFIG[c.type].icon} {MEDIA_CONFIG[c.type].label}
                          </span>
                        </p>
                        <label className="mt-1 flex cursor-pointer items-center gap-2 text-xs text-slate-300">
                          <input
                            type="checkbox"
                            checked={false}
                            onChange={() => {
                              onForceVisible(c.id);
                              setOpenGap(null);
                            }}
                            className="accent-cyan-400"
                          />
                          Afficher dans la timeline
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {/* ================= MODALE DE BLOC =================
          Overlay plein écran + panneau centré. Cliquer sur le fond
          ferme ; cliquer DANS le panneau ne ferme pas (stopPropagation
          bloque la "remontée" du clic vers l'overlay). Échap ferme. */}
      {openBlockEntry && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
          onClick={() => setOpenBlock(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-4 shadow-[0_0_40px_rgba(34,211,238,0.15)]"
          >
            {(() => {
              const first = openBlockEntry.items[0].content;
              const last =
                openBlockEntry.items[openBlockEntry.items.length - 1].content;
              const color = first.seriesColor ?? "#22d3ee";

              return (
                <>
                  {/* En-tête de la modale */}
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <p
                        className="text-[10px] font-semibold uppercase tracking-wider"
                        style={{ color }}
                      >
                        {first.series}
                      </p>
                      <p className="font-bold text-slate-100">
                        {formatEpisodeCode(first.season, first.episode)}
                        <span className="mx-1 text-slate-500">→</span>
                        {formatEpisodeCode(last.season, last.episode)}
                      </p>
                    </div>
                    <button
                      onClick={() => setOpenBlock(null)}
                      aria-label="Fermer"
                      className="rounded-full border border-slate-700 px-2.5 py-1 text-sm text-slate-400 transition-colors hover:border-slate-500 hover:text-slate-200"
                    >
                      ✕
                    </button>
                  </div>

                  {/* ACCORDÉON DES SAISONS */}
                  <div className="space-y-2">
                    {groupBySeason(openBlockEntry.items).map(
                      ([season, eps]) => {
                        const ids = eps.map((e) => e.content.id);
                        const allWatched = ids.every((id) => watched.has(id));
                        const seasonWatched = ids.filter((id) =>
                          watched.has(id)
                        ).length;
                        const isOpen = expandedSeasons.has(season);

                        return (
                          <div
                            key={season}
                            className="rounded-xl border border-slate-700/60 bg-slate-950/50"
                          >
                            <div className="flex items-center gap-2 p-2.5">
                              {/* Déplier/replier LA SAISON */}
                              <button
                                onClick={() => toggleSeason(season)}
                                className="flex min-w-0 flex-1 items-center gap-2 text-left"
                              >
                                <span
                                  className={`text-xs text-slate-500 transition-transform ${
                                    isOpen ? "rotate-90" : ""
                                  }`}
                                >
                                  ▶
                                </span>
                                <span
                                  className="text-sm font-bold"
                                  style={{ color }}
                                >
                                  Saison {season}
                                </span>
                                <span className="text-xs text-slate-500">
                                  {seasonWatched}/{ids.length} vus
                                </span>
                              </button>
                              {/* Cocher TOUTE la saison d'un clic */}
                              <button
                                onClick={() => onToggleMany(ids, !allWatched)}
                                className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium transition-colors ${
                                  allWatched
                                    ? "border-emerald-400/50 text-emerald-300 hover:bg-emerald-400/10"
                                    : "border-slate-600 text-slate-400 hover:border-slate-400 hover:text-slate-200"
                                }`}
                              >
                                {allWatched ? "Tout décocher" : "Tout vu ✓"}
                              </button>
                            </div>

                            {/* LES ÉPISODES de la saison (si dépliée) */}
                            {isOpen && (
                              <ul className="space-y-1 px-2.5 pb-2.5">
                                {eps.map((e) => {
                                  const isWatched = watched.has(e.content.id);
                                  return (
                                    <li
                                      key={e.content.id}
                                      className="flex items-center gap-2"
                                    >
                                      <button
                                        onClick={() =>
                                          onToggleWatched(e.content.id)
                                        }
                                        aria-label={
                                          isWatched
                                            ? "Marquer comme non vu"
                                            : "Marquer comme vu"
                                        }
                                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] transition-colors ${
                                          isWatched
                                            ? "border-emerald-400 bg-emerald-400/15 text-emerald-300"
                                            : "border-slate-600 text-transparent hover:border-cyan-400"
                                        }`}
                                      >
                                        ✓
                                      </button>
                                      <Link
                                        to={`/content/${e.content.id}`}
                                        className={`min-w-0 flex-1 truncate text-xs transition-colors hover:text-white ${
                                          isWatched
                                            ? "text-slate-500 line-through"
                                            : "text-slate-300"
                                        }`}
                                      >
                                        {e.content.episode !== undefined && (
                                          <span
                                            className="mr-1 font-bold"
                                            style={{ color }}
                                          >
                                            E
                                            {String(e.content.episode).padStart(
                                              2,
                                              "0"
                                            )}
                                          </span>
                                        )}
                                        {e.content.title}
                                      </Link>
                                    </li>
                                  );
                                })}
                              </ul>
                            )}
                          </div>
                        );
                      }
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
