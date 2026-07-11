// ---------------------------------------------------------------
// HOOK PERSONNALISÉ — la checklist de visionnage, PAR UTILISATEUR.
// Backé par la table watched_items (Supabase) : chacun ne voit/modifie
// que ses propres lignes (RLS, cf. supabase/schema.sql). userId = null
// (invité) → hook inactif.
// ---------------------------------------------------------------
import { useEffect, useState } from "react";
import { supabase } from "../api/supabaseClient";

export function useWatched(userId: string | null) {
  const [watched, setWatched] = useState<Set<string>>(new Set());

  // Recharge la progression quand l'utilisateur change (login/logout).
  useEffect(() => {
    if (!userId) {
      setWatched(new Set());
      return;
    }
    let cancelled = false;
    supabase
      .from("watched_items")
      .select("content_id")
      .eq("user_id", userId)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.warn("Impossible de charger la progression :", error);
          return;
        }
        setWatched(new Set(data.map((row) => row.content_id)));
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  // NOTE : mise à jour OPTIMISTE — le state React change avant que la
  // requête réseau ne réponde (UI instantanée). Si la requête échoue,
  // on prévient juste en console (comme le repli TMDb) : pas d'erreur
  // bloquante pour une checklist, mais la coche pourrait "revenir en
  // arrière" au prochain rechargement.
  function toggleWatched(id: string) {
    if (!userId) return;

    // Immutabilité : copie du Set, jamais de modification directe
    const next = new Set(watched);
    if (next.has(id)) {
      next.delete(id);
      setWatched(next);
      supabase
        .from("watched_items")
        .delete()
        .eq("user_id", userId)
        .eq("content_id", id)
        .then(({ error }) => {
          if (error) console.warn("Impossible de décocher :", error);
        });
    } else {
      next.add(id);
      setWatched(next);
      supabase
        .from("watched_items")
        .upsert({ user_id: userId, content_id: id })
        .then(({ error }) => {
          if (error) console.warn("Impossible de cocher :", error);
        });
    }
  }

  /** Coche ou décoche PLUSIEURS contenus d'un coup (ex: toute une
   *  saison depuis un bloc déplié). Même logique d'immutabilité. */
  function setWatchedMany(ids: string[], value: boolean) {
    if (!userId) return;
    const next = new Set(watched);
    for (const id of ids) {
      if (value) {
        next.add(id);
      } else {
        next.delete(id);
      }
    }
    setWatched(next);

    if (value) {
      supabase
        .from("watched_items")
        .upsert(ids.map((id) => ({ user_id: userId, content_id: id })))
        .then(({ error }) => {
          if (error) console.warn("Impossible de cocher la saison :", error);
        });
    } else {
      supabase
        .from("watched_items")
        .delete()
        .eq("user_id", userId)
        .in("content_id", ids)
        .then(({ error }) => {
          if (error) console.warn("Impossible de décocher la saison :", error);
        });
    }
  }

  return { watched, toggleWatched, setWatchedMany };
}
