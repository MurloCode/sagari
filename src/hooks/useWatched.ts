// ---------------------------------------------------------------
// HOOK PERSONNALISÉ — la checklist de visionnage, PAR UTILISATEUR.
// La clé localStorage contient l'id de l'utilisateur : chacun a sa
// progression. userId = null (invité) → hook inactif.
// Avec Supabase, ce fichier échangera localStorage contre des appels
// API — les composants ne changeront pas d'une ligne.
// ---------------------------------------------------------------
import { useEffect, useState } from "react";

export function useWatched(userId: string | null) {
  const storageKey = userId ? `sagari-watched-${userId}` : null;
  const [watched, setWatched] = useState<Set<string>>(new Set());

  // Recharge la progression quand l'utilisateur change (login/logout).
  useEffect(() => {
    if (!storageKey) {
      setWatched(new Set());
      return;
    }
    const saved = localStorage.getItem(storageKey);
    setWatched(saved ? new Set(JSON.parse(saved)) : new Set());
  }, [storageKey]);

  // NOTE : on sauvegarde DANS toggleWatched, plus dans un useEffect.
  // Pourquoi ? Un effet "sauvegarde quand watched change" s'exécuterait
  // aussi au montage, AVANT le chargement — et écraserait la sauvegarde
  // avec un Set vide. Bug subtil et classique des effets.
  function toggleWatched(id: string) {
    if (!storageKey) return; // invité : ne rien faire

    // Immutabilité : copie du Set, jamais de modification directe
    const next = new Set(watched);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setWatched(next);
    localStorage.setItem(storageKey, JSON.stringify([...next]));
  }

  /** Coche ou décoche PLUSIEURS contenus d'un coup (ex: toute une
   *  saison depuis un bloc déplié). Même logique d'immutabilité. */
  function setWatchedMany(ids: string[], value: boolean) {
    if (!storageKey) return;
    const next = new Set(watched);
    for (const id of ids) {
      if (value) {
        next.add(id);
      } else {
        next.delete(id);
      }
    }
    setWatched(next);
    localStorage.setItem(storageKey, JSON.stringify([...next]));
  }

  return { watched, toggleWatched, setWatchedMany };
}
