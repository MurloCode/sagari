// Header commun. Il lit l'utilisateur via useAuth() — c'est tout
// l'intérêt du Context : aucun composant ne lui passe de props.
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-800/60 bg-slate-950/70 p-4 backdrop-blur">
      <Link
        to="/"
        className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-fuchsia-400 bg-clip-text text-lg font-black tracking-[0.2em] text-transparent"
      >
        SAGARI
      </Link>

      {user ? (
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-300">
            {/* Avatar minimaliste : l'initiale du pseudo */}
            <span className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 text-xs font-bold text-white">
              {user.name.charAt(0).toUpperCase()}
            </span>
            {user.name}
          </span>
          <button
            onClick={logout}
            className="rounded-full border border-slate-700 px-3 py-1 text-sm text-slate-400 transition-colors hover:border-slate-500 hover:text-slate-200"
          >
            Déconnexion
          </button>
        </div>
      ) : (
        <Link
          to="/login"
          className="rounded-full border border-cyan-400/40 px-3 py-1 text-sm text-cyan-300 transition-all hover:bg-cyan-400/10 hover:shadow-[0_0_10px_rgba(34,211,238,0.25)]"
        >
          Se connecter
        </Link>
      )}
    </header>
  );
}
