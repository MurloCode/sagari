// ---------------------------------------------------------------
// PAGE D'ACCUEIL — désormais une vraie "landing" :
//  1. HERO : la promesse du site en une phrase + démo animée
//  2. COMMENT ÇA MARCHE : 3 étapes
//  3. LES SAGAS : le contenu réel
// Objectif : que le concept se comprenne en 5 secondes sans lire.
// ---------------------------------------------------------------
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchSagas } from "../api/fakeApi";
import { DemoTimeline } from "../components/DemoTimeline";
import type { Saga } from "../types";

// Données statiques de présentation : PAS besoin de state pour ça.
// Un simple tableau hors du composant (jamais recréé à chaque rendu).
const STEPS = [
  {
    icon: "🌌",
    title: "Choisis ton univers",
    text: "Star Wars, Terre du Milieu… films, séries et livres réunis au même endroit.",
  },
  {
    icon: "🔀",
    title: "Choisis ton ordre",
    text: "Parution, chronologie de l'histoire ou ordre conseillé : à toi de voir.",
  },
  {
    icon: "✓",
    title: "Suis ta progression",
    text: "Coche ce que tu as vu, découvre les contenus cachés entre deux épisodes.",
  },
];

export function HomePage() {
  const [sagas, setSagas] = useState<Saga[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSagas()
      .then(setSagas)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-3xl p-4">
      {/* ---------- 1. HERO ---------- */}
      <section className="pt-10 text-center">
        <h1 className="text-3xl font-black leading-tight sm:text-4xl">
          Dans quel ordre regarder{" "}
          <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-fuchsia-400 bg-clip-text text-transparent">
            ta saga
          </span>
          &nbsp;?
        </h1>
        <p className="mx-auto mt-3 max-w-md text-slate-400">
          Sagari trace la ligne de vie de tes univers préférés — films,
          séries, livres — et te guide dans le bon ordre, sans rien rater.
        </p>

        <DemoTimeline />

        {/* CTA : ancre HTML classique vers la section des sagas */}
        <a
          href="#sagas"
          className="inline-block rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 px-6 py-2.5 font-semibold text-white shadow-[0_0_18px_rgba(99,102,241,0.5)] transition-transform hover:scale-105"
        >
          Explorer les univers
        </a>
      </section>

      {/* ---------- 2. COMMENT ÇA MARCHE ---------- */}
      <section className="mt-14">
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <li
              key={step.title}
              className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-center backdrop-blur"
            >
              <span className="text-2xl">{step.icon}</span>
              <p className="mt-2 text-sm font-semibold text-slate-100">
                <span className="mr-1 text-cyan-400">{i + 1}.</span>
                {step.title}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                {step.text}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- 3. LES SAGAS ---------- */}
      {/* id="sagas" : la cible de l'ancre du bouton CTA. scroll-mt
          compense le header sticky pour ne pas atterrir dessous. */}
      <section id="sagas" className="mt-14 scroll-mt-20 pb-10">
        <h2 className="mb-4 text-xl font-bold text-slate-100">
          Choisis ton univers
        </h2>
        {isLoading ? (
          <p className="text-slate-400">Chargement…</p>
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {sagas.map((saga) => (
              <li key={saga.id}>
                <Link
                  to={`/saga/${saga.id}`}
                  className="block rounded-xl border border-slate-700/60 border-l-4 bg-slate-900/70 p-4 backdrop-blur transition-all hover:border-cyan-400/40 hover:shadow-[0_0_18px_rgba(34,211,238,0.12)]"
                  style={{ borderLeftColor: saga.color }}
                >
                  <p className="font-bold text-slate-100">{saga.name}</p>
                  <p className="mt-1 text-sm text-slate-400">
                    {saga.description}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
