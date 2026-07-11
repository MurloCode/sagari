// ---------------------------------------------------------------
// GARDE D'ACCÈS — enveloppe une route qui exige d'être connecté.
// Pas de notion de "rôle admin" séparé pour l'instant (app mono-
// utilisateur) : être connecté suffit pour accéder à /admin.
// ---------------------------------------------------------------
import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Tant que la session n'a pas fini de se restaurer, `user` vaut encore
  // `null` par défaut — rediriger tout de suite enverrait à tort un
  // utilisateur connecté vers /login à chaque rechargement de page.
  if (isLoading) {
    return <p className="p-4 text-slate-400">Chargement…</p>;
  }

  if (!user) {
    // state.from : LoginPage.tsx renvoie ici une fois connecté.
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}
