// ---------------------------------------------------------------
// DÉMO ANIMÉE de l'accueil — une mini-timeline DÉCORATIVE qui joue
// en boucle le scénario du produit : les films se cochent, le point
// ambré révèle un roman caché, qui se coche à son tour.
//
// Technique : un state `step` avance tout seul via setInterval dans
// un useEffect (avec nettoyage !). Chaque élément compare `step` à
// son seuil pour savoir dans quel état s'afficher. Les transitions
// CSS (transition-all) font la fluidité — React ne fait que changer
// les classes.
// ---------------------------------------------------------------
import { useEffect, useState } from "react";

// Le scénario : à quel step chaque événement se produit
const TOTAL_STEPS = 7; // 0 = état initial, puis 1..6, et on boucle

interface DemoItem {
  label: string;
  icon: string;
  /** step à partir duquel l'élément est coché */
  checkedAt: number;
  /** roman caché : n'apparaît qu'à partir de ce step (avant = point ambré) */
  revealedAt?: number;
}

const ITEMS: DemoItem[] = [
  { label: "Film I", icon: "🎬", checkedAt: 1 },
  { label: "Film II", icon: "🎬", checkedAt: 2 },
  { label: "Roman", icon: "📖", checkedAt: 5, revealedAt: 3 },
  { label: "Film III", icon: "🎬", checkedAt: 6 },
];

export function DemoTimeline() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    // % TOTAL_STEPS : arrivé au bout, on repart à 0 → boucle infinie
    const timer = setInterval(() => {
      setStep((s) => (s + 1) % TOTAL_STEPS);
    }, 1100);
    return () => clearInterval(timer); // nettoyage, toujours !
  }, []);

  return (
    // aria-hidden : purement décoratif, invisible pour les lecteurs d'écran
    <div aria-hidden className="relative mx-auto max-w-md px-4 py-6">
      {/* La ligne de vie */}
      <div className="absolute left-4 right-4 top-1/2 h-0.5 -translate-y-6 bg-gradient-to-r from-cyan-500/70 via-indigo-500/70 to-fuchsia-500/70" />

      <div className="relative flex items-start justify-between">
        {ITEMS.map((item) => {
          const isChecked = step >= item.checkedAt;
          const isRevealed =
            item.revealedAt === undefined || step >= item.revealedAt;

          // Le roman avant sa révélation : juste un point ambré qui pulse
          if (!isRevealed) {
            return (
              <div key={item.label} className="flex w-14 justify-center pt-1">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute h-full w-full animate-ping rounded-full bg-amber-400 opacity-60" />
                  <span className="relative h-2.5 w-2.5 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]" />
                </span>
              </div>
            );
          }

          return (
            <div
              key={item.label}
              className="flex w-14 flex-col items-center gap-2"
            >
              {/* Le nœud : cyan → émeraude + ✓ une fois "vu" */}
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full border-2 bg-slate-950 text-xs transition-all duration-500 ${
                  isChecked
                    ? "border-emerald-400 text-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.7)]"
                    : "border-cyan-400 text-transparent shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                }`}
              >
                ✓
              </span>
              <span className="text-center text-[10px] leading-tight text-slate-400">
                {item.icon}
                <br />
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
