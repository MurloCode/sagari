// ---------------------------------------------------------------
// FICHE CONTENU — met en pratique le chargement à 2 niveaux (doc §7.1) :
//  - NIVEAU 1 (titre, année) : affiché dès que possible
//  - NIVEAU 2 (jaquette, synopsis, note) : arrive plus tard, et si ça
//    échoue → contenu de repli, jamais d'écran d'erreur bloquant (§7.2)
// ---------------------------------------------------------------
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { fetchContentDetails, fetchContentSummary } from "../api/fakeApi";
import { useAuth } from "../auth/AuthContext";
import { useWatched } from "../hooks/useWatched";
import { MEDIA_CONFIG } from "../mediaConfig";
import type { ContentDetails, ContentSummary } from "../types";

export function DetailPage() {
  // useParams lit le ":id" de l'URL définie dans App.tsx (/content/:id)
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // Même hook que la timeline → même donnée, toujours synchronisée
  const { watched, toggleWatched } = useWatched(user?.id ?? null);

  const [summary, setSummary] = useState<ContentSummary | null>(null);
  // 3 états possibles pour le niveau 2 : en chargement / reçu / échoué.
  const [details, setDetails] = useState<ContentDetails | null>(null);
  const [detailsFailed, setDetailsFailed] = useState(false);

  useEffect(() => {
    if (!id) return;

    // Les DEUX requêtes partent EN PARALLÈLE (pas de await entre elles).
    // Le niveau 1 arrive vite → affiché tout de suite.
    fetchContentSummary(id).then(setSummary);

    // Le niveau 2 arrive quand il arrive ; en cas d'échec on active le repli.
    fetchContentDetails(id)
      .then(setDetails)
      .catch(() => setDetailsFailed(true));
  }, [id]); // si l'id change, on recharge

  if (!summary) {
    return <p className="p-4 text-slate-400">Chargement…</p>;
  }

  const isWatched = watched.has(summary.id);

  function handleToggleWatched() {
    if (!user) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    if (summary) toggleWatched(summary.id);
  }

  return (
    <div className="mx-auto max-w-xl p-4">
      {/* Retour vers la saga du contenu (grâce à sagaId, notre "clé étrangère") */}
      <Link
        to={`/saga/${summary.sagaId}`}
        className="text-sm text-indigo-400 hover:underline"
      >
        ← Retour à la timeline
      </Link>

      {/* ---- NIVEAU 1 : disponible immédiatement ---- */}
      {summary.series && (
        <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          {summary.series}
          {summary.season !== undefined && (
            <span className="text-cyan-400/80">
              {" · "}
              {summary.episode !== undefined
                ? `Saison ${summary.season} · Épisode ${summary.episode}`
                : `Saison ${summary.season}`}
            </span>
          )}
        </p>
      )}
      <h2 className={`text-2xl font-bold text-slate-100 ${summary.series ? "mt-1" : "mt-3"}`}>
        {summary.title}
      </h2>
      <p className="mb-3 flex items-center gap-2 text-slate-400">
        {summary.year}
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${MEDIA_CONFIG[summary.type].badge}`}
        >
          {MEDIA_CONFIG[summary.type].icon} {MEDIA_CONFIG[summary.type].label}
        </span>
      </p>

      {/* Cocher "vu" DEPUIS la fiche : l'utilisateur lit le synopsis,
          se souvient, valide sur place — sans retourner à la timeline. */}
      <button
        onClick={handleToggleWatched}
        className={`mb-4 rounded-full border px-4 py-1.5 text-sm font-medium transition-all ${
          isWatched
            ? "border-emerald-400 bg-emerald-400/15 text-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.3)]"
            : "border-slate-600 text-slate-300 hover:border-cyan-400 hover:text-cyan-300"
        }`}
      >
        {isWatched ? "✓ Vu" : "Marquer comme vu"}
      </button>

      {/* ---- Jaquette : vraie image TMDb si dispo, sinon bloc coloré ---- */}
      {details?.posterUrl ? (
        <img
          src={details.posterUrl}
          alt={`Visuel de ${summary.title}`}
          // loading="lazy" : le navigateur ne télécharge l'image que
          // quand elle approche de l'écran (doc §7.3, lazy loading)
          loading="lazy"
          className="mb-4 max-h-96 w-full rounded-xl object-cover"
        />
      ) : (
        <div
          className={`mb-4 flex aspect-video items-center justify-center rounded-xl text-4xl font-black text-white/70 ${
            details ? "" : "animate-pulse bg-slate-800"
          }`}
          style={details ? { backgroundColor: details.posterColor } : undefined}
        >
          {summary.title.charAt(0)}
        </div>
      )}

      {/* ---- NIVEAU 2 : 3 rendus selon l'état ---- */}
      {details ? (
        <>
          {/* rating peut être null (fiche non enrichie) → pas de note affichée */}
          {details.rating !== null && (
            <p className="mb-2 font-semibold text-amber-400">
              ★ {details.rating} / 10
            </p>
          )}
          <p className="mb-4 leading-relaxed text-slate-300">
            {details.synopsis}
          </p>
          {details.platforms.length > 0 && (
            <p className="text-sm text-slate-400">
              Disponible sur : {details.platforms.join(", ")}
            </p>
          )}
        </>
      ) : detailsFailed ? (
        // CONTENU DE REPLI (§7.2) : l'app reste utilisable
        <p className="rounded-lg bg-slate-800 p-3 text-sm text-slate-400">
          Détails momentanément indisponibles. Réessaie un peu plus tard.
        </p>
      ) : (
        // SKELETON : des blocs animés en attendant les données
        <div className="animate-pulse space-y-2">
          <div className="h-4 w-24 rounded bg-slate-800" />
          <div className="h-4 w-full rounded bg-slate-800" />
          <div className="h-4 w-3/4 rounded bg-slate-800" />
        </div>
      )}
    </div>
  );
}
