// ---------------------------------------------------------------
// PAGE SAGA — la timeline d'une saga.
// C'est le composant "intelligent" : il détient tous les states et
// distribue aux composants "bêtes" (filtres, timeline, cartes).
//
// Le concept clé ici : presque tout est DÉRIVÉ. On ne stocke que
// 4 choses (contenus bruts, tri, types visibles, exceptions), tout
// le reste — liste triée, entrées de timeline, gaps — est CALCULÉ
// à chaque rendu. Moins de state = moins de bugs de synchronisation.
// ---------------------------------------------------------------
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { fetchSaga, fetchSagaSummaries } from "../api/fakeApi";
import { useAuth } from "../auth/AuthContext";
import { MediaTypeFilter } from "../components/MediaTypeFilter";
import { SortSelector } from "../components/SortSelector";
import { Timeline } from "../components/Timeline";
import { useWatched } from "../hooks/useWatched";
import type {
  ContentSummary,
  MediaType,
  Saga,
  SortMode,
  TimelineEntry,
} from "../types";

export function SagaPage() {
  const { sagaId } = useParams<{ sagaId: string }>();
  const { user } = useAuth(); // null = invité
  const navigate = useNavigate();
  const location = useLocation();

  const [saga, setSaga] = useState<Saga | null>(null);
  const [contents, setContents] = useState<ContentSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortMode, setSortMode] = useState<SortMode>("release");
  // Types affichés. null = "pas encore initialisé" (on attend les données).
  const [visibleTypes, setVisibleTypes] = useState<Set<MediaType> | null>(null);
  // Exceptions : contenus masqués par le filtre mais affichés quand même
  // (via la checkbox du popover d'un point).
  const [forcedVisible, setForcedVisible] = useState<Set<string>>(new Set());
  // Progression liée au compte : chaque utilisateur a la sienne
  const { watched, toggleWatched, setWatchedMany } = useWatched(
    user?.id ?? null
  );

  // La checklist est réservée aux inscrits : un invité qui clique sur ✓
  // est envoyé vers /login, en mémorisant d'où il vient pour y revenir.
  function requireLogin(): boolean {
    if (!user) {
      navigate("/login", { state: { from: location.pathname } });
      return false;
    }
    return true;
  }

  function handleToggleWatched(id: string) {
    if (requireLogin()) toggleWatched(id);
  }

  function handleToggleMany(ids: string[], value: boolean) {
    if (requireLogin()) setWatchedMany(ids, value);
  }

  useEffect(() => {
    if (!sagaId) return;
    setIsLoading(true);

    // La saga elle-même : son nom, et son éventuel TRI PAR DÉFAUT.
    // Défaut GLOBAL = "conseillé" : la promesse du site, c'est de
    // répondre à "dans quel ordre regarder ?" dès l'arrivée.
    fetchSaga(sagaId).then((s) => {
      setSaga(s);
      setSortMode(s?.defaultSort ?? "recommended");
    });

    fetchSagaSummaries(sagaId)
      .then((data) => {
        setContents(data);
        // Au départ, seul l'AUDIOVISUEL est visible (films, séries,
        // séries animées) : les livres/BD/jeux apparaissent comme des
        // points — le cœur de ton idée !
        setVisibleTypes(new Set(["film", "serie", "serie-animee"]));
        setForcedVisible(new Set());
      })
      .finally(() => setIsLoading(false));
  }, [sagaId]);

  // Types réellement présents dans cette saga (pour ne pas afficher
  // un bouton "Séries" s'il n'y a aucune série).
  const availableTypes = useMemo(
    () => [...new Set(contents.map((c) => c.type))],
    [contents]
  );

  function toggleType(type: MediaType) {
    setVisibleTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
    // Réactiver un type remet les exceptions à zéro (comportement simple et prévisible)
    setForcedVisible(new Set());
  }

  // ---- LE CALCUL CENTRAL : liste triée → entrées de timeline ----
  // On parcourt les contenus triés ; les masqués s'accumulent dans un
  // "buffer", et dès qu'on rencontre un visible, le buffer devient un gap.
  const entries = useMemo<TimelineEntry[]>(() => {
    const sorted = [...contents].sort(
      (a, b) => a.orders[sortMode] - b.orders[sortMode]
    );
    // Un contenu est visible si son type est activé OU s'il est épinglé.
    // "Épinglé" = affiché malgré un type filtré (via la checkbox d'un point).
    const byFilter = (c: ContentSummary) => visibleTypes?.has(c.type) ?? true;
    const isVisible = (c: ContentSummary) =>
      byFilter(c) || forcedVisible.has(c.id);

    const result: TimelineEntry[] = [];
    let hiddenBuffer: ContentSummary[] = [];

    // sorted.entries() donne [index, valeur] : l'index dans la liste
    // TRIÉE (+1) est le numéro à afficher — pas la clé de tri brute.
    for (const [index, content] of sorted.entries()) {
      if (isVisible(content)) {
        if (hiddenBuffer.length > 0) {
          result.push({ kind: "gap", hidden: hiddenBuffer });
          hiddenBuffer = [];
        }
        // isForced = visible uniquement grâce à l'épingle → la carte
        // affichera le badge "épinglé · retirer"
        result.push({
          kind: "item",
          content,
          position: index + 1,
          isForced: !byFilter(content),
        });
      } else {
        hiddenBuffer.push(content);
      }
    }
    // Contenu masqué après le dernier visible → un dernier point
    if (hiddenBuffer.length > 0) {
      result.push({ kind: "gap", hidden: hiddenBuffer });
    }
    return result;
  }, [contents, sortMode, visibleTypes, forcedVisible]);

  const visibleContents = entries
    .filter((e) => e.kind === "item")
    .map((e) => e.content);
  const watchedCount = visibleContents.filter((c) => watched.has(c.id)).length;

  if (isLoading) {
    return <p className="p-4 text-slate-400">Chargement de la saga…</p>;
  }

  return (
    <div className="mx-auto max-w-xl p-4 md:max-w-5xl">
      <Link to="/" className="text-sm text-indigo-400 hover:underline">
        ← Toutes les sagas
      </Link>

      {saga && (
        <h2 className="mt-3 text-2xl font-bold text-slate-100">{saga.name}</h2>
      )}

      {/* Progression : réservée aux connectés. L'invité voit une invitation. */}
      {user ? (
        <>
          <p className="mb-1 mt-3 text-sm text-slate-400">
            {watchedCount} / {visibleContents.length} visionnés
          </p>
          <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-slate-800/80">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 shadow-[0_0_10px_rgba(34,211,238,0.6)] transition-all"
              style={{
                width:
                  visibleContents.length > 0
                    ? `${(watchedCount / visibleContents.length) * 100}%`
                    : "0%",
              }}
            />
          </div>
        </>
      ) : (
        <p className="mb-4 mt-3 rounded-lg border border-indigo-500/30 bg-indigo-500/10 p-2 text-sm text-slate-300">
          <Link
            to="/login"
            state={{ from: location.pathname }}
            className="font-medium text-cyan-300 hover:underline"
          >
            Connecte-toi
          </Link>{" "}
          pour cocher ce que tu as vu et suivre ta progression.
        </p>
      )}

      {/* Les deux barres de contrôle : tri + filtre de types */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SortSelector
          value={sortMode}
          onChange={setSortMode}
          starred={saga?.defaultSort}
        />
        <MediaTypeFilter
          available={availableTypes}
          selected={visibleTypes ?? new Set()}
          onToggle={toggleType}
        />
      </div>

      <Timeline
        entries={entries}
        watched={watched}
        onToggleWatched={handleToggleWatched}
        onToggleMany={handleToggleMany}
        onForceVisible={(id) =>
          setForcedVisible((prev) => new Set(prev).add(id))
        }
        onUnforceVisible={(id) =>
          // Même principe d'immutabilité : copie du Set, puis suppression
          setForcedVisible((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          })
        }
      />
    </div>
  );
}
