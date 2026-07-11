// ---------------------------------------------------------------
// ADMIN — accueil : liste des sagas, point d'entrée pour tout gérer
// (créer une saga, modifier une saga existante et ses contenus).
// ---------------------------------------------------------------
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchSagas, fetchContentCounts } from "../api/fakeApi";
import type { Saga } from "../types";

export function AdminHomePage() {
  const [sagas, setSagas] = useState<Saga[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchSagas(), fetchContentCounts()])
      .then(([sagasResult, countsResult]) => {
        setSagas(sagasResult);
        setCounts(countsResult);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-2xl p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-100">Admin — Sagas</h1>
        <Link
          to="/admin/sagas/new"
          className="rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_0_14px_rgba(99,102,241,0.4)] transition-opacity hover:opacity-90"
        >
          + Nouvelle saga
        </Link>
      </div>

      {isLoading ? (
        <p className="text-slate-400">Chargement…</p>
      ) : (
        <ul className="space-y-2">
          {sagas.map((saga) => (
            <li key={saga.id}>
              <Link
                to={`/admin/sagas/${saga.id}`}
                className="flex items-center justify-between rounded-xl border border-l-4 border-slate-700/60 bg-slate-900/70 p-4 backdrop-blur transition-all hover:border-cyan-400/40 hover:shadow-[0_0_18px_rgba(34,211,238,0.12)]"
                style={{ borderLeftColor: saga.color }}
              >
                <div>
                  <p className="font-bold text-slate-100">{saga.name}</p>
                  <p className="mt-1 text-sm text-slate-400">{saga.description}</p>
                </div>
                <span className="shrink-0 rounded-full border border-slate-700 px-2.5 py-1 text-xs text-slate-400">
                  {counts[saga.id] ?? 0} contenus
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
