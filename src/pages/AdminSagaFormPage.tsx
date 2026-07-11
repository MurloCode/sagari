// ---------------------------------------------------------------
// ADMIN — création OU édition d'une saga (le même composant gère les
// deux : pas de :sagaId dans l'URL → création). En édition seulement,
// affiche aussi la liste (dense, filtrable) des contenus de la saga —
// une saga n'a pas de contenus tant qu'elle n'existe pas encore.
// ---------------------------------------------------------------
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  fetchSaga,
  fetchSagaSummaries,
  createSaga,
  updateSaga,
  deleteSaga,
  deleteContent,
} from "../api/fakeApi";
import { MEDIA_CONFIG } from "../mediaConfig";
import { formatEpisodeCode } from "../utils/format";
import { slugify } from "../utils/slugify";
import type { ContentSummary, SortMode } from "../types";

const SORT_LABELS: Record<SortMode, string> = {
  recommended: "Conseillé",
  chronological: "Histoire",
  release: "Parution",
};

const inputClass =
  "w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-slate-100 outline-none backdrop-blur transition-colors focus:border-cyan-400/60 focus:shadow-[0_0_12px_rgba(34,211,238,0.2)]";

export function AdminSagaFormPage() {
  const { sagaId } = useParams<{ sagaId: string }>();
  const isEditing = sagaId !== undefined;
  const navigate = useNavigate();

  const [id, setId] = useState("");
  const [idTouched, setIdTouched] = useState(false); // l'utilisateur a-t-il édité l'id lui-même ?
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#60a5fa");
  const [defaultSort, setDefaultSort] = useState<SortMode | null>(null);

  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [contents, setContents] = useState<ContentSummary[]>([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    if (!isEditing) return;
    Promise.all([fetchSaga(sagaId), fetchSagaSummaries(sagaId)])
      .then(([saga, summaries]) => {
        if (saga) {
          setId(saga.id);
          setName(saga.name);
          setDescription(saga.description);
          setColor(saga.color);
          setDefaultSort(saga.defaultSort ?? null);
        }
        setContents(summaries);
      })
      .finally(() => setIsLoading(false));
  }, [isEditing, sagaId]);

  // Suggestion d'id à partir du nom, tant que l'utilisateur n'a pas
  // édité le champ id lui-même (création uniquement).
  function handleNameChange(value: string) {
    setName(value);
    if (!isEditing && !idTouched) setId(slugify(value));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      if (isEditing) {
        await updateSaga(sagaId, { name, description, color, defaultSort });
      } else {
        await createSaga({ id, name, description, color, defaultSort });
        navigate(`/admin/sagas/${id}`, { replace: true });
        return;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteSaga() {
    if (!isEditing) return;
    const ok = window.confirm(
      `Supprimer "${name}" ? Ses ${contents.length} contenus et la progression des utilisateurs dessus seront aussi supprimés. Irréversible.`
    );
    if (!ok) return;
    await deleteSaga(sagaId);
    navigate("/admin", { replace: true });
  }

  async function handleDeleteContent(contentId: string, title: string) {
    const ok = window.confirm(`Supprimer "${title}" ? Irréversible.`);
    if (!ok) return;
    await deleteContent(contentId);
    setContents((prev) => prev.filter((c) => c.id !== contentId));
  }

  const filteredContents = useMemo(() => {
    const needle = filter.trim().toLowerCase();
    if (!needle) return contents;
    return contents.filter((c) => c.title.toLowerCase().includes(needle));
  }, [contents, filter]);

  if (isLoading) {
    return <p className="p-4 text-slate-400">Chargement…</p>;
  }

  return (
    <div className="mx-auto max-w-2xl p-4">
      <Link to="/admin" className="mb-4 inline-block text-sm text-cyan-300 hover:text-cyan-200">
        ← Toutes les sagas
      </Link>
      <h1 className="mb-4 text-xl font-bold text-slate-100">
        {isEditing ? `Modifier "${name}"` : "Nouvelle saga"}
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
          <span className="mb-1 block text-sm text-slate-300">Nom</span>
          <input
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            required
            className={inputClass}
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-slate-300">Description</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={2}
            className={inputClass}
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-slate-300">Couleur d'accent</span>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-10 w-14 shrink-0 rounded-lg border border-slate-700 bg-slate-900/70"
            />
            <input
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className={inputClass}
            />
          </div>
        </label>

        <div>
          <span className="mb-1 block text-sm text-slate-300">Tri par défaut</span>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Tri par défaut">
            <button
              type="button"
              role="radio"
              aria-checked={defaultSort === null}
              onClick={() => setDefaultSort(null)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
                defaultSort === null
                  ? "bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-[0_0_14px_rgba(99,102,241,0.5)]"
                  : "bg-slate-800/70 text-slate-300 ring-1 ring-slate-700/60 hover:bg-slate-700/70"
              }`}
            >
              Aucun (parution)
            </button>
            {(Object.keys(SORT_LABELS) as SortMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                role="radio"
                aria-checked={defaultSort === mode}
                onClick={() => setDefaultSort(mode)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
                  defaultSort === mode
                    ? "bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-[0_0_14px_rgba(99,102,241,0.5)]"
                    : "bg-slate-800/70 text-slate-300 ring-1 ring-slate-700/60 hover:bg-slate-700/70"
                }`}
              >
                {SORT_LABELS[mode]}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="rounded-lg border border-red-500/40 bg-red-500/10 p-2 text-sm text-red-300">
            {error}
          </p>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-500 px-4 py-2 font-semibold text-white shadow-[0_0_14px_rgba(99,102,241,0.4)] transition-opacity disabled:opacity-50"
          >
            {isSubmitting ? "Enregistrement…" : "Enregistrer"}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={handleDeleteSaga}
              className="rounded-full border border-red-500/40 px-3 py-1 text-sm text-red-300 hover:bg-red-500/10"
            >
              Supprimer la saga
            </button>
          )}
        </div>
      </form>

      {isEditing && (
        <div className="mt-10">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-100">
              Contenus ({contents.length})
            </h2>
            <Link
              to={`/admin/sagas/${sagaId}/contents/new`}
              className="rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-500 px-3 py-1.5 text-sm font-semibold text-white shadow-[0_0_14px_rgba(99,102,241,0.4)] transition-opacity hover:opacity-90"
            >
              + Nouveau contenu
            </Link>
          </div>

          {contents.length > 8 && (
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filtrer par titre…"
              className={`${inputClass} mb-3`}
            />
          )}

          <ul className="space-y-1">
            {filteredContents.map((content) => (
              <li
                key={content.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-slate-700/60 bg-slate-900/50 px-3 py-2 text-sm"
              >
                <div className="min-w-0 flex-1">
                  {content.series && (
                    <p
                      className="truncate text-[10px] font-semibold uppercase tracking-wider"
                      style={{ color: content.seriesColor ?? "#64748b" }}
                    >
                      {content.series} {formatEpisodeCode(content.season, content.episode)}
                    </p>
                  )}
                  <p className="truncate text-slate-100">{content.title}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${MEDIA_CONFIG[content.type].badge}`}
                >
                  {MEDIA_CONFIG[content.type].icon}
                </span>
                <Link
                  to={`/admin/contents/${content.id}`}
                  className="shrink-0 text-cyan-300 hover:text-cyan-200"
                >
                  Modifier
                </Link>
                <button
                  onClick={() => handleDeleteContent(content.id, content.title)}
                  className="shrink-0 text-red-300 hover:text-red-200"
                >
                  Suppr.
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
