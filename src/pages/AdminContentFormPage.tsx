// ---------------------------------------------------------------
// ADMIN — création OU édition d'UN contenu (film/épisode/livre...).
// Deux routes mènent ici : /admin/sagas/:sagaId/contents/new (création,
// sagaId connu tout de suite) et /admin/contents/:contentId (édition,
// sagaId découvert après le chargement du contenu).
// ---------------------------------------------------------------
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  fetchSagaSummaries,
  fetchContentForAdmin,
  createContent,
  updateContent,
  type ContentInput,
} from "../api/fakeApi";
import { MEDIA_CONFIG } from "../mediaConfig";
import { SERIES_PALETTE, seriesColorAt } from "../seriesPalette";
import { slugify } from "../utils/slugify";
import type { ContentSummary, MediaType } from "../types";

const MEDIA_TYPES = Object.keys(MEDIA_CONFIG) as MediaType[];

const inputClass =
  "w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-slate-100 outline-none backdrop-blur transition-colors focus:border-cyan-400/60 focus:shadow-[0_0_12px_rgba(34,211,238,0.2)]";

export function AdminContentFormPage() {
  const { sagaId: sagaIdParam, contentId } = useParams<{
    sagaId?: string;
    contentId?: string;
  }>();
  const isEditing = contentId !== undefined;
  const navigate = useNavigate();

  const [sagaId, setSagaId] = useState(sagaIdParam ?? "");
  // Les AUTRES contenus de la même saga — sert à suggérer la couleur de
  // série et l'ordre par défaut, et à peupler l'autocomplétion des séries.
  const [siblings, setSiblings] = useState<ContentSummary[]>([]);

  const [id, setId] = useState("");
  const [idTouched, setIdTouched] = useState(false);
  const [title, setTitle] = useState("");
  const [year, setYear] = useState<number | "">(new Date().getFullYear());
  const [type, setType] = useState<MediaType>("film");
  const [series, setSeries] = useState("");
  const [season, setSeason] = useState<number | "">("");
  const [episode, setEpisode] = useState<number | "">("");
  const [seriesColor, setSeriesColor] = useState<string | null>(null);
  const [seriesColorTouched, setSeriesColorTouched] = useState(false);
  const [orderRelease, setOrderRelease] = useState<number | "">(1);
  const [orderChronological, setOrderChronological] = useState<number | "">(1);
  const [orderRecommended, setOrderRecommended] = useState<number | "">(1);
  const [synopsis, setSynopsis] = useState("");
  const [rating, setRating] = useState<number | "">("");
  const [posterUrl, setPosterUrl] = useState("");
  const [platforms, setPlatforms] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (isEditing) {
        const content = await fetchContentForAdmin(contentId);
        if (!content) {
          setNotFound(true);
          setIsLoading(false);
          return;
        }
        setSagaId(content.sagaId);
        setId(content.id);
        setTitle(content.title);
        setYear(content.year);
        setType(content.type);
        setSeries(content.series ?? "");
        setSeason(content.season ?? "");
        setEpisode(content.episode ?? "");
        setSeriesColor(content.seriesColor);
        setSeriesColorTouched(true); // valeur déjà réelle : ne pas l'écraser par une suggestion
        setOrderRelease(content.orders.release);
        setOrderChronological(content.orders.chronological);
        setOrderRecommended(content.orders.recommended);
        setSynopsis(content.synopsis ?? "");
        setRating(content.rating ?? "");
        setPosterUrl(content.posterUrl ?? "");
        setPlatforms(content.platforms.join(", "));
        const summaries = await fetchSagaSummaries(content.sagaId);
        setSiblings(summaries.filter((s) => s.id !== content.id));
      } else if (sagaIdParam) {
        const summaries = await fetchSagaSummaries(sagaIdParam);
        setSiblings(summaries);
        // Par défaut, un nouveau contenu se place à la SUITE de la saga.
        const maxRelease = summaries.reduce((max, s) => Math.max(max, s.orders.release), 0);
        const maxChronological = summaries.reduce(
          (max, s) => Math.max(max, s.orders.chronological),
          0
        );
        const maxRecommended = summaries.reduce(
          (max, s) => Math.max(max, s.orders.recommended),
          0
        );
        setOrderRelease(maxRelease + 1);
        setOrderChronological(maxChronological + 1);
        setOrderRecommended(maxRecommended + 1);
      }
      setIsLoading(false);
    }
    load();
  }, [isEditing, contentId, sagaIdParam]);

  // Séries déjà utilisées dans cette saga, dans l'ordre de première
  // apparition — pour l'autocomplétion ET la suggestion de couleur.
  const distinctSeries = useMemo(() => {
    const seen = new Set<string>();
    const ordered: string[] = [];
    for (const s of siblings) {
      if (s.series && !seen.has(s.series)) {
        seen.add(s.series);
        ordered.push(s.series);
      }
    }
    return ordered;
  }, [siblings]);

  // Suggestion automatique de couleur de série : la prochaine couleur de
  // la palette non encore utilisée dans CETTE saga — tant que l'utilisateur
  // n'a pas cliqué une pastille lui-même (voir seriesColorTouched).
  useEffect(() => {
    if (seriesColorTouched) return;
    if (!series) {
      setSeriesColor(null);
      return;
    }
    const index = distinctSeries.indexOf(series);
    setSeriesColor(seriesColorAt(index === -1 ? distinctSeries.length : index));
  }, [series, distinctSeries, seriesColorTouched]);

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!isEditing && !idTouched) setId(slugify(value));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (
      year === "" ||
      Number.isNaN(year) ||
      [orderRelease, orderChronological, orderRecommended].some(
        (v) => v === "" || Number.isNaN(v)
      )
    ) {
      setError("Vérifie que l'année et les 3 ordres sont bien des nombres.");
      return;
    }

    setIsSubmitting(true);
    try {
      const input: Omit<ContentInput, "id" | "sagaId"> = {
        title,
        year,
        type,
        series: series || null,
        season: season === "" ? null : season,
        episode: episode === "" ? null : episode,
        seriesColor: series ? seriesColor : null,
        orders: {
          release: orderRelease as number,
          chronological: orderChronological as number,
          recommended: orderRecommended as number,
        },
        synopsis: synopsis || null,
        rating: rating === "" ? null : rating,
        // Pas de champ dédié dans ce formulaire : sert seulement de
        // repli visuel avant chargement d'une image (cf. ContentCard.tsx).
        posterColor: "#334155",
        posterUrl: posterUrl || null,
        platforms: platforms
          .split(",")
          .map((p) => p.trim())
          .filter(Boolean),
      };

      if (isEditing) {
        await updateContent(contentId, input);
      } else {
        await createContent({ id, sagaId, ...input });
      }
      navigate(`/admin/sagas/${sagaId}`, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return <p className="p-4 text-slate-400">Chargement…</p>;
  }
  if (notFound) {
    return <p className="p-4 text-slate-400">Contenu introuvable.</p>;
  }

  return (
    <div className="mx-auto max-w-2xl p-4">
      <Link
        to={`/admin/sagas/${sagaId}`}
        className="mb-4 inline-block text-sm text-cyan-300 hover:text-cyan-200"
      >
        ← Retour à la saga
      </Link>
      <h1 className="mb-4 text-xl font-bold text-slate-100">
        {isEditing ? `Modifier "${title}"` : "Nouveau contenu"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm text-slate-300">Identifiant (id technique)</span>
          <input
            value={id}
            onChange={(e) => {
              setId(e.target.value);
              setIdTouched(true);
            }}
            disabled={isEditing}
            required
            className={`${inputClass} disabled:opacity-50`}
          />
          {!isEditing && (
            <span className="mt-1 block text-xs text-slate-500">
              Non modifiable après création — vérifie-le avant de valider.
            </span>
          )}
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-slate-300">Titre</span>
          <input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            required
            className={inputClass}
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-sm text-slate-300">Année</span>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value === "" ? "" : e.target.valueAsNumber)}
              required
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-slate-300">Type</span>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as MediaType)}
              className={inputClass}
            >
              {MEDIA_TYPES.map((t) => (
                <option key={t} value={t}>
                  {MEDIA_CONFIG[t].icon} {MEDIA_CONFIG[t].label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block">
          <span className="mb-1 block text-sm text-slate-300">
            Série (optionnel — laisse vide pour un contenu autonome)
          </span>
          <input
            list="series-options"
            value={series}
            onChange={(e) => setSeries(e.target.value)}
            className={inputClass}
          />
          <datalist id="series-options">
            {distinctSeries.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </label>

        {series && (
          <div>
            <span className="mb-1 block text-sm text-slate-300">Couleur de la série</span>
            <div className="flex flex-wrap gap-2">
              {SERIES_PALETTE.map((swatch) => (
                <button
                  key={swatch}
                  type="button"
                  aria-label={`Choisir ${swatch}`}
                  aria-pressed={seriesColor === swatch}
                  onClick={() => {
                    setSeriesColor(swatch);
                    setSeriesColorTouched(true);
                  }}
                  className={`h-8 w-8 shrink-0 rounded-full border-2 transition-transform ${
                    seriesColor === swatch
                      ? "scale-110 border-white"
                      : "border-transparent hover:scale-105"
                  }`}
                  style={{ backgroundColor: swatch }}
                />
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-sm text-slate-300">Saison (optionnel)</span>
            <input
              type="number"
              value={season}
              onChange={(e) => setSeason(e.target.value === "" ? "" : e.target.valueAsNumber)}
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-slate-300">Épisode (optionnel)</span>
            <input
              type="number"
              value={episode}
              onChange={(e) => setEpisode(e.target.value === "" ? "" : e.target.valueAsNumber)}
              className={inputClass}
            />
          </label>
        </div>

        <div>
          <span className="mb-1 block text-sm text-slate-300">
            Ordre de tri (nombres décimaux acceptés — ex: 15.5 pour insérer entre 15 et 16)
          </span>
          <div className="grid grid-cols-3 gap-3">
            <label className="block">
              <span className="mb-1 block text-xs text-slate-500">Parution</span>
              <input
                type="number"
                step="any"
                value={orderRelease}
                onChange={(e) =>
                  setOrderRelease(e.target.value === "" ? "" : e.target.valueAsNumber)
                }
                required
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-slate-500">Histoire</span>
              <input
                type="number"
                step="any"
                value={orderChronological}
                onChange={(e) =>
                  setOrderChronological(e.target.value === "" ? "" : e.target.valueAsNumber)
                }
                required
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-slate-500">Conseillé</span>
              <input
                type="number"
                step="any"
                value={orderRecommended}
                onChange={(e) =>
                  setOrderRecommended(e.target.value === "" ? "" : e.target.valueAsNumber)
                }
                required
                className={inputClass}
              />
            </label>
          </div>
        </div>

        <label className="block">
          <span className="mb-1 block text-sm text-slate-300">
            Synopsis (optionnel — sinon TMDb l'enrichit automatiquement si possible)
          </span>
          <textarea
            value={synopsis}
            onChange={(e) => setSynopsis(e.target.value)}
            rows={3}
            className={inputClass}
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-sm text-slate-300">Note /10 (optionnel)</span>
            <input
              type="number"
              min={0}
              max={10}
              step={0.1}
              value={rating}
              onChange={(e) => setRating(e.target.value === "" ? "" : e.target.valueAsNumber)}
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-slate-300">URL affiche (optionnel)</span>
            <input
              value={posterUrl}
              onChange={(e) => setPosterUrl(e.target.value)}
              className={inputClass}
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-1 block text-sm text-slate-300">
            Plateformes (séparées par des virgules)
          </span>
          <input
            value={platforms}
            onChange={(e) => setPlatforms(e.target.value)}
            placeholder="Disney+, Prime Video"
            className={inputClass}
          />
        </label>

        {error && (
          <p className="rounded-lg border border-red-500/40 bg-red-500/10 p-2 text-sm text-red-300">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-500 px-4 py-2 font-semibold text-white shadow-[0_0_14px_rgba(99,102,241,0.4)] transition-opacity disabled:opacity-50"
        >
          {isSubmitting ? "Enregistrement…" : "Enregistrer"}
        </button>
      </form>
    </div>
  );
}
