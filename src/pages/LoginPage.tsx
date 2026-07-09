// ---------------------------------------------------------------
// PAGE DE CONNEXION — le pattern "FORMULAIRE CONTRÔLÉ" :
// chaque input a sa valeur dans un state React (value + onChange).
// React est la source de vérité, pas le DOM — indispensable pour
// valider, désactiver le bouton, afficher des erreurs, etc.
// ---------------------------------------------------------------
import { useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // D'où venait l'utilisateur ? (transmis par navigate(..., { state }))
  // Après connexion, on le renvoie là-bas plutôt qu'à l'accueil.
  const from = (location.state as { from?: string } | null)?.from ?? "/";

  async function handleSubmit(e: FormEvent) {
    // Sans ça, le navigateur SOUMET le formulaire à l'ancienne
    // (rechargement complet de la page) — l'ennemi d'une SPA.
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      // err est de type unknown : on vérifie avant d'utiliser .message
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm p-4 pt-10">
      <h2 className="mb-1 text-xl font-bold text-slate-100">Connexion</h2>
      <p className="mb-6 text-sm text-slate-400">
        Suis ta progression et crée tes chronologies personnalisées.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm text-slate-300">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-slate-100 outline-none backdrop-blur transition-colors focus:border-cyan-400/60 focus:shadow-[0_0_12px_rgba(34,211,238,0.2)]"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-slate-300">Mot de passe</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-slate-100 outline-none backdrop-blur transition-colors focus:border-cyan-400/60 focus:shadow-[0_0_12px_rgba(34,211,238,0.2)]"
          />
        </label>

        {/* Affichage conditionnel de l'erreur renvoyée par login() */}
        {error && (
          <p className="rounded-lg border border-red-500/40 bg-red-500/10 p-2 text-sm text-red-300">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-500 py-2 font-semibold text-white shadow-[0_0_14px_rgba(99,102,241,0.4)] transition-opacity disabled:opacity-50"
        >
          {isSubmitting ? "Connexion…" : "Se connecter"}
        </button>
      </form>

      <p className="mt-4 text-xs text-slate-500">
        Démo : n'importe quel email + mot de passe de 4 caractères minimum.
      </p>
    </div>
  );
}
