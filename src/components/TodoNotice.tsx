// ---------------------------------------------------------------
// Encart visuellement distinct pour signaler une information légale
// PAS ENCORE fournie (statut juridique, hébergeur, contact...). Sert
// dans MentionsLegalesPage/ConfidentialitePage : mieux vaut un manque
// visible qu'une donnée inventée qui aurait l'air d'être vraie.
// ---------------------------------------------------------------
import type { ReactNode } from "react";

export function TodoNotice({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-lg border border-amber-400/40 bg-amber-400/10 p-3 text-sm text-amber-200">
      <strong>À compléter :</strong> {children}
    </p>
  );
}
